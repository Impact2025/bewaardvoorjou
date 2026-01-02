"""
Multi-Turn Conversation Engine - World-Class AI Interviewer

This module implements a sophisticated conversation system that makes the AI
interviewer feel like a real human - asking follow-ups, reading between lines,
and creating natural dialogue flow.

Key Features:
- Multi-turn conversations (3-7 exchanges per session)
- Real-time transcript analysis with Claude
- Context-aware follow-ups that reference specific details
- Natural conversation endings (detects when story is complete)
- Emotional intelligence (adapts to user's emotional state)
"""

from __future__ import annotations

from typing import Optional
from datetime import datetime, timezone, timedelta
from openai import OpenAI
from loguru import logger
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.media import TranscriptSegment, PromptRun
from app.models.journey import Journey
from app.models.quick_thought import QuickThought
from app.schemas.common import ChapterId
from app.services.ai.interviewer import CHAPTER_CONTEXTS, get_system_prompt, clean_ai_question
from app.services.ai.memory import get_personalized_prompt_context
from app.services.quick_thoughts.analyzer import (
    build_interview_context_from_thoughts,
    generate_thought_based_question,
)


class ConversationTurn:
    """Represents a single turn in the conversation."""

    def __init__(
        self,
        turn_number: int,
        question: str,
        user_response: str | None = None,
        analysis: dict | None = None,
        timestamp: datetime | None = None,
    ):
        self.turn_number = turn_number
        self.question = question
        self.user_response = user_response
        self.analysis = analysis
        self.timestamp = timestamp or datetime.now(timezone.utc)


class ConversationSession:
    """
    Manages a multi-turn conversation session for a chapter.

    This is the brain of the world-class interviewer - it:
    - Tracks the conversation history
    - Analyzes user responses in real-time
    - Decides when to ask follow-ups
    - Knows when the story is complete
    - Maintains emotional awareness
    """

    def __init__(
        self,
        db: Session,
        journey_id: str,
        chapter_id: ChapterId,
        asset_id: str,
    ):
        self.db = db
        self.journey_id = journey_id
        self.chapter_id = chapter_id
        self.asset_id = asset_id
        self.turns: list[ConversationTurn] = []
        self.max_turns = 7  # Maximum conversation turns
        self.min_turns = 3  # Minimum turns before considering completion

    def start_conversation(self) -> str:
        """
        Start the conversation with an opening question.

        Uses any relevant quick thoughts to personalize the opening question,
        making the conversation feel more connected to what the user has
        already shared.

        Returns:
            The opening question
        """
        # Get personalized context from journey
        personal_context = None
        try:
            personal_context = get_personalized_prompt_context(
                self.db, self.journey_id, self.chapter_id
            )
        except Exception as e:
            logger.warning(f"Could not get personal context: {e}")

        # Fetch relevant quick thoughts for this chapter
        thoughts_context = None
        thoughts_for_question = None
        used_thoughts = []
        try:
            thoughts = self._fetch_relevant_quick_thoughts()
            if thoughts:
                # Build context string for the AI prompt
                thoughts_context = build_interview_context_from_thoughts(
                    [t.to_dict() for t in thoughts],
                    self.chapter_id
                )
                thoughts_for_question = [t.to_dict() for t in thoughts]
                used_thoughts = thoughts  # Keep reference for marking as used
                logger.info(f"Found {len(thoughts)} relevant quick thoughts for chapter {self.chapter_id}")
        except Exception as e:
            logger.warning(f"Could not fetch quick thoughts: {e}")

        # Generate opening question (with thoughts context if available)
        opening_question = self._generate_opening_question(
            personal_context,
            thoughts_context=thoughts_context,
            thoughts_for_question=thoughts_for_question
        )

        # Mark thoughts as used if they were incorporated in the question
        if used_thoughts and thoughts_context:
            self._mark_thoughts_as_used(used_thoughts)

        # Record turn
        turn = ConversationTurn(
            turn_number=1,
            question=opening_question,
        )
        self.turns.append(turn)

        logger.info(f"Started conversation for chapter {self.chapter_id}, turn 1")
        return opening_question

    def _fetch_relevant_quick_thoughts(self) -> list[QuickThought]:
        """
        Fetch quick thoughts relevant to this chapter.

        Returns thoughts that are either:
        - Directly linked to this chapter
        - Suggested for this chapter by AI analysis
        - Recent and unassigned (may be relevant)

        Only returns unused thoughts (not yet used in an interview).
        """
        from sqlalchemy import or_, and_, cast, String
        from sqlalchemy.dialects.postgresql import JSONB

        # First query: direct matches and unassigned recent thoughts
        thoughts = (
            self.db.query(QuickThought)
            .filter(
                QuickThought.journey_id == self.journey_id,
                QuickThought.is_used_in_interview == False,
                QuickThought.archived_at == None,
                QuickThought.processing_status == "completed",
                or_(
                    # Direct match: thought is for this chapter
                    QuickThought.chapter_id == self.chapter_id,
                    # Unassigned but recent (within last 7 days)
                    and_(
                        QuickThought.chapter_id == None,
                        QuickThought.created_at >= datetime.now(timezone.utc) - timedelta(days=7)
                    )
                )
            )
            .order_by(QuickThought.created_at.desc())
            .limit(5)
            .all()
        )

        # If we have enough direct matches, return them
        if len(thoughts) >= 3:
            return thoughts

        # Also check for AI-suggested matches by searching in suggested_chapters JSON
        # This uses a text search since JSON containment can be complex
        try:
            suggested_thoughts = (
                self.db.query(QuickThought)
                .filter(
                    QuickThought.journey_id == self.journey_id,
                    QuickThought.is_used_in_interview == False,
                    QuickThought.archived_at == None,
                    QuickThought.processing_status == "completed",
                    QuickThought.chapter_id != self.chapter_id,  # Not already direct match
                    QuickThought.suggested_chapters.isnot(None),
                    cast(QuickThought.suggested_chapters, String).contains(self.chapter_id)
                )
                .order_by(QuickThought.created_at.desc())
                .limit(5 - len(thoughts))
                .all()
            )

            # Merge and deduplicate
            existing_ids = {t.id for t in thoughts}
            for t in suggested_thoughts:
                if t.id not in existing_ids:
                    thoughts.append(t)

        except Exception as e:
            logger.warning(f"Error fetching suggested thoughts: {e}")

        return thoughts[:5]

    def _mark_thoughts_as_used(self, thoughts: list[QuickThought]) -> None:
        """
        Mark quick thoughts as used in an interview.

        This prevents them from being suggested again in future interviews.
        """
        for thought in thoughts:
            thought.is_used_in_interview = True
            thought.used_in_interview_at = datetime.now(timezone.utc)

        try:
            self.db.commit()
            logger.info(f"Marked {len(thoughts)} thoughts as used in interview")
        except Exception as e:
            logger.error(f"Failed to mark thoughts as used: {e}")
            self.db.rollback()

    def add_user_response(self, response_text: str) -> None:
        """Add user's response to the last question."""
        if not self.turns:
            raise ValueError("No active conversation turn")

        current_turn = self.turns[-1]
        current_turn.user_response = response_text

        # Analyze the response
        analysis = self._analyze_response_with_ai(response_text)
        current_turn.analysis = analysis

        logger.info(f"Recorded user response for turn {current_turn.turn_number}")

    def generate_next_question(self) -> Optional[str]:
        """
        Generate the next question based on conversation history.

        Returns:
            The next question, or None if conversation should end
        """
        if not self.turns:
            raise ValueError("No conversation started")

        current_turn = self.turns[-1]

        if not current_turn.user_response:
            raise ValueError("No user response for current turn")

        # Check if conversation should end
        if self.should_end_conversation():
            logger.info(f"Conversation ending after {len(self.turns)} turns")
            return None

        # Check max turns
        if len(self.turns) >= self.max_turns:
            logger.info(f"Reached max turns ({self.max_turns})")
            return None

        # Generate follow-up question
        next_question = self._generate_intelligent_follow_up()

        if next_question:
            turn = ConversationTurn(
                turn_number=len(self.turns) + 1,
                question=next_question,
            )
            self.turns.append(turn)
            logger.info(f"Generated turn {turn.turn_number}")

        return next_question

    def should_end_conversation(self) -> bool:
        """
        Determine if the conversation feels complete.

        Uses AI to analyze if:
        - User has shared a complete story
        - Emotional arc feels resolved
        - Key details have been covered
        """
        if len(self.turns) < self.min_turns:
            return False

        if not settings.openai_api_key:
            # Fallback: end after min_turns if no AI
            return len(self.turns) >= self.min_turns

        current_turn = self.turns[-1]
        if not current_turn.user_response or not current_turn.analysis:
            return False

        # Check analysis for completion signals
        analysis = current_turn.analysis

        # Check for explicit ending signals
        ending_signals = [
            "story_complete",
            "nothing_more_to_add",
            "comprehensive_answer",
        ]

        if any(signal in analysis.get("signals", []) for signal in ending_signals):
            logger.info("Detected story completion signal")
            return True

        # Check story depth score
        depth_score = analysis.get("story_depth", 0)
        if depth_score >= 8 and len(self.turns) >= self.min_turns:
            logger.info(f"Story depth sufficient ({depth_score}/10)")
            return True

        return False

    def _generate_opening_question(
        self,
        personal_context: str | None,
        thoughts_context: str | None = None,
        thoughts_for_question: list[dict] | None = None,
    ) -> str:
        """
        Generate the opening question for the chapter.

        If the user has shared quick thoughts relevant to this chapter,
        we'll generate a personalized question that references their thoughts.
        This makes the interview feel more connected and personal.

        Args:
            personal_context: General personal context from journey
            thoughts_context: Formatted context from quick thoughts
            thoughts_for_question: Raw thought data for specialized generation
        """
        if not settings.openai_api_key:
            return self._fallback_opening_question()

        # If we have relevant quick thoughts, try to generate a thought-based question
        if thoughts_for_question:
            try:
                thought_question = generate_thought_based_question(
                    thoughts_for_question,
                    self.chapter_id
                )
                if thought_question:
                    logger.info("Using thought-based opening question")
                    return thought_question
            except Exception as e:
                logger.warning(f"Failed to generate thought-based question: {e}")
                # Fall through to standard question generation

        try:
            client = OpenAI(
                api_key=settings.openai_api_key,
                base_url=settings.openai_api_base,
            )

            system_prompt = get_system_prompt(self.chapter_id, personal_context)

            # Enhance user prompt with thoughts context if available
            user_prompt = "Genereer een warme, uitnodigende openingsvraag voor dit hoofdstuk."

            if thoughts_context:
                user_prompt = f"""De gebruiker heeft eerder deze gedachten gedeeld die relevant zijn voor dit hoofdstuk:

{thoughts_context}

Genereer een warme, uitnodigende openingsvraag die:
1. Subtiel refereert aan iets dat ze eerder deelden (als relevant)
2. Uitnodigt om dieper in te gaan op dit thema
3. Niet letterlijk hun woorden herhaalt, maar laat merken dat je ze 'gehoord' hebt
4. Maximaal 1-2 zinnen is

Als de gedachten niet direct relevant zijn voor dit hoofdstuk, genereer dan gewoon een normale openingsvraag."""

            response = client.chat.completions.create(
                model=settings.openai_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.8,
                max_tokens=100,
                extra_headers={
                    "HTTP-Referer": settings.openrouter_app_url or "http://localhost",
                    "X-Title": settings.openrouter_app_name,
                }
            )

            raw_question = response.choices[0].message.content.strip()
            return clean_ai_question(raw_question)

        except Exception as e:
            logger.error(f"Failed to generate opening question: {e}")
            return self._fallback_opening_question()

    def _fallback_opening_question(self) -> str:
        """Fallback opening question when AI unavailable."""
        ctx = CHAPTER_CONTEXTS.get(self.chapter_id)
        if ctx and ctx.get("example_prompts"):
            return ctx["example_prompts"][0]
        return "Vertel eens over dit deel van je leven."

    def _analyze_response_with_ai(self, response_text: str) -> dict:
        """
        Analyze user's response with Claude for deep understanding.

        This is a MAJOR upgrade from keyword matching - we use Claude
        to understand nuance, emotion, themes, and story completeness.
        """
        if not settings.openai_api_key:
            return self._fallback_analysis(response_text)

        try:
            client = OpenAI(
                api_key=settings.openai_api_key,
                base_url=settings.openai_api_base,
            )

            analysis_prompt = f"""Analyseer dit transcript van een levensverhaal interview.

**Transcript:**
{response_text}

**Analyseer:**
1. **Emoties**: Welke emoties zijn aanwezig? (blijdschap, verdriet, nostalgie, spijt, trots, etc.)
2. **Personen**: Welke specifieke mensen worden genoemd? (namen, relaties)
3. **Plaatsen**: Welke locaties komen voor?
4. **Thema's**: Welke levenslessen of patronen zie je?
5. **Details**: Welke specifieke details of anekdotes zijn interessant om op door te vragen?
6. **Story Depth**: Op schaal 1-10, hoe compleet voelt dit verhaal? (1=oppervlakkig, 10=diepgaand en compleet)
7. **Follow-up Topics**: Wat zijn 3 specifieke dingen waar je op door zou kunnen vragen?
8. **Signals**: Geeft de gebruiker signalen dat ze klaar zijn? (bijv. "dat was het eigenlijk", "meer weet ik niet")

Geef het antwoord in dit JSON formaat:
{{
    "emotions": ["emotie1", "emotie2"],
    "people": ["persoon1", "persoon2"],
    "places": ["plaats1", "plaats2"],
    "themes": ["thema1", "thema2"],
    "interesting_details": ["detail1", "detail2", "detail3"],
    "story_depth": 7,
    "follow_up_topics": ["topic1", "topic2", "topic3"],
    "signals": ["signal1"]
}}"""

            response = client.chat.completions.create(
                model=settings.openai_model,
                messages=[
                    {"role": "system", "content": "Je bent een expert in het analyseren van persoonlijke verhalen en interviews. Geef altijd valid JSON terug."},
                    {"role": "user", "content": analysis_prompt}
                ],
                temperature=0.3,  # Lower temp for analysis
                max_tokens=500,
                extra_headers={
                    "HTTP-Referer": settings.openrouter_app_url or "http://localhost",
                    "X-Title": settings.openrouter_app_name,
                }
            )

            # Parse JSON response
            import json
            analysis_text = response.choices[0].message.content.strip()

            # Extract JSON from markdown code blocks if present
            if "```json" in analysis_text:
                analysis_text = analysis_text.split("```json")[1].split("```")[0].strip()
            elif "```" in analysis_text:
                analysis_text = analysis_text.split("```")[1].split("```")[0].strip()

            analysis = json.loads(analysis_text)
            logger.info(f"AI analysis complete. Story depth: {analysis.get('story_depth', 0)}/10")
            return analysis

        except Exception as e:
            logger.error(f"Failed to analyze response with AI: {e}")
            return self._fallback_analysis(response_text)

    def _fallback_analysis(self, response_text: str) -> dict:
        """Fallback analysis using keywords when AI unavailable."""
        return {
            "emotions": [],
            "people": [],
            "places": [],
            "themes": [],
            "interesting_details": [],
            "story_depth": 5,  # Assume mid-depth
            "follow_up_topics": [],
            "signals": [],
        }

    def _generate_intelligent_follow_up(self) -> str:
        """
        Generate a highly intelligent follow-up question.

        This is what makes it world-class - the AI reads between the lines,
        picks up on interesting details, and asks naturally flowing questions.
        """
        if not settings.openai_api_key:
            return self._fallback_follow_up()

        current_turn = self.turns[-1]
        analysis = current_turn.analysis or {}

        # Build conversation history
        history = self._build_conversation_history()

        try:
            client = OpenAI(
                api_key=settings.openai_api_key,
                base_url=settings.openai_api_base,
            )

            ctx = CHAPTER_CONTEXTS.get(self.chapter_id, {})

            follow_up_prompt = f"""Je bent een wereldklasse interviewer. Je hebt zojuist een verhaal gehoord en wilt nu een natuurlijke, empathische vervolgvraag stellen.

**Hoofdstuk:** {ctx.get('title', 'Levensverhaal')}
**Stemming:** {ctx.get('mood', 'reflectief')}

**Conversatie tot nu toe:**
{history}

**Analyse van laatste antwoord:**
- Emoties gedetecteerd: {', '.join(analysis.get('emotions', [])) or 'geen specifieke'}
- Personen genoemd: {', '.join(analysis.get('people', [])) or 'geen'}
- Interessante details: {', '.join(analysis.get('interesting_details', [])[:3]) or 'geen'}
- Mogelijke follow-up topics: {', '.join(analysis.get('follow_up_topics', [])[:3]) or 'geen'}

**Je taak:**
Genereer ÉÉN vervolgvraag die:
1. Natuurlijk aansluit op wat de gebruiker net vertelde
2. Verwijst naar een SPECIFIEK detail dat ze noemden (naam, plaats, moment)
3. Vraagt naar diepere betekenis, emotie of context
4. Voelt als een echt gesprek, niet als een interview
5. Maximaal 15-20 woorden

**Voorbeelden van sterke vervolgvragen:**
- "Je noemde je oma's keuken - wat voor geur hing daar altijd?"
- "Dat moment met je vader klinkt belangrijk, hoe voelde dat voor je?"
- "Amsterdam zei je, welk deel van de stad bedoel je precies?"
- "Je stem verandert als je over haar praat, wat maakt deze herinnering zo speciaal?"

**Regels:**
- Begin NOOIT met "Kun je" of "Wil je" - gebruik directe vorm
- Gebruik je/jij/jouw
- Wees specifiek, niet algemeen
- Toon echte nieuwsgierigheid

Genereer nu één vervolgvraag:"""

            response = client.chat.completions.create(
                model=settings.openai_model,
                messages=[
                    {"role": "system", "content": "Je bent een empathische interviewer die natuurlijke gesprekken voert. Je stelt vragen alsof je een goede vriend bent die oprecht geïnteresseerd is."},
                    {"role": "user", "content": follow_up_prompt}
                ],
                temperature=0.75,
                max_tokens=80,
                extra_headers={
                    "HTTP-Referer": settings.openrouter_app_url or "http://localhost",
                    "X-Title": settings.openrouter_app_name,
                }
            )

            raw_question = response.choices[0].message.content.strip()
            question = clean_ai_question(raw_question)

            logger.info(f"Generated intelligent follow-up: {question[:50]}...")
            return question

        except Exception as e:
            logger.error(f"Failed to generate follow-up: {e}")
            return self._fallback_follow_up()

    def _fallback_follow_up(self) -> str:
        """Fallback follow-up when AI unavailable."""
        generic_follow_ups = [
            "Vertel daar eens wat meer over.",
            "Hoe voelde dat voor je?",
            "Wat maakte dat moment zo bijzonder?",
            "Kun je dat wat meer beschrijven?",
        ]

        import random
        return random.choice(generic_follow_ups)

    def _build_conversation_history(self) -> str:
        """Build a formatted conversation history for context."""
        lines = []
        for turn in self.turns:
            lines.append(f"Vraag {turn.turn_number}: {turn.question}")
            if turn.user_response:
                # Truncate long responses
                response = turn.user_response
                if len(response) > 200:
                    response = response[:200] + "..."
                lines.append(f"Antwoord: {response}")

        return "\n".join(lines)

    def get_conversation_summary(self) -> dict:
        """Get a summary of the conversation for logging/display."""
        return {
            "total_turns": len(self.turns),
            "completed": self.should_end_conversation(),
            "story_depth": self.turns[-1].analysis.get("story_depth", 0) if self.turns and self.turns[-1].analysis else 0,
            "key_themes": list(set(
                theme
                for turn in self.turns
                if turn.analysis
                for theme in turn.analysis.get("themes", [])
            ))[:5],
            "people_mentioned": list(set(
                person
                for turn in self.turns
                if turn.analysis
                for person in turn.analysis.get("people", [])
            ))[:10],
        }


# =============================================================================
# Conversation Manager - Handles session lifecycle
# =============================================================================

_active_conversations: dict[str, ConversationSession] = {}


def start_conversation_session(
    db: Session,
    journey_id: str,
    chapter_id: ChapterId,
    asset_id: str,
) -> tuple[str, str]:
    """
    Start a new conversation session.

    Args:
        db: Database session
        journey_id: Journey ID
        chapter_id: Chapter being recorded
        asset_id: Media asset ID

    Returns:
        Tuple of (session_id, opening_question)
    """
    session_id = f"{asset_id}:{datetime.now(timezone.utc).isoformat()}"

    conversation = ConversationSession(
        db=db,
        journey_id=journey_id,
        chapter_id=chapter_id,
        asset_id=asset_id,
    )

    opening_question = conversation.start_conversation()

    _active_conversations[session_id] = conversation

    logger.info(f"Started conversation session {session_id}")
    return session_id, opening_question


def add_response_to_conversation(
    session_id: str,
    response_text: str,
) -> Optional[str]:
    """
    Add user response and get next question.

    Args:
        session_id: Active conversation session ID
        response_text: User's response transcript

    Returns:
        Next question, or None if conversation complete
    """
    conversation = _active_conversations.get(session_id)
    if not conversation:
        logger.warning(f"No active conversation for session {session_id}")
        return None

    conversation.add_user_response(response_text)
    next_question = conversation.generate_next_question()

    if next_question is None:
        # Conversation complete
        summary = conversation.get_conversation_summary()
        logger.info(f"Conversation complete: {summary}")
        # Clean up
        del _active_conversations[session_id]

    return next_question


def end_conversation_session(session_id: str) -> dict:
    """
    End conversation session and get summary.

    Args:
        session_id: Conversation session ID

    Returns:
        Conversation summary
    """
    conversation = _active_conversations.get(session_id)
    if not conversation:
        return {}

    summary = conversation.get_conversation_summary()
    del _active_conversations[session_id]

    logger.info(f"Ended conversation session {session_id}")
    return summary
