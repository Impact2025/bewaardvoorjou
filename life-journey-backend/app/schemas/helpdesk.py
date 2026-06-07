from pydantic import BaseModel, Field


class HelpdeskMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class HelpdeskChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    conversation_history: list[HelpdeskMessage] = Field(default_factory=list)


class HelpdeskActionLink(BaseModel):
    label: str
    href: str


class HelpdeskChatResponse(BaseModel):
    message: str
    escalate: bool
    suggested_questions: list[str]
    action_links: list[HelpdeskActionLink]
