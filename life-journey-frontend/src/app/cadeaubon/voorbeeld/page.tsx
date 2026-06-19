"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { CertificateLayout } from "../CertificateLayout";

const BASE = {
  recipientName: "Opa Piet",
  gifterName: "Vincent",
  subtitle: "Een bijzonder cadeau voor jouw opa",
  personalMessage: "Omdat je zo bijzonder voor mij bent",
  activationUrl: "https://bewaardvoorjou.nl/cadeau/voorbeeld",
};

const VARIANTS = {
  VERHAAL: {
    packageType: "VERHAAL",
    packageName: "Het Verhaal Pakket",
    packageTagline: "Jouw levensverhaal, bewaard voor alle generaties",
    packageFeatures: [
      "Prachtige verhaalthema's & levensfasen: Stap voor stap door vroegste jeugdherinneringen tot de belangrijkste levenswijsheid.",
      "Spreken in plaats van typen: De app luistert naar de stem en zet gesproken woorden direct om in heldere tekst.",
      "Persoonlijke interactieve gids: Warme, AI-begeleide interviews die de mooiste herinneringen organisch naar boven halen.",
      "Automatische 'Highlights': De app herkent zelf de grappigste anekdotes en meest waardevolle levenslessen.",
      "Inclusief media: Voeg eenvoudig foto's, audio- en video-opnames toe om elk verhaal tot leven te brengen.",
    ],
  },
  ERFGOED: {
    packageType: "ERFGOED",
    packageName: "Het Erfgoed Pakket",
    packageTagline: "Een levensverhaal in een prachtige herinneringsdoos",
    packageFeatures: [
      "Alles uit het Verhaal Pakket: Alle digitale functies inclusief AI-begeleide interviews en automatische transcripties.",
      "Luxe herinneringsdoos: Een tastbaar bewijs van een bijzonder leven, om door te geven aan de volgende generatie.",
      "USB-stick met alle opnames: Alle audio- en video-opnames veilig bewaard op een fysieke drager.",
      "Gedrukt fotoboek: Een prachtig vormgegeven boek van 20 pagina's met hoogtepunten uit het verhaal.",
      "10 jaar veilig bewaard: Digitale opslag gegarandeerd voor een heel decennium.",
    ],
  },
  NALATENSCHAP: {
    packageType: "NALATENSCHAP",
    packageName: "Het Nalatenschap Pakket",
    packageTagline: "Een levensverhaal, bewaard voor altijd",
    packageFeatures: [
      "Alles uit het Erfgoed Pakket: De complete fysieke en digitale ervaring, niets uitgezonderd.",
      "Lifetime opslag — nooit meer betalen: Het verhaal blijft bewaard, voor altijd, zonder abonnement.",
      "Uitgebreide familieboom: Koppel verhalen aan familieleden en bouw een levend familiearchief.",
      "Prioriteitsondersteuning: Persoonlijke begeleiding bij elke stap van het vastlegproces.",
    ],
  },
} as const;

type VariantKey = keyof typeof VARIANTS;

export default function CadeaubonVoorbeeld() {
  const [variant, setVariant] = useState<VariantKey>("VERHAAL");
  const certProps = { ...BASE, ...VARIANTS[variant] };

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          html, body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .screen-only { display: none !important; }
        }
      `}</style>

      {/* ── Schermchrome ── */}
      <div className="screen-only bg-[#1e1e1e] py-4 px-4 sticky top-0 z-10 shadow-xl border-b border-white/10">
        <div style={{ maxWidth: "794px", margin: "0 auto" }} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Pakket-toggle */}
            <div className="flex gap-1 bg-white/10 rounded-lg p-1">
              {(Object.keys(VARIANTS) as VariantKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setVariant(k)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    variant === k ? "bg-[#d4af37] text-[#1a1a1a]" : "text-[#aaa] hover:text-white"
                  }`}
                >
                  {k.charAt(0) + k.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <p className="text-[#666] text-xs hidden sm:block">
              Opa Piet · van Vincent
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

      {/* ── Schermpreview ── */}
      <div className="screen-only" style={{ background: "#2a2a2a", padding: "24px 16px", minHeight: "calc(100vh - 60px)" }}>
        <div style={{ maxWidth: "794px", margin: "0 auto", boxShadow: "0 25px 60px rgba(0,0,0,0.6)" }}>
          <CertificateLayout {...certProps} />
        </div>
      </div>

      {/* ── Printversie ── */}
      <div className="hidden print:block">
        <CertificateLayout {...certProps} />
      </div>
    </>
  );
}
