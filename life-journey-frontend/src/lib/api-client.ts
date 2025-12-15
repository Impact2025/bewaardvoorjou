import { API_BASE_URL } from "@/lib/config";

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiOptions {
  token?: string;
  retries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
}

/**
 * Enhanced API client with error handling, retry logic, and better error messages
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  options?: ApiOptions,
): Promise<T> {
  const {
    token,
    retries = 0,
    retryDelay = 1000,
    signal,
  } = options ?? {};

  let attempt = 0;
  let lastError: ApiError | null = null;

  while (attempt <= retries) {
    try {
      const headers = new Headers(init?.headers ?? {});
      const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;

      if (!isFormData && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers,
        signal: signal ?? init?.signal,
      });

      const rawBody = await response.text();

      if (!response.ok) {
        let message = rawBody;
        let code: string | undefined;
        let details: Record<string, unknown> | undefined;

        try {
          const parsed = JSON.parse(rawBody) as {
            detail?: string | { msg: string; type: string }[];
            message?: string;
            code?: string;
          };

          // Handle FastAPI validation errors
          if (Array.isArray(parsed.detail)) {
            message = parsed.detail.map((err) => err.msg).join(", ");
            code = "VALIDATION_ERROR";
            details = { validation_errors: parsed.detail };
          } else {
            message = parsed.detail ?? parsed.message ?? rawBody;
            code = parsed.code;
          }
        } catch {
          // keep raw message
        }

        const error: ApiError = {
          message: getUserFriendlyErrorMessage(response.status, message),
          status: response.status,
          code,
          details,
        };

        // Only retry on network errors or 5xx errors
        if (response.status >= 500 && attempt < retries) {
          lastError = error;
          attempt++;
          await sleep(retryDelay * attempt); // Exponential backoff
          continue;
        }

        throw error;
      }

      if (!rawBody) {
        return undefined as T;
      }

      try {
        return JSON.parse(rawBody) as T;
      } catch {
        return rawBody as unknown as T;
      }
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        const networkError: ApiError = {
          message: "Geen verbinding met de server. Controleer je internetverbinding.",
          status: 0,
          code: "NETWORK_ERROR",
        };

        if (attempt < retries) {
          lastError = networkError;
          attempt++;
          await sleep(retryDelay * attempt);
          continue;
        }

        throw networkError;
      }

      // Re-throw ApiError or other errors
      throw error;
    }
  }

  // If we exhausted retries, throw the last error
  if (lastError) {
    throw lastError;
  }

  // This should never happen, but TypeScript doesn't know that
  throw new Error("Unexpected error in apiFetch");
}

/**
 * Get user-friendly error messages based on HTTP status codes
 */
function getUserFriendlyErrorMessage(status: number, originalMessage: string): string {
  // Return original message if it's already user-friendly
  if (!originalMessage.toLowerCase().includes("error") && originalMessage.length < 100) {
    return originalMessage;
  }

  const statusMessages: Record<number, string> = {
    400: "Ongeldige aanvraag. Controleer je invoer en probeer opnieuw.",
    401: "Je bent niet ingelogd. Log opnieuw in om door te gaan.",
    403: "Je hebt geen toegang tot deze resource.",
    404: "De gevraagde resource is niet gevonden.",
    409: "Er is een conflict opgetreden. Deze actie kan niet worden uitgevoerd.",
    422: "De ingevoerde gegevens zijn ongeldig. Controleer je invoer.",
    429: "Te veel verzoeken. Wacht even en probeer opnieuw.",
    500: "Er is een serverfout opgetreden. Probeer het later opnieuw.",
    502: "De server is tijdelijk niet bereikbaar. Probeer het later opnieuw.",
    503: "De service is tijdelijk niet beschikbaar. Probeer het later opnieuw.",
  };

  return statusMessages[status] ?? originalMessage;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "status" in error &&
    typeof (error as ApiError).status === "number"
  );
}
