"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookImage, Check, Loader2, ExternalLink, Lock } from "lucide-react";
import { getPhotobookStatus, claimPhotobookVoucher, type PhotobookVoucherStatus } from "@/lib/api/baby";
import { useBabyTheme } from "@/components/baby/BabyThemeContext";

const PHOTOBOOK_STEPS = [
  {
    step: "1",
    title: "Claim je voucher",
    body: "Klik op de knop hieronder. We sturen je direct een e-mail met jouw persoonlijke vouchercode.",
  },
  {
    step: "2",
    title: "Kies je drukker",
    body: "Gebruik de vouchercode bij Albelli, Cheerz of een andere partner-drukker. Kies het formaat dat bij jullie past.",
  },
  {
    step: "3",
    title: "Upload je babyboek",
    body: "Exporteer je verhalen en foto's als PDF vanuit het dashboard en upload ze bij de drukker.",
  },
  {
    step: "4",
    title: "Ontvang het boek thuis",
    body: "Binnen 7-10 werkdagen ligt het boek bij jullie op de mat. Een erfstuk voor generaties.",
  },
];

export default function PhotobookPage() {
  const router = useRouter();
  const { t } = useBabyTheme();
  const [status, setStatus] = useState<PhotobookVoucherStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const s = await getPhotobookStatus();
      setStatus(s);
      if (s.claimed) setClaimed(true);
    } catch {
      router.push("/voor-baby/dashboard");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const handleClaim = async () => {
    if (!status?.eligible_to_claim) return;
    setClaiming(true);
    setError(null);
    try {
      const updated = await claimPhotobookVoucher();
      setStatus(updated);
      setClaimed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Er ging iets mis. Probeer opnieuw.");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${t.primaryBg} flex items-center justify-center`}>
        <Loader2 className={`w-7 h-7 ${t.primaryText} animate-spin`} />
      </div>
    );
  }

  if (!status) return null;

  const pct = status.progress_pct;
  const remaining = status.milestones_total - status.milestones_completed;

  return (
    <div className={`min-h-screen ${t.primaryBg}`}>
      {/* Header */}
      <div className={`bg-white border-b ${t.primaryBorder} px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm`}>
        <Link href="/voor-baby/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-bold text-gray-900">Fotoboek-voucher</span>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">

        {/* Hero kaart */}
        {claimed ? (
          /* ── Geclaimed ── */
          <div className={`${t.quoteSection} rounded-3xl p-8 text-center text-white shadow-md`}>
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold mb-2">Voucher geclaimed!</h1>
            <p className="text-white/80 text-sm leading-relaxed">
              Gefeliciteerd — je hebt het eerste jaar van je kindje volledig vastgelegd.
              Bekijk je e-mail voor de vouchercode en de instructies.
            </p>
          </div>
        ) : status.eligible_to_claim ? (
          /* ── Eligible ── */
          <div className={`${t.quoteSection} rounded-3xl p-8 text-center text-white shadow-md`}>
            <div className="text-5xl mb-4">📖</div>
            <h1 className="text-2xl font-bold mb-2">Je fotoboek is verdiend!</h1>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              Je hebt alle 12 maandelijkse hoofdstukken voltooid. Een heel jaar
              vastgelegd — dat verdient een tastbaar erfstuk.
            </p>
            {error && (
              <p className="text-red-200 text-sm bg-red-900/20 rounded-xl px-4 py-3 mb-4">{error}</p>
            )}
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60"
            >
              {claiming
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <><BookImage className="w-5 h-5" /> Claim je fotoboek-voucher</>
              }
            </button>
          </div>
        ) : (
          /* ── In progress ── */
          <div className={`bg-white rounded-3xl border ${t.primaryBorder} p-6 shadow-sm`}>
            <div className="flex items-center gap-4 mb-5">
              <div className={`w-14 h-14 ${t.primaryBgMedium} rounded-2xl flex items-center justify-center shrink-0`}>
                <Lock className={`w-6 h-6 ${t.primaryText}`} />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-lg">Fotoboek-voucher</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Voltooi alle 12 maand-hoofdstukken om te claimen
                </p>
              </div>
            </div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-500">{status.milestones_completed} / {status.milestones_total} maanden voltooid</span>
              <span className={`font-bold ${t.primaryText}`}>{pct}%</span>
            </div>
            <div className={`h-3 ${t.primaryBgMedium} rounded-full overflow-hidden`}>
              <div
                className={`h-full ${t.timelineDot} rounded-full transition-all`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-gray-400 text-center">
              Nog {remaining} {remaining === 1 ? "maand" : "maanden"} te gaan
            </p>
          </div>
        )}

        {/* Hoe het werkt */}
        <div className={`bg-white rounded-3xl border ${t.primaryBorder} p-6 shadow-sm`}>
          <h2 className="font-bold text-gray-900 mb-5">Hoe werkt de voucher?</h2>
          <div className="space-y-5">
            {PHOTOBOOK_STEPS.map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className={`w-8 h-8 ${t.primary} text-white rounded-xl flex items-center justify-center text-sm font-bold shrink-0`}>
                  {claimed && parseInt(item.step) <= 1
                    ? <Check className="w-4 h-4" />
                    : item.step
                  }
                </div>
                <div className="pt-1">
                  <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partnerlinks (na claim) */}
        {claimed && (
          <div className={`bg-white rounded-3xl border ${t.primaryBorder} p-6 shadow-sm`}>
            <h2 className="font-bold text-gray-900 mb-4">Kies je drukker</h2>
            <div className="space-y-3">
              {[
                { name: "Albelli", desc: "Hardcover fotoboeken · Bezorging in NL & BE", url: "https://www.albelli.nl" },
                { name: "Cheerz", desc: "Premium fotoboeken · Trendy lay-outs", url: "https://www.cheerz.com" },
                { name: "Hema Fotoservice", desc: "Betaalbare optie · Afhalen in de winkel", url: "https://www.hema.nl/fotoservice" },
              ].map((partner) => (
                <a
                  key={partner.name}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between p-4 rounded-xl border ${t.primaryBorder} hover:${t.primaryBg} transition-colors group`}
                >
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{partner.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{partner.desc}</p>
                  </div>
                  <ExternalLink className={`w-4 h-4 text-gray-300 group-hover:${t.primaryText} transition-colors shrink-0`} />
                </a>
              ))}
            </div>
            <p className="mt-4 text-xs text-gray-400 text-center">
              Gebruik de vouchercode uit je e-mail bij de afrekenpagina.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
