"use client";

import { useRef, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CHAPTERS } from "@/lib/chapters";
import { useRouter } from "next/navigation";
import { AIAssistantChat } from "@/components/journey/ai-assistant-chat";
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";

import { RecorderProvider, useRecorder, RecordingMode } from "./RecorderContext";
import { ModeSelector } from "./ModeSelector";
import { StatusIndicator } from "./StatusIndicator";
import { RecorderTimer } from "./RecorderTimer";
import { RecorderControls } from "./RecorderControls";
import { RecorderPreview } from "./RecorderPreview";
import { TextEditor } from "./TextEditor";
import { UploadStatus } from "./UploadStatus";
import { PermissionError } from "./PermissionError";
import { useRecorderActions } from "./useRecorderActions";

const frameThemes = [
  { id: "modern", label: "Modern", accent: "from-teal/40" },
  { id: "warm", label: "Warm", accent: "from-orange/40" },
  { id: "light", label: "Light", accent: "from-highlight/40" },
];

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
  if (currentIndex === -1 || currentIndex === CHAPTERS.length - 1) {
    return null;
  }

  return CHAPTERS[currentIndex + 1].id;
}

interface RecorderFrameProps {
  chapterId?: string;
  mode?: RecordingMode;
}

// Inner component that uses the context
function RecorderFrameInner({ chapterId }: { chapterId?: string }) {
  const router = useRouter();
  const { journey } = useJourneyBootstrap();
  const { state, refs, setAssistantChatOpen } = useRecorder();
  const { mode, state: recordingState, isAssistantChatOpen } = state;

  const [theme, setTheme] = React.useState(frameThemes[0]);

  const actions = useRecorderActions({ chapterId });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <StatusIndicator />
        <div className="flex items-center gap-2">
          {/* AI Assistant Help Button */}
          <Button
            onClick={() => setAssistantChatOpen(true)}
            variant="outline"
            size="sm"
            className="border-orange/30 bg-gradient-to-br from-orange/10 to-gold/10 text-orange-dark hover:from-orange/20 hover:to-gold/20 flex items-center gap-2"
            aria-label="Open AI assistent voor hulp"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Hulp nodig?</span>
          </Button>

          <ModeSelector disabled={isRecordingDisabled} />
        </div>
      </div>

      {/* Main Recording Frame */}
      <div className="relative overflow-hidden rounded-[42px] border border-teal/30 bg-cream p-6 shadow-2xl">
        <div
          className={cn(
            "absolute inset-0 -z-10 bg-gradient-to-br via-transparent to-transparent",
            theme.accent,
          )}
          aria-hidden="true"
        />
        <div className="flex flex-col gap-6">
          {/* Channel info */}
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Kanaal · {CHAPTERS.find(ch => ch.id === chapterId)?.title || chapterId}</span>
            <div className="flex items-center gap-2">
              <button
                className="rounded-full border border-neutral-sand bg-cream px-3 py-1 text-[11px] uppercase tracking-wide text-slate-700"
                aria-label="Toggle veiligheidsmodus"
              >
                Veiligheidsmodus
              </button>
              <button
                className="rounded-full border border-neutral-sand bg-cream px-3 py-1 text-[11px] uppercase tracking-wide text-slate-700"
                aria-label="Toggle camera vervagen"
              >
                Camera vervagen
              </button>
            </div>
          </div>

          {/* Preview/Recording Area */}
          <div
            className={cn(
              "relative mx-auto flex w-full items-center justify-center rounded-[32px] border border-neutral-sand bg-cream overflow-hidden text-center text-sm text-slate-700",
              mode === "text" ? "max-w-6xl min-h-[850px]" : "aspect-[4/3] max-w-[540px]"
            )}
            role="region"
            aria-label={mode === "text" ? "Tekst invoer" : "Opname preview"}
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

          {/* Timer Bar */}
          <div className="flex items-center justify-between rounded-3xl border border-neutral-sand bg-cream px-4 py-3 text-xs text-slate-600">
            <span>Tempo · Zacht & nieuwsgierig</span>
            <RecorderTimer />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Theme selector */}
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span id="theme-label">Thema:</span>
              <div role="radiogroup" aria-labelledby="theme-label" className="flex gap-2">
                {frameThemes.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={theme.id === option.id}
                    onClick={() => setTheme(option)}
                    className={cn(
                      "rounded-full border px-3 py-1 transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-1",
                      theme.id === option.id
                        ? "border-teal text-teal"
                        : "border-neutral-sand text-slate-500 hover:text-slate-700",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <UploadStatus />
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
        </div>
      </div>

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

// Import React for useState
import React from "react";

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
export { StatusIndicator } from "./StatusIndicator";
export { RecorderTimer } from "./RecorderTimer";
export { RecorderControls } from "./RecorderControls";
export { RecorderPreview } from "./RecorderPreview";
export { TextEditor } from "./TextEditor";
export { UploadStatus } from "./UploadStatus";
export { PermissionError } from "./PermissionError";
export { useRecorderActions } from "./useRecorderActions";

export default RecorderFrame;
