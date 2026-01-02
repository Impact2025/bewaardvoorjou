"use client";

/**
 * QuickThoughtRecorder - Compacte opname widget voor snelle gedachten
 *
 * Features:
 * - Audio/Video/Text modi
 * - Simpele one-tap opname
 * - Direct uploaden naar backend
 * - Async verwerking (geen wachten op transcriptie)
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Video, Type, Send, X, Loader2, Square, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth-context";
import {
  createTextThought,
  uploadQuickThought,
  QuickThoughtModality,
} from "@/lib/quick-thoughts-client";

type RecordingState = "idle" | "recording" | "recorded" | "uploading";

interface QuickThoughtRecorderProps {
  chapterId?: string;
  onComplete?: (thoughtId: string) => void;
  onCancel?: () => void;
  compact?: boolean;
  className?: string;
}

export function QuickThoughtRecorder({
  chapterId,
  onComplete,
  onCancel,
  compact = false,
  className,
}: QuickThoughtRecorderProps) {
  const { session } = useAuth();
  const token = session?.token;
  const [mode, setMode] = useState<QuickThoughtModality>("audio");
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [textContent, setTextContent] = useState("");
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const constraints = mode === "video"
        ? { video: true, audio: true }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const mimeType = mode === "video" ? "video/webm" : "audio/webm";
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setMediaBlob(blob);
        setRecordingState("recorded");
        stopStream();
      };

      mediaRecorder.start(1000); // Collect data every second
      setRecordingState("recording");
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);

    } catch (err) {
      console.error("Recording error:", err);
      setError("Kon microfoon/camera niet openen. Controleer je browserrechten.");
    }
  }, [mode, stopStream]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [recordingState]);

  const resetRecording = useCallback(() => {
    setMediaBlob(null);
    setRecordingTime(0);
    setRecordingState("idle");
    setError(null);
  }, []);

  const handleModeChange = useCallback((newMode: QuickThoughtModality) => {
    if (recordingState !== "idle") return;
    setMode(newMode);
    resetRecording();
    setTextContent("");
  }, [recordingState, resetRecording]);

  const handleSubmit = async () => {
    if (!token) {
      setError("Je bent niet ingelogd");
      return;
    }

    setRecordingState("uploading");
    setError(null);

    try {
      let thoughtId: string;

      if (mode === "text") {
        const thought = await createTextThought({
          text_content: textContent,
          chapter_id: chapterId,
        }, token);
        thoughtId = thought.id;
      } else if (mediaBlob) {
        thoughtId = await uploadQuickThought(
          mediaBlob,
          mode,
          token,
          {
            chapterId,
            onProgress: setUploadStatus,
          }
        );
      } else {
        throw new Error("Geen inhoud om te verzenden");
      }

      onComplete?.(thoughtId);
      resetRecording();
      setTextContent("");
      setRecordingState("idle");
      setUploadStatus(null);

    } catch (err) {
      console.error("Submit error:", err);
      setError("Kon gedachte niet opslaan. Probeer opnieuw.");
      setRecordingState("recorded");
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const hasContent = mode === "text"
    ? textContent.trim().length > 0
    : mediaBlob !== null;

  const canSubmit = hasContent && recordingState !== "uploading";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden",
        compact ? "p-4" : "p-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-medium text-stone-900">
            Gedachte inspreken
          </h3>
          <p className="text-sm text-stone-500">
            Geen perfectie nodig, gewoon beginnen
          </p>
        </div>
        {onCancel && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="text-stone-400 hover:text-stone-600"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 mb-4">
        {[
          { m: "audio" as const, icon: Mic, label: "Audio" },
          { m: "video" as const, icon: Video, label: "Video" },
          { m: "text" as const, icon: Type, label: "Tekst" },
        ].map(({ m, icon: Icon, label }) => (
          <Button
            key={m}
            variant={mode === m ? "default" : "outline"}
            size="sm"
            onClick={() => handleModeChange(m)}
            disabled={recordingState !== "idle"}
            className={cn(
              "flex-1 gap-1",
              mode === m && "bg-amber-600 hover:bg-amber-700"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Button>
        ))}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <div className="min-h-[120px] mb-4">
        <AnimatePresence mode="wait">
          {mode === "text" ? (
            <motion.div
              key="text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Schrijf je gedachte hier... Het hoeft niet perfect te zijn."
                className="min-h-[100px] resize-none border-stone-200 focus:border-amber-400 focus:ring-amber-400"
                maxLength={5000}
                disabled={recordingState === "uploading"}
              />
              <div className="text-xs text-stone-400 mt-1 text-right">
                {textContent.length}/5000
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="media"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-[120px]"
            >
              {recordingState === "recording" ? (
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                      <motion.div
                        className="w-4 h-4 rounded-full bg-red-500"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      />
                    </div>
                    {/* Pulse rings */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-red-300"
                      animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  </div>
                  <div className="mt-3 text-2xl font-mono text-stone-900">
                    {formatTime(recordingTime)}
                  </div>
                  <div className="text-sm text-stone-500">
                    Opnemen...
                  </div>
                </div>
              ) : recordingState === "recorded" && mediaBlob ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <span className="text-2xl">✓</span>
                  </div>
                  <div className="mt-2 text-stone-900 font-medium">
                    {formatTime(recordingTime)} opgenomen
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={resetRecording}
                    className="text-stone-500 hover:text-stone-700"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Opnieuw
                  </Button>
                </div>
              ) : recordingState === "uploading" ? (
                <div className="text-center">
                  <Loader2 className="w-12 h-12 mx-auto text-amber-600 animate-spin" />
                  <div className="mt-2 text-stone-600">
                    {uploadStatus || "Uploaden..."}
                  </div>
                </div>
              ) : (
                <div className="text-center text-stone-500">
                  <div className="text-4xl mb-2">
                    {mode === "audio" ? "🎙️" : "📹"}
                  </div>
                  <div>Druk op de knop om te beginnen</div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {mode !== "text" && recordingState === "idle" && (
          <Button
            onClick={startRecording}
            className="flex-1 bg-amber-600 hover:bg-amber-700"
          >
            <Mic className="w-4 h-4 mr-2" />
            Start opname
          </Button>
        )}

        {mode !== "text" && recordingState === "recording" && (
          <Button
            onClick={stopRecording}
            variant="destructive"
            className="flex-1"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop opname
          </Button>
        )}

        {canSubmit && (
          <Button
            onClick={handleSubmit}
            disabled={recordingState === "uploading"}
            className="flex-1 bg-amber-600 hover:bg-amber-700"
          >
            {recordingState === "uploading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Bewaar gedachte
              </>
            )}
          </Button>
        )}
      </div>

      {/* Hint */}
      <p className="text-xs text-stone-400 mt-4 text-center">
        💡 Je kunt later kiezen bij welk hoofdstuk dit hoort
      </p>
    </motion.div>
  );
}
