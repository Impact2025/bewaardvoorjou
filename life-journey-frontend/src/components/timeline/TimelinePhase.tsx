"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PHASE_COLORS, type TimelinePhase as TimelinePhasetype, type TimelineChapterDetail } from "@/lib/timeline-types";
import type { ChapterId } from "@/lib/types";
import { TimelineChapter } from "./TimelineChapter";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Sun,
  Heart,
  Briefcase,
  Star,
  Gift,
  Eye,
} from "lucide-react";

// Map phase icons
const PhaseIconMap = {
  intro: Sparkles,
  youth: Sun,
  love: Heart,
  work: Briefcase,
  future: Star,
  bonus: Gift,
  deep: Eye,
};

interface TimelinePhaseProps {
   phase: TimelinePhasetype;
   chapterDetails?: Record<string, TimelineChapterDetail>;
   playingAudio?: string | null;
   onChapterClick?: (chapterId: ChapterId) => void;
   onAudioToggle?: (chapterId: string, audioUrl: string) => void;
   selectedChapterId?: ChapterId;
}

export function TimelinePhaseSection({
   phase,
   chapterDetails,
   playingAudio,
   onChapterClick,
   onAudioToggle,
   selectedChapterId,
}: TimelinePhaseProps) {
  const [isExpanded, setIsExpanded] = useState(phase.is_expanded);
  const colors = PHASE_COLORS[phase.metadata.id];
  const Icon = PhaseIconMap[phase.metadata.id] || Sparkles;

  const progressPercent = Math.round(phase.progress * 100);
  const completedCount = phase.chapters.filter((c) => c.progress >= 1).length;

  return (
    <div className="mb-6">
      {/* Phase Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between p-4 rounded-xl transition-all",
          "hover:shadow-sm",
          colors.bg,
          colors.border,
          "border-2",
        )}
        aria-expanded={isExpanded}
        aria-controls={`phase-${phase.metadata.id}-content`}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-lg",
              colors.text,
              "bg-white/50",
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h3 className={cn("font-semibold", colors.text)}>
              {phase.metadata.label}
            </h3>
            <p className="text-sm text-slate-600">
              {phase.metadata.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress indicator */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-2 bg-white/50 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full", colors.text, "bg-current")}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className={cn("text-sm font-medium", colors.text)}>
              {completedCount}/{phase.chapters.length}
            </span>
          </div>

          {/* Expand/collapse icon */}
          <div className={cn("p-1 rounded-full", colors.text)}>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </div>
        </div>
      </button>

      {/* Chapters Container */}
      <div
        id={`phase-${phase.metadata.id}-content`}
        className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? "max-h-[500px] opacity-100 mt-3" : "max-h-0 opacity-0",
        )}
      >
        <div className="flex gap-3 overflow-x-auto pb-2 px-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {phase.chapters.map((chapter) => (
            <div key={chapter.id} className="snap-start">
               <TimelineChapter
                 chapter={chapter}
                 chapterDetail={chapterDetails?.[chapter.id]}
                 playingAudio={playingAudio}
                 onClick={() => onChapterClick?.(chapter.id as ChapterId)}
                 onAudioToggle={onAudioToggle}
                 isSelected={selectedChapterId === chapter.id}
               />
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
