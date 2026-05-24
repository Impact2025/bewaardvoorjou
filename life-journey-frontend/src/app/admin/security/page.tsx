"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Key, AlertTriangle, Users, Database, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth-context";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

interface SystemHealth {
  status: string;
  database: { status: string; users: number; journeys: number; media_assets: number; storage_gb: number };
  api: { status: string };
  security: { admin_accounts: number; active_users: number };
}

interface AuditEntry {
  id: string;
  admin_email: string;
  action: string;
  target_email: string | null;
  detail: string | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  toggle_admin: "Admin toggled",
  toggle_active: "Account toggled",
  create_user: "Gebruiker aangemaakt",
  delete_user: "Gebruiker verwijderd",
};

const ACTION_COLORS: Record<string, string> = {
  toggle_admin: "bg-amber-100 text-amber-700",
  toggle_active: "bg-blue-100 text-blue-700",
  create_user: "bg-emerald-100 text-emerald-700",
  delete_user: "bg-red-100 text-red-700",
};

function getToken(): string {
  if (typeof window === "undefined") return "";
  try {
    return JSON.parse(localStorage.getItem("life-journey.auth") ?? "{}").token ?? "";
  } catch {
    return "";
  }
}

export default function AdminSecurityPage() {
  const { session } = useAuth();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.token) return;

    const token = getToken();
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_URL}/admin/system/health`, { headers }).then((r) => r.json()),
      fetch(`${API_URL}/admin/audit?limit=30`, { headers }).then((r) => r.json()),
    ]).then(([healthData, auditData]) => {
      setHealth(healthData);
      setAuditLog(Array.isArray(auditData) ? auditData : []);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, [session?.token]);

  const statusBadge = (ok: boolean) => (
    <Badge className={cn("mt-2", ok ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200")}>
      {ok ? "Operationeel" : "Probleem"}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Security & Compliance</h1>
        <p className="text-slate-600 mt-1">Beveiligingsstatus, toegangsbeheer en auditlog</p>
      </div>

      {/* Live Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Platform status</p>
                {isLoading ? (
                  <div className="h-6 w-20 bg-slate-100 animate-pulse rounded mt-2" />
                ) : statusBadge(health?.status === "operational")}
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Database</p>
                {isLoading ? (
                  <div className="h-6 w-20 bg-slate-100 animate-pulse rounded mt-2" />
                ) : statusBadge(health?.database.status === "healthy")}
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Database className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Admin accounts</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {isLoading ? "—" : health?.security.admin_accounts ?? "—"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Key className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Actieve accounts</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {isLoading ? "—" : health?.security.active_users ?? "—"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Auth stack */}
        <Card>
          <CardHeader>
            <CardTitle>Authenticatie</CardTitle>
            <CardDescription>Beveiligingslagen en toegangscontrole</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "JWT Authenticatie", sub: "HS256, expiry-check actief" },
              { label: "Wachtwoord hashing", sub: "Argon2id — industry standard" },
              { label: "Role-Based Access", sub: "Admin / gebruiker rollen" },
              { label: "Middleware guard", sub: "Server-side redirect op /admin" },
              { label: "Backend enforcement", sub: "get_current_admin_user() op alle routes" },
            ].map(({ label, sub }) => (
              <div key={label} className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-emerald-900">{label}</p>
                  <p className="text-xs text-emerald-600 mt-0.5">{sub}</p>
                </div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Data protection */}
        <Card>
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
            <CardDescription>Encryptie en privacymaatregelen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "PostgreSQL SSL", sub: "Verbinding encrypted in transit (Neon.tech)" },
              { label: "CORS bescherming", sub: "Geconfigureerd voor allowed origins" },
              { label: "Rate limiting", sub: "Slowapi actief op auth endpoints" },
              { label: "Input validatie", sub: "Pydantic schemas op alle endpoints" },
              { label: "Audit logging", sub: "Alle admin acties worden gelogd" },
            ].map(({ label, sub }) => (
              <div key={label} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-900">{label}</p>
                  <p className="text-xs text-blue-600 mt-0.5">{sub}</p>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Database metrics */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle>Database statistieken</CardTitle>
            <CardDescription>Live data van {health.database.status === "healthy" ? "gezonde" : "problematische"} database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Gebruikers", value: health.database.users },
                { label: "Journeys", value: health.database.journeys },
                { label: "Media bestanden", value: health.database.media_assets },
                { label: "Opslag", value: `${health.database.storage_gb} GB` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit log */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-slate-600" />
            <CardTitle>Admin Auditlog</CardTitle>
          </div>
          <CardDescription>Laatste 30 admin-acties — wie deed wat wanneer</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : auditLog.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Nog geen admin-acties gelogd.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actie</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider hidden md:table-cell">Admin</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider hidden lg:table-cell">Doelaccount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider hidden lg:table-cell">Detail</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Tijdstip</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {auditLog.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <Badge className={cn("text-xs", ACTION_COLORS[entry.action] ?? "bg-slate-100 text-slate-600")}>
                          {ACTION_LABELS[entry.action] ?? entry.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 hidden md:table-cell">{entry.admin_email}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 hidden lg:table-cell">{entry.target_email ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">{entry.detail ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(entry.created_at).toLocaleString("nl-NL")}
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
