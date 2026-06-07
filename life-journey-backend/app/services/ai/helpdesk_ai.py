"""
Helpdesk AI Service — NLU-gestuurd klantenservice systeem
Begrijpt gebruikersvragen, beantwoordt ze vanuit de kennisbank,
en escaleert naar een supportticket als de AI er niet uitkomt.
"""

import json
import logging
from typing import Optional
from openai import OpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)

# Volledige FAQ-kennisbank ingebed in het AI-systeem
FAQ_KNOWLEDGE_BASE = """
=== KENNISBANK BEWAARDVOORJOU.NL ===

OVER HET PLATFORM:
Q: Wat is BewaardVoorJou.nl precies?
A: BewaardVoorJou.nl is een digitaal platform waarmee je jouw levensverhaal op een gestructureerde, empathische manier kunt vastleggen voor toekomstige generaties. Onze AI-interviewer begeleidt je door hoofdstukken die samen jouw unieke leven vertellen.

Q: Voor wie is dit bedoeld?
A: BewaardVoorJou.nl is voor iedereen die zijn of haar levensverhaal wil bewaren — van 35 tot 85 jaar. Ideaal voor senioren die hun levenswijsheid willen doorgeven aan kinderen of kleinkinderen.

ABONNEMENT & BETALING:
Q: Is BewaardVoorJou.nl gratis?
A: Je kunt gratis starten en alle basisfuncties gebruiken. Premium pakketten zijn beschikbaar voor uitgebreide opslag en extra functies zoals familie-toegang en exportopties.

Q: Hoe zeg ik mijn abonnement op?
A: Ga naar 'Instellingen' en klik op 'Abonnement beheren'. Daar kun je je abonnement per direct of aan het einde van de betaalperiode opzeggen. Je behoudt altijd toegang tot al je opgeslagen verhalen.

Q: Hoe betaal ik? Welke betaalmethodes worden geaccepteerd?
A: We accepteren iDEAL, creditcard en PayPal. Betaling verloopt via een beveiligde betaalpagina.

PRIVACY & VEILIGHEID:
Q: Hoe veilig zijn mijn opnames en persoonlijke verhalen?
A: Jouw privacy is onze hoogste prioriteit. Alle data wordt versleuteld opgeslagen met bank-level encryptie (AES-256), zowel tijdens verzending als opslag. Alleen jij hebt toegang tot je verhalen. Onze servers staan in Europa en voldoen aan GDPR.

Q: Wie kan mijn verhalen zien?
A: Standaard ben alleen jij de eigenaar. Je kunt specifieke hoofdstukken of je hele verhaal delen met familieleden via een veilige deellink. Je hebt volledige controle en kunt toegang op elk moment intrekken.

Q: Kan ik mijn data verwijderen?
A: Ja, je kunt op elk moment alle opnames en je account permanent verwijderen vanuit de instellingen. Dit is volledig gratis en voldoet aan je rechten onder de GDPR (recht op vergetelheid). Ga naar Instellingen → Account → Account verwijderen.

ACCOUNT:
Q: Ik ben mijn wachtwoord vergeten, wat nu?
A: Ga naar de inlogpagina en klik op 'Wachtwoord vergeten'. Je ontvangt dan een e-mail met een link om een nieuw wachtwoord in te stellen. Controleer ook je spammap als de e-mail niet aankomt. Link: /auth/forgot-password

Q: Ik kan niet inloggen, wat moet ik doen?
A: Controleer of je het juiste e-mailadres gebruikt. Probeer 'Wachtwoord vergeten' als je het wachtwoord niet meer weet. Als het probleem aanhoudt, stuur ons een bericht en we helpen je snel verder.

Q: Ik heb geen bevestigingsmail ontvangen
A: Controleer je spammap of ongewenste e-mail. Als de mail er niet is, kun je vanuit de inlogpagina een nieuwe verificatiemail aanvragen. Voeg info@bewaardvoorjou.nl toe aan je contacten om e-mails zeker te ontvangen.

Q: Hoe voeg ik familieleden toe?
A: Ga naar 'Familie' in je dashboard. Klik op 'Familielid uitnodigen', voer hun e-mailadres in en stel in welke verhalen ze mogen zien. Ze ontvangen een uitnodigingsmail om toegang te krijgen.

TECHNISCH:
Q: Mijn microfoon werkt niet, wat kan ik doen?
A: Zorg dat je browser toestemming heeft voor de microfoon: klik op het slotje naast de URL-balk en zet microfoon op 'Toestaan'. Ververs daarna de pagina. Werkt het dan nog niet? Probeer Chrome of Firefox.

Q: Werkt het op mijn tablet of telefoon?
A: BewaardVoorJou.nl werkt op elke moderne browser — Chrome, Safari, Firefox, Edge. Geen app-installatie nodig. Zowel op tablet, telefoon als computer.

Q: Mijn opname is niet opgeslagen, wat nu?
A: Controleer je internetverbinding tijdens het opnemen — een onderbroken verbinding kan opslaan voorkomen. Ga naar 'Mijn Opnames' om te kijken of de opname daar staat. Als de opname echt weg is, neem dan contact op — we kijken mee.

GEBRUIK:
Q: Hoe start ik een opname?
A: Ga naar 'Hoofdstukken' in je dashboard, kies een hoofdstuk en klik op 'Start opname'. De AI-interviewer stelt je vragen en je beantwoordt die via je microfoon. Je browser vraagt eenmalig om microfoontoestemming.

Q: Kan ik mijn verhalen exporteren?
A: Ja, via 'Instellingen' kun je een volledige export aanvragen van al je data (opnames, transcripties, notities). Je ontvangt een downloadlink per e-mail. Dit voldoet aan je recht op dataportabiliteit onder de GDPR.

CONTACTGEGEVENS:
E-mail: info@bewaardvoorjou.nl
Reactietijd: Binnen 24 uur op werkdagen
"""

HELPDESK_SYSTEM_PROMPT = f"""Je bent de slimme helpdesk-assistent van BewaardVoorJou.nl — het platform waar mensen hun levensverhaal vastleggen voor toekomstige generaties.

Jouw taak is om gebruikersvragen te begrijpen en direct te beantwoorden, ook als ze spelfouten maken of omschrijvingen gebruiken.

{FAQ_KNOWLEDGE_BASE}

=== HOE JE REAGEERT ===

Beantwoord de vraag altijd direct en bondig in gewone spreektaal (Nederlands, informeel).
Gebruik de kennisbank hierboven. Als het antwoord er niet in staat, zeg dan eerlijk dat je het niet weet.

Wanneer ESCALATE = true (stuur door naar formulier):
- Accountspecifieke problemen die je niet kunt oplossen (bijv. betaling mislukt, account geblokkeerd)
- Klachten of frustratie
- Privacyverzoeken (data inzage, verwijdering)
- Problemen die je al hebt geprobeerd op te lossen maar niet werkten
- Technische storingen die de gebruiker al heeft geprobeerd te verhelpen
- Juridische of financiële kwesties

Wanneer ESCALATE = false:
- Algemene vragen over het platform
- Hoe-doe-ik-dit vragen
- FAQ-vragen die je direct kunt beantwoorden

=== OUTPUT FORMAT (ALTIJD GELDIG JSON) ===

Je antwoordt UITSLUITEND met geldig JSON in dit exacte formaat:
{{
  "message": "Jouw antwoord hier in gewone spreektaal, max 3 zinnen",
  "escalate": false,
  "suggested_questions": ["Vraag 1?", "Vraag 2?"],
  "action_links": [
    {{"label": "Knoptekst", "href": "/pad/naar/pagina"}}
  ]
}}

Regels voor action_links (maximaal 2):
- Gebruik alleen interne paden die beginnen met /
- Relevante paden: /auth/forgot-password, /dashboard, /chapters, /settings, /family, /faq, /dashboard/support
- Laat de lijst leeg ([]) als er geen relevante actieknop is

Regels voor suggested_questions (maximaal 3):
- Geef vragen die logisch volgen op de huidige vraag
- Houd ze kort en concreet
- Laat leeg ([]) als er geen goede vervolgvragen zijn

BELANGRIJK: Geef NOOIT antwoord buiten het JSON-formaat. Geen tekst voor of na de JSON.
"""


def chat_with_helpdesk(
    user_message: str,
    conversation_history: list[dict] | None = None,
    user_name: Optional[str] = None,
) -> dict:
    """
    Verwerk een helpdesk-vraag via AI en retourneer een gestructureerd antwoord.

    Args:
        user_message: De vraag van de gebruiker
        conversation_history: Eerdere berichten in dit gesprek
        user_name: Naam van de ingelogde gebruiker (optioneel, voor personalisatie)

    Returns:
        Dict met: message, escalate, suggested_questions, action_links
    """
    if not settings.openai_api_key:
        logger.warning("OpenRouter API key niet geconfigureerd voor helpdesk")
        return _fallback_response()

    try:
        client = OpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_api_base,
        )

        messages: list[dict] = [{"role": "system", "content": HELPDESK_SYSTEM_PROMPT}]

        if conversation_history:
            # Stuur maximaal de laatste 6 berichten mee (3 rondes)
            messages.extend(conversation_history[-6:])

        greeting = f" (gebruiker: {user_name})" if user_name else ""
        messages.append({"role": "user", "content": f"{user_message}{greeting}"})

        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=messages,
            temperature=0.3,  # Laag voor consistente, feitelijke antwoorden
            max_tokens=400,
            response_format={"type": "json_object"},
            extra_headers={
                "HTTP-Referer": getattr(settings, "openrouter_app_url", "https://bewaardvoorjou.nl"),
                "X-Title": "BewaardVoorJou Helpdesk",
            },
        )

        raw = response.choices[0].message.content.strip()
        parsed = json.loads(raw)

        return {
            "message": parsed.get("message", "Dat weet ik helaas niet. Ons team helpt je graag verder."),
            "escalate": bool(parsed.get("escalate", False)),
            "suggested_questions": parsed.get("suggested_questions", [])[:3],
            "action_links": parsed.get("action_links", [])[:2],
        }

    except json.JSONDecodeError as e:
        logger.error(f"Helpdesk AI returneerde ongeldige JSON: {e}")
        return _fallback_response()
    except Exception as e:
        logger.error(f"Helpdesk AI fout: {e}")
        return _fallback_response()


def _fallback_response() -> dict:
    return {
        "message": "Ik kan je vraag op dit moment helaas niet verwerken. Ons team staat voor je klaar — stuur ons een bericht en we antwoorden binnen 24 uur.",
        "escalate": True,
        "suggested_questions": [],
        "action_links": [],
    }
