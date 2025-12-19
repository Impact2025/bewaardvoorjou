"use client";

import { forwardRef, useMemo, useEffect } from "react";
import { Video, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecorder } from "./RecorderContext";
import { logger } from "@/lib/logger";

const log = logger.forComponent("RecorderPreview");

interface RecorderPreviewProps {
  onStartPreview: () => Promise<void>;
}

export const RecorderPreview = forwardRef<HTMLVideoElement, RecorderPreviewProps>(
  function RecorderPreview({ onStartPreview }, ref) {
    const { state } = useRecorder();
    const { mode, state: recordingState, mediaBlob } = state;

    const isRecording = recordingState === "recording";
    const isPreviewing = recordingState === "previewing";

    // Create blob URL for playback - memoized to avoid recreating on every render
    const blobUrl = useMemo(() => {
      if (mediaBlob) {
        return URL.createObjectURL(mediaBlob);
      }
      return null;
    }, [mediaBlob]);

    // Cleanup blob URL when component unmounts or blob changes
    useEffect(() => {
      return () => {
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
        }
      };
    }, [blobUrl]);

    // Video mode with blob - show playback
    if (mode === "video" && mediaBlob) {
      return (
        <div className="w-full h-full relative bg-black">
          <video
            ref={ref}
            src={blobUrl || undefined}
            controls
            playsInline
            className="w-full h-full object-contain rounded-[24px]"
            onLoadedMetadata={(e) => {
              log.debug("Playback video metadata loaded", {
                width: e.currentTarget.videoWidth,
                height: e.currentTarget.videoHeight,
                duration: e.currentTarget.duration,
              });
              e.currentTarget.play().catch(err => {
                log.warn("Could not autoplay video", { error: err });
              });
            }}
            onError={(e) => {
              const video = e.currentTarget;
              log.error("Playback video error", new Error(video.error?.message), {
                code: video.error?.code,
              });
            }}
          />
          <div className="absolute top-2 left-2 bg-success-green/90 text-white text-xs px-3 py-1 rounded-full">
            Opname voltooid - {(mediaBlob.size / (1024 * 1024)).toFixed(1)} MB
          </div>
        </div>
      );
    }

    // Video mode - live preview or recording
    if (mode === "video" && (isPreviewing || isRecording)) {
      return (
        <div className="w-full h-full relative">
          <video
            ref={ref}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover rounded-[24px] scale-x-[-1]"
            aria-label={isRecording ? "Live opname preview" : "Camera preview"}
          />
          {isRecording && (
            <div
              className="absolute top-2 left-2 flex items-center gap-2 bg-coral/90 text-white text-xs px-3 py-1 rounded-full"
              role="status"
              aria-live="polite"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" aria-hidden="true" />
              Opname bezig
            </div>
          )}
          {isPreviewing && !isRecording && (
            <div className="absolute top-2 left-2 bg-teal/90 text-white text-xs px-3 py-1 rounded-full">
              Camera preview
            </div>
          )}
        </div>
      );
    }

    // Video mode - not started yet
    if (mode === "video") {
      return (
        <div className="space-y-4 p-6 text-center">
          <Video className="h-16 w-16 mx-auto text-teal" aria-hidden="true" />
          <p className="text-balance text-base font-medium">
            "Hoe zou je de sfeer van je ouderlijk huis omschrijven? Welke geluiden of geuren herinner je je?"
          </p>
          <p className="text-xs text-slate-500">
            Klik op "Camera preview" om jezelf te zien voordat je begint.
          </p>
          <p className="text-xs text-orange mt-2">
            💡 Tip: Geef toestemming voor camera als je browser daarom vraagt
          </p>
          <Button
            onClick={onStartPreview}
            variant="ghost"
            className="text-sm text-teal border border-teal hover:bg-teal/10"
          >
            <Video className="h-4 w-4 mr-2" aria-hidden="true" />
            Camera preview
          </Button>
        </div>
      );
    }

    // Audio mode - recording
    if (isRecording) {
      return (
        <div className="flex flex-col items-center gap-4 p-6">
          <Waves className="h-16 w-16 text-teal animate-pulse" aria-hidden="true" />
          <p className="max-w-sm text-pretty text-base" role="status" aria-live="polite">
            Audio-opname bezig... Je stem wordt vol en warm opgenomen.
          </p>
        </div>
      );
    }

    // Audio mode - playback
    if (mode === "audio" && mediaBlob) {
      return (
        <div className="flex flex-col items-center gap-4 p-6">
          <div className="w-full max-w-md">
            <audio
              ref={ref as React.Ref<HTMLAudioElement>}
              src={blobUrl || undefined}
              controls
              className="w-full"
              onLoadedMetadata={() => log.debug("Audio metadata loaded")}
              onError={(e) => {
                const audio = e.currentTarget;
                log.error("Audio playback error", audio.error ? new Error(audio.error.message) : new Error("Unknown audio error"), {
                  code: audio.error?.code,
                  networkState: audio.networkState,
                  readyState: audio.readyState,
                  src: audio.src ? audio.src.substring(0, 100) : "no src",
                  currentSrc: audio.currentSrc ? audio.currentSrc.substring(0, 100) : "no currentSrc",
                });
              }}
              aria-label="Afspelen van opname"
            />
          </div>
          <Waves className="h-16 w-16 text-success-green" aria-hidden="true" />
          <p className="max-w-sm text-pretty text-base">
            Opname voltooid! Luister je opname en klik op "Uploaden" om op te slaan.
          </p>
        </div>
      );
    }

    // Audio mode - not started
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        <Waves className="h-16 w-16 text-teal" aria-hidden="true" />
        <p className="max-w-sm text-pretty text-base">
          Audio-modus actief. Je stem wordt vol en warm opgenomen, zonder video.
        </p>
      </div>
    );
  }
);

export default RecorderPreview;
