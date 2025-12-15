/**
 * Family ecosystem API client.
 */

import { apiFetch } from "./api-client";
import type {
  FamilyMember,
  FamilyMemberList,
  FamilyInviteResponse,
  FamilyStats,
  RoleMetadata,
  CreateFamilyMemberRequest,
  UpdateFamilyMemberRequest,
} from "./family-types";

/**
 * Get all available family roles with metadata.
 */
export async function getFamilyRoles(token: string): Promise<RoleMetadata[]> {
  return apiFetch<RoleMetadata[]>("/family/roles", { method: "GET" }, { token });
}

/**
 * List all family members for a journey.
 */
export async function listFamilyMembers(
  token: string,
  journeyId: string,
): Promise<FamilyMemberList> {
  return apiFetch<FamilyMemberList>(
    `/family/${journeyId}/members`,
    { method: "GET" },
    { token },
  );
}

/**
 * Get a specific family member.
 */
export async function getFamilyMember(
  token: string,
  journeyId: string,
  memberId: string,
): Promise<FamilyMember> {
  return apiFetch<FamilyMember>(
    `/family/${journeyId}/members/${memberId}`,
    { method: "GET" },
    { token },
  );
}

/**
 * Add a new family member and send invitation.
 */
export async function addFamilyMember(
  token: string,
  journeyId: string,
  request: CreateFamilyMemberRequest,
): Promise<FamilyInviteResponse> {
  return apiFetch<FamilyInviteResponse>(
    `/family/${journeyId}/members`,
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    { token },
  );
}

/**
 * Update a family member's details.
 */
export async function updateFamilyMember(
  token: string,
  journeyId: string,
  memberId: string,
  request: UpdateFamilyMemberRequest,
): Promise<FamilyMember> {
  return apiFetch<FamilyMember>(
    `/family/${journeyId}/members/${memberId}`,
    {
      method: "PUT",
      body: JSON.stringify(request),
    },
    { token },
  );
}

/**
 * Remove a family member.
 */
export async function removeFamilyMember(
  token: string,
  journeyId: string,
  memberId: string,
): Promise<void> {
  await apiFetch<{ status: string }>(
    `/family/${journeyId}/members/${memberId}`,
    { method: "DELETE" },
    { token },
  );
}

/**
 * Resend invitation to a family member.
 */
export async function resendInvitation(
  token: string,
  journeyId: string,
  memberId: string,
  customMessage?: string,
): Promise<FamilyInviteResponse> {
  return apiFetch<FamilyInviteResponse>(
    `/family/${journeyId}/members/${memberId}/resend-invite`,
    {
      method: "POST",
      body: JSON.stringify({ custom_message: customMessage }),
    },
    { token },
  );
}

/**
 * Get family statistics for a journey.
 */
export async function getFamilyStats(
  token: string,
  journeyId: string,
): Promise<FamilyStats> {
  return apiFetch<FamilyStats>(
    `/family/${journeyId}/stats`,
    { method: "GET" },
    { token },
  );
}

/**
 * Accept a family invitation (public endpoint).
 */
export async function acceptInvitation(
  inviteToken: string,
): Promise<{
  success: boolean;
  journey_title: string;
  inviter_name: string;
  access_level: string;
  requires_login: boolean;
  login_url: string | null;
}> {
  return apiFetch(
    "/family/accept-invite",
    {
      method: "POST",
      body: JSON.stringify({ token: inviteToken }),
    },
  );
}

/**
 * Decline a family invitation (public endpoint).
 */
export async function declineInvitation(inviteToken: string): Promise<void> {
  await apiFetch(
    "/family/decline-invite",
    {
      method: "POST",
      body: JSON.stringify({ token: inviteToken }),
    },
  );
}
