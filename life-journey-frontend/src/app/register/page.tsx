"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerUser } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/store/auth-context";

const PRIVACY_OPTIONS = [
  { value: "private", label: "Alleen voor mij" },
  { value: "trusted", label: "Gedeeld met vertrouwde personen" },
  { value: "legacy", label: "Bewaar voor nalatenschap" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("Nederland");
  const [privacyLevel, setPrivacyLevel] = useState(PRIVACY_OPTIONS[0].value);
  const [birthYear, setBirthYear] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const session = await registerUser({
        displayName,
        email,
        password,
        country,
        privacyLevel,
        birthYear: birthYear ? Number(birthYear) : undefined,
      });
      setSession(session);
      // New users always need to go through onboarding first
      router.push("/onboarding");
    } catch (cause) {
      const message =
        typeof cause === "object" && cause && "message" in cause
          ? String(cause.message)
          : "Registratie is mislukt. Controleer je gegevens.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
      <Card className="w-full max-w-2xl border-card bg-card shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/Logo_Bewaardvoorjou.png"
              alt="Bewaard voor jou Logo"
              width={80}
              height={80}
              className="w-20 h-20"
              priority
            />
          </div>
          <CardTitle className="text-2xl text-heading font-serif">Maak een Bewaard voor jou-account</CardTitle>
          <CardDescription className="text-medium">
            Start met opnemen en deel je verhaal wanneer jij dat wil. Je kunt je voorkeuren later altijd aanpassen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-label" htmlFor="displayName">
                Naam of bijnaam
              </label>
              <input
                id="displayName"
                required
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="w-full rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/30"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-label" htmlFor="email">
                E-mailadres
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/30"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-label" htmlFor="password">
                Wachtwoord (minimaal 8 tekens)
              </label>
              <input
                id="password"
                type="password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/30"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-label" htmlFor="country">
                Land
              </label>
              <input
                id="country"
                required
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className="w-full rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/30"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-label" htmlFor="birthYear">
                Geboortejaar (optioneel)
              </label>
              <input
                id="birthYear"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={birthYear}
                onChange={(event) => setBirthYear(event.target.value)}
                className="w-full rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/30"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-label" htmlFor="privacyLevel">
                Privacy-niveau
              </label>
              <select
                id="privacyLevel"
                value={privacyLevel}
                onChange={(event) => setPrivacyLevel(event.target.value)}
                className="w-full rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/30"
              >
                {PRIVACY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-medium">
                Je kunt dit later in je instellingen veranderen.
              </p>
            </div>

            {error ? (
              <p className="md:col-span-2 text-sm text-coral">{error}</p>
            ) : null}

            <div className="md:col-span-2 flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full justify-center bg-warm-amber hover:bg-warm-amber/90 text-slate-900"
                disabled={
                  isSubmitting ||
                  !displayName ||
                  !email ||
                  !password ||
                  !country
                }
              >
                {isSubmitting ? "Account wordt aangemaakt..." : "Account aanmaken"}
              </Button>
              <p className="text-center text-sm text-medium">
                Heb je al een account?{" "}
                <Link href="/login" className="text-warm-amber hover:text-warm-amber/80 font-medium">
                  Log hier in
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}