"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Users, Clock, Construction } from "lucide-react";
import { useAuth } from "@/store/auth-context";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

interface PlatformStats {
  users: { total: number; active_30d: number; active_7d: number; new_today: number; new_week: number };
  recordings: { total: number; today: number; week: number; total_duration_hours: number; total_storage_gb: number };
  ai_usage: { total_prompts: number; prompts_today: number };
  sharing: { total_shares: number };
}

export default function AdminSubscriptionsPage() {
  const { session } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.token) return;
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/stats/enhanced`, {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        if (response.ok) setStats(await response.json());
      } catch {
        // stats blijven null
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [session?.token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Subscription Management</h1>
        <p className="text-slate-600 mt-1">Abonnementen en inkomsten</p>
      </div>

      {/* Coming soon banner */}
      <div className="flex items-start gap-4 p-5 bg-amber-50 border border-amber-200 rounded-xl">
        <Construction className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900">Betalingskoppeling nog niet actief</p>
          <p className="text-sm text-amber-700 mt-1">
            Subscriptions worden beheerd via Stripe/Paddle. Zodra de betalingsintegratie live is,
            worden hier echte MRR, ARR en transactiedata getoond. De getallen hieronder zijn
            indicatoren op basis van het gebruikersplatform.
          </p>
        </div>
      </div>

      {/* Real platform metrics as proxy */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-600">Geregistreerde gebruikers</div>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {isLoading ? "..." : (stats?.users.total.toLocaleString("nl-NL") ?? "—")}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {isLoading ? "" : `${stats?.users.new_week ?? 0} nieuwe deze week`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-600">Actieve gebruikers (30d)</div>
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {isLoading ? "..." : (stats?.users.active_30d.toLocaleString("nl-NL") ?? "—")}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {isLoading || !stats
                ? ""
                : `${Math.round((stats.users.active_30d / Math.max(stats.users.total, 1)) * 100)}% van totaal`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-600">Totaal opnameduur</div>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {isLoading ? "..." : `${stats?.recordings.total_duration_hours.toFixed(1) ?? "—"} uur`}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {isLoading ? "" : `${stats?.recordings.total ?? 0} opnames totaal`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-600">MRR</div>
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-slate-400">—</div>
            <p className="text-xs text-slate-400 mt-2">Wacht op betalingsintegratie</p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing tiers — informational, not operational */}
      <Card>
        <CardHeader>
          <CardTitle>Geplande abonnementstiers</CardTitle>
          <CardDescription>
            Definitief gepland voor v2.0 — nog niet live. Geen betalingssysteem actief.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Basis", price: "Gratis", color: "bg-slate-100 text-slate-700", features: ["1 levensverhaal", "5 GB opslag", "58 hoofdstukken"] },
              { name: "Familie", price: "€9,99/mnd", color: "bg-pink-100 text-pink-700", features: ["5 familieleden", "50 GB opslag", "Gedeelde tijdlijn"] },
              { name: "Legacy", price: "€19,99/mnd", color: "bg-amber-100 text-amber-700", features: ["Onbeperkt leden", "200 GB opslag", "Fysiek boek"] },
              { name: "Eeuwig", price: "€499 eenmalig", color: "bg-purple-100 text-purple-700", features: ["Alles voor altijd", "Onbeperkte opslag", "Prioriteit support"] },
            ].map((tier) => (
              <div key={tier.name} className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{tier.name}</p>
                  <Badge variant="outline" className={tier.color}>{tier.price}</Badge>
                </div>
                <ul className="space-y-1">
                  {tier.features.map((f) => (
                    <li key={f} className="text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-slate-400 rounded-full" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Prijzen onder voorbehoud. Koppeling met Stripe volgt in Fase 3 (maand 9-12).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Volgende stappen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "Stripe/Paddle account aanmaken en koppelen", done: false },
              { label: "Subscription model toevoegen aan database", done: false },
              { label: "Webhook handlers implementeren (payment events)", done: false },
              { label: "Feature gating op basis van tier", done: false },
              { label: "Admin dashboard koppelen aan echte betalingsdata", done: false },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${done ? "bg-emerald-500 border-emerald-500" : "border-slate-300"}`}>
                  {done && <span className="text-white text-xs">✓</span>}
                </div>
                <span className={`text-sm ${done ? "text-slate-400 line-through" : "text-slate-700"}`}>{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
