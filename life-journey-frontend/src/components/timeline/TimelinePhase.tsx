"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { PHASE_COLORS, type TimelinePhase as TimelinePhasetype, type TimelineChapterDetail } from "@/lib/timeline-types";
import type { ChapterId } from "@/lib/types";
import { TimelineChapter } from "./TimelineChapter";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const colors = PHASE_COLORS[phase.metadata.id];
  const Icon = PhaseIconMap[phase.metadata.id] || Sparkles;

  const progressPercent = Math.round(phase.progress * 100);
  const completedCount = phase.chapters.filter((c) => c.progress >= 1).length;

  const checkScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    checkScroll();
    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [isExpanded, checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="mb-4 sm:mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between p-3 sm:p-4 rounded-xl transition-all",
          "hover:shadow-sm active:scale-[0.99]",
          "min-h-[56px] sm:min-h-0",
          colors.bg,
          colors.border,
          "border-2",
        )}
        aria-expanded={isExpanded}
        aria-controls={}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className={cn("p-1.5 sm:p-2 rounded-lg flex-shrink-0", colors.text, "bg-white/50")}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="text-left min-w-0 flex-1">
            <h3 className={cn("font-semibold text-sm sm:text-base", colors.text)}>
              {phase.metadata.label}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 truncate">
              {phase.metadata.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="flex sm:hidden items-center">
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full bg-white/50", colors.text)}>
              {completedCount}/{phase.chapters.length}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-2 bg-white/50 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full", colors.text, "bg-current")} style={{ width:  }} />
            </div>
            <span className={cn("text-sm font-medium", colors.text)}>{completedCount}/{phase.chapters.length}</span>
          </div>
          <div className={cn("p-1 rounded-full", colors.text)}>
            {isExpanded ? <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" /> : <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />}
          </div>
        </div>
      </button>
      <div
        id={}
        className={cn("overflow-hidden transition-all duration-300", isExpanded ? "max-h-[600px] opacity-100 mt-3" : "max-h-0 opacity-0")}
      >
        <div className="relative">
          {canScrollLeft && (
            <button onClick={() => scroll("left")} className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition-shadow" aria-label="Scroll naar links">
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
          )}
          {canScrollRight && (
            <button onClick={() => scroll("right")} className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white shadow-md hover:shadow-lg transition-shadow" aria-label="Scroll naar rechts">
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </button>
          )}
          {phase.chapters.length > 2 && (
            <div className="sm:hidden flex justify-center mb-2">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <ChevronLeft className="h-3 w-3" /><span>Swipe</span><ChevronRight className="h-3 w-3" />
              </div>
            </div>
          )}
          <div ref={scrollContainerRef} className={cn("flex gap-2 sm:gap-3 overflow-x-auto pb-2 px-1", "snap-x snap-mandatory", "scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent", "scroll-smooth touch-pan-x")}>
            {phase.chapters.map((chapter) => (
              <div key={chapter.id} className="snap-start flex-shrink-0">
                <TimelineChapter chapter={chapter} chapterDetail={chapterDetails?.[chapter.id]} playingAudio={playingAudio} onClick={() => onChapterClick?.(chapter.id as ChapterId)} onAudioToggle={onAudioToggle} isSelected={selectedChapterId === chapter.id} />
              </div>
            ))}
          </div>
          {phase.chapters.length > 2 && (
            <div className="sm:hidden flex justify-center gap-1 mt-2">
              {phase.chapters.map((chapter, idx) => (
                <div key={chapter.id} className={cn("w-1.5 h-1.5 rounded-full transition-colors", idx === 0 ? "bg-slate-400" : "bg-slate-200")} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
