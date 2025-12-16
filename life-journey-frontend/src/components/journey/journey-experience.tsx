"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, CloudOff, BookOpen, Video, Mic, FileText, ArrowRight } from "lucide-react";
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
import { cn, formatDate } from "@/lib/utils";
import type { Highlight } from "@/lib/types";
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";

export function JourneyExperience() {
  const { journey, profile, offlineQueue, isLoading, error } = useJourneyBootstrap();
  const [showIntro, setShowIntro] = useState(true);
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
      <Card className="bg-slate-900/60">
        <CardHeader>
          <CardTitle>Journey laden...</CardTitle>
          <CardDescription>Een ogenblik geduld alstublieft.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-900/60">
        <CardHeader>
          <CardTitle>Kon journey niet laden</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-300">
            Controleer je internetverbinding of probeer het later opnieuw.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!profile || !journey) {
    return null;
  }

  const currentChapter = CHAPTERS.find((ch) => ch.id === journey.activeChapterId) || CHAPTERS[0];

  // Step 1: Chapter Introduction
  if (showIntro) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="border-orange/20 bg-white">
          <CardHeader className="pb-3">
            <div className="text-xs font-medium text-orange uppercase tracking-wide mb-1">
              {currentChapter.phaseTitle}
            </div>
            <CardTitle className="text-2xl font-serif text-slate-900">
              {currentChapter.title}
            </CardTitle>
            <CardDescription className="text-base text-slate-600">
              {currentChapter.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Main Question */}
            <div className="rounded-lg border border-orange/20 bg-orange/5 p-4">
              <h3 className="text-xs font-semibold text-orange uppercase tracking-wide mb-2">
                Centrale Vraag
              </h3>
              <p className="text-base text-slate-800 leading-relaxed">
                {currentChapter.question}
              </p>
            </div>

            {/* Recommended Modalities - Compact */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-medium">Aanbevolen:</span>
              <div className="flex items-center gap-2">
                {currentChapter.defaultModalities.includes("text") && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100">
                    <FileText className="h-3 w-3" />
                    <span>Tekst</span>
                  </div>
                )}
                {currentChapter.defaultModalities.includes("audio") && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100">
                    <Mic className="h-3 w-3" />
                    <span>Audio</span>
                  </div>
                )}
                {currentChapter.defaultModalities.includes("video") && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100">
                    <Video className="h-3 w-3" />
                    <span>Video</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => window.history.back()}
              >
                Terug
              </Button>
              <Button
                className="flex-1 bg-orange hover:bg-orange/90 text-white"
                onClick={() => setShowIntro(false)}
              >
                Start opname
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Recording Interface with Tabs
  return (
    <div className="space-y-6">
      {/* Chapter Header */}
      <Card className="border-orange/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif font-semibold text-slate-900">{currentChapter.title}</h2>
              <p className="text-sm text-slate-600">{currentChapter.description}</p>
            </div>
            <Button
              variant="ghost"

              onClick={() => setShowIntro(true)}
              className="text-orange hover:text-orange/90"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Over dit hoofdstuk
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recording Interface - default to text mode */}
      <RecorderFrame key="text" mode="text" chapterId={journey.activeChapterId} />

      {/* Sidebar Info - Only show if there's content */}
      {journey.media.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-slate-50/50">
            <CardHeader>
              <CardTitle className="text-lg">Voortgang</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Opnames voor dit hoofdstuk</span>
                <span className="font-semibold text-slate-900">
                  {journey.media.filter(m => m.chapterId === journey.activeChapterId).length}
                </span>
              </div>
              <Button variant="ghost" className="w-full" asChild>
                <a href="/recordings">Bekijk al je opnames</a>
              </Button>
            </CardContent>
          </Card>

          <HighlightsPanel highlights={journey.highlights} />
        </div>
      )}
    </div>
  );
}

interface HighlightsPanelProps {
  highlights: Highlight[];
}

function HighlightsPanel({ highlights }: HighlightsPanelProps) {
  if (highlights.length === 0) {
    return null;
  }

  return (
    <Card className="bg-slate-50/50">
      <CardHeader>
        <CardTitle className="text-lg">Highlights</CardTitle>
        <CardDescription>Bijzondere momenten uit je opnames</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {highlights.map((highlight) => (
          <div
            key={highlight.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
          >
            <div>
              <p className="font-medium capitalize text-slate-900">{highlight.label}</p>
              <p className="text-xs text-slate-600">
                {Math.round((highlight.endMs - highlight.startMs) / 1000)} seconden
              </p>
            </div>
            <Button variant="ghost" className="text-orange hover:text-orange/90">
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}