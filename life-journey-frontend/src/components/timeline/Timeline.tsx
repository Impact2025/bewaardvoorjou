"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth-context";
import { getTimeline, getChapterDetail } from "@/lib/timeline-client";
import type { TimelineResponse, TimelineChapterDetail } from "@/lib/timeline-types";
import type { ChapterId } from "@/lib/types";
import { TimelinePhaseSection } from "./TimelinePhase";
import { TimelineStats } from "./TimelineStats";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Play, Pause, Image, Mic } from "lucide-react";
import { logger } from "@/lib/logger";

interface TimelineProps {
  journeyId: string;
  onChapterSelect?: (chapterId: ChapterId) => void;
  selectedChapterId?: ChapterId;
  className?: string;
}

export function Timeline({
  journeyId,
  onChapterSelect,
  selectedChapterId,
  className,
}: TimelineProps) {
  const { session } = useAuth();
  const [timeline, setTimeline] = useState<TimelineResponse | null>(null);
  const [chapterDetails, setChapterDetails] = useState<Record<string, TimelineChapterDetail>>({});
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSeason, setCurrentSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring');

  const fetchTimeline = useCallback(async () => {
    if (!session?.token || !journeyId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await getTimeline(session.token, journeyId);
      setTimeline(data);

      // Load details for chapters with media
      const detailsPromises = data.phases.flatMap(phase =>
        phase.chapters
          .filter(chapter => chapter.media_count > 0)
          .map(chapter =>
            getChapterDetail(session.token, journeyId, chapter.id as ChapterId)
              .then((detail: TimelineChapterDetail) => ({ chapterId: chapter.id, detail }))
              .catch((err: any) => {
                logger.warn(`Failed to load details for chapter ${chapter.id}`, err);
                return null;
              })
          )
      );

      const detailsResults = await Promise.all(detailsPromises);
      const newDetails: Record<string, TimelineChapterDetail> = {};
      detailsResults.forEach((result: { chapterId: string; detail: TimelineChapterDetail } | null) => {
        if (result) {
          newDetails[result.chapterId] = result.detail;
        }
      });
      setChapterDetails(newDetails);

    } catch (err) {
      logger.error("Failed to fetch timeline", err);
      setError("Kon tijdlijn niet laden");
    } finally {
      setIsLoading(false);
    }
  }, [session?.token, journeyId]);

  const toggleAudioPlayback = useCallback((chapterId: string, audioUrl: string) => {
    if (playingAudio === chapterId) {
      // Stop current playback
      setPlayingAudio(null);
    } else {
      // Start new playback
      setPlayingAudio(chapterId);
      // In a real implementation, you would play the audio here
      // For now, just simulate playback
      setTimeout(() => setPlayingAudio(null), 3000);
    }
  }, [playingAudio]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  // Determine current season
  useEffect(() => {
    const now = new Date();
    const month = now.getMonth();
    if (month >= 2 && month <= 4) setCurrentSeason('spring');
    else if (month >= 5 && month <= 7) setCurrentSeason('summer');
    else if (month >= 8 && month <= 10) setCurrentSeason('autumn');
    else setCurrentSeason('winter');
  }, []);

  if (isLoading) {
    return <TimelineSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchTimeline}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  if (!timeline) {
    return null;
  }

  return (
    <div className={cn("space-y-6 relative", className)}>
      {/* Seasonal background */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-5 pointer-events-none",
        `seasonal-${currentSeason}`
      )} />

      <div className="relative">
        {/* Stats overview */}
        <TimelineStats timeline={timeline} />

      {/* Phases */}
      <div className="space-y-2">
        {timeline.phases.map((phase) => (
          <TimelinePhaseSection
            key={phase.metadata.id}
            phase={phase}
            chapterDetails={chapterDetails}
            playingAudio={playingAudio}
            onChapterClick={onChapterSelect}
            onAudioToggle={toggleAudioPlayback}
            selectedChapterId={selectedChapterId}
          />
        ))}
      </div>
      </div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      {/* Phases skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-20 rounded-xl" />
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-28 w-44 rounded-xl flex-shrink-0" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Timeline;
