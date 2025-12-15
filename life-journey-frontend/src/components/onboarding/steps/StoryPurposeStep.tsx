"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Target, Gift, Heart, Archive, Sparkles } from "lucide-react";
import type { StoryPurposeData, StoryPurpose } from "@/lib/onboarding-types";
import { PURPOSE_LABELS } from "@/lib/onboarding-types";

const PURPOSE_ICONS: Record<StoryPurpose, typeof Target> = {
  legacy: Archive,
  healing: Heart,
  preservation: Archive,
  gift: Gift,
  other: Sparkles,
};

interface StoryPurposeStepProps {
  data: StoryPurposeData;
  onChange: (data: StoryPurposeData) => void;
}

export function StoryPurposeStep({ data, onChange }: StoryPurposeStepProps) {
  const purposes: StoryPurpose[] = ["legacy", "healing", "preservation", "gift", "other"];

  return (
    <div>
      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-6">
        <Target className="h-8 w-8 text-purple-600" />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Wat is je doel?
      </h2>
      <p className="text-slate-600 text-center mb-8">
        Waarom wil je je levensverhaal vastleggen?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {purposes.map((purpose) => {
          const Icon = PURPOSE_ICONS[purpose];
          const { label, description } = PURPOSE_LABELS[purpose];
          const isSelected = data.purpose === purpose;

          return (
            <button
              key={purpose}
              onClick={() => onChange({ ...data, purpose })}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                isSelected
                  ? "border-orange bg-orange/5"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6 mb-2",
                  isSelected ? "text-orange" : "text-slate-400"
                )}
              />
              <h3
                className={cn(
                  "font-medium",
                  isSelected ? "text-orange" : "text-slate-900"
                )}
              >
                {label}
              </h3>
              <p className="text-sm text-slate-500">{description}</p>
            </button>
          );
        })}
      </div>

      {data.purpose === "other" && (
        <div className="space-y-2">
          <Input
            value={data.custom_purpose || ""}
            onChange={(e) =>
              onChange({ ...data, custom_purpose: e.target.value })
            }
            placeholder="Vertel meer over je doel..."
          />
        </div>
      )}

      <div className="mt-8 space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Voor wie is dit verhaal? (optioneel)
        </label>
        <Input
          value={data.recipients.join(", ")}
          onChange={(e) =>
            onChange({
              ...data,
              recipients: e.target.value
                .split(",")
                .map((r) => r.trim())
                .filter(Boolean),
            })
          }
          placeholder="Bijv. kinderen, kleinkinderen, partner"
        />
        <p className="text-sm text-slate-500">
          Scheid meerdere namen met een komma
        </p>
      </div>
    </div>
  );
}
