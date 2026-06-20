"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Check, Loader2, Send, UserCheck, Clock } from "lucide-react";
import { getMyBabyJourney, invitePartner, type BabyJourneyWithProgress } from "@/lib/api/baby";
import { useBabyTheme } from "@/components/baby/BabyThemeContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PartnerPage() {
  const router = useRouter();
  const { t } = useBabyTheme();
  const [journey, setJourney] = useState<BabyJourneyWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const j = await getMyBabyJourney();
      setJourney(j);
      if (j.partner_email) setEmail(j.partner_email);
    } catch {
      router.push("/voor-baby/dashboard");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const handleInvite = async () => {
    if (!EMAIL_RE.test(email)) return;
    setSending(true);
    setError(null);
    try {
      await invitePartner(email);
      setSent(true);
      setJourney((prev) => prev ? { ...prev, partner_email: email } : prev);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Er ging iets mis. Probeer opnieuw.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${t.primaryBg} flex items-center justify-center`}>
        <Loader2 className={`w-7 h-7 ${t.primaryText} animate-spin`} />
      </div>
    );
  }

  if (!journey) return null;

  const hasPartner = !!journey.partner_email;
  const partnerJoined = !!journey.partner_joined_at;

  return (
    <div className={`min-h-screen ${t.primaryBg}`}>
      {/* Header */}
      <div className={`bg-white border-b ${t.primaryBorder} px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm`}>
        <Link href="/voor-baby/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-bold text-gray-900">Partner</span>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">

        {/* Status kaart */}
        {partnerJoined ? (
          <div className={`bg-white rounded-3xl border ${t.primaryBorder} p-6 shadow-sm`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${t.primary} rounded-2xl flex items-center justify-center shrink-0`}>
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Partner schrijft mee</h2>
                <p className="text-sm text-gray-500 mt-0.5">{journey.partner_email}</p>
              </div>
              <Check className={`w-5 h-5 ${t.checkColor} ml-auto shrink-0`} />
            </div>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              De partner heeft de uitnodiging geaccepteerd en schrijft mee in het babyboek van <strong>{journey.baby_name}</strong>.
              Jullie verhalen worden bewaard naast elkaar — twee perspectieven op hetzelfde jaar.
            </p>
          </div>
        ) : hasPartner ? (
          <div className={`bg-white rounded-3xl border ${t.primaryBorder} p-6 shadow-sm`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${t.primaryBgMedium} rounded-2xl flex items-center justify-center shrink-0`}>
                <Clock className={`w-6 h-6 ${t.primaryText}`} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Uitnodiging verstuurd</h2>
                <p className={`text-sm ${t.primaryText} mt-0.5`}>{journey.partner_email}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              De partner heeft nog niet gereageerd. We hebben een e-mail gestuurd naar <strong>{journey.partner_email}</strong>.
              Staat-ie misschien in de spam? Je kunt de uitnodiging hieronder opnieuw sturen.
            </p>
          </div>
        ) : (
          <div className={`bg-white rounded-3xl border ${t.primaryBorder} p-6 shadow-sm`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 ${t.primary} rounded-2xl flex items-center justify-center shrink-0`}>
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Nodig de partner uit</h2>
                <p className="text-sm text-gray-500 mt-0.5">Twee verhalen, één compleet babyboek</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              De partner schrijft mee vanuit <em>zijn of haar eigen perspectief</em>. De vragen zijn speciaal aangepast
              — zo ontstaan twee unieke verhalen over hetzelfde jaar van <strong>{journey.baby_name}</strong>.
            </p>
          </div>
        )}

        {/* Wat de partner krijgt */}
        {!partnerJoined && (
          <div className={`bg-white rounded-3xl border ${t.primaryBorder} p-6 shadow-sm`}>
            <h3 className="font-semibold text-gray-900 mb-4">Wat de partner krijgt</h3>
            <ul className="space-y-3">
              {[
                { emoji: "✍️", text: "Eigen vragen, geschreven vanuit het partner-perspectief" },
                { emoji: "📅", text: "Dezelfde wekelijkse herinneringen in de inbox" },
                { emoji: "🏅", text: "Mijlpalen markeren op het moment zelf" },
                { emoji: "📖", text: "Zijn/haar verhalen worden bewaard naast die van jou" },
              ].map(({ emoji, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="text-base shrink-0">{emoji}</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Uitnodigingsformulier */}
        {!partnerJoined && (
          <div className={`bg-white rounded-3xl border ${t.primaryBorder} p-6 shadow-sm`}>
            <h3 className="font-semibold text-gray-900 mb-4">
              {hasPartner ? "Uitnodiging opnieuw sturen" : "Uitnodiging sturen"}
            </h3>

            {sent ? (
              <div className={`flex items-center gap-3 p-4 ${t.primaryBg} rounded-2xl`}>
                <Check className={`w-5 h-5 ${t.checkColor} shrink-0`} />
                <div>
                  <p className={`font-semibold ${t.primaryText} text-sm`}>Uitnodiging verstuurd!</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {email} ontvangt direct een e-mail met een activatielink.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    E-mailadres partner
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    placeholder="partner@email.nl"
                    className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ${t.inputRing} ${
                      email && !EMAIL_RE.test(email) ? "border-red-300 bg-red-50" : ""
                    }`}
                  />
                  {email && !EMAIL_RE.test(email) && (
                    <p className="text-xs text-red-500">Vul een geldig e-mailadres in</p>
                  )}
                  {error && (
                    <p className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
                  )}
                </div>
                <button
                  onClick={handleInvite}
                  disabled={!EMAIL_RE.test(email) || sending}
                  className={`mt-4 w-full flex items-center justify-center gap-2 ${t.primary} ${t.primaryHover} text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {hasPartner ? "Opnieuw sturen" : "Uitnodiging sturen"}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
