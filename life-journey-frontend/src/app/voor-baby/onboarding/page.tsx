"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { createBabyJourney, type NarratorRole, type GrandparentEntry } from "@/lib/api/baby";
import { useBabyTheme } from "@/components/baby/BabyThemeContext";

type Step = 0 | 1 | 2 | 3;

interface WizardState {
  babyName: string;
  babyBirthDate: string;
  birthTimeStr: string;
  birthWeightGrams: string;
  birthLengthCm: string;
  narratorRole: NarratorRole | "";
  partnerEmail: string;
  grandparentName: string;
  grandparentEmail: string;
}

const STEP_TITLES = [
  "Jouw kindje",
  "Geboortecijfers",
  "Wie vertelt het verhaal?",
  "Partner & opa/oma",
];

const NARRATOR_OPTIONS: { role: NarratorRole; label: string; description: string }[] = [
  {
    role: "MOEDER",
    label: "Ik ben de moeder",
    description:
      "Jij hebt de bevalling ervaren van binnenuit. De vragen zijn speciaal voor jou geschreven.",
  },
  {
    role: "PARTNER",
    label: "Ik ben de partner",
    description:
      "Jij keek mee en hield de hand vast. De vragen zijn vanuit jouw blik op de wereld.",
  },
  {
    role: "SAMEN",
    label: "We doen het samen",
    description:
      "Jullie vullen beiden in. De vragen zijn voor beide ouders tegelijk.",
  },
];

export default function BabyOnboardingPage() {
  const router = useRouter();
  const { t } = useBabyTheme();
  const [step, setStep] = useState<Step>(0);
  const [state, setState] = useState<WizardState>({
    babyName: "",
    babyBirthDate: "",
    birthTimeStr: "",
    birthWeightGrams: "",
    birthLengthCm: "",
    narratorRole: "",
    partnerEmail: "",
    grandparentName: "",
    grandparentEmail: "",
  });
  const [grandparents, setGrandparents] = useState<GrandparentEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof WizardState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setState((s) => ({ ...s, [field]: e.target.value }));

  const addGrandparent = () => {
    if (!state.grandparentEmail || !state.grandparentName) return;
    setGrandparents((prev) => [
      ...prev,
      { name: state.grandparentName, email: state.grandparentEmail, digest_active: true },
    ]);
    setState((s) => ({ ...s, grandparentName: "", grandparentEmail: "" }));
  };

  const canNext = () => {
    if (step === 0) return state.babyName.trim().length >= 1;
    if (step === 1) return true; // geboortecijfers zijn optioneel
    if (step === 2) return state.narratorRole !== "";
    return true;
  };

  const handleNext = () => {
    if (step < 3) setStep((s) => (s + 1) as Step);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const grams = state.birthWeightGrams
        ? Math.round(parseFloat(state.birthWeightGrams) * 1000) // invoer in kg → gram
        : undefined;
      const cm = state.birthLengthCm ? parseFloat(state.birthLengthCm) : undefined;

      await createBabyJourney({
        baby_name: state.babyName.trim(),
        narrator_role: state.narratorRole as NarratorRole,
        baby_birth_date: state.babyBirthDate || undefined,
        birth_time_str: state.birthTimeStr || undefined,
        birth_weight_grams: grams,
        birth_length_cm: cm,
        partner_email: state.partnerEmail || undefined,
        grandparent_emails: grandparents,
      });
      router.push("/voor-baby/dashboard");
    } catch (e: unknown) {
      setError((e instanceof Error ? e.message : null) ?? "Er ging iets mis. Probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${t.primaryBg} flex flex-col items-center justify-center px-4 py-12`}>
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <p className={`${t.primaryText} font-semibold text-sm uppercase tracking-wider mb-2`}>
            Bewaard voor Baby
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            Stap {step + 1} van 4 — {STEP_TITLES[step]}
          </h1>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {([0, 1, 2, 3] as const).map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? t.progressActive : t.progressBg
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className={`bg-white rounded-3xl shadow-sm border ${t.primaryBorder} p-8`}>

          {/* Stap 0: Babynaam */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hoe heet jullie kindje?
                </label>
                <input
                  type="text"
                  value={state.babyName}
                  onChange={set("babyName")}
                  placeholder="Naam van jullie baby"
                  maxLength={50}
                  autoFocus
                  className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 ${t.inputRing} focus:border-transparent`}
                />
                <p className="mt-2 text-sm text-gray-400">
                  Dit is de naam die in alle vragen en e-mails verschijnt.
                </p>
              </div>
            </div>
          )}

          {/* Stap 1: Geboortecijfers */}
          {step === 1 && (
            <div className="space-y-5">
              <p className="text-gray-500 text-sm">
                Optioneel — vul in wat je weet. Je kunt dit later altijd aanvullen.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Geboortedatum
                </label>
                <input
                  type="date"
                  value={state.babyBirthDate}
                  onChange={set("babyBirthDate")}
                  className={`w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${t.inputRing}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tijdstip (uu:mm)
                  </label>
                  <input
                    type="time"
                    value={state.birthTimeStr}
                    onChange={set("birthTimeStr")}
                    className={`w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${t.inputRing}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Gewicht (kg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.5"
                    max="8"
                    value={state.birthWeightGrams}
                    onChange={set("birthWeightGrams")}
                    placeholder="3.420"
                    className={`w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${t.inputRing}`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Lengte (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="80"
                  value={state.birthLengthCm}
                  onChange={set("birthLengthCm")}
                  placeholder="52.0"
                  className={`w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${t.inputRing}`}
                />
              </div>
            </div>
          )}

          {/* Stap 2: Vertellerrol */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-gray-500 text-sm mb-5">
                Dit bepaalt hoe de AI-vragen worden geformuleerd — speciaal voor jouw rol.
              </p>
              {NARRATOR_OPTIONS.map((opt) => (
                <button
                  key={opt.role}
                  onClick={() => setState((s) => ({ ...s, narratorRole: opt.role }))}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                    state.narratorRole === opt.role
                      ? t.selectedBorder
                      : `border-gray-200 ${t.hoverBorder}`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{opt.label}</span>
                    {state.narratorRole === opt.role && (
                      <span className={`w-5 h-5 ${t.selectedDot} rounded-full flex items-center justify-center`}>
                        <Check className="w-3 h-3 text-white" />
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{opt.description}</p>
                </button>
              ))}
            </div>
          )}

          {/* Stap 3: Partner + opa/oma */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  E-mail partner (optioneel)
                </label>
                <input
                  type="email"
                  value={state.partnerEmail}
                  onChange={set("partnerEmail")}
                  placeholder="partner@email.nl"
                  className={`w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${t.inputRing}`}
                />
                <p className="mt-1 text-xs text-gray-400">
                  De partner ontvangt een uitnodiging om mee te schrijven.
                </p>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Opa en oma toevoegen (optioneel)
                </p>
                {grandparents.map((gp, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 ${t.itemBg} rounded-xl mb-2 text-sm`}>
                    <Check className={`w-4 h-4 ${t.checkColor} shrink-0`} />
                    <span className="text-gray-700">
                      {gp.name} — <span className="text-gray-400">{gp.email}</span>
                    </span>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={state.grandparentName}
                    onChange={set("grandparentName")}
                    placeholder="Naam (bijv. Oma Riet)"
                    className={`border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${t.inputRing}`}
                  />
                  <input
                    type="email"
                    value={state.grandparentEmail}
                    onChange={set("grandparentEmail")}
                    placeholder="E-mailadres"
                    className={`border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${t.inputRing}`}
                  />
                </div>
                <button
                  onClick={addGrandparent}
                  disabled={!state.grandparentEmail || !state.grandparentName}
                  className={`mt-2 text-sm ${t.primaryText} font-medium ${t.primaryTextMedium} disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  + Voeg toe
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="flex items-center gap-1 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Terug
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canNext() || loading}
              className={`flex-1 flex items-center justify-center gap-2 ${t.primary} text-white font-semibold px-6 py-3 rounded-xl ${t.primaryHover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : step === 3 ? (
                "Babyboek starten"
              ) : (
                <>
                  Volgende
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Je kunt alles later aanpassen in de instellingen.
        </p>
      </div>
    </div>
  );
}
