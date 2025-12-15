/**
 * Family ecosystem types for the frontend.
 */

export type FamilyRole =
  | "owner"
  | "spouse"
  | "child"
  | "parent"
  | "sibling"
  | "grandchild"
  | "extended"
  | "friend";

export type AccessLevel = "full" | "selected" | "highlights" | "none";

export type InviteStatus = "pending" | "accepted" | "declined" | "expired";

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: FamilyRole;
  access_level: AccessLevel;
  allowed_chapters: string[] | null;
  invite_status: InviteStatus;
  invite_sent_at: string | null;
  invite_accepted_at: string | null;
  has_account: boolean;
  created_at: string;
}

export interface FamilyMemberList {
  members: FamilyMember[];
  total: number;
}

export interface FamilyInviteResponse {
  member_id: string;
  invite_sent: boolean;
  invite_url: string;
  expires_at: string;
}

export interface FamilyStats {
  total_members: number;
  pending_invites: number;
  active_members: number;
  members_by_role: Record<string, number>;
}

export interface RoleMetadata {
  id: FamilyRole;
  label: string;
  description: string;
  suggested_access: AccessLevel;
  icon: string;
}

export interface CreateFamilyMemberRequest {
  name: string;
  email: string;
  role: FamilyRole;
  access_level?: AccessLevel;
  allowed_chapters?: string[];
  send_invite?: boolean;
}

export interface UpdateFamilyMemberRequest {
  name?: string;
  role?: FamilyRole;
  access_level?: AccessLevel;
  allowed_chapters?: string[];
}

// Role display info
export const ROLE_LABELS: Record<FamilyRole, string> = {
  owner: "Eigenaar",
  spouse: "Partner",
  child: "Kind",
  parent: "Ouder",
  sibling: "Broer/Zus",
  grandchild: "Kleinkind",
  extended: "Familie",
  friend: "Vriend(in)",
};

export const ACCESS_LABELS: Record<AccessLevel, string> = {
  full: "Volledige toegang",
  selected: "Geselecteerde hoofdstukken",
  highlights: "Alleen hoogtepunten",
  none: "Geen toegang",
};

export const INVITE_STATUS_LABELS: Record<InviteStatus, string> = {
  pending: "Uitnodiging verstuurd",
  accepted: "Geaccepteerd",
  declined: "Afgewezen",
  expired: "Verlopen",
};

// Colors for roles and statuses
export const ROLE_COLORS: Record<FamilyRole, { bg: string; text: string }> = {
  owner: { bg: "bg-amber-100", text: "text-amber-700" },
  spouse: { bg: "bg-pink-100", text: "text-pink-700" },
  child: { bg: "bg-blue-100", text: "text-blue-700" },
  parent: { bg: "bg-purple-100", text: "text-purple-700" },
  sibling: { bg: "bg-teal-100", text: "text-teal-700" },
  grandchild: { bg: "bg-emerald-100", text: "text-emerald-700" },
  extended: { bg: "bg-slate-100", text: "text-slate-700" },
  friend: { bg: "bg-orange-100", text: "text-orange-700" },
};

export const STATUS_COLORS: Record<InviteStatus, { bg: string; text: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
  accepted: { bg: "bg-green-100", text: "text-green-700" },
  declined: { bg: "bg-red-100", text: "text-red-700" },
  expired: { bg: "bg-slate-100", text: "text-slate-500" },
};
