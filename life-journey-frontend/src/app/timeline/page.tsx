"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Timeline } from "@/components/timeline";
import { ProtectedRoute } from "@/components/protected-route";
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";
import type { ChapterId } from "@/lib/types";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

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
        <div className="space-y-4">
          <div className="h-32 rounded-xl bg-[#F5F2ED] animate-pulse" />
          <div className="h-96 rounded-xl bg-[#F5F2ED] animate-pulse" />
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
        <Card className="bg-white border border-[#E6E2DD]">
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
      <div className="space-y-6">
        {/* Page intro */}
        <div className="bg-white rounded-xl border border-[#E6E2DD] overflow-hidden">
          <div className="h-1 bg-[#FF8C42]" />
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#FF8C42] mb-1">
                  Tijdlijn
                </p>
                <h2 className="font-serif font-semibold text-[#333333] text-xl sm:text-2xl mb-1">
                  Je Memory Lane
                </h2>
                <p className="text-[#555555] text-sm leading-relaxed max-w-lg">
                  Elke fase van je leven is een hoofdstuk in je verhaal. Wandel door je herinneringen
                  en ontdek waar je al bent geweest en wat nog op je wacht.
                </p>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-[#FF8C42]">{progressPercent}%</p>
                  <p className="text-xs text-[#999] mt-0.5">Voortgang</p>
                </div>
                <div className="w-px h-8 bg-[#E6E2DD]" />
                <div className="text-center">
                  <p className="text-2xl font-semibold text-[#333333]">{completedChapters}<span className="text-base text-[#999] font-normal">/{totalChapters}</span></p>
                  <p className="text-xs text-[#999] mt-0.5">Hoofdstukken</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <Timeline
          journeyId={journey.id}
          onChapterSelect={handleChapterSelect}
          className="timeline-page"
        />
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
