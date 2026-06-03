"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  listPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  type PromoCode,
  type CreatePromoCodePayload,
} from "@/lib/api/promo-codes";

const PACKAGE_LABELS: Record<string, string> = {
  BEGIN: "Het Begin",
  ERFGOED: "Erfgoed Box",
  VOOR_ALTIJD: "Voor Altijd",
  DIGITAAL: "Digitaal",
};

const ALL_PACKAGES = ["BEGIN", "ERFGOED", "VOOR_ALTIJD", "DIGITAAL"];

const PACKAGE_GRANTS = [
  { value: "", label: "Geen (alleen korting bij checkout)" },
  { value: "BEGIN", label: "Het Begin" },
  { value: "ERFGOED", label: "De Erfgoed Box" },
  { value: "VOOR_ALTIJD", label: "Voor Altijd" },
];

const EMPTY_FORM: CreatePromoCodePayload = {
  code: "",
  description: "",
  discount_type: "PERCENTAGE",
  discount_value: 0,
  applicable_packages: null,
  max_uses: null,
  expires_at: null,
  grants_package: null,
};

export default function AdminCouponsPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreatePromoCodePayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [limitPackages, setLimitPackages] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      setCodes(await listPromoCodes());
    } catch {
      setError("Laden mislukt");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const payload: CreatePromoCodePayload = {
        ...form,
        code: form.code.toUpperCase().trim(),
        applicable_packages: limitPackages ? form.applicable_packages : null,
      };
      const created = await createPromoCode(payload);
      setCodes((prev) => [created, ...prev]);
      setShowForm(false);
      setForm(EMPTY_FORM);
      setLimitPackages(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Aanmaken mislukt");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(code: PromoCode) {
    try {
      const updated = await updatePromoCode(code.id, { is_active: !code.is_active });
      setCodes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch {
      // stille fout — probeer opnieuw
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Code verwijderen?")) return;
    try {
      await deletePromoCode(id);
      setCodes((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Verwijderen mislukt");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Kortingscodes</h1>
          <p className="text-slate-600 mt-1">Beheer promo codes voor checkout</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nieuwe code
        </Button>
      </div>

      {/* Aanmaakformulier */}
      {showForm && (
        <Card className="border-[#d4af37]/40 bg-amber-50/30">
          <CardHeader>
            <CardTitle className="text-lg">Nieuwe kortingscode</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="ZOMER10"
                    required
                    pattern="[A-Z0-9_\-]+"
                    maxLength={32}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                  <p className="text-xs text-slate-400 mt-1">Alleen hoofdletters, cijfers, - en _</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Omschrijving</label>
                  <input
                    type="text"
                    value={form.description ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Zomercampagne 2026"
                    maxLength={200}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type korting *</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as "PERCENTAGE" | "FIXED" }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Vast bedrag (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Waarde * {form.discount_type === "PERCENTAGE" ? "(% van pakketprijs)" : "(eurocenten, bijv. 1000 = €10)"}
                  </label>
                  <input
                    type="number"
                    value={form.discount_value}
                    onChange={(e) => setForm((f) => ({ ...f, discount_value: Number(e.target.value) }))}
                    min={1}
                    max={form.discount_type === "PERCENTAGE" ? 100 : 100000}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max. gebruik</label>
                  <input
                    type="number"
                    value={form.max_uses ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value ? Number(e.target.value) : null }))}
                    min={1}
                    placeholder="Onbeperkt"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vervaldatum</label>
                  <input
                    type="datetime-local"
                    value={form.expires_at ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value || null }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Gratis pakket activatie */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Gratis pakket activeren
                </label>
                <select
                  value={form.grants_package ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, grants_package: e.target.value || null }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#d4af37]"
                >
                  {PACKAGE_GRANTS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {form.grants_package && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-2">
                    Gebruikers die deze code invoeren in het dashboard krijgen direct het <strong>{PACKAGE_LABELS[form.grants_package]}</strong> pakket geactiveerd — zonder betaling.
                  </p>
                )}
              </div>

              {/* Pakket beperking */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={limitPackages}
                    onChange={(e) => {
                      setLimitPackages(e.target.checked);
                      if (!e.target.checked) setForm((f) => ({ ...f, applicable_packages: null }));
                      else setForm((f) => ({ ...f, applicable_packages: ["BEGIN"] }));
                    }}
                    className="accent-[#d4af37]"
                  />
                  <span className="text-sm font-medium text-slate-700">Beperken tot specifieke pakketten</span>
                </label>
                {limitPackages && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {ALL_PACKAGES.map((pkg) => {
                      const checked = (form.applicable_packages ?? []).includes(pkg);
                      return (
                        <label key={pkg} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const pkgs = form.applicable_packages ?? [];
                              setForm((f) => ({
                                ...f,
                                applicable_packages: e.target.checked
                                  ? [...pkgs, pkg]
                                  : pkgs.filter((p) => p !== pkg),
                              }));
                            }}
                            className="accent-[#d4af37]"
                          />
                          <span className="text-sm text-slate-600">{PACKAGE_LABELS[pkg]}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {formError && (
                <p className="text-red-600 text-sm">{formError}</p>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? "Opslaan..." : "Aanmaken"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setLimitPackages(false); }}>
                  Annuleer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Overzicht */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Actieve codes ({codes.filter((c) => c.is_active).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500 text-sm">Laden...</p>
          ) : error ? (
            <p className="text-red-600 text-sm">{error}</p>
          ) : codes.length === 0 ? (
            <p className="text-slate-500 text-sm">Nog geen kortingscodes aangemaakt.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500 text-xs uppercase tracking-wide">
                    <th className="pb-3 pr-4 font-medium">Code</th>
                    <th className="pb-3 pr-4 font-medium">Korting / Pakket</th>
                    <th className="pb-3 pr-4 font-medium">Gebruik</th>
                    <th className="pb-3 pr-4 font-medium">Pakketten</th>
                    <th className="pb-3 pr-4 font-medium">Vervalt</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {codes.map((code) => (
                    <tr key={code.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-4">
                        <div>
                          <span className="font-mono font-bold text-slate-900">{code.code}</span>
                          {code.description && (
                            <p className="text-xs text-slate-400 mt-0.5">{code.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        {code.grants_package ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded px-2 py-0.5">
                            Gratis: {PACKAGE_LABELS[code.grants_package] ?? code.grants_package}
                          </span>
                        ) : (
                          <span className="font-medium text-slate-700">
                            {code.discount_type === "PERCENTAGE"
                              ? `${code.discount_value}%`
                              : `€${(code.discount_value / 100).toFixed(2)}`}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {code.used_count}
                        {code.max_uses != null && (
                          <span className="text-slate-400"> / {code.max_uses}</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {code.applicable_packages == null ? (
                          <span className="text-slate-400 text-xs">Alle pakketten</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {code.applicable_packages.map((p) => (
                              <Badge key={p} variant="outline" className="text-xs px-1.5 py-0">
                                {PACKAGE_LABELS[p] ?? p}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-slate-500 text-xs">
                        {code.expires_at
                          ? new Date(code.expires_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant="outline"
                          className={code.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"}
                        >
                          {code.is_active ? "Actief" : "Inactief"}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggle(code)}
                            title={code.is_active ? "Deactiveer" : "Activeer"}
                            className="p-1.5 rounded hover:bg-slate-100 transition-colors text-slate-500"
                          >
                            {code.is_active
                              ? <ToggleRight className="h-4 w-4 text-emerald-600" />
                              : <ToggleLeft className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(code.id)}
                            title="Verwijder"
                            className="p-1.5 rounded hover:bg-red-50 transition-colors text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
