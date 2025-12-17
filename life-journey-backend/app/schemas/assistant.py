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


# =============================================================================
# Multi-Turn Conversation Schemas (World-Class Interviewer)
# =============================================================================


class StartConversationRequest(BaseModel):
  """Request to start a multi-turn conversation session."""
  journey_id: str
  chapter_id: ChapterId
  asset_id: str  # Media asset being recorded


class StartConversationResponse(BaseModel):
  """Response with session ID and opening question."""
  session_id: str
  opening_question: str


class ContinueConversationRequest(BaseModel):
  """Request to continue conversation with user's response."""
  session_id: str
  response_text: str  # User's answer to the last question


class ContinueConversationResponse(BaseModel):
  """Response with next question or completion signal."""
  next_question: str | None  # None if conversation complete
  turn_number: int
  conversation_complete: bool
  story_depth: int | None = None  # 1-10 score of story completeness


class EndConversationRequest(BaseModel):
  """Request to end conversation and get summary."""
  session_id: str


class EndConversationResponse(BaseModel):
  """Response with conversation summary."""
  total_turns: int
  completed: bool
  story_depth: int
  key_themes: list[str]
  people_mentioned: list[str]
