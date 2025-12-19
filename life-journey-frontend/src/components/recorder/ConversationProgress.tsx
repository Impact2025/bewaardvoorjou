"use client";

import { cn } from "@/lib/utils";

interface ConversationProgressProps {
  turnNumber: number;
  storyDepth: number | null;
  currentQuestion: string | null;
  isActive: boolean;
}

/**
 * ConversationProgress - AI Interviewer 2.0 UI
 *
 * Shows the current state of the multi-turn conversation:
 * - Which turn we're on (1-7)
 * - Story depth meter (1-10)
 * - Current question being asked
 * - Encouragement when depth is high
 */
export function ConversationProgress({
  turnNumber,
  storyDepth,
  currentQuestion,
  isActive,
}: ConversationProgressProps) {
  if (!isActive || !currentQuestion) return null;

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3 animate-in slide-in-from-top duration-300">
      {/* Header with turn count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-sm font-medium text-orange-700">
            AI Gesprek
          </span>
        </div>
        <span className="text-xs text-orange-600 font-medium">
          Vraag {turnNumber} van 3-7
        </span>
      </div>

      {/* Story depth meter */}
      {storyDepth !== null && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-orange-600 font-medium">
              Verhaal diepte
            </span>
            <span className="text-xs text-orange-700 font-bold">
              {storyDepth}/10
            </span>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 h-2 rounded-full transition-all duration-300",
                  i < storyDepth ? "bg-orange-500" : "bg-orange-200"
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Current question */}
      <div className="bg-white rounded-lg p-3 border border-orange-200 shadow-sm">
        <p className="text-sm font-medium text-slate-800 leading-relaxed">
          {currentQuestion}
        </p>
      </div>

      {/* Encouragement when depth is high */}
      {storyDepth && storyDepth >= 7 && (
        <div className="flex items-start gap-2 pt-1">
          <span className="text-lg">✨</span>
          <p className="text-xs text-green-600 font-medium">
            Mooi! Je verhaal wordt steeds rijker en betekenisvoller.
          </p>
        </div>
      )}

      {/* Tip for first turn */}
      {turnNumber === 1 && (
        <div className="flex items-start gap-2 pt-1 border-t border-orange-100">
          <span className="text-sm">💡</span>
          <p className="text-xs text-orange-700">
            Neem de tijd. Het gesprek past zich aan jouw verhaal aan.
          </p>
        </div>
      )}
    </div>
  );
}
