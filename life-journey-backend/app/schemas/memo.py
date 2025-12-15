from datetime import datetime
from pydantic import BaseModel, Field

from app.schemas.common import ChapterId


class MemoCreateRequest(BaseModel):
  """Request schema for creating a new memo"""
  title: str = Field(..., min_length=1, max_length=200)
  content: str = Field(..., min_length=1)
  chapter_id: ChapterId | None = None


class MemoUpdateRequest(BaseModel):
  """Request schema for updating an existing memo"""
  title: str | None = Field(None, min_length=1, max_length=200)
  content: str | None = Field(None, min_length=1)
  chapter_id: ChapterId | None = None


class MemoResponse(BaseModel):
  """Response schema for a memo"""
  id: str
  journey_id: str
  chapter_id: ChapterId | None
  title: str
  content: str
  created_at: datetime
  updated_at: datetime | None


class MemoListResponse(BaseModel):
  """Response schema for a list of memos"""
  memos: list[MemoResponse]
