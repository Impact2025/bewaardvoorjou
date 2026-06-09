"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { verifyMagicLink, requestMagicLink } from "@/lib/auth-client";
import { useAuth } from "@/store/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type VerifyState = "verifying" | "success" | "invalid" | "expired";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function UitnodigingPage({ params }: PageProps) {
  const { token } = use(params);
  const router = useRouter();
  const { setSession } = useAuth();
  const [state, setState] = useState<VerifyState>("verifying");
  const [newLinkEmail, setNewLinkEmail] = useState("");
  const [isSendingNewLink, setIsSendingNewLink] = useState(false);
  const [newLinkSent, setNewLinkSent] = useState(false);

  async function handleRequestNewLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSendingNewLink(true);
    try {
      await requestMagicLink(newLinkEmail);
    } finally {
      setIsSendingNewLink(false);
      setNewLinkSent(true);
    }
  }

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }

    verifyMagicLink(token)
      .then((session) => {
        setSession(session);
        setState("success");
        const destination = session.primaryJourneyId ? "/vertel" : "/onboarding";
        setTimeout(() => {
          router.push(destination);
        }, 1800);
      })
      .catch((err: { message?: string }) => {
        const msg = err?.message ?? "";
        setState(msg.includes("verlopen") ? "expired" : "invalid");
      });
  }, [token, setSession, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
      <Card className="w-full max-w-md border-card bg-card shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/Logo_Bewaardvoorjou.png"
              alt="Bewaardvoorjou"
              width={80}
              height={80}
              className="w-20 h-20"
              priority
            />
          </div>

          {state === "verifying" && (
            <>
              <CardTitle className="text-2xl text-heading font-serif">Even geduld…</CardTitle>
              <CardDescription className="text-medium">
                We openen jouw persoonlijke omgeving.
              </CardDescription>
            </>
          )}

          {state === "success" && (
            <>
              <CardTitle className="text-2xl text-heading font-serif">Welkom! 🎉</CardTitle>
              <CardDescription className="text-medium">
                Je bent ingelogd. We zetten alles klaar voor je.
              </CardDescription>
            </>
          )}

          {state === "invalid" && (
            <>
              <CardTitle className="text-2xl text-heading font-serif">Ongeldige link</CardTitle>
              <CardDescription className="text-medium">
                Deze uitnodigingslink is ongeldig of al eerder gebruikt. Heb je al een account? Vraag een nieuwe toegangslink aan.
              </CardDescription>
            </>
          )}

          {state === "expired" && (
            <>
              <CardTitle className="text-2xl text-heading font-serif">Link verlopen</CardTitle>
              <CardDescription className="text-medium">
                Deze uitnodigingslink is verlopen. Vul je e-mailadres in en we sturen je een nieuwe link.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {state === "verifying" && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-warm-amber" />
            </div>
          )}

          {state === "success" && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-warm-amber" />
            </div>
          )}

          {(state === "invalid" || state === "expired") && (
            <>
              {newLinkSent ? (
                <div className="rounded-xl border border-warm-amber/40 bg-warm-amber/10 p-4 text-sm text-center mb-4">
                  <p className="font-medium text-heading mb-1">Controleer je inbox</p>
                  <p className="text-medium">
                    Als dit e-mailadres bij ons bekend is, ontvang je een nieuwe toegangslink.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequestNewLink} className="space-y-3 mb-4">
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="jouw@email.nl"
                    value={newLinkEmail}
                    onChange={(e) => setNewLinkEmail(e.target.value)}
                    className="w-full rounded-xl border border-input-border bg-input-background px-4 py-3 text-input shadow-inner focus:border-input-focus focus:outline-none focus:ring-2 focus:ring-warm-amber/40"
                  />
                  <Button
                    type="submit"
                    className="w-full justify-center bg-warm-amber hover:bg-warm-amber/90 text-slate-900"
                    disabled={isSendingNewLink || !newLinkEmail}
                  >
                    {isSendingNewLink ? "Bezig met versturen…" : "Stuur nieuwe toegangslink"}
                  </Button>
                </form>
              )}

              <p className="text-center text-sm text-medium mt-2">
                <Link href="/login" className="text-warm-amber hover:text-warm-amber/80 font-medium">
                  Inloggen met wachtwoord →
                </Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
