/**
 * Onboarding 2.0 API Client
 *
 * Handles all onboarding-related API calls with progress persistence.
 */

import { apiFetch } from "@/lib/api-client";
import type {
  SaveProgressRequest,
  SaveProgressResponse,
  GetProgressResponse,
  CompleteOnboardingRequest,
  CompleteOnboardingResponse,
} from "./onboarding-types";

/**
 * Get the user's current onboarding progress.
 */
export async function getOnboardingProgress(
  token: string
): Promise<GetProgressResponse> {
  return apiFetch<GetProgressResponse>(
    "/onboarding/progress",
    { method: "GET" },
    { token }
  );
}

/**
 * Save onboarding progress.
 * This allows users to save their progress and continue later.
 */
export async function saveOnboardingProgress(
  token: string,
  data: SaveProgressRequest
): Promise<SaveProgressResponse> {
  return apiFetch<SaveProgressResponse>(
    "/onboarding/progress",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    { token }
  );
}

/**
 * Complete the onboarding wizard and create the user's journey.
 */
export async function completeOnboarding(
  token: string,
  data: CompleteOnboardingRequest
): Promise<CompleteOnboardingResponse> {
  return apiFetch<CompleteOnboardingResponse>(
    "/onboarding/complete",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    { token }
  );
}

/**
 * Reset onboarding progress (for starting over).
 */
export async function resetOnboardingProgress(token: string): Promise<void> {
  await apiFetch<void>(
    "/onboarding/progress",
    { method: "DELETE" },
    { token }
  );
}
