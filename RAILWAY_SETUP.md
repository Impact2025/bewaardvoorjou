# Railway Deployment - Snelstart Gids

Deze gids helpt je om je Bewaardvoorjou project te deployen naar Railway.

## 📋 Wat je nodig hebt

- [x] Railway account (https://railway.com)
- [ ] GitHub repository (aanbevolen voor automatische deploys)
- [ ] OpenRouter API key
- [ ] Neon.tech database URL (of laat Railway een PostgreSQL database maken)

---

## 🚀 Optie 1: Deploy via Railway Dashboard (Makkelijkst)

### Stap 1: Maak een nieuw project

1. Ga naar https://railway.com/dashboard
2. Klik **"New Project"**
3. Selecteer **"Deploy from GitHub repo"** (aanbevolen) OF **"Empty Project"**

### Stap 2A: Via GitHub (Aanbevolen)

**Push code naar GitHub eerst:**
```bash
# In D:\memories
git remote add origin https://github.com/JOUW-GEBRUIKERSNAAM/bewaardvoorjou.git
git push -u origin main
```

**In Railway Dashboard:**
1. Kies je repository
2. Selecteer **"Add variables"**
3. Railway detecteert automatisch Python/FastAPI

### Stap 2B: Via Railway CLI

```bash
# Installeer Railway CLI
npm install -g @railway/cli

# Login
railway login

# In de backend directory
cd life-journey-backend

# Initialiseer en deploy
railway init
railway up
```

---

## ⚙️ Stap 3: Configureer Backend Service

### Environment Variables instellen

In Railway Dashboard > je project > Backend service > **Variables** tab:

```bash
# Database (gebruik bestaande Neon.tech of maak nieuwe)
DATABASE_URL=postgresql+asyncpg://user:pass@host/db

# JWT Security
JWT_SECRET_KEY=<genereer met: openssl rand -hex 32>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenRouter AI
OPENROUTER_API_KEY=jouw-openrouter-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Redis (optioneel voor Celery, zie stap 5)
REDIS_URL=redis://default:password@host:port

# S3 Storage (optioneel)
AWS_ACCESS_KEY_ID=jouw-key
AWS_SECRET_ACCESS_KEY=jouw-secret
AWS_BUCKET_NAME=bewaardvoorjou-media
AWS_REGION=eu-west-1

# App Settings
ENVIRONMENT=production
DEBUG=False
CORS_ORIGINS=["https://jouw-frontend.vercel.app"]
```

### Genereer JWT Secret (Windows)

```bash
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

Of gebruik een online generator: https://randomkeygen.com/

---

## 🗄️ Stap 4: Database Opties

### Optie A: Gebruik bestaande Neon.tech database
- Kopieer je `DATABASE_URL` van Neon.tech dashboard
- Plak in Railway variables
- **Let op:** Vervang `postgresql://` met `postgresql+asyncpg://`

### Optie B: Nieuwe PostgreSQL via Railway
1. In je Railway project: **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway maakt automatisch `DATABASE_URL` variabele
3. Voeg `/async` toe aan connection string voor asyncpg support

### Database Migraties uitvoeren

Na eerste deploy, run migraties via Railway CLI:
```bash
railway run alembic upgrade head
```

Of via Railway Dashboard **> Settings > Deploy Triggers** (eenmalig handmatig):
```bash
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

## 🔄 Stap 5: Celery Worker (Optioneel - voor achtergrondtaken)

Voor transcriptie processing heb je een aparte worker nodig.

### 5.1: Voeg Redis toe
1. In Railway project: **"+ New"** → **"Database"** → **"Add Redis"**
2. Kopieer `REDIS_URL` naar backend service variables

### 5.2: Maak Worker Service
1. In Railway project: **"+ New"** → **"Empty Service"**
2. Naam: `celery-worker`
3. Koppel dezelfde GitHub repo
4. **Settings > Start Command:**
   ```bash
   celery -A app.services.media.tasks worker --loglevel=info
   ```
5. Voeg **alle backend environment variables** toe aan worker

---

## 🌐 Stap 6: Frontend Deployment (Vercel aanbevolen)

Railway kan ook Next.js hosten, maar Vercel is geoptimaliseerd voor Next.js.

### Via Vercel (Aanbevolen)

1. Ga naar https://vercel.com
2. **"Add New Project"** → Selecteer je GitHub repo
3. **Root Directory:** `life-journey-frontend`
4. **Environment Variables:**
   ```bash
   NEXT_PUBLIC_API_URL=https://jouw-backend.railway.app/api/v1
   ```
5. Deploy!

### Alternatief: Via Railway

1. In Railway project: **"+ New"** → **"GitHub Repo"**
2. **Settings > Root Directory:** `life-journey-frontend`
3. Railway detecteert Next.js automatisch
4. **Variables:**
   ```bash
   NEXT_PUBLIC_API_URL=https://jouw-backend.railway.app/api/v1
   ```

---

## 🔗 Stap 7: URLs verbinden

### Backend URL vinden
- Railway Dashboard > Backend service > **"Settings"** tab
- Kopieer de **Railway-provided domain**: `https://xxx.railway.app`
- OF voeg custom domain toe via **"Settings > Networking"**

### Update Frontend Environment
1. Vercel Dashboard > je project > **Settings > Environment Variables**
2. Update `NEXT_PUBLIC_API_URL` met Railway backend URL
3. Redeploy frontend

### Update Backend CORS
1. Railway Dashboard > Backend > Variables
2. Update `CORS_ORIGINS`:
   ```json
   ["https://jouw-frontend.vercel.app", "https://jouw-domein.nl"]
   ```

---

## ✅ Stap 8: Test je Deployment

### Backend Health Check
```bash
curl https://jouw-backend.railway.app/healthz
# Verwacht: {"status":"ok"}
```

### API Test
```bash
curl https://jouw-backend.railway.app/api/v1/
```

### Frontend Test
Open je Vercel URL in browser en probeer:
1. Registreren
2. Inloggen
3. Audio opnemen (test permissions)

---

## 🐛 Troubleshooting

### "Build failed" errors

**Check logs:**
```bash
railway logs
```

**Veelvoorkomende fixes:**
- Zorg dat `requirements.txt` compleet is
- Check Python versie in `runtime.txt`
- Verifieer dat `app/main.py` bestaat

### "Application failed to start"

**Check environment variables:**
- `DATABASE_URL` correct formaat?
- `JWT_SECRET_KEY` ingesteld?
- `OPENROUTER_API_KEY` geldig?

**Database connection errors:**
```bash
# Railway CLI
railway run alembic upgrade head
```

### "CORS errors" in frontend

Update backend `CORS_ORIGINS`:
```bash
railway variables set CORS_ORIGINS='["https://jouw-frontend.vercel.app"]'
```

---

## 💰 Kosten Inschatting

### Railway Pricing
- **Hobby Plan:** $5/maand
  - 500 uur compute
  - 500 MB memory
  - 1 GB disk
  - **Geschikt voor:** Development + kleine productie

- **Pro Plan:** $20/maand
  - Unlimited compute uren
  - 8 GB memory per service
  - 100 GB disk
  - Priority support
  - **Geschikt voor:** Productie met meerdere gebruikers

### Services die je nodig hebt:
1. **Backend (web)**: Always running
2. **Celery Worker**: Only during transcriptions (kan uitstaan)
3. **PostgreSQL** (optioneel, als niet via Neon.tech): $5-10/maand
4. **Redis** (optioneel): $5/maand

**Totaal**: $5-35/maand afhankelijk van configuratie

---

## 🔐 Security Checklist

- [ ] JWT secret is >32 characters random string
- [ ] `DEBUG=False` in productie
- [ ] CORS origins beperkt tot jouw domains
- [ ] Database URL bevat sterke credentials
- [ ] API keys niet in code, alleen in Railway variables
- [ ] HTTPS enabled (automatisch via Railway)

---

## 🚀 Automatische Deploys

Railway kan automatisch deployen bij elke git push.

**Enable in Railway Dashboard:**
1. Service **> Settings > Service**
2. **"Watch Paths"**: `life-journey-backend/**`
3. Bij push naar `main` branch → automatische deploy

**Voor frontend (Vercel):**
- Automatisch enabled bij GitHub connectie
- Push naar `main` = productie deploy
- Push naar andere branches = preview deploy

---

## 📊 Monitoring

### Railway Logs Bekijken
```bash
# Realtime logs
railway logs --follow

# Specifieke service
railway logs --service backend

# Laatste 100 regels
railway logs --tail 100
```

### Metrics
Railway Dashboard > Service > **Metrics** tab toont:
- CPU usage
- Memory usage
- Request count
- Response times

---

## 🆘 Hulp Nodig?

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Deze repo issues**: [Link naar je GitHub issues]

---

## 📝 Volgende Stappen

Na succesvolle deployment:

1. **Custom Domain toevoegen** (Railway Settings > Networking)
2. **SSL Certificaat** (automatisch via Railway)
3. **Monitoring instellen** (Sentry, LogRocket)
4. **Backup strategie** voor database
5. **CI/CD pipeline** met GitHub Actions

---

**Klaar!** 🎉 Je app draait nu op Railway.

Test alles grondig en open issues bij problemen.

---

*Laatste update: December 2025*
*Railway CLI versie: 3.x*
