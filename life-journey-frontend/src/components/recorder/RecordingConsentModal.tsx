"use client";

import Link from "next/link";
import { Mic, Video, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecordingConsentModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function RecordingConsentModal({ onAccept, onDecline }: RecordingConsentModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        {/* Sluit-knop */}
        <button
          onClick={onDecline}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Sluiten"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Iconen */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-amber/10">
            <Mic className="h-6 w-6 text-warm-amber" />
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-amber/10">
            <Video className="h-6 w-6 text-warm-amber" />
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
            <ShieldCheck className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <h2 id="consent-title" className="text-xl font-serif font-bold text-slate-900 text-center mb-2">
          Je eerste opname
        </h2>
        <p className="text-sm text-slate-600 text-center mb-5 leading-relaxed">
          Voordat je begint, willen we je kort informeren over hoe wij jouw opname verwerken.
        </p>

        {/* Wat er gebeurt */}
        <div className="space-y-3 mb-6">
          {[
            {
              label: "Opgeslagen in de EU",
              detail: "Jouw audio- en video-opnamen worden beveiligd opgeslagen op Europese servers.",
            },
            {
              label: "AI-transcriptie",
              detail: "Je stem wordt automatisch omgezet naar tekst via Whisper (OpenAI) zodat je verhaal doorzoekbaar wordt.",
            },
            {
              label: "Emotionele hoogtepunten",
              detail: "AI analyseert je tekst op emoties (lach, inzicht, liefde, wijsheid) om hoogtepunten te markeren.",
            },
            {
              label: "Nooit voor training gebruikt",
              detail: "Jouw opnamen worden nooit gebruikt voor het trainen van AI-modellen.",
            },
          ].map(({ label, detail }) => (
            <div key={label} className="flex gap-3">
              <span className="mt-0.5 text-green-500 flex-shrink-0">&#10003;</span>
              <div>
                <span className="text-sm font-semibold text-slate-800">{label}</span>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{detail}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 text-center mb-5">
          Je kunt AI-analyse altijd uitschakelen via{" "}
          <Link href="/instellingen" className="text-warm-amber underline hover:text-warm-amber/80">
            Instellingen
          </Link>
          . Lees onze{" "}
          <Link href="/privacy" target="_blank" className="text-warm-amber underline hover:text-warm-amber/80">
            Privacyverklaring
          </Link>{" "}
          voor alle details.
        </p>

        {/* Knoppen */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={onAccept}
            className="w-full bg-warm-amber hover:bg-warm-amber/90 text-slate-900 font-semibold"
          >
            Begrepen, start mijn opname
          </Button>
          <Button
            onClick={onDecline}
            variant="ghost"
            className="w-full text-slate-500 hover:text-slate-700 text-sm"
          >
            Annuleren
          </Button>
        </div>
      </div>
    </div>
  );
}
