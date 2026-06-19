"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Lock, BookOpen, ChevronRight, Camera, Loader2 } from "lucide-react";
import {
  getMyBabyJourney,
  getBabyMilestones,
  markBabyMilestone,
  MILESTONE_LABELS,
  MILESTONE_TYPES_ORDERED,
  type BabyJourneyWithProgress,
  type BabyMilestonePublic,
} from "@/lib/api/baby";

const MONTHLY_CHAPTER_META: Record<string, { label: string; emoji: string }> = {
  "baby-birth-story":   { label: "De geboortedag",         emoji: "🌅" },
  "baby-week-one":      { label: "De eerste week thuis",    emoji: "🏠" },
  "baby-month-1":       { label: "Maand 1",                 emoji: "1️⃣" },
  "baby-month-2":       { label: "Maand 2",                 emoji: "2️⃣" },
  "baby-month-3":       { label: "Maand 3",                 emoji: "3️⃣" },
  "baby-month-4":       { label: "Maand 4",                 emoji: "4️⃣" },
  "baby-month-5":       { label: "Maand 5",                 emoji: "5️⃣" },
  "baby-month-6":       { label: "Maand 6 — Halverwege!",   emoji: "🎉" },
  "baby-month-7":       { label: "Maand 7",                 emoji: "7️⃣" },
  "baby-month-8":       { label: "Maand 8",                 emoji: "8️⃣" },
  "baby-month-9":       { label: "Maand 9 — Eerste woordjes", emoji: "💬" },
  "baby-month-10":      { label: "Maand 10",                emoji: "🔟" },
  "baby-month-11":      { label: "Maand 11",                emoji: "⏳" },
  "baby-month-12":      { label: "Maand 12 — 1 jaar!",      emoji: "🎂" },
  "baby-chaos-and-laughs":   { label: "Chaos & lachen",    emoji: "😂" },
  "baby-parent-reflection":  { label: "Jij als ouder",      emoji: "🪞" },
  "baby-first-birthday":     { label: "Eerste verjaardag",  emoji: "🎁" },
  "baby-letter-to-child":    { label: "Brief aan de baby",  emoji: "💌" },
};

const CHAPTER_IDS = Object.keys(MONTHLY_CHAPTER_META);

export default function BabyDashboardPage() {
  const router = useRouter();
  const [journey, setJourney] = useState<BabyJourneyWithProgress | null>(null);
  const [milestones, setMilestones] = useState<BabyMilestonePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingType, setMarkingType] = useState<string | null>(null);

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

  const markedTypes = new Set(milestones.map((m) => m.milestone_type));

  const handleMarkMilestone = async (type: string) => {
    if (markedTypes.has(type) || markingType) return;
    setMarkingType(type);
    try {
      const newMilestone = await markBabyMilestone({ milestone_type: type });
      setMilestones((prev) => [...prev, newMilestone]);
    } catch {
      // ignore
    } finally {
      setMarkingType(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
      </div>
    );
  }

  if (!journey) return null;

  const ageLabel = journey.current_age_weeks !== null
    ? journey.current_age_weeks < 8
      ? `${journey.current_age_weeks} weken oud`
      : `${Math.floor(journey.current_age_weeks / 4)} maanden oud`
    : null;

  return (
    <div className="min-h-screen bg-pink-50">

      {/* Top bar */}
      <div className="bg-white border-b border-pink-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <span className="font-bold text-gray-900">
          Bewaard voor <span className="text-pink-600">{journey.baby_name}</span>
        </span>
        <Link
          href="/dashboard"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Jouw levensverhaal →
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Hero card */}
        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl p-6 text-white shadow-md">
          <div className="text-3xl mb-2">👶</div>
          <h1 className="text-2xl font-bold">{journey.baby_name}</h1>
          {ageLabel && <p className="text-pink-100 mt-1 text-sm">{ageLabel}</p>}

          {journey.next_chapter_id && (
            <Link
              href={`/chapter/${journey.journey_id}/${journey.next_chapter_id}`}
              className="mt-5 flex items-center gap-3 bg-white/20 hover:bg-white/30 transition-colors rounded-2xl px-5 py-4"
            >
              <BookOpen className="w-5 h-5 text-white/80 shrink-0" />
              <div>
                <p className="text-xs text-pink-100 uppercase tracking-wider font-medium">
                  Volgende hoofdstuk
                </p>
                <p className="font-semibold text-white">
                  {journey.next_chapter_label ?? journey.next_chapter_id}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/70 ml-auto shrink-0" />
            </Link>
          )}
        </div>

        {/* Fotoboek progress */}
        <div className="bg-white rounded-3xl border border-pink-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-gray-900">Fotoboek-voucher</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Voltooi alle 12 maanden voor een gedrukt boek
              </p>
            </div>
            <span className="text-2xl font-bold text-pink-600">
              {journey.photobook_progress_pct}%
            </span>
          </div>
          <div className="h-2.5 bg-pink-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-pink-500 rounded-full transition-all"
              style={{ width: `${journey.photobook_progress_pct}%` }}
            />
          </div>
          {journey.photobook_progress_pct >= 100 && (
            <Link
              href="/voor-baby/dashboard/photobook"
              className="mt-4 block text-center bg-pink-600 text-white font-semibold py-3 rounded-xl hover:bg-pink-700 transition-colors text-sm"
            >
              Claim je fotoboek-voucher
            </Link>
          )}
        </div>

        {/* Hoofdstukken */}
        <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-pink-50">
            <h2 className="font-bold text-gray-900">Hoofdstukken</h2>
            <p className="text-sm text-gray-400 mt-0.5">14 hoofdstukken over het eerste jaar</p>
          </div>
          <div className="divide-y divide-pink-50">
            {CHAPTER_IDS.map((cid) => {
              const meta = MONTHLY_CHAPTER_META[cid];
              const isNext = journey.next_chapter_id === cid;
              const isDone = false; // TODO: journey.progress niet beschikbaar hier — backend geeft dit via journey_id

              return (
                <Link
                  key={cid}
                  href={`/chapter/${journey.journey_id}/${cid}`}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-pink-50/40 transition-colors ${
                    isNext ? "bg-pink-50/60" : ""
                  }`}
                >
                  <span className="text-xl shrink-0">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${isDone ? "text-gray-400 line-through" : "text-gray-900"}`}>
                      {meta.label}
                    </p>
                    {isNext && (
                      <p className="text-xs text-pink-500 font-medium mt-0.5">Aan de beurt</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mijlpalen */}
        <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-pink-50 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Mijlpalen</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {journey.milestones_completed} / {journey.milestones_total} gemarkeerd
              </p>
            </div>
            <span className="text-pink-600 font-bold text-sm">
              {Math.round((journey.milestones_completed / journey.milestones_total) * 100)}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-px bg-pink-50">
            {MILESTONE_TYPES_ORDERED.map((type) => {
              const label = MILESTONE_LABELS[type] ?? type;
              const marked = markedTypes.has(type);
              const isMarking = markingType === type;

              return (
                <button
                  key={type}
                  onClick={() => handleMarkMilestone(type)}
                  disabled={marked || !!markingType}
                  className={`flex items-start gap-3 p-4 text-left transition-colors ${
                    marked
                      ? "bg-pink-50 cursor-default"
                      : "bg-white hover:bg-pink-50/60 cursor-pointer"
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      marked
                        ? "bg-pink-500 border-pink-500"
                        : "border-gray-300"
                    }`}
                  >
                    {marked && <Check className="w-3 h-3 text-white" />}
                    {isMarking && <Loader2 className="w-3 h-3 text-pink-300 animate-spin" />}
                  </div>
                  <span
                    className={`text-xs leading-relaxed ${
                      marked ? "text-pink-600 font-medium" : "text-gray-600"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Instellingen links */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/voor-baby/dashboard/grandparents"
            className="bg-white border border-pink-100 rounded-2xl p-5 text-center hover:bg-pink-50 transition-colors shadow-sm"
          >
            <div className="text-2xl mb-2">👴</div>
            <p className="font-medium text-gray-800 text-sm">Opa &amp; oma</p>
            <p className="text-xs text-gray-400 mt-1">
              {journey.grandparent_emails.length} toegevoegd
            </p>
          </Link>
          <Link
            href="/voor-baby/dashboard/partner"
            className="bg-white border border-pink-100 rounded-2xl p-5 text-center hover:bg-pink-50 transition-colors shadow-sm"
          >
            <div className="text-2xl mb-2">💑</div>
            <p className="font-medium text-gray-800 text-sm">Partner</p>
            <p className="text-xs text-gray-400 mt-1">
              {journey.partner_email ? "Uitgenodigd" : "Nog niet uitgenodigd"}
            </p>
          </Link>
        </div>

      </div>
    </div>
  );
}
