from pydantic import BaseModel

from app.schemas.common import ChapterId


class ChapterStateResponse(BaseModel):
  active_chapters: list[ChapterId]


class ChapterStateUpdateRequest(BaseModel):
  active_chapters: list[ChapterId]
