# Life Journey - Production Deployment Guide

Complete guide voor het deployen van de Life Journey app naar productie.

## 🎯 Deployment Opties

### Aanbevolen Stack:
- **Backend**: Railway.app of Render.com
- **Frontend**: Vercel
- **Database**: Neon.tech (already configured)
- **Redis**: Upstash Redis
- **Media Storage**: AWS S3 of Cloudflare R2

## 📋 Pre-Deployment Checklist

- [ ] OpenRouter API key aangemaakt
- [ ] Neon.tech database werkend
- [ ] Redis instance opgezet
- [ ] S3 bucket aangemaakt (optioneel)
- [ ] Domain naam geregistreerd (optioneel)
- [ ] SSL certificaten (wordt automatisch geregeld)

## 🚀 1. Backend Deployment (Railway)

### Stap 1: Railway Account
1. Ga naar https://railway.app
2. Sign up met GitHub account
3. Maak nieuw project: "life-journey-backend"

### Stap 2: Deploy Backend
```bash
cd life-journey-backend

# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Add environment variables
railway variables set DATABASE_URL="your-neon-url"
railway variables set REDIS_URL="your-redis-url"
railway variables set OPENAI_API_KEY="your-openrouter-key"
railway variables set JWT_SECRET_KEY="$(openssl rand -hex 32)"

# Deploy
railway up
```

### Stap 3: Configure Procfile
Railway automatisch detecteert Python en runt:
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Stap 4: Add Worker for Celery
In Railway dashboard:
1. Add new service
2. Select same repo
3. Set start command: `celery -A app.services.media.tasks worker --loglevel=info`
4. Add same environment variables

## 🌐 2. Frontend Deployment (Vercel)

### Stap 1: Vercel Account
1. Ga naar https://vercel.com
2. Sign up met GitHub account

### Stap 2: Deploy via GitHub
1. Push code naar GitHub repository
2. Import project in Vercel
3. Select `life-journey-frontend` directory
4. Configure environment variables:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app/api/v1
   ```
5. Deploy

### Alternatief: Deploy via CLI
```bash
cd life-journey-frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variable
vercel env add NEXT_PUBLIC_API_BASE_URL production

# Promote to production
vercel --prod
```

## 💾 3. Redis Setup (Upstash)

### Optie A: Upstash (Aanbevolen - Gratis tier)
1. Ga naar https://upstash.com
2. Create database
3. Kies region (eu-central-1)
4. Copy REST URL
5. Add to Railway: `railway variables set REDIS_URL="your-upstash-url"`

### Optie B: Redis Cloud
1. Ga naar https://redis.com/try-free
2. Create database
3. Copy connection string
4. Add to Railway

## 📦 4. S3 Storage (Optional - voor productie media)

### AWS S3 Setup
```bash
# Create S3 bucket
aws s3 mb s3://life-journey-media --region eu-central-1

# Configure CORS
cat > cors.json <<EOF
[
  {
    "AllowedOrigins": ["https://your-frontend.vercel.app"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
EOF

aws s3api put-bucket-cors --bucket life-journey-media --cors-configuration file://cors.json
```

### Update Backend Environment
```bash
railway variables set S3_BUCKET="life-journey-media"
railway variables set S3_REGION="eu-central-1"
railway variables set AWS_ACCESS_KEY_ID="your-key"
railway variables set AWS_SECRET_ACCESS_KEY="your-secret"
```

## 🔐 5. Security Hardening

### Backend Security
```bash
# Generate secure JWT secret
openssl rand -hex 32

# Set in Railway
railway variables set JWT_SECRET_KEY="generated-key"

# Enable HTTPS only
railway variables set FORCE_SSL="true"

# Set CORS origins
railway variables set CORS_ORIGINS='["https://your-frontend.vercel.app"]'
```

### Database Security
- ✅ Neon.tech uses SSL by default
- ✅ Connection pooling enabled
- ✅ Automatic backups

### API Rate Limiting
Add to backend:
```python
# app/main.py
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter

@app.on_event("startup")
async def startup():
    redis = aioredis.from_url(settings.redis_url)
    await FastAPILimiter.init(redis)

# On routes:
@router.post("/upload", dependencies=[Depends(RateLimiter(times=10, seconds=60))])
```

## 📊 6. Monitoring & Logging

### Railway Monitoring
- Built-in metrics dashboard
- View logs: `railway logs`
- Alerts: Configure in Railway dashboard

### Vercel Monitoring
- Built-in Web Analytics
- View deployment logs in dashboard
- Configure alerts

### Sentry (Optional)
```bash
# Install
pip install sentry-sdk[fastapi]

# Configure in app/main.py
import sentry_sdk
sentry_sdk.init(
    dsn="your-sentry-dsn",
    environment="production"
)
```

## 💰 7. Cost Estimates

### Monthly Costs (Small Scale)

**Railway (Backend + Celery)**
- Hobby tier: $5/month
- Pro tier: $20/month (recommended)

**Vercel (Frontend)**
- Free tier: $0 (includes SSL + CDN)
- Pro tier: $20/month (voor team features)

**Neon.tech (Database)**
- Free tier: $0 (512 MB storage)
- Pro tier: $19/month (3 GB storage)

**Upstash (Redis)**
- Free tier: $0 (10K commands/day)
- Pay-as-you-go: ~$1-5/month

**OpenRouter (AI)**
- Claude 3.5 Sonnet: $3 per 1M tokens
- Whisper: $0.006 per minute
- Estimate: $10-30/month (100 recordings)

**Total**: $15-75/month depending on usage

## 🚨 8. Backup & Recovery

### Database Backups
```bash
# Neon.tech automatic backups
# Manual backup:
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore:
psql $DATABASE_URL < backup_20250128.sql
```

### Media Backups
```bash
# Backup S3 to local
aws s3 sync s3://life-journey-media ./backups/media/

# Restore
aws s3 sync ./backups/media/ s3://life-journey-media
```

## 🧪 9. Testing in Production

### Smoke Tests
```bash
# Test backend health
curl https://your-backend.railway.app/healthz

# Test frontend
curl https://your-frontend.vercel.app

# Test API
curl https://your-backend.railway.app/api/v1/
```

### Load Testing (Optional)
```bash
# Install locust
pip install locust

# Create locustfile.py
# Run: locust -f locustfile.py --host=https://your-backend.railway.app
```

## 🔄 10. CI/CD Pipeline

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway link ${{ secrets.RAILWAY_TOKEN }}
          railway up

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --token ${{ secrets.VERCEL_TOKEN }} --prod
```

## 📱 11. Mobile Optimization

### PWA Configuration
Frontend is already PWA-ready with:
- manifest.json
- Service worker
- Offline support

### iOS/Android Testing
Test op echte devices:
- iOS Safari
- Android Chrome
- Audio/video recording permissions

## 🌍 12. Internationalization (Future)

Voor Engels/andere talen:
```bash
# Install i18n
npm install next-intl

# Configure in next.config.js
# Add translations in /messages/
```

## 📈 13. Scaling Strategy

### Phase 1: 0-100 users
- Current setup is voldoende
- Free tiers kunnen dit aan

### Phase 2: 100-1000 users
- Upgrade Neon.tech to Pro
- Add Redis caching
- Upgrade Railway to Pro
- Enable CDN for media

### Phase 3: 1000+ users
- Consider Kubernetes voor backend
- Separate read replicas database
- Add load balancer
- Multiple Celery workers

## 🔧 14. Environment-Specific Config

### Development
```bash
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=DEBUG
```

### Staging
```bash
ENVIRONMENT=staging
DEBUG=false
LOG_LEVEL=INFO
```

### Production
```bash
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=WARNING
FORCE_SSL=true
```

## 📞 15. Support & Maintenance

### Weekly Tasks
- [ ] Check error logs
- [ ] Review API costs
- [ ] Monitor disk usage
- [ ] Check backup status

### Monthly Tasks
- [ ] Update dependencies
- [ ] Review security advisories
- [ ] Optimize database indexes
- [ ] Review and rotate API keys

### Quarterly Tasks
- [ ] Load testing
- [ ] Security audit
- [ ] Cost optimization review
- [ ] Feature planning

---

## 🆘 Need Help?

- **Railway**: https://docs.railway.app
- **Vercel**: https://vercel.com/docs
- **Neon**: https://neon.tech/docs
- **OpenRouter**: https://openrouter.ai/docs

---

**Last Updated**: 2025-10-28
**Version**: 1.0.0
