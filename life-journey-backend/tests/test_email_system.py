"""Tests for the world-class email upgrade:

- subject truncation on word boundaries
- miss-tolerant tiered re-engagement selection
- one-click unsubscribe (human GET page + machine POST helper)
- preference gating for the new email types
- rendering of the new templates (onboarding nudge + completion)
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

# premailer/cssutils are noisy on CSS3 properties; silence during tests
logging.disable(logging.CRITICAL)


# ── subject truncation ────────────────────────────────────────────────────────

from app.services.email.renderer import truncate_subject


def test_truncate_subject_leaves_short_text_untouched():
    assert truncate_subject("Korte vraag?", 60) == "Korte vraag?"


def test_truncate_subject_cuts_on_word_boundary_with_ellipsis():
    text = "Wat was het allermooiste moment dat je ooit hebt beleefd met je grootouders"
    result = truncate_subject(text, 40)
    assert result.endswith("…")
    assert len(result) <= 41  # 40 + ellipsis
    # never cuts mid-word: the part before the ellipsis is a whole-word prefix
    assert text.startswith(result[:-1])
    assert not result[:-1].endswith(" ")


def test_truncate_subject_normalises_whitespace():
    assert truncate_subject("Hallo    daar\n  wereld", 60) == "Hallo daar wereld"


def test_truncate_subject_handles_single_long_word():
    result = truncate_subject("Supercalifragilisticexpialidocious", 10)
    assert result.endswith("…")
    assert len(result) == 11


# ── tiered re-engagement selection ────────────────────────────────────────────

from app.services.email.scheduler import (
    select_reminder_tier,
    ONBOARDING_TIERS,
    WINBACK_TIERS,
)


def test_select_tier_picks_highest_reached():
    assert select_reminder_tier(50, set(), WINBACK_TIERS) == 45


def test_select_tier_is_miss_tolerant():
    # The daily job missed day 7; on day 9 it still picks up the missed tier.
    assert select_reminder_tier(9, set(), WINBACK_TIERS) == 7


def test_select_tier_skips_already_sent():
    assert select_reminder_tier(9, {7}, WINBACK_TIERS) is None
    assert select_reminder_tier(50, {7, 21}, WINBACK_TIERS) == 45


def test_select_tier_none_before_first_threshold():
    assert select_reminder_tier(3, set(), WINBACK_TIERS) is None
    assert select_reminder_tier(0, set(), ONBOARDING_TIERS) is None


def test_select_tier_onboarding_progression():
    assert select_reminder_tier(1, set(), ONBOARDING_TIERS) == 1
    assert select_reminder_tier(5, {1}, ONBOARDING_TIERS) == 3
    assert select_reminder_tier(10, {1, 3}, ONBOARDING_TIERS) == 7
    assert select_reminder_tier(10, {1, 3, 7}, ONBOARDING_TIERS) is None


# ── template rendering ────────────────────────────────────────────────────────

from app.services.email.renderer import (
    build_first_memory_nudge_email,
    build_journey_complete_email,
)


def test_first_memory_nudge_renders_all_tiers():
    for tier in (1, 3, 7):
        subject, html, text = build_first_memory_nudge_email(
            user_display_name="Riet",
            tier=tier,
            next_chapter_id="intro-reflection",
            first_question="Wat is je vroegste herinnering?",
            journey_url="https://example.test/vertel",
            unsubscribe_token="tok-abc",
        )
        assert "Riet" in subject
        assert "Wat is je vroegste herinnering?" in html
        assert "Wat is je vroegste herinnering?" in text
        # footer afmeldlink present for this non-transactional mail
        assert "unsubscribe/tok-abc" in html


def test_journey_complete_renders_with_celebration():
    subject, html, text = build_journey_complete_email(
        user_display_name="Riet",
        journey_title="Mijn verhaal",
        total_count=30,
        journey_url="https://example.test/dashboard",
        unsubscribe_token="tok-xyz",
    )
    assert "voltooid" in subject.lower()
    assert "voltooid" in html.lower()
    assert "30" in text
    assert "unsubscribe/tok-xyz" in html


# ── unsubscribe helper (one-click) ────────────────────────────────────────────

from app.models.email import EmailEvent, EmailPreference
from app.api.v1.routes.emails import _apply_unsubscribe, _unsubscribe_page


@dataclass
class _Event:
    user_id: str = field(default_factory=lambda: str(uuid4()))
    unsubscribe_token: str | None = "tok-1"


@dataclass
class _Prefs:
    user_id: str = field(default_factory=lambda: str(uuid4()))
    unsubscribed_all: bool = False
    unsubscribed_at: datetime | None = None
    welcome_emails: bool = True
    chapter_emails: bool = True
    milestone_emails: bool = True


class _Query:
    def __init__(self, data):
        self._data = list(data)

    def filter(self, *_):
        return self

    def first(self):
        return self._data[0] if self._data else None


class _Db:
    def __init__(self, events=None, prefs=None):
        self._events = events or []
        self._prefs = prefs or []
        self.committed = False
        self.added: list = []

    def query(self, model):
        if model is EmailEvent:
            return _Query(self._events)
        if model is EmailPreference:
            return _Query(self._prefs)
        return _Query([])

    def add(self, obj):
        self.added.append(obj)

    def commit(self):
        self.committed = True


def test_apply_unsubscribe_sets_global_optout_and_clears_token():
    event = _Event(unsubscribe_token="tok-1")
    prefs = _Prefs(user_id=event.user_id)
    db = _Db(events=[event], prefs=[prefs])

    assert _apply_unsubscribe(db, "tok-1") is True
    assert prefs.unsubscribed_all is True
    assert prefs.unsubscribed_at is not None
    assert event.unsubscribe_token is None  # single-use: token invalidated
    assert db.committed


def test_apply_unsubscribe_creates_prefs_when_missing():
    event = _Event(unsubscribe_token="tok-2")
    db = _Db(events=[event], prefs=[])

    assert _apply_unsubscribe(db, "tok-2") is True
    new_prefs = [o for o in db.added if isinstance(o, EmailPreference)]
    assert new_prefs and new_prefs[0].unsubscribed_all is True


def test_apply_unsubscribe_returns_false_for_unknown_token():
    db = _Db(events=[], prefs=[])
    assert _apply_unsubscribe(db, "does-not-exist") is False
    assert not db.committed


def test_unsubscribe_page_differs_for_found_vs_unknown():
    found = _unsubscribe_page(True)
    unknown = _unsubscribe_page(False)
    assert "uitgeschreven" in found.lower()
    assert "al gebruikt" in unknown.lower()
    # both are full, branded HTML pages
    assert "<!DOCTYPE html>" in found and "Bewaardvoorjou" in found


# ── preference gating for the new types ───────────────────────────────────────

from app.services.email.preferences import should_send_email
from app.models.user import User


@dataclass
class _User:
    id: str = "u1"
    email_bounced: bool = False


class _PrefDb:
    def __init__(self, user, prefs):
        self._user = user
        self._prefs = prefs

    def query(self, model):
        if model is User:
            return _Query([self._user] if self._user else [])
        if model is EmailPreference:
            return _Query([self._prefs] if self._prefs else [])
        return _Query([])


def test_journey_complete_gated_by_milestone_pref():
    user = _User(id="u1")
    prefs = _Prefs(user_id="u1", milestone_emails=False)
    assert should_send_email(_PrefDb(user, prefs), "u1", "journey_complete") is False
    prefs.milestone_emails = True
    assert should_send_email(_PrefDb(user, prefs), "u1", "journey_complete") is True


def test_first_memory_nudge_gated_by_inactivity_pref():
    user = _User(id="u1")

    @dataclass
    class _P:
        user_id: str = "u1"
        unsubscribed_all: bool = False
        inactivity_reminders: bool = True

    prefs = _P(inactivity_reminders=False)
    assert should_send_email(_PrefDb(user, prefs), "u1", "first_memory_nudge") is False
    prefs.inactivity_reminders = True
    assert should_send_email(_PrefDb(user, prefs), "u1", "first_memory_nudge") is True


def test_bounced_user_never_receives_nudge():
    user = _User(id="u1", email_bounced=True)
    prefs = _Prefs(user_id="u1")
    assert should_send_email(_PrefDb(user, prefs), "u1", "first_memory_nudge") is False
    assert should_send_email(_PrefDb(user, prefs), "u1", "journey_complete") is False
