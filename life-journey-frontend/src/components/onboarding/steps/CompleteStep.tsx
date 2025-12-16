"use client";

import { Button } from "@/components/ui/button";
import { Check, Sparkles, BookOpen, Loader2 } from "lucide-react";
import type { LifePhase } from "@/lib/onboarding-types";
import { PHASE_INFO } from "@/lib/onboarding-types";

interface CompleteStepProps {
  displayName: string;
  selectedPhases: LifePhase[];
  onComplete: () => void;
  isLoading?: boolean;
}

export function CompleteStep({
  displayName,
  selectedPhases,
  onComplete,
  isLoading = false,
}: CompleteStepProps) {
  const totalChapters = selectedPhases.reduce(
    (sum, phase) => sum + PHASE_INFO[phase].chapterCount,
    0
  );

  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <Check className="h-10 w-10 text-green-600" />
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-4">
        Je bent er klaar voor, {displayName}!
      </h2>

      <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
        Alles is ingesteld. Je kunt nu beginnen met het vastleggen van je levensverhaal.
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-10 max-w-sm mx-auto">
        <div className="p-4 rounded-xl bg-orange-50">
          <BookOpen className="h-6 w-6 text-orange mx-auto mb-2" />
          <p className="text-2xl font-bold text-orange">{totalChapters}</p>
          <p className="text-sm text-orange/80">Hoofdstukken</p>
        </div>
        <div className="p-4 rounded-xl bg-purple-50">
          <Sparkles className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-600">{selectedPhases.length}</p>
          <p className="text-sm text-purple-600/80">Levensfases</p>
        </div>
      </div>

      {/* Selected phases */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {selectedPhases.map((phase) => (
          <span
            key={phase}
            className="px-3 py-1 rounded-full bg-slate-100 text-sm text-slate-700"
          >
            {PHASE_INFO[phase].label}
          </span>
        ))}
      </div>

      <Button
        onClick={onComplete}

        disabled={isLoading}
        className="bg-orange hover:bg-orange/90 text-lg px-10"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Even geduld...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            Start mijn verhaal
          </>
        )}
      </Button>

      <p className="text-sm text-slate-500 mt-6">
        Begin bij het eerste hoofdstuk of kies je eigen startpunt
      </p>
    </div>
  );
}
