"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { resendVerification } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function EmailVerificatieContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleResend() {
    if (!email || status === "sending" || status === "sent") return;
    setStatus("sending");
    try {
      await resendVerification(email);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

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
          <CardTitle className="text-2xl text-heading font-serif">Controleer je inbox</CardTitle>
          <CardDescription className="text-medium">
            We hebben een verificatielink gestuurd naar{" "}
            {email ? (
              <strong className="text-heading">{email}</strong>
            ) : (
              "jouw e-mailadres"
            )}
            . Klik op de link in de e-mail om je account te activeren.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-medium">
            De link is <strong>24 uur geldig</strong>. Kijk ook in je spam- of ongewenste e-mailmap.
          </p>

          <div className="border-t border-border pt-4">
            <p className="text-sm text-medium mb-3">Geen e-mail ontvangen?</p>

            {status === "sent" ? (
              <p className="text-sm text-green-600 font-medium">
                Verificatielink opnieuw verstuurd. Controleer je inbox.
              </p>
            ) : status === "error" ? (
              <p className="text-sm text-coral">
                Er ging iets mis. Probeer het later opnieuw.
              </p>
            ) : (
              <Button
                variant="ghost"
                className="w-full border border-input-border"
                onClick={handleResend}
                disabled={status === "sending" || !email}
              >
                {status === "sending" ? "Versturen..." : "Stuur verificatielink opnieuw"}
              </Button>
            )}
          </div>

          <p className="text-sm text-medium pt-2">
            Verkeerd e-mailadres gebruikt?{" "}
            <Link href="/register" className="text-warm-amber hover:text-warm-amber/80 font-medium">
              Maak een nieuw account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EmailVerificatiePage() {
  return (
    <Suspense>
      <EmailVerificatieContent />
    </Suspense>
  );
}
