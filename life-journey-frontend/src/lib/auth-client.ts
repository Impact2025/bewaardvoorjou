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
    package_tier?: string;
    package_activated_at?: string | null;
    created_at: string;
    updated_at?: string | null;
  };
  primary_journey_id?: string | null;
}

interface RegisterResponseDto {
  message: string;
  email: string;
}

export interface RegisterPayload {
  displayName: string;
  email: string;
  password: string;
  country: string;
  locale?: string;
  privacyLevel?: string;
  birthYear?: number;
  consentTerms: boolean;
  consentSpecialCategories: boolean;
  consentMarketing: boolean;
  promoCode?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterResult {
  message: string;
  email: string;
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
      packageTier: payload.user.package_tier ?? "NONE",
      packageActivatedAt: payload.user.package_activated_at ?? null,
      createdAt: payload.user.created_at,
      updatedAt: payload.user.updated_at ?? null,
    },
  };
}

export async function registerUser(payload: RegisterPayload): Promise<RegisterResult> {
  const body: Record<string, unknown> = {
    display_name: payload.displayName,
    email: payload.email,
    password: payload.password,
    country: payload.country,
    locale: payload.locale ?? "nl",
    privacy_level: payload.privacyLevel ?? "private",
    consent_terms: payload.consentTerms,
    consent_special_categories: payload.consentSpecialCategories,
    consent_marketing: payload.consentMarketing,
  };

  if (payload.birthYear) {
    body.birth_year = payload.birthYear;
  }
  if (payload.promoCode) {
    body.promo_code = payload.promoCode.trim().toUpperCase();
  }

  const response = await apiFetch<RegisterResponseDto>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return { message: response.message, email: response.email };
}

export async function verifyEmail(token: string): Promise<AuthSession> {
  const response = await apiFetch<AuthResponseDto>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });

  return mapAuthResponse(response);
}

export async function resendVerification(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
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

export async function requestMagicLink(email: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/magic-link", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyMagicLink(token: string): Promise<AuthSession> {
  const response = await apiFetch<AuthResponseDto>(`/auth/magic-link/verify/${token}`, {
    method: "GET",
  });

  return mapAuthResponse(response);
}
