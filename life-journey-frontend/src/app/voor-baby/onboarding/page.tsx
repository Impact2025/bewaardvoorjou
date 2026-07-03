"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { createBabyJourney, type NarratorRole, type GrandparentEntry } from "@/lib/api/baby";
import { useBabyTheme, THEME_CONFIG, type BabyTheme } from "@/components/baby/BabyThemeContext";

type Step = -1 | 0 | 1 | 2 | 3;

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

const NARRATOR_OPTIONS: { role: NarratorRole; emoji: string; label: string; description: string }[] = [
  {
    role: "MOEDER",
    emoji: "🤱",
    label: "Ik ben de moeder",
    description: "Jij hebt de bevalling ervaren van binnenuit. De vragen zijn speciaal voor jou geschreven.",
  },
  {
    role: "PARTNER",
    emoji: "💑",
    label: "Ik ben de partner",
    description: "Jij keek mee en hield de hand vast. De vragen zijn vanuit jouw blik op de wereld.",
  },
  {
    role: "SAMEN",
    emoji: "👨‍👩‍👧",
    label: "We doen het samen",
    description: "Jullie vullen beiden in. De vragen zijn voor beide ouders tegelijk.",
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function BabyOnboardingPage() {
  const router = useRouter();
  const { t, theme, setTheme } = useBabyTheme();
  const [step, setStep] = useState<Step>(-1);
  const [direction, setDirection] = useState<1 | -1>(1);
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
    if (step === -1) return true;
    if (step === 0) return state.babyName.trim().length >= 1;
    if (step === 1) return true;
    if (step === 2) return state.narratorRole !== "";
    return true;
  };

  const goNext = () => {
    setDirection(1);
    setError(null);
    if (step < 3) setStep((s) => (s + 1) as Step);
    else handleSubmit();
  };

  const goBack = () => {
    setDirection(-1);
    setError(null);
    setStep((s) => (s - 1) as Step);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const grams = state.birthWeightGrams
        ? Math.round(parseFloat(state.birthWeightGrams) * 1000)
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

  /* ── Welcome screen (step -1) ── */
  if (step === -1) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`min-h-screen bg-gradient-to-b ${t.gradientHero} flex flex-col items-center justify-center px-4 py-12`}
      >
        <div className="w-full max-w-md flex flex-col items-center">

          {/* Theme switcher */}
          <div className="flex gap-1.5 mb-8 bg-white/70 backdrop-blur-sm p-1 rounded-full shadow-sm">
            {(Object.keys(THEME_CONFIG) as BabyTheme[]).map((th) => (
              <button
                key={th}
                onClick={() => setTheme(th)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  theme === th
                    ? `${THEME_CONFIG[th].badge} shadow-sm scale-105`
                    : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                }`}
              >
                {THEME_CONFIG[th].emoji} {THEME_CONFIG[th].label}
              </button>
            ))}
          </div>

          {/* Animated baby */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-8xl mb-5 select-none"
          >
            👶
          </motion.div>

          {/* Badge */}
          <div className={`inline-flex items-center gap-2 ${t.badge} text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider`}>
            Bewaard voor Baby
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4 text-center">
            Je gaat iets maken wat{" "}
            <span className={t.heroAccent}>generaties meegaat.</span>
          </h1>

          <p className="text-gray-500 leading-relaxed mb-8 text-center max-w-sm">
            In een paar minuten staat het babyboek van jouw kindje klaar.
            Daarna hoef je alleen maar te schrijven wanneer het jou uitkomt —
            wekelijks een warme vraag in je inbox.
          </p>

          {/* Feature list */}
          <div className={`bg-white/80 backdrop-blur-sm rounded-2xl border ${t.primaryBorder} p-5 mb-8 text-left space-y-3.5 w-full shadow-sm`}>
            {[
              { emoji: "✍️", text: "14 diepgaande hoofdstukken — van geboorte tot eerste verjaardag" },
              { emoji: "🏅", text: "28 mijlpalen bijhouden op het moment zelf" },
              { emoji: "📬", text: "Elke week een warme herinnering in je inbox" },
              { emoji: "📖", text: "Na een jaar: een gedrukt fotoboek als beloning" },
            ].map(({ emoji, text }) => (
              <div key={text} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="text-base shrink-0 mt-0.5">{emoji}</span>
                {text}
              </div>
            ))}
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setDirection(1); setStep(0); }}
            className={`w-full ${t.primary} ${t.primaryHover} text-white font-bold py-4 rounded-2xl text-lg shadow-md transition-colors`}
          >
            Begin het babyboek →
          </motion.button>
          <p className="mt-4 text-xs text-gray-400">Duurt minder dan 5 minuten · Alles aanpasbaar achteraf</p>
        </div>
      </motion.div>
    );
  }

  /* ── Wizard steps ── */
  return (
    <div className={`min-h-screen bg-gradient-to-b ${t.gradientHero} flex flex-col items-center justify-center px-4 py-12`}>
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-6">
          <p className={`${t.primaryText} font-semibold text-sm uppercase tracking-wider mb-1`}>
            Bewaard voor Baby
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            {STEP_TITLES[step]}
          </h1>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {([0, 1, 2, 3] as const).map((i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                i < step
                  ? t.progressActive
                  : i === step
                  ? `${t.progressActive} opacity-60`
                  : t.progressBg
              }`}
            />
          ))}
        </div>

        {/* Animated step card */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={`bg-white rounded-3xl shadow-md border ${t.primaryBorder} p-8`}
          >

            {/* Stap 0: Babynaam */}
            {step === 0 && (
              <div className="space-y-5">
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
                    className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-xl font-medium focus:outline-none focus:ring-2 ${t.inputRing} focus:border-transparent transition-shadow`}
                  />
                </div>
                <AnimatePresence>
                  {state.babyName.trim() && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className={`${t.primaryBg} border ${t.primaryBorderMedium} rounded-2xl p-4 text-center`}
                    >
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Jouw babyboek heet</p>
                      <p className={`text-xl font-bold ${t.heroAccent}`}>
                        Bewaard voor {state.babyName.trim()} 👶
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Stap 1: Geboortecijfers */}
            {step === 1 && (
              <div className="space-y-5">
                <p className="text-sm text-gray-400">
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
                <p className="text-sm text-gray-400 mb-4">
                  Dit bepaalt hoe de AI-vragen worden geformuleerd — speciaal voor jouw rol.
                </p>
                {NARRATOR_OPTIONS.map((opt) => (
                  <motion.button
                    key={opt.role}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setState((s) => ({ ...s, narratorRole: opt.role }))}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                      state.narratorRole === opt.role
                        ? t.selectedBorder
                        : `border-gray-200 ${t.hoverBorder}`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className="font-semibold text-gray-900">{opt.label}</span>
                      </div>
                      {state.narratorRole === opt.role && (
                        <span className={`w-5 h-5 ${t.selectedDot} rounded-full flex items-center justify-center shrink-0`}>
                          <Check className="w-3 h-3 text-white" />
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed ml-9">{opt.description}</p>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Stap 3: Partner + opa/oma */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    E-mail partner <span className="text-gray-400 font-normal">(optioneel)</span>
                  </label>
                  <input
                    type="email"
                    value={state.partnerEmail}
                    onChange={set("partnerEmail")}
                    placeholder="partner@email.nl"
                    className={`w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${t.inputRing}`}
                  />
                  <p className="mt-1.5 text-xs text-gray-400">
                    De partner ontvangt een uitnodiging om mee te schrijven.
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Opa en oma toevoegen <span className="text-gray-400 font-normal">(optioneel)</span>
                  </p>
                  <AnimatePresence>
                    {grandparents.map((gp, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`flex items-center gap-3 p-3 ${t.itemBg} rounded-xl mb-2 text-sm`}
                      >
                        <Check className={`w-4 h-4 ${t.checkColor} shrink-0`} />
                        <span className="text-gray-700">
                          {gp.name} — <span className="text-gray-400">{gp.email}</span>
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
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
                    className={`mt-2.5 text-sm ${t.primaryText} font-medium ${t.primaryTextMedium} disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    + Voeg toe
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={goBack}
                className="flex items-center gap-1 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Terug
              </button>
              <motion.button
                whileHover={{ scale: canNext() && !loading ? 1.01 : 1 }}
                whileTap={{ scale: canNext() && !loading ? 0.99 : 1 }}
                onClick={goNext}
                disabled={!canNext() || loading}
                className={`flex-1 flex items-center justify-center gap-2 ${t.primary} text-white font-semibold px-6 py-3 rounded-xl ${t.primaryHover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : step === 3 ? (
                  "✨ Babyboek starten"
                ) : (
                  <>
                    Volgende
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-xs text-gray-400 mt-6">
          Je kunt alles later aanpassen in de instellingen.
        </p>
      </div>
    </div>
  );
}
