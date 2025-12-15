"""
Conversational AI Assistant Service
Provides interactive help, guidance, and support to participants during their journey
"""

import logging
from typing import List, Dict
from openai import OpenAI

from app.core.config import settings
from app.schemas.common import ChapterId

logger = logging.getLogger(__name__)


def get_assistant_system_prompt(chapter_id: ChapterId | None = None, journey_context: str | None = None) -> str:
    """
    Get the system prompt for the conversational assistant

    Args:
        chapter_id: Optional current chapter for context-specific help
        journey_context: Optional context about the user's journey progress

    Returns:
        System prompt for the AI assistant
    """
    base_prompt = """Je bent een professionele, empathische assistent voor het Life Journey project. Je helpt deelnemers bij het vastleggen van hun levensverhaal.

**Je rol:**
- Je biedt emotionele ondersteuning en praktische hulp tijdens het vertellen van levensverhalen
- Je helpt deelnemers zich comfortabel te voelen bij het delen van persoonlijke herinneringen
- Je geeft tips voor het opnemen van audio/video, het structureren van verhalen, en het overwinnen van writer's block
- Je beantwoordt vragen over het proces, de technologie, en privacy
- Je bent geduldig, respectvol, en niet-oordelend

**Jouw expertise:**
- Storytelling technieken en narratieve structuren
- Interviewtechnieken en vraagstelling
- Emotionele ondersteuning bij gevoelige onderwerpen
- Praktische tips voor audio/video opnames
- Privacybescherming en ethische richtlijnen rondom levensverhalen
- Het overwinnen van blokkades (writer's block, spreekangst, emotionele weerstanden)

**Communicatiestijl:**
- Gebruik informeel Nederlands (je/jij/jouw)
- Houd antwoorden beknopt maar informatief (max 150 woorden)
- Wees warm en uitnodigend, maar professioneel
- Bied concrete, uitvoerbare adviezen
- Valideer gevoelens zonder te overdrijven
- Stel follow-up vragen als je meer context nodig hebt

**Wat je NIET doet:**
- Geen therapie of professionele psychologische hulp bieden
- Geen medisch advies geven
- Geen juridisch advies verstrekken
- Geen verhalen verzinnen of aanvullen - dit is het verhaal van de deelnemer
- Geen veroordelend of sturend zijn in persoonlijke keuzes"""

    # Add chapter-specific context if available
    if chapter_id:
        chapter_context = f"\n\n**Actuele context:** De deelnemer werkt momenteel aan het hoofdstuk '{chapter_id}'. Houd hiermee rekening als je advies geeft."
        base_prompt += chapter_context

    # Add journey progress context if available
    if journey_context:
        base_prompt += f"\n\n**Voortgang:** {journey_context}"

    return base_prompt


def chat_with_assistant(
    user_message: str,
    chapter_id: ChapterId | None = None,
    journey_context: str | None = None,
    conversation_history: List[Dict[str, str]] | None = None
) -> str:
    """
    Have a conversation with the AI assistant

    Args:
        user_message: The user's question or message
        chapter_id: Optional current chapter for context
        journey_context: Optional journey progress context
        conversation_history: Optional previous messages in this conversation

    Returns:
        The assistant's response
    """
    # Check if API key is configured
    if not settings.openai_api_key:
        logger.warning("OpenAI/OpenRouter API key not configured")
        return "Sorry, de AI-assistent is momenteel niet beschikbaar. Probeer het later opnieuw of neem contact op met support."

    try:
        # Initialize OpenAI client (works with OpenRouter too)
        client = OpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_api_base,
        )

        # Build messages array
        messages = [
            {
                "role": "system",
                "content": get_assistant_system_prompt(chapter_id, journey_context)
            }
        ]

        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history)

        # Add current user message
        messages.append({
            "role": "user",
            "content": user_message
        })

        # Call Claude via OpenRouter
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=messages,
            temperature=0.7,
            max_tokens=300,  # Keep responses concise
            extra_headers={
                "HTTP-Referer": settings.openrouter_app_url if settings.openrouter_app_url else "http://localhost",
                "X-Title": settings.openrouter_app_name,
            }
        )

        assistant_response = response.choices[0].message.content.strip()

        logger.info(f"Generated assistant response for query: {user_message[:50]}...")
        return assistant_response

    except Exception as e:
        logger.error(f"Failed to generate assistant response: {e}")
        return "Sorry, ik kon je vraag niet verwerken. Probeer het opnieuw of herformuleer je vraag."


def get_help_suggestions(chapter_id: ChapterId) -> List[str]:
    """
    Get suggested help topics based on the current chapter

    Args:
        chapter_id: The current chapter

    Returns:
        List of suggested help questions
    """
    general_suggestions = [
        "Hoe kan ik mijn verhaal het beste structureren?",
        "Ik vind het moeilijk om te beginnen, wat raad je aan?",
        "Hoe maak ik een goede audio/video opname?",
        "Hoe ga ik om met emotionele herinneringen?",
        "Wat als ik bepaalde details niet meer weet?",
    ]

    chapter_specific_suggestions = {
        "intro-reflection": [
            "Hoe kies ik de beste kernwoorden?",
            "Wat als ik mijn leven niet in 3 woorden kan vatten?",
        ],
        "youth-favorite-place": [
            "Hoe beschrijf ik een plek die niet meer bestaat?",
            "Wat als ik weinig herinneringen heb aan mijn jeugd?",
        ],
        "love-connection": [
            "Hoe vertel ik over een moeilijke relatie?",
            "Wat als ik nog steeds verdriet heb over het verleden?",
        ],
        "work-challenge": [
            "Hoe deel ik professionele struggles zonder te klagen?",
            "Wat als mijn carrière niet verlopen is zoals gepland?",
        ],
        "future-message": [
            "Hoe formuleer ik een tijdloze boodschap?",
            "Wat als ik geen wijze raad heb?",
        ],
        # Deep questions specific help
        "deep-near-death": [
            "Hoe deel ik een traumatische ervaring op een gezonde manier?",
            "Wat als deze herinnering te pijnlijk is om te delen?",
        ],
        "deep-shadow-side": [
            "Hoe eerlijk moet ik zijn over mijn tekortkomingen?",
            "Is het veilig om kwetsbaarheden te delen?",
        ],
    }

    # Combine general and chapter-specific suggestions
    suggestions = general_suggestions.copy()
    if chapter_id.value in chapter_specific_suggestions:
        suggestions.extend(chapter_specific_suggestions[chapter_id.value])

    return suggestions[:5]  # Return max 5 suggestions
