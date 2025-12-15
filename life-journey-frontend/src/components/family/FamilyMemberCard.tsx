"use client";

import { cn } from "@/lib/utils";
import type { FamilyMember } from "@/lib/family-types";
import {
  ROLE_LABELS,
  ACCESS_LABELS,
  INVITE_STATUS_LABELS,
  ROLE_COLORS,
  STATUS_COLORS,
} from "@/lib/family-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Baby,
  Users,
  Home,
  Smile,
  Sparkles,
  Mail,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  Edit,
  Check,
  Clock,
  X,
} from "lucide-react";
import { useState } from "react";

// Map roles to icons
const RoleIcons: Record<string, typeof Heart> = {
  spouse: Heart,
  child: Baby,
  parent: Users,
  sibling: Users,
  grandchild: Sparkles,
  extended: Home,
  friend: Smile,
};

interface FamilyMemberCardProps {
  member: FamilyMember;
  onEdit?: (member: FamilyMember) => void;
  onResendInvite?: (member: FamilyMember) => void;
  onRemove?: (member: FamilyMember) => void;
}

export function FamilyMemberCard({
  member,
  onEdit,
  onResendInvite,
  onRemove,
}: FamilyMemberCardProps) {
  const [showActions, setShowActions] = useState(false);

  const RoleIcon = RoleIcons[member.role] || Users;
  const roleColors = ROLE_COLORS[member.role];
  const statusColors = STATUS_COLORS[member.invite_status];

  const StatusIcon = {
    pending: Clock,
    accepted: Check,
    declined: X,
    expired: Clock,
  }[member.invite_status];

  const canResendInvite = member.invite_status === "pending" || member.invite_status === "expired";

  return (
    <div className="relative group">
      <div
        className={cn(
          "p-4 rounded-xl border-2 transition-all",
          "hover:shadow-md",
          member.invite_status === "accepted"
            ? "bg-white border-slate-200"
            : "bg-slate-50 border-slate-200 border-dashed",
        )}
      >
        {/* Header with icon and role */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", roleColors.bg)}>
              <RoleIcon className={cn("h-5 w-5", roleColors.text)} />
            </div>
            <div>
              <h4 className="font-medium text-slate-900">{member.name}</h4>
              <p className="text-sm text-slate-500">{member.email}</p>
            </div>
          </div>

          {/* Actions menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>

            {showActions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                  <button
                    onClick={() => {
                      setShowActions(false);
                      onEdit?.(member);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Bewerken
                  </button>
                  {canResendInvite && (
                    <button
                      onClick={() => {
                        setShowActions(false);
                        onResendInvite?.(member);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Opnieuw uitnodigen
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowActions(false);
                      onRemove?.(member);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Verwijderen
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className={cn(roleColors.bg, roleColors.text, "border-0")}>
            {ROLE_LABELS[member.role]}
          </Badge>

          <Badge
            variant="outline"
            className={cn(statusColors.bg, statusColors.text, "border-0")}
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {INVITE_STATUS_LABELS[member.invite_status]}
          </Badge>

          {member.invite_status === "accepted" && (
            <Badge variant="outline" className="border-slate-300">
              {ACCESS_LABELS[member.access_level]}
            </Badge>
          )}
        </div>

        {/* Invite info for pending members */}
        {member.invite_status === "pending" && member.invite_sent_at && (
          <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
            <Mail className="h-3 w-3" />
            Uitnodiging verstuurd op{" "}
            {new Date(member.invite_sent_at).toLocaleDateString("nl-NL")}
          </p>
        )}
      </div>
    </div>
  );
}

export default FamilyMemberCard;
