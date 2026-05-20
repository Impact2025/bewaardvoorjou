"use client";

import { Video, Mic, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRecorder, RecordingMode } from "./RecorderContext";

interface ModeSelectorProps {
  disabled?: boolean;
  compact?: boolean;
}

const MODES: {
  id: RecordingMode;
  label: string;
  sublabel: string;
  icon: typeof Video;
  color: string;
  activeColor: string;
}[] = [
  {
    id: "audio",
    label: "Praten",
    sublabel: "Vertel gewoon, wij luisteren",
    icon: Mic,
    color: "text-orange",
    activeColor: "bg-orange/10 border-orange/40 text-orange",
  },
  {
    id: "video",
    label: "Filmen",
    sublabel: "Kijk in de camera en begin",
    icon: Video,
    color: "text-teal",
    activeColor: "bg-teal/10 border-teal/40 text-teal",
  },
  {
    id: "text",
    label: "Schrijven",
    sublabel: "Type je herinneringen op",
    icon: FileText,
    color: "text-slate-600",
    activeColor: "bg-slate-100 border-slate-300 text-slate-700",
  },
];

export function ModeSelector({ disabled = false, compact = false }: ModeSelectorProps) {
  const { state, setMode } = useRecorder();
  const { mode } = state;

  // Compact variant: kleine pills voor tijdens het opnemen
  if (compact) {
    return (
      <div
        className="flex items-center gap-1 rounded-full border border-neutral-sand bg-cream p-1 text-xs"
        role="radiogroup"
        aria-label="Opnamemodus"
      >
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={mode === id}
            disabled={disabled}
            onClick={() => setMode(id)}
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1.5 transition-colors text-xs",
              "focus:outline-none focus:ring-2 focus:ring-warm-amber/40 focus:ring-offset-1",
              mode === id
                ? "bg-orange/15 text-orange font-medium"
                : "text-slate-500 hover:text-slate-700",
              disabled && "opacity-50 cursor-not-allowed pointer-events-none"
            )}
          >
            <Icon className="h-3 w-3" aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    );
  }

  // Groot visueel kaartformaat voor beginners
  return (
    <div
      className="grid grid-cols-3 gap-3"
      role="radiogroup"
      aria-label="Hoe wil je vertellen?"
    >
      {MODES.map(({ id, label, sublabel, icon: Icon, activeColor }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={mode === id}
          disabled={disabled}
          onClick={() => setMode(id)}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl border-2 px-3 py-5 transition-all text-center",
            "focus:outline-none focus:ring-2 focus:ring-warm-amber/40 focus:ring-offset-2",
            mode === id
              ? activeColor
              : "border-neutral-sand bg-white text-slate-500 hover:border-warm-amber/30 hover:text-slate-700",
            disabled && "opacity-40 cursor-not-allowed pointer-events-none"
          )}
        >
          <Icon
            className={cn("h-7 w-7 sm:h-8 sm:w-8", mode === id ? "" : "text-slate-400")}
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold text-sm sm:text-base leading-tight">{label}</p>
            <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">{sublabel}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

export default ModeSelector;
