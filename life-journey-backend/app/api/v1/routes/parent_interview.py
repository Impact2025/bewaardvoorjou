"""
Interview je Ouders — API routes.

Authenticated endpoints (journey owner):
  POST   /family/{journey_id}/parent-interviews          — maak interview aan
  GET    /family/{journey_id}/parent-interviews          — lijst interviews
  DELETE /family/{journey_id}/parent-interviews/{id}     — verwijder interview

Public endpoints (interviewee, no auth):
  GET    /parent-interview/{token}                       — bekijk vragen
  POST   /parent-interview/{token}/answers               — sla antwoorden op
"""

import secrets
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.rate_limiter import limiter, RateLimits
from app.db.session import get_db
from app.models.journey import Journey
from app.models.parent_interview import ParentInterview, ParentInterviewAnswer
from app.models.user import User

router = APIRouter()


# ── Schemas ────────────────────────────────────────────────────────────────────

class CreateInterviewRequest(BaseModel):
    interviewee_name: str
    interviewee_email: str | None = None
    personal_message: str | None = None
    topic: str = "levensverhaal"


class QuestionItem(BaseModel):
    id: str
    text: str


class InterviewResponse(BaseModel):
    id: str
    journey_id: str
    interviewee_name: str
    interviewee_email: str | None
    personal_message: str | None
    questions: list[QuestionItem]
    token: str
    share_url: str
    is_completed: bool
    completed_at: str | None
    email_sent_at: str | None
    created_at: str
    answer_count: int


class PublicInterviewResponse(BaseModel):
    id: str
    interviewee_name: str
    personal_message: str | None
    questions: list[QuestionItem]
    is_completed: bool
    journey_owner_name: str


class AnswerItem(BaseModel):
    question_id: str
    answer_text: str


class SubmitAnswersRequest(BaseModel):
    answers: list[AnswerItem]


# ── Helpers ────────────────────────────────────────────────────────────────────

def _ensure_journey_access(journey_id: str, db: Session, user: User) -> Journey:
    journey = db.query(Journey).filter(Journey.id == journey_id).first()
    if journey is None or journey.user_id != user.id:
        raise HTTPException(status_code=403, detail="Geen toegang tot deze journey")
    return journey


def _interview_to_response(interview: ParentInterview, base_url: str) -> InterviewResponse:
    questions = [QuestionItem(id=q["id"], text=q["text"]) for q in (interview.questions or [])]
    return InterviewResponse(
        id=interview.id,
        journey_id=interview.journey_id,
        interviewee_name=interview.interviewee_name,
        interviewee_email=interview.interviewee_email,
        personal_message=interview.personal_message,
        questions=questions,
        token=interview.token,
        share_url=f"{base_url}/ouder-interview/{interview.token}",
        is_completed=interview.is_completed,
        completed_at=interview.completed_at.isoformat() if interview.completed_at else None,
        email_sent_at=interview.email_sent_at.isoformat() if interview.email_sent_at else None,
        created_at=interview.created_at.isoformat(),
        answer_count=len(interview.answers),
    )


def _generate_questions(interviewee_name: str, topic: str) -> list[dict]:
    """Generate interview questions via OpenRouter/Claude. Falls back to curated questions."""
    try:
        from openai import OpenAI
        if not settings.openai_api_key:
            raise RuntimeError("No API key")

        client = OpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_api_base,
        )
        prompt = f"""Jij bent een empathische interviewer die helpt bij het vastleggen van familieverhalen.
Genereer 7 persoonlijke, open interviewvragen voor {interviewee_name} over het thema: {topic}.

De vragen moeten:
- In natuurlijk Nederlands zijn
- Warm en uitnodigend klinken
- Persoonlijke herinneringen en emoties oproepen
- Kort zijn (max 2 zinnen per vraag)
- Variëren in diepgang (van simpel naar reflectief)

Geef alleen de vragen terug, genummerd 1-7, zonder inleiding of uitleg."""

        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=600,
            temperature=0.7,
            extra_headers={
                "HTTP-Referer": settings.openrouter_app_url or "https://bewaardvoorjou.nl",
                "X-Title": settings.openrouter_app_name,
            },
        )
        raw = response.choices[0].message.content or ""
        lines = [l.strip() for l in raw.strip().splitlines() if l.strip()]
        questions = []
        for line in lines:
            # Strip leading number+dot
            text = line.lstrip("0123456789.-) ").strip()
            if text:
                questions.append({"id": str(uuid.uuid4()), "text": text})
        if len(questions) >= 5:
            return questions[:8]
    except Exception:
        pass

    # Curated fallback questions
    defaults = [
        "Wat is jouw vroegste herinnering uit je jeugd?",
        "Hoe was het gezin waarin je opgroeide? Vertel eens over je ouders en broers of zussen.",
        "Welk moment uit je leven heeft je het meest gevormd?",
        "Wat was het mooiste avontuur of de mooiste reis die je hebt gemaakt?",
        "Hoe hebben jullie (als stel/gezin) de moeilijkste tijden doorstaan?",
        "Wat wil je absoluut doorgeven aan de volgende generatie?",
        "Als je één advies aan je jongere zelf mocht geven, wat zou dat zijn?",
    ]
    return [{"id": str(uuid.uuid4()), "text": q} for q in defaults]


# ── Authenticated endpoints ────────────────────────────────────────────────────

@router.post("/family/{journey_id}/parent-interviews", response_model=InterviewResponse, status_code=201)
@limiter.limit(RateLimits.SHARE_CREATE)
def create_interview(
    request: Request,
    journey_id: str,
    payload: CreateInterviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InterviewResponse:
    _ensure_journey_access(journey_id, db, current_user)

    questions = _generate_questions(payload.interviewee_name, payload.topic)
    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)

    interview = ParentInterview(
        journey_id=journey_id,
        interviewee_name=payload.interviewee_name.strip(),
        interviewee_email=payload.interviewee_email,
        personal_message=payload.personal_message,
        questions=questions,
        token=token,
        is_completed=False,
        created_at=now,
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    base_url = settings.openrouter_app_url or "https://bewaardvoorjou.nl"
    return _interview_to_response(interview, base_url)


@router.get("/family/{journey_id}/parent-interviews", response_model=list[InterviewResponse])
@limiter.limit(RateLimits.READ_STANDARD)
def list_interviews(
    request: Request,
    journey_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[InterviewResponse]:
    _ensure_journey_access(journey_id, db, current_user)
    interviews = (
        db.query(ParentInterview)
        .filter(ParentInterview.journey_id == journey_id)
        .order_by(ParentInterview.created_at.desc())
        .all()
    )
    base_url = settings.openrouter_app_url or "https://bewaardvoorjou.nl"
    return [_interview_to_response(i, base_url) for i in interviews]


@router.delete("/family/{journey_id}/parent-interviews/{interview_id}", status_code=204)
@limiter.limit(RateLimits.WRITE_STANDARD)
def delete_interview(
    request: Request,
    journey_id: str,
    interview_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    _ensure_journey_access(journey_id, db, current_user)
    interview = db.query(ParentInterview).filter(
        ParentInterview.id == interview_id,
        ParentInterview.journey_id == journey_id,
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview niet gevonden")
    db.delete(interview)
    db.commit()


# ── Public endpoints (no auth) ─────────────────────────────────────────────────

@router.get("/parent-interview/{token}", response_model=PublicInterviewResponse)
@limiter.limit("60/hour")
def get_public_interview(
    request: Request,
    token: str,
    db: Session = Depends(get_db),
) -> PublicInterviewResponse:
    interview = db.query(ParentInterview).filter(ParentInterview.token == token).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview niet gevonden of link is verlopen")

    journey = interview.journey
    owner_name = journey.user.display_name if journey and journey.user else "Je familie"

    questions = [QuestionItem(id=q["id"], text=q["text"]) for q in (interview.questions or [])]
    return PublicInterviewResponse(
        id=interview.id,
        interviewee_name=interview.interviewee_name,
        personal_message=interview.personal_message,
        questions=questions,
        is_completed=interview.is_completed,
        journey_owner_name=owner_name,
    )


@router.post("/parent-interview/{token}/answers", status_code=204)
@limiter.limit("10/hour")
def submit_answers(
    request: Request,
    token: str,
    payload: SubmitAnswersRequest,
    db: Session = Depends(get_db),
) -> None:
    interview = db.query(ParentInterview).filter(ParentInterview.token == token).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview niet gevonden")
    if interview.is_completed:
        raise HTTPException(status_code=409, detail="Dit interview is al ingevuld")

    # Map question texts from interview for validation
    question_map = {q["id"]: q["text"] for q in (interview.questions or [])}
    now = datetime.now(timezone.utc)

    for ans in payload.answers:
        if not ans.answer_text.strip():
            continue
        q_text = question_map.get(ans.question_id, "")
        if not q_text:
            continue
        answer = ParentInterviewAnswer(
            interview_id=interview.id,
            question_id=ans.question_id,
            question_text=q_text,
            answer_text=ans.answer_text.strip(),
            created_at=now,
        )
        db.add(answer)

    interview.is_completed = True
    interview.completed_at = now
    db.commit()
