"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { verifyMagicLink, requestMagicLink } from "@/lib/auth-client";
import { useAuth } from "@/store/auth-context";

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
        setTimeout(() => {
          router.push("/vertel");
        }, 1500);
      })
      .catch((err: { message?: string }) => {
        const msg = err?.message ?? "";
        setState(msg.includes("verlopen") ? "expired" : "invalid");
      });
  }, [token, setSession, router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16" style={{ background: "#FAF7F2" }}>
      <div
        className="w-full max-w-md rounded-2xl shadow-lg text-center overflow-hidden"
        style={{ background: "#FFFFFF" }}
      >
        {/* Header */}
        <div
          className="px-8 py-10"
          style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)" }}
        >
          <Image
            src="/Logo_Bewaardvoorjou.png"
            alt="Bewaardvoorjou"
            width={72}
            height={72}
            className="mx-auto mb-4"
            priority
          />
          <h1 className="text-white text-2xl font-semibold">Bewaardvoorjou</h1>
        </div>

        {/* Content */}
        <div className="px-8 py-10">
          {state === "verifying" && (
            <>
              <div className="text-6xl mb-6 animate-pulse">✨</div>
              <h2 className="text-2xl font-serif font-semibold mb-3" style={{ color: "#2C2416" }}>
                Even geduld…
              </h2>
              <p className="text-lg" style={{ color: "#4A4239" }}>
                We openen jouw persoonlijke vertelomgeving.
              </p>
            </>
          )}

          {state === "success" && (
            <>
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-2xl font-serif font-semibold mb-3" style={{ color: "#2C2416" }}>
                Welkom!
              </h2>
              <p className="text-lg" style={{ color: "#4A4239" }}>
                Je wordt nu doorgestuurd naar jouw vertelomgeving…
              </p>
            </>
          )}

          {(state === "invalid" || state === "expired") && (
            <>
              <div className="text-6xl mb-6">{state === "expired" ? "⏰" : "😕"}</div>
              <h2 className="text-2xl font-serif font-semibold mb-3" style={{ color: "#2C2416" }}>
                {state === "expired" ? "Link verlopen" : "Ongeldige link"}
              </h2>
              <p className="text-lg mb-6" style={{ color: "#4A4239" }}>
                {state === "expired"
                  ? "Deze uitnodigingslink is verlopen. Vul je e-mailadres in en we sturen je een nieuwe link."
                  : "Deze uitnodigingslink is ongeldig of al eerder gebruikt. Heb je al een account? Vraag een nieuwe toegangslink aan."}
              </p>

              {newLinkSent ? (
                <div
                  className="rounded-xl p-4 text-sm text-center mb-4"
                  style={{ background: "#FFF7ED", border: "1px solid #F97316" }}
                >
                  <p className="font-semibold mb-1" style={{ color: "#2C2416" }}>Controleer je inbox</p>
                  <p style={{ color: "#4A4239" }}>
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
                    className="w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "#D4C9B8",
                      background: "#FAF7F2",
                      color: "#2C2416",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isSendingNewLink || !newLinkEmail}
                    className="block w-full rounded-xl px-6 py-4 text-center font-semibold text-white transition-opacity disabled:opacity-50"
                    style={{ background: "#F97316" }}
                  >
                    {isSendingNewLink ? "Bezig met versturen…" : "Stuur nieuwe toegangslink"}
                  </button>
                </form>
              )}

              <Link
                href="/login"
                className="text-sm"
                style={{ color: "#9C8B77" }}
              >
                Inloggen met wachtwoord →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
