"use client";

import { PlayCircle, PauseCircle, Square, Video, ArrowRight, RotateCcw, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecorder } from "./RecorderContext";
import { logger } from "@/lib/logger";

const log = logger.forComponent("RecorderControls");

interface RecorderControlsProps {
  onStartPreview: () => Promise<void>;
  onStopPreview: () => void;
  onStartRecording: () => Promise<void>;
  onStopRecording: () => void;
  onTogglePause: () => void;
  onUpload: () => Promise<void>;
  onReset: () => void;
  onSaveText: () => Promise<void>;
  onNavigateNext: () => void;
  hasNextChapter: boolean;
}

export function RecorderControls({
  onStartPreview,
  onStopPreview,
  onStartRecording,
  onStopRecording,
  onTogglePause,
  onUpload,
  onReset,
  onSaveText,
  onNavigateNext,
  hasNextChapter,
}: RecorderControlsProps) {
  const { state, hideNextChapter, setTextContent, reset } = useRecorder();
  const {
    mode,
    state: recordingState,
    mediaBlob,
    uploadStatus,
    showNextChapterPrompt,
    textContent,
    isGettingAISuggestion,
  } = state;

  const isRecording = recordingState === "recording";
  const isPaused = recordingState === "paused";
  const isPreviewing = recordingState === "previewing";
  const isUploading = recordingState === "uploading";

  // Doorgaan naar volgend hoofdstuk
  if (showNextChapterPrompt) {
    return (
      <div className="flex items-center gap-3">
        <Button
          onClick={() => {
            hideNextChapter();
            if (mode === "text") setTextContent("");
            else reset();
          }}
          variant="ghost"
          className="text-slate-600 hover:bg-neutral-sand"
        >
          Hier blijven
        </Button>
        <Button
          onClick={onNavigateNext}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-base"
        >
          {hasNextChapter ? "Volgend hoofdstuk" : "Terug naar overzicht"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    );
  }

  // Tekst modus
  if (mode === "text") {
    return (
      <Button
        onClick={() => {
          log.debug("Save button clicked");
          onSaveText();
        }}
        disabled={isUploading || !textContent.trim()}
        className="btn-primary px-8 py-4 text-base font-semibold flex items-center gap-2"
        aria-busy={isUploading}
      >
        <Save className="h-4 w-4" aria-hidden="true" />
        {isUploading ? "Bezig met opslaan..." : "Verhaal opslaan"}
      </Button>
    );
  }

  // Bezig met opnemen of gepauzeerd
  if (isRecording || isPaused) {
    return (
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={onTogglePause}
          className="text-slate-700 hover:bg-neutral-sand flex items-center gap-2"
          aria-pressed={isPaused}
        >
          {isPaused ? (
            <>
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
              Hervatten
            </>
          ) : (
            <>
              <PauseCircle className="h-4 w-4" aria-hidden="true" />
              Pauzeren
            </>
          )}
        </Button>
        <Button
          onClick={onStopRecording}
          className="flex items-center gap-2 px-6 py-3 text-base bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold"
          aria-label="Stop opname"
        >
          <Square className="h-4 w-4" aria-hidden="true" />
          Stop opname
        </Button>
      </div>
    );
  }

  // Opname klaar — uploaden of opnieuw
  if (mediaBlob) {
    return (
      <div className="flex items-center gap-3">
        <Button
          onClick={onReset}
          variant="ghost"
          className="text-slate-600 hover:bg-neutral-sand flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Opnieuw opnemen
        </Button>
        <Button
          onClick={onUpload}
          disabled={isUploading}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-base font-semibold"
          aria-busy={isUploading}
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          {isUploading ? "Even geduld, wordt opgeslagen..." : "Opslaan"}
        </Button>
      </div>
    );
  }

  // Video voorvertoning actief
  if (mode === "video" && isPreviewing) {
    return (
      <div className="flex items-center gap-3">
        <Button
          onClick={onStopPreview}
          variant="ghost"
          className="text-slate-600 hover:bg-neutral-sand"
        >
          Camera uit
        </Button>
        <Button
          onClick={onStartRecording}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-base font-semibold"
          aria-label="Start video-opname"
        >
          <PlayCircle className="h-5 w-5" aria-hidden="true" />
          Start opname
        </Button>
      </div>
    );
  }

  // Standaard startknop — groot en prominent
  return (
    <Button
      onClick={onStartRecording}
      className="btn-primary flex items-center gap-2 px-8 py-4 text-base font-semibold"
      aria-label={`Start ${mode === "video" ? "video" : "audio"}-opname`}
    >
      <PlayCircle className="h-5 w-5" aria-hidden="true" />
      Start je verhaal
    </Button>
  );
}

export default RecorderControls;
