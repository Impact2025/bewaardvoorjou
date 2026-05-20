# Gedachte Inspreken - Technisch Implementatieplan

> "De kladblok voor je levensverhaal" - Een wereldklasse feature voor Bewaardvoorjou

---

## Executive Summary

De **Gedachte Inspreken** feature transformeert Bewaardvoorjou van een "interview app" naar een "begeleidings app". Gebruikers kunnen spontane gedachten, flarden en herinneringen vastleggen zonder de druk van een definitieve opname. De AI verzamelt deze kladjes en gebruikt ze om diepere, persoonlijkere interview-vragen te genereren.

### Kernprincipes
1. **Lage drempel** - Geen perfectie vereist, gewoon beginnen
2. **Async verwerking** - Gebruiker wacht nooit op transcriptie
3. **AI als assistent** - Automatisch taggen, categoriseren, en verbinden
4. **Naadloze integratie** - Kladjes vloeien natuurlijk naar het echte interview

---

## 1. Database Architectuur

### 1.1 Nieuw Model: QuickThought

```python
# life-journey-backend/app/models/quick_thought.py

class QuickThought(Base):
    """
    Snelle gedachten/voice memos - het kladblok voor herinneringen.

    Kenmerken:
    - Korter dan reguliere opnames (10s - 3min)
    - Optioneel gekoppeld aan hoofdstuk
    - Automatisch getranscribeerd en getagd
    - Gebruikt door AI voor context bij interview
    """
    __tablename__ = "quick_thought"

    # Identity
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    journey_id = Column(String(36), ForeignKey("journey.id", ondelete="CASCADE"), nullable=False, index=True)
    chapter_id = Column(String(32), nullable=True, index=True)

    # Content
    modality = Column(String(16), nullable=False)  # "text" | "audio" | "video"
    object_key = Column(String(512), nullable=True)  # S3/local storage path
    text_content = Column(Text, nullable=True)  # Voor text mode

    # Metadata
    title = Column(String(200), nullable=True)  # Optionele titel
    duration_seconds = Column(Integer, nullable=True)
    size_bytes = Column(Integer, nullable=True)

    # Transcriptie
    transcript = Column(Text, nullable=True)
    transcript_status = Column(String(32), default="pending")  # pending | processing | ready | failed

    # AI Analyse
    auto_category = Column(String(32), nullable=True)
    auto_tags = Column(JSON, default=list)
    emotion_score = Column(Float, nullable=True)  # 0.0 (negatief) - 1.0 (positief)
    ai_summary = Column(String(500), nullable=True)  # Korte AI-samenvatting
    suggested_chapters = Column(JSON, default=list)  # [{chapter_id, confidence, reason}]

    # Status
    processing_status = Column(String(32), default="pending")  # pending | processing | ready
    is_used_in_interview = Column(Boolean, default=False)  # Marker dat AI dit heeft gebruikt
    used_in_interview_at = Column(DateTime, nullable=True)

    # Lifecycle
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    archived_at = Column(DateTime, nullable=True)

    # Relationships
    journey = relationship("Journey", backref="quick_thoughts")
```

### 1.2 Database Migratie

```python
# Alembic migration
def upgrade():
    op.create_table(
        'quick_thought',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('journey_id', sa.String(36), sa.ForeignKey('journey.id', ondelete='CASCADE'), nullable=False),
        sa.Column('chapter_id', sa.String(32), nullable=True),
        sa.Column('modality', sa.String(16), nullable=False),
        sa.Column('object_key', sa.String(512), nullable=True),
        sa.Column('text_content', sa.Text, nullable=True),
        sa.Column('title', sa.String(200), nullable=True),
        sa.Column('duration_seconds', sa.Integer, nullable=True),
        sa.Column('size_bytes', sa.Integer, nullable=True),
        sa.Column('transcript', sa.Text, nullable=True),
        sa.Column('transcript_status', sa.String(32), default='pending'),
        sa.Column('auto_category', sa.String(32), nullable=True),
        sa.Column('auto_tags', sa.JSON, default=[]),
        sa.Column('emotion_score', sa.Float, nullable=True),
        sa.Column('ai_summary', sa.String(500), nullable=True),
        sa.Column('suggested_chapters', sa.JSON, default=[]),
        sa.Column('processing_status', sa.String(32), default='pending'),
        sa.Column('is_used_in_interview', sa.Boolean, default=False),
        sa.Column('used_in_interview_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('archived_at', sa.DateTime, nullable=True),
    )
    op.create_index('ix_quick_thought_journey_id', 'quick_thought', ['journey_id'])
    op.create_index('ix_quick_thought_chapter_id', 'quick_thought', ['chapter_id'])
    op.create_index('ix_quick_thought_created_at', 'quick_thought', ['created_at'])
```

---

## 2. Backend API

### 2.1 Nieuwe Routes

```
POST   /api/v1/quick-thoughts                    → Create (text mode)
POST   /api/v1/quick-thoughts/presign            → Get upload URL
POST   /api/v1/quick-thoughts/{id}/complete      → Mark upload complete
GET    /api/v1/quick-thoughts                    → List all (with filters)
GET    /api/v1/quick-thoughts/{id}               → Get single
GET    /api/v1/quick-thoughts/for-chapter/{cid}  → Get thoughts for chapter
PATCH  /api/v1/quick-thoughts/{id}               → Update (title, tags)
DELETE /api/v1/quick-thoughts/{id}               → Delete
POST   /api/v1/quick-thoughts/{id}/link/{cid}    → Link to chapter
POST   /api/v1/quick-thoughts/{id}/archive       → Soft delete
```

### 2.2 Schemas

```python
# life-journey-backend/app/schemas/quick_thought.py

class QuickThoughtCreate(BaseModel):
    """Voor text-only quick thoughts"""
    text_content: str = Field(..., min_length=1, max_length=5000)
    title: Optional[str] = Field(None, max_length=200)
    chapter_id: Optional[str] = None

class QuickThoughtPresignRequest(BaseModel):
    """Request voor audio/video upload URL"""
    modality: Literal["audio", "video"]
    filename: str
    content_type: str
    chapter_id: Optional[str] = None

class QuickThoughtPresignResponse(BaseModel):
    """Response met upload URL"""
    thought_id: str
    upload_url: str
    object_key: str

class QuickThoughtResponse(BaseModel):
    """Volledige quick thought response"""
    id: str
    journey_id: str
    chapter_id: Optional[str]
    modality: str

    # Content
    text_content: Optional[str]
    media_url: Optional[str]  # Presigned URL voor playback
    title: Optional[str]
    duration_seconds: Optional[int]

    # Transcriptie
    transcript: Optional[str]
    transcript_status: str

    # AI Analyse
    auto_category: Optional[str]
    auto_tags: List[str]
    emotion_score: Optional[float]
    ai_summary: Optional[str]
    suggested_chapters: List[dict]

    # Status
    processing_status: str
    is_used_in_interview: bool

    # Timestamps
    created_at: datetime
    updated_at: datetime

class QuickThoughtUpdate(BaseModel):
    """Voor updates"""
    title: Optional[str] = Field(None, max_length=200)
    auto_tags: Optional[List[str]] = None
    chapter_id: Optional[str] = None

class QuickThoughtListResponse(BaseModel):
    """Paginated list"""
    items: List[QuickThoughtResponse]
    total: int
    has_more: bool
```

### 2.3 Route Implementatie

```python
# life-journey-backend/app/api/v1/routes/quick_thoughts.py

router = APIRouter(prefix="/quick-thoughts", tags=["quick-thoughts"])

@router.post("", response_model=QuickThoughtResponse)
async def create_text_thought(
    data: QuickThoughtCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Maak een text-only quick thought.
    Direct klaar voor AI analyse.
    """
    journey = await get_user_journey(db, current_user.id)

    thought = QuickThought(
        journey_id=journey.id,
        chapter_id=data.chapter_id,
        modality="text",
        text_content=data.text_content,
        title=data.title,
        transcript=data.text_content,  # Text = transcript
        transcript_status="ready",
        processing_status="pending"
    )
    db.add(thought)
    await db.commit()

    # Trigger async AI analyse
    enqueue_analyze_quick_thought.delay(thought.id)

    return thought

@router.post("/presign", response_model=QuickThoughtPresignResponse)
async def presign_upload(
    data: QuickThoughtPresignRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Vraag een presigned URL aan voor audio/video upload.
    """
    journey = await get_user_journey(db, current_user.id)

    # Genereer unieke object key
    ext = Path(data.filename).suffix or ".webm"
    object_key = f"quick-thoughts/{journey.id}/{uuid4()}{ext}"

    # Maak thought record
    thought = QuickThought(
        journey_id=journey.id,
        chapter_id=data.chapter_id,
        modality=data.modality,
        object_key=object_key,
        processing_status="pending",
        transcript_status="pending"
    )
    db.add(thought)
    await db.commit()

    # Genereer presigned URL
    upload_url = await generate_presigned_upload_url(
        object_key=object_key,
        content_type=data.content_type,
        expires_in=900  # 15 minuten
    )

    return QuickThoughtPresignResponse(
        thought_id=thought.id,
        upload_url=upload_url,
        object_key=object_key
    )

@router.post("/{thought_id}/complete", status_code=202)
async def complete_upload(
    thought_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Markeer upload als compleet.
    Triggert transcriptie en AI analyse.
    """
    thought = await get_thought_for_user(db, thought_id, current_user.id)

    # Start async verwerking
    thought.processing_status = "processing"
    await db.commit()

    # Chain: transcribe → analyze
    chain(
        transcribe_quick_thought.s(thought.id),
        analyze_quick_thought.s()
    ).delay()

    return {"status": "processing", "thought_id": thought.id}

@router.get("", response_model=QuickThoughtListResponse)
async def list_thoughts(
    chapter_id: Optional[str] = None,
    modality: Optional[str] = None,
    include_archived: bool = False,
    unused_only: bool = False,
    limit: int = Query(20, le=100),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lijst alle quick thoughts met filtering.

    Filters:
    - chapter_id: Filter op hoofdstuk
    - modality: "text" | "audio" | "video"
    - include_archived: Toon ook gearchiveerde
    - unused_only: Alleen niet-gebruikte in interview
    """
    journey = await get_user_journey(db, current_user.id)

    query = select(QuickThought).where(
        QuickThought.journey_id == journey.id
    )

    if chapter_id:
        query = query.where(QuickThought.chapter_id == chapter_id)
    if modality:
        query = query.where(QuickThought.modality == modality)
    if not include_archived:
        query = query.where(QuickThought.archived_at.is_(None))
    if unused_only:
        query = query.where(QuickThought.is_used_in_interview == False)

    query = query.order_by(QuickThought.created_at.desc())
    query = query.offset(offset).limit(limit + 1)

    result = await db.execute(query)
    items = result.scalars().all()

    has_more = len(items) > limit
    items = items[:limit]

    # Add media URLs
    for item in items:
        if item.object_key:
            item.media_url = await generate_presigned_download_url(item.object_key)

    return QuickThoughtListResponse(
        items=items,
        total=len(items),  # For full count, run separate query
        has_more=has_more
    )

@router.get("/for-interview/{chapter_id}")
async def get_thoughts_for_interview(
    chapter_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Haal relevante quick thoughts op voor AI interview.

    Returns:
    - Niet-gebruikte thoughts voor dit hoofdstuk
    - + thoughts zonder hoofdstuk met hoge relevantie-score
    """
    journey = await get_user_journey(db, current_user.id)

    # Direct gekoppelde thoughts
    direct = await db.execute(
        select(QuickThought)
        .where(QuickThought.journey_id == journey.id)
        .where(QuickThought.chapter_id == chapter_id)
        .where(QuickThought.is_used_in_interview == False)
        .where(QuickThought.archived_at.is_(None))
        .where(QuickThought.processing_status == "ready")
    )
    direct_thoughts = direct.scalars().all()

    # Suggested thoughts (via AI)
    suggested = await db.execute(
        select(QuickThought)
        .where(QuickThought.journey_id == journey.id)
        .where(QuickThought.chapter_id.is_(None))
        .where(QuickThought.is_used_in_interview == False)
        .where(QuickThought.archived_at.is_(None))
        .where(QuickThought.processing_status == "ready")
        .where(
            func.json_extract(QuickThought.suggested_chapters, f'$[*].chapter_id')
            .contains(chapter_id)
        )
    )
    suggested_thoughts = suggested.scalars().all()

    return {
        "direct": [t.to_dict() for t in direct_thoughts],
        "suggested": [t.to_dict() for t in suggested_thoughts],
        "total_unused": len(direct_thoughts) + len(suggested_thoughts)
    }
```

---

## 3. AI Services

### 3.1 Transcriptie Service

```python
# life-journey-backend/app/services/ai/quick_thought_processor.py

@shared_task(bind=True, max_retries=3)
def transcribe_quick_thought(self, thought_id: str) -> str:
    """
    Transcribeer audio/video quick thought.
    Returns thought_id voor chaining.
    """
    with get_db_session() as db:
        thought = db.query(QuickThought).get(thought_id)

        if thought.modality == "text":
            # Text needs no transcription
            thought.transcript_status = "ready"
            db.commit()
            return thought_id

        try:
            thought.transcript_status = "processing"
            db.commit()

            # Download file from storage
            audio_data = download_from_storage(thought.object_key)

            # Transcribe with Whisper
            transcript = transcribe_audio(
                audio_data,
                filename=thought.object_key,
                language="nl"
            )

            # Calculate duration
            duration = get_audio_duration(audio_data)

            thought.transcript = transcript
            thought.transcript_status = "ready"
            thought.duration_seconds = duration
            db.commit()

            return thought_id

        except Exception as e:
            thought.transcript_status = "failed"
            db.commit()
            raise self.retry(exc=e, countdown=60)
```

### 3.2 AI Analyse Service

```python
@shared_task
def analyze_quick_thought(thought_id: str):
    """
    AI analyse: categoriseer, tag, en vind relevante hoofdstukken.
    """
    with get_db_session() as db:
        thought = db.query(QuickThought).get(thought_id)

        if not thought.transcript:
            return

        # Build prompt
        prompt = build_analysis_prompt(thought.transcript)

        # Call Claude
        response = call_claude(
            system=QUICK_THOUGHT_ANALYSIS_SYSTEM_PROMPT,
            user=prompt,
            response_format="json"
        )

        analysis = json.loads(response)

        thought.auto_category = analysis.get("category")
        thought.auto_tags = analysis.get("tags", [])
        thought.emotion_score = analysis.get("emotion_score")
        thought.ai_summary = analysis.get("summary")
        thought.suggested_chapters = analysis.get("suggested_chapters", [])
        thought.processing_status = "ready"

        db.commit()


QUICK_THOUGHT_ANALYSIS_SYSTEM_PROMPT = """
Je bent een empathische AI-assistent die helpt bij het vastleggen van levensverhalen.

Analyseer de volgende korte gedachte of herinnering en geef een JSON response.

**Categorieën** (kies één):
- jeugd: Herinneringen uit de kindertijd
- familie: Familie, ouders, kinderen, verwanten
- liefde: Romantische relaties, partner
- vriendschap: Vrienden, sociale kring
- werk: Carrière, beroep, collega's
- school: Opleiding, studie, leraren
- reizen: Plekken, vakanties, avonturen
- verlies: Afscheid, rouw, gemis
- trots: Prestaties, overwinningen
- wijsheid: Levenslessen, inzichten
- humor: Grappige momenten
- traditie: Gewoontes, rituelen, feestdagen

**Tags** (max 5, vrije keuze):
- Korte, beschrijvende woorden
- Personen (relatie, niet naam): "opa", "beste vriend"
- Emoties: "nostalgisch", "dankbaar"
- Thema's: "oorlog", "verhuizing"

**Hoofdstukken** (suggereer max 2):
Beschikbare hoofdstukken:
1. vroege-jeugd - "De Eerste Jaren" (0-6 jaar)
2. kindertijd - "Kindertijd" (6-12 jaar)
3. tienerjaren - "Tienerjaren" (12-18 jaar)
4. jong-volwassene - "Jong Volwassene" (18-30 jaar)
5. volwassenheid - "Volwassenheid" (30-50 jaar)
6. latere-jaren - "De Latere Jaren" (50+ jaar)
7. familie-roots - "Familie Roots"
8. liefde-relaties - "Liefde & Relaties"
9. werk-carriere - "Werk & Carrière"
10. vriendschappen - "Vriendschappen"
11. uitdagingen - "Uitdagingen & Overwinningen"
12. passies - "Passies & Interesses"
13. reizen - "Reizen & Avontuur"
14. levenslessen - "Levenslessen"
15. dromen - "Dromen & Toekomst"
16. nalatenschap - "Nalatenschap"
17. kernwoorden - "Kernwoorden van je Leven"
18. boodschap - "Boodschap aan de Toekomst"

**Output formaat (JSON)**:
{
    "category": "string",
    "tags": ["string"],
    "emotion_score": 0.0-1.0,
    "summary": "Eén zin samenvatting (max 100 karakters)",
    "suggested_chapters": [
        {
            "chapter_id": "string",
            "confidence": 0.0-1.0,
            "reason": "Korte uitleg waarom dit hoofdstuk past"
        }
    ]
}

**Belangrijk**:
- Wees voorzichtig met emotie-score; neutraal = 0.5
- Suggereer alleen hoofdstukken met confidence > 0.6
- De samenvatting moet de essentie vangen zonder details te verliezen
- Respecteer de privacy: geen namen, alleen relaties
"""
```

### 3.3 Interview Context Builder

```python
# life-journey-backend/app/services/ai/interviewer.py

async def build_interview_context_with_thoughts(
    db: AsyncSession,
    journey_id: str,
    chapter_id: str
) -> dict:
    """
    Bouw rijke context voor AI interview door quick thoughts te integreren.
    """
    # Haal relevante thoughts op
    thoughts = await get_thoughts_for_interview(db, journey_id, chapter_id)

    context = {
        "chapter_id": chapter_id,
        "chapter_info": get_chapter_context(chapter_id),
        "previous_answers": await get_previous_answers(db, journey_id, chapter_id),
        "quick_thoughts": []
    }

    for thought in thoughts["direct"] + thoughts["suggested"]:
        context["quick_thoughts"].append({
            "content": thought.transcript or thought.text_content,
            "summary": thought.ai_summary,
            "tags": thought.auto_tags,
            "emotion": thought.emotion_score,
            "created_at": thought.created_at.isoformat()
        })

    return context


INTERVIEW_PROMPT_WITH_THOUGHTS = """
Je bent een warme, empathische interviewer voor het vastleggen van levensverhalen.

**Hoofdstuk:** {chapter_name}
**Context:** {chapter_description}

**Eerdere antwoorden in dit hoofdstuk:**
{previous_answers}

**Recente gedachten en notities van de gebruiker:**
{quick_thoughts_formatted}

---

De gebruiker heeft de afgelopen tijd enkele korte gedachten en flarden gedeeld.
Gebruik deze als inspiratie voor je vraag:

- Als ze een persoon noemden, vraag naar die relatie
- Als ze een emotie deelden, vraag naar de context
- Als ze een plek noemden, vraag naar herinneringen daar
- Als ze iets vaags zeiden, help ze dat te concretiseren

**Genereer één open, uitnodigende vraag die:**
1. Aansluit bij de gedeelde gedachten
2. De gebruiker helpt dieper te gaan
3. Warm en niet-oordelend is
4. Maximaal 2 zinnen lang is

**Voorbeeld:**
Als gedachte was: "Iets met die oude rode fiets... en oom Henk"
Dan vraag je: "Je noemde een rode fiets en je oom Henk. Wat maakte dat moment met hem zo bijzonder?"

Vraag:
"""


async def generate_question_with_thoughts(
    db: AsyncSession,
    journey_id: str,
    chapter_id: str
) -> str:
    """
    Genereer interview vraag met context van quick thoughts.
    """
    context = await build_interview_context_with_thoughts(db, journey_id, chapter_id)

    # Format thoughts for prompt
    thoughts_text = ""
    for i, t in enumerate(context["quick_thoughts"], 1):
        thoughts_text += f"\n{i}. \"{t['content'][:200]}...\""
        if t["summary"]:
            thoughts_text += f"\n   (Samenvatting: {t['summary']})"
        if t["tags"]:
            thoughts_text += f"\n   (Tags: {', '.join(t['tags'])})"

    if not thoughts_text:
        thoughts_text = "(Geen recente gedachten gedeeld)"

    prompt = INTERVIEW_PROMPT_WITH_THOUGHTS.format(
        chapter_name=context["chapter_info"]["title"],
        chapter_description=context["chapter_info"]["description"],
        previous_answers=context["previous_answers"] or "(Nog geen antwoorden)",
        quick_thoughts_formatted=thoughts_text
    )

    response = await call_claude(
        system="Je bent een warme interviewer voor levensverhalen.",
        user=prompt,
        max_tokens=150
    )

    # Mark thoughts as used
    for thought in context["quick_thoughts"]:
        await mark_thought_used(db, thought["id"])

    return response.strip()
```

---

## 4. Frontend Implementatie

### 4.1 Component Structuur

```
src/
├── app/
│   ├── thoughts/                    # Nieuwe pagina
│   │   ├── page.tsx                 # Overzicht
│   │   └── [id]/page.tsx            # Detail view
│   └── record/
│       └── page.tsx                 # Bestaand (+ integratie)
│
├── components/
│   └── quick-thoughts/
│       ├── index.tsx                # Exports
│       ├── QuickThoughtRecorder.tsx # Opname widget
│       ├── QuickThoughtCard.tsx     # Kaart in lijst
│       ├── QuickThoughtList.tsx     # Lijst component
│       ├── QuickThoughtDetail.tsx   # Detail view
│       ├── QuickThoughtFAB.tsx      # Floating Action Button
│       └── ThoughtsForChapter.tsx   # Toon in chapter context
│
├── lib/
│   ├── api/
│   │   └── quick-thoughts.ts        # API client
│   └── stores/
│       └── quick-thoughts-store.ts  # Zustand store
```

### 4.2 QuickThoughtRecorder Component

```typescript
// src/components/quick-thoughts/QuickThoughtRecorder.tsx

"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Video, Type, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuickThoughts } from "@/lib/stores/quick-thoughts-store";
import { cn } from "@/lib/utils";

type Mode = "text" | "audio" | "video";

interface QuickThoughtRecorderProps {
  chapterId?: string;
  onComplete?: (thoughtId: string) => void;
  onCancel?: () => void;
  compact?: boolean;
}

export function QuickThoughtRecorder({
  chapterId,
  onComplete,
  onCancel,
  compact = false
}: QuickThoughtRecorderProps) {
  const [mode, setMode] = useState<Mode>("audio");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [textContent, setTextContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { createTextThought, uploadMediaThought } = useQuickThoughts();

  // Start audio/video recording
  const startRecording = useCallback(async () => {
    try {
      const constraints = mode === "video"
        ? { video: true, audio: true }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mode === "video" ? "video/webm" : "audio/webm"
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mode === "video" ? "video/webm" : "audio/webm"
        });
        setMediaBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);

    } catch (error) {
      console.error("Recording error:", error);
    }
  }, [mode]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  // Submit thought
  const handleSubmit = async () => {
    setIsUploading(true);

    try {
      let thoughtId: string;

      if (mode === "text") {
        thoughtId = await createTextThought({
          text_content: textContent,
          chapter_id: chapterId
        });
      } else if (mediaBlob) {
        thoughtId = await uploadMediaThought({
          blob: mediaBlob,
          modality: mode,
          chapter_id: chapterId
        });
      } else {
        throw new Error("No content to submit");
      }

      onComplete?.(thoughtId);
      reset();

    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Reset state
  const reset = () => {
    setTextContent("");
    setMediaBlob(null);
    setRecordingTime(0);
    setIsRecording(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const hasContent = mode === "text" ? textContent.length > 0 : mediaBlob !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-2xl shadow-lg border border-warm-200 overflow-hidden",
        compact ? "p-4" : "p-6"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium text-warm-900">
            Gedachte inspreken
          </h3>
          <p className="text-sm text-warm-600">
            Geen perfectie nodig, gewoon beginnen
          </p>
        </div>
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 mb-4">
        {[
          { mode: "audio" as Mode, icon: Mic, label: "Audio" },
          { mode: "video" as Mode, icon: Video, label: "Video" },
          { mode: "text" as Mode, icon: Type, label: "Tekst" }
        ].map(({ mode: m, icon: Icon, label }) => (
          <Button
            key={m}
            variant={mode === m ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setMode(m);
              reset();
            }}
            disabled={isRecording}
            className={cn(
              "flex-1",
              mode === m && "bg-primary-600"
            )}
          >
            <Icon className="w-4 h-4 mr-1" />
            {label}
          </Button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[120px] mb-4">
        <AnimatePresence mode="wait">
          {mode === "text" ? (
            <motion.div
              key="text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Schrijf je gedachte hier... Het hoeft niet perfect te zijn."
                className="min-h-[100px] resize-none"
                maxLength={5000}
              />
              <div className="text-xs text-warm-500 mt-1 text-right">
                {textContent.length}/5000
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="media"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-[120px]"
            >
              {isRecording ? (
                <div className="text-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                      <div className="w-4 h-4 rounded-full bg-red-500" />
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-mono text-warm-900">
                    {formatTime(recordingTime)}
                  </div>
                  <div className="text-sm text-warm-600">
                    Opnemen...
                  </div>
                </div>
              ) : mediaBlob ? (
                <div className="text-center">
                  <div className="text-4xl mb-2">✓</div>
                  <div className="text-warm-900">
                    {formatTime(recordingTime)} opgenomen
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={reset}
                  >
                    Opnieuw
                  </Button>
                </div>
              ) : (
                <div className="text-center text-warm-600">
                  <div className="text-4xl mb-2">
                    {mode === "audio" ? "🎙️" : "📹"}
                  </div>
                  <div>Druk op de knop om te beginnen</div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {mode !== "text" && !mediaBlob && (
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "destructive" : "default"}
            className="flex-1"
          >
            {isRecording ? (
              <>Stop opname</>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Start opname
              </>
            )}
          </Button>
        )}

        {hasContent && (
          <Button
            onClick={handleSubmit}
            disabled={isUploading}
            className="flex-1 bg-primary-600 hover:bg-primary-700"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Bewaar gedachte
              </>
            )}
          </Button>
        )}
      </div>

      {/* Hint */}
      <p className="text-xs text-warm-500 mt-4 text-center">
        💡 Je kunt later kiezen bij welk hoofdstuk dit hoort
      </p>
    </motion.div>
  );
}
```

### 4.3 Floating Action Button (FAB)

```typescript
// src/components/quick-thoughts/QuickThoughtFAB.tsx

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickThoughtRecorder } from "./QuickThoughtRecorder";
import { cn } from "@/lib/utils";

interface QuickThoughtFABProps {
  chapterId?: string;
  className?: string;
}

export function QuickThoughtFAB({ chapterId, className }: QuickThoughtFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* FAB Button */}
      <motion.div
        className={cn(
          "fixed bottom-6 right-6 z-50",
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className={cn(
            "rounded-full w-14 h-14 shadow-lg",
            "bg-gradient-to-br from-amber-500 to-orange-600",
            "hover:from-amber-600 hover:to-orange-700"
          )}
        >
          <Lightbulb className="w-6 h-6" />
        </Button>

        {/* Pulse animation */}
        <motion.div
          className="absolute inset-0 rounded-full bg-amber-500"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Recorder */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[400px] z-50"
            >
              <QuickThoughtRecorder
                chapterId={chapterId}
                onComplete={() => setIsOpen(false)}
                onCancel={() => setIsOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

### 4.4 Zustand Store

```typescript
// src/lib/stores/quick-thoughts-store.ts

import { create } from "zustand";
import { api } from "@/lib/api";

interface QuickThought {
  id: string;
  journey_id: string;
  chapter_id?: string;
  modality: "text" | "audio" | "video";
  text_content?: string;
  media_url?: string;
  title?: string;
  duration_seconds?: number;
  transcript?: string;
  transcript_status: string;
  auto_category?: string;
  auto_tags: string[];
  emotion_score?: number;
  ai_summary?: string;
  suggested_chapters: Array<{
    chapter_id: string;
    confidence: number;
    reason: string;
  }>;
  processing_status: string;
  is_used_in_interview: boolean;
  created_at: string;
  updated_at: string;
}

interface QuickThoughtsState {
  thoughts: QuickThought[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchThoughts: (filters?: {
    chapter_id?: string;
    modality?: string;
    unused_only?: boolean;
  }) => Promise<void>;

  createTextThought: (data: {
    text_content: string;
    title?: string;
    chapter_id?: string;
  }) => Promise<string>;

  uploadMediaThought: (data: {
    blob: Blob;
    modality: "audio" | "video";
    chapter_id?: string;
  }) => Promise<string>;

  updateThought: (id: string, data: Partial<QuickThought>) => Promise<void>;
  deleteThought: (id: string) => Promise<void>;
  linkToChapter: (thoughtId: string, chapterId: string) => Promise<void>;
}

export const useQuickThoughts = create<QuickThoughtsState>((set, get) => ({
  thoughts: [],
  isLoading: false,
  error: null,

  fetchThoughts: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.chapter_id) params.set("chapter_id", filters.chapter_id);
      if (filters?.modality) params.set("modality", filters.modality);
      if (filters?.unused_only) params.set("unused_only", "true");

      const response = await api.get(`/quick-thoughts?${params}`);
      set({ thoughts: response.data.items, isLoading: false });
    } catch (error) {
      set({ error: "Kon gedachten niet laden", isLoading: false });
    }
  },

  createTextThought: async (data) => {
    const response = await api.post("/quick-thoughts", data);
    set(state => ({
      thoughts: [response.data, ...state.thoughts]
    }));
    return response.data.id;
  },

  uploadMediaThought: async ({ blob, modality, chapter_id }) => {
    // 1. Get presigned URL
    const presignResponse = await api.post("/quick-thoughts/presign", {
      modality,
      filename: `recording.${modality === "video" ? "webm" : "webm"}`,
      content_type: modality === "video" ? "video/webm" : "audio/webm",
      chapter_id
    });

    const { thought_id, upload_url } = presignResponse.data;

    // 2. Upload blob
    await fetch(upload_url, {
      method: "PUT",
      body: blob,
      headers: {
        "Content-Type": modality === "video" ? "video/webm" : "audio/webm"
      }
    });

    // 3. Mark complete
    await api.post(`/quick-thoughts/${thought_id}/complete`);

    // 4. Add to local state (processing)
    const newThought: QuickThought = {
      id: thought_id,
      journey_id: "",
      chapter_id,
      modality,
      transcript_status: "processing",
      auto_tags: [],
      suggested_chapters: [],
      processing_status: "processing",
      is_used_in_interview: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    set(state => ({
      thoughts: [newThought, ...state.thoughts]
    }));

    return thought_id;
  },

  updateThought: async (id, data) => {
    await api.patch(`/quick-thoughts/${id}`, data);
    set(state => ({
      thoughts: state.thoughts.map(t =>
        t.id === id ? { ...t, ...data } : t
      )
    }));
  },

  deleteThought: async (id) => {
    await api.delete(`/quick-thoughts/${id}`);
    set(state => ({
      thoughts: state.thoughts.filter(t => t.id !== id)
    }));
  },

  linkToChapter: async (thoughtId, chapterId) => {
    await api.post(`/quick-thoughts/${thoughtId}/link/${chapterId}`);
    set(state => ({
      thoughts: state.thoughts.map(t =>
        t.id === thoughtId ? { ...t, chapter_id: chapterId } : t
      )
    }));
  }
}));
```

### 4.5 Integration in Record Page

```typescript
// src/app/record/page.tsx (toevoegingen)

import { ThoughtsForChapter } from "@/components/quick-thoughts/ThoughtsForChapter";
import { QuickThoughtFAB } from "@/components/quick-thoughts/QuickThoughtFAB";

export default function RecordPage() {
  const { chapterId } = useParams();

  return (
    <div className="min-h-screen">
      {/* Existing recorder UI */}
      <RecorderFrame chapterId={chapterId} />

      {/* Show relevant thoughts before recording */}
      <ThoughtsForChapter
        chapterId={chapterId}
        onThoughtUsed={(thought) => {
          // AI will reference this thought
        }}
      />

      {/* FAB for quick thoughts */}
      <QuickThoughtFAB chapterId={chapterId} />
    </div>
  );
}
```

### 4.6 ThoughtsForChapter Component

```typescript
// src/components/quick-thoughts/ThoughtsForChapter.tsx

"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";
import { useQuickThoughts } from "@/lib/stores/quick-thoughts-store";
import { cn } from "@/lib/utils";

interface ThoughtsForChapterProps {
  chapterId: string;
  className?: string;
}

export function ThoughtsForChapter({
  chapterId,
  className
}: ThoughtsForChapterProps) {
  const { thoughts, fetchThoughts, isLoading } = useQuickThoughts();

  useEffect(() => {
    fetchThoughts({ chapter_id: chapterId, unused_only: true });
  }, [chapterId]);

  const relevantThoughts = thoughts.filter(t =>
    t.processing_status === "ready" && !t.is_used_in_interview
  );

  if (isLoading || relevantThoughts.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className={cn(
        "bg-gradient-to-r from-amber-50 to-orange-50",
        "border border-amber-200 rounded-xl p-4 mb-6",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-amber-600" />
        <h3 className="font-medium text-warm-900">
          Je eerdere gedachten
        </h3>
        <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
          {relevantThoughts.length}
        </span>
      </div>

      <p className="text-sm text-warm-600 mb-3">
        De AI zal deze gebruiken om diepere vragen te stellen
      </p>

      <div className="space-y-2">
        <AnimatePresence>
          {relevantThoughts.slice(0, 3).map((thought, index) => (
            <motion.div
              key={thought.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm"
            >
              <div className="text-2xl">
                {thought.modality === "audio" ? "🎙️" :
                 thought.modality === "video" ? "📹" : "📝"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-warm-900 truncate">
                  {thought.ai_summary || thought.transcript?.slice(0, 100) || "..."}
                </p>
                <div className="flex gap-1 mt-1">
                  {thought.auto_tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-warm-100 text-warm-600 px-1.5 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-warm-400" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {relevantThoughts.length > 3 && (
        <button className="text-sm text-amber-600 hover:text-amber-700 mt-2">
          + {relevantThoughts.length - 3} meer gedachten
        </button>
      )}
    </motion.div>
  );
}
```

---

## 5. UX Flow

### 5.1 Hoofdstuk Selectie → Interview

```
┌─────────────────────────────────────────────────────────────────┐
│                        HOOFDSTUK: JEUGD                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  💭 Je hebt 3 gedachten over dit onderwerp              │   │
│  │                                                          │   │
│  │  🎙️ "Iets met die oude rode fiets..."                   │   │
│  │     Tags: nostalgisch, opa                               │   │
│  │                                                          │   │
│  │  📝 "De geur van appeltaart bij oma"                     │   │
│  │     Tags: familie, gezelligheid                          │   │
│  │                                                          │   │
│  │  De AI zal deze gebruiken voor diepere vragen            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │     "Je noemde een rode fiets en je opa.                │   │
│  │      Wat maakte dat moment zo bijzonder?"                │   │
│  │                                                          │   │
│  │              [🎙️ Start verhaal]                         │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                    [💡 Gedachte inspreken]                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Quick Thought Recording Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    GEDACHTE INSPREKEN                           │
│                                                                 │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐                        │
│   │  🎙️    │  │  📹    │  │  📝    │   ← Mode selector       │
│   │ Audio  │  │ Video  │  │ Tekst  │                          │
│   └─────────┘  └─────────┘  └─────────┘                        │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                          │   │
│   │                    ● 0:12                                │   │
│   │                   Opnemen...                             │   │
│   │                                                          │   │
│   │         (Pulserende animatie rondom microfoon)          │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│            [■ Stop opname]    [✓ Bewaar]                       │
│                                                                 │
│   💡 Geen perfectie nodig, gewoon beginnen                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Implementatie Volgorde

### Week 1: Backend Foundation
1. ✅ QuickThought model + migratie
2. ✅ Basic CRUD routes
3. ✅ Presign upload endpoint
4. ✅ Transcriptie integratie

### Week 2: AI Integration
1. ✅ Auto-tagging service
2. ✅ Chapter suggestion logic
3. ✅ Interview context builder
4. ✅ Prompt fine-tuning

### Week 3: Frontend Core
1. ✅ QuickThoughtRecorder component
2. ✅ Zustand store
3. ✅ FAB component
4. ✅ Basic list view

### Week 4: Polish & Integration
1. ✅ ThoughtsForChapter component
2. ✅ Interview flow integratie
3. ✅ Animaties & micro-interacties
4. ✅ Edge cases & error handling

---

## 7. Succes Metrics

| Metric | Target | Meting |
|--------|--------|--------|
| Adoptie | 60% van actieve gebruikers | % users met ≥1 quick thought |
| Frequentie | 3+ per week per user | Gemiddeld aantal thoughts/week |
| Conversie | 40% thoughts → interview | % thoughts gemarkeerd als "used" |
| Kwaliteit | 4.5/5 tevredenheid | User survey |
| Engagement | +25% sessieduur | Analytics |

---

## 8. Toekomstige Uitbreidingen

### Fase 2: Widgets
- Home screen widget (iOS/Android)
- Quick capture vanuit notificatie
- Siri/Google Assistant integratie

### Fase 3: Social
- Gedachten delen met familie
- Reacties op gedachten
- Gezamenlijke herinneringen

### Fase 4: AI Enhancement
- Emotie-detectie in stem
- Automatische tijdlijn-plaatsing
- Proactieve herinneringen ("Je noemde vorige week...")

---

*Dit plan is ontworpen voor wereldklasse implementatie van de "Gedachte Inspreken" feature.*
