"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextHelpProps {
  title: string;
  description: string;
  className?: string;
}

export function ContextHelp({ title, description, className }: ContextHelpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={ref} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Uitleg: ${title}`}
        aria-expanded={isOpen}
        className="text-slate-400 hover:text-orange transition-colors focus:outline-none focus:ring-2 focus:ring-warm-amber/40 rounded-full"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-xl border border-gray-100 bg-white p-4 shadow-lg">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="font-semibold text-slate-900 text-sm">{title}</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Sluiten"
              className="text-slate-400 hover:text-slate-600 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
          {/* Pijltje */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-2 overflow-hidden">
            <div className="w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45 origin-top-left translate-x-0.5" />
          </div>
        </div>
      )}
    </div>
  );
}

export default ContextHelp;
