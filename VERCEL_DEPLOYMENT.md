# Vercel Deployment Guide - Bewaardvoorjou

## 🚀 Deploy naar Vercel in 5 minuten

### **Stap 1: Deploy Backend**

1. Ga naar [vercel.com](https://vercel.com) en login
2. Klik op **"Add New Project"**
3. Import je GitHub repository: `Impact2025/bewaardvoorjou`
4. **Project Settings:**
   - Framework Preset: **Other**
   - Root Directory: **`life-journey-backend`**
   - Build Command: (laat leeg)
   - Output Directory: (laat leeg)

5. **Environment Variables toevoegen:**
   ```bash
   # Database (Neon.tech)
   DATABASE_URL=postgresql+psycopg://user:pass@host/db?sslmode=require
   
   # JWT (Generate met: openssl rand -hex 32)
   JWT_SECRET_KEY=your-secret-key-here
   JWT_ALGORITHM=HS256
   JWT_ACCESS_TOKEN_EXPIRES_MINUTES=1440
   
   # AI (OpenRouter)
   OPENAI_API_KEY=sk-or-v1-your-key
   OPENAI_API_BASE=https://openrouter.ai/api/v1
   OPENAI_MODEL=anthropic/claude-3.5-sonnet
   
   # Whisper
   WHISPER_MODEL=openai/whisper-large-v3
   WHISPER_BACKEND=openrouter
   
   # Config
   ENVIRONMENT=production
   API_V1_PREFIX=/api/v1
   TELEMETRY_DISABLED=false
   ```

6. Klik **Deploy**
7. Noteer je backend URL: `https://jouw-backend.vercel.app`

---

### **Stap 2: Deploy Frontend**

1. In Vercel, klik weer **"Add New Project"**
2. Import dezelfde repository: `Impact2025/bewaardvoorjou`
3. **Project Settings:**
   - Framework Preset: **Next.js** (wordt auto-detected)
   - Root Directory: **`life-journey-frontend`**
   - Build Command: `npm run build` (auto)
   - Output Directory: `.next` (auto)

4. **Environment Variables:**
   ```bash
   NEXT_PUBLIC_API_BASE_URL=https://jouw-backend.vercel.app/api/v1
   ```
   ⚠️ Vervang `jouw-backend.vercel.app` met je echte backend URL!

5. Klik **Deploy**
6. Je frontend is nu live op: `https://jouw-project.vercel.app`

---

### **Stap 3: Database Setup (Neon.tech)**

1. Ga naar [neon.tech](https://neon.tech) en maak een account
2. Create New Project → Geef een naam (bijv. "bewaardvoorjou")
3. Region: **Europe (Frankfurt)**
4. Kopieer de **Connection String**
5. Voeg deze toe aan je backend environment variables in Vercel
6. Run database migraties:
   ```bash
   # Lokaal (eenmalig):
   cd life-journey-backend
   source venv/bin/activate  # of: venv\Scripts\activate (Windows)
   alembic upgrade head
   ```

---

### **Stap 4: Admin Account Maken**

```bash
# Lokaal draaien met productie database:
cd life-journey-backend
python scripts/create_admin.py
```

Of handmatig via SQL in Neon.tech console:
```sql
UPDATE "user" 
SET is_admin = true 
WHERE email = 'jouw-email@example.com';
```

---

### **Stap 5: CORS Update**

Na deployment, update CORS in backend:

**Option A: Via Vercel Environment Variables**
Voeg toe:
```bash
CORS_ORIGINS=https://jouw-frontend.vercel.app
```

**Option B: Code update** (aanbevolen)
Update `life-journey-backend/app/main.py` line 22:
```python
allow_origins=["https://jouw-frontend.vercel.app"],
```

---

## ✅ Checklist voor Live Gaan

- [ ] Backend deployed op Vercel
- [ ] Frontend deployed op Vercel  
- [ ] Database op Neon.tech aangemaakt
- [ ] Alle environment variables ingevuld
- [ ] Database migraties gedraaid
- [ ] Admin account aangemaakt
- [ ] CORS geconfigureerd
- [ ] Test login op productie URL
- [ ] Test opname functionaliteit
- [ ] Test admin panel

---

## 🔐 Belangrijke Security Notes

1. **Secrets:** NOOIT committen naar Git!
2. **JWT_SECRET_KEY:** Genereer unieke key voor productie
3. **Database:** Gebruik altijd SSL (Neon doet dit automatisch)
4. **CORS:** Alleen je eigen domains toestaan

---

## 📊 Monitoring

Vercel Dashboard toont:
- Deployment logs
- Runtime logs  
- Error tracking
- Performance metrics

---

## 🆘 Troubleshooting

**"Function timeout exceeded"**
→ Vercel heeft 60s timeout op gratis plan. AI operaties zijn geoptimaliseerd maar grote audio files kunnen langer duren.
→ Upgrade naar Pro plan voor 300s timeout.

**"Database connection failed"**
→ Check DATABASE_URL in environment variables
→ Zorg dat Neon.tech database online is

**"CORS error"**
→ Check CORS_ORIGINS environment variable
→ Update app/main.py met correcte frontend URL

---

## 💰 Kosten

- **Vercel:** Gratis tier (100GB bandwidth/maand)
- **Neon.tech:** Gratis tier (0.5GB storage, sleep na 5 min inactivity)
- **OpenRouter:** Pay-per-use (~$0.01 per chat, ~$0.06 per audio transcriptie)

**Geschatte kosten voor 100 gebruikers/maand:** ~€15-25

---

## 🚀 Je bent live!

Backend: https://jouw-backend.vercel.app
Frontend: https://jouw-frontend.vercel.app
Admin: https://jouw-frontend.vercel.app/admin

Login met: bewaard@weareimpact.nl / Demo1234
