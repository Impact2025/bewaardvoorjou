"use client";

import { cn } from "@/lib/utils";
import { Accessibility, Captions, Eye, Type } from "lucide-react";
import type { AccessibilityPrefs } from "@/lib/onboarding-types";

interface AccessibilityStepProps {
  data: AccessibilityPrefs;
  onChange: (data: AccessibilityPrefs) => void;
}

export function AccessibilityStep({ data, onChange }: AccessibilityStepProps) {
  return (
    <div>
      <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-6">
        <Accessibility className="h-8 w-8 text-cyan-600" />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Toegankelijkheid
      </h2>
      <p className="text-slate-600 text-center mb-8">
        Pas de app aan naar jouw behoeften
      </p>

      <div className="space-y-4 max-w-md mx-auto">
        {/* Captions */}
        <label className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 cursor-pointer transition-all">
          <input
            type="checkbox"
            checked={data.captions}
            onChange={(e) =>
              onChange({ ...data, captions: e.target.checked })
            }
            className="w-6 h-6 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Captions className="h-5 w-5 text-cyan-600" />
              <span className="font-medium text-slate-900">Ondertiteling</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Toon ondertitels bij video- en audio-opnames
            </p>
          </div>
        </label>

        {/* High contrast */}
        <label className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 cursor-pointer transition-all">
          <input
            type="checkbox"
            checked={data.high_contrast}
            onChange={(e) =>
              onChange({ ...data, high_contrast: e.target.checked })
            }
            className="w-6 h-6 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-cyan-600" />
              <span className="font-medium text-slate-900">Hoog contrast</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Verhoogd kleurcontrast voor betere leesbaarheid
            </p>
          </div>
        </label>

        {/* Large text */}
        <label className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 cursor-pointer transition-all">
          <input
            type="checkbox"
            checked={data.large_text}
            onChange={(e) =>
              onChange({ ...data, large_text: e.target.checked })
            }
            className="w-6 h-6 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5 text-cyan-600" />
              <span className="font-medium text-slate-900">Grote tekst</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Vergroot de tekstgrootte in de hele app
            </p>
          </div>
        </label>
      </div>

      <p className="text-center text-sm text-slate-500 mt-8">
        Je kunt deze instellingen later altijd wijzigen in je profiel
      </p>
    </div>
  );
}
