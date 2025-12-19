"use client";

import React, { useRef, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CHAPTERS } from "@/lib/chapters";
import { useRouter } from "next/navigation";
import { AIAssistantChat } from "@/components/journey/ai-assistant-chat";
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";
import { useAuth } from "@/store/auth-context";
import { fetchAssistantPrompt } from "@/lib/assistant";

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

// Helper function to get default mode for a chapter
function getDefaultModeForChapter(chapterId?: string): RecordingMode {
  if (!chapterId) return "text";
  const chapter = CHAPTERS.find(ch => ch.id === chapterId);
  if (!chapter) return "text";
  if (chapter.defaultModalities.includes("text")) return "text";
  if (chapter.defaultModalities.includes("audio")) return "audio";
  if (chapter.defaultModalities.includes("video")) return "video";
  return "text";
}

// Helper function to get next chapter ID
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

// Inner component that uses the context
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
  } = state;

  const actions = useRecorderActions({ chapterId });

  // Fetch initial AI question when component mounts
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

  // Navigation
  const nextChapterId = getNextChapterId(chapterId);
  const hasNextChapter = !!nextChapterId;

  const handleNavigateNext = () => {
    if (nextChapterId) {
      router.push(`/chapter/${nextChapterId}`);
    } else {
      router.push("/chapters");
    }
  };

  // Set ref for video preview/playback
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync refs
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
  }, [mode, state.mediaBlob, refs]);

  const isRecordingDisabled = isRecording || isPreviewing;

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ModeSelector disabled={isRecordingDisabled} />
          <RecorderTimer />
        </div>
        <div className="flex items-center gap-2">
          <UploadStatus />
          <Button
            onClick={() => setAssistantChatOpen(true)}
            variant="ghost"
            className="text-orange hover:text-orange-dark h-9 px-3 py-2"
            aria-label="Open AI assistent"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline ml-1.5">Hulp</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Editor/Preview Area */}
        <div
          className={cn(
            "relative w-full",
            mode === "text" ? "min-h-[400px]" : "aspect-video max-w-2xl mx-auto"
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

        {/* AI Conversation Progress - shows during multi-turn conversation */}
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

        {/* Controls Bar */}
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 bg-slate-50">
          <span className="text-xs text-slate-500">
            {CHAPTERS.find(ch => ch.id === chapterId)?.title || "Hoofdstuk"}
          </span>
          <RecorderControls
            onStartPreview={actions.startPreview}
            onStopPreview={actions.stopPreview}
            onStartRecording={actions.startRecording}
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

      {/* Permission Error */}
      <PermissionError />

      {/* AI Assistant Chat Modal */}
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

// Main exported component with provider
export function RecorderFrame({ chapterId, mode: initialMode }: RecorderFrameProps) {
  const defaultMode = initialMode || getDefaultModeForChapter(chapterId);

  return (
    <RecorderProvider initialMode={defaultMode}>
      <RecorderFrameInner chapterId={chapterId} />
    </RecorderProvider>
  );
}

// Re-export components for direct use
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
