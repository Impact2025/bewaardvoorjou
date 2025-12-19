"use client";

import { useMemo } from "react";
import { ArrowUpRight, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecorderFrame } from "@/components/recorder";
import { CHAPTERS } from "@/lib/chapters";
import type { Highlight } from "@/lib/types";
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";

export function JourneyExperience() {
  const { journey, profile, isLoading, error } = useJourneyBootstrap();

  const activatedChapterDefinitions = useMemo(() => {
    if (!journey?.chapterStatuses) return [];
    const ids = Object.entries(journey.chapterStatuses)
      .filter(([_, status]) => status.isUnlocked)
      .map(([chapterId]) => chapterId);
    return ids
      .map((id) => CHAPTERS.find((chapter) => chapter.id === id))
      .filter((chapter): chapter is typeof CHAPTERS[number] => Boolean(chapter));
  }, [journey?.chapterStatuses]);

  if (isLoading && !journey) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-orange border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-slate-600">Laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-800">Fout bij laden</CardTitle>
          <CardDescription className="text-red-600">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!profile || !journey) {
    return null;
  }

  const currentChapter = CHAPTERS.find((ch) => ch.id === journey.activeChapterId) || CHAPTERS[0];

  return (
    <div className="space-y-4">
      {/* Compact Chapter Header */}
      <div className="flex items-start justify-between gap-4 pb-2 border-b border-slate-100">
        <div className="min-w-0">
          <p className="text-xs font-medium text-orange uppercase tracking-wide mb-0.5">
            {currentChapter.phaseTitle}
          </p>
          <h1 className="text-lg font-semibold text-slate-900 truncate">
            {currentChapter.title}
          </h1>
        </div>
        <Button
          variant="ghost"
          className="text-slate-500 hover:text-slate-700 flex-shrink-0 h-9 px-3 py-2"
          onClick={() => window.history.back()}
        >
          <Info className="h-4 w-4 mr-1" />
          Info
        </Button>
      </div>

      {/* Recording Interface */}
      <RecorderFrame mode="text" chapterId={journey.activeChapterId} />

      {/* Progress Summary - Only show if there's content */}
      {journey.media.length > 0 && (
        <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-lg text-sm">
          <span className="text-slate-600">
            {journey.media.filter(m => m.chapterId === journey.activeChapterId).length} opnames in dit hoofdstuk
          </span>
          <Button variant="ghost" className="text-orange p-0 h-auto" asChild>
            <a href="/recordings">Bekijk alle opnames</a>
          </Button>
        </div>
      )}

      {/* Highlights - Compact */}
      {journey.highlights.length > 0 && (
        <HighlightsPanel highlights={journey.highlights} />
      )}
    </div>
  );
}

interface HighlightsPanelProps {
  highlights: Highlight[];
}

function HighlightsPanel({ highlights }: HighlightsPanelProps) {
  return (
    <div className="py-3 px-4 bg-amber-50 rounded-lg">
      <h3 className="text-sm font-medium text-slate-800 mb-2">Highlights</h3>
      <div className="flex flex-wrap gap-2">
        {highlights.slice(0, 4).map((highlight) => (
          <span
            key={highlight.id}
            className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded text-xs text-slate-700 border border-amber-200"
          >
            {highlight.label}
            <ArrowUpRight className="h-3 w-3 text-amber-600" />
          </span>
        ))}
        {highlights.length > 4 && (
          <span className="text-xs text-slate-500 py-1">+{highlights.length - 4} meer</span>
        )}
      </div>
    </div>
  );
}
