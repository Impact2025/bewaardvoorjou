# CLAUDE.md — Bewaardvoorjou Project Context

> Dit bestand wordt automatisch gelezen door Claude Code. Het bevat alle context die nodig is om effectief aan dit project te werken.

## Project Overzicht

**Bewaardvoorjou** (bewaardvoorjou.nl) is een digitaal platform waarmee gebruikers hun levensverhaal vastleggen voor toekomstige generaties. De app begeleidt gebruikers door een empathisch, AI-gestuurd interviewproces in het Nederlands. Het platform is **live in productie** en wordt commercieel geëxploiteerd (Stripe-betalingen, pakketten, cadeau-flows).

### Missie
De Digitale Familiebibliotheek — het platform waar generaties samen bouwen aan een levend familiearchief.

### Doelgroep
- Ouderen die hun levensverhaal willen bewaren
- Kinderen/kleinkinderen die het verhaal van een ouder cadeau geven
- Jonge ouders (aparte **baby-variant** onder `/voor-baby`)

---

## Technologie Stack

| Component | Technologie | Details |
|-----------|-------------|---------|
| Backend | FastAPI (Python 3.11+) | 29 route-modules, ~169 endpoints |
| Frontend | Next.js 15 + React 19 | App Router, standalone output, PWA |
| Mobile | Expo SDK 51 (React Native) | pre-release, offline-first (WatermelonDB) |
| Database | PostgreSQL (Neon.tech) | Alembic-migraties |
| Styling | Tailwind CSS 4 | CSS-first config in `globals.css`, géén tailwind.config |
| State | Zustand (via context-wrapper) + React Context | |
| AI Interviewer | Claude (Sonnet) via OpenRouter | model in config: `anthropic/claude-sonnet-4-6` |
| Transcriptie | Whisper large-v3 via OpenRouter | |
| Queue | Celery + Redis | media-verwerking, e-mail |
| Betalingen | Stripe | iDEAL/card/Bancontact expliciet (géén Link) |
| E-mail | Resend | eigen scheduler, events, audit-log |
| Storage | S3/Cloudflare R2 | presigned uploads (HMAC capability-URLs) |
| Monitoring | Sentry | backend + frontend |

---

## Projectstructuur

```
D:\apps\memories/
├── life-journey-backend/          # FastAPI backend (deploy: Railway)
│   ├── app/
│   │   ├── api/v1/routes/         # 29 route-modules (auth, journeys, media,
│   │   │                          #   orders, webhooks, family, baby, blog, admin…)
│   │   ├── services/              # ai/, email/, media/, sharing/, baby/,
│   │   │                          #   export/, legacy/, entitlements.py …
│   │   ├── models/                # SQLAlchemy (21 modules)
│   │   ├── schemas/               # Pydantic (23 modules)
│   │   ├── core/                  # config, rate_limiter, security_headers
│   │   └── db/                    # session, crud
│   ├── alembic/versions/          # migraties (chronologisch benoemd)
│   ├── scripts/                   # ad-hoc ops/debug/seed-scripts (GEEN app-code)
│   ├── tests/                     # pytest-suite (CI draait `pytest tests/`)
│   └── index.py                   # Vercel serverless entrypoint (niet verwijderen)
│
├── life-journey-frontend/         # Next.js frontend (deploy: Vercel)
│   └── src/
│       ├── app/                   # ~75 pagina's: dashboard, record, vertel,
│       │                          #   checkout, voor-baby (8), admin (17),
│       │                          #   blog/kennisbank, family, timeline
│       ├── components/            # 86 componenten (recorder/, journey/, baby/…)
│       ├── lib/                   # api-client.ts + ~36 client-modules
│       └── store/                 # auth-context, journey-store
│
├── life-journey-mobile/           # Expo-app v0.1.0 — echte code in src/,
│                                  #   app/ + components/ zijn template-restanten
├── docs/                          # documentatie (babydocs/, legal/, archive/)
├── scripts/                       # root ops-scripts (usb_setup, sql-checks)
└── .github/workflows/ci.yml      # CI: ruff + mypy(advies) + pytest | tsc + vitest
```

---

## Deployment — LET OP

- **Push naar `main` deployt automatisch**: backend via Railway, frontend via Vercel. Commit gerust, maar push bewust.
- Migratie-valkuil: Railway draait migraties van `main`; feature-branches met migraties niet laten achterlopen (zie geheugen/DEPLOYMENT.md).
- Healthcheck: `/healthz`. Start: `bash start.sh` (Railway), `index.py` (Vercel serverless variant).
- SEO: **non-www is canoniek** (bewaardvoorjou.nl); Vercel-host moet daarop matchen (308).

## Testen & CI

- Backend: `cd life-journey-backend && venv\Scripts\python -m pytest tests/` (SQLite + dummy `JWT_SECRET_KEY` volstaat, zie ci.yml).
- Frontend: `cd life-journey-frontend && npm test` (vitest) en `npx tsc --noEmit`.
- CI (GitHub Actions, push/PR op main): ruff (blokkerend), mypy (niet-blokkerend), pytest, tsc, vitest.
- `life-journey-backend/scripts/test_*.py` zijn **handmatige debugscripts**, geen pytest-tests.

---

## Kernfunctionaliteiten (live)

1. **AI-interviewer** — hoofdstukgestuurd levensverhaal-interview (58 kern / 78 totaal hoofdstukken), doorvraag-logica, context-geheugen (`services/ai/interviewer.py`)
2. **Opname & transcriptie** — audio/video/tekst, presigned S3-upload, Whisper, emotionele highlights
3. **Checkout & entitlements** — pakketten VERHAAL/ERFGOED/NALATENSCHAP, promo-codes, cadeaubonnen, gratis-limiet afgedwongen via 402 op `/media/presign`
4. **E-mailsysteem** — Resend met scheduler, events, engagement-tracking, unsubscribe, audit
5. **Familie** — pods, uitnodigingen, ouder-interview module, reacties
6. **Baby-variant** — aparte sub-app `/voor-baby` met eigen thema, onboarding en dashboard
7. **Kennisbank/blog CMS** — TipTap-editor in admin, content via backend-API, dynamische sitemap + schema.org
8. **Legacy** — nalatenschapsplanning, dead man's switch, export (PDF/USB)
9. **Admin** — 17 routes: orders, users, coupons, support, analytics, content
10. **Sharing** — deellinks met verlooptijd; media-reads met Bearer + ownership-check

---

## Code Conventies

### Backend (Python/FastAPI)

```python
# Async waar mogelijk, type hints altijd, docstrings in het Nederlands
async def create_highlight(transcription_id: int, emotion: EmotionType) -> Highlight:
    """Maak een emotionele highlight aan voor een transcriptie."""
    ...
```

- Nieuwe endpoints: route in `app/api/v1/routes/` → schema in `app/schemas/` → logica in `app/services/` → test in `tests/`.
- Rate limiting: gebruik `limiter` + presets uit `app/core/rate_limiter.py` (key = user-id uit JWT, fallback IP).
- Auth: dependencies uit `app/api/deps.py` (`get_current_user`, `get_current_admin_user`, `get_authorized_journey`).

### Frontend (React/TypeScript)

- Functionele componenten, Tailwind, `apiFetch<T>` uit `src/lib/api-client.ts` voor alle API-calls (heeft retry, NL-foutteksten, 401-logout).
- Server component als dunne wrapper + `*Content`-clientcomponent is het bestaande patroon.
- Nederlandse UI-teksten; toegankelijkheid serieus nemen (AccessibilityProvider, aria-labels).

### Naamgeving
- Componenten PascalCase, functies camelCase, constanten SCREAMING_SNAKE_CASE
- DB-tabellen snake_case, API-endpoints kebab-case

### Git Commits
```
feat(interview): voeg emotie-detectie toe aan AI interviewer
fix(recorder): los audio-sync probleem op in Safari
```
Nederlandse commit-messages, conventional-commits-stijl.

---

## AI Prompt Richtlijnen

De AI-interviewer moet voelen als een **warme, wijze vriend** — niet als een systeem.

```
TOON: warm, empathisch, geduldig, nieuwsgierig maar respectvol, Nederlandse spreektaal
NIET: jargon, dubbele vragen, oordelen, onderbreken
WEL: doorvragen op emotie, namen/details onthouden, stiltes toelaten, bevestigen
```

Prompts staan in `app/services/ai/` (zie ook `WORLD_CLASS_INTERVIEWER.md` in de backend). Wijzigingen eerst testen, implementeren met fallback, kwaliteit monitoren via logging.

---

## Environment Variables

Zie `.env.example` in backend en frontend. Kern: `DATABASE_URL`, `JWT_SECRET_KEY` (≥32 tekens, verplicht in prod), `OPENROUTER_API_KEY`, S3/R2-keys, `STRIPE_*`, `RESEND_*`, `REDIS_URL`, `SENTRY_DSN`. Frontend: `NEXT_PUBLIC_API_BASE_URL`.

**Nooit** `.env`-bestanden of media/DB-bestanden committen (staan in .gitignore).

---

## Belangrijke Opmerkingen

- **Privacy & security**: geen PII in logs, input-sanitization (nh3), rate limiting op alle publieke endpoints, media-toegang altijd via ownership-check.
- **Performance**: let op N+1 queries (eager loading), React.memo voor zware componenten, `next/image`.
- **Bekende schuld**: lage testdekking op frontend-flows (checkout/recorder), veel grote bestanden (`interviewer.py` 1.6k regels, `recorder-frame.tsx` 1.1k), mypy nog niet-blokkerend (legacy Column-typing).
- Gearchiveerde/verouderde plannen staan in `docs/archive/` — niet als actuele status lezen.

---

*Laatste update: 10 juli 2026*
