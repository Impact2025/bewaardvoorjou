# CLAUDE.md — Bewaardvoorjou Project Context

> Dit bestand wordt automatisch gelezen door Claude Code. Het bevat alle context die nodig is om effectief aan dit project te werken.

## Project Overzicht

**Bewaardvoorjou** is een digitaal platform waarmee gebruikers hun levensverhaal vastleggen voor toekomstige generaties. De app begeleidt gebruikers door een empathisch, AI-gestuurd interviewproces in het Nederlands.

### Missie
Transformeren van "verhalen opnemen tool" naar **De Digitale Familiebibliotheek** — het platform waar generaties samen bouwen aan een levend familiearchief.

### Doelgroep
- Ouderen die hun levensverhaal willen bewaren
- Familiehistorici
- Mensen die herinneringen willen doorgeven aan kinderen/kleinkinderen

---

## Technologie Stack

| Component | Technologie | Versie |
|-----------|-------------|--------|
| Backend | FastAPI | Python 3.11+ |
| Frontend | Next.js | 15 |
| React | React | 19 |
| TypeScript | TypeScript | Latest |
| Database | PostgreSQL | Neon.tech |
| Styling | Tailwind CSS | 4 |
| State Management | Zustand + React Context | |
| AI Interviewer | Claude 3.5 Sonnet | via OpenRouter |
| Transcriptie | Whisper large-v3 | via OpenRouter |
| Queue | Celery + Redis | |

---

## Projectstructuur

```
D:\Memories/
├── life-journey-backend/          # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/routes/         # API Endpoints
│   │   │   ├── auth.py            # Authenticatie
│   │   │   ├── journeys.py        # Levensverhalen
│   │   │   ├── chapters.py        # Hoofdstukken
│   │   │   ├── media.py           # Audio/Video upload
│   │   │   ├── transcriptions.py  # Whisper transcripties
│   │   │   ├── highlights.py      # Emotionele highlights
│   │   │   ├── notes.py           # Notities/memo's
│   │   │   ├── sharing.py         # Deelfunctionaliteit
│   │   │   └── legacy.py          # Nalatenschap planning
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── interviewer.py # AI vraag-generatie
│   │   │   │   ├── transcriber.py # Whisper integratie
│   │   │   │   ├── highlights.py  # Emotie-detectie
│   │   │   │   └── chat.py        # Chat assistent
│   │   │   └── media/
│   │   │       └── upload.py      # S3 upload handling
│   │   ├── models/                # SQLAlchemy modellen
│   │   ├── schemas/               # Pydantic schemas
│   │   └── core/
│   │       ├── config.py          # Configuratie
│   │       ├── security.py        # JWT, Argon2
│   │       └── database.py        # DB connectie
│   ├── celery_app/                # Achtergrondtaken
│   └── tests/
│
├── life-journey-frontend/         # Next.js Frontend
│   ├── src/
│   │   ├── app/                   # App Router pages
│   │   │   ├── (auth)/            # Login/Register
│   │   │   ├── dashboard/         # Hoofdoverzicht
│   │   │   ├── chapters/[id]/     # Hoofdstuk detail
│   │   │   ├── record/            # Opname interface
│   │   │   ├── timeline/          # Visuele tijdlijn
│   │   │   ├── family/            # Familie functies
│   │   │   └── settings/          # Instellingen
│   │   ├── components/
│   │   │   ├── ui/                # Basis UI componenten
│   │   │   ├── interview/         # Interview componenten
│   │   │   ├── recorder/          # Audio/Video recorder
│   │   │   ├── timeline/          # Tijdlijn componenten
│   │   │   └── sharing/           # Deel componenten
│   │   ├── lib/
│   │   │   ├── api/               # API client
│   │   │   ├── stores/            # Zustand stores
│   │   │   └── utils/             # Hulpfuncties
│   │   └── styles/
│   └── public/
│
└── Documentation/                 # Documentatie
    ├── CLAUDE.md                  # Dit bestand
    ├── masterplan.md              # Strategisch plan
    └── api-docs/
```

---

## Huidige Functionaliteiten (v1.0)

### ✅ Werkend
1. **Gebruikersbeheer** - Registratie, login, profiel (Argon2 encryptie)
2. **18 Hoofdstukken** - Gestructureerd in 5 fasen + bonus
3. **AI Interviewer** - Claude 3.5 Sonnet, Nederlandse toon
4. **Audio/Video Opname** - Browser-based, S3 upload
5. **Transcriptie** - Whisper large-v3, Nederlands geoptimaliseerd
6. **Emotionele Highlights** - Lach, inzicht, liefde, wijsheid
7. **AI Chat Assistent** - Realtime hulp
8. **Notities** - Memo's per hoofdstuk
9. **Delen** - Deellinks met verlooptijd
10. **Legacy Planning** - Dead man's switch, tijdcapsule

### ⚠️ Beperkingen v1.0
- Individuele ervaring (geen familie-ecosysteem)
- Basis UI (functioneel maar niet emotioneel)
- Geen offline support
- Geen native apps
- Beperkte personalisatie AI

---

## Ontwikkelplan v2.0

### Fase 1: Foundation (Maand 1-4)
**Focus:** Kernervaring perfectioneren

#### Prioriteit 1: Onboarding 2.0
- [ ] Video-welkom component
- [ ] "Eerste herinnering in 60 seconden" flow
- [ ] Familiefoto upload bij start
- [ ] Intentie vastleggen ("Waarom doe je dit?")

#### Prioriteit 2: Visuele Tijdlijn
- [ ] Interactieve levensloop component
- [ ] Foto-integratie per periode
- [ ] Audio-fragmenten inline afspelen
- [ ] Responsive design (mobile-first)

#### Prioriteit 3: AI Interviewer 2.0
- [ ] Emotie-detectie in stem (sentiment analysis)
- [ ] Doorvraag-logica ("Je noemde X, vertel meer...")
- [ ] Context-awareness (herinner eerdere antwoorden)
- [ ] Langere stiltes respecteren

#### Prioriteit 4: Emotioneel Design
- [ ] "Memory Lane" navigatie-metafoor
- [ ] Micro-interacties (confetti, hartslag-animatie)
- [ ] Seizoensgebonden thema's
- [ ] Warme kleurenpalet

### Fase 2: Familie (Maand 5-8)
**Focus:** Van individu naar ecosysteem

- [ ] Familieboom visualisatie
- [ ] Familiepods (gedeelde ruimte)
- [ ] Reacties & aanvullingen op verhalen
- [ ] "Interview je Ouders" module
- [ ] Gezamenlijke tijdlijn

### Fase 3: Premium (Maand 9-12)
**Focus:** Verdienmodel

- [ ] Pricing tiers (Gratis/Familie/Legacy/Eeuwig)
- [ ] Fysiek boek generatie (print-on-demand)
- [ ] B2B portal voor zorginstellingen
- [ ] Voice cloning beta

### Fase 4: Schaal (Maand 13-18)
**Focus:** Internationaal

- [ ] Native iOS/Android apps
- [ ] Lokalisatie (DE, FR, EN)
- [ ] Offline-first architectuur
- [ ] VR Experience beta

---

## Code Conventies

### Backend (Python/FastAPI)

```python
# Gebruik async waar mogelijk
async def get_chapter(chapter_id: int, db: AsyncSession) -> Chapter:
    ...

# Type hints altijd
def generate_question(context: InterviewContext) -> str:
    ...

# Docstrings in Nederlands
async def create_highlight(
    transcription_id: int,
    emotion: EmotionType,
    start_ms: int,
    end_ms: int
) -> Highlight:
    """
    Maak een emotionele highlight aan voor een transcriptie.
    
    Args:
        transcription_id: ID van de transcriptie
        emotion: Type emotie (LACH, INZICHT, LIEFDE, WIJSHEID)
        start_ms: Starttijd in milliseconden
        end_ms: Eindtijd in milliseconden
    
    Returns:
        Nieuwe Highlight instantie
    """
    ...
```

### Frontend (React/TypeScript)

```typescript
// Functionele componenten met TypeScript
interface TimelineProps {
  userId: string;
  chapters: Chapter[];
  onChapterSelect: (id: string) => void;
}

export function Timeline({ userId, chapters, onChapterSelect }: TimelineProps) {
  // Zustand voor lokale state
  const { currentPhase } = useTimelineStore();
  
  return (
    // Tailwind CSS voor styling
    <div className="flex flex-col gap-4 p-6 bg-warm-50">
      ...
    </div>
  );
}

// Custom hooks voor logica
function useInterview(chapterId: string) {
  const [question, setQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // ...
  
  return { question, isLoading, generateNext };
}
```

### Naamgeving
- **Componenten:** PascalCase (`ChapterCard`, `AudioRecorder`)
- **Functies:** camelCase (`generateQuestion`, `uploadMedia`)
- **Constanten:** SCREAMING_SNAKE_CASE (`MAX_RECORDING_DURATION`)
- **Database tabellen:** snake_case (`user_chapters`, `emotional_highlights`)
- **API endpoints:** kebab-case (`/api/v1/chapters/{id}/highlights`)

### Git Commits
```
feat(interview): voeg emotie-detectie toe aan AI interviewer
fix(recorder): los audio-sync probleem op in Safari
refactor(timeline): verbeter performance met virtualisatie
docs(api): update OpenAPI specificatie voor sharing endpoints
```

---

## AI Prompt Richtlijnen

### Interviewer Persona
De AI interviewer moet voelen als een **warme, wijze vriend** — niet als een systeem.

```
TOON:
- Warm en empathisch
- Geduldig (haast nooit)
- Nieuwsgierig maar respectvol
- Nederlandse spreektaal (niet formeel)

NIET DOEN:
- Geen jargon of technische termen
- Geen dubbele vragen in één keer
- Geen oordelende taal
- Niet onderbreken of afronden

WEL DOEN:
- Doorvragen op emotionele momenten
- Namen en details onthouden
- Stiltes toelaten
- Bevestigen en waarderen
```

### Voorbeeld Prompts

**Vraag genereren:**
```
Je bent een warme, empathische interviewer die helpt bij het vastleggen 
van levensverhalen. De gebruiker is bezig met het hoofdstuk "{chapter_name}" 
in de fase "{phase_name}".

Eerdere antwoorden in dit hoofdstuk:
{previous_answers}

Genereer één open, uitnodigende vraag die:
1. Aansluit bij wat al verteld is
2. Dieper graaft in emoties of details
3. In natuurlijk Nederlands is geformuleerd
4. Niet te lang is (max 2 zinnen)

Vraag:
```

**Emotie detecteren:**
```
Analyseer de volgende transcriptie en identificeer emotionele hoogtepunten.

Transcriptie:
{transcription_text}

Markeer fragmenten met deze emoties:
- 🎭 LACH: Grappige, vrolijke momenten
- 💡 INZICHT: Realisaties, ontdekkingen
- ❤️ LIEFDE: Warme herinneringen
- 🦉 WIJSHEID: Levenslessen, adviezen

Output als JSON:
[
  {
    "emotion": "LACH|INZICHT|LIEFDE|WIJSHEID",
    "start_word_index": int,
    "end_word_index": int,
    "text": "het relevante fragment",
    "confidence": 0.0-1.0
  }
]
```

---

## Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host/db

# Security
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Services (OpenRouter)
OPENROUTER_API_KEY=your-key
CLAUDE_MODEL=anthropic/claude-3.5-sonnet
WHISPER_MODEL=openai/whisper-large-v3

# Storage
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_BUCKET_NAME=bewaardvoorjou-media
AWS_REGION=eu-west-1

# Redis
REDIS_URL=redis://localhost:6379/0
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

---

## Veelvoorkomende Taken

### Nieuwe API endpoint toevoegen
1. Maak route in `app/api/v1/routes/`
2. Definieer schemas in `app/schemas/`
3. Implementeer service logica in `app/services/`
4. Voeg tests toe in `tests/`
5. Update OpenAPI docs

### Nieuwe React component maken
1. Maak component in `src/components/`
2. Voeg TypeScript types toe
3. Style met Tailwind CSS
4. Voeg Storybook story toe (indien van toepassing)
5. Schrijf unit tests

### AI prompt aanpassen
1. Prompts staan in `app/services/ai/prompts/`
2. Test eerst in Claude.ai playground
3. Implementeer met fallback
4. Monitor kwaliteit via logging

---

## Belangrijke Opmerkingen

### Performance
- Gebruik `React.memo()` voor zware componenten
- Lazy load grote modules
- Optimaliseer afbeeldingen (next/image)
- Cache API responses waar mogelijk

### Toegankelijkheid
- ARIA labels op interactieve elementen
- Keyboard navigatie ondersteunen
- Hoog contrast modus
- Grote tekst optie
- Screen reader compatibiliteit

### Privacy & Security
- Geen PII in logs
- Alle data encrypted at rest
- JWT tokens kort houden
- Rate limiting op alle endpoints
- Input sanitization

---

## Contactgegevens

**Project Owner:** [Jouw naam]
**Repository:** D:\Memories\

---

*Laatste update: November 2025*
*Versie: 2.0-development*
