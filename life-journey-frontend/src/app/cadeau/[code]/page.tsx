"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, Heart, ArrowRight, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

interface GiftCardData {
  code: string;
  recipient_name: string | null;
  personal_message: string | null;
  paid_at: string | null;
}

export default function GiftCardPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [data, setData] = useState<GiftCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/gift-cards/${code}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(setData)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f6f2] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#f8f6f2] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-2">
            Cadeaukaart niet gevonden
          </h1>
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

  const recipientName = data?.recipient_name || "Lieve ontvanger";

  return (
    <div className="min-h-screen bg-[#f8f6f2] py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Print button — hidden when printing */}
        <div className="flex justify-end print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm text-[#888] hover:text-[#1a1a1a] border border-[#e5e0d8] rounded-lg px-3 py-2 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Afdrukken
          </button>
        </div>

        {/* De cadeaukaart */}
        <div className="bg-[#1a1a1a] rounded-3xl overflow-hidden shadow-2xl print:shadow-none">
          {/* Header */}
          <div
            className="px-8 pt-10 pb-6 text-center"
            style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 60%, #1a1a1a 100%)" }}
          >
            <div className="w-16 h-16 bg-[#d4af37]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-[#d4af37]" />
            </div>
            <p className="text-[#d4af37] text-xs tracking-[3px] uppercase font-semibold mb-2">
              Vaderdag Cadeau
            </p>
            <h1 className="font-serif text-white text-3xl font-bold">
              {recipientName}
            </h1>
            <p className="text-[#aaa] text-sm mt-2">Bewaardvoorjou — Levensverhalen voor altijd</p>
          </div>

          {/* Persoonlijke boodschap */}
          {data?.personal_message && (
            <div className="px-8 py-6 border-t border-white/10">
              <p className="text-white/60 text-xs uppercase tracking-widest mb-3">Persoonlijke boodschap</p>
              <p className="text-white text-base leading-relaxed italic">
                "{data.personal_message}"
              </p>
            </div>
          )}

          {/* Wat zit erin */}
          <div className="px-8 py-6 border-t border-white/10">
            <p className="text-white/60 text-xs uppercase tracking-widest mb-4">Dit cadeau bevat</p>
            <div className="space-y-2">
              {[
                "Digitale toegang tot Bewaardvoorjou",
                "AI-gestuurde levensverhaal-interviews in het Nederlands",
                "Audio-opnames bewaren voor toekomstige generaties",
                "Upgrade voucher: €30 korting op De Erfgoed Box (september)",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#d4af37]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-[#d4af37] rounded-full" />
                  </div>
                  <span className="text-white/80 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade voucher code */}
          <div className="px-8 py-6 border-t border-white/10">
            <p className="text-white/60 text-xs uppercase tracking-widest mb-3">Upgradevoucher</p>
            <div className="bg-white/5 border border-[#d4af37]/30 rounded-xl p-4 text-center">
              <p className="text-white/60 text-xs mb-2">Code voor €30 korting op De Erfgoed Box</p>
              <p
                className="font-mono text-[#d4af37] text-2xl font-bold tracking-[4px]"
              >
                {data?.code}
              </p>
              <p className="text-white/40 text-xs mt-2">Geldig t/m september 2026</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-black/20 text-center">
            <p className="text-white/40 text-xs">bewaardvoorjou.nl</p>
          </div>
        </div>

        {/* CTA — verborgen bij printen */}
        <div className="bg-white rounded-2xl border border-[#e5e0d8] p-6 print:hidden">
          <h3 className="font-medium text-[#1a1a1a] mb-2">Klaar om te beginnen?</h3>
          <p className="text-sm text-[#888] mb-4">
            Maak een gratis account aan en begin vandaag nog met je levensverhaal.
          </p>
          <button
            onClick={() => router.push("/register")}
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
