"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { registerUser } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function getPasswordStrength(pw: string): 0 | 1 | 2 | 3 {
  if (pw.length < 4) return 0;
  if (pw.length < 8) return 1;
  if (pw.length < 12 && !/[0-9]/.test(pw)) return 2;
  return pw.length >= 12 && /[0-9]/.test(pw) ? 3 : 2;
}

const STRENGTH_LABELS = ["Te kort", "Matig", "Goed", "Sterk"] as const;
const STRENGTH_COLORS = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("Nederland");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentSpecialCategories, setConsentSpecialCategories] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await registerUser({
        displayName,
        email,
        password,
        country,
        consentTerms,
        consentSpecialCategories,
        consentMarketing,
        promoCode: promoCode.trim() || undefined,
      });
      router.push(`/email-verificeren?email=${encodeURIComponent(result.email)}`);
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
                className="w-full rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/40"
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
                className="w-full rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/40"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-label" htmlFor="password">
                Wachtwoord (minimaal 8 tekens)
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-input-border bg-input-background px-4 py-3 pr-12 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-warm-amber/40 rounded"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          getPasswordStrength(password) > level
                            ? STRENGTH_COLORS[getPasswordStrength(password)]
                            : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    Wachtwoord: <span className="font-medium">{STRENGTH_LABELS[getPasswordStrength(password)]}</span>
                  </p>
                </div>
              )}
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
                className="w-full rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/40"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-label" htmlFor="promoCode">
                Promotiecode <span className="text-slate-400 font-normal">(optioneel)</span>
              </label>
              <input
                id="promoCode"
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Bijv. WELKOM2026"
                maxLength={32}
                className="w-full rounded-xl border border-input-border bg-input-background px-4 py-3 text-input font-mono shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/40"
              />
              <p className="text-xs text-slate-400">Heb je een code ontvangen? Vul hem hier in — je account wordt direct geactiveerd.</p>
            </div>

            {/* AVG Toestemmingen */}
            <div className="space-y-3 md:col-span-2 pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Toestemming (vereist)
              </p>

              {/* Verplicht: AV + Privacyverklaring */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentTerms}
                  onChange={(e) => setConsentTerms(e.target.checked)}
                  className="mt-0.5 accent-warm-amber h-4 w-4 flex-shrink-0"
                  required
                />
                <span className="text-sm text-slate-700 leading-relaxed">
                  Ik heb de{" "}
                  <a href="/terms" target="_blank" className="text-warm-amber underline hover:text-warm-amber/80">
                    Algemene voorwaarden
                  </a>{" "}
                  en de{" "}
                  <a href="/privacy" target="_blank" className="text-warm-amber underline hover:text-warm-amber/80">
                    Privacyverklaring
                  </a>{" "}
                  gelezen en ga hiermee akkoord.{" "}
                  <span className="text-coral font-medium">*</span>
                </span>
              </label>

              {/* Verplicht: bijzondere categorieën (Art. 9 AVG) */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentSpecialCategories}
                  onChange={(e) => setConsentSpecialCategories(e.target.checked)}
                  className="mt-0.5 accent-warm-amber h-4 w-4 flex-shrink-0"
                  required
                />
                <span className="text-sm text-slate-700 leading-relaxed">
                  Ik geef toestemming voor de verwerking van mijn audio- en video-opnamen
                  en de bijbehorende AI-analyse (transcriptie, emotieherkenning) door
                  BewaardVoorJou en haar verwerkers.{" "}
                  <span className="text-coral font-medium">*</span>
                </span>
              </label>

              {/* Optioneel: marketing */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentMarketing}
                  onChange={(e) => setConsentMarketing(e.target.checked)}
                  className="mt-0.5 accent-warm-amber h-4 w-4 flex-shrink-0"
                />
                <span className="text-sm text-slate-600 leading-relaxed">
                  Ik ontvang graag nieuwsbrieven en tips over het vastleggen van herinneringen.
                  Je kunt je altijd afmelden. <span className="text-slate-400">(optioneel)</span>
                </span>
              </label>

              <p className="text-xs text-slate-400">
                <span className="text-coral font-medium">*</span> Verplicht voor gebruik van het platform
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
                  !consentTerms ||
                  !consentSpecialCategories
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