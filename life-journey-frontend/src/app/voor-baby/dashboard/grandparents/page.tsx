"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Trash2, Check, Plus, Mail } from "lucide-react";
import {
  getMyBabyJourney,
  addGrandparent,
  removeGrandparent,
  type BabyJourneyPublic,
  type BabyJourneyWithProgress,
  type GrandparentEntry,
} from "@/lib/api/baby";
import { useBabyTheme } from "@/components/baby/BabyThemeContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function GrandparentsPage() {
  const router = useRouter();
  const { t } = useBabyTheme();
  const [journey, setJourney] = useState<BabyJourneyWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const j = await getMyBabyJourney();
      setJourney(j);
    } catch {
      router.push("/voor-baby/dashboard");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!name.trim() || !EMAIL_RE.test(email)) return;
    setAdding(true);
    setAddError(null);
    setAddSuccess(false);
    try {
      const updated: BabyJourneyPublic = await addGrandparent({ name: name.trim(), email: email.trim(), digest_active: true });
      setJourney((prev) => prev ? { ...prev, grandparent_emails: updated.grandparent_emails } : prev);
      setName("");
      setEmail("");
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 3000);
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Er ging iets mis.");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (gpEmail: string) => {
    setRemovingEmail(gpEmail);
    try {
      const updated: BabyJourneyPublic = await removeGrandparent(gpEmail);
      setJourney((prev) => prev ? { ...prev, grandparent_emails: updated.grandparent_emails } : prev);
    } catch {
      // silently ignore
    } finally {
      setRemovingEmail(null);
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

  const grandparents: GrandparentEntry[] = journey.grandparent_emails ?? [];

  return (
    <div className={`min-h-screen ${t.primaryBg}`}>
      {/* Header */}
      <div className={`bg-white border-b ${t.primaryBorder} px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm`}>
        <Link href="/voor-baby/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-bold text-gray-900">Opa &amp; oma</span>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">

        {/* Uitleg */}
        <div className={`bg-white rounded-3xl border ${t.primaryBorder} p-6 shadow-sm`}>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-3xl">👴👵</span>
            <div>
              <h2 className="font-bold text-gray-900">Maandelijkse updates</h2>
              <p className="text-sm text-gray-500 mt-0.5">Automatisch, zonder app of account</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Opa&apos;s en oma&apos;s ontvangen elke maand automatisch een mooie samenvatting van nieuwe
            mijlpalen en hoogtepunten van <strong>{journey.baby_name}</strong>. Ze hoeven niets te
            installeren — gewoon een e-mail vol mooie herinneringen.
          </p>
        </div>

        {/* Huidige lijst */}
        {grandparents.length > 0 && (
          <div className={`bg-white rounded-3xl border ${t.primaryBorder} shadow-sm overflow-hidden`}>
            <div className={`px-6 pt-5 pb-4 border-b border-gray-50`}>
              <h3 className="font-bold text-gray-900">
                {grandparents.length === 1 ? "1 grootouder toegevoegd" : `${grandparents.length} grootouders toegevoegd`}
              </h3>
            </div>
            <ul className="divide-y divide-gray-50">
              {grandparents.map((gp) => (
                <li key={gp.email} className="flex items-center gap-4 px-6 py-4">
                  <div className={`w-10 h-10 ${t.primaryBgMedium} rounded-xl flex items-center justify-center shrink-0`}>
                    <Mail className={`w-4 h-4 ${t.primaryText}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{gp.name}</p>
                    <p className="text-xs text-gray-400 truncate">{gp.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs ${t.primaryText} font-medium`}>
                      {gp.digest_active ? "Digest aan" : "Digest uit"}
                    </span>
                    <button
                      onClick={() => handleRemove(gp.email)}
                      disabled={removingEmail === gp.email}
                      className="p-2 text-gray-300 hover:text-red-400 transition-colors rounded-lg disabled:opacity-50"
                      title="Verwijderen"
                    >
                      {removingEmail === gp.email
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Toevoegen formulier */}
        <div className={`bg-white rounded-3xl border ${t.primaryBorder} p-6 shadow-sm`}>
          <h3 className="font-semibold text-gray-900 mb-4">Grootouder toevoegen</h3>

          {addSuccess && (
            <div className={`flex items-center gap-3 p-4 ${t.primaryBg} rounded-2xl mb-4`}>
              <Check className={`w-5 h-5 ${t.checkColor} shrink-0`} />
              <p className={`text-sm font-semibold ${t.primaryText}`}>
                Toegevoegd! Ze ontvangen voortaan de maandelijkse digest.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Naam
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="bijv. Oma Riet of Opa Jan"
                className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ${t.inputRing}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                E-mailadres
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setAddError(null); }}
                placeholder="oma@email.nl"
                className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ${t.inputRing} ${
                  email && !EMAIL_RE.test(email) ? "border-red-300 bg-red-50" : ""
                }`}
              />
              {email && !EMAIL_RE.test(email) && (
                <p className="text-xs text-red-500 mt-1">Vul een geldig e-mailadres in</p>
              )}
            </div>
            {addError && (
              <p className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-3">{addError}</p>
            )}
            <button
              onClick={handleAdd}
              disabled={!name.trim() || !EMAIL_RE.test(email) || adding}
              className={`w-full flex items-center justify-center gap-2 ${t.primary} ${t.primaryHover} text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
            >
              {adding
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><Plus className="w-4 h-4" /> Voeg toe</>
              }
            </button>
          </div>
        </div>

        {grandparents.length === 0 && (
          <p className="text-center text-xs text-gray-400">
            Je kunt maximaal 5 grootouders toevoegen.
          </p>
        )}

      </div>
    </div>
  );
}
