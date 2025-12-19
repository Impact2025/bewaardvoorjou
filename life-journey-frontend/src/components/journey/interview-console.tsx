"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { RefreshCw, Sparkles, CheckCircle2, ArrowRight, Mic, Video, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAssistantPrompt } from "@/lib/assistant";
import type { ChapterId } from "@/lib/types";
import { useAuth } from "@/store/auth-context";
import { cn } from "@/lib/utils";
import { useRecorder } from "@/components/recorder/RecorderContext";

interface InterviewConsoleProps {
  chapterId: ChapterId;
  journeyId?: string;
  onFinishChapter?: () => void;
}

// Conversation depth descriptions
const DEPTH_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Oppervlakkig", color: "bg-slate-200" },
  2: { label: "Beginnend", color: "bg-blue-200" },
  3: { label: "Groeiend", color: "bg-teal-200" },
  4: { label: "Verdiepend", color: "bg-green-200" },
  5: { label: "Diepgaand", color: "bg-emerald-300" },
  6: { label: "Rijk", color: "bg-orange-200" },
  7: { label: "Zeer rijk", color: "bg-orange-300" },
  8: { label: "Uitzonderlijk", color: "bg-amber-300" },
  9: { label: "Meesterlijk", color: "bg-yellow-300" },
  10: { label: "Legendarisch", color: "bg-yellow-400" },
};

export function InterviewConsole({
  chapterId,
  journeyId,
  onFinishChapter,
}: InterviewConsoleProps) {
  const [isPending, startTransition] = useTransition();
  const [questionKey, setQuestionKey] = useState(0);
  const [internalQuestion, setInternalQuestion] = useState<string | null>(null);
  const { session } = useAuth();

  // Get conversation state from RecorderContext
  const { state, dispatch } = useRecorder();
  const {
    conversationTurnNumber,
    conversationStoryDepth,
    conversationComplete,
    currentQuestion: contextQuestion,
  } = state;

  // Use context question if available, otherwise use internal state
  const currentQuestion = contextQuestion ?? internalQuestion;

  // Fetch initial prompt when component mounts or chapter changes
  useEffect(() => {
    // Only fetch if we don't have a question and no active conversation
    if (!currentQuestion && conversationTurnNumber === 0) {
      startTransition(() => {
        void fetchAssistantPrompt(chapterId, [], session?.token, journeyId).then((prompt) => {
          setInternalQuestion(prompt);
          // Also update context so it's available elsewhere
          dispatch({ type: "SET_CURRENT_QUESTION", payload: prompt });
        });
      });
    }
  }, [chapterId, session?.token, journeyId, currentQuestion, conversationTurnNumber, dispatch]);

  // Generate new question
  const handleNewQuestion = useCallback(() => {
    startTransition(() => {
      void fetchAssistantPrompt(chapterId, [], session?.token, journeyId).then((prompt) => {
        setInternalQuestion(prompt);
        dispatch({ type: "SET_CURRENT_QUESTION", payload: prompt });
        setQuestionKey(k => k + 1);
      });
    });
  }, [chapterId, session?.token, journeyId, dispatch]);

  // Calculate progress percentage
  const maxTurns = 7;
  const progressPercent = Math.min((conversationTurnNumber / maxTurns) * 100, 100);
  const depthInfo = DEPTH_LABELS[conversationStoryDepth || 1] || DEPTH_LABELS[1];

  // Show completion state
  if (conversationComplete) {
    return (
      <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200 shadow-lg animate-in fade-in duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-green-800">Gesprek Voltooid!</CardTitle>
              <CardDescription className="text-green-700">
                Je hebt {conversationTurnNumber} verhalen gedeeld
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Depth indicator */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">Verhaaldiepte:</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", depthInfo.color)}
                style={{ width: `${(conversationStoryDepth || 1) * 10}%` }}
              />
            </div>
            <span className={cn("text-xs font-medium px-2 py-1 rounded-full", depthInfo.color)}>
              {depthInfo.label}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
              onClick={handleNewQuestion}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Nog een verhaal
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={onFinishChapter}
            >
              Naar volgend hoofdstuk
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show if ConversationProgress is active (conversationTurnNumber > 0 && not complete)
  // ConversationProgress handles the UI during active conversation
  if (conversationTurnNumber > 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-orange-200 shadow-lg overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full">
              <Sparkles className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-slate-800 flex items-center gap-2">
                AI Interviewer
              </CardTitle>
              <CardDescription className="text-slate-600">
                Laten we beginnen met je verhaal
              </CardDescription>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
            onClick={handleNewQuestion}
            disabled={isPending}
          >
            <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Question */}
        <div
          key={questionKey}
          className="relative animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-400 to-amber-400 rounded-full" />
          <p className="text-lg text-slate-800 leading-relaxed pl-4 py-2 font-medium">
            {isPending ? (
              <span className="text-slate-500 italic">Nieuwe vraag laden...</span>
            ) : (
              currentQuestion || "Wat is een moment uit je leven dat je nooit zult vergeten?"
            )}
          </p>
        </div>

        {/* Recording mode hints */}
        <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-orange-100">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>Tekst</span>
          </div>
          <div className="flex items-center gap-1">
            <Mic className="h-3 w-3" />
            <span>Audio</span>
          </div>
          <div className="flex items-center gap-1">
            <Video className="h-3 w-3" />
            <span>Video</span>
          </div>
          <span className="ml-auto text-slate-400">Kies hieronder je opnamemethode</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default InterviewConsole;
