"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { verifyEmail } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/store/auth-context";

type VerifyState = "verifying" | "success" | "invalid" | "expired";

function EmailBevestigenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const [state, setState] = useState<VerifyState>("verifying");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setState("invalid");
      return;
    }

    let cancelled = false;
    let redirectTimer: ReturnType<typeof setTimeout> | null = null;

    verifyEmail(token)
      .then((session) => {
        if (cancelled) return;
        setSession(session);
        setState("success");
        redirectTimer = setTimeout(() => {
          if (session.hasBabyGift) {
            router.push("/voor-baby/onboarding");
          } else {
            router.push(session.primaryJourneyId ? "/dashboard" : "/onboarding");
          }
        }, 2000);
      })
      .catch((err: { message?: string }) => {
        if (cancelled) return;
        const msg = err?.message ?? "";
        setState(msg.includes("verlopen") ? "expired" : "invalid");
      });

    return () => {
      cancelled = true;
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [searchParams, setSession, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
      <Card className="w-full max-w-md border-card bg-card shadow-lg text-center">
        <CardHeader>
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

          {state === "verifying" && (
            <>
              <CardTitle className="text-2xl text-heading font-serif">Bezig met verificatie…</CardTitle>
              <CardDescription className="text-medium">
                Even geduld, we controleren je verificatielink.
              </CardDescription>
            </>
          )}

          {state === "success" && (
            <>
              <CardTitle className="text-2xl text-heading font-serif">E-mailadres bevestigd!</CardTitle>
              <CardDescription className="text-medium">
                Je account is geactiveerd. Je wordt nu doorgestuurd…
              </CardDescription>
            </>
          )}

          {state === "invalid" && (
            <>
              <CardTitle className="text-2xl text-heading font-serif">Ongeldige link</CardTitle>
              <CardDescription className="text-medium">
                Deze verificatielink is ongeldig of al gebruikt.
              </CardDescription>
            </>
          )}

          {state === "expired" && (
            <>
              <CardTitle className="text-2xl text-heading font-serif">Link verlopen</CardTitle>
              <CardDescription className="text-medium">
                Deze verificatielink is verlopen (geldig voor 24 uur).
              </CardDescription>
            </>
          )}
        </CardHeader>

        {(state === "invalid" || state === "expired") && (
          <CardContent className="space-y-3">
            <Link
              href="/email-verificeren"
              className="block w-full rounded-xl bg-warm-amber px-4 py-3 text-center text-sm font-medium text-slate-900 hover:bg-warm-amber/90 transition-colors"
            >
              Vraag een nieuwe link aan
            </Link>
            <Link
              href="/login"
              className="block text-sm text-medium hover:text-heading transition-colors"
            >
              Terug naar inloggen
            </Link>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

export default function EmailBevestigenPage() {
  return (
    <Suspense>
      <EmailBevestigenContent />
    </Suspense>
  );
}
