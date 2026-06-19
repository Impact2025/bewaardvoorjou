"use client";

import { Printer } from "lucide-react";
import { CertificateLayout } from "../CertificateLayout";

const DEMO = {
  recipientName: "Opa Piet",
  gifterName: "Vincent",
  subtitle: "Een bijzonder cadeau voor jouw opa",
  packageName: "Het Verhaal Pakket",
  packageTagline: "Jouw levensverhaal, bewaard voor alle generaties",
  packageFeatures: [
    "58 verhaalthema's door 7 levensfasen",
    "Persoonlijke AI-begeleide interviews",
    "Audio- en video-opnames",
    "Automatische transcripties in tekst",
    "5 jaar veilig bewaard",
  ],
  personalMessage: "Omdat je zo bijzonder voor mij bent",
  activationUrl: "https://bewaardvoorjou.nl/cadeau/voorbeeld",
};

export default function CadeaubonVoorbeeld() {
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
              Voorbeeld — Opa Piet, van Vincent
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
          <CertificateLayout {...DEMO} />
        </div>
      </div>

      <div className="hidden print:block">
        <CertificateLayout {...DEMO} />
      </div>
    </>
  );
}
