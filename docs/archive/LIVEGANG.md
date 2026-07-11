> **⚠️ GEARCHIVEERD (10 juli 2026)** — Livegang-checklist van rond de lancering. De vakjes zijn nooit afgevinkt, maar het platform draait inmiddels in productie (Railway + Vercel + Neon, Stripe live, Resend). Nog bruikbaar als naslag bij het opzetten van een nieuwe omgeving; niet als actuele takenlijst.

# Bewaardvoorjou — Livegang Checklist

## 1. Infrastructure opzetten

### Database (Neon.tech)
- [ ] PostgreSQL database aangemaakt in eu-central-1
- [ ] `DATABASE_URL` met SSL: `?sslmode=require`
- [ ] Alembic migraties draaien: `alembic upgrade head`
- [ ] Controleren: `alembic current` toont `20260525_memory_cache (head)`

### Redis (Upstash of Railway)
- [ ] Redis instance aangemaakt
- [ ] `REDIS_URL` ingesteld
- [ ] Ping test: `redis-cli -u $REDIS_URL ping` → `PONG`

### Objectopslag (S3 / Cloudflare R2)
- [ ] Bucket aangemaakt: `bewaardvoorjou-media`
- [ ] CORS policy op bucket: origins `https://bewaardvoorjou.nl`
- [ ] `S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` ingesteld

---

## 2. Backend deployen

### Environment variabelen (verplicht)
- [ ] `ENVIRONMENT=production`
- [ ] `JWT_SECRET_KEY` — minimaal 32 tekens (`python -c "import secrets; print(secrets.token_hex(32))"`)
- [ ] `DATABASE_URL`
- [ ] `REDIS_URL`
- [ ] `OPENAI_API_KEY` (OpenRouter key)
- [ ] `RESEND_API_KEY`
- [ ] `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`
- [ ] `API_BASE_URL=https://api.bewaardvoorjou.nl`
- [ ] `APP_BASE_URL=https://bewaardvoorjou.nl`
- [ ] `CORS_ORIGINS=https://bewaardvoorjou.nl,https://www.bewaardvoorjou.nl`

### Startup commando's
```bash
# API server
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Celery worker (email, exports)
celery -A app.services.email.tasks worker --loglevel=info -Q celery

# Celery Beat (wekelijkse vragen, inactivity checks)
celery -A app.services.email.tasks beat --loglevel=info

# Celery worker (media verwerking — apart)
celery -A celery_app worker --loglevel=info -Q media
```

### Controleren na deploy
- [ ] `GET /healthz` → `{"status":"ok","db":"ok"}`
- [ ] `GET /api/v1/chapters` → lijst met hoofdstukken
- [ ] Celery Beat draait: `celery -A app.services.email.tasks inspect scheduled`

---

## 3. Frontend deployen (Vercel)

### Environment variabelen
- [ ] `NEXT_PUBLIC_API_BASE_URL=https://api.bewaardvoorjou.nl/api/v1`
- [ ] `NEXT_PUBLIC_SENTRY_DSN` (na Sentry project aanmaken)
- [ ] `SENTRY_AUTH_TOKEN` (voor source map upload)
- [ ] `SENTRY_ORG` + `SENTRY_PROJECT`

### Build & deploy
```bash
npm run build
# Controleer: 0 TypeScript errors, 0 build warnings
```

- [ ] `https://bewaardvoorjou.nl` laadt zonder errors
- [ ] Login flow werkt: inloggen → dashboard
- [ ] `/vertel` pagina werkt voor storyteller users

---

## 4. Externe services configureren

### Resend (E-mail)
- [ ] Domein `bewaardvoorjou.nl` geverifieerd in Resend dashboard
- [ ] SPF record: `v=spf1 include:amazonses.com ~all`
- [ ] DKIM record toegevoegd (Resend geeft de exacte waarden)
- [ ] DMARC record: `v=DMARC1; p=none; rua=mailto:dmarc@bewaardvoorjou.nl`
- [ ] Webhook URL ingesteld: `https://api.bewaardvoorjou.nl/api/v1/webhooks/resend`
- [ ] Webhook events: `email.bounced`, `email.complained`
- [ ] Test e-mail versturen via Resend dashboard

### Stripe
- [ ] Live mode geactiveerd (na KVK verificatie)
- [ ] Webhook endpoint: `https://api.bewaardvoorjou.nl/api/v1/webhooks/stripe`
- [ ] Webhook events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- [ ] Test betaling doen: Begin pakket (€89) → magic link ontvangen

### Sentry
- [ ] Project aanmaken op sentry.io
- [ ] DSN kopiëren naar `SENTRY_DSN` (backend) en `NEXT_PUBLIC_SENTRY_DSN` (frontend)
- [ ] Test error triggeren: `GET /api/v1/sentry-debug` (of handmatig exception throwen)

---

## 5. DNS & SSL

- [ ] A-record `bewaardvoorjou.nl` → Vercel IP
- [ ] A-record `api.bewaardvoorjou.nl` → backend server IP
- [ ] SSL certificaten actief (Vercel regelt frontend, backend via Let's Encrypt/Caddy)
- [ ] `www.bewaardvoorjou.nl` redirect naar `bewaardvoorjou.nl`
- [ ] HTTPS redirect actief (geen HTTP verkeer)

---

## 6. End-to-end smoke test

Doorloop deze flow handmatig na elke deploy:

1. **Registratie**: Maak nieuw account aan → verificatiemail ontvangen → link klikken → geverifieerd
2. **Onboarding**: Profiel invullen → eerste hoofdstuk starten
3. **Opname**: Audio opnemen → opgeslagen → transcript zichtbaar
4. **Aankoop**: Checkout → Stripe testbetaling → magic link ontvangen → `/vertel` geopend
5. **Export**: Instellingen → "Download mijn verhalen" → ZIP ontvangen per mail
6. **Email**: Controleer dat wekelijkse vraag e-mail aankomt (of trigger handmatig via Celery)

---

## 7. Na livegang (eerste week)

- [ ] Sentry dashboard: 0 kritieke errors
- [ ] Resend dashboard: bounce rate < 2%, spam rate < 0.1%
- [ ] Celery Beat logs: wekelijkse taken draaien zonder errors
- [ ] `/healthz` monitoring instellen (UptimeRobot, BetterStack)
- [ ] Backup strategie DB: Neon heeft automatische backups (controleer retention)
