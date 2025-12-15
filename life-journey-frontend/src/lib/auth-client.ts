import { apiFetch } from "@/lib/api-client";
import type { AuthSession } from "@/lib/types";

interface AuthResponseDto {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    display_name: string;
    email: string;
    country: string;
    locale: string;
    birth_year?: number | null;
    privacy_level: string;
    is_admin?: boolean;
    created_at: string;
    updated_at?: string | null;
  };
  primary_journey_id?: string | null;
}

export interface RegisterPayload {
  displayName: string;
  email: string;
  password: string;
  country: string;
  locale?: string;
  privacyLevel?: string;
  birthYear?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

function mapAuthResponse(payload: AuthResponseDto): AuthSession {
  return {
    token: payload.access_token,
    tokenType: payload.token_type,
    primaryJourneyId: payload.primary_journey_id ?? null,
    user: {
      id: payload.user.id,
      displayName: payload.user.display_name,
      email: payload.user.email,
      country: payload.user.country,
      locale: payload.user.locale,
      birthYear: payload.user.birth_year ?? null,
      privacyLevel: payload.user.privacy_level,
      isAdmin: payload.user.is_admin ?? false,
      createdAt: payload.user.created_at,
      updatedAt: payload.user.updated_at ?? null,
    },
  };
}

export async function registerUser(payload: RegisterPayload): Promise<AuthSession> {
  const body: Record<string, unknown> = {
    display_name: payload.displayName,
    email: payload.email,
    password: payload.password,
    country: payload.country,
    locale: payload.locale ?? "nl",
    privacy_level: payload.privacyLevel ?? "private",
  };

  if (payload.birthYear) {
    body.birth_year = payload.birthYear;
  }

  const response = await apiFetch<AuthResponseDto>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return mapAuthResponse(response);
}

export async function loginUser(payload: LoginPayload): Promise<AuthSession> {
  const response = await apiFetch<AuthResponseDto>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
  });

  return mapAuthResponse(response);
}
