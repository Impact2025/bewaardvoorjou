"use client";

import { useEffect, useRef, useState } from "react";
import { Video, Mic, Type, Square, RotateCcw, Check, Upload, Loader2, AlertCircle } from "lucide-react";
import { uploadGiftMessage, type MessageMediaType } from "@/lib/api/orders";
import { cn } from "@/lib/utils";

interface Props {
  recipientName: string;
  messageMediaType: MessageMediaType;
  messageMediaUrl: string;
  personalMessage: string;
  onChange: (updates: {
    messageMediaType?: MessageMediaType;
    messageMediaUrl?: string;
    personalMessage?: string;
  }) => void;
}

type Mode = "text" | "audio" | "video";
type RecState = "idle" | "recording" | "preview" | "uploading" | "saved";

const MAX_SECONDS: Record<"audio" | "video", number> = { audio: 180, video: 90 };

function pickMime(modality: "audio" | "video"): { mime: string; ext: string } | null {
  if (typeof MediaRecorder === "undefined") return null;
  const candidates =
    modality === "video"
      ? ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"]
      : ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) {
      const ext = c.includes("mp4") ? (modality === "video" ? ".mp4" : ".m4a") : c.includes("ogg") ? ".ogg" : ".webm";
      return { mime: c, ext };
    }
  }
  return null;
}

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function GiftMessageRecorder({
  recipientName,
  messageMediaType,
  messageMediaUrl,
  personalMessage,
  onChange,
}: Props) {
  const name = recipientName.trim() || "hen";
  const [mode, setMode] = useState<Mode>(messageMediaType === "text" ? "text" : messageMediaType);

  return (
    <div className="bg-white rounded-xl border border-[#e5e0d8] p-5 space-y-4">
      <div>
        <h3 className="font-medium text-[#1a1a1a]">Een persoonlijk bericht</h3>
        <p className="text-xs text-[#888] mt-1 leading-relaxed">
          {name} krijgt dit te zien op het moment dat hij of zij voor het eerst begint. Het is
          vaak het mooiste deel van het cadeau — en het maakt die eerste stap een stuk makkelijker.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-[#f8f6f2] rounded-xl p-1 flex gap-1">
        {([
          { m: "video" as Mode, icon: Video, label: "Video" },
          { m: "audio" as Mode, icon: Mic, label: "Audio" },
          { m: "text" as Mode, icon: Type, label: "Tekst" },
        ]).map(({ m, icon: Icon, label }) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              if (m === "text") onChange({ messageMediaType: "text", messageMediaUrl: "" });
            }}
            className={cn(
              "flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5",
              mode === m ? "bg-white shadow-sm text-[#1a1a1a]" : "text-[#888] hover:text-[#1a1a1a]"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {mode === "text" ? (
        <TextMessage
          name={name}
          value={personalMessage}
          onChange={(v) => onChange({ messageMediaType: "text", messageMediaUrl: "", personalMessage: v })}
        />
      ) : (
        <MediaCapture
          key={mode}
          modality={mode}
          savedUrl={messageMediaType === mode ? messageMediaUrl : ""}
          onSaved={(objectKey) => onChange({ messageMediaType: mode, messageMediaUrl: objectKey })}
          onClear={() => onChange({ messageMediaType: "text", messageMediaUrl: "" })}
        />
      )}

      <p className="text-xs text-[#aaa] leading-relaxed">
        Weet je niet wat je moet zeggen? Vertel waarom je dit geeft, of stel een vraag waarvan je
        het antwoord nooit hebt geweten. Het hoeft niet perfect — juist niet.
      </p>
    </div>
  );
}

function TextMessage({ name, value, onChange }: { name: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <textarea
        placeholder={`Lieve ${name}, ik geef je dit omdat…`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={500}
        rows={4}
        className="w-full border border-[#e5e0d8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 resize-none"
      />
      <p className="text-xs text-[#aaa] mt-1">{value.length}/500 · de snelste optie</p>
    </div>
  );
}

function MediaCapture({
  modality,
  savedUrl,
  onSaved,
  onClear,
}: {
  modality: "audio" | "video";
  savedUrl: string;
  onSaved: (objectKey: string) => void;
  onClear: () => void;
}) {
  const [state, setState] = useState<RecState>(savedUrl ? "saved" : "idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const extRef = useRef<string>(".webm");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const livePreviewRef = useRef<HTMLVideoElement | null>(null);
  const playbackRef = useRef<HTMLVideoElement & HTMLAudioElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };
  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => {
    return () => {
      clearTimer();
      stopTracks();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = async () => {
    setError(null);
    const picked = pickMime(modality);
    if (!picked) {
      setUnsupported(true);
      return;
    }
    extRef.current = picked.ext;
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        modality === "video" ? { audio: true, video: { facingMode: "user" } } : { audio: true }
      );
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType: picked.mime });
      recorderRef.current = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: picked.mime });
        blobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        stopTracks();
        clearTimer();
        setState("preview");
      };
      recorder.start();
      setState("recording");
      setSeconds(0);

      if (modality === "video" && livePreviewRef.current) {
        livePreviewRef.current.srcObject = stream;
        livePreviewRef.current.muted = true;
        await livePreviewRef.current.play().catch(() => {});
      }

      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          const next = s + 1;
          if (next >= MAX_SECONDS[modality]) stopRecording();
          return next;
        });
      }, 1000);
    } catch {
      setError(
        "We konden geen toegang krijgen tot je " +
          (modality === "video" ? "camera/microfoon" : "microfoon") +
          ". Geef toestemming, of upload een bestand."
      );
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    blobRef.current = null;
    chunksRef.current = [];
    setSeconds(0);
    setError(null);
    setState("idle");
    onClear();
  };

  const handleFile = (file: File) => {
    setError(null);
    const okType = modality === "video" ? file.type.startsWith("video/") : file.type.startsWith("audio/");
    if (!okType) {
      setError(`Kies een ${modality === "video" ? "video" : "audio"}bestand.`);
      return;
    }
    const ext = "." + (file.name.split(".").pop() || (modality === "video" ? "mp4" : "m4a")).toLowerCase();
    extRef.current = ext;
    blobRef.current = file;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setState("preview");
  };

  const useRecording = async () => {
    if (!blobRef.current) return;
    setState("uploading");
    setError(null);
    try {
      const filename = `bericht${extRef.current}`;
      const objectKey = await uploadGiftMessage(blobRef.current, filename, modality);
      onSaved(objectKey);
      setState("saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Uploaden mislukt, probeer opnieuw.");
      setState("preview");
    }
  };

  if (unsupported) {
    return (
      <FileFallback modality={modality} onFile={handleFile} note="Opnemen wordt niet ondersteund in deze browser." />
    );
  }

  if (state === "saved") {
    return (
      <div className="rounded-xl border border-[#2d5016]/30 bg-[#2d5016]/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#2d5016]">
          <Check className="h-5 w-5" />
          <span className="text-sm font-medium">
            Je {modality === "video" ? "video" : "audio"}bericht is opgeslagen
          </span>
        </div>
        <button type="button" onClick={reset} className="text-xs text-[#888] hover:text-[#1a1a1a] underline">
          Opnieuw
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Recording / preview surface */}
      <div className="rounded-xl bg-[#1a1a1a] overflow-hidden relative aspect-video flex items-center justify-center">
        {state === "recording" && modality === "video" && (
          <video ref={livePreviewRef} className="w-full h-full object-cover" playsInline muted />
        )}
        {state === "recording" && modality === "audio" && (
          <div className="flex flex-col items-center gap-3 text-white/80">
            <div className="w-16 h-16 rounded-full bg-[#e04040]/20 flex items-center justify-center">
              <Mic className="h-8 w-8 text-[#e04040] animate-pulse" />
            </div>
            <span className="text-sm">Aan het opnemen…</span>
          </div>
        )}
        {state === "preview" &&
          (modality === "video" ? (
            <video ref={playbackRef} src={previewUrl} className="w-full h-full object-contain" controls playsInline />
          ) : (
            <div className="w-full px-6">
              <audio src={previewUrl} className="w-full" controls />
            </div>
          ))}
        {state === "idle" && (
          <div className="flex flex-col items-center gap-2 text-white/50">
            {modality === "video" ? <Video className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
            <span className="text-xs">
              Max {modality === "video" ? "90 seconden" : "3 minuten"}
            </span>
          </div>
        )}
        {(state === "recording" || state === "uploading") && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-[#e04040] animate-pulse" />
            <span className="text-white text-xs font-mono">{fmt(seconds)}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 text-xs text-[#e04040] bg-[#e04040]/5 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Controls */}
      {state === "idle" && (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={startRecording}
            className="flex-1 bg-[#e04040] hover:bg-[#c83030] text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span className="w-3 h-3 rounded-full bg-white" />
            Neem op
          </button>
          <FileFallbackButton modality={modality} onFile={handleFile} />
        </div>
      )}

      {state === "recording" && (
        <button
          type="button"
          onClick={stopRecording}
          className="w-full bg-[#1a1a1a] hover:bg-[#333] text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Square className="h-4 w-4 fill-current" />
          Stop opname
        </button>
      )}

      {state === "preview" && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reset}
            className="flex-1 border border-[#e5e0d8] text-[#555] hover:text-[#1a1a1a] font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Opnieuw
          </button>
          <button
            type="button"
            onClick={useRecording}
            className="flex-1 bg-[#2d5016] hover:bg-[#3a6620] text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" />
            Gebruik dit
          </button>
        </div>
      )}

      {state === "uploading" && (
        <button
          type="button"
          disabled
          className="w-full bg-[#2d5016]/70 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 cursor-wait"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Bericht opslaan…
        </button>
      )}
    </div>
  );
}

function FileFallbackButton({ modality, onFile }: { modality: "audio" | "video"; onFile: (f: File) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex-1 border border-[#e5e0d8] text-[#555] hover:text-[#1a1a1a] font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <Upload className="h-4 w-4" />
        Upload een {modality === "video" ? "video" : "audio"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={modality === "video" ? "video/*" : "audio/*"}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </>
  );
}

function FileFallback({ modality, onFile, note }: { modality: "audio" | "video"; onFile: (f: File) => void; note: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#e5e0d8] p-5 text-center space-y-3">
      <p className="text-xs text-[#888]">{note}</p>
      <div className="flex justify-center">
        <FileFallbackButton modality={modality} onFile={onFile} />
      </div>
    </div>
  );
}
