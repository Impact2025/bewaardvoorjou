"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth-context";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageFrom = "guide" | "user";

interface ChatMessage {
  id: string;
  from: MessageFrom;
  content: string;
}

interface ChipOption {
  value: string;
  label: string;
  description?: string;
}

type Phase =
  | "init"
  | "name"
  | "birth_year"
  | "purpose"
  | "recording_method"
  | "privacy"
  | "tempo"
  | "ai_assistance"
  | "promo_code"
  | "summary"
  | "submitting"
  | "done";

interface CollectedData {
  displayName: string;
  birthYear?: number;
  recipients: string[];
  recordingMethod: string;
  privacyLevel: "private" | "trusted" | "legacy";
  challenge: string;
  aiAssistance: "full" | "minimal" | "none";
  promoCode?: string;
  promoApplied?: boolean;
}

// ─── Script data ──────────────────────────────────────────────────────────────

const PURPOSE_OPTIONS: ChipOption[] = [
  { value: "Mijn kinderen", label: "Mijn kinderen" },
  { value: "Mijn kleinkinderen", label: "Mijn kleinkinderen" },
  { value: "Mijn partner", label: "Mijn partner" },
  { value: "De hele familie", label: "De hele familie" },
  { value: "Voornamelijk voor mezelf", label: "Voor mezelf" },
];

const RECORDING_OPTIONS: ChipOption[] = [
  { value: "video", label: "Video", description: "Neem jezelf op" },
  { value: "audio", label: "Audio", description: "Spreek je verhaal in" },
  { value: "text", label: "Tekst", description: "Schrijf je gedachten" },
  { value: "mixed", label: "Gemengd", description: "Combineer methoden" },
];

const PRIVACY_OPTIONS: ChipOption[] = [
  { value: "private", label: "Alleen ik", description: "Volledig privé" },
  { value: "trusted", label: "Familie & vrienden", description: "Geselecteerde mensen" },
  { value: "legacy", label: "Na mijn overlijden", description: "Als nalatenschap" },
];

const TEMPO_OPTIONS: ChipOption[] = [
  { value: "30 dagen", label: "30 dagen" },
  { value: "6 weken", label: "6 weken" },
  { value: "Eigen tempo", label: "Eigen tempo" },
];

const AI_OPTIONS: ChipOption[] = [
  { value: "full", label: "Volledige begeleiding", description: "AI stelt vervolgvragen" },
  { value: "minimal", label: "Minimale hints", description: "Alleen startvragen" },
  { value: "none", label: "Helemaal zelf", description: "Op eigen wijze" },
];

const PRIVACY_LABELS: Record<string, string> = {
  private: "Alleen ik",
  trusted: "Familie & vrienden",
  legacy: "Na mijn overlijden",
};

const RECORDING_LABELS: Record<string, string> = {
  video: "Video",
  audio: "Audio",
  text: "Tekst",
  mixed: "Gemengd",
};

const AI_LABELS: Record<string, string> = {
  full: "Volledige begeleiding",
  minimal: "Minimale hints",
  none: "Helemaal zelf",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-warm-amber/20">
        <Image src="/Logo_Bewaardvoorjou.png" alt="" width={32} height={32} />
      </div>
      <div className="bg-white border border-neutral-sand rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="w-2 h-2 bg-warm-amber/60 rounded-full animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function GuideMessage({ content, showAvatar }: { content: string; showAvatar: boolean }) {
  return (
    <div className="flex items-end gap-2.5 chat-msg-in">
      <div className={cn("w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-warm-amber/20", !showAvatar && "invisible")}>
        <Image src="/Logo_Bewaardvoorjou.png" alt="Gids" width={32} height={32} />
      </div>
      <div className="max-w-[78%] bg-white border border-neutral-sand rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-foreground shadow-sm leading-relaxed">
        {content}
      </div>
    </div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end chat-msg-in">
      <div className="max-w-[78%] bg-warm-amber rounded-2xl rounded-br-sm px-4 py-3 text-sm text-slate-900 font-medium shadow-sm leading-relaxed">
        {content}
      </div>
    </div>
  );
}

interface ChipsProps {
  options: ChipOption[];
  onSelect: (values: string, labels: string) => void;
  multiSelect?: boolean;
}

function QuickReplyChips({ options, onSelect, multiSelect = false }: ChipsProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleSingle = (opt: ChipOption) => {
    onSelect(opt.value, opt.label);
  };

  const handleConfirm = () => {
    if (selected.length === 0) return;
    const matched = options.filter((o) => selected.includes(o.value));
    onSelect(
      matched.map((o) => o.value).join(","),
      matched.map((o) => o.label).join(", "),
    );
  };

  return (
    <div className="space-y-3 chat-msg-in">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => (multiSelect ? toggle(opt.value) : handleSingle(opt))}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium border transition-all",
                "focus:outline-none focus:ring-2 focus:ring-warm-amber/40",
                isSelected
                  ? "border-warm-amber bg-warm-amber/20 text-slate-900 shadow-sm"
                  : "border-neutral-sand bg-white text-foreground hover:border-warm-amber/60 hover:bg-warm-amber/5",
              )}
            >
              <span>{opt.label}</span>
              {opt.description && (
                <span className="text-foreground/50 text-xs hidden sm:inline">— {opt.description}</span>
              )}
            </button>
          );
        })}
      </div>
      {multiSelect && (
        <button
          onClick={handleConfirm}
          disabled={selected.length === 0}
          className="px-6 py-2.5 bg-warm-amber text-slate-900 rounded-full text-sm font-semibold hover:bg-warm-amber/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Bevestig keuze ({selected.length}) →
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const PHASE_ORDER: Phase[] = [
  "init",
  "name",
  "birth_year",
  "purpose",
  "recording_method",
  "privacy",
  "tempo",
  "ai_assistance",
  "promo_code",
  "summary",
];

// Map phase → onboarding step name (for backend progress save)
const PHASE_TO_STEP: Partial<Record<Phase, string>> = {
  name: "personal_info",
  birth_year: "personal_info",
  purpose: "story_purpose",
  recording_method: "recording_preferences",
  privacy: "privacy_settings",
  tempo: "privacy_settings",
  ai_assistance: "recording_preferences",
  summary: "complete",
};

function getDeadlineDate(challenge: string): string {
  const d = new Date();
  if (challenge === "30 dagen") d.setDate(d.getDate() + 30);
  else if (challenge === "6 weken") d.setDate(d.getDate() + 42);
  return d.toISOString();
}

export function ChatOnboarding() {
  const router = useRouter();
  const { session, setSession } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [phase, setPhase] = useState<Phase>("init");
  const [isTyping, setIsTyping] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [data, setData] = useState<Partial<CollectedData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const startedRef = useRef(false);

  const addMessage = useCallback((from: MessageFrom, content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, from, content },
    ]);
  }, []);

  const showGuideMessages = useCallback(
    async (msgs: string[], typingMs = 750) => {
      for (let i = 0; i < msgs.length; i++) {
        setIsTyping(true);
        await new Promise((r) => setTimeout(r, typingMs));
        setIsTyping(false);
        addMessage("guide", msgs[i]);
        if (i < msgs.length - 1) {
          await new Promise((r) => setTimeout(r, 150));
        }
      }
    },
    [addMessage],
  );

  // Save progress to backend after each phase transition
  const saveProgress = useCallback(
    async (currentPhase: Phase, currentData: Partial<CollectedData>) => {
      if (!session?.token) return;
      const step = PHASE_TO_STEP[currentPhase];
      if (!step || step === "complete") return;
      try {
        await apiFetch(
          "/onboarding/progress",
          {
            method: "POST",
            body: JSON.stringify({
              current_step: step,
              personal_info: currentData.displayName
                ? { display_name: currentData.displayName, birth_year: currentData.birthYear ?? null }
                : null,
              story_purpose: currentData.recipients?.length
                ? { purpose: "legacy", recipients: currentData.recipients }
                : null,
              recording_prefs: currentData.recordingMethod
                ? { preferred_method: currentData.recordingMethod, ai_assistance: currentData.aiAssistance ?? "full" }
                : null,
              privacy_settings: currentData.privacyLevel
                ? { privacy_level: currentData.privacyLevel }
                : null,
            }),
          },
          { token: session.token },
        );
      } catch {
        // Progress save is best-effort; don't block the user
      }
    },
    [session?.token],
  );

  // Scroll to bottom on updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus text input when relevant
  useEffect(() => {
    if (phase === "name" || phase === "birth_year" || phase === "promo_code") {
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Kick off the conversation once — check for saved progress first
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const prefill = session?.user?.displayName ?? "";
    const hasPrefilledName = Boolean(prefill && prefill !== session?.user?.email);
    if (hasPrefilledName) {
      setTextInput(prefill);
    }

    const run = async () => {
      // Try to resume saved progress
      if (session?.token) {
        try {
          const saved = await apiFetch<{ has_progress: boolean; progress?: { personal_info?: { display_name?: string; birth_year?: number }; current_step?: string } }>(
            "/onboarding/progress",
            { method: "GET" },
            { token: session.token },
          );

          if (saved.has_progress && saved.progress?.personal_info?.display_name) {
            const name = saved.progress.personal_info.display_name;
            await showGuideMessages(
              [
                `Welkom terug, ${name}!`,
                "Je was al bezig met je instellingen. Ik ga verder waar je gebleven was.",
              ],
              600,
            );
            setData({
              displayName: name,
              birthYear: saved.progress.personal_info.birth_year,
            });
            // Jump to purpose step (first after name + birth_year)
            await showGuideMessages(["Voor wie maak je dit verhaal eigenlijk?"], 500);
            setPhase("purpose");
            return;
          }
        } catch {
          // No saved progress or fetch failed — start fresh
        }
      }

      const nameQuestion = hasPrefilledName
        ? `Je hebt je geregistreerd als "${prefill}". Klopt deze naam, of wil je liever een andere gebruiken?`
        : "Hoe mag ik je noemen?";

      await showGuideMessages(
        [
          "Hoi! Welkom bij Bewaard voor jou.",
          "Ik ga je in een paar vragen helpen je reis te starten. Het duurt maar twee minuten.",
          nameQuestion,
        ],
        650,
      );
      setPhase("name");
    };

    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleName = async () => {
    const name = textInput.trim();
    if (!name) return;
    addMessage("user", name);
    setTextInput("");
    const next = { displayName: name };
    setData((prev) => ({ ...prev, ...next }));

    await showGuideMessages([
      `Fijn om je te ontmoeten, ${name}.`,
      "In welk jaar ben je geboren? (Optioneel — je kunt dit overslaan)",
    ]);
    setPhase("birth_year");
    await saveProgress("birth_year", next);
  };

  const handleBirthYear = async (skip = false) => {
    let updatedData: Partial<CollectedData> = {};
    if (!skip) {
      const year = parseInt(textInput.trim(), 10);
      const valid = year >= 1900 && year <= new Date().getFullYear();
      if (textInput.trim() && valid) {
        addMessage("user", textInput.trim());
        updatedData = { birthYear: year };
        setData((prev) => ({ ...prev, ...updatedData }));
      } else {
        addMessage("user", "Sla over");
      }
    } else {
      addMessage("user", "Sla over");
    }
    setTextInput("");

    await showGuideMessages(["Voor wie maak je dit verhaal eigenlijk?"]);
    setPhase("purpose");
    setData((prev) => {
      const merged = { ...prev, ...updatedData };
      saveProgress("purpose", merged);
      return merged;
    });
  };

  const handlePurpose = async (_values: string, labels: string) => {
    addMessage("user", labels);
    const recipients = _values.split(",").map((v) => v.trim()).filter(Boolean);
    setData((prev) => {
      const merged = { ...prev, recipients };
      saveProgress("recording_method", merged);
      return merged;
    });

    await showGuideMessages([
      "Wat een mooi gebaar.",
      "Hoe vertel je het liefst je verhaal?",
    ]);
    setPhase("recording_method");
  };

  const handleRecording = async (value: string, label: string) => {
    addMessage("user", label);
    setData((prev) => {
      const merged = { ...prev, recordingMethod: value };
      saveProgress("privacy", merged);
      return merged;
    });

    await showGuideMessages(["Goed. Wie mag jouw verhaal lezen?"]);
    setPhase("privacy");
  };

  const handlePrivacy = async (value: string, label: string) => {
    addMessage("user", label);
    setData((prev) => {
      const merged = { ...prev, privacyLevel: value as CollectedData["privacyLevel"] };
      saveProgress("tempo", merged);
      return merged;
    });

    await showGuideMessages([
      "Begrepen, jouw verhaal blijft veilig.",
      "Op welk tempo wil je werken?",
    ]);
    setPhase("tempo");
  };

  const handleTempo = async (value: string, label: string) => {
    addMessage("user", label);
    setData((prev) => ({ ...prev, challenge: value }));

    await showGuideMessages(["Wil je begeleiding van onze AI tijdens het vertellen?"]);
    setPhase("ai_assistance");
  };

  const handleAI = async (value: string, label: string) => {
    addMessage("user", label);
    setData((prev) => {
      const merged = { ...prev, aiAssistance: value as CollectedData["aiAssistance"] };
      saveProgress("ai_assistance", merged);
      return merged;
    });

    // Skip promo code step if user already has an active package (applied during registration)
    if (session?.user?.packageTier && session.user.packageTier !== "NONE") {
      await showGuideMessages([
        "Bijna klaar!",
        "Dan zetten we alles klaar voor je.",
        "Bekijk je keuzes hieronder en start wanneer je er klaar voor bent.",
      ]);
      setPhase("summary");
      return;
    }

    await showGuideMessages([
      "Bijna klaar!",
      "Heb je een promotiecode ontvangen? Vul hem hieronder in — anders sla je gewoon over.",
    ]);
    setPhase("promo_code");
  };

  const handlePromoCode = async (skip = false) => {
    if (skip || !textInput.trim()) {
      addMessage("user", "Geen code");
      setTextInput("");
      await showGuideMessages([
        "Dan zetten we alles klaar voor je.",
        "Bekijk je keuzes hieronder en start wanneer je er klaar voor bent.",
      ]);
      setPhase("summary");
      return;
    }

    const code = textInput.trim().toUpperCase();
    addMessage("user", code);
    setTextInput("");

    try {
      const { redeemPromoCode } = await import("@/lib/api/promo-codes");
      const result = await redeemPromoCode(code);
      if (result.success) {
        setData((prev) => ({ ...prev, promoCode: code, promoApplied: true }));
        await showGuideMessages([
          `Gelukt! ${result.message}`,
          "Bekijk je keuzes hieronder en start wanneer je er klaar voor bent.",
        ]);
      } else {
        await showGuideMessages([
          "Die code herken ik niet. We gaan verder zonder.",
          "Bekijk je keuzes hieronder en start wanneer je er klaar voor bent.",
        ]);
      }
    } catch {
      await showGuideMessages([
        "Code kon niet worden gecontroleerd. We gaan verder.",
        "Bekijk je keuzes hieronder en start wanneer je er klaar voor bent.",
      ]);
    }
    setPhase("summary");
  };

  const handleSubmit = async () => {
    if (!session?.token) return;
    setPhase("submitting");
    setSubmitError(null);

    try {
      const payload = {
        display_name: data.displayName,
        email: session.user?.email ?? "",
        country: "Nederland",
        locale: "nl",
        birth_year: data.birthYear,
        privacy_level: data.privacyLevel ?? "private",
        target_recipients: data.recipients ?? [],
        deadline:
          data.challenge && data.challenge !== "Eigen tempo"
            ? { label: data.challenge, due_date: getDeadlineDate(data.challenge) }
            : undefined,
        accessibility: { captions: false, high_contrast: false, large_text: false },
        recording_method: data.recordingMethod,
        ai_assistance: data.aiAssistance,
      };

      const response = await apiFetch<{
        user_id: string;
        journey_id: string;
        created_at: string;
        summary: string;
      }>("/onboarding/intake", { method: "POST", body: JSON.stringify(payload) }, { token: session.token });

      if (response.journey_id && session) {
        setSession({ ...session, primaryJourneyId: response.journey_id });
      }

      // Clear saved progress now that onboarding is complete
      try {
        await apiFetch("/onboarding/progress", { method: "DELETE" }, { token: session.token });
      } catch {
        // Best-effort
      }

      setPhase("done");
      router.push("/dashboard");
    } catch (cause) {
      const message =
        typeof cause === "object" && cause && "message" in cause
          ? String((cause as { message: string }).message)
          : "Er ging iets mis. Probeer het opnieuw.";
      setSubmitError(message);
      setPhase("summary");
    }
  };

  // ─── Progress ─────────────────────────────────────────────────────────────────

  const phaseIndex = PHASE_ORDER.indexOf(phase);
  const progress =
    phaseIndex <= 0 ? 0 : Math.round(((phaseIndex) / (PHASE_ORDER.length - 1)) * 100);

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col max-w-2xl mx-auto" style={{ height: "calc(100vh - 11rem)" }}>
      {/* Progress bar */}
      <div className="mb-5 flex-shrink-0">
        <div className="flex justify-between items-center text-xs text-foreground/50 mb-2">
          <span>Jouw reis instellen</span>
          <span>{progress}% klaar</span>
        </div>
        <div className="h-1.5 bg-neutral-sand rounded-full overflow-hidden">
          <div
            className="h-full bg-warm-amber rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4 scroll-smooth">
        {messages.map((msg, i) => {
          if (msg.from === "guide") {
            const prev = messages[i - 1];
            const showAvatar = !prev || prev.from !== "guide";
            return <GuideMessage key={msg.id} content={msg.content} showAvatar={showAvatar} />;
          }
          return <UserMessage key={msg.id} content={msg.content} />;
        })}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {!isTyping && phase !== "init" && phase !== "done" && (
        <div className="flex-shrink-0 pt-4 border-t border-neutral-sand/60">
          {/* Text input phases */}
          {(phase === "name" || phase === "birth_year" || phase === "promo_code") && (
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type={phase === "birth_year" ? "number" : "text"}
                value={textInput}
                onChange={(e) => setTextInput(phase === "promo_code" ? e.target.value.toUpperCase() : e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (phase === "name") handleName();
                    else if (phase === "birth_year") handleBirthYear(false);
                    else handlePromoCode(false);
                  }
                }}
                placeholder={
                  phase === "name" ? "Je naam of alias..." :
                  phase === "birth_year" ? "Bijv. 1958" :
                  "Bijv. WELKOM2026"
                }
                min={phase === "birth_year" ? 1900 : undefined}
                max={phase === "birth_year" ? new Date().getFullYear() : undefined}
                maxLength={phase === "promo_code" ? 32 : undefined}
                className={cn(
                  "flex-1 rounded-full border border-input-border bg-white px-5 py-3 text-sm text-foreground shadow-sm focus:border-warm-amber focus:outline-none focus:ring-2 focus:ring-warm-amber/30 transition-colors",
                  phase === "promo_code" && "font-mono tracking-wide"
                )}
              />
              {(phase === "birth_year" || phase === "promo_code") && (
                <button
                  onClick={() => phase === "birth_year" ? handleBirthYear(true) : handlePromoCode(true)}
                  className="whitespace-nowrap px-4 py-2.5 text-sm text-foreground/60 hover:text-foreground border border-neutral-sand rounded-full hover:border-warm-amber/40 transition-colors"
                >
                  Sla over
                </button>
              )}
              <button
                onClick={() => {
                  if (phase === "name") handleName();
                  else if (phase === "birth_year") handleBirthYear(false);
                  else handlePromoCode(false);
                }}
                disabled={phase === "name" && !textInput.trim()}
                className="w-11 h-11 flex items-center justify-center bg-warm-amber text-slate-900 rounded-full font-bold text-lg disabled:opacity-40 hover:bg-warm-amber/90 transition-colors shadow-sm flex-shrink-0"
                aria-label="Verstuur"
              >
                →
              </button>
            </div>
          )}

          {/* Chip phases */}
          {phase === "purpose" && (
            <QuickReplyChips options={PURPOSE_OPTIONS} onSelect={handlePurpose} multiSelect />
          )}
          {phase === "recording_method" && (
            <QuickReplyChips options={RECORDING_OPTIONS} onSelect={handleRecording} />
          )}
          {phase === "privacy" && (
            <QuickReplyChips options={PRIVACY_OPTIONS} onSelect={handlePrivacy} />
          )}
          {phase === "tempo" && (
            <QuickReplyChips options={TEMPO_OPTIONS} onSelect={handleTempo} />
          )}
          {phase === "ai_assistance" && (
            <QuickReplyChips options={AI_OPTIONS} onSelect={handleAI} />
          )}

          {/* Summary */}
          {phase === "summary" && (
            <div className="space-y-3 chat-msg-in">
              <div className="bg-white border border-neutral-sand rounded-2xl p-4 text-sm divide-y divide-neutral-sand/60">
                {[
                  { label: "Naam", value: data.displayName },
                  data.birthYear ? { label: "Geboortejaar", value: String(data.birthYear) } : null,
                  { label: "Voor wie", value: (data.recipients ?? []).join(", ") },
                  { label: "Manier", value: RECORDING_LABELS[data.recordingMethod ?? ""] ?? data.recordingMethod },
                  { label: "Privacy", value: PRIVACY_LABELS[data.privacyLevel ?? ""] ?? data.privacyLevel },
                  { label: "Tempo", value: data.challenge },
                  { label: "AI-begeleiding", value: AI_LABELS[data.aiAssistance ?? ""] ?? data.aiAssistance },
                  data.promoApplied ? { label: "Promotiecode", value: `${data.promoCode} toegepast` } : null,
                ]
                  .filter(Boolean)
                  .map((row) => (
                    <div key={row!.label} className="flex justify-between py-2 first:pt-0 last:pb-0">
                      <span className="text-foreground/55">{row!.label}</span>
                      <span className="font-medium text-right ml-4">{row!.value}</span>
                    </div>
                  ))}
              </div>
              {submitError && (
                <p className="text-sm text-red-500 text-center">{submitError}</p>
              )}
              <button
                onClick={handleSubmit}
                className="w-full py-3.5 bg-warm-amber text-slate-900 rounded-full font-semibold text-base hover:bg-warm-amber/90 transition-colors shadow-md"
              >
                Start mijn reis
              </button>
            </div>
          )}

          {phase === "submitting" && (
            <div className="text-center py-3 text-sm text-foreground/50">
              We zetten alles klaar voor je...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
