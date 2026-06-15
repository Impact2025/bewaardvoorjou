"""Tests voor de idempotentie-guards op re-engagement e-mails.

- week-guard: hooguit één wekelijkse vraag per ~week (bug #3)
- dagcap: max één re-engagement-mail per gebruiker per dag (bug #4)
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import app.db.base  # noqa: F401  (laadt alle modellen voor de mapper)
from app.models.base import Base
from app.models.user import User
from app.models.journey import Journey
from app.models.email import EmailEvent, EmailPreference
from app.services.email import events


@pytest.fixture
def db(monkeypatch):
    engine = create_engine("sqlite:///:memory:")
    # Alleen de tabellen die deze test nodig heeft (andere modellen gebruiken
    # Postgres-sequences die SQLite niet kent).
    Base.metadata.create_all(
        engine,
        tables=[m.__table__ for m in (User, Journey, EmailEvent, EmailPreference)],
    )
    session = sessionmaker(bind=engine)()

    # Geen echte mail versturen: stub de enqueue zodat events 'pending' blijven.
    monkeypatch.setattr(events, "enqueue_email_job", lambda event_id: "sync")

    user = User(
        id="u1", display_name="Vincent", email="v@example.com",
        country="NL", is_active=True, email_verified=True, email_bounced=False,
    )
    journey = Journey(id="j1", user_id="u1", title="Mijn verhaal")
    session.add(user)
    session.add(journey)
    session.commit()
    try:
        yield session
    finally:
        session.close()


def _weekly(db):
    return events.trigger_weekly_question_email(
        db, user_id="u1", journey_id="j1",
        chapter_id="intro-reflection", question_text="Vertel iets moois.",
    )


def test_weekly_question_verstuurt_eenmalig(db):
    assert _weekly(db) is not None
    assert db.query(EmailEvent).filter_by(email_type="weekly_question").count() == 1


def test_week_guard_blokkeert_tweede_wekelijkse_vraag(db):
    assert _weekly(db) is not None
    # Tweede keer binnen 6 dagen -> geblokkeerd.
    assert _weekly(db) is None
    assert db.query(EmailEvent).filter_by(email_type="weekly_question").count() == 1


def test_dagcap_blokkeert_wekelijkse_vraag_na_seizoensmail(db):
    # Simuleer dat er vandaag al een seizoensmail uitging.
    events.trigger_seasonal_email(
        db, user_id="u1", journey_id="j1", occasion="vaderdag",
        question_text="Wat heeft het vaderschap je geleerd?",
        chapter_id="family-children",
    )
    # De wekelijkse vraag moet die dag dan zwijgen.
    assert _weekly(db) is None
    assert db.query(EmailEvent).filter_by(email_type="weekly_question").count() == 0


def test_dagcap_blokkeert_inactiviteit_na_wekelijkse_vraag(db):
    assert _weekly(db) is not None
    result = events.trigger_inactivity_reminder_email(
        db, user_id="u1", journey_id="j1", days_inactive=7,
        next_chapter_id="intro-reflection", next_question="Vertel verder.",
    )
    assert result is None
    assert db.query(EmailEvent).filter_by(email_type="inactivity_reminder").count() == 0
