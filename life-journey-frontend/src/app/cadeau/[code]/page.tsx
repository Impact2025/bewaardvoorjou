"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, Heart, ArrowRight, Loader2, Play, Mail, CheckCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getGiftRedemption, startGiftRedemption, type GiftRedemption } from "@/lib/api/orders";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

interface LegacyGiftCardData {
  code: string;
  recipient_name: string | null;
  personal_message: string | null;
  paid_at: string | null;
}

type LoadState =
  | { kind: "loading" }
  | { kind: "redemption"; data: GiftRedemption }
  | { kind: "legacy"; data: LegacyGiftCardData }
  | { kind: "notfound" };

const RELATION_LABEL: Record<string, string> = {
  vader: "vader",
  moeder: "moeder",
  opa: "opa",
  oma: "oma",
  schoonouder: "schoonouder",
  partner: "partner",
  anders: "dierbare",
};

export default function GiftCardPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setPageUrl(window.location.href);
  }, []);

  useEffect(() => {
    let active = true;
    // 1) Probeer de universele redemption-token (alle pakketten).
    getGiftRedemption(code)
      .then((data) => active && setState({ kind: "redemption", data }))
      .catch(() => {
        // 2) Val terug op de legacy digitale cadeaukaart.
        fetch(`${API_BASE}/gift-cards/${code}`)
          .then((r) => {
            if (!r.ok) throw new Error("not found");
            return r.json();
          })
          .then((data: LegacyGiftCardData) => active && setState({ kind: "legacy", data }))
          .catch(() => active && setState({ kind: "notfound" }));
      });
    return () => {
      active = false;
    };
  }, [code]);

  if (state.kind === "loading") {
    return (
      <div className="min-h-screen bg-[#f8f6f2] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  if (state.kind === "notfound") {
    return (
      <div className="min-h-screen bg-[#f8f6f2] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-2">Cadeau niet gevonden</h1>
          <p className="text-[#888] text-sm mb-6">
            Deze link is ongeldig of de betaling is nog niet verwerkt.
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-[#888] underline hover:text-[#1a1a1a]"
          >
            Terug naar de homepage
          </button>
        </div>
      </div>
    );
  }

  if (state.kind === "legacy") {
    return <LegacyGiftCard data={state.data} onStart={() => router.push("/register")} />;
  }

  return <RedemptionExperience data={state.data} token={code} pageUrl={pageUrl} />;
}

// ─── De ontgrendelervaring (bericht speelt eerst, dan beginnen) ───────────────

function RedemptionExperience({
  data,
  token,
  pageUrl,
}: {
  data: GiftRedemption;
  token: string;
  pageUrl: string;
}) {
  const name = data.recipient_name || "Lieve ontvanger";
  const gifter = data.gifter_name || "iemand die van je houdt";

  return (
    <div className="min-h-screen bg-[#f8f6f2] py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-lg mx-auto space-y-6">
        {/* ── Schermweergave: de reveal voor de ontvanger ── */}
        <div className="print:hidden space-y-6">
          {/* Hero */}
          <div className="text-center pt-6">
            <div className="w-14 h-14 bg-[#d4af37]/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-7 w-7 text-[#d4af37]" />
            </div>
            <p className="text-[#d4af37] text-xs tracking-[3px] uppercase font-semibold mb-2">
              Een cadeau van {gifter}
            </p>
            <h1 className="font-serif text-3xl font-bold text-[#1a1a1a]">Dag {name}</h1>
            <p className="text-[#888] text-sm mt-2">
              Iemand die van je houdt wil jouw levensverhaal bewaren. Eerst een persoonlijk bericht.
            </p>
          </div>

          {/* Het persoonlijke bericht — als eerste */}
          <PersonalMessage data={data} gifter={gifter} />

          {/* CTA — start zonder wachtwoord via magic link */}
          <StartForm token={token} name={name} gifterName={gifter} />

          {/* Print de startkaart (voor de gever) */}
          <div className="text-center">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 text-sm text-[#888] hover:text-[#1a1a1a] border border-[#e5e0d8] rounded-lg px-4 py-2 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print de startkaart om te overhandigen
            </button>
          </div>
        </div>

        {/* ── Printweergave: de startkaart met QR ── */}
        <PrintableStartCard name={name} gifter={gifter} cardMessage={data.card_message} pageUrl={pageUrl} />
      </div>
    </div>
  );
}

function StartForm({ token, name, gifterName }: { token: string; name: string; gifterName: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const addressed = !!name && name !== "Lieve ontvanger";
  const giver = gifterName && gifterName !== "iemand die van je houdt" ? gifterName : null;

  const submit = async () => {
    if (!valid) return;
    setStatus("sending");
    setError(null);
    try {
      await startGiftRedemption(token, email);
      setStatus("sent");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Er ging iets mis, probeer opnieuw.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="bg-[#f0f7eb] rounded-2xl border border-[#2d5016]/30 p-6 text-center">
        <CheckCircle className="h-10 w-10 text-[#2d5016] mx-auto mb-3" />
        <h3 className="font-serif text-xl font-bold text-[#1a1a1a] mb-1">Controleer je e-mail</h3>
        <p className="text-sm text-[#555]">
          We hebben je een link gestuurd naar <span className="font-medium">{email}</span>. Klik erop
          en je begint direct — geen wachtwoord nodig. Kijk ook even in je spam-map.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Noot voor de gever — prominent, duidelijk gescheiden van het ontvangerformulier */}
      <div className="bg-[#faf9f7] rounded-2xl border border-[#e5e0d8] p-4 flex gap-3 items-start">
        <div className="w-8 h-8 bg-[#d4af37]/15 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <Heart className="h-4 w-4 text-[#d4af37]" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-[#1a1a1a]">
            {giver ? `Ben jij ${giver}, de gever?` : "Ben jij degene die dit cadeau geeft?"}
          </p>
          <p className="text-xs text-[#888] mt-0.5 leading-relaxed">
            Dan hoef je hier niets in te vullen.{" "}
            {addressed ? name : "De ontvanger"} vult dit zelf in wanneer hij of zij het cadeau opent.
            Stuur deze link door, of overhandig de cadeaubon die je al hebt ontvangen.
          </p>
        </div>
      </div>

      {/* Formulier voor de ontvanger */}
      <div className="bg-white rounded-2xl border border-[#e5e0d8] p-6 text-center">
        <h3 className="font-serif text-xl font-bold text-[#1a1a1a] mb-1">
          {addressed ? `Ben jij ${name}? Begin hier` : "Klaar om te beginnen?"}
        </h3>
        <p className="text-sm text-[#888] mb-4">
          Vul je e-mailadres in — we sturen je een persoonlijke link om direct te starten.
          Geen wachtwoord, geen app.
        </p>
        <div className="space-y-2">
          <div className="relative">
            <Mail className="h-4 w-4 text-[#aaa] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="jouw@email.nl"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className="w-full border border-[#e5e0d8] rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
            />
          </div>
          <button
            onClick={submit}
            disabled={!valid || status === "sending"}
            className="w-full bg-[#2d5016] text-white font-semibold py-3.5 rounded-xl hover:bg-[#3a6620] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === "sending" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Begin mijn verhaal
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
          {error && <p className="text-xs text-[#e04040]">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function PersonalMessage({ data, gifter }: { data: GiftRedemption; gifter: string }) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [videoError, setVideoError] = useState(false);

  if (data.message_media_type === "video" && data.message_media_url) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-lg">
        {videoError ? (
          <div className="p-6 text-center text-[#aaa] text-sm">
            <p className="mb-1">Het videobericht kon niet worden geladen.</p>
            <p>Neem contact op via <span className="text-[#d4af37]">support@bewaardvoorjou.nl</span></p>
          </div>
        ) : (
          <video
            src={data.message_media_url}
            controls
            playsInline
            className="w-full"
            onError={() => setVideoError(true)}
          />
        )}
        <Transcript
          status={data.message_status}
          transcript={data.message_transcript}
          show={showTranscript}
          onToggle={() => setShowTranscript((v) => !v)}
        />
      </div>
    );
  }

  if (data.message_media_type === "audio" && data.message_media_url) {
    return (
      <div className="bg-white rounded-2xl border border-[#e5e0d8] p-6">
        <div className="flex items-center gap-2 mb-3 text-[#8B6914]">
          <Play className="h-4 w-4" />
          <span className="text-xs uppercase tracking-widest font-semibold">Bericht van {gifter}</span>
        </div>
        <audio src={data.message_media_url} controls className="w-full" />
        <Transcript
          status={data.message_status}
          transcript={data.message_transcript}
          show={showTranscript}
          onToggle={() => setShowTranscript((v) => !v)}
        />
      </div>
    );
  }

  if (data.personal_message) {
    return (
      <div className="bg-white rounded-2xl border border-[#d4af37]/40 p-6">
        <p className="text-xs uppercase tracking-widest text-[#8B6914] font-semibold mb-3">
          Bericht van {gifter}
        </p>
        <p className="text-[#1a1a1a] text-lg leading-relaxed italic font-serif">
          &ldquo;{data.personal_message}&rdquo;
        </p>
      </div>
    );
  }

  return null;
}

function Transcript({
  status,
  transcript,
  show,
  onToggle,
}: {
  status: string | null;
  transcript: string | null;
  show: boolean;
  onToggle: () => void;
}) {
  if (status === "pending") {
    return (
      <div className="px-5 py-3 text-xs text-[#aaa] flex items-center gap-2">
        <Loader2 className="h-3 w-3 animate-spin" /> Meeleesversie wordt voorbereid…
      </div>
    );
  }
  if (!transcript) return null;
  return (
    <div className="px-5 py-3 border-t border-white/10">
      <button onClick={onToggle} className="text-xs text-[#d4af37] hover:underline">
        {show ? "Verberg meelezen" : "Lees mee"}
      </button>
      {show && <p className="text-sm text-white/80 leading-relaxed mt-2 italic">&ldquo;{transcript}&rdquo;</p>}
    </div>
  );
}

function PrintableStartCard({
  name,
  gifter,
  cardMessage,
  pageUrl,
}: {
  name: string;
  gifter: string;
  cardMessage: string | null;
  pageUrl: string;
}) {
  return (
    <div className="hidden print:block">
      <div className="border-2 border-[#1a1a1a] rounded-2xl p-10 text-center max-w-md mx-auto">
        <p className="text-xs tracking-[3px] uppercase font-semibold mb-3">Een cadeau van {gifter}</p>
        <h1 className="font-serif text-4xl font-bold mb-4">Voor {name}</h1>
        {cardMessage && <p className="text-base italic mb-6 leading-relaxed">&ldquo;{cardMessage}&rdquo;</p>}
        <div className="flex justify-center my-6">
          {pageUrl && <QRCodeSVG value={pageUrl} size={160} level="M" />}
        </div>
        <p className="text-sm font-medium">Scan om je verhaal te openen</p>
        <p className="text-xs text-[#555] mt-1">of ga naar bewaardvoorjou.nl</p>
        <div className="mt-6 pt-4 border-t border-[#ddd]">
          <p className="text-xs text-[#888]">Bewaardvoorjou — Levensverhalen voor altijd</p>
        </div>
      </div>
    </div>
  );
}

// ─── Legacy digitale cadeaukaart (DIGITAAL voucher) ───────────────────────────

function LegacyGiftCard({ data, onStart }: { data: LegacyGiftCardData; onStart: () => void }) {
  const recipientName = data.recipient_name || "Lieve ontvanger";
  return (
    <div className="min-h-screen bg-[#f8f6f2] py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex justify-end print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm text-[#888] hover:text-[#1a1a1a] border border-[#e5e0d8] rounded-lg px-3 py-2 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Afdrukken
          </button>
        </div>

        <div className="bg-[#1a1a1a] rounded-3xl overflow-hidden shadow-2xl print:shadow-none">
          <div
            className="px-8 pt-10 pb-6 text-center"
            style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 60%, #1a1a1a 100%)" }}
          >
            <div className="w-16 h-16 bg-[#d4af37]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-[#d4af37]" />
            </div>
            <h1 className="font-serif text-white text-3xl font-bold">{recipientName}</h1>
            <p className="text-[#aaa] text-sm mt-2">Bewaardvoorjou — Levensverhalen voor altijd</p>
          </div>

          {data.personal_message && (
            <div className="px-8 py-6 border-t border-white/10">
              <p className="text-white/60 text-xs uppercase tracking-widest mb-3">Persoonlijke boodschap</p>
              <p className="text-white text-base leading-relaxed italic">&ldquo;{data.personal_message}&rdquo;</p>
            </div>
          )}

          <div className="px-8 py-6 bg-black/20 text-center">
            <p className="text-white/40 text-xs">bewaardvoorjou.nl</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e5e0d8] p-6 print:hidden">
          <h3 className="font-medium text-[#1a1a1a] mb-2">Klaar om te beginnen?</h3>
          <p className="text-sm text-[#888] mb-4">
            Maak een gratis account aan en begin vandaag nog met je levensverhaal.
          </p>
          <button
            onClick={onStart}
            className="w-full bg-[#2d5016] text-white font-semibold py-3 rounded-xl hover:bg-[#3a6620] transition-colors flex items-center justify-center gap-2"
          >
            Begin mijn verhaal
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
