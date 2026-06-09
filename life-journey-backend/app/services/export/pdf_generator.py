"""
Bewaardvoorjou — PDF Levensboek Generator

Bouwt een opgemaakt A4-boek van het levensverhaal van een gebruiker:
  • Omslag met naam en levensjaar
  • Inleidingspagina
  • Drie fasen met hoofdstuk-voor-hoofdstuk inhoud
  • Transcriptietekst, gestelde vragen, emotionele highlights, memo's
  • Lopende koptekst, paginanummers, colofon

Vereist: pip install weasyprint  (+ systeempakketten pango/cairo op Linux)
"""

from __future__ import annotations

import html
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

from loguru import logger
from sqlalchemy.orm import Session

from app.models.media import MediaAsset, TranscriptSegment, PromptRun
from app.models.memo import Memo
from app.models.sharing import Highlight
from app.models.user import User
from app.services.email.chapter_names import get_chapter_name

# ─── Hoofdstuk-volgorde (chronologisch door het leven) ───────────────────────

_CHAPTER_ORDER: list[str] = [
    # Fase 1: Intro
    "intro-reflection", "intro-intention", "intro-uniqueness",
    # Fase 2: Wortels
    "roots-first-memory", "roots-father", "roots-mother", "roots-grandparents",
    "roots-siblings", "roots-home", "roots-neighborhood",
    "roots-faith", "roots-finances", "roots-hardship",
    # Fase 3: Jeugd
    "youth-favorite-place", "youth-sounds", "youth-hero",
    "youth-primary-school", "youth-friends", "youth-secondary-school",
    "youth-history", "youth-ambition",
    # Fase 4: Jong Volwassen
    "work-dream-job", "work-passion", "work-challenge",
    "young-adult-first-job", "young-adult-independence", "young-adult-first-home",
    "young-adult-career-path", "young-adult-pivotal-choice",
    "young-adult-finances", "young-adult-world-events",
    # Fase 5: Liefde & Gezin
    "love-connection", "love-lessons", "love-symbol",
    "family-partner-story", "family-early-years", "family-wedding",
    "family-children", "family-typical-week", "family-hardship", "family-pride",
    # Fase 6: Midden Leven
    "midlife-grief", "midlife-aging", "midlife-regret", "midlife-resilience",
    "midlife-parents-retrospect", "midlife-formative-decade",
    "midlife-social-change", "midlife-faith-evolution",
    # Fase 7: Nu & Nalatenschap
    "future-message", "future-dream", "future-gratitude",
    "legacy-daily-joy", "legacy-faith-now", "legacy-remembered",
    "legacy-verdict", "legacy-unsaid", "legacy-letter",
    # Bonus / Verdieping
    "bonus-funny", "bonus-relive", "bonus-culture",
    "deep-daily-ritual", "deep-favorite-time", "deep-ugly-object",
    "deep-near-death", "deep-misconception", "deep-recurring-dream",
    "deep-life-chapters", "deep-intuition-choice", "deep-money-impact",
    "deep-shadow-side", "deep-life-meal", "deep-statue",
    "optional-childhood-game", "optional-alter-ego", "optional-superpower",
    "optional-bucket-list", "optional-final-chapter",
]

_PHASE_PREFIXES: dict[str, list[str]] = {
    "vroege_jaren":    ["intro", "roots", "youth"],
    "volwassen_leven": ["work", "young", "love", "family"],
    "later_leven":     ["midlife", "future", "legacy", "bonus", "deep", "optional"],
}

_PHASE_META: dict[str, dict] = {
    "vroege_jaren": {
        "roman": "I",
        "label": "Vroege Jaren",
        "desc":  "De eerste herinneringen, uw wortels en uw jeugd",
    },
    "volwassen_leven": {
        "roman": "II",
        "label": "Volwassen Leven",
        "desc":  "Werk, liefde en gezinsleven",
    },
    "later_leven": {
        "roman": "III",
        "label": "Later Leven &amp; Nalatenschap",
        "desc":  "Wijsheid, verlies en wat u achterlaat",
    },
}

_LABEL_NL: dict[str, str] = {
    "laugh":   "Een grappig moment",
    "insight": "Een inzicht",
    "love":    "Een moment van liefde",
    "wisdom":  "Een levensles",
}

_LABEL_COLOR: dict[str, str] = {
    "laugh":   "#e67e22",
    "insight": "#2980b9",
    "love":    "#c0392b",
    "wisdom":  "#6b3a1f",
}


# ─── Dataclassen ──────────────────────────────────────────────────────────────

@dataclass
class HighlightSnippet:
    label: str
    text: str
    color: str = "#c9963a"


@dataclass
class ChapterContent:
    chapter_id: str
    name: str
    question: Optional[str]
    paragraphs: list[str]
    highlights: list[HighlightSnippet]
    memos: list[tuple[str, str]]

    @property
    def has_content(self) -> bool:
        return bool(self.paragraphs or self.memos)


@dataclass
class PhaseContent:
    key: str
    roman: str
    label: str
    desc: str
    chapters: list[ChapterContent] = field(default_factory=list)


# ─── Tekstverwerking ──────────────────────────────────────────────────────────

def _clean(text: str) -> str:
    text = re.sub(r'\s+', ' ', text).strip()
    if not text:
        return ""
    text = text[0].upper() + text[1:]
    if text[-1] not in ".?!":
        text += "."
    return text


def _paragraphify(text: str, spp: int = 4) -> list[str]:
    """Splits cleaned tekst in leesbare alinea's van ~spp zinnen."""
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
    if not sentences:
        return [text] if text else []
    paras = []
    for i in range(0, len(sentences), spp):
        para = " ".join(sentences[i : i + spp])
        if para:
            paras.append(para)
    return paras


def _highlight_text(h: Highlight, segs: list[TranscriptSegment], limit: int = 220) -> str:
    matching = [s for s in segs if s.start_ms <= h.end_ms and s.end_ms >= h.start_ms]
    text = " ".join(s.text for s in matching).strip()
    if len(text) > limit:
        text = text[:limit].rsplit(" ", 1)[0] + "…"
    return text


# ─── Data verzamelen ──────────────────────────────────────────────────────────

def _collect(journey_id: str, db: Session) -> tuple[list[PhaseContent], dict]:
    assets = (
        db.query(MediaAsset)
        .filter(
            MediaAsset.journey_id == journey_id,
            MediaAsset.modality == "audio",
            MediaAsset.storage_state == "ready",
        )
        .order_by(MediaAsset.recorded_at)
        .all()
    )

    asset_ids = [a.id for a in assets]
    all_segs: list[TranscriptSegment] = (
        db.query(TranscriptSegment)
        .filter(TranscriptSegment.media_asset_id.in_(asset_ids))
        .order_by(TranscriptSegment.start_ms)
        .all()
        if asset_ids else []
    )

    segs_by_asset: dict[str, list[TranscriptSegment]] = {}
    for seg in all_segs:
        segs_by_asset.setdefault(seg.media_asset_id, []).append(seg)

    transcript_by_chapter: dict[str, str] = {}
    segs_by_chapter: dict[str, list[TranscriptSegment]] = {}
    for asset in assets:
        segs = sorted(segs_by_asset.get(asset.id, []), key=lambda s: s.start_ms)
        text = " ".join(s.text for s in segs).strip()
        if text:
            prev = transcript_by_chapter.get(asset.chapter_id, "")
            transcript_by_chapter[asset.chapter_id] = (prev + " " + text).strip()
            segs_by_chapter.setdefault(asset.chapter_id, []).extend(segs)

    # Meest recente vraag per hoofdstuk
    question_by_chapter: dict[str, str] = {}
    for run in (
        db.query(PromptRun)
        .filter(PromptRun.journey_id == journey_id)
        .order_by(PromptRun.created_at.desc())
        .all()
    ):
        question_by_chapter.setdefault(run.chapter_id, run.prompt)

    highlights_by_chapter: dict[str, list[Highlight]] = {}
    for h in db.query(Highlight).filter(Highlight.journey_id == journey_id).all():
        highlights_by_chapter.setdefault(h.chapter_id, []).append(h)

    memos_by_chapter: dict[str, list[Memo]] = {}
    for m in (
        db.query(Memo)
        .filter(Memo.journey_id == journey_id)
        .order_by(Memo.created_at)
        .all()
    ):
        if m.chapter_id:
            memos_by_chapter.setdefault(m.chapter_id, []).append(m)

    phases: list[PhaseContent] = []
    for key, meta in _PHASE_META.items():
        prefixes = _PHASE_PREFIXES[key]
        chapters: list[ChapterContent] = []

        for chapter_id in _CHAPTER_ORDER:
            if chapter_id.split("-")[0] not in prefixes:
                continue

            raw = _clean(transcript_by_chapter.get(chapter_id, ""))
            if not raw and chapter_id not in memos_by_chapter:
                continue

            chapter_segs = segs_by_chapter.get(chapter_id, [])
            snippets = [
                HighlightSnippet(
                    label=h.label,
                    text=_highlight_text(h, chapter_segs),
                    color=_LABEL_COLOR.get(h.label, "#c9963a"),
                )
                for h in highlights_by_chapter.get(chapter_id, [])
                if _highlight_text(h, chapter_segs)
            ]

            chapters.append(ChapterContent(
                chapter_id=chapter_id,
                name=get_chapter_name(chapter_id),
                question=question_by_chapter.get(chapter_id),
                paragraphs=_paragraphify(raw) if raw else [],
                highlights=snippets,
                memos=[(m.title, m.content) for m in memos_by_chapter.get(chapter_id, [])],
            ))

        if chapters:
            phases.append(PhaseContent(
                key=key,
                roman=meta["roman"],
                label=meta["label"],
                desc=meta["desc"],
                chapters=chapters,
            ))

    total_words = sum(
        len(para.split())
        for p in phases
        for ch in p.chapters
        for para in ch.paragraphs
    )
    return phases, {"chapters": sum(len(p.chapters) for p in phases), "words": total_words}


# ─── HTML bouwen ──────────────────────────────────────────────────────────────

_CSS = """
@page {
  size: A4;
  margin: 28mm 22mm 24mm 22mm;
  @top-left {
    content: "__NAAM__";
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 8.5pt;
    color: #9a7a60;
    padding-top: 6mm;
  }
  @top-right {
    content: string(chapter-running);
    font-family: Georgia, serif;
    font-size: 8.5pt;
    color: #9a7a60;
    padding-top: 6mm;
  }
  @bottom-center {
    content: counter(page);
    font-family: Georgia, serif;
    font-size: 9pt;
    color: #b0a090;
  }
}
@page cover   { margin: 0; @top-left{content:none} @top-right{content:none} @bottom-center{content:none} }
@page opening { @top-left{content:none} @top-right{content:none} @bottom-center{content:none} }

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: Georgia, "Palatino Linotype", Palatino, serif;
  font-size: 12pt;
  line-height: 1.78;
  color: #2d1a0e;
  orphans: 3;
  widows: 3;
}

/* ── Omslag ── */
.cover {
  page: cover;
  background: linear-gradient(155deg, #6b3a1f 0%, #3e1e0b 100%);
  width: 210mm;
  height: 297mm;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 50pt 60pt;
  color: #fff;
}
.cover-eyebrow {
  font-size: 8pt;
  letter-spacing: .3em;
  text-transform: uppercase;
  color: rgba(201,150,58,.85);
  margin-bottom: 36pt;
}
.cover-name {
  font-size: 34pt;
  font-weight: normal;
  line-height: 1.2;
  color: #fff;
  margin-bottom: 18pt;
}
.cover-title {
  font-size: 13pt;
  font-style: italic;
  color: rgba(255,255,255,.6);
  margin-bottom: 48pt;
}
.cover-rule {
  width: 48pt;
  height: 1pt;
  background: rgba(201,150,58,.5);
  margin: 0 auto 32pt;
}
.cover-year {
  font-size: 10pt;
  color: rgba(255,255,255,.4);
  letter-spacing: .12em;
}

/* ── Inleiding ── */
.opening {
  page: opening;
  break-before: page;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 220mm;
  padding: 30pt 0;
}
.opening-quote {
  font-size: 14.5pt;
  font-style: italic;
  line-height: 1.65;
  color: #5c3d2b;
  text-align: center;
  max-width: 360pt;
  margin: 0 auto 24pt;
}
.opening-author {
  text-align: center;
  font-size: 9.5pt;
  color: #9a7a60;
  letter-spacing: .08em;
}
.opening-intro {
  margin-top: 40pt;
  font-size: 11.5pt;
  color: #5c3d2b;
  line-height: 1.75;
  text-align: center;
  max-width: 380pt;
  margin-left: auto;
  margin-right: auto;
}

/* ── Fase-tussenpagina ── */
.phase-page {
  break-before: page;
  min-height: 200mm;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: 48pt;
}
.phase-roman {
  font-size: 80pt;
  font-weight: normal;
  color: rgba(201,150,58,.18);
  line-height: 1;
  margin-bottom: 8pt;
}
.phase-rule {
  width: 56pt;
  height: 2pt;
  background: #c9963a;
  margin-bottom: 18pt;
}
.phase-title-text {
  font-size: 26pt;
  font-weight: normal;
  color: #6b3a1f;
  line-height: 1.2;
  margin-bottom: 10pt;
}
.phase-desc-text {
  font-size: 11pt;
  font-style: italic;
  color: #9a7a60;
}

/* ── Hoofdstuk ── */
.chapter {
  break-before: page;
}
.chapter-name {
  string-set: chapter-running content();
  font-size: 19pt;
  font-weight: normal;
  color: #6b3a1f;
  line-height: 1.25;
  margin-bottom: 8pt;
}
.chapter-rule {
  width: 36pt;
  height: 2pt;
  background: #c9963a;
  margin-bottom: 18pt;
}
.chapter-question {
  font-size: 10.5pt;
  font-style: italic;
  color: #9a7a60;
  border-left: 2pt solid rgba(201,150,58,.45);
  padding-left: 12pt;
  margin-bottom: 22pt;
  line-height: 1.65;
}
.chapter-body p {
  font-size: 12pt;
  line-height: 1.80;
  text-align: justify;
  hyphens: auto;
  margin-bottom: 11pt;
  text-indent: 1.6em;
}
.chapter-body p:first-child {
  text-indent: 0;
}

/* ── Highlight / pull-quote ── */
.highlight {
  break-inside: avoid;
  margin: 22pt 0;
  padding: 13pt 16pt;
  background: #fdf8f2;
  border-left: 3pt solid #c9963a;
}
.highlight-label {
  font-size: 7.5pt;
  text-transform: uppercase;
  letter-spacing: .22em;
  margin-bottom: 5pt;
  font-weight: bold;
}
.highlight-text {
  font-size: 12.5pt;
  font-style: italic;
  line-height: 1.65;
  color: #5c3d2b;
}

/* ── Memo ── */
.memo {
  break-inside: avoid;
  margin: 18pt 0;
  padding: 12pt 16pt;
  border: 0.75pt solid #e5d4bf;
  background: #fffff8;
}
.memo-title {
  font-size: 9.5pt;
  font-weight: bold;
  color: #6b3a1f;
  text-transform: uppercase;
  letter-spacing: .08em;
  margin-bottom: 5pt;
}
.memo-body {
  font-size: 11pt;
  line-height: 1.72;
  color: #5c3d2b;
}

/* ── Slot & Colofon ── */
.outro {
  break-before: page;
  min-height: 200mm;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.outro-title {
  font-size: 20pt;
  font-weight: normal;
  color: #6b3a1f;
  margin-bottom: 16pt;
}
.outro-text {
  font-size: 11.5pt;
  font-style: italic;
  color: #9a7a60;
  max-width: 320pt;
  line-height: 1.72;
}
.outro-rule {
  width: 40pt;
  height: 1pt;
  background: #c9963a;
  margin: 28pt auto;
}

.colofon {
  break-before: page;
  font-size: 9pt;
  color: #9a7a60;
  line-height: 1.7;
}
.colofon-title {
  font-size: 10pt;
  font-weight: bold;
  color: #5c3d2b;
  margin-bottom: 10pt;
}
"""


def _h(text: str) -> str:
    return html.escape(str(text), quote=False)


def _highlight_block(snippet: HighlightSnippet) -> str:
    label_nl = _LABEL_NL.get(snippet.label, snippet.label.title())
    color    = snippet.color
    return (
        f'<div class="highlight">'
        f'<div class="highlight-label" style="color:{color}">{_h(label_nl)}</div>'
        f'<div class="highlight-text">&#8220;{_h(snippet.text)}&#8221;</div>'
        f'</div>'
    )


def _memo_block(title: str, content: str) -> str:
    return (
        f'<div class="memo">'
        f'<div class="memo-title">{_h(title)}</div>'
        f'<div class="memo-body">{_h(content)}</div>'
        f'</div>'
    )


def _chapter_html(ch: ChapterContent) -> str:
    parts = ['<div class="chapter">']
    parts.append(f'<h2 class="chapter-name">{_h(ch.name)}</h2>')
    parts.append('<div class="chapter-rule"></div>')

    if ch.question:
        parts.append(f'<div class="chapter-question">{_h(ch.question)}</div>')

    if ch.paragraphs:
        parts.append('<div class="chapter-body">')
        for para in ch.paragraphs:
            parts.append(f'<p>{_h(para)}</p>')
        parts.append('</div>')

    for snippet in ch.highlights:
        parts.append(_highlight_block(snippet))

    for title, content in ch.memos:
        parts.append(_memo_block(title, content))

    parts.append('</div>')
    return "\n".join(parts)


def _phase_html(phase: PhaseContent) -> str:
    separator = (
        f'<div class="phase-page">'
        f'<div class="phase-roman">{phase.roman}</div>'
        f'<div class="phase-rule"></div>'
        f'<div class="phase-title-text">{phase.label}</div>'
        f'<div class="phase-desc-text">{phase.desc}</div>'
        f'</div>'
    )
    chapters_html = "\n".join(_chapter_html(ch) for ch in phase.chapters)
    return separator + "\n" + chapters_html


def _build_html(naam: str, birth_year: Optional[int], phases: list[PhaseContent]) -> str:
    css = _CSS.replace("__NAAM__", _h(naam))
    datum_nl = datetime.now(timezone.utc).strftime("%d %B %Y")
    birth_line = f"Geboren in {birth_year}" if birth_year else ""

    cover = (
        f'<div class="cover">'
        f'<div class="cover-eyebrow">Bewaardvoorjou &mdash; Digitale Familiebibliotheek</div>'
        f'<div class="cover-name">Het levensverhaal van<br>{_h(naam)}</div>'
        f'<div class="cover-title">Mijn Levensverhaal</div>'
        f'<div class="cover-rule"></div>'
        f'<div class="cover-year">{_h(birth_line)}</div>'
        f'</div>'
    )

    opening = (
        f'<div class="opening">'
        f'<div class="opening-quote">'
        f'&#8220;De grootste gave die je aan de volgende generatie kunt geven,<br>'
        f'is niet geld of goed &mdash; maar de zekerheid dat zij geliefd zijn,<br>'
        f'en te weten waar ze vandaan komen.&#8221;'
        f'</div>'
        f'<div class="opening-author">&mdash; Overlevering</div>'
        f'<div class="opening-intro">'
        f'Dit boek bevat het levensverhaal van <em>{_h(naam)}</em>.<br>'
        f'Gesproken met openheid, bewaard met zorg,<br>'
        f'en bedoeld voor iedereen die van hen houdt.'
        f'</div>'
        f'</div>'
    )

    content = "\n".join(_phase_html(p) for p in phases)

    total_chapters = sum(len(p.chapters) for p in phases)
    outro = (
        f'<div class="outro">'
        f'<div class="outro-title">Dit verhaal is voor altijd bewaard</div>'
        f'<div class="outro-rule"></div>'
        f'<div class="outro-text">'
        f'U heeft {total_chapters} hoofdstukken verteld.<br>'
        f'Elk woord is bewaard,<br>voor uw kinderen, kleinkinderen<br>en iedereen die na u komt.'
        f'</div>'
        f'</div>'
    )

    colofon = (
        f'<div class="colofon">'
        f'<div class="colofon-title">Colofon</div>'
        f'<p>Dit boek is gegenereerd op {datum_nl} door Bewaardvoorjou.</p>'
        f'<p>De inhoud is het eigendom van {_h(naam)} en diens nabestaanden.</p>'
        f'<p>Bewaardvoorjou &mdash; www.bewaardvoorjou.nl</p>'
        f'</div>'
    )

    return f"""<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>{_h(naam)} &mdash; Mijn Levensverhaal</title>
  <style>{css}</style>
</head>
<body>
{cover}
{opening}
{content}
{outro}
{colofon}
</body>
</html>"""


# ─── Publieke API ─────────────────────────────────────────────────────────────

def generate_pdf_bytes(journey_id: str, user: User, db: Session) -> bytes:
    """
    Genereert een volledig opgemaakt PDF-levensboek voor de opgegeven journey.
    Geeft de raw PDF-bytes terug.

    Raises ImportError als weasyprint niet geïnstalleerd is.
    """
    try:
        from weasyprint import HTML as WP_HTML
    except ImportError as exc:
        raise ImportError(
            "weasyprint is niet geïnstalleerd. Voeg 'weasyprint>=62.0' toe aan requirements.txt."
        ) from exc

    naam       = user.display_name or user.email.split("@")[0]
    birth_year = user.birth_year

    logger.info(f"PDF genereren voor journey={journey_id} ({naam})")
    phases, stats = _collect(journey_id, db)

    if not phases:
        logger.warning(f"Geen inhoud gevonden voor journey={journey_id}, lege PDF")

    html_str = _build_html(naam, birth_year, phases)
    pdf_bytes = WP_HTML(string=html_str).write_pdf()

    logger.info(
        f"PDF klaar: {len(pdf_bytes):,} bytes | "
        f"{stats['chapters']} hoofdstukken | {stats['words']:,} woorden"
    )
    return pdf_bytes


def generate_pdf_html(journey_id: str, user: User, db: Session) -> str:
    """
    Geeft de ruwe HTML-string terug (handig voor preview of fallback
    als WeasyPrint niet beschikbaar is).
    """
    naam       = user.display_name or user.email.split("@")[0]
    birth_year = user.birth_year
    phases, _  = _collect(journey_id, db)
    return _build_html(naam, birth_year, phases)
