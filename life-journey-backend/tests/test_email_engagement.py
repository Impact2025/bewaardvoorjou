"""Tests for Resend open/click engagement tracking and analytics math."""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from uuid import uuid4

logging.disable(logging.CRITICAL)

from app.api.v1.routes.webhooks import (
    _handle_delivered,
    _handle_opened,
    _handle_clicked,
)
from app.api.v1.routes.admin import _engagement_rates


# ── fakes ─────────────────────────────────────────────────────────────────────

@dataclass
class _Event:
    id: str = field(default_factory=lambda: str(uuid4()))
    user_id: str = field(default_factory=lambda: str(uuid4()))
    resend_id: str | None = "res-1"
    status: str = "sent"
    delivered_at: datetime | None = None
    opened_at: datetime | None = None
    clicked_at: datetime | None = None
    bounced_at: datetime | None = None
    complained_at: datetime | None = None
    open_count: int = 0
    click_count: int = 0


class _Query:
    def __init__(self, data):
        self._data = list(data)

    def filter(self, *_):
        return self

    def first(self):
        return self._data[0] if self._data else None


class _Db:
    def __init__(self, events):
        self._events = events
        self.committed = False

    def query(self, _model):
        return _Query(self._events)

    def commit(self):
        self.committed = True


# ── delivered ─────────────────────────────────────────────────────────────────

def test_delivered_sets_timestamp_and_status():
    ev = _Event(status="sent")
    _handle_delivered(_Db([ev]), "res-1")
    assert ev.delivered_at is not None
    assert ev.status == "delivered"


def test_delivered_does_not_override_terminal_status():
    ev = _Event(status="bounced")
    _handle_delivered(_Db([ev]), "res-1")
    assert ev.status == "bounced"  # terminal preserved


def test_delivered_no_op_for_unknown_id():
    db = _Db([])
    _handle_delivered(db, "missing")
    assert not db.committed


# ── opened ────────────────────────────────────────────────────────────────────

def test_opened_records_first_open_and_increments():
    ev = _Event()
    db = _Db([ev])
    _handle_opened(db, "res-1")
    first_open = ev.opened_at
    assert first_open is not None
    assert ev.open_count == 1
    assert ev.delivered_at is not None  # open implies delivery

    _handle_opened(db, "res-1")
    assert ev.open_count == 2
    assert ev.opened_at == first_open  # first-open timestamp preserved


# ── clicked ───────────────────────────────────────────────────────────────────

def test_clicked_implies_open_and_delivery():
    ev = _Event()
    _handle_clicked(_Db([ev]), "res-1")
    assert ev.clicked_at is not None
    assert ev.click_count == 1
    assert ev.opened_at is not None
    assert ev.delivered_at is not None


def test_clicked_preserves_existing_open_timestamp():
    earlier = datetime(2026, 1, 1, tzinfo=timezone.utc)
    ev = _Event(opened_at=earlier, open_count=1)
    _handle_clicked(_Db([ev]), "res-1")
    assert ev.opened_at == earlier  # not overwritten by the click


# ── rate math ─────────────────────────────────────────────────────────────────

def test_engagement_rates_basic():
    r = _engagement_rates(delivered=100, opened=40, clicked=10, bounced=0, complained=0, sent_ok=100)
    assert r["open_rate"] == 40.0
    assert r["click_rate"] == 10.0
    assert r["click_to_open_rate"] == 25.0


def test_engagement_rates_never_divide_by_zero():
    r = _engagement_rates(delivered=0, opened=0, clicked=0, bounced=0, complained=0, sent_ok=0)
    assert r == {
        "open_rate": 0.0,
        "click_rate": 0.0,
        "click_to_open_rate": 0.0,
        "bounce_rate": 0.0,
        "complaint_rate": 0.0,
    }


def test_engagement_rates_bounce_relative_to_attempted():
    # 5 bounced out of 95 sent_ok + 5 bounced = 100 attempted -> 5%
    r = _engagement_rates(delivered=95, opened=0, clicked=0, bounced=5, complained=0, sent_ok=95)
    assert r["bounce_rate"] == 5.0
