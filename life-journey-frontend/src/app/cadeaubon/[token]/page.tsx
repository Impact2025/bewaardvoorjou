"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer, Loader2 } from "lucide-react";
import { getGiftRedemption, type GiftRedemption } from "@/lib/api/orders";
import { CertificateLayout } from "../CertificateLayout";

const PACKAGE_CONTENT: Record<string, { name: string; tagline: string; features: string[] }> = {
  VERHAAL: {
    name: "Het Verhaal Pakket",
    tagline: "Jouw levensverhaal, bewaard voor alle generaties",
    features: [
      "58 verhaalthema's door 7 levensfasen",
      "Persoonlijke AI-begeleide interviews",
      "Audio- en video-opnames",
      "Automatische transcripties in tekst",
      "5 jaar veilig bewaard",
    ],
  },
  ERFGOED: {
    name: "Het Erfgoed Pakket",
    tagline: "Een levensverhaal in een prachtige herinneringsdoos",
    features: [
      "Alles uit het Verhaal Pakket",
      "Luxe herinneringsdoos",
      "USB-stick met alle opnames",
      "Gedrukt fotoboek (20 pagina's)",
      "10 jaar veilig bewaard",
    ],
  },
  NALATENSCHAP: {
    name: "Het Nalatenschap Pakket",
    tagline: "Een levensverhaal, bewaard voor altijd",
    features: [
      "Alles uit het Erfgoed Pakket",
      "Lifetime opslag — nooit meer betalen",
      "Uitgebreide familieboom",
      "Prioriteitsondersteuning",
    ],
  },
};

const RELATION_SUBTITLE: Record<string, string> = {
  vader: "Een bijzonder cadeau voor jouw vader",
  moeder: "Een bijzonder cadeau voor jouw moeder",
  opa: "Een bijzonder cadeau voor jouw opa",
  oma: "Een bijzonder cadeau voor jouw oma",
  schoonouder: "Een bijzonder cadeau voor jouw schoonouder",
  partner: "Een bijzonder cadeau voor jouw partner",
  anders: "Een bijzonder cadeau voor iemand die je dierbaar is",
};

export default function CadeaubonPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<GiftRedemption | null>(null);
  const [error, setError] = useState(false);
  const [activationUrl, setActivationUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActivationUrl(`${window.location.origin}/cadeau/${token}`);
    }
  }, [token]);

  useEffect(() => {
    getGiftRedemption(token)
      .then(setData)
      .catch(() => setError(true));
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f6f2] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-2">
            Cadeaubon niet gevonden
          </h1>
          <p className="text-[#888] text-sm">
            Controleer de link of neem contact op via hallo@bewaardvoorjou.nl.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f8f6f2] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  const content = PACKAGE_CONTENT[data.package_type] ?? PACKAGE_CONTENT.VERHAAL;
  const recipientName = data.recipient_name || "de ontvanger";
  const gifterName = data.gifter_name || "iemand die van je houdt";
  const subtitle = data.recipient_relation
    ? (RELATION_SUBTITLE[data.recipient_relation] ?? "Een bijzonder cadeau voor iemand die je dierbaar is")
    : null;

  const certProps = {
    recipientName,
    gifterName,
    subtitle,
    packageType: data.package_type,
    packageName: content.name,
    packageTagline: content.tagline,
    packageFeatures: content.features,
    personalMessage: data.personal_message,
    activationUrl,
  };

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          html, body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .screen-only { display: none !important; }
        }
      `}</style>

      <div className="screen-only bg-[#222] py-4 px-4 sticky top-0 z-10 shadow-xl border-b border-white/10">
        <div style={{ maxWidth: "794px", margin: "0 auto" }} className="flex items-center justify-between gap-4">
          <div>
            <p className="text-white text-sm font-semibold tracking-tight">
              Cadeaubon voor {recipientName}
            </p>
            <p className="text-[#888] text-xs mt-0.5">
              Afdrukken &rarr; &ldquo;Opslaan als PDF&rdquo; voor een perfecte A4
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-[#d4af37] hover:bg-[#c49e2a] text-[#1a1a1a] font-bold px-5 py-2.5 rounded-xl transition-colors flex-shrink-0 text-sm"
          >
            <Printer className="h-4 w-4" />
            Afdrukken als PDF
          </button>
        </div>
      </div>

      <div className="screen-only" style={{ background: "#2a2a2a", padding: "24px 16px", minHeight: "calc(100vh - 60px)" }}>
        <div style={{ maxWidth: "794px", margin: "0 auto", boxShadow: "0 25px 60px rgba(0,0,0,0.6)" }}>
          <CertificateLayout {...certProps} />
        </div>
      </div>

      <div className="hidden print:block">
        <CertificateLayout {...certProps} />
      </div>
    </>
  );
}
