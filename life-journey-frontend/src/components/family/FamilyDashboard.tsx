"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth-context";
import {
  listFamilyMembers,
  getFamilyStats,
  addFamilyMember,
  removeFamilyMember,
  resendInvitation,
} from "@/lib/family-client";
import type {
  FamilyMember,
  FamilyStats,
  CreateFamilyMemberRequest,
} from "@/lib/family-types";
import { ROLE_LABELS } from "@/lib/family-types";
import { FamilyMemberCard } from "./FamilyMemberCard";
import { AddFamilyMemberModal } from "./AddFamilyMemberModal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { logger } from "@/lib/logger";
import {
  UserPlus,
  Users,
  Clock,
  CheckCircle,
  Heart,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

interface FamilyDashboardProps {
  journeyId: string;
  className?: string;
}

export function FamilyDashboard({ journeyId, className }: FamilyDashboardProps) {
  const { session } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [stats, setStats] = useState<FamilyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    if (!session?.token || !journeyId) return;

    try {
      setIsLoading(true);
      setError(null);

      const [membersData, statsData] = await Promise.all([
        listFamilyMembers(session.token, journeyId),
        getFamilyStats(session.token, journeyId),
      ]);

      setMembers(membersData.members);
      setStats(statsData);
    } catch (err) {
      logger.error("Failed to fetch family data", err);
      setError("Kon familiegegevens niet laden");
    } finally {
      setIsLoading(false);
    }
  }, [session?.token, journeyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddMember = async (data: CreateFamilyMemberRequest) => {
    if (!session?.token) return;

    setIsSubmitting(true);
    try {
      const response = await addFamilyMember(session.token, journeyId, data);
      setLastInviteUrl(response.invite_url);
      await fetchData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (member: FamilyMember) => {
    if (!session?.token) return;
    if (!confirm(`Weet je zeker dat je ${member.name} wilt verwijderen?`)) return;

    try {
      await removeFamilyMember(session.token, journeyId, member.id);
      await fetchData();
    } catch (err) {
      logger.error("Failed to remove family member", err);
    }
  };

  const handleResendInvite = async (member: FamilyMember) => {
    if (!session?.token) return;

    try {
      const response = await resendInvitation(session.token, journeyId, member.id);
      setLastInviteUrl(response.invite_url);
      await fetchData();
    } catch (err) {
      logger.error("Failed to resend invitation", err);
    }
  };

  const copyInviteUrl = () => {
    if (!lastInviteUrl) return;
    navigator.clipboard.writeText(lastInviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <FamilyDashboardSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
          <Button onClick={fetchData} variant="outline" className="mt-4">
            Opnieuw proberen
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="h-5 w-5 text-blue-500" />}
          label="Totaal"
          value={stats?.total_members || 0}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5 text-emerald-500" />}
          label="Actief"
          value={stats?.active_members || 0}
          color="emerald"
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          label="In afwachting"
          value={stats?.pending_invites || 0}
          color="amber"
        />
        <StatCard
          icon={<Heart className="h-5 w-5 text-pink-500" />}
          label="Partners"
          value={stats?.members_by_role?.spouse || 0}
          color="pink"
        />
      </div>

      {/* Invite URL notification */}
      {lastInviteUrl && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-teal-900">
                Uitnodiging aangemaakt!
              </p>
              <p className="text-sm text-teal-700 mt-1">
                Deel deze link met je familielid:
              </p>
              <code className="block mt-2 p-2 bg-white rounded text-sm text-teal-800 break-all">
                {lastInviteUrl}
              </code>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyInviteUrl}
              className="border-teal-300 text-teal-700 hover:bg-teal-100 flex-shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Gekopieerd
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Kopiëren
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Family members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Familieleden</CardTitle>
            <CardDescription>
              Beheer wie toegang heeft tot je levensverhaal
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Toevoegen
          </Button>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <h3 className="font-medium text-slate-900 mb-2">
                Nog geen familieleden
              </h3>
              <p className="text-slate-600 mb-4 max-w-sm mx-auto">
                Nodig familieleden uit om je levensverhaal te delen.
                Zij krijgen toegang tot de hoofdstukken die jij kiest.
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Eerste familielid toevoegen
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <FamilyMemberCard
                  key={member.id}
                  member={member}
                  onEdit={(m) => logger.info("Edit member", { id: m.id })}
                  onResendInvite={handleResendInvite}
                  onRemove={handleRemoveMember}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add member modal */}
      <AddFamilyMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddMember}
        isLoading={isSubmitting}
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "emerald" | "amber" | "pink";
}

const colorClasses = {
  blue: "bg-blue-50 border-blue-200",
  emerald: "bg-emerald-50 border-emerald-200",
  amber: "bg-amber-50 border-amber-200",
  pink: "bg-pink-50 border-pink-200",
};

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className={cn("p-4 rounded-xl border", colorClasses[color])}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function FamilyDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FamilyDashboard;
