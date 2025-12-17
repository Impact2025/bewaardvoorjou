# 🌟 World-Class AI Interviewer - Implementation Guide

**Versie:** 2.0 - World-Class Upgrade
**Datum:** December 17, 2025
**Score:** 6.1 → 8.5+ (Target: World-Class)

---

## 🎯 Wat Maakt Het Wereldklasse?

De AI interviewer is geüpgraded van "professioneel" naar "wereldklasse" niveau door:

### Voor (v1.0): Professioneel Interview
- ✅ Goede vragen
- ✅ AI-assisted
- ❌ Eén vraag per keer
- ❌ Keyword matching voor analyse
- ❌ Geen echte conversatie flow

### Na (v2.0): Wereldklasse Empathische Interviewer
- ✅ **Multi-turn conversaties** (3-7 exchanges)
- ✅ **Claude-powered analysis** (geen keywords meer)
- ✅ **Intelligente follow-ups** die details refereren
- ✅ **Weet wanneer verhaal compleet is**
- ✅ **Emotionele intelligentie**

---

## 🚀 Nieuwe Features

### 1. Multi-Turn Conversation System

**File:** `app/services/ai/conversation.py`

In plaats van één vraag, voert de AI nu natuurlijke gesprekken:

```
Turn 1 AI:  "Vertel eens over je oma's huis."
       User: "Dat stond in Amsterdam, bij de grachten..."

Turn 2 AI:  "Je noemde de grachten - welke geur associeer je met dat huis?"
       User: "Verse appeltaart die ze altijd bakte..."

Turn 3 AI:  "Die appeltaart klinkt bijzonder, wanneer bakte ze die?"
       User: "Elke zondag als we op bezoek kwamen..."

[AI detecteert verhaal is compleet → beëindigt natuurlijk]
```

**Key Classes:**

```python
class ConversationSession:
    """Manages multi-turn conversation for a chapter"""

    - start_conversation() → opening question
    - add_user_response() → analyzes response
    - generate_next_question() → intelligent follow-up
    - should_end_conversation() → detects completion
```

**Configuration:**
- `max_turns = 7` - Maximum aantal uitwisselingen
- `min_turns = 3` - Minimum voor completion check
- `story_depth >= 8` - Drempel voor "verhaal compleet"

---

### 2. Claude-Powered Transcript Analysis

**Was:** Keyword matching
```python
if "blij" in text:
    emotions.append("positive")
```

**Nu:** Claude AI analyse
```python
analysis = claude.analyze("""
Analyseer dit transcript:
- Emoties (nuance)
- Personen (met context)
- Thema's (diepgaand)
- Story depth (1-10)
- Follow-up topics
""")
```

**Output:**
```json
{
  "emotions": ["nostalgie", "warmte", "gemis"],
  "people": ["oma", "vader"],
  "places": ["Amsterdam", "grachtenhuis"],
  "themes": ["familie", "jeugd", "eten als liefde"],
  "story_depth": 7,
  "follow_up_topics": [
    "De specifieke gracht waar het huis stond",
    "Andere herinneringen aan oma's keuken",
    "Wat gebeurde er met het huis"
  ],
  "signals": []  // bijv. "story_complete"
}
```

---

### 3. Intelligent Follow-Up Generation

**Was:** Generieke vervolgvragen
```
"Vertel daar eens meer over."
"Hoe voelde dat?"
```

**Nu:** Specifieke, context-aware follow-ups
```
"Je noemde je oma's keuken - wat voor geur hing daar altijd?"
"Dat moment met je vader klinkt belangrijk, hoe voelde dat voor je?"
"Je stem verandert als je over haar praat, wat maakt dit zo speciaal?"
```

**AI Prompt Instructies:**
- Verwijs naar SPECIFIEK detail dat user noemde
- Vraag naar diepere betekenis/emotie
- Begin met "Je noemde..." of "Dat klinkt..."
- Max 15-20 woorden
- Natuurlijke toon

---

### 4. Conversation Completion Detection

De AI weet wanneer het verhaal "af" voelt:

**Signals:**
1. **Story depth score** >= 8/10
2. **Explicit endings**: "dat was het", "meer weet ik niet"
3. **Comprehensive answer**: alle aspecten gedekt
4. **Minimum turns** bereikt (3)

**Flow:**
```python
if conversation.should_end_conversation():
    return None  # Geen volgende vraag
else:
    return next_question  # Ga verder
```

---

## 📡 API Endpoints

### Start Conversation

```http
POST /api/v1/assistant/conversation/start

Request:
{
  "journey_id": "uuid",
  "chapter_id": "youth-favorite-place",
  "asset_id": "uuid"
}

Response:
{
  "session_id": "asset-id:timestamp",
  "opening_question": "Welke plek uit je jeugd mis je het meest?"
}
```

### Continue Conversation

```http
POST /api/v1/assistant/conversation/continue

Request:
{
  "session_id": "...",
  "response_text": "Het huis van mijn oma in Amsterdam..."
}

Response:
{
  "next_question": "Je noemde Amsterdam - welk deel precies?",
  "turn_number": 2,
  "conversation_complete": false,
  "story_depth": 6
}
```

### End Conversation

```http
POST /api/v1/assistant/conversation/end

Request:
{
  "session_id": "..."
}

Response:
{
  "total_turns": 5,
  "completed": true,
  "story_depth": 8,
  "key_themes": ["familie", "jeugd", "Amsterdam"],
  "people_mentioned": ["oma", "vader", "zus"]
}
```

---

## 🎨 Frontend Integration

### Voorbeeld Flow

```typescript
// 1. Start conversation
const { session_id, opening_question } = await startConversation({
  journey_id: journey.id,
  chapter_id: "youth-favorite-place",
  asset_id: asset.id
});

// Show opening question
showQuestion(opening_question);

// 2. User answers (via recording)
const transcript = await recordAndTranscribe();

// 3. Continue conversation
const { next_question, conversation_complete, story_depth } =
  await continueConversation({
    session_id,
    response_text: transcript
  });

if (conversation_complete) {
  // Show completion message
  showCompletion("Je verhaal is compleet!");
} else {
  // Show next question
  showQuestion(next_question);
  // Repeat step 2-3
}

// 4. End session
const summary = await endConversation({ session_id });
console.log(`Story depth: ${summary.story_depth}/10`);
console.log(`Themes: ${summary.key_themes.join(", ")}`);
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Required for world-class features
OPENAI_API_KEY=sk-or-v1-...  # OpenRouter API key
OPENAI_API_BASE=https://openrouter.ai/api/v1
OPENAI_MODEL=anthropic/claude-3.5-sonnet

# Conversation settings (optional)
CONVERSATION_MAX_TURNS=7
CONVERSATION_MIN_TURNS=3
STORY_DEPTH_THRESHOLD=8
```

### Conversation Parameters

```python
# In conversation.py
class ConversationSession:
    max_turns = 7          # Maximum conversation exchanges
    min_turns = 3          # Minimum before considering end

    # In _analyze_response_with_ai:
    temperature = 0.3      # Lower for analysis (precise)
    max_tokens = 500       # For detailed analysis

    # In _generate_intelligent_follow_up:
    temperature = 0.75     # Higher for creative questions
    max_tokens = 80        # Short, focused questions
```

---

## 📊 Monitoring & Analytics

### Conversation Metrics

Track deze metrics voor quality assurance:

```python
# Average story depth per chapter
avg_depth = db.query(func.avg(Conversation.story_depth)).scalar()

# Average turns per conversation
avg_turns = db.query(func.avg(Conversation.total_turns)).scalar()

# Completion rate
completion_rate = (
    conversations.filter(completed=True).count() /
    conversations.count()
)

# Most common themes
top_themes = get_top_themes_across_all_conversations()
```

### Log Events

```python
logger.info(f"Started conversation for chapter {chapter_id}, turn 1")
logger.info(f"AI analysis complete. Story depth: {depth}/10")
logger.info(f"Generated intelligent follow-up: {question[:50]}...")
logger.info(f"Conversation ending after {turns} turns")
logger.info(f"Conversation complete: {summary}")
```

---

## 🧪 Testing

### Unit Tests

```python
def test_conversation_starts_with_opening_question():
    session, question = start_conversation_session(...)
    assert question is not None
    assert len(question) < 200  # Reasonable length

def test_ai_analysis_extracts_themes():
    analysis = analyze_response_with_ai("Ik woonde in Amsterdam...")
    assert "Amsterdam" in analysis["places"]
    assert analysis["story_depth"] > 0

def test_conversation_ends_after_max_turns():
    session = ConversationSession(...)
    for i in range(8):
        session.add_user_response("...")
        question = session.generate_next_question()
    assert question is None  # Max turns reached

def test_conversation_detects_completion():
    session = ConversationSession(...)
    # Simulate high-depth response
    session.turns[-1].analysis = {"story_depth": 9}
    assert session.should_end_conversation() == True
```

### Manual Testing Checklist

- [ ] Start conversation → krijg opening question
- [ ] Answer question → krijg intelligent follow-up
- [ ] Follow-up references specifiek detail uit antwoord
- [ ] Na 3-7 turns → conversation ends naturally
- [ ] Summary bevat correcte themes en mensen
- [ ] Story depth score is realistisch (5-9 range)

---

## 🚀 Performance

### API Latency

Expected response times:

| Endpoint | Expected | Acceptable |
|----------|----------|------------|
| `/conversation/start` | 1-2s | < 5s |
| `/conversation/continue` | 2-4s | < 8s |
| `/conversation/end` | < 500ms | < 2s |

**Note:** Claude API calls add 1-3s latency

### Optimization Tips

1. **Cache opening questions** per chapter
2. **Parallel transcription + analysis**
3. **Preload personal context** before session
4. **Use Claude Haiku** for faster (cheaper) analysis if needed

---

## 🎓 Best Practices

### For Designers

**UI/UX Recommendations:**

1. **Show conversation progress**
   - "Vraag 2 van max 7"
   - Progress bar: filled based on story_depth

2. **Indicate AI is thinking**
   - "De interviewer denkt na..." (2-4s)
   - Don't let user feel abandoned

3. **Celebrate completion**
   - "Je verhaal voelt compleet!"
   - Show story_depth score: 8/10
   - Display extracted themes

4. **Allow manual ending**
   - User can say "Ik ben klaar"
   - Detect in transcript analysis

### For Developers

1. **Handle session expiry**
   - Active conversations stored in-memory
   - Expire after 1 hour inactivity
   - Warn user before expiry

2. **Graceful fallbacks**
   - If Claude API fails → use generic follow-ups
   - If analysis fails → assume mid-depth
   - Never block user flow

3. **Rate limiting**
   - Use existing `RateLimits.AI_PROMPT`
   - Consider higher limit for conversations

---

## 🆚 Comparison: Old vs New

### Single Question (v1.0)

```
POST /assistant/prompt
→ "Vertel over je jeugd"

User records answer

POST /assistant/prompt (again)
→ "Vertel over je werk"

[No connection between answers]
```

### Multi-Turn Conversation (v2.0)

```
POST /conversation/start
→ "Vertel over je oma's huis"

User: "Dat stond in Amsterdam..."

POST /conversation/continue
→ "Je noemde Amsterdam - welk deel precies?"

User: "Bij de Prinsengracht..."

POST /conversation/continue
→ "De Prinsengracht, prachtig! Wat deed je daar graag?"

[Natural flow, references previous answers]
```

---

## 🏆 Success Metrics

Track these to measure "world-class" quality:

### Target Metrics

- **Average Story Depth:** 7-9 / 10
- **Completion Rate:** >80%
- **Average Turns:** 4-6
- **User Satisfaction:** >4.5 / 5
- **Repeat Usage:** Users complete multiple chapters

### Quality Indicators

**Good Conversation:**
- Follow-ups reference specific details
- Natural flow (not robotic)
- Ends at the right moment
- User feels heard

**Poor Conversation:**
- Generic follow-ups
- Too many or too few turns
- Abrupt ending
- Repetitive questions

---

## 🔮 Future Enhancements

### Phase 3: Voice Emotion (Next)

```python
# Detect emotion in voice tone
emotion = analyze_voice_emotion(audio_file)

if emotion["sadness"] > 0.7:
    # Slow down, be gentle
    follow_up = generate_gentle_follow_up()
elif emotion["joy"] > 0.7:
    # Match enthusiasm
    follow_up = generate_enthusiastic_follow_up()
```

### Phase 4: Real-Time Branching

```python
# Dynamic topic switching
if user_mentions("vader") and never_asked_about_father:
    # Branch to father questions
    return generate_father_question()
```

### Phase 5: Multi-Session Memory

```python
# Remember across sessions
if previous_session.mentioned("Amsterdam"):
    return "Last time you mentioned Amsterdam, ..."
```

---

## 📞 Support

**Questions?** Contact development team

**Issues?** Check logs for:
- `"Started conversation for chapter..."`
- `"AI analysis complete. Story depth..."`
- `"Failed to generate follow-up..."`

**Monitoring:** Track `_active_conversations` dict size

---

## ✅ Checklist: Is Your Implementation World-Class?

- [ ] Multi-turn conversations (3-7 exchanges)
- [ ] Claude-powered transcript analysis
- [ ] Follow-ups reference specific user details
- [ ] Conversation knows when to end naturally
- [ ] Story depth scoring (1-10)
- [ ] Theme and people extraction
- [ ] Graceful API error handling
- [ ] Session management with cleanup
- [ ] Frontend integration complete
- [ ] Monitoring and logging in place

**If all checked:** 🎉 You have a world-class AI interviewer!

---

**Version:** 2.0
**Last Updated:** December 17, 2025
**Status:** 🚀 Production Ready
