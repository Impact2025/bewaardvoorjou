"use client";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CHAPTERS, getPhases, getChaptersByPhase } from "@/lib/chapters";
import { ProtectedRoute } from "@/components/protected-route";
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";
import { useMemo } from "react";
import { Video, Mic, FileText } from "lucide-react";

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

  return (
    <AppShell
      title="Jouw Levensverhaal"
      description="Volg de 5 fases om je verhaal vast te leggen"
      activeHref="/chapters"
    >
      <div className="space-y-8">
        {/* Introduction Card */}
        <Card className="bg-gradient-to-br from-teal/10 to-cream border-teal/30">
          <CardHeader>
            <CardTitle className="text-2xl">Welkom bij jouw levensreis</CardTitle>
            <CardDescription className="text-base">
              We begeleiden je door 5 fases om je levensverhaal vast te leggen. Elke fase heeft
              specifieke vragen die je helpen om dieper te reflecteren op verschillende aspecten
              van je leven.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Phases */}
        {phases.map((phase) => {
          const phaseChapters = getChaptersByPhase(phase.id);
          const unlockedInPhase = phaseChapters.filter((ch) =>
            journey?.chapterStatuses?.[ch.id]?.isUnlocked
          );

          return (
            <Card key={phase.id} className="bg-card border-neutral-sand">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{phase.title}</CardTitle>
                    <CardDescription className="mt-2">{phase.description}</CardDescription>
                  </div>
                  <div className="text-sm text-slate-600 bg-cream px-3 py-1 rounded-full">
                    {unlockedInPhase.length}/{phaseChapters.length} beschikbaar
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {phaseChapters.map((chapter) => {
                    const chapterStatus = journey?.chapterStatuses?.[chapter.id];
                    const isUnlocked = chapterStatus?.isUnlocked || false;
                    const status = chapterStatus?.status || "locked";

                    return (
                      <div
                        key={chapter.id}
                        className={`rounded-lg border p-4 transition-colors ${
                          isUnlocked
                            ? "border-teal/40 bg-cream hover:border-teal/60"
                            : "border-neutral-sand bg-slate-50/50 opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-slate-900">{chapter.title}</h3>
                              <div className="flex items-center gap-1">
                                {chapter.defaultModalities.map((modality) => (
                                  <div
                                    key={modality}
                                    className="text-slate-500"
                                    title={modality}
                                  >
                                    {getModalityIcon(modality)}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{chapter.description}</p>
                            <p className="text-sm text-slate-700 italic border-l-2 border-teal/30 pl-3 mt-2">
                              "{chapter.question}"
                            </p>
                            <p className="text-xs text-slate-500 mt-2">{chapter.mediaFocus}</p>
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
            </Card>
          );
        })}

        {/* Help Card */}
        <Card className="bg-cream border-neutral-sand">
          <CardHeader>
            <CardTitle>Tips voor de AI-Interviewer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-5 w-5 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0">
                <span className="text-teal text-xs">💬</span>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Doorvragen</h4>
                <p className="mt-1">
                  De AI zal je aanmoedigen om dieper in te gaan met vragen als
                  "Kun je daar een voorbeeld van geven?" of "Wat voor gevoel gaf je dat?"
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-5 w-5 rounded-full bg-orange/20 flex items-center justify-center flex-shrink-0">
                <span className="text-orange text-xs">🎯</span>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Context</h4>
                <p className="mt-1">
                  Je wordt herinnerd aan het doel van het project en de nalatenschap die je creëert
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-5 w-5 rounded-full bg-sage/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sage text-xs">📝</span>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Media-keuze</h4>
                <p className="mt-1">
                  Elk hoofdstuk heeft een aanbevolen medium (tekst, audio, video) dat het beste
                  past bij het type vraag
                </p>
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
