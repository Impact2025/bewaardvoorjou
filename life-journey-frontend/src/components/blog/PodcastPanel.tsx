"use client";

import { useCallback, useRef, useState } from "react";
import {
  Headphones,
  Loader2,
  X,
  FileText,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface PodcastFields {
  audio_url: string | null;
  audio_title: string | null;
  audio_duration: number | null;
  transcript: string | null;
}

interface PodcastPanelProps {
  values: PodcastFields;
  onChange: (field: keyof PodcastFields, value: string | number | null) => void;
  onUpload: (file: File) => Promise<string>;
}

function formatDuration(seconds?: number | null): string | null {
  if (!seconds || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")} min`;
}

/**
 * Admin panel for attaching a NotebookLM podcast (.m4a) to a blog/kennisbank post.
 * Mirrors the weareimpact pattern: upload the audio, store URL + duration, paste a
 * transcript for extra (indexable) SEO content.
 */
export function PodcastPanel({ values, onChange, onUpload }: PodcastPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const readDuration = useCallback(
    (file: File): Promise<number> =>
      new Promise((resolve) => {
        try {
          const url = URL.createObjectURL(file);
          const el = document.createElement("audio");
          el.preload = "metadata";
          el.onloadedmetadata = () => {
            URL.revokeObjectURL(url);
            resolve(Number.isFinite(el.duration) ? Math.round(el.duration) : 0);
          };
          el.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(0);
          };
          el.src = url;
        } catch {
          resolve(0);
        }
      }),
    [],
  );

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      setUploading(true);
      try {
        const duration = await readDuration(file);
        const url = await onUpload(file);
        onChange("audio_url", url);
        if (duration) onChange("audio_duration", duration);
        if (!values.audio_title) {
          onChange("audio_title", file.name.replace(/\.[^.]+$/, ""));
        }
      } catch (err) {
        alert(
          err instanceof Error
            ? `Audio uploaden mislukt: ${err.message}`
            : "Audio uploaden mislukt",
        );
      } finally {
        setUploading(false);
      }
    },
    [onUpload, onChange, values.audio_title],
  );

  const duration = formatDuration(values.audio_duration);

  return (
    <div className="border border-slate-200 rounded-xl bg-white p-5">
      <div className="flex items-center gap-2 mb-1">
        <Headphones className="h-4 w-4 text-orange" />
        <Label className="text-sm font-semibold text-slate-800">
          Podcast (audio)
        </Label>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Upload de NotebookLM-aflevering (.m4a). Voeg een transcript toe voor extra
        SEO — die tekst wordt geïndexeerd op de pagina.
      </p>

      {values.audio_url ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
            <audio controls src={values.audio_url} className="w-full" />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-500 truncate">
                {duration ?? "Audio geüpload"}
              </span>
              <Button
                type="button"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs px-2 py-1"
                onClick={() => {
                  onChange("audio_url", null);
                  onChange("audio_duration", null);
                  onChange("audio_title", null);
                }}
              >
                <X className="h-4 w-4 mr-1" /> Verwijder
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audio_title" className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-slate-400" />
              Aflevering titel
            </Label>
            <Input
              id="audio_title"
              value={values.audio_title ?? ""}
              onChange={(e) => onChange("audio_title", e.target.value)}
              placeholder="Titel van de podcast-aflevering"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="audio_duration"
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4 text-slate-400" />
              Duur (seconden)
            </Label>
            <Input
              id="audio_duration"
              type="number"
              min={0}
              value={values.audio_duration ?? ""}
              onChange={(e) =>
                onChange(
                  "audio_duration",
                  e.target.value ? parseInt(e.target.value, 10) : null,
                )
              }
              placeholder="Automatisch ingevuld na upload"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transcript" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              Transcript (SEO)
            </Label>
            <Textarea
              id="transcript"
              value={values.transcript ?? ""}
              onChange={(e) => onChange("transcript", e.target.value)}
              placeholder="Plak hier het transcript van het gesprek. Deze tekst is uniek t.o.v. het artikel en wordt door Google geïndexeerd."
              rows={6}
            />
            <p className="text-xs text-slate-400">
              {(values.transcript ?? "").length} tekens — hoe completer, hoe meer
              indexeerbare content.
            </p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className={cn(
            "w-full flex flex-col items-center justify-center gap-2 h-32 rounded-lg border-2 border-dashed border-slate-300 hover:border-orange/50 transition-colors",
            uploading && "opacity-60 cursor-wait",
          )}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
          ) : (
            <>
              <Headphones className="h-8 w-8 text-slate-400" />
              <span className="text-sm text-slate-500">
                Klik om podcast te uploaden
              </span>
              <span className="text-xs text-slate-400">
                M4A, MP3, WAV (max 150MB)
              </span>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="audio/m4a,audio/mp4,audio/x-m4a,audio/mpeg,audio/mp3,audio/wav,audio/x-wav,.m4a,.mp3,.wav"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
        </button>
      )}
    </div>
  );
}
