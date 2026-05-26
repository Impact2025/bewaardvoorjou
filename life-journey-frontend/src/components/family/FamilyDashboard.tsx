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

  if (isLoading) return <FamilyDashboardSkeleton />;

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
          <Button onClick={fetchData} variant="ghost" className="mt-4">
            Opnieuw proberen
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Users className="h-4 w-4" />} label="Totaal" value={stats?.total_members || 0} />
        <StatCard icon={<CheckCircle className="h-4 w-4" />} label="Actief" value={stats?.active_members || 0} />
        <StatCard icon={<Clock className="h-4 w-4" />} label="In afwachting" value={stats?.pending_invites || 0} />
        <StatCard icon={<Heart className="h-4 w-4" />} label="Partners" value={stats?.members_by_role?.spouse || 0} />
      </div>

      {/* Invite URL */}
      {lastInviteUrl && (
        <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E6E2DD]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[#333333] text-sm">
                Uitnodiging aangemaakt
              </p>
              <p className="text-xs text-[#555555] mt-0.5 mb-2">
                Deel deze link met je familielid:
              </p>
              <code className="block p-2 bg-white rounded border border-[#E6E2DD] text-xs text-[#333333] break-all">
                {lastInviteUrl}
              </code>
            </div>
            <button
              onClick={copyInviteUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E6E2DD] text-xs font-medium text-[#555555] hover:border-[#FF8C42]/40 hover:text-[#FF8C42] transition-colors shrink-0"
            >
              {copied ? (
                <><Check className="h-3.5 w-3.5" />Gekopieerd</>
              ) : (
                <><Copy className="h-3.5 w-3.5" />Kopiëren</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Family members */}
      <Card className="bg-white border border-[#E6E2DD]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-[#333333]">Familieleden</CardTitle>
            <CardDescription>
              Beheer wie toegang heeft tot je levensverhaal
            </CardDescription>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF8C42] hover:bg-[#F47B3B] text-white text-sm font-semibold transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Toevoegen
          </button>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-[#FF8C42]/50" />
              </div>
              <h3 className="font-medium text-[#333333] mb-2">
                Nog geen familieleden
              </h3>
              <p className="text-sm text-[#555555] mb-5 max-w-sm mx-auto leading-relaxed">
                Nodig familieleden uit om je levensverhaal te delen.
                Zij krijgen toegang tot de hoofdstukken die jij kiest.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF8C42] hover:bg-[#F47B3B] text-white text-sm font-semibold transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Eerste familielid toevoegen
              </button>
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

      <AddFamilyMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddMember}
        isLoading={isSubmitting}
      />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="p-4 rounded-xl border border-[#E6E2DD] bg-white">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[#FF8C42]">{icon}</span>
        <span className="text-xs text-[#999] font-medium">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-[#333333]">{value}</div>
    </div>
  );
}

function FamilyDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Card className="border border-[#E6E2DD]">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
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
