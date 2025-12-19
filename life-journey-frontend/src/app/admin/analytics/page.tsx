"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Users, Clock, Video, Download, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth-context";

interface AnalyticsData {
  user_growth: Array<{ date: string; total_users: number }>;
  daily_registrations: Array<{ date: string; registrations: number }>;
  daily_recordings: Array<{ date: string; recordings: number; duration_minutes: number }>;
  chapter_distribution: Record<string, number>;
  modality_distribution: Record<string, number>;
  country_distribution: Record<string, number>;
  hourly_activity: Record<string, number>;
}

interface EngagementData {
  conversion: { onboarding_rate: number; first_recording_rate: number };
  engagement: { avg_recordings_per_user: number; avg_recording_duration_seconds: number; weekly_active_rate: number };
  retention: { thirty_day_retention: number };
}

interface StatsData {
  users: { total: number; active_30d: number; active_7d: number; new_today: number; new_week: number; trend_percent: number };
  recordings: { total: number; today: number; week: number; total_duration_hours: number; total_storage_gb: number };
}

export default function AdminAnalyticsPage() {
  const { session } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.token) return;
      try {
        setIsLoading(true);
        const headers = { Authorization: "Bearer " + session.token };
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";
        const [analyticsRes, engagementRes, statsRes] = await Promise.all([
          fetch(apiUrl + "/admin/analytics/overview?days=30", { headers }),
          fetch(apiUrl + "/admin/analytics/engagement", { headers }),
          fetch(apiUrl + "/admin/stats/enhanced", { headers }),
        ]);
        if (!analyticsRes.ok || !engagementRes.ok || !statsRes.ok) throw new Error("Kon analytics niet laden");
        const [analyticsData, engagementData, statsData] = await Promise.all([analyticsRes.json(), engagementRes.json(), statsRes.json()]);
        setAnalytics(analyticsData);
        setEngagement(engagementData);
        setStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Onbekende fout");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [session?.token]);

  if (isLoading) return <AnalyticsSkeleton />;
  if (error) return <div className="p-8 text-center"><p className="text-red-600">{error}</p></div>;
  if (!analytics || !engagement || !stats) return <div className="p-8 text-center"><p className="text-slate-600">Geen data beschikbaar</p></div>;

  const maxUsers = Math.max(...analytics.user_growth.map((d) => d.total_users), 1);
  const maxRecordings = Math.max(...analytics.daily_recordings.map((d) => d.recordings), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600 mt-1">Echte inzichten en metrics over je platform</p>
        </div>
        <Button variant="ghost"><Download className="h-4 w-4 mr-2" />Export Report</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Totaal Gebruikers" value={stats.users.total.toLocaleString()} change={(stats.users.trend_percent > 0 ? "+" : "") + stats.users.trend_percent + "%"} trend={stats.users.trend_percent >= 0 ? "up" : "down"} icon={Users} />
        <MetricCard title="Actieve Gebruikers (7d)" value={stats.users.active_7d.toLocaleString()} change={Math.round((stats.users.active_7d / Math.max(stats.users.total, 1)) * 100) + "% van totaal"} trend="up" icon={Users} />
        <MetricCard title="Gem. Opnameduur" value={Math.round(engagement.engagement.avg_recording_duration_seconds / 60) + "m"} change={engagement.engagement.avg_recordings_per_user + " per gebruiker"} trend="up" icon={Clock} />
        <MetricCard title="Totaal Opnames" value={stats.recordings.total.toLocaleString()} change={"+" + stats.recordings.week + " deze week"} trend="up" icon={Video} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Gebruikersgroei</CardTitle><CardDescription>Totaal aantal gebruikers over tijd</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.user_growth.slice(-7).map((data, idx, arr) => {
                const height = (data.total_users / maxUsers) * 100;
                const prevUsers = idx > 0 ? arr[idx - 1].total_users : data.total_users;
                const growth = prevUsers > 0 ? ((data.total_users - prevUsers) / prevUsers) * 100 : 0;
                return (
                  <div key={data.date} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{new Date(data.date).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric" })}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-bold">{data.total_users}</span>
                        {idx > 0 && growth !== 0 && <Badge variant="outline" className={cn("text-xs", growth > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200")}>{(growth > 0 ? "+" : "") + growth.toFixed(1) + "%"}</Badge>}
                      </div>
                    </div>
                    <div className="h-8 bg-slate-100 rounded-lg overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all duration-500" style={{ width: height + "%" }} /></div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Dagelijkse Opnames</CardTitle><CardDescription>Opnames per dag</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.daily_recordings.slice(-7).map((data) => {
                const height = (data.recordings / maxRecordings) * 100;
                return (
                  <div key={data.date} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{new Date(data.date).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric" })}</span>
                      <div className="flex items-center gap-2"><span className="text-slate-900 font-bold">{data.recordings}</span><span className="text-slate-500 text-xs">({data.duration_minutes}m)</span></div>
                    </div>
                    <div className="h-8 bg-slate-100 rounded-lg overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg transition-all duration-500" style={{ width: Math.max(height, 5) + "%" }} /></div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Opname Types</CardTitle><CardDescription>Verdeling audio vs video</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.modality_distribution).map(([modality, count]) => {
                const total = Object.values(analytics.modality_distribution).reduce((a, b) => a + b, 0);
                const percent = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={modality} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700 flex items-center gap-2">{modality === "audio" ? <Mic className="h-4 w-4" /> : <Video className="h-4 w-4" />}{modality === "audio" ? "Audio" : "Video"}</span>
                      <span className="text-slate-900 font-bold">{count} ({percent.toFixed(0)}%)</span>
                    </div>
                    <div className="h-6 bg-slate-100 rounded-lg overflow-hidden"><div className={cn("h-full rounded-lg transition-all duration-500", modality === "audio" ? "bg-gradient-to-r from-purple-500 to-purple-600" : "bg-gradient-to-r from-teal-500 to-teal-600")} style={{ width: percent + "%" }} /></div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Gebruikers per Land</CardTitle><CardDescription>Geografische verdeling</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.country_distribution).sort(([, a], [, b]) => (b as number) - (a as number)).slice(0, 5).map(([country, count]) => {
                const total = Object.values(analytics.country_distribution).reduce((a, b) => a + b, 0);
                const percent = total > 0 ? ((count as number) / total) * 100 : 0;
                return (
                  <div key={country} className="space-y-2">
                    <div className="flex items-center justify-between text-sm"><span className="font-medium text-slate-700">{country || "Onbekend"}</span><span className="text-slate-900 font-bold">{count} ({percent.toFixed(0)}%)</span></div>
                    <div className="h-6 bg-slate-100 rounded-lg overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg transition-all duration-500" style={{ width: percent + "%" }} /></div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card><CardHeader className="pb-3"><CardTitle className="text-base">Onboarding Rate</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-slate-900">{engagement.conversion.onboarding_rate}%</div><p className="text-sm text-slate-600 mt-1">Gebruikers die onboarding voltooiden</p><div className="mt-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" /><span className="text-sm text-emerald-500 font-medium">{engagement.conversion.first_recording_rate}% eerste opname</span></div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-base">Wekelijkse Activiteit</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-slate-900">{engagement.engagement.weekly_active_rate}%</div><p className="text-sm text-slate-600 mt-1">Actieve gebruikers deze week</p><div className="mt-4 flex items-center gap-2"><Users className="h-4 w-4 text-blue-500" /><span className="text-sm text-blue-500 font-medium">{stats.users.active_7d} gebruikers</span></div></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-base">30-Dagen Retentie</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-slate-900">{engagement.retention.thirty_day_retention}%</div><p className="text-sm text-slate-600 mt-1">Gebruikers die terugkomen</p><div className="mt-4 flex items-center gap-2">{engagement.retention.thirty_day_retention >= 50 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-amber-500" />}<span className={cn("text-sm font-medium", engagement.retention.thirty_day_retention >= 50 ? "text-emerald-500" : "text-amber-500")}>{engagement.retention.thirty_day_retention >= 50 ? "Goed" : "Verbeteren"}</span></div></CardContent></Card>
      </div>
    </div>
  );
}

interface MetricCardProps { title: string; value: string; change: string; trend: "up" | "down"; icon: React.ElementType }

function MetricCard({ title, value, change, trend, icon: Icon }: MetricCardProps) {
  return (
    <Card><CardContent className="p-6"><div className="flex items-center justify-between mb-4"><div className="text-sm font-medium text-slate-600">{title}</div><Icon className="h-5 w-5 text-slate-400" /></div><div className="text-2xl font-bold text-slate-900">{value}</div><div className="flex items-center gap-1 mt-2">{trend === "up" ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}<span className={cn("text-sm font-medium", trend === "up" ? "text-emerald-500" : "text-red-500")}>{change}</span></div></CardContent></Card>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><Skeleton className="h-8 w-64 mb-2" /><Skeleton className="h-4 w-48" /></div><Skeleton className="h-10 w-32" /></div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((i) => <Card key={i}><CardContent className="p-6"><Skeleton className="h-4 w-24 mb-4" /><Skeleton className="h-8 w-16 mb-2" /><Skeleton className="h-4 w-20" /></CardContent></Card>)}</div>
      <div className="grid gap-6 lg:grid-cols-2">{[1, 2].map((i) => <Card key={i}><CardHeader><Skeleton className="h-6 w-32 mb-2" /><Skeleton className="h-4 w-48" /></CardHeader><CardContent><div className="space-y-4">{[1, 2, 3, 4, 5].map((j) => <div key={j} className="space-y-2"><div className="flex justify-between"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-12" /></div><Skeleton className="h-8 w-full" /></div>)}</div></CardContent></Card>)}</div>
    </div>
  );
}
