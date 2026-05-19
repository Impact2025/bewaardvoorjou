"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mismatch = passwordConfirm.length > 0 && password !== passwordConfirm;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mismatch) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? "Er ging iets mis. Probeer het opnieuw.");
      }

      setDone(true);
    } catch (cause) {
      setError(
        typeof cause === "object" && cause && "message" in cause
          ? String(cause.message)
          : "Er ging iets mis. Probeer het opnieuw."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <p className="text-sm text-coral text-center">
        Ongeldige resetlink. Vraag een{" "}
        <Link href="/wachtwoord-vergeten" className="text-warm-amber font-medium">
          nieuwe link
        </Link>{" "}
        aan.
      </p>
    );
  }

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">✅</div>
        <p className="text-sm text-medium">
          Je wachtwoord is succesvol gewijzigd. Je kunt nu inloggen.
        </p>
        <Link
          href="/login"
          className="block text-sm text-warm-amber hover:text-warm-amber/80 font-medium mt-4"
        >
          Ga naar inloggen
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-label" htmlFor="password">
          Nieuw wachtwoord
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/30"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-label" htmlFor="passwordConfirm">
          Herhaal wachtwoord
        </label>
        <input
          id="passwordConfirm"
          type="password"
          required
          autoComplete="new-password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className={`w-full rounded-xl border px-4 py-3 text-input shadow-inner focus:outline-none focus:ring-2 focus:ring-warm-amber/30 bg-input-background ${
            mismatch ? "border-coral" : "border-input-border focus:border-input-focus"
          }`}
        />
        {mismatch ? (
          <p className="text-xs text-coral">Wachtwoorden komen niet overeen.</p>
        ) : null}
      </div>

      {error ? <p className="text-sm text-coral">{error}</p> : null}

      <Button
        type="submit"
        className="w-full justify-center bg-warm-amber hover:bg-warm-amber/90 text-slate-900"
        disabled={isSubmitting || !password || mismatch}
      >
        {isSubmitting ? "Bezig..." : "Stel nieuw wachtwoord in"}
      </Button>
    </form>
  );
}

export default function WachtwoordResettenPage() {
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
          <CardTitle className="text-2xl text-heading font-serif">Nieuw wachtwoord</CardTitle>
          <CardDescription className="text-medium">
            Kies een nieuw wachtwoord van minimaal 8 tekens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-sm text-medium text-center">Laden...</p>}>
            <ResetForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
