"use client";

import { Accessibility, Captions, Eye, Type } from "lucide-react";
import { useAccessibility } from "@/lib/accessibility-context";
import type { AccessibilityPrefs } from "@/lib/onboarding-types";

interface AccessibilityStepProps {
  data: AccessibilityPrefs;
  onChange: (data: AccessibilityPrefs) => void;
}

export function AccessibilityStep({ data, onChange }: AccessibilityStepProps) {
  const { largeText, highContrast, toggleLargeText, toggleHighContrast } = useAccessibility();

  function handleLargeText(checked: boolean) {
    // Pas direct toe in de app (live preview)
    if (checked !== largeText) toggleLargeText();
    onChange({ ...data, large_text: checked });
  }

  function handleHighContrast(checked: boolean) {
    if (checked !== highContrast) toggleHighContrast();
    onChange({ ...data, high_contrast: checked });
  }

  return (
    <div>
      <div className="w-16 h-16 rounded-full bg-orange/15 flex items-center justify-center mx-auto mb-6">
        <Accessibility className="h-8 w-8 text-orange" />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Comfortabel lezen
      </h2>
      <p className="text-slate-600 text-center mb-2">
        Pas de app direct aan — de wijzigingen zie je meteen.
      </p>
      <p className="text-center text-sm text-slate-400 mb-8">
        Je kunt dit later altijd aanpassen via Instellingen.
      </p>

      <div className="space-y-4 max-w-md mx-auto">
        {/* Grote tekst */}
        <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
          data.large_text ? "border-orange bg-orange/5" : "border-slate-200 hover:border-slate-300"
        }`}>
          <input
            type="checkbox"
            checked={data.large_text}
            onChange={(e) => handleLargeText(e.target.checked)}
            className="w-6 h-6 rounded border-slate-300 accent-orange focus:ring-orange/40"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5 text-orange" />
              <span className="font-medium text-slate-900">Grote tekst</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Vergroot alle tekst in de app met 20%
            </p>
            {data.large_text && (
              <p className="text-xs text-orange font-medium mt-1">
                Actief — je ziet de grotere tekst nu al
              </p>
            )}
          </div>
        </label>

        {/* Hoog contrast */}
        <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
          data.high_contrast ? "border-orange bg-orange/5" : "border-slate-200 hover:border-slate-300"
        }`}>
          <input
            type="checkbox"
            checked={data.high_contrast}
            onChange={(e) => handleHighContrast(e.target.checked)}
            className="w-6 h-6 rounded border-slate-300 accent-orange focus:ring-orange/40"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-orange" />
              <span className="font-medium text-slate-900">Hoog contrast</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Donkerdere tekst en duidelijkere randen voor betere leesbaarheid
            </p>
            {data.high_contrast && (
              <p className="text-xs text-orange font-medium mt-1">
                Actief — het hogere contrast is nu zichtbaar
              </p>
            )}
          </div>
        </label>

        {/* Ondertiteling */}
        <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
          data.captions ? "border-orange bg-orange/5" : "border-slate-200 hover:border-slate-300"
        }`}>
          <input
            type="checkbox"
            checked={data.captions}
            onChange={(e) => onChange({ ...data, captions: e.target.checked })}
            className="w-6 h-6 rounded border-slate-300 accent-orange focus:ring-orange/40"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Captions className="h-5 w-5 text-orange" />
              <span className="font-medium text-slate-900">Ondertiteling</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Toon ondertitels bij video- en audio-opnames
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
