"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProtectedRoute } from "@/components/protected-route";
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";
import { useAuth } from "@/store/auth-context";
import { apiFetch } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

const consentItems = [
  "Audio- en videoprocessing",
  "AI-transcriptie en samenvatting",
  "Opslag in de EU",
  "Legacy-instellingen",
];

const accessibilityOptions = [
  { id: "captions", label: "Live ondertiteling", key: "captions" as const },
  { id: "contrast", label: "Hoog contrast", key: "highContrast" as const },
  { id: "largeText", label: "Grote tekst", key: "largeText" as const },
];

type AccessibilityState = {
  captions: boolean;
  highContrast: boolean;
  largeText: boolean;
};

const PRIVACY_OPTIONS: Array<{ value: "private" | "trusted" | "legacy"; label: string }> = [
  { value: "private", label: "Alleen voor mij" },
  { value: "trusted", label: "Deel met specifieke personen" },
  { value: "legacy", label: "Vrijgeven na overlijden" },
];

const CHALLENGE_OPTIONS = [
  { value: "30 dagen", label: "30 dagen" },
  { value: "6 weken", label: "6 weken" },
  { value: "Eigen tempo", label: "Eigen tempo" },
];

function OnboardingContent() {
  const router = useRouter();
  const { session, setSession } = useAuth();
  const { profile, isLoading, error } = useJourneyBootstrap();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("Nederland");
  const [locale, setLocale] = useState("nl");
  const [birthYear, setBirthYear] = useState("");
  const [privacyLevel, setPrivacyLevel] = useState<"private" | "trusted" | "legacy">("private");
  const [targetRecipients, setTargetRecipients] = useState("");
  const [challenge, setChallenge] = useState(CHALLENGE_OPTIONS[0].value);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [accessibility, setAccessibility] = useState<AccessibilityState>({
    captions: false,
    highContrast: false,
    largeText: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Load from session if no profile yet (for new users)
    if (!profile && session?.user) {
      setDisplayName(session.user.displayName ?? "");
      setEmail(session.user.email ?? "");
      setCountry(session.user.country ?? "Nederland");
      setLocale(session.user.locale ?? "nl");
      setBirthYear(session.user.birthYear ? String(session.user.birthYear) : "");
      setPrivacyLevel((session.user.privacyLevel as "private" | "trusted" | "legacy") ?? "private");
      return;
    }

    // Load from profile if exists (for existing users)
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setEmail(profile.email ?? "");
      setCountry(profile.country ?? "Nederland");
      setLocale(profile.locale ?? "nl");
      setBirthYear(profile.birthYear ? String(profile.birthYear) : "");
      setPrivacyLevel(profile.privacyLevel ?? "private");
      setTargetRecipients(profile.targetRecipients.join("\n"));
      if (profile.deadlines && profile.deadlines.length > 0) {
        const next = profile.deadlines[0];
        setChallenge(next.label);
        setDeadlineDate(next.dueDate.slice(0, 10));
      } else {
        setChallenge(CHALLENGE_OPTIONS[0].value);
        setDeadlineDate("");
      }
      setAccessibility({
        captions: profile.accessibility.captions,
        highContrast: profile.accessibility.highContrast,
        largeText: profile.accessibility.largeText,
      });
    }
  }, [profile, session]);

  const recipientsPreview = useMemo(
    () =>
      targetRecipients
        .split(/[\n,]/)
        .map((entry) => entry.trim())
        .filter(Boolean),
    [targetRecipients],
  );

  const handleAccessibilityToggle = (key: keyof AccessibilityState) => {
    setAccessibility((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!session?.token) {
      setSubmitError("Je bent niet ingelogd.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        display_name: displayName,
        email,
        country,
        locale,
        birth_year: birthYear ? Number(birthYear) : undefined,
        privacy_level: privacyLevel,
        target_recipients: recipientsPreview,
        deadline: deadlineDate
          ? {
              label: challenge,
              due_date: new Date(deadlineDate).toISOString(),
            }
          : undefined,
        accessibility: {
          captions: accessibility.captions,
          high_contrast: accessibility.highContrast,
          large_text: accessibility.largeText,
        },
      };

      const response = await apiFetch<{
        user_id: string;
        journey_id: string;
        created_at: string;
        summary: string;
      }>(
        "/onboarding/intake",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        { token: session.token },
      );

      // Update session with the new journey ID
      if (response.journey_id && session) {
        setSession({
          ...session,
          primaryJourneyId: response.journey_id,
        });
      }

      setSubmitSuccess("Je instellingen zijn opgeslagen.");

      // Redirect to dashboard after successful onboarding
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (cause) {
      const message =
        typeof cause === "object" && cause && "message" in cause
          ? String((cause as { message: string }).message)
          : "Opslaan is mislukt. Probeer het later opnieuw.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !profile) {
    return (
      <AppShell
        title="Aanmelding & intake"
        description="Rond de basis binnen vijf minuten af"
        activeHref="/onboarding"
      >
        <Card>
          <CardHeader>
            <CardTitle>Bezig met laden…</CardTitle>
            <CardDescription>We halen je huidige instellingen op.</CardDescription>
          </CardHeader>
        </Card>
      </AppShell>
    );
  }

  // For onboarding, it's OK if there's no journey yet - we'll create one
  // So we just show the form regardless of journey loading errors

  return (
    <AppShell
      title="Aanmelding & intake"
      description="Rond de basis binnen vijf minuten af en bepaal meteen je privacy- en legacy-keuzes."
      activeHref="/onboarding"
      actions={
        profile?.deadlines && profile.deadlines.length > 0 ? (
          <span className="text-sm text-slate-200">
            Volgende mijlpaal: {formatDate(profile.deadlines[0].dueDate)}
          </span>
        ) : null
      }
    >
      <form className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]" onSubmit={handleSubmit}>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Jouw profiel</CardTitle>
              <CardDescription>
                Minimalistische gegevens zodat we je persoonlijk kunnen aanspreken.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="displayName" className="text-sm font-medium text-label">
                  Voornaam of alias
                </label>
                <input
                  id="displayName"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                  className="rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/30"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-label">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/30"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="birthYear" className="text-sm font-medium text-label">
                    Geboortejaar (optioneel)
                  </label>
                  <input
                    id="birthYear"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={birthYear}
                    onChange={(event) => setBirthYear(event.target.value)}
                    placeholder="Bijv. 1980"
                    className="rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/30"
                  />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-2">
                  <label htmlFor="country" className="text-sm font-medium text-label">
                    Land
                  </label>
                  <input
                    id="country"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    className="rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/30"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="locale" className="text-sm font-medium text-label">
                    Taal
                  </label>
                  <select
                    id="locale"
                    value={locale}
                    onChange={(event) => setLocale(event.target.value)}
                    className="rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/30"
                  >
                    <option value="nl">Nederlands</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Voor wie maak je dit?</CardTitle>
              <CardDescription>
                Koppel een zachte deadline (optioneel) en licht je doelgroep toe.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="recipients" className="text-sm font-medium text-label">
                  Doelgroep (optioneel)
                </label>
                <textarea
                  id="recipients"
                  rows={3}
                  value={targetRecipients}
                  onChange={(event) => setTargetRecipients(event.target.value)}
                  className="rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/30"
                  placeholder="Bijv. Mijn dochters, kleinkinderen en beste vriend."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor="challenge" className="text-sm font-medium text-label">
                    Challenge (optioneel)
                  </label>
                  <select
                    id="challenge"
                    value={challenge}
                    onChange={(event) => setChallenge(event.target.value)}
                    className="rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/30"
                  >
                    {CHALLENGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="deadline" className="text-sm font-medium text-label">
                    Deadline (optioneel)
                  </label>
                  <input
                    id="deadline"
                    type="date"
                    value={deadlineDate}
                    onChange={(event) => setDeadlineDate(event.target.value)}
                    className="rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/30"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Privacy en legacy</CardTitle>
              <CardDescription>
                Bepaal wie toegang krijgt en wanneer je verhaal open mag.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <label htmlFor="privacyLevel" className="text-sm font-medium text-label">
                  Privacy-niveau
                </label>
                <select
                  id="privacyLevel"
                  value={privacyLevel}
                  onChange={(event) => setPrivacyLevel(event.target.value as typeof privacyLevel)}
                  className="rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/30"
                >
                  {PRIVACY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-xl border border-warm-sand bg-warm-sand/10 p-4 text-sm text-medium">
                Voeg vertrouwenspersonen toe via het legacy-dashboard zodra je journey live staat.
              </div>
              <div className="grid gap-3">
                <p className="text-sm font-medium text-label">Toestemmingen (optioneel)</p>
                <ul className="space-y-2 text-sm text-medium">
                  {consentItems.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <input type="checkbox" className="h-4 w-4 rounded border border-warm-sand accent-warm-amber" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Toegankelijkheid</CardTitle>
              <CardDescription>AI en UI passen zich aan jouw voorkeuren aan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {accessibilityOptions.map((option) => (
                <label
                  key={option.id}
                  htmlFor={option.id}
                  className="flex items-center justify-between rounded-xl border border-input-border bg-input-background px-4 py-3 text-sm text-label cursor-pointer hover:border-warm-amber/50 transition-colors"
                >
                  {option.label}
                  <input
                    id={option.id}
                    type="checkbox"
                    checked={accessibility[option.key]}
                    onChange={() => handleAccessibilityToggle(option.key)}
                    className="h-4 w-4 rounded border border-warm-sand accent-warm-amber"
                  />
                </label>
              ))}
              <div className="rounded-xl border border-warm-amber/40 bg-warm-amber/10 p-4 text-sm text-heading">
                Geef aan welke onderwerpen gevoeliger liggen. De AI past het tempo en de modaliteit aan.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="mt-10 flex flex-col gap-3 border-t border-warm-sand/30 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-medium">
              Je kunt deze instellingen later altijd aanpassen in je profiel.
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="ghost"
                type="button"
                disabled={isSubmitting}
                className="text-medium hover:text-heading"
              >
                Later afronden
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-warm-amber hover:bg-warm-amber/90 text-slate-900"
              >
                {isSubmitting ? "Opslaan..." : "Bevestig en start de reis"}
              </Button>
            </div>
          </div>
          {submitError ? (
            <p className="mt-4 text-sm text-coral">{submitError}</p>
          ) : null}
          {submitSuccess ? (
            <p className="mt-4 text-sm text-sage">{submitSuccess}</p>
          ) : null}
        </div>
      </form>
    </AppShell>
  );
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingContent />
    </ProtectedRoute>
  );
}