import { apiFetch } from "./client";
import type { AuthSession } from "@/lib/types";

export interface LoginRequest {
  username: string;  // FastAPI uses 'username' field for email
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  country: string;
  locale: string;
  birthYear?: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

/**
 * Login user with email and password
 */
export async function login(email: string, password: string): Promise<AuthSession> {
  // FastAPI OAuth2 form expects 'username' field
  const formData = new FormData();
  formData.append("username", email);
  formData.append("password", password);

  const response = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: formData,
  });

  // Fetch user profile with token
  const user = await apiFetch<any>("/auth/me", {
    method: "GET",
  }, {
    token: response.access_token,
  });

  return {
    token: response.access_token,
    tokenType: response.token_type,
    user: {
      id: user.id,
      displayName: user.display_name || user.email,
      email: user.email,
      country: user.country || "NL",
      locale: user.locale || "nl",
      birthYear: user.birth_year,
      privacyLevel: user.privacy_level || "private",
      isAdmin: user.is_admin,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    },
    primaryJourneyId: user.primary_journey_id || null,
  };
}

/**
 * Register new user
 */
export async function register(data: RegisterRequest): Promise<AuthSession> {
  const response = await apiFetch<any>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      display_name: data.displayName,
      country: data.country,
      locale: data.locale,
      birth_year: data.birthYear,
    }),
  });

  // Auto-login after successful registration
  return login(data.email, data.password);
}

/**
 * Get current user profile
 */
export async function getCurrentUser(token: string): Promise<AuthSession> {
  const user = await apiFetch<any>("/auth/me", {
    method: "GET",
  }, {
    token,
  });

  return {
    token,
    tokenType: "bearer",
    user: {
      id: user.id,
      displayName: user.display_name || user.email,
      email: user.email,
      country: user.country || "NL",
      locale: user.locale || "nl",
      birthYear: user.birth_year,
      privacyLevel: user.privacy_level || "private",
      isAdmin: user.is_admin,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    },
    primaryJourneyId: user.primary_journey_id || null,
  };
}

/**
 * Logout user (client-side only, token invalidation handled on backend if needed)
 */
export async function logout(): Promise<void> {
  // For now, just client-side logout
  // Backend could implement token blacklist if needed
  return Promise.resolve();
}
