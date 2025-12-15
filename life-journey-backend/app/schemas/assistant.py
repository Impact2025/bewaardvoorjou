from pydantic import BaseModel

from app.schemas.common import ChapterId


class AssistantPromptRequest(BaseModel):
  chapter_id: ChapterId
  follow_ups: list[str] | None = None
  journey_id: str | None = None  # Optional: to include context from previous chapters


class AssistantPromptResponse(BaseModel):
  prompt: str


class ConversationMessage(BaseModel):
  role: str  # "user" or "assistant"
  content: str


class AssistantChatRequest(BaseModel):
  message: str
  chapter_id: ChapterId | None = None
  journey_id: str | None = None
  conversation_history: list[ConversationMessage] | None = None


class AssistantChatResponse(BaseModel):
  response: str
  suggestions: list[str] | None = None


class AssistantHelpSuggestionsRequest(BaseModel):
  chapter_id: ChapterId


class AssistantHelpSuggestionsResponse(BaseModel):
  suggestions: list[str]


# =============================================================================
# Follow-Up Engine Schemas
# =============================================================================


class TranscriptAnalysis(BaseModel):
  """Analysis of a transcript with extracted themes and emotions."""
  themes: list[str]
  people: list[str]
  emotions: list[str]
  encouragement: str | None = None


class AssistantFollowUpRequest(BaseModel):
  """Request for generating a context-aware follow-up question."""
  journey_id: str
  chapter_id: ChapterId
  transcript: str  # Current transcript text to analyze
  previous_prompts: list[str] | None = None  # Previous questions asked
  include_analysis: bool = False  # Whether to include transcript analysis


class AssistantFollowUpResponse(BaseModel):
  """Response with follow-up question and optional analysis."""
  follow_up: str  # The generated follow-up question
  analysis: TranscriptAnalysis | None = None  # Optional real-time analysis


class TranscriptAnalysisRequest(BaseModel):
  """Request for analyzing transcript content."""
  transcript: str


class TranscriptAnalysisResponse(BaseModel):
  """Response with extracted themes, people, and emotions."""
  themes: list[str]
  people: list[str]
  emotions: list[str]
  encouragement: str | None = None
