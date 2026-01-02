"use client";

/**
 * QuickThoughtCard - Kaart weergave voor een quick thought
 *
 * Toont de inhoud, tags, status en acties voor een gedachte.
 */

import { motion } from "framer-motion";
import { Play, Pause, Trash2, Link2, Clock, Sparkles, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  QuickThought,
  getModalityEmoji,
  getCategoryEmoji,
  getCategoryDisplayName,
  formatDuration,
  getProcessingStatusText,
} from "@/lib/quick-thoughts-client";

interface QuickThoughtCardProps {
  thought: QuickThought;
  onDelete?: (id: string) => void;
  onLinkToChapter?: (id: string) => void;
  onPlay?: (thought: QuickThought) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export function QuickThoughtCard({
  thought,
  onDelete,
  onLinkToChapter,
  onPlay,
  showActions = true,
  compact = false,
  className,
}: QuickThoughtCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isProcessing = thought.processing_status === "processing" || thought.transcript_status === "processing";
  const isReady = thought.processing_status === "ready";

  const handlePlayPause = () => {
    if (!thought.media_url) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(thought.media_url);
        audioRef.current.onended = () => setIsPlaying(false);
      }
      audioRef.current.play();
      setIsPlaying(true);
      onPlay?.(thought);
    }
  };

  const displayContent = thought.ai_summary ||
    thought.transcript?.slice(0, 150) ||
    thought.text_content?.slice(0, 150) ||
    "...";

  const timeAgo = getTimeAgo(new Date(thought.created_at));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "bg-white rounded-xl border border-stone-200 overflow-hidden",
        "hover:border-amber-300 hover:shadow-md transition-all",
        compact ? "p-3" : "p-4",
        className
      )}
    >
      <div className="flex gap-3">
        {/* Icon/Play button */}
        <div className="flex-shrink-0">
          {thought.modality !== "text" && thought.media_url && isReady ? (
            <button
              onClick={handlePlayPause}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                "bg-amber-100 hover:bg-amber-200 transition-colors",
                isPlaying && "bg-amber-200"
              )}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-amber-700" />
              ) : (
                <Play className="w-5 h-5 text-amber-700 ml-0.5" />
              )}
            </button>
          ) : (
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              "bg-stone-100",
              isProcessing && "animate-pulse"
            )}>
              <span className="text-xl">
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 text-stone-400 animate-spin" />
                ) : (
                  getModalityEmoji(thought.modality)
                )}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title or Summary */}
          <div className="flex items-start justify-between gap-2">
            <p className={cn(
              "text-stone-900 line-clamp-2",
              compact ? "text-sm" : "text-base"
            )}>
              {thought.title || displayContent}
            </p>

            {/* Emotion indicator */}
            {thought.emotion_score !== null && isReady && (
              <div
                className={cn(
                  "flex-shrink-0 w-2 h-2 rounded-full",
                  thought.emotion_score > 0.6 && "bg-green-400",
                  thought.emotion_score <= 0.6 && thought.emotion_score >= 0.4 && "bg-stone-300",
                  thought.emotion_score < 0.4 && "bg-amber-400"
                )}
                title={`Emotie: ${Math.round(thought.emotion_score * 100)}%`}
              />
            )}
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Duration */}
            {thought.duration_seconds && (
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(thought.duration_seconds)}
              </span>
            )}

            {/* Time ago */}
            <span className="text-xs text-stone-400">
              {timeAgo}
            </span>

            {/* Category */}
            {thought.auto_category && isReady && (
              <Badge variant="secondary" className="text-xs py-0 h-5">
                {getCategoryEmoji(thought.auto_category)}
                <span className="ml-1">{getCategoryDisplayName(thought.auto_category)}</span>
              </Badge>
            )}

            {/* Processing status */}
            {isProcessing && (
              <Badge variant="outline" className="text-xs py-0 h-5 text-amber-600 border-amber-300">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                {getProcessingStatusText(thought.processing_status)}
              </Badge>
            )}

            {/* Used in interview */}
            {thought.is_used_in_interview && (
              <Badge variant="secondary" className="text-xs py-0 h-5 bg-green-100 text-green-700">
                <Sparkles className="w-3 h-3 mr-1" />
                Gebruikt
              </Badge>
            )}
          </div>

          {/* Tags */}
          {thought.auto_tags.length > 0 && isReady && !compact && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {thought.auto_tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
              {thought.auto_tags.length > 4 && (
                <span className="text-xs text-stone-400">
                  +{thought.auto_tags.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          {showActions && isReady && (
            <div className="flex gap-1 mt-2">
              {!thought.chapter_id && onLinkToChapter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLinkToChapter(thought.id)}
                  className="h-7 text-xs text-stone-500 hover:text-amber-600"
                >
                  <Link2 className="w-3 h-3 mr-1" />
                  Koppelen
                </Button>
              )}

              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(thought.id)}
                  className="h-7 text-xs text-stone-400 hover:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Zojuist";
  if (diffMins < 60) return `${diffMins}m geleden`;
  if (diffHours < 24) return `${diffHours}u geleden`;
  if (diffDays < 7) return `${diffDays}d geleden`;

  return date.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
  });
}
