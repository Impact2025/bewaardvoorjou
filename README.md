# Life Journey - Bewaar Je Levensverhaal

Een empathische AI-powered app om je levensverhaal vast te leggen, met automatische transcriptie en emotionele highlight detectie.

## ✨ Features

- 🎤 **Audio/Video Opname** per hoofdstuk (7 thematische chapters)
- 🤖 **AI Interviewer** - Contextuele Nederlandse vragen gegenereerd door Claude
- 📝 **Automatische Transcriptie** - Whisper via OpenRouter
- 💎 **Highlight Detectie** - AI herkent emotionele momenten (lachen, wijsheid, liefde, inzicht)
- 🔐 **Privacy-First** - Alle data encrypted en lokaal opgeslagen
- 🌍 **Nederlands-First** - Volledig geoptimaliseerd voor de Nederlandse taal

## 🏗️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** (Neon.tech) - Cloud database
- **SQLAlchemy** - ORM
- **OpenRouter** - AI API (Claude 3.5 Sonnet + Whisper)
- **Celery + Redis** - Background job processing
- **JWT** + Argon2 - Authentication

### Frontend
- **Next.js 15** - React framework
- **React 19** - UI library
- **Zustand** - State management
- **Tailwind CSS 4** - Styling

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Redis (voor background jobs)

### 1. Backend Setup

```bash
cd life-journey-backend

# Maak virtual environment
python -m venv venv

# Activeer virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Installeer dependencies
pip install -r requirements.txt

# Configureer .env
# Kopieer .env.example naar .env en vul aan:
# - DATABASE_URL (Neon.tech PostgreSQL)
# - OPENAI_API_KEY (OpenRouter API key)
# - REDIS_URL (Redis connection string)

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend draait nu op: http://localhost:8000
API Docs: http://localhost:8000/docs

### 2. Frontend Setup

```bash
cd life-journey-frontend

# Installeer dependencies
npm install

# Configureer .env.local
# Kopieer .env.example naar .env.local:
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Start development server
npm run dev
```

Frontend draait nu op: http://localhost:3000

### 3. Background Jobs (Optioneel voor transcriptie)

```bash
# Start Redis (in aparte terminal)
redis-server

# Start Celery worker (in aparte terminal)
cd life-journey-backend
celery -A app.services.media.tasks worker --loglevel=info
```

## 📋 Hoofdstukken (Chapters)

De app is georganiseerd in 7 thematische hoofdstukken:

1. **🌱 Roots (Wortels & Jeugd)** - Waar kom je vandaan?
2. **🎵 Music (Muziek & Soundtrack)** - Welke liedjes definiëren je leven?
3. **🎯 Milestones (Keerpunten)** - Momenten die je leven veranderden
4. **😄 Humor (Lichte Momenten)** - Grappige herinneringen
5. **📚 Lessons (Levenslessen)** - Wijsheid om door te geven
6. **❤️ People (Belangrijke Mensen)** - Wie vormden je?
7. **💬 Message (Vrije Boodschap)** - Wat wil je nog kwijt?

## 🎯 Workflow

### Recording Flow:
```
1. User selecteert hoofdstuk
   ↓
2. AI genereert empathische vraag (Claude)
   ↓
3. User neemt audio/video op
   ↓
4. Upload naar backend (local storage / S3)
   ↓
5. Background processing (Celery):
   - Transcriptie (Whisper)
   - Segment creation
   - Highlight detection (Claude)
   ↓
6. Resultaten zichtbaar in frontend
```

## 🔐 Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql+psycopg://user:pass@host/db?sslmode=require

# Redis (voor Celery)
REDIS_URL=redis://localhost:6379/0

# OpenRouter AI
OPENAI_API_KEY=sk-or-v1-your-key-here
OPENAI_API_BASE=https://openrouter.ai/api/v1
OPENAI_MODEL=anthropic/claude-3.5-sonnet
WHISPER_MODEL=openai/whisper-large-v3

# JWT
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRES_MINUTES=1440

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

## 🧪 Testing

### Test AI Interviewer
```bash
cd life-journey-backend
python test_interviewer.py
```

### Test Transcriptie Flow
```bash
cd life-journey-backend
python test_transcription.py
```

### Test API Endpoints
Open http://localhost:8000/docs voor interactieve API docs

## 📊 API Costs

Per 5-minuten opname (geschat):
- **Whisper Transcriptie**: ~$0.006
- **Prompt Generation**: ~$0.001
- **Highlight Detection**: ~$0.01

**Totaal per opname**: ~$0.02

## 🏭 Production Deployment

### Backend (Recommended: Railway / Render / Fly.io)

```bash
# Build
pip install -r requirements.txt

# Database migrations
alembic upgrade head

# Start with Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend (Recommended: Vercel)

```bash
# Build
npm run build

# Start
npm start
```

### Background Jobs

Voor production heb je nodig:
- **Redis instance** (Redis Cloud, Upstash, etc.)
- **Celery worker** (Heroku Worker dyno, Railway, etc.)

```bash
celery -A app.services.media.tasks worker --loglevel=info
```

## 🔧 Development Tips

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Reset Database
```bash
alembic downgrade base
alembic upgrade head
```

### Check Backend Logs
```bash
# Backend draait met uvicorn --reload
# Logs verschijnen automatisch in terminal
```

## 🐛 Troubleshooting

### Backend start niet
- Check of PostgreSQL database bereikbaar is
- Verify DATABASE_URL in .env
- Run `alembic upgrade head`

### Frontend kan niet verbinden
- Check of backend draait op port 8000
- Verify NEXT_PUBLIC_API_BASE_URL in .env.local
- Check CORS settings in backend

### Transcriptie werkt niet
- Check of Redis draait: `redis-cli ping`
- Check of Celery worker draait
- Verify OPENAI_API_KEY in .env

### Highlight detectie faalt
- Transcriptie werkt wel door
- Check API key en limits op OpenRouter
- Highlights worden asynchroon toegevoegd

## 📁 Project Structure

```
life-journey/
├── life-journey-backend/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── core/          # Config, security
│   │   ├── db/            # Database, CRUD
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Business logic
│   │       ├── ai/        # AI services
│   │       │   ├── interviewer.py
│   │       │   ├── transcriber.py
│   │       │   └── highlight_detector.py
│   │       └── media/     # Media handling
│   ├── alembic/           # DB migrations
│   ├── requirements.txt
│   └── .env
│
└── life-journey-frontend/
    ├── src/
    │   ├── app/           # Next.js pages
    │   ├── components/    # React components
    │   ├── hooks/         # Custom hooks
    │   ├── lib/           # Utilities
    │   └── store/         # State management
    ├── package.json
    └── .env.local
```

## 🎨 Features in Detail

### AI Interviewer
- Genereert context-aware vragen per hoofdstuk
- Nederlandse taal met warme, uitnodigende toon
- Variëert vragen op basis van eerdere prompts
- Fallback naar voorgedefinieerde vragen

### Transcriptie
- Whisper large-v3 via OpenRouter
- Automatische Nederlandse transcriptie
- Segmentatie (50 woorden per segment)
- Timing schatting voor playback

### Highlight Detectie
- 4 emotionele labels: laugh, insight, love, wisdom
- Claude analyseert volledige transcriptie
- Automatische positie detectie
- JSON-structured output parsing

## 🤝 Contributing

Dit is een personal project, maar suggesties zijn welkom!

## 📄 License

Private project - All rights reserved

## 🙏 Credits

- **AI**: Claude 3.5 Sonnet & Whisper (via OpenRouter)
- **Database**: Neon.tech
- **Hosting**: TBD

---

**Made with ❤️ for preserving life stories**

For questions or support: [your-email]
