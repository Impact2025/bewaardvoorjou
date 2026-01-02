"use client";

/**
 * ThoughtsForChapter - Toont relevante gedachten voor een hoofdstuk
 *
 * Wordt getoond op de interview pagina voordat de gebruiker begint.
 * De AI zal deze gedachten gebruiken voor contextbewuste vragen.
 */

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, ChevronDown, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickThoughtCard } from "./QuickThoughtCard";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth-context";
import {
  QuickThought,
  getThoughtsForInterview,
  QuickThoughtsForInterviewResponse,
} from "@/lib/quick-thoughts-client";

interface ThoughtsForChapterProps {
  chapterId: string;
  onThoughtUsed?: (thought: QuickThought) => void;
  className?: string;
}

export function ThoughtsForChapter({
  chapterId,
  onThoughtUsed,
  className,
}: ThoughtsForChapterProps) {
  const { session } = useAuth();
  const token = session?.token;
  const [data, setData] = useState<QuickThoughtsForInterviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchThoughts = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getThoughtsForInterview(chapterId, token);
      setData(response);
    } catch (err) {
      console.error("Failed to fetch thoughts:", err);
      setError("Kon gedachten niet laden");
    } finally {
      setIsLoading(false);
    }
  }, [chapterId, token]);

  useEffect(() => {
    fetchThoughts();
  }, [fetchThoughts]);

  // Don't render if loading with no data yet, or if there are no thoughts
  if (isLoading && !data) {
    return null;
  }

  const allThoughts = [...(data?.direct || []), ...(data?.suggested || [])];

  if (!error && allThoughts.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        "bg-gradient-to-r from-amber-50 to-orange-50",
        "border border-amber-200 rounded-xl overflow-hidden mb-6",
        className
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-amber-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <h3 className="font-medium text-stone-900">
            Je eerdere gedachten
          </h3>
          <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
            {data?.total_unused || 0}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
          )}
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-stone-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-stone-400" />
          )}
        </div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {error ? (
                <div className="text-center py-4">
                  <p className="text-sm text-stone-500 mb-2">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchThoughts}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Opnieuw proberen
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-stone-600 mb-3">
                    De AI zal deze gebruiken om diepere vragen te stellen
                  </p>

                  {/* Direct thoughts */}
                  {data?.direct && data.direct.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {data.direct.slice(0, 3).map((thought) => (
                        <QuickThoughtCard
                          key={thought.id}
                          thought={thought}
                          compact
                          showActions={false}
                          onPlay={onThoughtUsed}
                        />
                      ))}
                    </div>
                  )}

                  {/* Suggested thoughts */}
                  {data?.suggested && data.suggested.length > 0 && (
                    <>
                      {data.direct && data.direct.length > 0 && (
                        <p className="text-xs text-stone-400 mb-2 mt-3">
                          Ook relevant:
                        </p>
                      )}
                      <div className="space-y-2">
                        {data.suggested.slice(0, 2).map((thought) => (
                          <QuickThoughtCard
                            key={thought.id}
                            thought={thought}
                            compact
                            showActions={false}
                            onPlay={onThoughtUsed}
                            className="opacity-80"
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Show more link */}
                  {allThoughts.length > 5 && (
                    <button className="text-sm text-amber-600 hover:text-amber-700 mt-3 font-medium">
                      + {allThoughts.length - 5} meer gedachten
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
