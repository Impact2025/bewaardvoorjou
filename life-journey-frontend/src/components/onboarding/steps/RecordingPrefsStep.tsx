"use client";

import { cn } from "@/lib/utils";
import { Video, Mic, FileText, Palette, Sparkles, Bell } from "lucide-react";
import type { RecordingPrefsData, RecordingMethod, AIAssistanceLevel } from "@/lib/onboarding-types";
import { RECORDING_METHOD_LABELS, AI_ASSISTANCE_LABELS } from "@/lib/onboarding-types";

const METHOD_ICONS: Record<RecordingMethod, typeof Video> = {
  video: Video,
  audio: Mic,
  text: FileText,
  mixed: Palette,
};

interface RecordingPrefsStepProps {
  data: RecordingPrefsData;
  onChange: (data: RecordingPrefsData) => void;
}

export function RecordingPrefsStep({ data, onChange }: RecordingPrefsStepProps) {
  const methods: RecordingMethod[] = ["video", "audio", "text", "mixed"];
  const assistanceLevels: AIAssistanceLevel[] = ["full", "minimal", "none"];

  return (
    <div>
      <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6">
        <Video className="h-8 w-8 text-teal-600" />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Hoe wil je opnemen?
      </h2>
      <p className="text-slate-600 text-center mb-8">
        Kies je favoriete manier om je verhaal vast te leggen
      </p>

      {/* Recording methods */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {methods.map((method) => {
          const Icon = METHOD_ICONS[method];
          const { label, description, icon } = RECORDING_METHOD_LABELS[method];
          const isSelected = data.preferred_method === method;

          return (
            <button
              key={method}
              onClick={() => onChange({ ...data, preferred_method: method })}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                isSelected
                  ? "border-teal-500 bg-teal-50"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <span className="text-2xl mb-2 block">{icon}</span>
              <h3
                className={cn(
                  "font-medium",
                  isSelected ? "text-teal-700" : "text-slate-900"
                )}
              >
                {label}
              </h3>
              <p className="text-sm text-slate-500">{description}</p>
            </button>
          );
        })}
      </div>

      {/* AI Assistance level */}
      <div className="mb-6">
        <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Begeleiding
        </h3>
        <div className="space-y-2">
          {assistanceLevels.map((level) => {
            const { label, description } = AI_ASSISTANCE_LABELS[level];
            const isSelected = data.ai_assistance === level;

            return (
              <button
                key={level}
                onClick={() => onChange({ ...data, ai_assistance: level })}
                className={cn(
                  "w-full p-3 rounded-lg border-2 text-left transition-all",
                  isSelected
                    ? "border-purple-500 bg-purple-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <h4
                  className={cn(
                    "font-medium",
                    isSelected ? "text-purple-700" : "text-slate-900"
                  )}
                >
                  {label}
                </h4>
                <p className="text-sm text-slate-500">{description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reminder toggle */}
      <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 cursor-pointer">
        <input
          type="checkbox"
          checked={data.session_reminder}
          onChange={(e) =>
            onChange({ ...data, session_reminder: e.target.checked })
          }
          className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-slate-500" />
            <span className="font-medium text-slate-900">Wekelijkse herinnering</span>
          </div>
          <p className="text-sm text-slate-500">
            Ontvang een vriendelijke herinnering om verder te gaan met je verhaal
          </p>
        </div>
      </label>
    </div>
  );
}
