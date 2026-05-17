"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, HardDrive, Clock, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth-context";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

interface EnhancedStats {
  users: {
    total: number;
    active_30d: number;
    active_7d: number;
    new_today: number;
    new_week: number;
    trend_percent: number;
  };
  journeys: { total: number };
  recordings: {
    total: number;
    today: number;
    week: number;
    total_duration_hours: number;
    total_storage_gb: number;
  };
  transcripts: { total: number };
  highlights: { total: number };
  ai_usage: { total_prompts: number; prompts_today: number };
  sharing: { total_shares: number };
  memos: { total: number };
}

export default function AdminDashboardPage() {
  const { session } = useAuth();
  const [stats, setStats] = useState<EnhancedStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.token) return;

    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/stats/enhanced`, {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        if (!response.ok) throw new Error("Kon statistieken niet laden");
        setStats(await response.json());
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Onbekende fout");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [session?.token]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-24 bg-slate-100 animate-pulse rounded-lg" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fout bij laden</CardTitle>
          <CardDescription>{error ?? "Onbekende fout"}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const activeRate =
    stats.users.total > 0
      ? Math.round((stats.users.active_30d / stats.users.total) * 100)
      : 0;

  const trendUp = stats.users.trend_percent >= 0;
  const trendLabel =
    (trendUp ? "+" : "") + stats.users.trend_percent.toFixed(1) + "% vs gisteren";

  const recordingsTrendUp = stats.recordings.today >= (stats.recordings.week / 7);
  const recordingsTrendLabel =
    stats.recordings.today + " vandaag · " + stats.recordings.week + " deze week";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overzicht</h1>
        <p className="text-slate-600 mt-1">Welkom terug! Dit is wat er vandaag speelt.</p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Totaal Gebruikers"
          value={stats.users.total.toLocaleString("nl-NL")}
          change={trendLabel}
          trendUp={trendUp}
          icon={Users}
          iconColor="from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Actieve Gebruikers (7d)"
          value={stats.users.active_7d.toLocaleString("nl-NL")}
          change={activeRate + "% van totaal actief (30d)"}
          trendUp={activeRate > 30}
          icon={TrendingUp}
          iconColor="from-emerald-500 to-emerald-600"
        />
        <StatsCard
          title="Totaal Opnames"
          value={stats.recordings.total.toLocaleString("nl-NL")}
          change={recordingsTrendLabel}
          trendUp={recordingsTrendUp}
          icon={Clock}
          iconColor="from-amber-500 to-amber-600"
        />
        <StatsCard
          title="Opslag Gebruikt"
          value={stats.recordings.total_storage_gb.toFixed(2) + " GB"}
          change={stats.recordings.total_duration_hours.toFixed(1) + " uur audio/video"}
          trendUp={true}
          icon={HardDrive}
          iconColor="from-purple-500 to-purple-600"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-600">Nieuwe gebruikers vandaag</div>
            <div className="text-3xl font-bold text-slate-900 mt-2">{stats.users.new_today}</div>
            <p className="text-sm text-slate-500 mt-1">{stats.users.new_week} deze week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-600">AI-prompts vandaag</div>
            <div className="text-3xl font-bold text-slate-900 mt-2">{stats.ai_usage.prompts_today}</div>
            <p className="text-sm text-slate-500 mt-1">{stats.ai_usage.total_prompts.toLocaleString("nl-NL")} totaal</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-600">Gedeelde verhalen</div>
            <div className="text-3xl font-bold text-slate-900 mt-2">{stats.sharing.total_shares}</div>
            <p className="text-sm text-slate-500 mt-1">{stats.highlights.total} highlights</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-600">Actief %</div>
            <div className="text-3xl font-bold text-slate-900 mt-2">{activeRate}%</div>
            <p className="text-sm text-slate-500 mt-1">Actief in laatste 30 dagen</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Content volume</CardTitle>
            <CardDescription>Gecreëerde content op het platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Levensverhalen", value: stats.journeys.total },
                { label: "Opnames", value: stats.recordings.total },
                { label: "Transcripties", value: stats.transcripts.total },
                { label: "Notities", value: stats.memos.total },
                { label: "Highlights", value: stats.highlights.total },
              ].map(({ label, value }) => {
                const max = Math.max(stats.recordings.total, 1);
                const pct = Math.min((value / max) * 100, 100);
                return (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{label}</span>
                      <span className="font-bold text-slate-900">{value.toLocaleString("nl-NL")}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Systeemstatus</CardTitle>
            <CardDescription>Platform gezondheid en performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "API", sub: "Alle systemen operationeel", color: "emerald" },
                { label: "Database", sub: "Verbonden en gezond (Neon.tech)", color: "emerald" },
                { label: "AI Interviewer", sub: "Claude 3.5 Sonnet actief", color: "emerald" },
                { label: "Transcriptie", sub: "Whisper large-v3 actief", color: "emerald" },
              ].map(({ label, sub, color }) => (
                <div
                  key={label}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg",
                    color === "emerald" ? "bg-emerald-50" : "bg-amber-50"
                  )}
                >
                  <div>
                    <p className={cn("text-sm font-medium", color === "emerald" ? "text-emerald-900" : "text-amber-900")}>
                      {label}
                    </p>
                    <p className={cn("text-xs mt-0.5", color === "emerald" ? "text-emerald-600" : "text-amber-600")}>
                      {sub}
                    </p>
                  </div>
                  <div className={cn("w-3 h-3 rounded-full animate-pulse", color === "emerald" ? "bg-emerald-500" : "bg-amber-500")} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trendUp: boolean;
  icon: React.ElementType;
  iconColor: string;
}

function StatsCard({ title, value, change, trendUp, icon: Icon, iconColor }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
            <div className="flex items-center gap-1 mt-2">
              {trendUp ? (
                <ArrowUp className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500 flex-shrink-0" />
              )}
              <span className={cn("text-xs font-medium truncate", trendUp ? "text-emerald-500" : "text-red-500")}>
                {change}
              </span>
            </div>
          </div>
          <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 ml-4", iconColor)}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
