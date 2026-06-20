"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, BookOpen, Check, ChevronRight,
  Loader2, Lock, Trophy, Users, X,
} from "lucide-react";
import {
  getMyBabyJourney,
  getBabyMilestones,
  markBabyMilestone,
  MILESTONE_LABELS,
  type BabyJourneyWithProgress,
  type BabyMilestonePublic,
} from "@/lib/api/baby";
import { useBabyTheme, type BabyTheme } from "@/components/baby/BabyThemeContext";

// ─── Static data ──────────────────────────────────────────────────────────────

const THEME_LOGOS: Record<BabyTheme, string> = {
  meisje:   "/images/logo-baby-meisje.png",
  jongen:   "/images/logo-baby-jongen.png",
  neutraal: "/images/logo-baby-neutraal.png",
};

interface ChapterMeta {
  label: string;
  emoji: string;
  desc: string;
  phaseIdx: number;
  alwaysOpen: boolean;
}

const CHAPTER_META: Record<string, ChapterMeta> = {
  "baby-birth-story":       { label: "De geboortedag",          emoji: "🌅", desc: "De dag dat alles veranderde — rol-bewust voor moeder én partner", phaseIdx: 0, alwaysOpen: false },
  "baby-week-one":          { label: "De eerste week thuis",    emoji: "🏠", desc: "Overweldigend, magisch, slaapgebrek-gevuld",                      phaseIdx: 0, alwaysOpen: false },
  "baby-month-1":           { label: "Maand 1 — Aankomen",      emoji: "1️⃣", desc: "Ritme vinden, gezichten leren kennen",                          phaseIdx: 1, alwaysOpen: false },
  "baby-month-2":           { label: "Maand 2 — Eerste glimlach","emoji":"😊", desc: "De maand van bewust oogcontact",                               phaseIdx: 1, alwaysOpen: false },
  "baby-month-3":           { label: "Maand 3 — Wakker worden", emoji: "👀", desc: "Alerter, nieuwsgieriger, met eigen karakter",                    phaseIdx: 1, alwaysOpen: false },
  "baby-month-4":           { label: "Maand 4 — Lachen",        emoji: "😄", desc: "Eerste schaterlach en het eerste gebrabbel",                     phaseIdx: 2, alwaysOpen: false },
  "baby-month-5":           { label: "Maand 5 — Ontdekken",     emoji: "🔍", desc: "Alles naar de mond — elk object is een wonder",                  phaseIdx: 2, alwaysOpen: false },
  "baby-month-6":           { label: "Maand 6 — Halverwege!",   emoji: "🎉", desc: "Een halfjaar! Eerste hapjes, eerste omrolpoging",                phaseIdx: 2, alwaysOpen: false },
  "baby-month-7":           { label: "Maand 7 — Bewegen",       emoji: "🌀", desc: "Kruipen, tijgeren — de wereld gaat open",                        phaseIdx: 3, alwaysOpen: false },
  "baby-month-8":           { label: "Maand 8 — Herkennen",     emoji: "💞", desc: "Vreemdelingenvrees en verlangen naar jou",                       phaseIdx: 3, alwaysOpen: false },
  "baby-month-9":           { label: "Maand 9 — Eerste woordjes","emoji":"💬", desc: "Brabbelen wordt betekenis — mama, papa",                       phaseIdx: 3, alwaysOpen: false },
  "baby-month-10":          { label: "Maand 10 — Staan",        emoji: "🏋️", desc: "Optrekken aan meubels, wankelen op twee benen",                 phaseIdx: 4, alwaysOpen: false },
  "baby-month-11":          { label: "Maand 11 — Bijna één!",   emoji: "⏳", desc: "Terugkijken en uitkijken naar de eerste verjaardag",            phaseIdx: 4, alwaysOpen: false },
  "baby-month-12":          { label: "Maand 12 — 1 jaar!",      emoji: "🎂", desc: "Het grote feest — een compleet eigen persoon",                   phaseIdx: 4, alwaysOpen: false },
  "baby-chaos-and-laughs":  { label: "Chaos & lachen",          emoji: "😂", desc: "De blowouts, mislukte foto's — verhalen die altijd worden verteld", phaseIdx: 5, alwaysOpen: true },
  "baby-parent-reflection": { label: "Jij als ouder",           emoji: "🪞", desc: "Hoe heeft dit jaar jou als mens gevormd?",                       phaseIdx: 5, alwaysOpen: true },
  "baby-first-birthday":    { label: "Terugblik jaar 1",        emoji: "🎁", desc: "Van geboorte tot eerste verjaardag — het volledige verhaal",     phaseIdx: 5, alwaysOpen: true },
  "baby-letter-to-child":   { label: "Brief aan de baby",       emoji: "💌", desc: "Een tijdcapsule — te openen op de 18e verjaardag",               phaseIdx: 5, alwaysOpen: true },
};

const CHAPTER_IDS = Object.keys(CHAPTER_META);

const CHAPTER_PHASES = [
  "De komst",
  "Maanden 1 – 3",
  "Maanden 4 – 6",
  "Maanden 7 – 9",
  "Maanden 10 – 12",
  "Altijd beschikbaar",
];

const MILESTONE_EMOJIS: Record<string, string> = {
  eerste_bad_thuis:              "🛁",
  eerste_glimlach:               "😊",
  eerste_lach:                   "😄",
  eerste_doorslapen:             "😴",
  eerste_omrollen_buik_naar_rug: "🔄",
  eerste_omrollen_rug_naar_buik: "↩️",
  eerste_hapjes:                 "🥄",
  eerste_tandje:                 "🦷",
  eerste_zitten:                 "🧸",
  eerste_kruipen:                "🐾",
  eerste_zwaaien:                "👋",
  eerste_klappen:                "👏",
  eerste_kusje:                  "💋",
  eerste_staan:                  "🏋️",
  eerste_woordje_mama:           "🗣️",
  eerste_woordje_papa:           "🗣️",
  eerste_stapjes:                "👣",
  eerste_knipbeurt:              "✂️",
  eerste_zwemmen:                "🏊",
  eerste_fiets:                  "🚲",
  eerste_nachtje_logeren:        "🌙",
  eerste_vakantie:               "✈️",
  eerste_feestdag_kerst:         "🎄",
  eerste_sinterklaas:            "🎅",
  "eerste_crèche":               "🏫",
  eerste_blowout:                "💥",
  eerste_lopen:                  "🚶",
  eerste_verjaardag:             "🎂",
  eerste_cake_smash:             "🎊",
};

const MILESTONE_PHASES = [
  {
    label: "0 – 3 maanden",
    types: ["eerste_bad_thuis","eerste_glimlach","eerste_lach","eerste_doorslapen"],
  },
  {
    label: "3 – 6 maanden",
    types: ["eerste_omrollen_buik_naar_rug","eerste_omrollen_rug_naar_buik","eerste_hapjes","eerste_tandje"],
  },
  {
    label: "6 – 9 maanden",
    types: ["eerste_zitten","eerste_kruipen","eerste_zwaaien","eerste_klappen","eerste_kusje"],
  },
  {
    label: "9 – 12 maanden",
    types: ["eerste_staan","eerste_woordje_mama","eerste_woordje_papa","eerste_stapjes"],
  },
  {
    label: "Memorabele momenten",
    types: [
      "eerste_knipbeurt","eerste_zwemmen","eerste_fiets","eerste_nachtje_logeren",
      "eerste_vakantie","eerste_feestdag_kerst","eerste_sinterklaas","eerste_crèche",
      "eerste_blowout","eerste_lopen","eerste_verjaardag","eerste_cake_smash",
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAge(ageWeeks: number | null): string {
  if (ageWeeks === null) return "";
  if (ageWeeks < 1) return "Pasgeboren";
  if (ageWeeks < 8) return `${ageWeeks} ${ageWeeks === 1 ? "week" : "weken"}`;
  const m = Math.floor(ageWeeks / 4.33);
  return m < 12 ? `${m} ${m === 1 ? "maand" : "maanden"}` : "1 jaar";
}

function dayOfFirstYear(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const diff = Math.floor((Date.now() - new Date(birthDate).getTime()) / 86400000) + 1;
  return diff > 0 && diff <= 365 ? diff : null;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function availableMainCount(ageWeeks: number | null): number {
  if (ageWeeks === null) return 1;
  if (ageWeeks < 1) return 1;
  if (ageWeeks < 4) return 2;
  return Math.min(2 + Math.floor(ageWeeks / 4), 14);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 72, stroke = 6 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90" style={{ minWidth: size }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="white" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BabyDashboardPage() {
  const router = useRouter();
  const { t, theme } = useBabyTheme();

  const [journey, setJourney] = useState<BabyJourneyWithProgress | null>(null);
  const [milestones, setMilestones] = useState<BabyMilestonePublic[]>([]);
  const [loading, setLoading] = useState(true);

  // Milestone expansion state
  const [expanded, setExpanded] = useState<string | null>(null);
  const [markDate, setMarkDate] = useState(todayISO());
  const [markNotes, setMarkNotes] = useState("");
  const [marking, setMarking] = useState<string | null>(null);
  const [justMarked, setJustMarked] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [j, m] = await Promise.all([getMyBabyJourney(), getBabyMilestones()]);
      setJourney(j);
      setMilestones(m);
    } catch {
      router.push("/voor-baby/onboarding");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  // ── Computed ──────────────────────────────────────────────────────────────

  const markedMap = new Map(milestones.map((m) => [m.milestone_type, m]));
  const completedSet = new Set<string>(journey?.completed_chapter_ids ?? []);
  const ageText = formatAge(journey?.current_age_weeks ?? null);
  const dayNum = dayOfFirstYear(journey?.baby_birth_date ?? null);
  const chapterDoneCount = CHAPTER_IDS.filter((id) => completedSet.has(id)).length;
  const avail = availableMainCount(journey?.current_age_weeks ?? null);

  function chapterStatus(cid: string, idx: number): "done" | "next" | "available" | "locked" {
    if (completedSet.has(cid)) return "done";
    if (journey?.next_chapter_id === cid) return "next";
    const meta = CHAPTER_META[cid];
    if (!meta) return "locked";
    if (meta.alwaysOpen) return "available";
    if (idx < avail) return "available";
    return "locked";
  }

  // ── Milestone mark ────────────────────────────────────────────────────────

  const openExpand = (type: string) => {
    if (markedMap.has(type)) return;
    if (expanded === type) {
      setExpanded(null);
    } else {
      setExpanded(type);
      setMarkDate(todayISO());
      setMarkNotes("");
    }
  };

  const handleMark = async (type: string) => {
    if (marking) return;
    setMarking(type);
    try {
      const m = await markBabyMilestone({
        milestone_type: type,
        milestone_date: markDate || undefined,
        notes: markNotes.trim() || undefined,
      });
      setMilestones((prev) => [...prev, m]);
      setExpanded(null);
      setJustMarked(type);
      setTimeout(() => setJustMarked(null), 3000);
      if (journey) {
        setJourney((prev) => prev ? {
          ...prev,
          milestones_completed: prev.milestones_completed + 1,
        } : prev);
      }
    } catch {
      // silently ignore
    } finally {
      setMarking(null);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={`min-h-screen ${t.primaryBg} flex items-center justify-center`}>
        <Loader2 className={`w-8 h-8 ${t.primaryText} animate-spin`} />
      </div>
    );
  }
  if (!journey) return null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src={THEME_LOGOS[theme]}
              alt="Bewaard voor Baby"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="font-bold text-gray-900 text-sm">
              Bewaard voor{" "}
              <span className={t.primaryText}>{journey.baby_name}</span>
            </span>
          </div>
          <Link
            href="/dashboard"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Jouw levensverhaal →
          </Link>
        </div>
      </header>

      {/* ── Hero card ─────────────────────────────────────────────────── */}
      <section className={`${t.quoteSection} px-4 pt-8 pb-6`}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            {/* Name + age */}
            <div>
              <h1 className="text-3xl font-bold text-white leading-tight">
                {journey.baby_name}
              </h1>
              {ageText && (
                <p className="text-white/70 text-sm mt-1 font-medium">{ageText} oud</p>
              )}
            </div>

            {/* Day counter + progress ring */}
            <div className="relative flex items-center justify-center shrink-0">
              <ProgressRing pct={journey.photobook_progress_pct} size={72} stroke={6} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {dayNum ? (
                  <>
                    <span className="text-white font-bold text-lg leading-none">{dayNum}</span>
                    <span className="text-white/60 text-[9px] leading-none mt-0.5 uppercase tracking-wide">dag</span>
                  </>
                ) : (
                  <span className="text-white font-bold text-base">{journey.photobook_progress_pct}%</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-3 mb-6 overflow-x-auto scrollbar-hide pb-1">
            <div className="flex items-center gap-2 bg-white/15 rounded-xl px-4 py-2.5 shrink-0">
              <BookOpen className="w-4 h-4 text-white/80" />
              <span className="text-white font-semibold text-sm">
                {chapterDoneCount}<span className="text-white/60 font-normal">/{CHAPTER_IDS.length} hdst.</span>
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 rounded-xl px-4 py-2.5 shrink-0">
              <Trophy className="w-4 h-4 text-white/80" />
              <span className="text-white font-semibold text-sm">
                {journey.milestones_completed}<span className="text-white/60 font-normal">/{journey.milestones_total} mijlpalen</span>
              </span>
            </div>
            {journey.grandparent_emails.length > 0 && (
              <div className="flex items-center gap-2 bg-white/15 rounded-xl px-4 py-2.5 shrink-0">
                <Users className="w-4 h-4 text-white/80" />
                <span className="text-white font-semibold text-sm">
                  {journey.grandparent_emails.length}<span className="text-white/60 font-normal"> opa/oma</span>
                </span>
              </div>
            )}
          </div>

          {/* Fotoboek progress bar */}
          <div className="mb-5">
            <div className="flex justify-between text-xs text-white/60 mb-2">
              <span>Fotoboek-voortgang</span>
              <span className="font-semibold text-white">{journey.photobook_progress_pct}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${journey.photobook_progress_pct}%` }}
              />
            </div>
          </div>

          {/* Next chapter CTA */}
          {journey.next_chapter_id && (
            <Link
              href={`/chapter/${journey.journey_id}/${journey.next_chapter_id}`}
              className="flex items-center gap-3 bg-white/20 hover:bg-white/30 active:bg-white/25 transition-colors rounded-2xl px-5 py-4 group"
            >
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/60 uppercase tracking-wider font-medium">Nu aan de beurt</p>
                <p className="font-bold text-white truncate">
                  {journey.next_chapter_label ?? journey.next_chapter_id}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          )}

          {/* Fotoboek claim */}
          {journey.photobook_progress_pct >= 100 && !journey.photobook_voucher_claimed && (
            <Link
              href="/voor-baby/dashboard/photobook"
              className="mt-3 flex items-center gap-3 bg-white rounded-2xl px-5 py-4"
            >
              <span className="text-xl">🎉</span>
              <div className="flex-1">
                <p className={`font-bold text-sm ${t.primaryText}`}>Fotoboek-voucher beschikbaar!</p>
                <p className="text-xs text-gray-500">Claim je gedrukte boek</p>
              </div>
              <ChevronRight className={`w-5 h-5 ${t.primaryText} shrink-0`} />
            </Link>
          )}
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">

        {/* ── Mijlpalen ─────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Mijlpalen</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Markeer het moment — met datum en jouw verhaal erbij
              </p>
            </div>
            <span className={`text-sm font-bold ${t.primaryText}`}>
              {journey.milestones_completed}/{journey.milestones_total}
            </span>
          </div>

          <div className="space-y-6">
            {MILESTONE_PHASES.map((phase) => {
              const phaseMarked = phase.types.filter((tp) => markedMap.has(tp)).length;
              return (
                <div key={phase.label}>
                  {/* Phase header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {phase.label}
                    </span>
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className={`text-xs font-bold ${phaseMarked === phase.types.length ? t.primaryText : "text-gray-400"}`}>
                      {phaseMarked}/{phase.types.length}
                    </span>
                  </div>

                  {/* Milestone grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {phase.types.map((type) => {
                      const marked = markedMap.get(type);
                      const isExpanded = expanded === type;
                      const isMarking = marking === type;
                      const isJustMarked = justMarked === type;
                      const label = MILESTONE_LABELS[type] ?? type;
                      const emoji = MILESTONE_EMOJIS[type] ?? "✨";

                      if (marked) {
                        return (
                          <div
                            key={type}
                            className={`rounded-2xl p-4 ${isJustMarked ? t.primaryBgMedium : t.primaryBg} border ${t.primaryBorder} transition-all`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-lg leading-none">{emoji}</span>
                              <div className={`w-5 h-5 rounded-full ${t.timelineDot} flex items-center justify-center shrink-0`}>
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            </div>
                            <p className={`text-xs font-semibold mt-2 ${t.primaryText} leading-relaxed`}>{label}</p>
                            {marked.milestone_date && (
                              <p className="text-xs text-gray-400 mt-0.5">{fmtDate(marked.milestone_date)}</p>
                            )}
                            {isJustMarked && (
                              <p className={`text-xs ${t.primaryText} font-medium mt-1`}>Bewaard! ✨</p>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div key={type} className={`rounded-2xl bg-white border transition-all ${isExpanded ? `border-2 ${t.primaryBorderMedium}` : "border-gray-100"}`}>
                          {/* Card header (always visible) */}
                          <button
                            onClick={() => openExpand(type)}
                            className="w-full p-4 text-left"
                          >
                            <span className="text-lg leading-none">{emoji}</span>
                            <p className="text-xs text-gray-700 font-medium mt-2 leading-relaxed">{label}</p>
                            {!isExpanded && (
                              <p className={`text-xs ${t.primaryText} font-semibold mt-1.5`}>+ Markeer</p>
                            )}
                          </button>

                          {/* Expanded form */}
                          {isExpanded && (
                            <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
                              <div>
                                <label className="text-xs font-medium text-gray-500 block mb-1">Wanneer was het?</label>
                                <input
                                  type="date"
                                  value={markDate}
                                  max={todayISO()}
                                  onChange={(e) => setMarkDate(e.target.value)}
                                  className={`w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 ${t.inputRing} bg-gray-50`}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500 block mb-1">Vertel er iets over&hellip; <span className="text-gray-300">(optioneel)</span></label>
                                <textarea
                                  value={markNotes}
                                  onChange={(e) => setMarkNotes(e.target.value)}
                                  placeholder={`Hoe was het moment?`}
                                  rows={2}
                                  maxLength={300}
                                  className={`w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 ${t.inputRing} bg-gray-50`}
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleMark(type)}
                                  disabled={!!isMarking}
                                  className={`flex-1 flex items-center justify-center gap-1.5 ${t.primary} ${t.primaryHover} text-white text-xs font-bold py-2.5 rounded-xl transition-colors disabled:opacity-60`}
                                >
                                  {isMarking ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <>Bewaar dit moment ✨</>
                                  )}
                                </button>
                                <button
                                  onClick={() => setExpanded(null)}
                                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Hoofdstukken ──────────────────────────────────────────────── */}
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Hoofdstukken</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                AI-begeleide gesprekken over het eerste jaar
              </p>
            </div>
            <span className={`text-sm font-bold ${t.primaryText}`}>
              {chapterDoneCount}/{CHAPTER_IDS.length}
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {CHAPTER_PHASES.map((phaseLabel, phaseIdx) => {
              const phaseCids = CHAPTER_IDS.filter((id) => CHAPTER_META[id]?.phaseIdx === phaseIdx);
              if (phaseCids.length === 0) return null;
              const phaseDone = phaseCids.filter((id) => completedSet.has(id)).length;

              return (
                <div key={phaseLabel}>
                  {/* Phase header */}
                  <div className="flex items-center justify-between px-5 pt-5 pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {phaseLabel}
                    </span>
                    {phaseDone > 0 && (
                      <span className={`text-xs font-bold ${t.primaryText}`}>
                        {phaseDone}/{phaseCids.length}
                      </span>
                    )}
                  </div>

                  {/* Chapter rows */}
                  <div className="divide-y divide-gray-50">
                    {phaseCids.map((cid, relIdx) => {
                      const meta = CHAPTER_META[cid];
                      const idx = CHAPTER_IDS.indexOf(cid);
                      const status = chapterStatus(cid, idx);
                      const isLocked = status === "locked";
                      const isDone = status === "done";
                      const isNext = status === "next";

                      const row = (
                        <div
                          className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                            isLocked
                              ? "opacity-40"
                              : isNext
                              ? t.primaryBg
                              : "hover:bg-gray-50"
                          }`}
                        >
                          {/* Status icon */}
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                              isDone
                                ? t.primaryBgMedium
                                : isNext
                                ? t.primary
                                : isLocked
                                ? "bg-gray-100"
                                : t.primaryBg
                            }`}
                          >
                            {isDone ? (
                              <Check className={`w-4 h-4 ${t.primaryText}`} />
                            ) : isLocked ? (
                              <Lock className="w-3.5 h-3.5 text-gray-400" />
                            ) : (
                              <span className="text-base">{meta.emoji}</span>
                            )}
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm ${
                              isDone ? "text-gray-400 line-through" : isNext ? "text-gray-900" : isLocked ? "text-gray-400" : "text-gray-900"
                            }`}>
                              {meta.label}
                            </p>
                            {isNext && (
                              <p className={`text-xs ${t.primaryText} font-medium mt-0.5`}>
                                Aan de beurt
                              </p>
                            )}
                            {!isNext && !isDone && !isLocked && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">{meta.desc}</p>
                            )}
                            {isDone && (
                              <p className="text-xs text-gray-400 mt-0.5">Voltooid</p>
                            )}
                          </div>

                          {/* Arrow */}
                          {!isLocked && (
                            <ChevronRight className={`w-4 h-4 shrink-0 ${isDone ? "text-gray-200" : t.primaryText}`} />
                          )}
                        </div>
                      );

                      const isLastInPhase = relIdx === phaseCids.length - 1;

                      return isLocked ? (
                        <div key={cid}>{row}</div>
                      ) : (
                        <Link
                          key={cid}
                          href={`/chapter/${journey.journey_id}/${cid}`}
                          className={`block ${isLastInPhase && phaseIdx < CHAPTER_PHASES.length - 1 ? "border-b border-gray-100" : ""}`}
                        >
                          {row}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Familie ───────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-5">Familie</h2>
          <div className="grid grid-cols-2 gap-3">

            {/* Partner */}
            <Link
              href="/voor-baby/dashboard/partner"
              className={`bg-white border ${t.primaryBorder} rounded-3xl p-5 hover:${t.primaryBg} transition-colors shadow-sm`}
            >
              <div className="text-2xl mb-3">💑</div>
              <p className="font-bold text-gray-900 text-sm">Partner</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                {journey.partner_joined_at
                  ? <span className={`${t.primaryText} font-medium`}>Schrijft mee ✓</span>
                  : journey.partner_email
                  ? "Uitnodiging verstuurd"
                  : "Nodig de partner uit"}
              </p>
              <div className={`mt-3 text-xs ${t.primaryText} font-semibold flex items-center gap-1`}>
                Beheren <ArrowRight className="w-3 h-3" />
              </div>
            </Link>

            {/* Grandparents */}
            <Link
              href="/voor-baby/dashboard/grandparents"
              className={`bg-white border ${t.primaryBorder} rounded-3xl p-5 hover:${t.primaryBg} transition-colors shadow-sm`}
            >
              <div className="text-2xl mb-3">👴👵</div>
              <p className="font-bold text-gray-900 text-sm">Opa &amp; oma</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                {journey.grandparent_emails.length === 0
                  ? "Nog niemand toegevoegd"
                  : journey.grandparent_emails.length === 1
                  ? <span className={`${t.primaryText} font-medium`}>1 ontvanger ✓</span>
                  : <span className={`${t.primaryText} font-medium`}>{journey.grandparent_emails.length} ontvangers ✓</span>
                }
              </p>
              <div className={`mt-3 text-xs ${t.primaryText} font-semibold flex items-center gap-1`}>
                Beheren <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </div>

          {/* Fotoboek link card */}
          <Link
            href="/voor-baby/dashboard/photobook"
            className={`mt-3 flex items-center gap-4 bg-white border ${t.primaryBorder} rounded-3xl px-5 py-4 hover:${t.primaryBg} transition-colors shadow-sm`}
          >
            <div className={`w-11 h-11 ${t.primaryBgMedium} rounded-xl flex items-center justify-center shrink-0 text-xl`}>
              📖
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm">Fotoboek-voucher</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {journey.photobook_voucher_claimed
                  ? "Voucher geclaimed — het boek is onderweg!"
                  : `${journey.photobook_progress_pct}% — ${12 - Math.round(journey.photobook_progress_pct / 100 * 12)} maanden te gaan`}
              </p>
            </div>
            <ChevronRight className={`w-4 h-4 ${t.primaryText} shrink-0`} />
          </Link>
        </section>

        {/* ── Bottom padding ─────────────────────────────────────────────── */}
        <div className="h-8" />
      </div>
    </div>
  );
}
