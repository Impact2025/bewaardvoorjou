"use client";

import { cn } from "@/lib/utils";
import {
  BookOpen,
  Sparkles,
  Baby,
  Heart,
  Briefcase,
  Star,
  Gift,
  Compass,
  Check,
} from "lucide-react";
import type { ChapterSelectionData, LifePhase } from "@/lib/onboarding-types";
import { PHASE_INFO } from "@/lib/onboarding-types";

const PHASE_ICONS: Record<LifePhase, typeof BookOpen> = {
  intro: Sparkles,
  youth: Baby,
  love: Heart,
  work: Briefcase,
  future: Star,
  bonus: Gift,
  deep: Compass,
};

const PHASE_COLORS: Record<LifePhase, { bg: string; selected: string; text: string }> = {
  intro: { bg: "bg-orange-50", selected: "border-orange bg-orange/10", text: "text-orange" },
  youth: { bg: "bg-emerald-50", selected: "border-emerald-500 bg-emerald-50", text: "text-emerald-600" },
  love: { bg: "bg-pink-50", selected: "border-pink-500 bg-pink-50", text: "text-pink-600" },
  work: { bg: "bg-blue-50", selected: "border-blue-500 bg-blue-50", text: "text-blue-600" },
  future: { bg: "bg-purple-50", selected: "border-purple-500 bg-purple-50", text: "text-purple-600" },
  bonus: { bg: "bg-amber-50", selected: "border-amber-500 bg-amber-50", text: "text-amber-600" },
  deep: { bg: "bg-slate-50", selected: "border-slate-500 bg-slate-50", text: "text-slate-600" },
};

interface ChapterSelectionStepProps {
  data: ChapterSelectionData;
  onChange: (data: ChapterSelectionData) => void;
}

export function ChapterSelectionStep({ data, onChange }: ChapterSelectionStepProps) {
  const phases: LifePhase[] = ["intro", "youth", "love", "work", "future", "bonus", "deep"];

  const togglePhase = (phase: LifePhase) => {
    const selected = data.selected_phases.includes(phase)
      ? data.selected_phases.filter((p) => p !== phase)
      : [...data.selected_phases, phase];
    onChange({ ...data, selected_phases: selected });
  };

  const selectAll = () => {
    onChange({ ...data, selected_phases: [...phases] });
  };

  const selectCore = () => {
    onChange({ ...data, selected_phases: ["intro", "youth", "love", "work", "future"] });
  };

  const totalChapters = data.selected_phases.reduce(
    (sum, phase) => sum + PHASE_INFO[phase].chapterCount,
    0
  );

  return (
    <div>
      <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-6">
        <BookOpen className="h-8 w-8 text-indigo-600" />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Kies je hoofdstukken
      </h2>
      <p className="text-slate-600 text-center mb-6">
        Selecteer de levensfases die je wilt vastleggen
      </p>

      {/* Quick select buttons */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={selectCore}
          className="px-4 py-2 text-sm rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          Kernverhaal (5)
        </button>
        <button
          onClick={selectAll}
          className="px-4 py-2 text-sm rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          Alles selecteren
        </button>
      </div>

      {/* Phase selection grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {phases.map((phase) => {
          const Icon = PHASE_ICONS[phase];
          const { label, description, chapterCount } = PHASE_INFO[phase];
          const colors = PHASE_COLORS[phase];
          const isSelected = data.selected_phases.includes(phase);

          return (
            <button
              key={phase}
              onClick={() => togglePhase(phase)}
              className={cn(
                "relative p-4 rounded-xl border-2 text-left transition-all",
                isSelected ? colors.selected : "border-slate-200 hover:border-slate-300"
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", colors.text, colors.bg)}>
                    <Check className="h-4 w-4" />
                  </div>
                </div>
              )}

              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-2", colors.bg)}>
                <Icon className={cn("h-5 w-5", colors.text)} />
              </div>

              <h3 className={cn("font-medium", isSelected ? colors.text : "text-slate-900")}>
                {label}
              </h3>
              <p className="text-sm text-slate-500">{description}</p>
              <p className="text-xs text-slate-400 mt-1">
                {chapterCount} hoofdstukken
              </p>
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="p-4 rounded-xl bg-indigo-50 text-center">
        <p className="text-indigo-900">
          <span className="font-bold">{totalChapters}</span> hoofdstukken geselecteerd
        </p>
        <p className="text-sm text-indigo-700">
          Je kunt later altijd meer toevoegen
        </p>
      </div>
    </div>
  );
}
