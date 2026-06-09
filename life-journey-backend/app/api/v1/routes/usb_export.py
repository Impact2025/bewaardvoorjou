"""
Admin USB Export — drie endpoints die samen de USB-brandpipeline vormen.

GET  /admin/usb/queue             → bestellingen klaar voor USB-branden
GET  /admin/usb/export/{order_id} → ZIP-pakket in exacte USB-mapstructuur
POST /admin/usb/export/{order_id}/burned → markeer als afgehandeld
"""

from __future__ import annotations

import io
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from typing import Any

import boto3
from botocore.exceptions import BotoCoreError
from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.responses import StreamingResponse
from loguru import logger
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin_user, get_db
from app.core.config import settings
from app.models.audit_log import AuditLog
from app.models.journey import Journey
from app.models.media import MediaAsset
from app.models.order import Order
from app.models.user import User
from app.services.export.pdf_generator import generate_pdf_bytes

router = APIRouter(dependencies=[Depends(get_current_admin_user)])

# ─── Constanten ───────────────────────────────────────────────────────────────

_PHYSICAL_PACKAGES = {"BEGIN", "ERFGOED", "VOOR_ALTIJD"}

_FASE_CONFIG = {
    "Fase_1_Vroege_Jeugd": {
        "label":  "Vroege Jeugd",
        "icon":   "🌱",
        "anchor": "vroege-jeugd",
        "desc":   "De jaren die u vormden",
    },
    "Fase_2_Volwassen_Leven": {
        "label":  "Volwassen Leven",
        "icon":   "🌳",
        "anchor": "volwassen-leven",
        "desc":   "Liefde, werk en gezin",
    },
    "Fase_3_Later_Leven": {
        "label":  "Later Leven",
        "icon":   "🍂",
        "anchor": "later-leven",
        "desc":   "Wijsheid, verlies en nalatenschap",
    },
}

_PHASE_PREFIX: dict[str, str] = {
    "intro":    "Fase_1_Vroege_Jeugd",
    "roots":    "Fase_1_Vroege_Jeugd",
    "youth":    "Fase_1_Vroege_Jeugd",
    "work":     "Fase_2_Volwassen_Leven",
    "young":    "Fase_2_Volwassen_Leven",
    "love":     "Fase_2_Volwassen_Leven",
    "family":   "Fase_2_Volwassen_Leven",
    "midlife":  "Fase_3_Later_Leven",
    "future":   "Fase_3_Later_Leven",
    "legacy":   "Fase_3_Later_Leven",
    "bonus":    "Fase_3_Later_Leven",
    "deep":     "Fase_3_Later_Leven",
    "optional": "Fase_3_Later_Leven",
}

_CHAPTER_NAMES: dict[str, str] = {
    "intro-reflection":          "Reflectie op mijn leven",
    "intro-intention":           "Mijn intentie",
    "intro-uniqueness":          "Wat mij uniek maakt",
    "roots-first-memory":        "Mijn eerste herinnering",
    "roots-father":              "Mijn vader",
    "roots-mother":              "Mijn moeder",
    "roots-grandparents":        "Mijn grootouders",
    "roots-siblings":            "Broers en zussen",
    "roots-home":                "Ons thuis",
    "roots-neighborhood":        "Mijn buurt",
    "roots-faith":               "Geloof en tradities",
    "roots-finances":            "Geld en armoede",
    "roots-hardship":            "Vroege tegenslagen",
    "youth-favorite-place":      "Mijn favoriete plek",
    "youth-sounds":              "Geluiden van vroeger",
    "youth-hero":                "Mijn held",
    "youth-primary-school":      "De lagere school",
    "youth-friends":             "Vriendschappen",
    "youth-secondary-school":    "Middelbare school",
    "youth-history":             "Geschiedenis die ik meemaakte",
    "youth-ambition":            "Mijn dromen als kind",
    "work-dream-job":            "Mijn droomwerk",
    "work-passion":              "Mijn passie",
    "work-challenge":            "Een grote uitdaging",
    "young-adult-first-job":     "Mijn eerste baan",
    "young-adult-independence":  "Op eigen benen",
    "young-adult-first-home":    "Mijn eerste thuis",
    "young-adult-career-path":   "Mijn carrièrepad",
    "young-adult-pivotal-choice":"Een keuze die alles veranderde",
    "young-adult-finances":      "Leren omgaan met geld",
    "young-adult-world-events":  "Wereldgebeurtenissen",
    "love-connection":           "Hoe ik mijn partner ontmoette",
    "love-lessons":              "Lessen in de liefde",
    "love-symbol":               "Een symbool van onze liefde",
    "family-partner-story":      "Het verhaal van ons samen",
    "family-early-years":        "De eerste jaren samen",
    "family-wedding":            "Ons huwelijk",
    "family-children":           "Mijn kinderen",
    "family-typical-week":       "Een gewone week",
    "family-hardship":           "Moeilijke tijden in het gezin",
    "family-pride":              "Waar ik trots op ben",
    "midlife-grief":             "Verlies en rouw",
    "midlife-aging":             "Ouder worden",
    "midlife-regret":            "Spijt en acceptatie",
    "midlife-resilience":        "Veerkracht",
    "midlife-parents-retrospect":"Terugkijken op mijn ouders",
    "midlife-formative-decade":  "Het decennium dat mij vormde",
    "midlife-social-change":     "Maatschappelijke verandering",
    "midlife-faith-evolution":   "Hoe mijn geloof veranderde",
    "future-message":            "Boodschap aan de toekomst",
    "future-dream":              "Mijn laatste droom",
    "future-gratitude":          "Dankbaarheid",
    "legacy-daily-joy":          "Dagelijkse vreugde",
    "legacy-faith-now":          "Geloof nu",
    "legacy-remembered":         "Hoe ik herinnerd wil worden",
    "legacy-verdict":            "Mijn levensuitspraak",
    "legacy-unsaid":             "Wat ik nooit gezegd heb",
    "legacy-letter":             "Een brief aan wie ik liefheb",
}

# ─── HTML dashboard template ──────────────────────────────────────────────────
# Placeholders: TMPL_NAAM, TMPL_SAFE_NAAM, TMPL_DATUM,
#               TMPL_FASE_BLOKKEN, TMPL_FOTO_COUNT

_HTML_TMPL = """<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>TMPL_NAAM - Mijn Levensverhaal</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:          #f9f5f0;
      --card:        #ffffff;
      --primary:     #6b3a1f;
      --primary-lt:  #8b4d2c;
      --accent:      #c9963a;
      --accent-bg:   #fdf0d5;
      --text-1:      #2d1a0e;
      --text-2:      #5c3d2b;
      --text-3:      #9a7a60;
      --border:      #e5d4bf;
      --shadow-sm:   0 1px 4px rgba(45,26,14,.07);
      --shadow-md:   0 4px 20px rgba(45,26,14,.11);
      --r:           12px;
    }

    html { scroll-behavior: smooth; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      background: var(--bg);
      color: var(--text-1);
      line-height: 1.7;
      font-size: 18px;
    }

    /* ── Hero ── */
    .hero {
      background: linear-gradient(150deg, #6b3a1f 0%, #3e1e0b 100%);
      color: #fff;
      padding: 72px 24px 56px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .hero::before, .hero::after {
      content: "";
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,.04);
    }
    .hero::before { width: 500px; height: 500px; top: -200px; left: -100px; }
    .hero::after  { width: 300px; height: 300px; bottom: -100px; right: -60px; }

    .hero-eyebrow {
      font-size: .78rem;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: var(--accent);
      font-weight: 600;
      margin-bottom: 20px;
    }
    .hero-name {
      font-family: Georgia, "Palatino Linotype", Palatino, serif;
      font-size: clamp(1.9rem, 5.5vw, 3.2rem);
      font-weight: normal;
      line-height: 1.2;
      margin-bottom: 14px;
    }
    .hero-sub {
      font-size: 1rem;
      color: rgba(255,255,255,.65);
      max-width: 440px;
      margin: 0 auto 36px;
    }
    .hero-btn {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      background: var(--accent);
      color: var(--primary);
      text-decoration: none;
      padding: 17px 34px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 1.05rem;
      transition: transform .15s, box-shadow .15s;
      position: relative;
      z-index: 1;
    }
    .hero-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.35); }
    .hero-btn svg { width: 17px; height: 17px; flex-shrink: 0; }

    .hero-stats {
      display: flex;
      justify-content: center;
      gap: 48px;
      margin-top: 48px;
      padding-top: 28px;
      border-top: 1px solid rgba(255,255,255,.13);
      position: relative;
      z-index: 1;
    }
    .stat-number {
      font-family: Georgia, serif;
      font-size: 2rem;
      font-weight: 700;
      display: block;
    }
    .stat-label {
      font-size: .75rem;
      text-transform: uppercase;
      letter-spacing: .1em;
      color: rgba(255,255,255,.5);
    }

    /* ── Sticky nav ── */
    .nav {
      background: var(--card);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--shadow-sm);
    }
    .nav-inner {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      overflow-x: auto;
      scrollbar-width: none;
      padding: 0 20px;
    }
    .nav-inner::-webkit-scrollbar { display: none; }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 15px 18px;
      color: var(--text-3);
      text-decoration: none;
      font-size: 1rem;
      font-weight: 500;
      border-bottom: 2px solid transparent;
      white-space: nowrap;
      transition: color .15s, border-color .15s;
    }
    .nav-link:hover, .nav-link.active {
      color: var(--primary);
      border-color: var(--primary);
    }

    /* ── Main ── */
    .main {
      max-width: 900px;
      margin: 0 auto;
      padding: 52px 24px 80px;
    }

    /* ── Phase section ── */
    .phase {
      margin-bottom: 64px;
      scroll-margin-top: 58px;
      opacity: 0;
      animation: fadeUp .5s ease forwards;
    }
    .phase:nth-child(1) { animation-delay: .06s; }
    .phase:nth-child(2) { animation-delay: .16s; }
    .phase:nth-child(3) { animation-delay: .26s; }

    .phase-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 22px;
      padding-bottom: 18px;
      border-bottom: 2px solid var(--accent-bg);
    }
    .phase-icon {
      width: 48px;
      height: 48px;
      background: var(--accent-bg);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      flex-shrink: 0;
    }
    .phase-label { flex: 1; }
    .phase-title {
      font-family: Georgia, "Palatino Linotype", Palatino, serif;
      font-size: 1.75rem;
      font-weight: normal;
      color: var(--primary);
      line-height: 1.2;
    }
    .phase-desc {
      font-size: .83rem;
      color: var(--text-3);
      margin-top: 2px;
    }
    .phase-badge {
      font-size: .8rem;
      color: var(--accent);
      background: var(--accent-bg);
      padding: 4px 12px;
      border-radius: 50px;
      font-weight: 600;
      white-space: nowrap;
    }

    /* ── Tracks grid ── */
    .tracks { display: grid; gap: 10px; }

    /* ── Player card ── */
    .pcard {
      background: var(--card);
      border-radius: var(--r);
      border: 1px solid var(--border);
      padding: 18px 20px 14px;
      box-shadow: var(--shadow-sm);
      transition: box-shadow .2s, transform .2s, border-color .2s;
    }
    .pcard:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
    .pcard.playing {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-bg), var(--shadow-md);
    }

    .pcard-top {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 12px;
    }
    .pcard-num {
      font-family: Georgia, serif;
      font-size: .75rem;
      color: var(--text-3);
      min-width: 24px;
    }

    /* Play button */
    .pbtn {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--primary);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #fff;
      transition: background .15s, transform .1s, box-shadow .15s;
      box-shadow: 0 2px 10px rgba(107,58,31,.35);
    }
    .pbtn:hover { background: var(--primary-lt); transform: scale(1.06); }
    .pbtn:active { transform: scale(.94); }
    .pbtn svg { width: 24px; height: 24px; fill: currentColor; }

    .pcard-meta { flex: 1; min-width: 0; }
    .pcard-title {
      font-weight: 600;
      font-size: 1.05rem;
      color: var(--text-1);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .pcard-time {
      font-size: .9rem;
      color: var(--text-3);
      margin-top: 4px;
      font-variant-numeric: tabular-nums;
    }

    /* Progress */
    .pbar {
      height: 7px;
      background: var(--accent-bg);
      border-radius: 4px;
      cursor: pointer;
      overflow: hidden;
    }
    .pbar-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, var(--primary), var(--accent));
      border-radius: 2px;
      transition: width .08s linear;
    }

    audio { display: none; }

    /* ── Empty state ── */
    .empty {
      background: var(--accent-bg);
      border-radius: var(--r);
      padding: 28px;
      text-align: center;
      color: var(--text-3);
      font-style: italic;
      font-size: .93rem;
    }

    /* ── Foto link ── */
    .foto-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      border: 2px dashed var(--border);
      border-radius: 16px;
      padding: 28px;
      text-decoration: none;
      color: var(--primary);
      font-weight: 600;
      margin-bottom: 64px;
      transition: background .15s, border-color .15s;
    }
    .foto-link:hover { background: var(--accent-bg); border-color: var(--accent); }
    .foto-link svg { width: 22px; height: 22px; flex-shrink: 0; }

    /* ── Footer ── */
    footer {
      background: var(--card);
      border-top: 1px solid var(--border);
      padding: 36px 24px;
      text-align: center;
      color: var(--text-3);
      font-size: .86rem;
    }
    .footer-logo {
      font-family: Georgia, serif;
      font-size: 1.1rem;
      color: var(--primary);
      font-style: italic;
      margin-bottom: 6px;
    }
    .footer-tip {
      margin-top: 16px;
      display: inline-block;
      background: var(--accent-bg);
      padding: 14px 24px;
      border-radius: 8px;
      font-size: .95rem;
      line-height: 1.6;
    }

    /* ── Animations ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── Responsive ── */
    @media (max-width: 580px) {
      .hero { padding: 52px 16px 44px; }
      .hero-stats { gap: 28px; }
      .main { padding: 32px 14px 60px; }
      .pcard { padding: 14px 14px 12px; }
    }
  </style>
</head>
<body>

<header class="hero">
  <p class="hero-eyebrow">Bewaardvoorjou &mdash; Digitale Familiebibliotheek</p>
  <h1 class="hero-name">Het levensverhaal van<br>TMPL_NAAM</h1>
  <p class="hero-sub">Vastgelegd voor de generaties na u. Luister, lees en bewaar.</p>
  <a class="hero-btn" href="../01_Mijn_Levensboek_PDF/TMPL_SAFE_NAAM_Levensboek.pdf">
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6z"/>
    </svg>
    Open het Levensboek PDF
  </a>
  <div class="hero-stats">
    <div class="stat">
      <span class="stat-number" id="js-tracks">0</span>
      <span class="stat-label">Verhalen</span>
    </div>
    <div class="stat">
      <span class="stat-number" id="js-duration">&mdash;</span>
      <span class="stat-label">Geluid</span>
    </div>
    <div class="stat">
      <span class="stat-number">TMPL_FOTO_COUNT</span>
      <span class="stat-label">Foto&#x27;s</span>
    </div>
  </div>
</header>

<nav class="nav" aria-label="Fasen">
  <div class="nav-inner">
    <a class="nav-link" href="#vroege-jeugd">&#127807; Vroege Jeugd</a>
    <a class="nav-link" href="#volwassen-leven">&#127795; Volwassen Leven</a>
    <a class="nav-link" href="#later-leven">&#127810; Later Leven</a>
    <a class="nav-link" href="../03_Mijn_Fotogalerij">&#128247; Fotogalerij</a>
  </div>
</nav>

<main class="main">
TMPL_FASE_BLOKKEN
  <a class="foto-link" href="../03_Mijn_Fotogalerij">
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z"/>
    </svg>
    Bekijk de Fotogalerij &mdash; TMPL_FOTO_COUNT foto&#x27;s bewaard in hoge resolutie
  </a>
</main>

<footer>
  <div class="footer-logo">Bewaardvoorjou</div>
  <div>Herinneringen bewaard voor altijd &nbsp;&middot;&nbsp; www.bewaardvoorjou.nl</div>
  <div>Gegenereerd op TMPL_DATUM</div>
  <div class="footer-tip">
    Speelt audio niet af? Open de map <strong>05_Software</strong> en start VLC &mdash; werkt altijd, ook over 20 jaar.
  </div>
</footer>

<script>
(function () {
  "use strict";

  var PLAY  = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  var PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

  function fmt(s) {
    if (!s || isNaN(s)) return "0:00";
    var m = Math.floor(s / 60);
    var sc = Math.floor(s % 60);
    return m + ":" + (sc < 10 ? "0" : "") + sc;
  }

  var allAudio = [];

  document.querySelectorAll(".pcard").forEach(function (card) {
    var audio = card.querySelector("audio");
    var btn   = card.querySelector(".pbtn");
    var fill  = card.querySelector(".pbar-fill");
    var time  = card.querySelector(".pcard-time");
    var bar   = card.querySelector(".pbar");

    allAudio.push(audio);

    btn.addEventListener("click", function () {
      if (audio.paused) {
        allAudio.forEach(function (a) { if (a !== audio) a.pause(); });
        document.querySelectorAll(".pcard").forEach(function (c) {
          c.classList.remove("playing");
          c.querySelector(".pbtn").innerHTML = PLAY;
        });
        audio.play();
        btn.innerHTML = PAUSE;
        card.classList.add("playing");
      } else {
        audio.pause();
        btn.innerHTML = PLAY;
        card.classList.remove("playing");
      }
    });

    audio.addEventListener("timeupdate", function () {
      var pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      fill.style.width = pct + "%";
      time.textContent = fmt(audio.currentTime) + " / " + fmt(audio.duration);
    });

    audio.addEventListener("ended", function () {
      btn.innerHTML = PLAY;
      fill.style.width = "0%";
      card.classList.remove("playing");
    });

    bar.addEventListener("click", function (e) {
      if (!audio.duration) return;
      var rect = bar.getBoundingClientRect();
      audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    });
  });

  // Stats: track count + total duration
  var cards = document.querySelectorAll(".pcard");
  document.getElementById("js-tracks").textContent = cards.length;

  var loaded = 0, totalSec = 0;
  allAudio.forEach(function (a) {
    a.addEventListener("loadedmetadata", function () {
      totalSec += a.duration || 0;
      loaded++;
      if (loaded === allAudio.length && totalSec > 0) {
        var h = Math.floor(totalSec / 3600);
        var m = Math.floor((totalSec % 3600) / 60);
        document.getElementById("js-duration").textContent =
          h > 0 ? h + "u " + m + "m" : m + " min";
      }
    });
  });

  // Active nav link via IntersectionObserver
  var navLinks = document.querySelectorAll(".nav-link[href^='#']");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        navLinks.forEach(function (l) { l.classList.remove("active"); });
        var active = document.querySelector('.nav-link[href="#' + e.target.id + '"]');
        if (active) active.classList.add("active");
      }
    });
  }, { threshold: 0.25 });

  document.querySelectorAll(".phase[id]").forEach(function (s) { io.observe(s); });
}());
</script>
</body>
</html>"""


# ─── Template bouwers ─────────────────────────────────────────────────────────

def _player_card(num: int, display_name: str, rel_path: str) -> str:
    ext = rel_path.rsplit(".", 1)[-1].lower()
    mime = "audio/ogg" if ext == "ogg" else "audio/mpeg"
    return (
        f'<div class="pcard">'
        f'<div class="pcard-top">'
        f'<span class="pcard-num">{num:02d}</span>'
        f'<button class="pbtn" aria-label="Afspelen">'
        f'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
        f'</button>'
        f'<div class="pcard-meta">'
        f'<div class="pcard-title">{display_name}</div>'
        f'<div class="pcard-time">0:00</div>'
        f'</div></div>'
        f'<div class="pbar"><div class="pbar-fill"></div></div>'
        f'<audio preload="none">'
        f'<source src="{rel_path}" type="{mime}"></audio>'
        f'</div>\n'
    )


def _fase_block(fase_folder: str, items: list[dict]) -> str:
    cfg = _FASE_CONFIG[fase_folder]
    anchor = cfg["anchor"]
    icon   = cfg["icon"]
    label  = cfg["label"]
    desc   = cfg["desc"]
    count  = len(items)

    if items:
        tracks_html = "\n".join(
            _player_card(
                i + 1,
                it["display_name"],
                f"../02_Gesproken_Herinneringen/{fase_folder}/{it['filename']}",
            )
            for i, it in enumerate(items)
        )
        body = f'<div class="tracks">\n{tracks_html}</div>'
    else:
        body = '<div class="empty">Nog geen opnames in deze fase</div>'

    badge = f'<span class="phase-badge">{count} verhaal{"" if count == 1 else "s"}</span>'
    return (
        f'<section class="phase" id="{anchor}">\n'
        f'  <div class="phase-header">\n'
        f'    <div class="phase-icon">{icon}</div>\n'
        f'    <div class="phase-label">\n'
        f'      <div class="phase-title">{label}</div>\n'
        f'      <div class="phase-desc">{desc}</div>\n'
        f'    </div>\n'
        f'    {badge}\n'
        f'  </div>\n'
        f'  {body}\n'
        f'</section>\n'
    )


def _build_dashboard_html(
    naam: str,
    safe_naam: str,
    chapters_by_phase: dict[str, list[dict]],
    foto_count: int,
) -> str:
    fase_blokken = "\n".join(
        _fase_block(folder, chapters_by_phase.get(folder, []))
        for folder in _FASE_CONFIG
    )
    datum = datetime.now(timezone.utc).strftime("%d %B %Y")
    return (
        _HTML_TMPL
        .replace("TMPL_NAAM", naam)
        .replace("TMPL_SAFE_NAAM", safe_naam)
        .replace("TMPL_DATUM", datum)
        .replace("TMPL_FASE_BLOKKEN", fase_blokken)
        .replace("TMPL_FOTO_COUNT", str(foto_count))
    )


# ─── S3 helpers ───────────────────────────────────────────────────────────────

def _s3_client() -> Any:
    endpoint = settings.s3_endpoint_url or f"https://s3.{settings.s3_region}.amazonaws.com"
    return boto3.client(
        "s3",
        region_name=settings.s3_region,
        endpoint_url=endpoint,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
    )


def _download_one(s3: Any, key: str) -> bytes | None:
    try:
        resp = s3.get_object(Bucket=settings.s3_bucket, Key=key)
        return resp["Body"].read()
    except BotoCoreError as exc:
        logger.warning(f"S3 download mislukt: {key} — {exc}")
        return None


def _download_parallel(s3: Any, assets: list[MediaAsset]) -> dict[str, bytes]:
    """Download meerdere S3-bestanden gelijktijdig. Geeft {asset.id: bytes}."""
    results: dict[str, bytes] = {}
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(_download_one, s3, a.object_key): a for a in assets}
        for future in as_completed(futures):
            asset = futures[future]
            try:
                data = future.result()
                if data:
                    results[asset.id] = data
                    logger.debug(f"  ✓ {asset.object_key} ({len(data):,} bytes)")
            except Exception as exc:
                logger.warning(f"Download fout {asset.object_key}: {exc}")
    return results


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _safe_name(name: str) -> str:
    return "".join(c if c.isalnum() or c in " _-" else "_" for c in name).strip()


def _phase_folder(chapter_id: str) -> str:
    prefix = chapter_id.split("-")[0]
    return _PHASE_PREFIX.get(prefix, "Fase_3_Later_Leven")


def _chapter_display(chapter_id: str) -> str:
    return _CHAPTER_NAMES.get(chapter_id, chapter_id.replace("-", " ").title())


_AUTORUN_INF = """\
[AutoRun]
Action=Mijn Levensboek openen
Label=MijnErfgoed
ShellExecute=index.html
"""

_ROOT_WELCOME_HTML = """\
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="4;url=04_Start_Hier_Offline/index.html">
  <title>Welkom — Bewaardvoorjou</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      height: 100%;
      font-family: Georgia, "Palatino Linotype", Palatino, serif;
      background: linear-gradient(160deg, #f9f5f0 0%, #f0e8db 100%);
      color: #2d1a0e;
    }
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 24px;
      min-height: 100vh;
    }
    .card {
      background: #fff;
      border-radius: 28px;
      padding: 56px 64px 52px;
      max-width: 620px;
      width: 100%;
      text-align: center;
      box-shadow: 0 12px 56px rgba(45,26,14,.13);
      border: 1px solid #e5d4bf;
    }
    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      margin-bottom: 40px;
    }
    .brand-logo { width: 56px; height: 56px; flex-shrink: 0; }
    .brand-name {
      font-size: 1.35rem;
      letter-spacing: .06em;
      color: #6b3a1f;
      font-style: italic;
      font-weight: normal;
    }
    .divider {
      width: 48px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #c9963a, transparent);
      margin: 0 auto 36px;
    }
    .welkom {
      font-size: 1.3rem;
      color: #9a7a60;
      font-weight: normal;
      margin-bottom: 8px;
    }
    .naam {
      font-size: 3.2rem;
      color: #6b3a1f;
      line-height: 1.15;
      font-weight: normal;
      margin-bottom: 20px;
    }
    .sub {
      font-size: 1.2rem;
      color: #5c3d2b;
      line-height: 1.7;
      margin-bottom: 44px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #7a4428 0%, #6b3a1f 100%);
      color: #fff;
      text-decoration: none;
      padding: 22px 60px;
      border-radius: 50px;
      font-size: 1.3rem;
      font-family: inherit;
      line-height: 1;
      box-shadow: 0 6px 28px rgba(107,58,31,.4);
      transition: transform .15s, box-shadow .15s;
      letter-spacing: .01em;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 36px rgba(107,58,31,.5);
    }
    .hint {
      margin-top: 28px;
      font-size: .95rem;
      color: #b09880;
      font-style: italic;
    }
    .dot { display: inline-block; animation: knipoog 1.4s infinite; }
    .dot:nth-child(2) { animation-delay: .25s; }
    .dot:nth-child(3) { animation-delay: .5s; }
    @keyframes knipoog { 0%,80%,100%{opacity:.2} 40%{opacity:1} }
    .footer-url {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid #f0e8db;
      font-size: .85rem;
      color: #c9b49a;
      letter-spacing: .03em;
    }
    @media (max-width: 540px) {
      .card { padding: 40px 28px 36px; }
      .naam { font-size: 2.4rem; }
      .btn  { padding: 20px 40px; font-size: 1.15rem; }
    }
  </style>
</head>
<body>
  <div class="card">

    <div class="brand">
      <svg class="brand-logo" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stop-color="#D4AF37"/>
            <stop offset="50%"  stop-color="#F4D03F"/>
            <stop offset="100%" stop-color="#C5A028"/>
          </linearGradient>
        </defs>
        <path d="M256 448C248 448 240 445 234 439C180 390 134 348 98 308C54 260 32 216 32 168C32 100 86 44 154 44C190 44 224 62 246 92L256 106L266 92C288 62 322 44 358 44C426 44 480 100 480 168C480 216 458 260 414 308C378 348 332 390 278 439C272 445 264 448 256 448Z" fill="url(#hg)" stroke="url(#hg)" stroke-width="12"/>
        <path d="M256 408C250 408 244 406 240 402C196 362 158 328 129 296C95 257 78 223 78 185C78 134 120 92 171 92C199 92 226 105 244 128L256 144L268 128C286 105 313 92 341 92C392 92 434 134 434 185C434 223 417 257 383 296C354 328 316 362 272 402C268 406 262 408 256 408Z" fill="none" stroke="url(#hg)" stroke-width="16"/>
        <path d="M256 368C252 368 248 366 245 363C210 332 180 306 158 282C133 254 120 229 120 202C120 168 146 140 180 140C201 140 221 150 234 168L256 196L278 168C291 150 311 140 332 140C366 140 392 168 392 202C392 229 379 254 354 282C332 306 302 332 267 363C264 366 260 368 256 368Z" fill="none" stroke="url(#hg)" stroke-width="20"/>
        <path d="M256 256L246 236C242 228 234 224 226 224C214 224 204 234 204 246C204 254 208 262 214 268L256 310L298 268C304 262 308 254 308 246C308 234 298 224 286 224C278 224 270 228 266 236L256 256Z" fill="url(#hg)"/>
      </svg>
      <span class="brand-name">Bewaardvoorjou</span>
    </div>

    <div class="divider"></div>

    <p class="welkom">Welkom,</p>
    <h1 class="naam">TMPL_NAAM</h1>
    <p class="sub">
      Uw levensverhaal staat klaar.<br>
      Audio-herinneringen, uw persoonlijk levensboek en foto&#x27;s.
    </p>

    <a class="btn" href="04_Start_Hier_Offline/index.html">
      Open mijn levensverhaal
    </a>

    <p class="hint">
      Wordt automatisch geopend
      <span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
    </p>

    <div class="footer-url">www.bewaardvoorjou.nl</div>

  </div>
</body>
</html>"""

_README = """\
WELKOM, TMPL_NAAM
=================

Op deze stick staat uw complete levensverhaal.

Dubbelklik op het bestand  index.html  op deze stick.
Uw persoonlijke welkomstpagina opent dan vanzelf.

WERKT HET NIET?
  Open de map 05_Software en start VLC.
  VLC speelt alle audiofragmenten af.

TIP: Bewaar deze stick op een koele, droge plek
     en maak eens per jaar een extra kopie.

Met warme groet,
Het team van Bewaardvoorjou
www.bewaardvoorjou.nl
"""

_SOFTWARE_README = """\
MEDIASPELERS - Toekomstbestendig afspelen
=========================================

Windows
  Dubbelklik op VLC_Windows/vlc.exe
  (geen installatie nodig)

Mac
  Open VLC_Mac/VLC.app

VLC is gratis, open source en werkt op elk systeem.
Meer informatie: www.videolan.org/vlc

LETTERTYPEN
  De map Lettertypen/ bevat Open Sans als reservekopie.
  Installeer via dubbelklik als tekst er vreemd uitziet.
"""


# ─── Zelf-bijwerken bestanden (op de stick voor de klant) ────────────────────

_ACCOUNT_CONFIG = """\
# Bewaardvoorjou — Mijn account
# ================================
#
# Dit bestand bevat uw persoonlijke inloggegevens.
# Bewaar deze USB-stick altijd op een veilige plek.
#
# Hulp nodig?  www.bewaardvoorjou.nl

E-mailadres:  TMPL_EMAIL
Wachtwoord:
Website:      TMPL_WEBSITE
"""

_UPDATER_BAT = """\
@echo off
chcp 65001 > nul
title Bewaardvoorjou - Verhalen Bijwerken
powershell -ExecutionPolicy Bypass -File "%~dp0updater.ps1"
if %errorlevel% neq 0 pause
"""

_UPDATER_PS1 = """\
#Requires -Version 5.0
# Bewaardvoorjou - Verhalen Bijwerken
# Haalt uw nieuwste verhalen op en zet ze op deze stick.

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host ("=" * 52)
Write-Host "  Bewaardvoorjou  -  Verhalen Bijwerken"
Write-Host ("=" * 52)
Write-Host ""

# ── Config lezen ──────────────────────────────────────
$koppelPad = Join-Path $PSScriptRoot "koppelbestand.txt"
$configPad = Join-Path $PSScriptRoot "mijn_account.txt"
$website   = "https://api.bewaardvoorjou.nl"
$token     = ""

# ── Koppelbestand (geen wachtwoord nodig) ─────────────
if (Test-Path $koppelPad) {
    Write-Host "  Koppelbestand gevonden."
    Get-Content $koppelPad | ForEach-Object {
        $regel = $_.Trim()
        if ($regel -and -not $regel.StartsWith("#")) {
            $delen = $regel -split ":", 2
            if ($delen.Count -eq 2) {
                $s = $delen[0].Trim().ToUpper(); $w = $delen[1].Trim()
                switch ($s) {
                    "TOKEN"   { $token   = $w }
                    "WEBSITE" { $website = $w }
                }
            }
        }
    }
    if (-not $token) {
        Write-Host "  Koppelbestand is leeg of beschadigd."
        Write-Host "  Genereer een nieuw bestand via bewaardvoorjou.nl/instellingen"
        Read-Host "`n  Druk op Enter om af te sluiten"
        exit 1
    }
    Write-Host "  Verbonden zonder wachtwoord."

# ── Fallback: e-mail + wachtwoord ─────────────────────
} elseif (Test-Path $configPad) {
    $email = ""; $wachtwoord = ""
    Get-Content $configPad | ForEach-Object {
        $regel = $_.Trim()
        if ($regel -and -not $regel.StartsWith("#")) {
            $delen = $regel -split ":", 2
            if ($delen.Count -eq 2) {
                $s = $delen[0].Trim().ToLower(); $w = $delen[1].Trim()
                switch ($s) {
                    "e-mailadres" { $email      = $w }
                    "wachtwoord"  { $wachtwoord = $w }
                    "website"     { $website    = $w }
                }
            }
        }
    }
    if (-not $email -or -not $wachtwoord) {
        Write-Host "  Uw gegevens zijn niet ingevuld in 'mijn_account.txt'."
        Write-Host "  Of genereer een koppelbestand via bewaardvoorjou.nl/instellingen"
        Write-Host "  — dan heeft u nooit meer een wachtwoord nodig."
        Read-Host "`n  Druk op Enter om af te sluiten"
        exit 1
    }
    Write-Host "  Inloggen als $email..."
    try {
        $body    = @{ email = $email; password = $wachtwoord } | ConvertTo-Json
        $result  = Invoke-RestMethod -Uri "$website/api/v1/auth/login" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 30
        $token   = $result.access_token
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        if ($code -eq 401) {
            Write-Host "  Inloggen mislukt. Controleer uw wachtwoord in 'mijn_account.txt'."
        } elseif ($_.Exception.Message -match "connect|network") {
            Write-Host "  Geen internetverbinding. Zorg dat uw computer online is."
        } else {
            Write-Host "  Fout: $($_.Exception.Message)"
        }
        Write-Host "  Hulp nodig?  www.bewaardvoorjou.nl"
        Read-Host "`n  Druk op Enter om af te sluiten"
        exit 1
    }
    Write-Host "  Gelukt!"

} else {
    Write-Host "  Er staat geen koppelbestand op deze stick."
    Write-Host ""
    Write-Host "  Ga naar bewaardvoorjou.nl/instellingen"
    Write-Host "  Klik op 'USB-stick koppelen'"
    Write-Host "  Kopieer koppelbestand.txt naar deze stick"
    Read-Host "`n  Druk op Enter om af te sluiten"
    exit 1
}

Write-Host "  Gelukt! U bent ingelogd."
Write-Host ""
Write-Host "  Uw verhalen worden opgehaald van bewaardvoorjou.nl"
Write-Host "  Dit duurt 1 a 2 minuten. Even geduld..."
Write-Host ""

# ── Downloaden ────────────────────────────────────────
$zipPad = Join-Path $env:TEMP "bvj_backup.zip"

try {
    $ProgressPreference = "SilentlyContinue"
    Invoke-WebRequest -Uri "$website/api/v1/account/backup?type=full" `
                      -Headers @{ Authorization = "Bearer $token" } `
                      -OutFile $zipPad `
                      -TimeoutSec 600
    $ProgressPreference = "Continue"
} catch {
    Write-Host "  Downloaden mislukt: $($_.Exception.Message)"
    Write-Host "  Probeer het opnieuw of neem contact op via www.bewaardvoorjou.nl"
    Read-Host "`n  Druk op Enter om af te sluiten"
    exit 1
}

$mb = [Math]::Round((Get-Item $zipPad).Length / 1MB, 1)
Write-Host "  $mb MB opgehaald."
Write-Host ""
Write-Host "  Verhalen op stick zetten..."

# ── Uitpakken (eigen bestanden worden niet overschreven) ──
$BEWAAR = @("updater.ps1", "Verhalen bijwerken.bat", "mijn_account.txt")

try {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead($zipPad)

    foreach ($item in $zip.Entries) {
        if ($item.FullName.EndsWith("/"))       { continue }
        if ($BEWAAR -contains $item.Name)       { continue }

        $doel = Join-Path $PSScriptRoot $item.FullName
        $map  = Split-Path $doel -Parent
        if (-not (Test-Path $map)) {
            New-Item -ItemType Directory -Path $map -Force | Out-Null
        }
        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($item, $doel, $true)
    }
    $zip.Dispose()
} catch {
    Write-Host "  Fout bij uitpakken: $($_.Exception.Message)"
    Read-Host "`n  Druk op Enter om af te sluiten"
    exit 1
} finally {
    if ($zip) { try { $zip.Dispose() } catch {} }
    Remove-Item $zipPad -ErrorAction SilentlyContinue
}

# ── Klaar ─────────────────────────────────────────────
Write-Host ""
Write-Host ("=" * 52)
Write-Host "  Uw verhalen zijn bijgewerkt!"
Write-Host ("=" * 52)
Write-Host ""
Write-Host "  U kunt de stick nu veilig verwijderen."
Write-Host "  Dubbelklik op 'index.html' om uw verhalen te bekijken."
Write-Host ""
Read-Host "  Druk op Enter om dit venster te sluiten"
"""


# ─── Endpoint 1: Wachtrij ─────────────────────────────────────────────────────

@router.get("/queue")
def usb_queue(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Bestellingen die betaald zijn, een USB bevatten, en nog niet gebrand zijn."""
    orders = (
        db.query(Order)
        .filter(
            Order.status == "PAID",
            Order.package_type.in_(_PHYSICAL_PACKAGES),
            Order.usb_burned_at.is_(None),
        )
        .order_by(Order.paid_at.asc())
        .all()
    )

    result = []
    for order in orders:
        user = db.query(User).filter(User.id == order.user_id).first() if order.user_id else None
        journey = (
            db.query(Journey).filter(Journey.user_id == order.user_id).first()
            if order.user_id else None
        )
        audio_count = (
            db.query(MediaAsset)
            .filter(
                MediaAsset.journey_id == journey.id,
                MediaAsset.modality == "audio",
                MediaAsset.storage_state == "ready",
            )
            .count()
            if journey else 0
        )
        result.append({
            "order_id":       order.id,
            "package_type":   order.package_type,
            "customer_name":  user.display_name if user else order.recipient_name,
            "customer_email": user.email if user else order.guest_email,
            "journey_id":     journey.id if journey else None,
            "audio_tracks":   audio_count,
            "paid_at":        order.paid_at.isoformat() if order.paid_at else None,
            "shipping_address": order.shipping_address,
        })
    return result


# ─── Endpoint 2: ZIP-pakket ───────────────────────────────────────────────────

@router.get("/export/{order_id}")
def download_usb_package(
    order_id: str,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> StreamingResponse:
    """
    Bouwt een ZIP-archief in de exacte USB-mapstructuur met parallelle S3-downloads.
    De desktoptool extraheert dit direct naar de USB-stick.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Bestelling niet gevonden")

    user = db.query(User).filter(User.id == order.user_id).first() if order.user_id else None
    journey = (
        db.query(Journey).filter(Journey.user_id == order.user_id).first()
        if order.user_id else None
    )

    naam      = (user.display_name if user else order.recipient_name) or "Gebruiker"
    safe_naam = _safe_name(naam)
    s3        = _s3_client() if settings.s3_bucket and settings.aws_access_key_id else None

    chapters_by_phase: dict[str, list[dict]] = {}
    seq_per_phase: dict[str, int] = {}

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:

        # autorun.inf — Windows AutoPlay toont "Mijn Levensboek openen"
        zf.writestr("autorun.inf", _AUTORUN_INF.encode("utf-8"))

        # Welkomstscherm op root — dubbelklik direct zichtbaar in Verkenner
        welcome = _ROOT_WELCOME_HTML.replace("TMPL_NAAM", naam)
        zf.writestr("index.html", welcome.encode("utf-8"))

        # Welkomst README (tekstversie als browser niet beschikbaar)
        readme = _README.replace("TMPL_NAAM", naam)
        zf.writestr("KLIK_HIER_EERST.txt", readme.encode("utf-8"))

        # Zelf-bijwerken bestanden — klant kan stick zelf bijwerken
        customer_email = (user.email if user else "") or ""
        config = (_ACCOUNT_CONFIG
                  .replace("TMPL_EMAIL",   customer_email)
                  .replace("TMPL_WEBSITE", settings.app_base_url.rstrip("/").replace("/app", "") if hasattr(settings, "app_base_url") else "https://api.bewaardvoorjou.nl"))
        zf.writestr("mijn_account.txt",        config.encode("utf-8"))
        zf.writestr("updater.ps1",             _UPDATER_PS1.encode("utf-8"))
        zf.writestr("Verhalen bijwerken.bat",  _UPDATER_BAT.encode("utf-8"))

        # 01 PDF — gegenereerd met WeasyPrint (valt terug op HTML als WeasyPrint ontbreekt)
        if journey and user:
            try:
                pdf_data = generate_pdf_bytes(journey.id, user, db)
                zf.writestr(f"01_Mijn_Levensboek_PDF/{safe_naam}_Levensboek.pdf", pdf_data)
                logger.info(f"PDF toegevoegd: {len(pdf_data):,} bytes")
            except ImportError:
                # WeasyPrint niet geïnstalleerd — sla print-ready HTML op als fallback
                from app.services.export.pdf_generator import generate_pdf_html
                html_fallback = generate_pdf_html(journey.id, user, db)
                zf.writestr(
                    f"01_Mijn_Levensboek_PDF/{safe_naam}_Levensboek_PRINTKLAAR.html",
                    html_fallback.encode("utf-8"),
                )
                logger.warning("WeasyPrint niet beschikbaar — HTML-fallback opgeslagen")
            except Exception as exc:
                logger.error(f"PDF generatie mislukt: {exc}")
                zf.writestr(
                    f"01_Mijn_Levensboek_PDF/{safe_naam}_Levensboek.pdf.txt",
                    f"PDF kon niet worden gegenereerd: {exc}\n".encode("utf-8"),
                )

        # 02 Audio — parallelle download
        if journey and s3:
            assets = (
                db.query(MediaAsset)
                .filter(
                    MediaAsset.journey_id == journey.id,
                    MediaAsset.modality == "audio",
                    MediaAsset.storage_state == "ready",
                )
                .order_by(MediaAsset.recorded_at.asc())
                .all()
            )
            logger.info(f"USB export {order_id}: {len(assets)} audio-bestanden ophalen...")
            downloaded = _download_parallel(s3, assets)

            for asset in assets:
                data = downloaded.get(asset.id)
                if not data:
                    continue
                phase = _phase_folder(asset.chapter_id)
                seq   = seq_per_phase.get(phase, 0) + 1
                seq_per_phase[phase] = seq
                display = _chapter_display(asset.chapter_id)
                ext     = asset.original_filename.rsplit(".", 1)[-1] if "." in asset.original_filename else "mp3"
                filename = f"{seq:02d}_{display}.{ext}"
                zip_path = f"02_Gesproken_Herinneringen/{phase}/{filename}"
                zf.writestr(zip_path, data)
                chapters_by_phase.setdefault(phase, []).append(
                    {"display_name": display, "filename": filename}
                )

        # Lege fase-submappen zodat de mapstructuur er altijd compleet uitziet
        for fase in _FASE_CONFIG:
            placeholder = f"02_Gesproken_Herinneringen/{fase}/.keep"
            if not any(k.startswith(f"02_Gesproken_Herinneringen/{fase}/") for k in zf.namelist()):
                zf.writestr(placeholder, b"")

        # 03 Foto's (worden handmatig toegevoegd of via een toekomstige fotodienst)
        zf.writestr(
            "03_Mijn_Fotogalerij/LEESMIJ.txt",
            "Uw foto's worden hier geplaatst door het Bewaardvoorjou-team.\n"
            "Neem contact op via www.bewaardvoorjou.nl bij vragen.\n".encode("utf-8"),
        )

        # 04 Offline dashboard
        html = _build_dashboard_html(naam, safe_naam, chapters_by_phase, foto_count=0)
        zf.writestr("04_Start_Hier_Offline/index.html", html.encode("utf-8"))

        # 05 Software-instructie
        zf.writestr("05_Software/LEESMIJ.txt", _SOFTWARE_README.encode("utf-8"))

    total_mb = buf.tell() / 1024 / 1024
    logger.info(f"USB export {order_id} klaar: {total_mb:.1f} MB")

    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="Bewaardvoorjou_{safe_naam}.zip"',
        },
    )


# ─── Endpoint 3: Markeer als gebrand ─────────────────────────────────────────

@router.post("/export/{order_id}/burned")
def mark_as_burned(
    order_id: str,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    note: str = Body(default="", embed=True),
) -> dict:
    """Markeer een bestelling als USB-gebrand en leg de admin-handtekening vast."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Bestelling niet gevonden")
    if order.usb_burned_at:
        raise HTTPException(
            status_code=409,
            detail=f"Al gebrand op {order.usb_burned_at.isoformat()} door {order.usb_burned_by}",
        )

    now = datetime.now(timezone.utc)
    order.usb_burned_at = now
    order.usb_burned_by = admin.email

    db.add(AuditLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action="usb_burned",
        target_user_id=order.user_id,
        detail=f"order={order_id} note={note}",
    ))
    db.commit()

    logger.info(f"USB gebrand: order={order_id} door {admin.email}")
    return {
        "order_id":      order_id,
        "usb_burned_at": now.isoformat(),
        "usb_burned_by": admin.email,
    }
