"""Tests voor de re-engagement e-mailscheduling.

Dekt de bugs die op 15-06-2026 leidden tot meerdere mails tegelijk:
- zwevende feestdagen (Moeder-/Vaderdag) op de juiste zondag
- één mail per gebruiker i.p.v. per journey
- prioriteit seizoen > wekelijkse vraag op samenvallende dagen
"""
from datetime import date, datetime, timedelta, timezone
from types import SimpleNamespace

from app.services.email import scheduler


# ---------------------------------------------------------------------------
# Zwevende feestdagen (bug #1)
# ---------------------------------------------------------------------------

def test_moederdag_is_tweede_zondag_mei():
    assert scheduler.mothers_day(2025) == date(2025, 5, 11)
    assert scheduler.mothers_day(2026) == date(2026, 5, 10)
    for year in range(2024, 2031):
        d = scheduler.mothers_day(year)
        assert d.month == 5 and d.weekday() == 6 and 8 <= d.day <= 14


def test_vaderdag_is_derde_zondag_juni():
    assert scheduler.fathers_day(2025) == date(2025, 6, 15)
    assert scheduler.fathers_day(2026) == date(2026, 6, 21)
    assert scheduler.fathers_day(2027) == date(2027, 6, 20)
    for year in range(2024, 2031):
        d = scheduler.fathers_day(year)
        assert d.month == 6 and d.weekday() == 6 and 15 <= d.day <= 21


def test_vaderdag_vuurt_niet_op_15_juni_2026():
    # Exact het scenario uit de bugmelding: 15 juni 2026 is een maandag,
    # geen Vaderdag. Er mag dus geen seizoenstrigger vallen.
    occasions = [t.occasion for t in scheduler._seasonal_triggers_for(date(2026, 6, 15))]
    assert "vaderdag" not in occasions


def test_seasonal_triggers_for_vindt_vaderdag_op_juiste_zondag():
    matches = scheduler._seasonal_triggers_for(date(2026, 6, 21))
    assert [t.occasion for t in matches] == ["vaderdag"]


def test_kerst_blijft_vaste_datum():
    matches = scheduler._seasonal_triggers_for(date(2026, 12, 24))
    assert [t.occasion for t in matches] == ["kerst"]


# ---------------------------------------------------------------------------
# Eén journey per gebruiker (bug #2)
# ---------------------------------------------------------------------------

def _user(uid):
    return SimpleNamespace(id=uid)


def _journey(uid, updated):
    return SimpleNamespace(user_id=uid, updated_at=updated, created_at=updated)


def test_one_journey_per_user_dedupliceert():
    u = _user("u1")
    older = datetime(2026, 1, 1, tzinfo=timezone.utc)
    newer = datetime(2026, 6, 1, tzinfo=timezone.utc)
    pairs = [(u, _journey("u1", older)), (u, _journey("u1", newer))]

    result = scheduler._one_journey_per_user(pairs)

    assert len(result) == 1
    # De meest recent actieve journey wint.
    assert result[0][1].updated_at == newer


def test_one_journey_per_user_behoudt_aparte_gebruikers():
    now = datetime(2026, 6, 1, tzinfo=timezone.utc)
    pairs = [
        (_user("u1"), _journey("u1", now)),
        (_user("u2"), _journey("u2", now)),
    ]
    result = scheduler._one_journey_per_user(pairs)
    assert {u.id for u, _ in result} == {"u1", "u2"}


def test_journey_activity_key_normaliseert_naive_datetime():
    naive = _journey("u1", datetime(2026, 6, 1))  # geen tzinfo
    key = scheduler._journey_activity_key(naive)
    assert key.tzinfo is not None


def test_journey_activity_key_valt_terug_op_created_at():
    j = SimpleNamespace(updated_at=None, created_at=datetime(2026, 6, 1, tzinfo=timezone.utc))
    assert scheduler._journey_activity_key(j) == datetime(2026, 6, 1, tzinfo=timezone.utc)
