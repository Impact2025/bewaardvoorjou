# 🚀 Performance Optimalisatie Plan - Wereldklasse Snelheid

**Huidige status:** App voelt traag
**Doel:** Wereldklasse snelheid (< 1s eerste load, instant navigatie)
**Datum:** 17 december 2025

---

## 📊 Performance Analyse Resultaten

### Critical Bottlenecks Gevonden

#### 🔴 **CRITICAL #1: N+1 Database Queries (Backend)**
**Impact:** ZEER HOOG - Primaire oorzaak van traagheid
**Locatie:** `app/api/v1/routes/journeys.py` - `get_journey_detail()` endpoint

**Probleem:**
De `/journeys/{journey_id}` endpoint doet **12+ afzonderlijke database queries**:
```python
# Line 73: Journey query
journey = db.query(JourneyModel).filter(...).first()

# Line 80: Media assets query
media_records = db.query(MediaAssetModel).filter(...).all()

# Line 109: Prompt runs query
prompt_runs = db.query(PromptRunModel).filter(...).all()

# Line 122: Transcripts query (met JOIN)
transcripts = db.query(TranscriptSegmentModel).join(...).all()

# Line 135: Highlights query
highlights = db.query(HighlightModel).filter(...).all()

# Line 148: Share grants query
share_grants = db.query(ShareGrantModel).filter(...).all()

# Line 159: Consent log query
consent_log = db.query(ConsentLogModel).filter(...).all()

# Line 164: Chapter preferences query
active_chapters = db.query(ChapterPreferenceModel).filter(...).all()

# Line 172: Legacy policy query
legacy_policy = db.query(LegacyPolicyModel).filter(...).first()

# Plus functies die nog meer queries doen:
get_all_chapter_statuses()  # Waarschijnlijk 2-3 queries
get_journey_progress()       # Waarschijnlijk 2-3 queries
get_next_available_chapter() # Waarschijnlijk 1-2 queries
```

**Gevolg:**
- 12+ round-trips naar database per dashboard load
- Met network latency (Railway → Neon.tech): ~50ms × 12 = **600ms+ alleen voor queries**
- Dashboard is zwaarste pagina (142 kB) die dit endpoint gebruikt

**Oplossing: Eager Loading met SQLAlchemy**
```python
from sqlalchemy.orm import selectinload, joinedload

@router.get("/{journey_id}", response_model=JourneyDetail)
def get_journey_detail(...):
    # Single query met alle relaties
    journey = (
        db.query(JourneyModel)
        .filter(JourneyModel.id == journey_id)
        .options(
            selectinload(JourneyModel.media_assets),
            selectinload(JourneyModel.prompt_runs),
            selectinload(JourneyModel.transcripts),
            selectinload(JourneyModel.highlights),
            selectinload(JourneyModel.share_grants),
            selectinload(JourneyModel.consent_logs),
            selectinload(JourneyModel.chapter_preferences),
            joinedload(JourneyModel.legacy_policy),  # 1-to-1 relationship
        )
        .first()
    )

    # Nu zijn alle relaties al geladen - geen extra queries!
    media_assets = [map_media(m) for m in journey.media_assets]
    # ... etc
```

**Geschatte verbetering:** 600ms → 100ms (6x sneller!)
**Effort:** 2-3 uur
**Priority:** 🔥 URGENT - Hoogste impact

---

#### 🟠 **CRITICAL #2: Grote Frontend Bundle Size**
**Impact:** HOOG - Langzame initiële load
**Locatie:** Next.js bundles

**Probleem:**
```
Dashboard:  142 kB First Load JS
Family:     137 kB First Load JS
Chapter:    136 kB First Load JS
Shared JS:  102 kB (chunks/1255, chunks/4bd1b696)
```

**Plus warning:**
```
⚠ Warning: Multiple lockfiles detected
- D:\Memories\package-lock.json
- D:\Memories\life-journey-frontend\package-lock.json
```

Dit suggereert dubbele node_modules en mogelijk dubbele dependencies!

**Oplossingen:**

1. **Fix dubbele lockfiles** (Quick Win)
   ```bash
   # Remove root lockfile, use only frontend lockfile
   rm D:\Memories\package-lock.json
   rm -rf D:\Memories\node_modules
   ```

2. **Code splitting voor heavy components**
   ```typescript
   // Dashboard: Lazy load Timeline component (wordt pas nodig na data fetch)
   import dynamic from 'next/dynamic';

   const Timeline = dynamic(() => import('@/components/timeline'), {
     loading: () => <TimelineSkeleton />,
     ssr: false  // Niet nodig voor server-side
   });
   ```

3. **Tree-shake icons**
   ```typescript
   // BEFORE (importeert hele lucide-react library):
   import { Play, BookOpen, Settings, ... } from "lucide-react";

   // AFTER (alleen wat nodig is):
   import Play from "lucide-react/dist/esm/icons/play";
   import BookOpen from "lucide-react/dist/esm/icons/book-open";
   ```

4. **Next.js optimalisaties in next.config.ts**
   ```typescript
   const nextConfig: NextConfig = {
     compiler: {
       removeConsole: process.env.NODE_ENV === "production",
     },
     experimental: {
       optimizePackageImports: ['lucide-react'],
     },
     // Image optimization
     images: {
       formats: ['image/avif', 'image/webp'],
       deviceSizes: [640, 750, 828, 1080, 1200],
     },
   };
   ```

**Geschatte verbetering:** 142 kB → 90 kB (35% kleiner)
**Effort:** 3-4 uur
**Priority:** 🟠 HOOG

---

#### 🟡 **CRITICAL #3: Geen Database Indexes**
**Impact:** MEDIUM-HOOG - Queries worden langzamer naarmate data groeit
**Locatie:** Database schema

**Probleem:**
Veelgebruikte queries filteren op `journey_id`, maar er zijn mogelijk geen indexes.

**Check huidige indexes:**
```sql
-- In Neon.tech dashboard of via SQL:
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Essentiële indexes:**
```sql
-- Media assets (zwaarste tabel)
CREATE INDEX IF NOT EXISTS idx_media_journey_id ON media_asset(journey_id);
CREATE INDEX IF NOT EXISTS idx_media_recorded_at ON media_asset(recorded_at DESC);

-- Transcripts
CREATE INDEX IF NOT EXISTS idx_transcript_media_asset_id ON transcript_segment(media_asset_id);

-- Highlights
CREATE INDEX IF NOT EXISTS idx_highlight_journey_id ON highlight(journey_id);
CREATE INDEX IF NOT EXISTS idx_highlight_media_asset_id ON highlight(media_asset_id);

-- Prompt runs
CREATE INDEX IF NOT EXISTS idx_prompt_run_journey_id ON prompt_run(journey_id);

-- Chapter preferences
CREATE INDEX IF NOT EXISTS idx_chapter_pref_journey_id ON chapter_preference(journey_id);

-- Consent log
CREATE INDEX IF NOT EXISTS idx_consent_log_journey_id ON consent_log(journey_id);

-- Share grants
CREATE INDEX IF NOT EXISTS idx_share_grant_journey_id ON share_grant(journey_id);
```

**Geschatte verbetering:** Queries 2-5x sneller (vooral bij > 100 records)
**Effort:** 1 uur (Alembic migration)
**Priority:** 🟡 MEDIUM-HOOG

---

#### 🟡 **CRITICAL #4: Geen API Response Caching**
**Impact:** MEDIUM - Herhaalde calls zijn onnodig traag
**Locatie:** Frontend + Backend

**Probleem:**
- Dashboard load → `/journeys/{id}` call
- Navigate away → back to dashboard → `/journeys/{id}` call AGAIN
- Geen caching, elke keer verse data (vaak niet nodig)

**Oplossing 1: React Query voor client-side caching**
```bash
npm install @tanstack/react-query
```

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minuten
      cacheTime: 10 * 60 * 1000, // 10 minuten
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// hooks/use-journey-bootstrap.ts
import { useQuery } from '@tanstack/react-query';

export function useJourneyBootstrap() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ['journey', session?.primaryJourneyId],
    queryFn: () => fetchJourneyDetail(session!.primaryJourneyId, session!.token),
    enabled: !!session?.primaryJourneyId,
    staleTime: 5 * 60 * 1000,  // Cache 5 minuten
  });
}
```

**Oplossing 2: Backend HTTP caching headers**
```python
from fastapi import Response

@router.get("/{journey_id}")
def get_journey_detail(..., response: Response):
    # ... query logic ...

    # Cache voor 5 minuten
    response.headers["Cache-Control"] = "private, max-age=300"

    return journey_detail
```

**Geschatte verbetering:** Herhaalde loads instant (0ms vs 600ms)
**Effort:** 2-3 uur
**Priority:** 🟡 MEDIUM

---

#### 🟢 **CRITICAL #5: Geen Progressive Loading**
**Impact:** MEDIUM - Pagina voelt traag zelfs als data snel is
**Locatie:** Dashboard + Chapter pages

**Probleem:**
Dashboard wacht op ALLE data voor rendering:
```typescript
if (isLoading && !journey) {
  return <DashboardSkeleton />;
}
```

Maar: Hero section heeft alleen `progressPercent` en `completedChapters` nodig
Timeline component heeft alleen `journey.id` nodig

**Oplossing: Progressive Enhancement**
```typescript
function DashboardContent() {
  const { journey, profile, isLoading } = useJourneyBootstrap();

  // Render wat we al hebben
  return (
    <AppShell title={profile?.displayName ? `Welkom, ${profile.displayName}` : 'Dashboard'}>
      {/* Hero - render meteen met placeholder data */}
      <HeroSection
        progressPercent={journey?.journeyProgress?.percentComplete ?? 0}
        isLoading={isLoading}
      />

      {/* Timeline - render zodra journey.id beschikbaar is */}
      {journey?.id ? (
        <Timeline journeyId={journey.id} />
      ) : (
        <TimelineSkeleton />
      )}

      {/* Sidebar - render zodra basic data er is */}
      <Sidebar journey={journey} isLoading={isLoading} />
    </AppShell>
  );
}
```

**Geschatte verbetering:** Perceived load time 40% sneller
**Effort:** 2 uur
**Priority:** 🟢 MEDIUM

---

## 🎯 Implementatie Plan

### **Fase 1: Quick Wins (Dag 1-2)** ⚡

**Prioriteit: Critical path optimalisaties**

1. **Fix N+1 Queries (Hoogste impact)**
   - [ ] Voeg eager loading toe aan `get_journey_detail()` endpoint
   - [ ] Test dat alle relaties correct laden
   - [ ] Voeg database query logging toe om te verifiëren
   - **Files:** `app/api/v1/routes/journeys.py`, `app/models/journey.py`
   - **Testing:** `curl` + check logs voor aantal queries
   - **Success metric:** < 5 queries (was: 12+)

2. **Database Indexes**
   - [ ] Check huidige indexes in Neon.tech
   - [ ] Maak Alembic migration voor missing indexes
   - [ ] Apply migration: `alembic upgrade head`
   - **Files:** `alembic/versions/YYYYMMDD_add_performance_indexes.py`
   - **Testing:** `EXPLAIN ANALYZE` queries in Neon
   - **Success metric:** Query execution time < 50ms

3. **Fix Dubbele Lockfiles**
   - [ ] Remove root package-lock.json
   - [ ] Remove root node_modules
   - [ ] Rebuild frontend
   - **Commands:** See above
   - **Success metric:** Smaller bundle size

**Geschatte totale verbetering:** Dashboard load 600ms → 200ms (3x sneller!)
**Total effort:** 4-6 uur

---

### **Fase 2: Bundle Optimalisatie (Dag 3-4)** 📦

4. **Next.js Bundle Optimizations**
   - [ ] Update `next.config.ts` met optimalisaties
   - [ ] Implement code splitting voor Timeline component
   - [ ] Tree-shake lucide-react icons
   - [ ] Test production build sizes
   - **Files:** `next.config.ts`, `app/dashboard/page.tsx`
   - **Success metric:** 142 kB → < 100 kB

5. **Lazy Loading Heavy Components**
   - [ ] Lazy load OnboardingModal
   - [ ] Lazy load JourneyExperience component
   - [ ] Lazy load Family components
   - **Pattern:** `dynamic(() => import('...'))`
   - **Success metric:** Initial JS bundle < 80 kB

**Geschatte totale verbetering:** First load 2s → 1s (2x sneller!)
**Total effort:** 4-6 uur

---

### **Fase 3: Caching & State (Dag 5-6)** 💾

6. **React Query Integration**
   - [ ] Install @tanstack/react-query
   - [ ] Setup QueryClientProvider
   - [ ] Migrate useJourneyBootstrap to useQuery
   - [ ] Add query invalidation op mutations
   - **Files:** `lib/query-client.ts`, hooks, providers
   - **Success metric:** Instant navigation to cached pages

7. **Backend Caching Headers**
   - [ ] Add Cache-Control headers to journeys endpoint
   - [ ] Add ETag support
   - [ ] Test browser caching behavior
   - **Files:** `app/api/v1/routes/journeys.py`
   - **Success metric:** Browser cache hits > 80%

**Geschatte totale verbetering:** Herhaalde loads instant!
**Total effort:** 3-4 uur

---

### **Fase 4: Progressive Enhancement (Dag 7)** 🎨

8. **Progressive Loading UX**
   - [ ] Render hero section immediately
   - [ ] Stream timeline data
   - [ ] Show skeletons voor slow components
   - **Files:** `app/dashboard/page.tsx`, components
   - **Success metric:** Perceived load < 500ms

9. **Image Optimization**
   - [ ] Convert PNG logo to optimized WebP/AVIF
   - [ ] Add Next.js Image component everywhere
   - [ ] Lazy load below-fold images
   - **Files:** `public/`, image components
   - **Success metric:** Logo < 10 kB (was: ??)

**Total effort:** 2-3 uur

---

## 📈 Success Metrics

### Before (Huidige situatie)
- **Dashboard initial load:** ~2-3 seconden
- **Database queries per request:** 12+
- **Bundle size:** 142 kB
- **Herhaalde loads:** Even traag als eerste keer
- **Perceived performance:** Traag

### After (Target)
- **Dashboard initial load:** < 1 seconde ✨
- **Database queries per request:** 2-3 (eager loading)
- **Bundle size:** < 90 kB
- **Herhaalde loads:** Instant (cached)
- **Perceived performance:** Wereldklasse

---

## 🔧 Monitoring & Verificatie

### Backend Performance Monitoring

**Add query logging:**
```python
# app/core/config.py
database_url: str = "postgresql://...?echo=True"  # Development only!

# Of via middleware:
import time
from fastapi import Request

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    print(f"{request.method} {request.url.path} - {process_time*1000:.2f}ms")
    return response
```

### Frontend Performance Monitoring

**Add Web Vitals:**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Chrome DevTools:**
- Lighthouse score target: > 90
- First Contentful Paint: < 1s
- Largest Contentful Paint: < 2s
- Time to Interactive: < 3s

---

## 🚨 Risico's & Aandachtspunten

### Database Eager Loading
**Risico:** Te veel data in één query kan memory issues geven
**Mitigatie:**
- Monitor query execution time
- Limit transcript/media results als > 100 items
- Pagineer highlights/transcripts

### Bundle Splitting
**Risico:** Te veel splits = meer HTTP requests
**Mitigatie:**
- Alleen split components > 20 kB
- Keep shared chunks optimaal

### Caching
**Risico:** Stale data na mutations
**Mitigatie:**
- Invalidate cache na create/update/delete
- Use optimistic updates voor betere UX

---

## 🎓 Best Practices voor Toekomst

1. **Altijd eager load relaties** - Voorkom N+1
2. **Database indexes op foreign keys** - Standaard
3. **React Query voor alle data fetching** - Caching + deduplication
4. **Code splitting voor routes** - Next.js doet dit automatisch
5. **Monitor bundle sizes** - In CI/CD pipeline
6. **Use Web Vitals** - Track real user performance

---

## 📝 Testing Checklist

### Performance Testing
- [ ] Dashboard load < 1s (gemeten met DevTools)
- [ ] Chapter page < 800ms
- [ ] API endpoint < 200ms (backend only)
- [ ] Database queries < 5 per request
- [ ] Bundle size dashboard < 100 kB
- [ ] Lighthouse score > 90
- [ ] Herhaalde loads instant (cached)

### Functional Testing
- [ ] Alle data correct geladen
- [ ] Navigatie werkt smooth
- [ ] Offline queue blijft werken
- [ ] Auth flow ongewijzigd
- [ ] Media upload ongewijzigd

### Load Testing
- [ ] Test met 10+ media assets per journey
- [ ] Test met 100+ transcripts
- [ ] Test met slow 3G network (Chrome throttling)

---

## 🏁 Conclusie

**Total effort:** 5-7 dagen (1 week)
**Expected improvement:**
- **Initial load:** 2-3s → < 1s (3x sneller)
- **Herhaalde loads:** 2-3s → instant (∞ sneller)
- **Database load:** 12+ queries → 2-3 queries (6x minder)
- **User experience:** Traag → Wereldklasse ✨

**ROI:** ZEER HOOG - Performance is feature #1 voor user satisfaction!

---

**Laatste update:** 17 december 2025
**Status:** 📋 Ready for implementation
