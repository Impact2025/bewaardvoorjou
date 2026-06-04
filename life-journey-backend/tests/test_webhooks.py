"""Tests for Stripe and Resend webhook handlers."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

import pytest

from app.api.v1.routes.webhooks import (
    _handle_bounce,
    _handle_complaint,
    _handle_payment_succeeded,
    _PACKAGE_SETTINGS,
)


def _utc() -> datetime:
    return datetime.now(timezone.utc)


# ── Lightweight stand-ins (same pattern as test_exporter.py) ─────────────────

@dataclass
class _User:
    id: str = field(default_factory=lambda: str(uuid4()))
    email: str = "test@example.com"
    email_bounced: bool = False
    email_bounced_at: datetime | None = None
    package_tier: str = "NONE"
    package_activated_at: datetime | None = None
    max_family_members: int = 0
    max_chapters: int | None = None
    storage_years: int = 0


@dataclass
class _EmailEvent:
    id: str = field(default_factory=lambda: str(uuid4()))
    user_id: str = field(default_factory=lambda: str(uuid4()))
    resend_id: str | None = None
    status: str = "sent"
    bounced_at: datetime | None = None
    complained_at: datetime | None = None


@dataclass
class _EmailPreference:
    user_id: str = field(default_factory=lambda: str(uuid4()))
    unsubscribed_all: bool = False
    unsubscribed_at: datetime | None = None


@dataclass
class _Order:
    id: str = field(default_factory=lambda: str(uuid4()))
    stripe_payment_intent_id: str | None = None
    user_id: str | None = None
    guest_email: str | None = None
    package_type: str = "BEGIN"
    price_paid: int = 8900
    status: str = "PENDING"
    paid_at: datetime | None = None
    stripe_payment_method: str | None = None
    promo_code_used: str | None = None


class _FakeQuery:
    def __init__(self, data: list):
        self._data = list(data)

    def filter(self, *_):
        return self

    def filter_by(self, **_):
        return self

    def first(self):
        return self._data[0] if self._data else None

    def all(self):
        return self._data


class _FakeDb:
    def __init__(self, users=None, events=None, prefs=None, orders=None):
        self._users = list(users or [])
        self._events = list(events or [])
        self._prefs = list(prefs or [])
        self._orders = list(orders or [])
        self.committed = False
        self._added: list = []

    def query(self, model):
        from app.models.user import User
        from app.models.email import EmailEvent, EmailPreference
        from app.models.order import Order
        mapping = {
            User: self._users,
            EmailEvent: self._events,
            EmailPreference: self._prefs,
            Order: self._orders,
        }
        return _FakeQuery(mapping.get(model, []))

    def add(self, obj):
        self._added.append(obj)
        if isinstance(obj, _EmailPreference) and obj not in self._prefs:
            self._prefs.append(obj)

    def commit(self):
        self.committed = True


# ── _handle_bounce ────────────────────────────────────────────────────────────

def test_handle_bounce_marks_event_as_bounced():
    user = _User()
    event = _EmailEvent(user_id=user.id, resend_id="resend-123", status="sent")

    class _BounceDb(_FakeDb):
        def query(self, model):
            from app.models.email import EmailEvent
            from app.models.user import User
            if model is EmailEvent:
                return _FakeQuery([event])
            if model is User:
                return _FakeQuery([user])
            return _FakeQuery([])

    db = _BounceDb()
    _handle_bounce(db, "resend-123", {})

    assert event.status == "bounced"
    assert event.bounced_at is not None
    assert db.committed


def test_handle_bounce_marks_user_as_bounced():
    user = _User(email_bounced=False)
    event = _EmailEvent(user_id=user.id, resend_id="resend-456")

    class _Db(_FakeDb):
        def query(self, model):
            from app.models.email import EmailEvent
            from app.models.user import User
            if model is EmailEvent:
                return _FakeQuery([event])
            if model is User:
                return _FakeQuery([user])
            return _FakeQuery([])

    _handle_bounce(_Db(), "resend-456", {})
    assert user.email_bounced is True
    assert user.email_bounced_at is not None


def test_handle_bounce_no_op_for_unknown_resend_id():
    class _EmptyDb(_FakeDb):
        def query(self, model):
            return _FakeQuery([])

    db = _EmptyDb()
    _handle_bounce(db, "nonexistent", {})
    assert not db.committed  # nothing committed if event not found


# ── _handle_complaint ─────────────────────────────────────────────────────────

def test_handle_complaint_marks_event_as_complained():
    user = _User()
    event = _EmailEvent(user_id=user.id, resend_id="res-789", status="sent")

    class _Db(_FakeDb):
        def query(self, model):
            from app.models.email import EmailEvent, EmailPreference
            from app.models.user import User
            if model is EmailEvent:
                return _FakeQuery([event])
            if model in (User, EmailPreference):
                return _FakeQuery([])
            return _FakeQuery([])

    db = _Db()
    _handle_complaint(db, "res-789", {})
    assert event.status == "complained"
    assert event.complained_at is not None


def test_handle_complaint_creates_and_unsubscribes_user():
    user = _User()
    event = _EmailEvent(user_id=user.id, resend_id="res-999", status="sent")

    class _Db(_FakeDb):
        def query(self, model):
            from app.models.email import EmailEvent, EmailPreference
            if model is EmailEvent:
                return _FakeQuery([event])
            if model is EmailPreference:
                return _FakeQuery([])  # no existing prefs
            return _FakeQuery([])

    db = _Db()
    _handle_complaint(db, "res-999", {})

    # A new EmailPreference should have been added with unsubscribed_all=True
    new_prefs = [o for o in db._added if hasattr(o, "unsubscribed_all")]
    assert new_prefs, "Expected a new EmailPreference to be created"
    assert new_prefs[0].unsubscribed_all is True


# ── _handle_payment_succeeded ─────────────────────────────────────────────────

def test_handle_payment_succeeded_activates_package():
    user = _User(package_tier="NONE")
    order = _Order(
        stripe_payment_intent_id="pi_test",
        user_id=user.id,
        package_type="ERFGOED",
        status="PENDING",
    )

    class _Db(_FakeDb):
        def query(self, model):
            from app.models.user import User
            from app.models.order import Order
            if model is Order:
                return _FakeQuery([order])
            if model is User:
                return _FakeQuery([user])
            return _FakeQuery([])

    payment_intent = {
        "id": "pi_test",
        "metadata": {"user_id": user.id},
        "payment_method_types": ["ideal"],
    }
    _handle_payment_succeeded(_Db(), payment_intent)

    assert order.status == "PAID"
    assert order.paid_at is not None
    assert user.package_tier == "ERFGOED"
    expected = _PACKAGE_SETTINGS["ERFGOED"]
    assert user.max_family_members == expected["max_family_members"]
    assert user.storage_years == expected["storage_years"]


def test_handle_payment_succeeded_idempotent_for_already_paid():
    order = _Order(stripe_payment_intent_id="pi_dup", status="PAID")

    class _Db(_FakeDb):
        def query(self, model):
            from app.models.order import Order
            if model is Order:
                return _FakeQuery([order])
            return _FakeQuery([])

    original_paid_at = order.paid_at
    _handle_payment_succeeded(_Db(), {"id": "pi_dup", "metadata": {}, "payment_method_types": []})
    # Should skip without re-processing
    assert order.paid_at == original_paid_at


def test_handle_payment_succeeded_no_op_for_missing_order():
    class _EmptyDb(_FakeDb):
        def query(self, model):
            return _FakeQuery([])

    db = _EmptyDb()
    _handle_payment_succeeded(db, {"id": "pi_missing", "metadata": {}, "payment_method_types": []})
    assert not db.committed
