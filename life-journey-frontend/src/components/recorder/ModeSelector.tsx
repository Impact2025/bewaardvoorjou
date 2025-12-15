"use client";

import { Video, Mic, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecorder, RecordingMode } from "./RecorderContext";

interface ModeSelectorProps {
  disabled?: boolean;
}

export function ModeSelector({ disabled = false }: ModeSelectorProps) {
  const { state, setMode } = useRecorder();
  const { mode } = state;

  const modes: { id: RecordingMode; label: string; icon: typeof Video }[] = [
    { id: "video", label: "Video", icon: Video },
    { id: "audio", label: "Audio", icon: Mic },
    { id: "text", label: "Tekst", icon: FileText },
  ];

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-neutral-sand bg-cream p-1 text-xs"
      role="radiogroup"
      aria-label="Opnamemodus selecteren"
    >
      {modes.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={mode === id}
          disabled={disabled}
          onClick={() => setMode(id)}
          className={cn(
            "flex items-center gap-1 rounded-full px-3 py-2 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-1",
            mode === id
              ? "bg-teal/20 text-teal"
              : "text-slate-500 hover:text-slate-700",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export default ModeSelector;
