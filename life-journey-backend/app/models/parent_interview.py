"""
Parent Interview models — 'Interview je Ouders' module.

A journey owner can create an interview for a parent/family member.
The parent receives a link (no account needed) and answers questions in text.
"""

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Column, DateTime, ForeignKey, JSON, String, Text, Boolean
from sqlalchemy.orm import relationship

from app.models.base import Base


def utc_now():
    return datetime.now(timezone.utc)


def generate_uuid() -> str:
    return str(uuid4())


class ParentInterview(Base):
    __tablename__ = "parentinterview"

    id = Column(String, primary_key=True, default=generate_uuid)
    journey_id = Column(String, ForeignKey("journey.id", ondelete="CASCADE"), nullable=False, index=True)

    # Who is being interviewed
    interviewee_name = Column(String(120), nullable=False)
    interviewee_email = Column(String(255), nullable=True)
    personal_message = Column(Text, nullable=True)

    # Questions (JSON list of {id, text})
    questions = Column(JSON, nullable=False, default=list)

    # Access token for public link
    token = Column(String(64), nullable=False, unique=True, index=True)

    # Status
    is_completed = Column(Boolean, nullable=False, default=False)
    completed_at = Column(DateTime, nullable=True)

    # Email tracking
    email_sent_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    journey = relationship("Journey", backref="parent_interviews")
    answers = relationship("ParentInterviewAnswer", back_populates="interview", cascade="all, delete-orphan")


class ParentInterviewAnswer(Base):
    __tablename__ = "parentinterviewanswer"

    id = Column(String, primary_key=True, default=generate_uuid)
    interview_id = Column(String, ForeignKey("parentinterview.id", ondelete="CASCADE"), nullable=False, index=True)

    question_id = Column(String(64), nullable=False)
    question_text = Column(Text, nullable=False)
    answer_text = Column(Text, nullable=False)

    created_at = Column(DateTime, default=utc_now, nullable=False)

    interview = relationship("ParentInterview", back_populates="answers")
