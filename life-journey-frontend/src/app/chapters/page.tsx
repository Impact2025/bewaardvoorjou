"use client";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CHAPTERS, getPhases, getChaptersByPhase } from "@/lib/chapters";
import { ProtectedRoute } from "@/components/protected-route";
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";
import { useMemo, useState } from "react";
import { Video, Mic, FileText, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const MODALITY_LABELS: Record<string, string> = {
  text: "Schrijven",
  audio: "Praten",
  video: "Filmen",
};

function ChaptersContent() {
  const { journey, isLoading, error } = useJourneyBootstrap();
  const phases = getPhases();

  const activatedChapters = useMemo(() => {
    if (!journey?.chapterStatuses) return [];
    const ids = Object.entries(journey.chapterStatuses)
      .filter(([_, status]) => status.isUnlocked)
      .map(([chapterId]) => chapterId);
    return ids
      .map((id) => CHAPTERS.find((chapter) => chapter.id === id))
      .filter((chapter): chapter is typeof CHAPTERS[number] => Boolean(chapter));
  }, [journey?.chapterStatuses]);

  // Bepaal de actieve fase op basis van het actieve hoofdstuk
  const activePhaseId = useMemo(() => {
    if (!journey?.activeChapterId) return phases[0]?.id ?? null;
    for (const phase of phases) {
      const phaseChapters = getChaptersByPhase(phase.id);
      if (phaseChapters.some((ch) => ch.id === journey.activeChapterId)) {
        return phase.id;
      }
    }
    return phases[0]?.id ?? null;
  }, [journey?.activeChapterId, phases]);

  const [openPhases, setOpenPhases] = useState<Set<string>>(() =>
    activePhaseId ? new Set([activePhaseId]) : new Set()
  );

  function togglePhase(phaseId: string) {
    setOpenPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  }

  const getModalityIcon = (modality: "text" | "audio" | "video") => {
    switch (modality) {
      case "text":
        return <FileText className="h-4 w-4" />;
      case "audio":
        return <Mic className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Jouw Levensverhaal" description="Volg de 5 fases om je verhaal vast te leggen" activeHref="/chapters">
        <Card className="bg-cream border-neutral-sand">
          <CardHeader>
            <CardTitle>Bezig met laden…</CardTitle>
            <CardDescription>We halen je geactiveerde hoofdstukken op.</CardDescription>
          </CardHeader>
        </Card>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Jouw Levensverhaal" description="Volg de 5 fases om je verhaal vast te leggen" activeHref="/chapters">
        <Card className="bg-cream border-neutral-sand">
          <CardHeader>
            <CardTitle>Kon hoofdstukken niet laden</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Jouw Levensverhaal"
      description="Volg de 5 fases om je verhaal vast te leggen"
      activeHref="/chapters"
    >
      <div className="space-y-4">
        {/* Introduction Card */}
        <Card className="bg-gradient-to-br from-teal/10 to-cream border-teal/30">
          <CardHeader>
            <CardTitle className="text-2xl">Welkom bij jouw levensreis</CardTitle>
            <CardDescription className="text-base">
              We begeleiden je door 5 fases om je levensverhaal vast te leggen. Klik op een fase om de hoofdstukken te bekijken.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Phases — accordion */}
        <div className="space-y-3">
          {phases.map((phase) => {
            const phaseChapters = getChaptersByPhase(phase.id);
            const unlockedInPhase = phaseChapters.filter((ch) =>
              journey?.chapterStatuses?.[ch.id]?.isUnlocked
            );
            const isOpen = openPhases.has(phase.id);
            const isActive = phase.id === activePhaseId;

            return (
              <Card key={phase.id} className={cn("bg-card border-neutral-sand overflow-hidden", isActive && "border-teal/40")}>
                {/* Phase header — klikbaar */}
                <button
                  type="button"
                  onClick={() => togglePhase(phase.id)}
                  aria-expanded={isOpen}
                  className="w-full text-left focus:outline-none focus:ring-2 focus:ring-warm-amber/40 focus:ring-inset rounded-xl"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-xl">{phase.title}</CardTitle>
                          {isActive && (
                            <span className="text-xs font-medium bg-teal/15 text-teal px-2 py-0.5 rounded-full">
                              Huidige fase
                            </span>
                          )}
                        </div>
                        <CardDescription className="mt-1">{phase.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm text-slate-500 hidden sm:block">
                          {unlockedInPhase.length}/{phaseChapters.length} beschikbaar
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-5 w-5 text-slate-400 transition-transform duration-200",
                            isOpen && "rotate-180"
                          )}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </CardHeader>
                </button>

                {/* Phase content — collapsible */}
                {isOpen && (
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {phaseChapters.map((chapter) => {
                        const chapterStatus = journey?.chapterStatuses?.[chapter.id];
                        const isUnlocked = chapterStatus?.isUnlocked || false;

                        return (
                          <div
                            key={chapter.id}
                            className={`rounded-xl border p-4 transition-colors ${
                              isUnlocked
                                ? "border-teal/40 bg-cream hover:border-teal/60"
                                : "border-neutral-sand bg-slate-50/50 opacity-60"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h3 className="font-medium text-slate-900">{chapter.title}</h3>
                                  {/* Tijdsindicatie */}
                                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                    ± 10 min
                                  </span>
                                </div>
                                {/* Modalities als leesbare labels */}
                                <div className="flex items-center gap-2 mb-2">
                                  {chapter.defaultModalities.map((modality) => (
                                    <span
                                      key={modality}
                                      className="inline-flex items-center gap-1 text-xs text-slate-500"
                                      title={MODALITY_LABELS[modality]}
                                    >
                                      {getModalityIcon(modality)}
                                      {MODALITY_LABELS[modality]}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-sm text-slate-600 mb-2">{chapter.description}</p>
                                <p className="text-sm text-slate-700 italic border-l-2 border-teal/30 pl-3">
                                  "{chapter.question}"
                                </p>
                              </div>
                              {isUnlocked ? (
                                <Button asChild className="btn-primary flex-shrink-0">
                                  <a href={`/chapter/${chapter.id}`}>Start</a>
                                </Button>
                              ) : (
                                <Button disabled className="flex-shrink-0 opacity-50 cursor-not-allowed">
                                  Vergrendeld
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Help Card — vereenvoudigd */}
        <Card className="bg-cream border-neutral-sand">
          <CardHeader>
            <CardTitle>Hoe werkt het opnemen?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-5 w-5 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0">
                <Mic className="h-3 w-3 text-teal" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Praten, filmen of schrijven</h4>
                <p className="mt-1">Kies hoe jij je verhaal het liefst deelt — elk hoofdstuk heeft een aanbevolen manier.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-5 w-5 rounded-full bg-orange/20 flex items-center justify-center flex-shrink-0">
                <FileText className="h-3 w-3 text-orange" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900">De AI stelt vragen</h4>
                <p className="mt-1">Een vriendelijke assistent helpt je dieper te graven met open vragen.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-5 w-5 rounded-full bg-sage/20 flex items-center justify-center flex-shrink-0">
                <Video className="h-3 w-3 text-sage" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Elke sessie duurt circa 10 minuten</h4>
                <p className="mt-1">Je kunt altijd pauzeren en later verder gaan — jouw voortgang wordt automatisch opgeslagen.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

export default function ChaptersPage() {
  return (
    <ProtectedRoute>
      <ChaptersContent />
    </ProtectedRoute>
  );
}
