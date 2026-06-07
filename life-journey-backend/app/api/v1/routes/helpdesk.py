"""Helpdesk AI chat route — werkt voor gasten en ingelogde gebruikers."""

from fastapi import APIRouter, Depends, Request

from app.api.deps import get_optional_user
from app.core.rate_limiter import limiter
from app.models.user import User
from app.schemas.helpdesk import HelpdeskChatRequest, HelpdeskChatResponse, HelpdeskActionLink
from app.services.ai.helpdesk_ai import chat_with_helpdesk

router = APIRouter()


@router.post("/chat", response_model=HelpdeskChatResponse)
@limiter.limit("20/minute")
async def helpdesk_chat(
    request: Request,
    payload: HelpdeskChatRequest,
    current_user: User | None = Depends(get_optional_user),
):
    """
    Verwerk een helpdesk-vraag via AI.
    Werkt voor zowel gasten als ingelogde gebruikers.
    Rate-limited op 20 berichten per minuut per IP.
    """
    user_name: str | None = None
    if current_user:
        user_name = getattr(current_user, "display_name", None) or getattr(current_user, "email", None)

    history = [{"role": m.role, "content": m.content} for m in payload.conversation_history]

    result = chat_with_helpdesk(
        user_message=payload.message,
        conversation_history=history,
        user_name=user_name,
    )

    return HelpdeskChatResponse(
        message=result["message"],
        escalate=result["escalate"],
        suggested_questions=result["suggested_questions"],
        action_links=[HelpdeskActionLink(**link) for link in result["action_links"]],
    )
