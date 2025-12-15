"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Timeline } from "@/components/timeline";
import { ProtectedRoute } from "@/components/protected-route";
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";
import type { ChapterId } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp } from "lucide-react";

function TimelineContent() {
  const router = useRouter();
  const { journey, isLoading, error } = useJourneyBootstrap();

  const handleChapterSelect = (chapterId: ChapterId) => {
    router.push(`/chapter/${chapterId}`);
  };

  if (isLoading && !journey) {
    return (
      <AppShell
        title="Mijn Levenstijdlijn"
        description="Volg je reis door alle levensfasen"
        activeHref="/timeline"
      >
        <div className="space-y-6">
          <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
          <div className="h-96 rounded-2xl bg-slate-100 animate-pulse" />
        </div>
      </AppShell>
    );
  }

  if (error || !journey) {
    return (
      <AppShell
        title="Mijn Levenstijdlijn"
        description="Volg je reis door alle levensfasen"
        activeHref="/timeline"
      >
        <Card>
          <CardHeader>
            <CardTitle>Kon tijdlijn niet laden</CardTitle>
            <CardDescription>{error || "Geen journey gevonden"}</CardDescription>
          </CardHeader>
        </Card>
      </AppShell>
    );
  }

  const completedChapters = journey?.journeyProgress?.completedChapters || 0;
  const totalChapters = journey?.journeyProgress?.totalChapters || 19;
  const progressPercent = journey?.journeyProgress?.percentComplete || 0;

  return (
    <AppShell
      title="Mijn Levenstijdlijn"
      description={`Je visuele reis · ${completedChapters}/${totalChapters} hoofdstukken voltooid`}
      activeHref="/timeline"
    >
      <div className="space-y-8">
        {/* Hero Section with Memory Lane feel */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 text-white">
          <div className="absolute top-0 right-0 opacity-10">
            <Sparkles className="h-64 w-64" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-8 w-8" />
              <h2 className="text-3xl font-bold">Je Memory Lane</h2>
            </div>
            <p className="text-purple-100 text-lg leading-relaxed mb-6">
              Elke fase van je leven is een hoofdstuk in je verhaal. Wandel door je herinneringen
              en ontdek waar je al bent geweest en wat nog op je wacht.
            </p>
            <div className="flex items-center gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-sm text-purple-100">Voortgang</div>
                <div className="text-2xl font-bold">{progressPercent}%</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-sm text-purple-100">Hoofdstukken</div>
                <div className="text-2xl font-bold">{completedChapters}/{totalChapters}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Component */}
        <Timeline
          journeyId={journey.id}
          onChapterSelect={handleChapterSelect}
          className="timeline-page"
        />

        {/* Encouragement */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange/10 to-gold/10 border border-orange/20">
            <Sparkles className="h-5 w-5 text-orange" />
            <span className="text-slate-700 font-medium">
              Elke stap is een herinnering waard
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function TimelinePage() {
  return (
    <ProtectedRoute>
      <TimelineContent />
    </ProtectedRoute>
  );
}
