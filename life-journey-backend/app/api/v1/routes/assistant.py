from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.rate_limiter import limiter, RateLimits
from app.schemas.assistant import (
    AssistantPromptRequest,
    AssistantPromptResponse,
    AssistantChatRequest,
    AssistantChatResponse,
    AssistantHelpSuggestionsRequest,
    AssistantHelpSuggestionsResponse,
    AssistantFollowUpRequest,
    AssistantFollowUpResponse,
    TranscriptAnalysisRequest,
    TranscriptAnalysisResponse,
)
from app.services.ai.interviewer import (
    build_prompt,
    generate_follow_up,
    analyze_transcript_for_themes,
    get_contextual_encouragement,
)
from app.services.ai.conversational_assistant import (
    chat_with_assistant,
    get_help_suggestions,
)
from app.models.user import User
from app.services.journey_progress import get_previous_chapters_summary


router = APIRouter()


@router.post("/prompt", response_model=AssistantPromptResponse, summary="Generate interview prompt")
@limiter.limit(RateLimits.AI_PROMPT)
def generate_prompt(
  request: Request,
  payload: AssistantPromptRequest,
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db),
) -> AssistantPromptResponse:
  """
  Generate an AI-powered interview prompt for a specific chapter.

  Now supports context-aware prompting using the user's journey history
  to personalize questions with themes, people, and emotional patterns.
  """
  # Get previous chapters context if journey_id is provided (legacy support)
  previous_context = None
  if payload.journey_id:
    previous_context = get_previous_chapters_summary(
      db,
      journey_id=payload.journey_id,
      current_chapter_id=payload.chapter_id.value
    )

  # Generate context-aware prompt with journey memory
  prompt = build_prompt(
    chapter=payload.chapter_id,
    follow_up_history=payload.follow_ups or [],
    previous_context=previous_context,
    db=db,
    journey_id=payload.journey_id,
  )
  return AssistantPromptResponse(prompt=prompt)


@router.post("/chat", response_model=AssistantChatResponse, summary="Chat with AI assistant")
@limiter.limit(RateLimits.AI_CHAT)
def chat(
  request: Request,
  payload: AssistantChatRequest,
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db),
) -> AssistantChatResponse:
  """
  Have a conversation with the AI assistant for help and guidance.
  The assistant can provide support with storytelling, technical issues, and emotional guidance.
  """
  # Get journey context if provided
  journey_context = None
  if payload.journey_id:
    journey_context = get_previous_chapters_summary(
      db,
      journey_id=payload.journey_id,
      current_chapter_id=payload.chapter_id.value if payload.chapter_id else None
    )

  # Convert conversation history to dict format
  conversation_history = None
  if payload.conversation_history:
    conversation_history = [
      {"role": msg.role, "content": msg.content}
      for msg in payload.conversation_history
    ]

  # Get assistant response
  response = chat_with_assistant(
    user_message=payload.message,
    chapter_id=payload.chapter_id,
    journey_context=journey_context,
    conversation_history=conversation_history
  )

  # Get suggestions if chapter_id is provided
  suggestions = None
  if payload.chapter_id:
    suggestions = get_help_suggestions(payload.chapter_id)

  return AssistantChatResponse(response=response, suggestions=suggestions)


@router.post("/help-suggestions", response_model=AssistantHelpSuggestionsResponse, summary="Get help suggestions")
@limiter.limit(RateLimits.AI_SUGGESTION)
def get_suggestions(
  request: Request,
  payload: AssistantHelpSuggestionsRequest,
  current_user: User = Depends(get_current_user),
) -> AssistantHelpSuggestionsResponse:
  """Get suggested help topics for a specific chapter"""
  suggestions = get_help_suggestions(payload.chapter_id)
  return AssistantHelpSuggestionsResponse(suggestions=suggestions)


@router.post("/follow-up", response_model=AssistantFollowUpResponse, summary="Generate follow-up question")
@limiter.limit(RateLimits.AI_PROMPT)
def get_follow_up(
  request: Request,
  payload: AssistantFollowUpRequest,
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db),
) -> AssistantFollowUpResponse:
  """
  Generate an intelligent follow-up question based on current transcript.

  This endpoint analyzes what the user has said and generates a deeper,
  more specific follow-up question to elicit richer stories. It uses:
  - The current transcript to understand what was shared
  - Journey memory for personalized context
  - Previous prompts to avoid repetition
  """
  follow_up = generate_follow_up(
    db=db,
    journey_id=payload.journey_id,
    chapter=payload.chapter_id,
    current_transcript=payload.transcript,
    previous_prompts=payload.previous_prompts or [],
  )

  # Optionally analyze transcript for real-time themes
  analysis = None
  if payload.include_analysis:
    themes = analyze_transcript_for_themes(payload.transcript)
    encouragement = None
    if themes["emotions"]:
      encouragement = get_contextual_encouragement(themes["emotions"][0])
    analysis = {
      "themes": themes["themes"],
      "people": themes["people"],
      "emotions": themes["emotions"],
      "encouragement": encouragement,
    }

  return AssistantFollowUpResponse(
    follow_up=follow_up,
    analysis=analysis,
  )


@router.post("/analyze-transcript", response_model=TranscriptAnalysisResponse, summary="Analyze transcript")
@limiter.limit(RateLimits.AI_SUGGESTION)
def analyze_transcript(
  request: Request,
  payload: TranscriptAnalysisRequest,
  current_user: User = Depends(get_current_user),
) -> TranscriptAnalysisResponse:
  """
  Analyze a transcript to extract themes, emotions, and mentioned people.

  This is a lightweight real-time analysis that can be used during
  recording to provide contextual feedback and encouragement.
  """
  analysis = analyze_transcript_for_themes(payload.transcript)

  # Get contextual encouragement based on detected emotions
  encouragement = None
  if analysis["emotions"]:
    encouragement = get_contextual_encouragement(analysis["emotions"][0])

  return TranscriptAnalysisResponse(
    themes=analysis["themes"],
    people=analysis["people"],
    emotions=analysis["emotions"],
    encouragement=encouragement,
  )
