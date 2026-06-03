"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { MessageCircle, HelpCircle, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CHAPTERS } from "@/lib/chapters";
import { useRouter } from "next/navigation";
import { useRecordingConsent } from "./useRecordingConsent";
import { RecordingConsentModal } from "./RecordingConsentModal";

const AIAssistantChat = dynamic(
  () => import("@/components/journey/ai-assistant-chat").then((m) => m.AIAssistantChat),
  { ssr: false }
);
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";
import { useAuth } from "@/store/auth-context";
import { fetchAssistantPrompt } from "@/lib/assistant";

import { ContextHelp } from "@/components/ui/context-help";
import { RecorderProvider, useRecorder, RecordingMode } from "./RecorderContext";
import { ModeSelector } from "./ModeSelector";
import { RecorderTimer } from "./RecorderTimer";
import { RecorderControls } from "./RecorderControls";
import { RecorderPreview } from "./RecorderPreview";
import { TextEditor } from "./TextEditor";
import { UploadStatus } from "./UploadStatus";
import { PermissionError } from "./PermissionError";
import { ConversationProgress } from "./ConversationProgress";
import { useRecorderActions } from "./useRecorderActions";

function getDefaultModeForChapter(chapterId?: string): RecordingMode {
  if (!chapterId) return "text";
  const chapter = CHAPTERS.find(ch => ch.id === chapterId);
  if (!chapter) return "text";
  if (chapter.defaultModalities.includes("text")) return "text";
  if (chapter.defaultModalities.includes("audio")) return "audio";
  if (chapter.defaultModalities.includes("video")) return "video";
  return "text";
}

function getNextChapterId(currentChapterId?: string): string | null {
  if (!currentChapterId) return null;
  const currentIndex = CHAPTERS.findIndex(ch => ch.id === currentChapterId);
  if (currentIndex === -1 || currentIndex === CHAPTERS.length - 1) return null;
  return CHAPTERS[currentIndex + 1].id;
}

interface RecorderFrameProps {
  chapterId?: string;
  mode?: RecordingMode;
}

function RecorderFrameInner({ chapterId }: { chapterId?: string }) {
  const router = useRouter();
  const { session } = useAuth();
  const { journey } = useJourneyBootstrap();
  const { state, refs, setAssistantChatOpen, dispatch } = useRecorder();
  const {
    mode,
    state: recordingState,
    isAssistantChatOpen,
    conversationSessionId,
    conversationTurnNumber,
    conversationStoryDepth,
    conversationComplete,
    currentQuestion,
    showNextChapterPrompt,
  } = state;

  const actions = useRecorderActions({ chapterId });

  // AVG Art. 9 — eenmalige consent voor audio/video opnamen
  const { consentGiven, giveConsent, isReady } = useRecordingConsent(session?.user.id);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  const requireConsent = useCallback(
    (action: () => Promise<void>): Promise<void> => {
      if (mode === "text" || consentGiven) {
        return action();
      }
      return new Promise<void>((resolve) => {
        pendingAction.current = () => { action().then(resolve); };
        setShowConsentModal(true);
      });
    },
    [mode, consentGiven]
  );

  const handleConsentAccept = useCallback(() => {
    giveConsent();
    setShowConsentModal(false);
    pendingAction.current?.();
    pendingAction.current = null;
  }, [giveConsent]);

  const handleConsentDecline = useCallback(() => {
    setShowConsentModal(false);
    pendingAction.current = null;
  }, []);

  // Haal de eerste AI-vraag op bij het laden
  useEffect(() => {
    if (!currentQuestion && chapterId && session?.token && conversationTurnNumber === 0) {
      fetchAssistantPrompt(chapterId as any, [], session.token, journey?.id)
        .then((prompt) => {
          dispatch({ type: "SET_CURRENT_QUESTION", payload: prompt });
        })
        .catch((err) => {
          console.error("Failed to fetch initial question:", err);
        });
    }
  }, [chapterId, session?.token, journey?.id, currentQuestion, conversationTurnNumber, dispatch]);

  const isRecording = recordingState === "recording";
  const isPreviewing = recordingState === "previewing";
  const isIdle = recordingState === "idle";

  const nextChapterId = getNextChapterId(chapterId);
  const hasNextChapter = !!nextChapterId;

  const handleNavigateNext = () => {
    if (nextChapterId) {
      router.push(`/chapter/${nextChapterId}`);
    } else {
      router.push("/chapters");
    }
  };

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (mode === "video") {
      if (state.mediaBlob) {
        refs.playback.current = videoRef.current;
      } else {
        refs.videoPreview.current = videoRef.current;
      }
    } else if (mode === "audio" && state.mediaBlob) {
      refs.playback.current = videoRef.current;
    }
  }, [mode, state.mediaBlob, recordingState, refs]);

  const isRecordingDisabled = isRecording || isPreviewing;
  const chapterTitle = CHAPTERS.find(ch => ch.id === chapterId)?.title || "Hoofdstuk";

  return (
    <div className="space-y-4">

      {/* AI-vraag — prominent bovenaan, verborgen na opslaan */}
      {currentQuestion && !showNextChapterPrompt && (
        <div className="rounded-xl border border-warm-amber/30 bg-warm-amber/5 px-5 py-4">
          <p className="text-xs font-medium text-warm-amber uppercase tracking-wide mb-1">
            Jouw vraag voor dit hoofdstuk
          </p>
          <p className="text-base text-slate-800 leading-relaxed font-medium">
            {currentQuestion}
          </p>
        </div>
      )}

      {/* Modus kiezen — groot als idle, compact tijdens opname, verborgen na opslaan */}
      {showNextChapterPrompt ? null : isIdle ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-600">
              Hoe wil je dit verhaal vertellen?
            </p>
            <ContextHelp
              title="Welk medium kies je?"
              description="Praten: neem alleen je stem op. Filmen: je ziet jezelf terwijl je vertelt. Schrijven: typ je herinneringen op in je eigen tempo."
            />
          </div>
          <ModeSelector disabled={false} compact={false} />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ModeSelector disabled={isRecordingDisabled} compact={true} />
            <RecorderTimer />
          </div>
          <div className="flex items-center gap-2">
            <UploadStatus />
            <Button
              onClick={() => setAssistantChatOpen(true)}
              variant="ghost"
              className="text-orange hover:text-orange-dark h-9 px-3 py-2 flex items-center gap-1.5"
              aria-label="Open AI assistent voor hulp"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="text-sm">Hulp nodig?</span>
            </Button>
          </div>
        </div>
      )}

      {/* Opname-interface */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {showNextChapterPrompt ? (
          /* Success-panel: prominent na opslaan */
          <div className="flex flex-col items-center justify-center gap-5 py-10 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Verhaal opgeslagen!</h3>
              <p className="text-sm text-slate-500 mt-1.5">
                Je herinneringen zijn bewaard voor de volgende generaties.
              </p>
            </div>
            <Button
              onClick={handleNavigateNext}
              className="btn-primary px-8 py-3 text-base font-semibold flex items-center gap-2"
            >
              {hasNextChapter ? "Doorgaan naar volgend hoofdstuk" : "Terug naar overzicht"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <button
              onClick={() => {
                dispatch({ type: "SET_SHOW_NEXT_CHAPTER", payload: false });
                dispatch({ type: "SET_TEXT_CONTENT", payload: "" });
              }}
              className="text-sm text-slate-400 hover:text-slate-600 underline underline-offset-2"
            >
              Nog iets toevoegen
            </button>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "relative w-full",
                mode === "text" ? "min-h-[360px]" : "aspect-video max-w-2xl mx-auto"
              )}
            >
              {mode === "text" ? (
                <TextEditor onGetAISuggestion={actions.getAISuggestion} />
              ) : (
                <RecorderPreview
                  ref={videoRef}
                  onStartPreview={actions.startPreview}
                />
              )}
            </div>

            {/* AI-gesprekvoortgang tijdens multi-turn */}
            {!!conversationSessionId && !conversationComplete && (
              <div className="border-t border-slate-100 px-4 py-3">
                <ConversationProgress
                  turnNumber={conversationTurnNumber}
                  storyDepth={conversationStoryDepth}
                  currentQuestion={currentQuestion}
                  isActive={true}
                />
              </div>
            )}

            {/* Knoppen-balk */}
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-4 bg-slate-50 gap-3 flex-wrap">
              <span className="text-sm text-slate-500 font-medium">{chapterTitle}</span>
              <div className="flex items-center gap-2">
                {isIdle && (
                  <Button
                    onClick={() => setAssistantChatOpen(true)}
                    variant="ghost"
                    className="text-orange hover:text-orange-dark h-9 px-3 flex items-center gap-1.5"
                    aria-label="Open AI assistent"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm hidden sm:inline">Hulp nodig?</span>
                  </Button>
                )}
                <RecorderControls
                  onStartPreview={() => requireConsent(actions.startPreview)}
                  onStopPreview={actions.stopPreview}
                  onStartRecording={() => requireConsent(actions.startRecording)}
                  onStopRecording={actions.stopRecording}
                  onTogglePause={actions.togglePause}
                  onUpload={actions.uploadRecording}
                  onReset={actions.resetRecording}
                  onSaveText={actions.saveTextContent}
                  onNavigateNext={handleNavigateNext}
                  hasNextChapter={hasNextChapter}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <PermissionError />

      {/* AVG Art. 9 — consent modal bij eerste audio/video opname */}
      {isReady && showConsentModal && (
        <RecordingConsentModal
          onAccept={handleConsentAccept}
          onDecline={handleConsentDecline}
        />
      )}

      {chapterId && (
        <AIAssistantChat
          chapterId={chapterId as any}
          journeyId={journey?.id}
          isOpen={isAssistantChatOpen}
          onClose={() => setAssistantChatOpen(false)}
        />
      )}
    </div>
  );
}

export function RecorderFrame({ chapterId, mode: initialMode }: RecorderFrameProps) {
  const defaultMode = initialMode || getDefaultModeForChapter(chapterId);

  return (
    <RecorderProvider initialMode={defaultMode}>
      <RecorderFrameInner chapterId={chapterId} />
    </RecorderProvider>
  );
}

export { RecorderProvider, useRecorder } from "./RecorderContext";
export { ModeSelector } from "./ModeSelector";
export { RecorderTimer } from "./RecorderTimer";
export { RecorderControls } from "./RecorderControls";
export { RecorderPreview } from "./RecorderPreview";
export { TextEditor } from "./TextEditor";
export { UploadStatus } from "./UploadStatus";
export { PermissionError } from "./PermissionError";
export { ConversationProgress } from "./ConversationProgress";
export { useRecorderActions } from "./useRecorderActions";

export default RecorderFrame;
