"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginUser, requestMagicLink } from "@/lib/auth-client";
import { isApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/store/auth-context";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accountDeleted = searchParams.get("deleted") === "1";
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);

  async function handleMagicLinkRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSendingMagicLink(true);
    try {
      await requestMagicLink(magicLinkEmail);
    } finally {
      setIsSendingMagicLink(false);
      setMagicLinkSent(true);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setEmailNotVerified(false);
    setIsSubmitting(true);

    try {
      const session = await loginUser({ email, password });
      setSession(session);
      if (session.user.isAdmin) {
        router.push("/admin");
      } else if (!session.onboardingCompleted) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (cause) {
      if (isApiError(cause) && cause.code === "EMAIL_NOT_VERIFIED") {
        setEmailNotVerified(true);
      } else {
        setError("Inloggen mislukt. Geen wachtwoord ingesteld? Gebruik de toegangslink hieronder.");
        setShowMagicLink(true);
        setMagicLinkEmail(email);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
      <Card className="w-full max-w-md border-card bg-card shadow-lg">
        {accountDeleted && (
          <div className="mx-6 mt-6 rounded-xl px-4 py-3 text-sm text-center" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#15803D" }}>
            Je account is verwijderd. Bedankt voor je vertrouwen in BewaardVoorJou.
          </div>
        )}
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
          <CardTitle className="text-2xl text-heading font-serif">Welkom terug</CardTitle>
          <CardDescription className="text-medium">
            Log in om verder te gaan met je verhaal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-label" htmlFor="email">
                E-mailadres
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/40"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-label" htmlFor="password">
                  Wachtwoord
                </label>
                <Link
                  href="/wachtwoord-vergeten"
                  className="text-xs text-warm-amber hover:text-warm-amber/80"
                >
                  Wachtwoord vergeten?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
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
            </div>

            {error ? <p className="text-sm text-coral">{error}</p> : null}

            {emailNotVerified ? (
              <div className="rounded-xl border border-warm-amber/40 bg-warm-amber/10 p-4 text-sm">
                <p className="font-medium text-heading mb-1">E-mailadres nog niet bevestigd</p>
                <p className="text-medium mb-3">
                  Check je inbox voor de verificatielink. Geen e-mail ontvangen?
                </p>
                <Link
                  href={`/email-verificeren?email=${encodeURIComponent(email)}`}
                  className="font-medium text-warm-amber hover:text-warm-amber/80"
                >
                  Stuur verificatielink opnieuw →
                </Link>
              </div>
            ) : null}

            <Button
              type="submit"
              className="w-full justify-center bg-warm-amber hover:bg-warm-amber/90 text-slate-900"
              disabled={isSubmitting || !email || !password}
            >
              {isSubmitting ? "Bezig met inloggen..." : "Inloggen"}
            </Button>
          </form>

          <div className="mt-6 border-t border-card pt-5">
            {!showMagicLink ? (
              <p className="text-center text-sm text-medium">
                Geen wachtwoord?{" "}
                <button
                  type="button"
                  onClick={() => setShowMagicLink(true)}
                  className="text-warm-amber hover:text-warm-amber/80 font-medium underline-offset-2 hover:underline"
                >
                  Ontvang een toegangslink
                </button>
              </p>
            ) : magicLinkSent ? (
              <div className="rounded-xl border border-warm-amber/40 bg-warm-amber/10 p-4 text-sm text-center">
                <p className="font-medium text-heading mb-1">Controleer je inbox</p>
                <p className="text-medium">
                  Als dit e-mailadres bij ons bekend is, ontvang je een toegangslink per e-mail.
                </p>
              </div>
            ) : (
              <form onSubmit={handleMagicLinkRequest} className="space-y-3">
                <p className="text-sm text-medium text-center">
                  Ontvang een toegangslink via e-mail
                </p>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="jouw@email.nl"
                  value={magicLinkEmail}
                  onChange={(e) => setMagicLinkEmail(e.target.value)}
                  className="w-full rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/40"
                />
                <Button
                  type="submit"
                  className="w-full justify-center bg-warm-amber hover:bg-warm-amber/90 text-slate-900"
                  disabled={isSendingMagicLink || !magicLinkEmail}
                >
                  {isSendingMagicLink ? "Bezig met versturen..." : "Stuur toegangslink"}
                </Button>
                <p className="text-center text-xs text-medium">
                  <button
                    type="button"
                    onClick={() => setShowMagicLink(false)}
                    className="hover:text-heading underline-offset-2 hover:underline"
                  >
                    Terug naar inloggen
                  </button>
                </p>
              </form>
            )}
          </div>

          <p className="mt-4 text-center text-sm text-medium">
            Nog geen account?{" "}
            <Link href="/register" className="text-warm-amber hover:text-warm-amber/80 font-medium">
              Maak er één aan
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-medium">
            Hulp nodig?{" "}
            <Link href="/contact" className="text-warm-amber hover:text-warm-amber/80 font-medium">
              Neem contact op
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "#FAF7F2" }} />}>
      <LoginContent />
    </Suspense>
  );
}