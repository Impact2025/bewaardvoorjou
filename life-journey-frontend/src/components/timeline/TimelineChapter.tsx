"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { PHASE_COLORS, type TimelineChapter as TimelineChapterType, type TimelineChapterDetail } from "@/lib/timeline-types";
import { Video, Mic, FileText, Lock, Check, ChevronRight, Play, Pause, Image } from "lucide-react";

interface TimelineChapterProps {
   chapter: TimelineChapterType;
   chapterDetail?: TimelineChapterDetail;
   playingAudio?: string | null;
   onClick?: () => void;
   onAudioToggle?: (chapterId: string, audioUrl: string) => void;
   isSelected?: boolean;
}

export function TimelineChapter({ chapter, chapterDetail, playingAudio, onClick, onAudioToggle, isSelected }: TimelineChapterProps) {
  const colors = PHASE_COLORS[chapter.phase];

  const progressPercent = Math.round(chapter.progress * 100);
  const isCompleted = progressPercent >= 100;
  const isLocked = !chapter.is_unlocked;

  const statusIcon = useMemo(() => {
    if (isLocked) return <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />;
    if (isCompleted) return <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />;
    return null;
  }, [isLocked, isCompleted]);

  const mediaIcons = useMemo(() => {
    const icons = [];
    if (chapter.has_video) icons.push(<Video key="video" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />);
    if (chapter.has_audio) icons.push(<Mic key="audio" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />);
    if (chapter.has_text) icons.push(<FileText key="text" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />);
    return icons;
  }, [chapter.has_video, chapter.has_audio, chapter.has_text]);

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "group relative flex flex-col items-start p-3 sm:p-4 rounded-xl border-2 transition-all duration-200",
        "w-[140px] sm:w-[160px] md:w-[180px] text-left",
        "min-h-[100px] sm:min-h-[120px]",
        "active:scale-[0.98]",
        isLocked && "opacity-50 cursor-not-allowed",
        !isLocked && "hover:shadow-md hover:scale-[1.02] cursor-pointer",
        isSelected && "ring-2 ring-offset-2 ring-teal-500",
        colors.bg,
        colors.border,
      )}
      aria-label={`${chapter.label} - ${progressPercent}% voltooid`}
    >
      {/* Status indicator */}
      <div className="absolute top-2 right-2">
        {statusIcon}
      </div>

      {/* Chapter label */}
      <h4 className={cn("font-medium text-xs sm:text-sm mb-1 pr-5", colors.text)}>
        {chapter.label}
      </h4>

      {/* Progress bar */}
      <div className="w-full h-1 sm:h-1.5 bg-white/50 rounded-full overflow-hidden mb-2">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isCompleted ? "bg-emerald-500" : "bg-current opacity-60",
            colors.text,
          )}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Photo preview - hidden on mobile for space */}
      {chapterDetail?.media_assets.some(asset => asset.modality === 'image') && (
        <div className="hidden sm:block mb-2">
          <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
            <Image className="h-3 w-3" />
            <span>Foto's</span>
          </div>
          <div className="flex gap-1 overflow-hidden">
            {chapterDetail.media_assets
              .filter(asset => asset.modality === 'image')
              .slice(0, 3)
              .map((asset, index) => (
                <div
                  key={asset.id}
                  className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-xs"
                  title={asset.filename}
                >
                  📷
                </div>
              ))}
            {chapterDetail.media_assets.filter(asset => asset.modality === 'image').length > 3 && (
              <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-xs text-slate-500">
                +{chapterDetail.media_assets.filter(asset => asset.modality === 'image').length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audio preview - simplified on mobile */}
      {chapterDetail?.media_assets.some(asset => asset.modality === 'audio') && (
        <div className="mb-2 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Mic className="h-3 w-3" />
              <span className="hidden sm:inline">Audio</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAudioToggle?.(chapter.id, 'preview-url');
              }}
              className="p-1.5 sm:p-1 rounded bg-white/50 hover:bg-white/70 transition-colors min-w-[28px] min-h-[28px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            >
              {playingAudio === chapter.id ? (
                <Pause className="h-3.5 w-3.5 sm:h-3 sm:w-3 text-slate-700" />
              ) : (
                <Play className="h-3.5 w-3.5 sm:h-3 sm:w-3 text-slate-700" />
              )}
            </button>
          </div>
          {chapterDetail.transcripts_preview && (
            <p className="hidden sm:block text-xs text-slate-500 mt-1 line-clamp-2">
              "{chapterDetail.transcripts_preview}"
            </p>
          )}
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center justify-between w-full text-xs text-slate-600 mt-auto">
        <div className="flex items-center gap-1">
          {mediaIcons.length > 0 ? (
            <>
              {mediaIcons}
              <span className="ml-1">{chapter.media_count}</span>
            </>
          ) : (
            <span className="text-slate-400 text-[10px] sm:text-xs">Geen opnames</span>
          )}
        </div>

        {!isLocked && (
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        )}
      </div>

      {/* Duration if available */}
      {chapter.duration_total_seconds > 0 && (
        <div className="mt-1 text-[10px] sm:text-xs text-slate-500">
          {formatDuration(chapter.duration_total_seconds)}
        </div>
      )}
    </button>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}
