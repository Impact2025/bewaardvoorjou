"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WachtwoordVergetenPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1"}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Er ging iets mis. Probeer het opnieuw.");
      }

      setSubmitted(true);
    } catch {
      setError("Er ging iets mis. Controleer je internetverbinding en probeer het opnieuw.");
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
          <CardTitle className="text-2xl text-heading font-serif">Wachtwoord vergeten</CardTitle>
          <CardDescription className="text-medium">
            Vul je e-mailadres in en we sturen je een link om een nieuw wachtwoord in te stellen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">📬</div>
              <p className="text-sm text-medium">
                Als dit e-mailadres bij ons bekend is, ontvang je binnen enkele minuten een resetlink.
                Vergeet ook je spam-map te controleren.
              </p>
              <Link
                href="/login"
                className="block text-sm text-warm-amber hover:text-warm-amber/80 font-medium mt-4"
              >
                Terug naar inloggen
              </Link>
            </div>
          ) : (
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/30"
                />
              </div>

              {error ? <p className="text-sm text-coral">{error}</p> : null}

              <Button
                type="submit"
                className="w-full justify-center bg-warm-amber hover:bg-warm-amber/90 text-slate-900"
                disabled={isSubmitting || !email}
              >
                {isSubmitting ? "Bezig..." : "Stuur resetlink"}
              </Button>

              <p className="text-center text-sm text-medium">
                <Link href="/login" className="text-warm-amber hover:text-warm-amber/80 font-medium">
                  Terug naar inloggen
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
