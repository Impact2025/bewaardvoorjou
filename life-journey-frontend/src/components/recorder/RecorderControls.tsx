"use client";

import { PlayCircle, PauseCircle, Square, Video, ArrowRight } from "lucide-react";
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

  // Text mode controls
  if (mode === "text") {
    if (showNextChapterPrompt) {
      return (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              hideNextChapter();
              setTextContent("");
            }}
            variant="outline"
            className="border-neutral-sand text-slate-700 hover:bg-neutral-sand"
          >
            Blijf hier
          </Button>
          <Button
            onClick={onNavigateNext}
            className="btn-primary flex items-center gap-2"
          >
            {hasNextChapter ? "Ga naar volgend hoofdstuk" : "Terug naar hoofdstukken"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      );
    }

    return (
      <Button
        onClick={() => {
          log.debug("Save button clicked");
          onSaveText();
        }}
        disabled={isUploading || !textContent.trim()}
        className="btn-primary px-8 py-6 text-lg font-semibold"
        aria-busy={isUploading}
      >
        {isUploading ? "Opslaan..." : "💾 Opslaan"}
      </Button>
    );
  }

  // Recording in progress
  if (isRecording || isPaused) {
    return (
      <>
        <Button
          variant="ghost"
          onClick={onTogglePause}
          className="border-neutral-sand text-slate-700 hover:bg-neutral-sand"
          aria-pressed={isPaused}
        >
          {isPaused ? (
            <>
              <PlayCircle className="h-4 w-4" aria-hidden="true" /> Hervatten
            </>
          ) : (
            <>
              <PauseCircle className="h-4 w-4" aria-hidden="true" /> Pauzeren
            </>
          )}
        </Button>
        <Button
          onClick={onStopRecording}
          className="btn-secondary"
          aria-label="Stop opname"
        >
          <Square className="h-4 w-4" aria-hidden="true" /> Stop opname
        </Button>
      </>
    );
  }

  // Recording completed - show upload/next options
  if (mediaBlob) {
    if (showNextChapterPrompt) {
      return (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              hideNextChapter();
              reset();
            }}
            variant="outline"
            className="border-neutral-sand text-slate-700 hover:bg-neutral-sand"
          >
            Blijf hier
          </Button>
          <Button
            onClick={onNavigateNext}
            className="btn-primary flex items-center gap-2"
          >
            {hasNextChapter ? "Ga naar volgend hoofdstuk" : "Terug naar hoofdstukken"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      );
    }

    return (
      <>
        <Button
          onClick={onReset}
          variant="ghost"
          className="border-neutral-sand text-slate-700 hover:bg-neutral-sand"
        >
          Opnieuw opnemen
        </Button>
        <Button
          onClick={onUpload}
          disabled={isUploading}
          className="btn-primary"
          aria-busy={isUploading}
        >
          {isUploading ? "Uploaden..." : "Uploaden"}
        </Button>
      </>
    );
  }

  // Video mode with preview
  if (mode === "video" && isPreviewing) {
    return (
      <>
        <Button
          onClick={onStopPreview}
          variant="ghost"
          className="border-neutral-sand text-slate-700 hover:bg-neutral-sand"
        >
          Camera uit
        </Button>
        <Button
          onClick={onStartRecording}
          className="btn-primary"
          aria-label="Start video-opname"
        >
          <PlayCircle className="h-4 w-4" aria-hidden="true" /> Start opname
        </Button>
      </>
    );
  }

  // Default: Start recording button
  return (
    <Button
      onClick={onStartRecording}
      className="btn-primary"
      aria-label={`Start ${mode === "video" ? "video" : "audio"}-opname`}
    >
      <PlayCircle className="h-4 w-4" aria-hidden="true" /> Start opname
    </Button>
  );
}

export default RecorderControls;
