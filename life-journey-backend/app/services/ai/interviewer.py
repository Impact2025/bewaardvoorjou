"""
AI Interviewer Service - Generates empathetic prompts for life story recording
Uses OpenRouter (Claude) for high-quality, context-aware questions

Features:
- Context-aware prompting based on user's journey history
- Personalized questions using extracted themes and key people
- Follow-up engine for deeper conversations
"""
from typing import Iterable, Optional
from openai import OpenAI
from loguru import logger
from sqlalchemy.orm import Session

from app.schemas.common import ChapterId
from app.core.config import settings
from app.services.ai.memory import get_personalized_prompt_context, build_journey_memory


# Chapter-specific context and themes - Updated for new 5-phase structure
CHAPTER_CONTEXTS = {
    # Fase 1: Voorbereiding & Introductie
    ChapterId.intro_reflection: {
        "title": "Kernwoorden van je leven",
        "theme": "Als je jouw leven tot nu toe zou moeten beschrijven in één alinea, welke kernwoorden en gevoelens zouden daarin dan centraal staan?",
        "mood": "reflectief en samenvattend",
        "example_prompts": [
            "Welke drie woorden beschrijven jouw levensreis het beste?",
            "Welk gevoel komt steeds terug in je levensverhaal?",
            "Hoe zou je je leven in één zin samenvatten?"
        ]
    },
    ChapterId.intro_intention: {
        "title": "Je intentie",
        "theme": "Waarom ben je begonnen aan dit project om jouw levensverhaal vast te leggen? Wat hoop je hiermee te bereiken, of voor wie doe je het?",
        "mood": "warm en doelbewust",
        "example_prompts": [
            "Voor wie leg je dit verhaal vast?",
            "Wat hoop je dat mensen uit jouw verhaal meenemen?",
            "Waarom is het belangrijk voor jou om dit nu vast te leggen?"
        ]
    },
    ChapterId.intro_uniqueness: {
        "title": "Wat maakt jou uniek",
        "theme": "Beschrijf drie dingen die jou uniek maken en die je absoluut in je levensverhaal wilt opnemen.",
        "mood": "celebratief en persoonlijk",
        "example_prompts": [
            "Wat maakt jou anders dan anderen?",
            "Welke eigenschap of ervaring is typisch voor jou?",
            "Waar ben je het meest trots op over jezelf?"
        ]
    },

    # Fase 2: De Vroege Jaren & Jeugd
    ChapterId.youth_favorite_place: {
        "title": "Je favoriete plek",
        "theme": "Neem ons mee naar je favoriete plek uit je kindertijd. Beschrijf wat je daar zag, hoorde, rook en voelde.",
        "mood": "nostalgisch en zintuiglijk",
        "example_prompts": [
            "Welke plek uit je jeugd mis je het meest?",
            "Beschrijf de geur die je terugbrengt naar je kindertijd",
            "Waar voelde je je als kind het meest gelukkig?"
        ]
    },
    ChapterId.youth_sounds: {
        "title": "Het geluid van toen",
        "theme": "Welk geluid associeer je het meest met je jeugd? Vertel een korte anekdote die bij dit geluid hoort.",
        "mood": "speels en zintuiglijk",
        "example_prompts": [
            "Welk geluid brengt je meteen terug naar je kindertijd?",
            "Wat hoorde je 's ochtends als je wakker werd?",
            "Welk geluid zul je nooit vergeten uit je jeugd?"
        ]
    },
    ChapterId.youth_hero: {
        "title": "Je held",
        "theme": "Wie was jouw grootste held of rolmodel toen je jong was, en welke invloed heeft die persoon gehad op wie je nu bent?",
        "mood": "bewonderend en reflectief",
        "example_prompts": [
            "Wie keek je als kind enorm tegen aan?",
            "Welke eigenschappen van je held heb je overgenomen?",
            "Wie wilde je worden toen je opgroeide?"
        ]
    },

    # Fase 3: Liefde, Relaties & Vriendschappen
    ChapterId.love_connection: {
        "title": "Het moment van verbinding",
        "theme": "Beschrijf het moment waarop je wist dat je verliefd was, of een heel speciale connectie voelde met iemand.",
        "mood": "teder en emotioneel",
        "example_prompts": [
            "Wanneer wist je dat dit iemand bijzonders was?",
            "Beschrijf het moment waarop je verliefd werd",
            "Wat was het eerste dat je voelde bij deze persoon?"
        ]
    },
    ChapterId.love_lessons: {
        "title": "Lessen over liefde",
        "theme": "Welke drie lessen heb je geleerd over liefde of vriendschap die je zou willen doorgeven aan toekomstige generaties?",
        "mood": "wijs en doordacht",
        "example_prompts": [
            "Wat heb je geleerd over ware vriendschap?",
            "Welke les over liefde kostte je de meeste tijd om te leren?",
            "Wat zou je jonge mensen over relaties willen vertellen?"
        ]
    },
    ChapterId.love_symbol: {
        "title": "Een symbolisch voorwerp",
        "theme": "Kies een voorwerp dat symbool staat voor een belangrijke relatie of vriendschap in je leven. Laat het zien en vertel het verhaal erachter.",
        "mood": "betekenisvol en persoonlijk",
        "example_prompts": [
            "Welk voorwerp herinnert je aan een dierbare?",
            "Wat heb je bewaard van een belangrijke relatie?",
            "Welk object vertelt het verhaal van een vriendschap?"
        ]
    },

    # Fase 4: Werk, Carrière & Passies
    ChapterId.work_dream_job: {
        "title": "Droom versus realiteit",
        "theme": "Wat was je droombaan als kind en hoe verhoudt zich dat tot wat je uiteindelijk bent gaan doen?",
        "mood": "reflectief en soms humoristisch",
        "example_prompts": [
            "Wat wilde je worden toen je klein was?",
            "Hoe kijk je nu terug op je kinderdroom?",
            "Welke droom heb je uiteindelijk wel waargemaakt?"
        ]
    },
    ChapterId.work_passion: {
        "title": "Je grootste passie",
        "theme": "Laat ons iets zien dat jouw grootste passie buiten werk vertegenwoordigt. Vertel waarom dit je zo boeit.",
        "mood": "enthousiast en gepassioneerd",
        "example_prompts": [
            "Waar word je het meest enthousiast van?",
            "Wat zou je doen als geld geen rol speelde?",
            "Welke hobby of activiteit geeft je de meeste energie?"
        ]
    },
    ChapterId.work_challenge: {
        "title": "Een overwonnen uitdaging",
        "theme": "Beschrijf een moment waarop je een grote professionele uitdaging hebt overwonnen. Wat was die uitdaging en welke impact had het op je?",
        "mood": "triomfantelijk en leerzaam",
        "example_prompts": [
            "Welke professionele hindernis leek onmogelijk, maar heb je overwonnen?",
            "Wanneer voelde je je het sterkst in je werk?",
            "Welke uitdaging maakte je sterker als professional?"
        ]
    },

    # Fase 5: Levenslessen & Toekomstdromen
    ChapterId.future_message: {
        "title": "Een boodschap voor later",
        "theme": "Als je één boodschap of levensles zou mogen meegeven aan jezelf van 20 jaar geleden, of aan je nakomelingen, wat zou dat dan zijn en waarom?",
        "mood": "wijs en heartfelt",
        "example_prompts": [
            "Wat zou je je jongere zelf willen vertellen?",
            "Welke boodschap wil je achterlaten voor je kleinkinderen?",
            "Welke waarheid heb je te laat geleerd?"
        ]
    },
    ChapterId.future_dream: {
        "title": "Een onvervulde droom",
        "theme": "Welke droom of aspiratie koester je nog steeds, ongeacht leeftijd of omstandigheden? Wat maakt deze droom zo krachtig voor je?",
        "mood": "hoopvol en open",
        "example_prompts": [
            "Wat wil je nog steeds bereiken in je leven?",
            "Welke droom houd je al jaren vast?",
            "Wat zou je nog graag willen meemaken?"
        ]
    },
    ChapterId.future_gratitude: {
        "title": "Dankbaarheid",
        "theme": "Beschrijf drie dingen waar je het meest dankbaar voor bent in je leven. Waarom zijn deze zo belangrijk voor je?",
        "mood": "dankbaar en positief",
        "example_prompts": [
            "Waar ben je het meest dankbaar voor?",
            "Welke zegen tel je elke dag?",
            "Wat zou je niet willen missen in je leven?"
        ]
    },

    # Bonus: Aanvullende Vragen
    ChapterId.bonus_funny: {
        "title": "Het grappigste moment",
        "theme": "Wat is het grappigste of meest onverwachte moment in je leven geweest?",
        "mood": "speels en luchtig",
        "example_prompts": [
            "Wanneer heb je het hardst gelachen?",
            "Wat is het meest absurde dat je hebt meegemaakt?",
            "Welk grappig moment vergeet je nooit?"
        ]
    },
    ChapterId.bonus_relive: {
        "title": "Een dag opnieuw",
        "theme": "Als je één dag opnieuw zou kunnen beleven, welke dag zou dat zijn en waarom?",
        "mood": "nostalgisch en betekenisvol",
        "example_prompts": [
            "Welke dag zou je opnieuw willen beleven?",
            "Wat was de perfecte dag in je leven?",
            "Welk moment zou je willen vastzetten in de tijd?"
        ]
    },
    ChapterId.bonus_culture: {
        "title": "Culturele invloeden",
        "theme": "Welke culturele invloed (muziek, kunst, boeken, film) heeft jou het meest gevormd?",
        "mood": "cultureel en reflectief",
        "example_prompts": [
            "Welk boek of film heeft je leven veranderd?",
            "Welke muziek of kunst raakte je het diepst?",
            "Welke kunstenaar of artiest heeft je gevormd?"
        ]
    },

    # De Verborgen Dimensies: Categorie 1 - Gewoonten, Rituelen en Het Dagelijks Leven
    ChapterId.deep_daily_ritual: {
        "title": "Je essentiële ritueel",
        "theme": "Welk alledaags ritueel (bijv. ochtendkoffie, de avondwandeling) zou je het meest missen als je het niet meer kon doen? Beschrijf de stappen en de exacte gemoedstoestand die dit ritueel je geeft.",
        "mood": "reflectief en gedetailleerd",
        "example_prompts": [
            "Welk dagelijks ritueel zou je het meest missen?",
            "Beschrijf de stappen van je belangrijkste dagelijkse routine.",
            "Welk moment in je dag geeft je de meeste rust?"
        ]
    },
    ChapterId.deep_favorite_time: {
        "title": "Je favoriete uur",
        "theme": "Neem ons mee naar je favoriete tijdstip van de dag. Waarom is dit uur zo speciaal voor jou? Welk geluid, welke lichtval of welke stilte kenmerkt dit moment?",
        "mood": "zacht en zintuiglijk",
        "example_prompts": [
            "Wat is je favoriete tijdstip van de dag en waarom?",
            "Welke geluiden horen bij je favoriete moment?",
            "Beschrijf de lichtval van je meest geliefde uur."
        ]
    },
    ChapterId.deep_ugly_object: {
        "title": "Een onlogisch geliefd voorwerp",
        "theme": "Laat ons een voorwerp zien dat jij mooi vindt of belangrijk vindt, maar dat andere mensen misschien 'lelijk' of 'waardeloos' zouden noemen. Waarom koester je dit?",
        "mood": "speels en persoonlijk",
        "example_prompts": [
            "Welk 'lelijk' voorwerp koester je toch?",
            "Wat maakt dit onpraktische ding zo waardevol voor jou?",
            "Toon ons iets dat alleen jij begrijpt."
        ]
    },

    # De Verborgen Dimensies: Categorie 2 - De Vreemde en Onverklaarbare Herinneringen
    ChapterId.deep_near_death: {
        "title": "Een confrontatie met sterfelijkheid",
        "theme": "Beschrijf een moment waarop je echt dacht dat je kon sterven, of een situatie waarin je je eigen sterfelijkheid voelde. Hoe voelde dat en wat deed het met je?",
        "mood": "kwetsbaar en diep",
        "example_prompts": [
            "Wanneer voelde je je sterfelijkheid het meest?",
            "Beschrijf een moment waarin je dacht dat het voorbij was.",
            "Hoe veranderde een levensbedreigende situatie jouw perspectief?"
        ]
    },
    ChapterId.deep_misconception: {
        "title": "Een verkeerde inschatting",
        "theme": "Vertel over iemand of iets dat je volledig verkeerd hebt ingeschat. Wat dacht je, en hoe was de werkelijkheid? Wat leerde je hiervan?",
        "mood": "beschouwend en leerzaam",
        "example_prompts": [
            "Wie of wat heb je het meest verkeerd ingeschat?",
            "Wanneer bleek je vooroordeel compleet onjuist?",
            "Welke verkeerde inschatting veranderde jouw denken?"
        ]
    },
    ChapterId.deep_recurring_dream: {
        "title": "Een terugkerende droom of nachtmerrie",
        "theme": "Beschrijf een droom of nachtmerrie die je keer op keer hebt gehad. Wat gebeurt erin, en heb je enig idee waar deze vandaan komt?",
        "mood": "mysterieus en introspectief",
        "example_prompts": [
            "Welke droom blijft terugkomen in je slaap?",
            "Beschrijf een nachtmerrie die je nooit vergeet.",
            "Wat symboliseert jouw terugkerende droom volgens jou?"
        ]
    },

    # De Verborgen Dimensies: Categorie 3 - De Relatie tot Tijd, Geld en Keuzes
    ChapterId.deep_life_chapters: {
        "title": "De hoofdstukken van je leven",
        "theme": "Als je je leven zou verdelen in hoofdstukken (bijv. kindertijd, studententijd, etc.), welke hoofdstuktitel zou je aan elk deel geven? Waarom die titels?",
        "mood": "overzichtelijk en zingevend",
        "example_prompts": [
            "In welke hoofdstukken verdeel jij je leven?",
            "Geef elk levensfase een treffende titel.",
            "Welk hoofdstuk van je leven was het meest bepalend?"
        ]
    },
    ChapterId.deep_intuition_choice: {
        "title": "Een keuze op gevoel",
        "theme": "Vertel over een belangrijke keuze die je hebt gemaakt puur op intuïtie, terwijl het logisch gezien misschien geen goede beslissing leek. Wat gebeurde er?",
        "mood": "avontuurlijk en vertrouwend",
        "example_prompts": [
            "Welke intuïtieve keuze bleek onverwacht goed?",
            "Wanneer negeerde je de logica en volgde je je gevoel?",
            "Beschrijf een moment waarop je innerlijke stem gelijk had."
        ]
    },
    ChapterId.deep_money_impact: {
        "title": "Geld en geluk",
        "theme": "Vertel over een moment waarop je ontdekte dat geld wél of juist níet gelukkig maakte. Wat was de context en wat deed het met je kijk op materiële zaken?",
        "mood": "eerlijk en filosofisch",
        "example_prompts": [
            "Wanneer ontdekte je de waarde (of waardeloosheid) van geld?",
            "Beschrijf een moment waarin geld je geluk beïnvloedde.",
            "Wat leerde een financiële ervaring je over wat echt telt?"
        ]
    },

    # De Verborgen Dimensies: Categorie 4 - Zelfreflectie en de Onbekende Toekomst
    ChapterId.deep_shadow_side: {
        "title": "Je schaduwzijde",
        "theme": "Wat is een eigenschap of een deel van jouzelf waar je niet trots op bent, maar die wel onderdeel is van wie je bent? Hoe ga je daarmee om?",
        "mood": "moedig en authentiek",
        "example_prompts": [
            "Welk deel van jezelf accepteer je met tegenzin?",
            "Beschrijf een eigenschap waar je niet trots op bent.",
            "Hoe ga je om met je eigen schaduwkanten?"
        ]
    },
    ChapterId.deep_life_meal: {
        "title": "De maaltijd van je leven",
        "theme": "Als je één maaltijd zou mogen kiezen die je leven symboliseert (met bepaalde gerechten, mensen, sfeer), hoe zou die eruitzien en waarom?",
        "mood": "creatief en symbolisch",
        "example_prompts": [
            "Welke maaltijd symboliseert jouw leven?",
            "Met wie zou je aan je levensmaaltijd zitten?",
            "Welke gerechten vertegenwoordigen jouw levensfasen?"
        ]
    },
    ChapterId.deep_statue: {
        "title": "Jouw standbeeld",
        "theme": "Stel, er wordt een standbeeld van jou gemaakt na je dood. In welke houding zou je staan, wat zou je vasthouden of doen, en welke quote zou op het voetstuk staan?",
        "mood": "speculatief en betekenisvol",
        "example_prompts": [
            "In welke houding zou jouw standbeeld staan?",
            "Wat zou je vasthouden in je eigen monument?",
            "Welke quote zou op jouw voetstuk prijken?"
        ]
    }
}


def get_system_prompt(chapter: ChapterId, personal_context: str | None = None) -> str:
    """
    Get the system prompt for Claude based on the chapter context.

    Args:
        chapter: The chapter being recorded
        personal_context: Personalized context from user's journey history

    Returns:
        System prompt for Claude
    """
    ctx = CHAPTER_CONTEXTS.get(chapter)
    if not ctx:
        return "Je bent een professionele en empathische interviewer die mensen helpt hun levensverhaal authentiek en diepgaand vast te leggen."

    # Build personalization section if we have context
    personalization = ""
    if personal_context:
        personalization = f"""
**Persoonlijke context van deze gebruiker:**
{personal_context}

Gebruik deze context om je vragen te personaliseren. Verwijs subtiel naar genoemde personen, plaatsen of thema's waar relevant."""

    return f"""Je bent een professionele, empathische interviewer gespecialiseerd in levensverhalenprojecten. Je helpt deelnemers hun verhaal op een veilige, respectvolle en diepgaande manier te delen.

**Hoofdstuk:** "{ctx['title']}"
**Context:** {ctx['theme']}
**Stemming:** {ctx['mood']}
{personalization}

**Je rol:**
- Je creëert een veilige, niet-oordelende ruimte waarin mensen zich vrij voelen om persoonlijke verhalen te delen
- Je stelt vragen die zowel toegankelijk als diepgaand zijn
- Je respecteert grenzen en houdt rekening met gevoelige onderwerpen
- Je bent authentiek geïnteresseerd in de unieke ervaring van elk individu
- Je maakt verbindingen met wat de gebruiker eerder heeft gedeeld (indien beschikbaar)

**Richtlijnen voor deze vraag:**
- Stel ÉÉN concrete, open vraag (max 15-20 woorden)
- Gebruik warme, uitnodigende bewoordingen
- Vraag naar specifieke herinneringen, zintuiglijke details, of emoties
- Vermijd abstract taalgebruik en clichés
- Gebruik informeel Nederlands (je/jij/jouw)
- De vraag moet uitnodigen tot reflectie, niet tot een simpel ja/nee antwoord
- Laat ruimte voor persoonlijke interpretatie
- Als er persoonlijke context is, gebruik die om de vraag persoonlijker te maken

**Voorbeelden van sterke vragen voor dit hoofdstuk:**
{chr(10).join('- ' + p for p in ctx['example_prompts'])}

Genereer nu één nieuwe, unieke vraag die authentieke verhalen oproept en past bij de context en stemming van dit hoofdstuk."""


def build_prompt_with_ai(
    chapter: ChapterId,
    follow_up_history: Iterable[str],
    previous_context: str | None = None,
    db: Session | None = None,
    journey_id: str | None = None,
) -> str:
    """
    Generate an empathetic interview prompt using Claude via OpenRouter.

    This function now supports context-aware prompting by leveraging the
    user's journey history to personalize questions.

    Args:
        chapter: The chapter ID to generate a prompt for
        follow_up_history: Previous prompts for this chapter (for variety)
        previous_context: Optional context from previous completed chapters
        db: Optional database session for fetching journey memory
        journey_id: Optional journey ID for personalized context

    Returns:
        A single, thoughtful interview question
    """
    # Check if API key is configured
    if not settings.openai_api_key:
        logger.warning("OpenAI/OpenRouter API key not configured, using fallback prompts")
        return build_prompt_fallback(chapter, follow_up_history)

    # Get personalized context from journey memory
    personal_context = None
    if db and journey_id:
        try:
            personal_context = get_personalized_prompt_context(db, journey_id, chapter)
            if personal_context:
                logger.debug(f"Using personalized context for journey {journey_id}")
        except Exception as e:
            logger.warning(f"Failed to get personalized context: {e}")

    try:
        # Initialize OpenAI client (works with OpenRouter too)
        client = OpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_api_base,
        )

        # Build context from follow-up history
        history_context = ""
        if follow_up_history:
            history_list = list(follow_up_history)
            if history_list:
                history_context = f"\n\nEerdere vragen die al gesteld zijn (varieer hiervan):\n" + "\n".join(f"- {q}" for q in history_list[-3:])  # Last 3 for context

        # Add previous chapters context if available (legacy support)
        context_info = ""
        if previous_context:
            context_info = f"\n\nContext: {previous_context}"

        # Call Claude via OpenRouter
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {
                    "role": "system",
                    "content": get_system_prompt(chapter, personal_context)
                },
                {
                    "role": "user",
                    "content": f"Genereer een nieuwe, unieke vraag voor dit hoofdstuk.{history_context}{context_info}"
                }
            ],
            temperature=0.8,
            max_tokens=100,
            extra_headers={
                "HTTP-Referer": settings.openrouter_app_url if settings.openrouter_app_url else "http://localhost",
                "X-Title": settings.openrouter_app_name,
            }
        )

        prompt = response.choices[0].message.content.strip()

        # Clean up the prompt (remove quotes, extra whitespace)
        prompt = prompt.strip('"').strip("'").strip()

        logger.info(f"Generated AI prompt for chapter {chapter}: {prompt[:50]}...")
        return prompt

    except Exception as e:
        logger.error(f"Failed to generate AI prompt: {e}")
        logger.info("Falling back to predefined prompts")
        return build_prompt_fallback(chapter, follow_up_history)


def build_prompt_fallback(chapter: ChapterId, follow_up_history: Iterable[str]) -> str:
    """Fallback prompts when AI is not available"""
    ctx = CHAPTER_CONTEXTS.get(chapter)
    if not ctx:
        return "Vertel eens over een moment dat je nog niemand hebt toevertrouwd."

    # Use example prompts from the chapter context
    history_list = list(follow_up_history)
    available_prompts = [p for p in ctx["example_prompts"] if p not in history_list]

    if available_prompts:
        return available_prompts[0]

    # If all examples have been used, return a generic one
    return f"Vertel nog eens over een bijzonder moment uit je {ctx['title'].lower()}."


# Backwards compatibility
def build_prompt(
    chapter: ChapterId,
    follow_up_history: Iterable[str],
    previous_context: str | None = None,
    db: Session | None = None,
    journey_id: str | None = None,
) -> str:
    """Alias for build_prompt_with_ai for backwards compatibility"""
    return build_prompt_with_ai(chapter, follow_up_history, previous_context, db, journey_id)


# =============================================================================
# Follow-Up Engine: Generates deeper, context-aware follow-up questions
# =============================================================================


def generate_follow_up(
    db: Session,
    journey_id: str,
    chapter: ChapterId,
    current_transcript: str,
    previous_prompts: list[str],
) -> str:
    """
    Generate an intelligent follow-up question based on the current transcript.

    This function analyzes what the user has said and generates a deeper,
    more specific follow-up question to elicit richer stories.

    Args:
        db: Database session
        journey_id: Journey ID for context
        chapter: Current chapter being recorded
        current_transcript: What the user has said so far
        previous_prompts: List of prompts already asked

    Returns:
        A personalized follow-up question
    """
    if not settings.openai_api_key:
        logger.warning("OpenAI/OpenRouter API key not configured, using fallback")
        return build_prompt_fallback(chapter, previous_prompts)

    # Get journey memory for context
    personal_context = None
    try:
        personal_context = get_personalized_prompt_context(db, journey_id, chapter)
    except Exception as e:
        logger.warning(f"Failed to get journey memory: {e}")

    ctx = CHAPTER_CONTEXTS.get(chapter, {})

    try:
        client = OpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_api_base,
        )

        # Analyze transcript for entities and themes
        analysis = analyze_transcript_for_themes(current_transcript)

        # Build personal context section
        personal_context_section = ''
        if personal_context:
            personal_context_section = f"\n**Persoonlijke context:**\n{personal_context}\n"

        # Build previous prompts section
        previous_prompts_text = '(geen)'
        if previous_prompts:
            previous_prompts_text = '\n'.join('- ' + p for p in previous_prompts[-3:])

        # Build the follow-up system prompt
        follow_up_system = f"""Je bent een empathische interviewer die diepere verhalen naar boven haalt.

**Hoofdstuk:** {ctx.get("title", "Levensverhaal")}
**Stemming:** {ctx.get("mood", "reflectief")}

**Wat de gebruiker net heeft gezegd:**
{current_transcript}
{personal_context_section}
**Geanalyseerde elementen uit het verhaal:**
- Emoties: {", ".join(analysis.get("emotions", [])) or "geen specifieke emoties gedetecteerd"}
- Personen: {", ".join(analysis.get("people", [])) or "geen specifieke personen genoemd"}
- Thema's: {", ".join(analysis.get("themes", [])) or "geen specifieke thema's gedetecteerd"}

**Je taak:**
Analyseer wat de gebruiker heeft gezegd en genereer ÉÉN diepgaande vervolgvraag die:
1. Direct verwijst naar iets specifieks dat ze noemden (Je noemde X...)
2. Vraagt naar emoties, zintuiglijke details of betekenis
3. Uitnodigt tot meer reflectie of een concreet voorbeeld
4. Nooit eerder gestelde vragen herhaalt

**Voorbeelden van sterke vervolgvragen:**
- Je noemde je oma, vertel eens meer over haar?
- Dat klinkt als een moeilijk moment, hoe voelde dat precies?
- Je sprak over Amsterdam, welke plek daar is zo speciaal voor je?

**Eerdere vragen die al gesteld zijn (varieer hiervan):**
{previous_prompts_text}

**Regels:**
- Max 15-20 woorden
- Warm en uitnodigend
- Gebruik je/jij/jouw
- Vermijd ja/nee vragen
- Begin met Je noemde of Dat klinkt voor natuurlijke flow
"""

        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": follow_up_system},
                {"role": "user", "content": "Genereer een vervolgvraag die dieper ingaat op wat de gebruiker net heeft gedeeld."}
            ],
            temperature=0.7,
            max_tokens=80,
            extra_headers={
                "HTTP-Referer": settings.openrouter_app_url if settings.openrouter_app_url else "http://localhost",
                "X-Title": settings.openrouter_app_name,
            }
        )

        prompt = response.choices[0].message.content.strip()
        prompt = prompt.strip('"').strip("'").strip()

        logger.info(f"Generated follow-up for chapter {chapter}: {prompt[:50]}...")
        return prompt

    except Exception as e:
        logger.error(f"Failed to generate follow-up: {e}")
        return build_prompt_fallback(chapter, previous_prompts)


def analyze_transcript_for_themes(
    transcript: str,
) -> dict[str, list[str]]:
    """
    Analyze a transcript to extract key themes and entities.

    This is a lightweight analysis that can be used for real-time
    context building during recording.

    Args:
        transcript: The transcript text to analyze

    Returns:
        Dictionary with extracted themes, people, places, emotions
    """
    # Dutch keywords for quick extraction
    emotion_keywords = {
        "blij": "positive", "gelukkig": "positive", "dankbaar": "positive",
        "trots": "positive", "vrolijk": "positive", "tevreden": "positive",
        "verdrietig": "somber", "moeilijk": "somber", "zwaar": "somber",
        "pijn": "somber", "verlies": "somber", "missen": "somber",
        "bang": "anxious", "zorgen": "anxious", "stress": "anxious",
        "boos": "frustrated", "gefrustreerd": "frustrated",
    }

    relationship_keywords = [
        "mama", "papa", "vader", "moeder", "opa", "oma",
        "broer", "zus", "zoon", "dochter", "partner",
        "vriend", "vriendin", "collega", "buurman", "buurvrouw"
    ]

    result = {
        "emotions": [],
        "people": [],
        "themes": [],
    }

    text_lower = transcript.lower()

    # Extract emotions
    for keyword, emotion in emotion_keywords.items():
        if keyword in text_lower and emotion not in result["emotions"]:
            result["emotions"].append(emotion)

    # Extract mentioned people
    for person in relationship_keywords:
        if person in text_lower:
            result["people"].append(person.capitalize())

    # Detect common themes
    theme_patterns = {
        "familie": ["familie", "thuis", "ouderlijk"],
        "jeugd": ["jong", "kind", "school", "speelde"],
        "werk": ["werk", "baan", "carrière", "kantoor"],
        "liefde": ["liefde", "verliefd", "relatie"],
        "verlies": ["verlies", "afscheid", "dood", "overleden"],
    }

    for theme, patterns in theme_patterns.items():
        if any(p in text_lower for p in patterns):
            result["themes"].append(theme)

    return result


def get_contextual_encouragement(emotion_type: str) -> str:
    """
    Get an appropriate encouragement based on detected emotion.

    Args:
        emotion_type: The type of emotion detected (positive, somber, etc.)

    Returns:
        An encouraging phrase appropriate for the emotional context
    """
    encouragements = {
        "positive": [
            "Wat mooi dat je dit deelt.",
            "Fijn om te horen.",
            "Dat klinkt als een bijzonder moment.",
        ],
        "somber": [
            "Dank je wel dat je dit met ons deelt.",
            "Neem gerust je tijd.",
            "Het is goed om dit te vertellen.",
        ],
        "anxious": [
            "Het is veilig om dit te delen.",
            "Neem gerust de tijd die je nodig hebt.",
        ],
        "frustrated": [
            "Ik begrijp dat dit moeilijk is.",
            "Bedankt voor je eerlijkheid.",
        ],
    }

    import random
    phrases = encouragements.get(emotion_type, ["Vertel verder..."])
    return random.choice(phrases)


# =============================================================================
# Voice Emotion Detection (v2.0 Enhancement)
# =============================================================================

def detect_voice_emotion(audio_file_path: str) -> dict[str, float]:
    """
    Analyze voice recording for emotional content using sentiment analysis.

    This is a placeholder for future implementation with audio processing APIs
    like AssemblyAI, Google Cloud Speech-to-Text, or OpenAI Whisper with emotion detection.

    Args:
        audio_file_path: Path to the audio file to analyze

    Returns:
        Dictionary with emotion scores (joy, sadness, anger, fear, neutral)
    """
    # TODO: Implement actual voice emotion detection
    # For now, return neutral scores
    logger.info(f"Voice emotion detection requested for {audio_file_path} - placeholder implementation")

    return {
        "joy": 0.0,
        "sadness": 0.0,
        "anger": 0.0,
        "fear": 0.0,
        "neutral": 1.0,
        "confidence": 0.0
    }


def get_emotion_based_follow_up(voice_emotion: dict[str, float], current_transcript: str) -> str:
    """
    Generate a follow-up question based on detected voice emotion.

    Args:
        voice_emotion: Emotion scores from voice analysis
        current_transcript: Current transcript text

    Returns:
        Emotionally-aware follow-up question
    """
    # Find dominant emotion
    dominant_emotion = max(voice_emotion.items(), key=lambda x: x[1] if x[0] != 'confidence' else 0)[0]

    emotion_follow_ups = {
        "joy": [
            "Ik hoor de blijdschap in je stem, vertel eens wat dit moment zo vrolijk maakt?",
            "Je klinkt enthousiast, welke details maken dit verhaal zo levendig?"
        ],
        "sadness": [
            "Ik hoor dat dit een emotioneel moment is, neem gerust je tijd om verder te vertellen.",
            "Dit klinkt als een belangrijk maar zwaar verhaal, wat helpt je om dit te delen?"
        ],
        "anger": [
            "Ik merk dat dit een heftig verhaal is, wat maakte je destijds zo boos?",
            "Dit klinkt als een moment van frustratie, hoe kijk je er nu op terug?"
        ],
        "fear": [
            "Ik hoor de spanning in je stem, wat maakte dat moment zo eng?",
            "Dit klinkt als een beangstigend verhaal, hoe heb je dat verwerkt?"
        ],
        "neutral": [
            "Vertel eens meer over wat dit moment voor je betekent.",
            "Welke gevoelens kwamen er bij je op tijdens dit verhaal?"
        ]
    }

    import random
    follow_ups = emotion_follow_ups.get(dominant_emotion, emotion_follow_ups["neutral"])
    return random.choice(follow_ups)


def should_allow_long_pause(voice_emotion: dict[str, float], transcript_length: int) -> bool:
    """
    Determine if long pauses should be respected based on emotional context.

    Args:
        voice_emotion: Detected voice emotions
        transcript_length: Length of current transcript

    Returns:
        True if long pauses should be allowed (emotional content)
    """
    # Allow longer pauses for emotional content
    emotional_indicators = voice_emotion.get('sadness', 0) + voice_emotion.get('anger', 0) + voice_emotion.get('fear', 0)
    return emotional_indicators > 0.3 or transcript_length < 50  # Short transcripts or emotional content
