"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw, Users, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/store/auth-context";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

const PACKAGE_LABELS: Record<string, string> = {
  ERFGOED: "De Erfgoed Box",
  VOOR_ALTIJD: "Voor Altijd",
};

interface WaitlistEntry {
  id: string;
  email: string;
  package_type: string;
  created_at: string;
}

interface WaitlistData {
  total: number;
  by_package: Record<string, number>;
  entries: WaitlistEntry[];
}

export default function WaitlistAdminPage() {
  const { session } = useAuth();
  const [data, setData] = useState<WaitlistData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!session?.token) return;
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "500" });
      if (filter) params.set("package_type", filter);
      const res = await fetch(`${API_URL}/admin/waitlist?${params}`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (!res.ok) throw new Error("Kon wachtlijst niet laden");
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
    } finally {
      setIsLoading(false);
    }
  }, [session?.token, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = (packageType?: string) => {
    if (!session?.token) return;
    const params = new URLSearchParams();
    if (packageType) params.set("package_type", packageType);
    const url = `${API_URL}/admin/waitlist/export.csv?${params}`;
    // Trigger download with auth header via hidden anchor trick
    fetch(url, { headers: { Authorization: `Bearer ${session.token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `wachtlijst_${packageType ?? "alle"}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Wachtlijst</h1>
          <p className="text-slate-600 mt-1">Aanmeldingen voor uitverkochte pakketten</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Vernieuwen
          </button>
          <button
            onClick={() => handleExport(filter || undefined)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Exporteer CSV
          </button>
        </div>
      </div>

      {/* Totalen per pakket */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Totaal aanmeldingen</p>
                <p className="text-2xl font-bold text-slate-900">{data?.total ?? "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {Object.entries(PACKAGE_LABELS).map(([key, label]) => (
          <Card key={key}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{label}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {data?.by_package?.[key] ?? 0}
                  </p>
                </div>
                <button
                  onClick={() => handleExport(key)}
                  className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
                >
                  <Download className="h-3 w-3" />
                  CSV
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["", "ERFGOED", "VOOR_ALTIJD"].map((pkg) => (
          <button
            key={pkg}
            onClick={() => setFilter(pkg)}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              filter === pkg
                ? "bg-slate-900 text-white border-slate-900"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {pkg === "" ? "Alle pakketten" : PACKAGE_LABELS[pkg]}
          </button>
        ))}
      </div>

      {/* Tabel */}
      <Card>
        <CardHeader>
          <CardTitle>Aanmeldingen</CardTitle>
          <CardDescription>
            {data ? `${data.entries.length} van ${data.total} aanmeldingen` : "Laden…"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : data?.entries.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Mail className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p>Nog geen aanmeldingen</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-6 py-3 font-medium text-slate-600">E-mail</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-600">Pakket</th>
                    <th className="text-left px-6 py-3 font-medium text-slate-600">Aangemeld op</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.entries.map((entry, i) => (
                    <tr
                      key={entry.id}
                      className={`border-b border-slate-50 ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}
                    >
                      <td className="px-6 py-3 text-slate-900 font-mono text-xs">{entry.email}</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          {PACKAGE_LABELS[entry.package_type] ?? entry.package_type}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        {new Date(entry.created_at).toLocaleString("nl-NL", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
