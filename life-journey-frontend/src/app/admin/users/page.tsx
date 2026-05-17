"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  Search,
  Download,
  UserPlus,
  MoreVertical,
  Shield,
  ShieldOff,
  UserCheck,
  UserX,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

interface User {
  id: string;
  display_name: string;
  email: string;
  country: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

interface UserDetail {
  user: {
    id: string;
    display_name: string;
    email: string;
    country: string;
    locale: string;
    birth_year: number | null;
    is_active: boolean;
    is_admin: boolean;
    created_at: string;
    last_login_at: string | null;
    onboarding_completed_at: string | null;
    preferred_recording_method: string | null;
    ai_assistance_level: string | null;
  };
  journey_id: string | null;
  metrics: {
    recordings: { total: number; duration_seconds: number; storage_bytes: number };
    transcripts: { total: number };
    highlights: { total: number };
    prompts: { total: number };
    memos: { total: number };
    shares: { total: number };
    chapters_started: number;
    chapters_completed: number;
  };
  recent_activity: Array<{
    type: string;
    timestamp: string | null;
    chapter_id: string | null;
    duration_seconds?: number;
    modality?: string;
    description?: string;
  }>;
}

function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  const raw = localStorage.getItem("life-journey.auth");
  if (!raw) return "";
  try {
    return JSON.parse(raw).token ?? "";
  } catch {
    return "";
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    email: "",
    displayName: "",
    password: "",
    country: "Nederland",
    isAdmin: false,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      setUsers(await response.json());
    } catch (error: unknown) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchUserDetail = async (userId: string) => {
    setIsLoadingDetail(true);
    setSelectedUser(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/users/${userId}/detail`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch user detail");
      setSelectedUser(await response.json());
    } catch (error: unknown) {
      console.error("Error fetching user detail:", error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const toggleAdmin = async (userId: string) => {
    setTogglingId(userId);
    setOpenMenuId(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/users/${userId}/toggle-admin`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to toggle admin");
      const updated = await response.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_admin: updated.is_admin } : u))
      );
      if (selectedUser?.user.id === userId) {
        setSelectedUser((prev) =>
          prev ? { ...prev, user: { ...prev.user, is_admin: updated.is_admin } } : prev
        );
      }
    } catch (error: unknown) {
      console.error("Toggle admin failed:", error);
    } finally {
      setTogglingId(null);
    }
  };

  const toggleActive = async (userId: string) => {
    setTogglingId(userId);
    setOpenMenuId(null);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/users/${userId}/toggle-active`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to toggle active");
      const updated = await response.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: updated.is_active } : u))
      );
      if (selectedUser?.user.id === userId) {
        setSelectedUser((prev) =>
          prev ? { ...prev, user: { ...prev.user, is_active: updated.is_active } } : prev
        );
      }
    } catch (error: unknown) {
      console.error("Toggle active failed:", error);
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          display_name: formData.displayName,
          password: formData.password,
          country: formData.country,
          is_admin: formData.isAdmin,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create user");
      }
      await fetchUsers();
      setShowCreateModal(false);
      setFormData({ email: "", displayName: "", password: "", country: "Nederland", isAdmin: false });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Onbekende fout";
      alert(`Fout: ${msg}`);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.is_active) ||
      (filterStatus === "inactive" && !user.is_active) ||
      (filterStatus === "admin" && user.is_admin);
    return matchesSearch && matchesStatus;
  });

  const activeUsers = users.filter((u) => u.is_active).length;
  const adminUsers = users.filter((u) => u.is_admin).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600 mt-1">Beheer en monitor alle platform-gebruikers</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Gebruiker toevoegen
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-600">Totaal</div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-600">Actief</div>
            <div className="text-2xl font-bold text-emerald-600 mt-2">{activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-600">Admins</div>
            <div className="text-2xl font-bold text-amber-600 mt-2">{adminUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table + Detail panel */}
      <div className={cn("grid gap-6", selectedUser ? "lg:grid-cols-5" : "lg:grid-cols-1")}>
        <Card className={selectedUser ? "lg:col-span-3" : ""}>
          <CardHeader>
            <CardTitle>Alle gebruikers</CardTitle>
            <CardDescription>Zoek, filter en beheer gebruikers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Zoek op naam of email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: "all", label: "Alle statussen" },
                  { value: "active", label: "Actief" },
                  { value: "inactive", label: "Inactief" },
                  { value: "admin", label: "Admins" },
                ]}
                placeholder="Status"
                className="w-full sm:w-44"
              />
              <Button variant="ghost">
                <Download className="h-4 w-4 mr-2" />
                Exporteer
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden" ref={menuRef}>
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Gebruiker</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider hidden md:table-cell">Land</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Rol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider hidden lg:table-cell">Geregistreerd</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Acties</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Gebruikers laden...</td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Geen gebruikers gevonden.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const joinedDate = new Date(user.created_at).toLocaleDateString("nl-NL", {
                        year: "numeric", month: "short", day: "numeric",
                      });
                      const isSelected = selectedUser?.user.id === user.id;
                      const isToggling = togglingId === user.id;

                      return (
                        <tr
                          key={user.id}
                          className={cn(
                            "hover:bg-slate-50 transition-colors cursor-pointer",
                            isSelected && "bg-amber-50 hover:bg-amber-50"
                          )}
                          onClick={() => fetchUserDetail(user.id)}
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">{user.display_name}</div>
                            <div className="text-sm text-slate-500">{user.email}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                            <span className="text-sm text-slate-900">{user.country}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Badge
                              variant={user.is_active ? "default" : "outline"}
                              className={cn(
                                user.is_active
                                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              )}
                            >
                              {user.is_active ? "Actief" : "Inactief"}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Badge
                              variant={user.is_admin ? "default" : "outline"}
                              className={cn(
                                user.is_admin
                                  ? "bg-amber-100 text-amber-700 border-amber-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              )}
                            >
                              {user.is_admin ? "Admin" : "Gebruiker"}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 hidden lg:table-cell">
                            {joinedDate}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="relative inline-block">
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                disabled={isToggling}
                                onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                              {openMenuId === user.id && (
                                <div className="absolute right-0 top-9 z-50 w-52 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
                                  <button
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                    onClick={() => { fetchUserDetail(user.id); setOpenMenuId(null); }}
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                    Gebruiker bekijken
                                  </button>
                                  <div className="border-t border-slate-100 my-1" />
                                  <button
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                    onClick={() => toggleAdmin(user.id)}
                                  >
                                    {user.is_admin ? (
                                      <><ShieldOff className="h-4 w-4 text-amber-500" />Admin verwijderen</>
                                    ) : (
                                      <><Shield className="h-4 w-4 text-amber-500" />Admin maken</>
                                    )}
                                  </button>
                                  <button
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50"
                                    onClick={() => toggleActive(user.id)}
                                  >
                                    {user.is_active ? (
                                      <><UserX className="h-4 w-4 text-red-500" /><span className="text-red-600">Account deactiveren</span></>
                                    ) : (
                                      <><UserCheck className="h-4 w-4 text-emerald-500" /><span className="text-emerald-600">Account activeren</span></>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500">{filteredUsers.length} van {users.length} gebruikers</p>
          </CardContent>
        </Card>

        {/* User Detail Panel */}
        {selectedUser && (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Gebruikersdetail</CardTitle>
                <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelectedUser(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-lg font-bold text-slate-900">{selectedUser.user.display_name}</p>
                <p className="text-sm text-slate-500">{selectedUser.user.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge
                    variant={selectedUser.user.is_active ? "default" : "outline"}
                    className={cn(selectedUser.user.is_active ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600")}
                  >
                    {selectedUser.user.is_active ? "Actief" : "Inactief"}
                  </Badge>
                  {selectedUser.user.is_admin && (
                    <Badge variant="default" className="bg-amber-100 text-amber-700 border-amber-200">Admin</Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Opnames", value: selectedUser.metrics.recordings.total },
                  { label: "Transcripties", value: selectedUser.metrics.transcripts.total },
                  { label: "Hoofdstukken gestart", value: selectedUser.metrics.chapters_started },
                  { label: "Hoofdstukken klaar", value: selectedUser.metrics.chapters_completed },
                  { label: "AI-prompts", value: selectedUser.metrics.prompts.total },
                  { label: "Gedeeld", value: selectedUser.metrics.shares.total },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-xl font-bold text-slate-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Opnameduur</span>
                  <span className="font-medium">{Math.round(selectedUser.metrics.recordings.duration_seconds / 60)} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Opslag</span>
                  <span className="font-medium">{(selectedUser.metrics.recordings.storage_bytes / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Land</span>
                  <span className="font-medium">{selectedUser.user.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Laatste login</span>
                  <span className="font-medium">
                    {selectedUser.user.last_login_at
                      ? new Date(selectedUser.user.last_login_at).toLocaleDateString("nl-NL")
                      : "Nooit"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Onboarding</span>
                  <span className="font-medium">
                    {selectedUser.user.onboarding_completed_at ? "Voltooid" : "Niet voltooid"}
                  </span>
                </div>
              </div>

              {selectedUser.recent_activity.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-2">Recente activiteit</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedUser.recent_activity.slice(0, 8).map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1 flex-shrink-0",
                          activity.type === "recording" ? "bg-amber-500" : "bg-blue-500"
                        )} />
                        <div>
                          <p className="text-slate-700">{activity.description}</p>
                          {activity.timestamp && (
                            <p className="text-slate-400">
                              {new Date(activity.timestamp).toLocaleString("nl-NL")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="ghost"
                  className="flex-1 text-xs"
                  onClick={() => toggleActive(selectedUser.user.id)}
                  disabled={togglingId === selectedUser.user.id}
                >
                  {selectedUser.user.is_active ? (
                    <><UserX className="h-3.5 w-3.5 mr-1 text-red-500" />Deactiveren</>
                  ) : (
                    <><UserCheck className="h-3.5 w-3.5 mr-1 text-emerald-500" />Activeren</>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 text-xs"
                  onClick={() => toggleAdmin(selectedUser.user.id)}
                  disabled={togglingId === selectedUser.user.id}
                >
                  {selectedUser.user.is_admin ? (
                    <><ShieldOff className="h-3.5 w-3.5 mr-1 text-amber-500" />Admin weg</>
                  ) : (
                    <><Shield className="h-3.5 w-3.5 mr-1 text-amber-500" />Admin</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoadingDetail && !selectedUser && (
          <Card className="lg:col-span-2">
            <CardContent className="p-6 flex items-center justify-center h-64">
              <p className="text-slate-500 text-sm">Laden...</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Nieuwe gebruiker</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="gebruiker@voorbeeld.nl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Naam *</label>
                <Input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Jan Jansen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Wachtwoord * (min. 8 tekens)</label>
                <Input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Land</label>
                <Input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Nederland"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={formData.isAdmin}
                  onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <label htmlFor="isAdmin" className="text-sm font-medium text-slate-700">
                  Admin-rechten geven
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isCreating} className="flex-1">
                  {isCreating ? "Aanmaken..." : "Gebruiker aanmaken"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)} disabled={isCreating}>
                  Annuleren
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
