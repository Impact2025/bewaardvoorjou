"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "@/lib/auth-client";
import { isApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/store/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      } else if (!session.primaryJourneyId) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (cause) {
      if (isApiError(cause) && cause.code === "EMAIL_NOT_VERIFIED") {
        setEmailNotVerified(true);
      } else {
        const message =
          typeof cause === "object" && cause && "message" in cause
            ? String((cause as { message: string }).message)
            : "Inloggen is mislukt. Controleer je gegevens.";
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
      <Card className="w-full max-w-md border-card bg-card shadow-lg">
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
            Log in met je e-mailadres en wachtwoord om verder te gaan met je verhaal.
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

          <p className="mt-6 text-center text-sm text-medium">
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