"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginUser } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/store/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const session = await loginUser({ email, password });
      setSession(session);
      // Redirect to onboarding if no journey exists yet
      if (!session.primaryJourneyId) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (cause) {
      const message =
        typeof cause === "object" && cause && "message" in cause
          ? String(cause.message)
          : "Inloggen is mislukt. Controleer je gegevens.";
      setError(message);
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
                className="w-full rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/30"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-label" htmlFor="password">
                Wachtwoord
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/30"
              />
            </div>

            {error ? <p className="text-sm text-coral">{error}</p> : null}

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
        </CardContent>
      </Card>
    </div>
  );
}