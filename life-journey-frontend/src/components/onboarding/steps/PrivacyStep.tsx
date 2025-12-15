"use client";

import { cn } from "@/lib/utils";
import { Lock, Users, Clock, CloudUpload, BarChart2 } from "lucide-react";
import type { PrivacySettingsData, PrivacyLevel } from "@/lib/onboarding-types";
import { PRIVACY_LEVEL_LABELS } from "@/lib/onboarding-types";

const PRIVACY_ICONS: Record<PrivacyLevel, typeof Lock> = {
  private: Lock,
  trusted: Users,
  legacy: Clock,
};

interface PrivacyStepProps {
  data: PrivacySettingsData;
  onChange: (data: PrivacySettingsData) => void;
}

export function PrivacyStep({ data, onChange }: PrivacyStepProps) {
  const levels: PrivacyLevel[] = ["private", "trusted", "legacy"];

  return (
    <div>
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <Lock className="h-8 w-8 text-green-600" />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Privacy & Delen
      </h2>
      <p className="text-slate-600 text-center mb-8">
        Jij bepaalt wie toegang krijgt tot je verhaal
      </p>

      {/* Privacy levels */}
      <div className="space-y-3 mb-8">
        {levels.map((level) => {
          const Icon = PRIVACY_ICONS[level];
          const { label, description } = PRIVACY_LEVEL_LABELS[level];
          const isSelected = data.privacy_level === level;

          return (
            <button
              key={level}
              onClick={() => onChange({ ...data, privacy_level: level })}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4",
                isSelected
                  ? "border-green-500 bg-green-50"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  isSelected ? "bg-green-500 text-white" : "bg-slate-100 text-slate-500"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3
                  className={cn(
                    "font-medium",
                    isSelected ? "text-green-700" : "text-slate-900"
                  )}
                >
                  {label}
                </h3>
                <p className="text-sm text-slate-500">{description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Additional options */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 cursor-pointer">
          <input
            type="checkbox"
            checked={data.auto_backup}
            onChange={(e) =>
              onChange({ ...data, auto_backup: e.target.checked })
            }
            className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CloudUpload className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-900">Automatische backup</span>
            </div>
            <p className="text-sm text-slate-500">
              Je verhaal wordt veilig opgeslagen in de cloud
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 cursor-pointer">
          <input
            type="checkbox"
            checked={data.analytics_consent}
            onChange={(e) =>
              onChange({ ...data, analytics_consent: e.target.checked })
            }
            className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-slate-500" />
              <span className="font-medium text-slate-900">Help ons verbeteren</span>
            </div>
            <p className="text-sm text-slate-500">
              Deel anonieme gebruiksgegevens om de app te verbeteren
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
