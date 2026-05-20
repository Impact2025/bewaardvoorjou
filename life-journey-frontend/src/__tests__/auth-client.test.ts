import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerUser, loginUser } from "@/lib/auth-client";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

vi.mock("@/lib/config", () => ({ API_BASE_URL: "http://localhost:8001/api/v1" }));

const mockAuthResponse = {
  access_token: "test-token-123",
  token_type: "bearer",
  primary_journey_id: "journey-1",
  user: {
    id: "user-1",
    display_name: "Test User",
    email: "test@example.com",
    country: "NL",
    locale: "nl",
    birth_year: null,
    privacy_level: "private",
    is_admin: false,
    created_at: "2025-01-01T00:00:00Z",
  },
};

beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockResolvedValue({
    ok: true,
    text: async () => JSON.stringify(mockAuthResponse),
  });
});

const mockRegisterResponse = {
  message: "Account aangemaakt. Controleer je inbox om je e-mailadres te bevestigen.",
  email: "t@t.nl",
};

describe("registerUser", () => {
  it("calls /auth/register with POST", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockRegisterResponse),
    });
    await registerUser({ displayName: "Test", email: "t@t.nl", password: "pass123", country: "NL" });
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8001/api/v1/auth/register",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("returns message and email", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(mockRegisterResponse),
    });
    const result = await registerUser({ displayName: "Test", email: "t@t.nl", password: "pass123", country: "NL" });
    expect(result.message).toContain("inbox");
    expect(result.email).toBe("t@t.nl");
  });
});

describe("loginUser", () => {
  it("calls /auth/login with POST", async () => {
    await loginUser({ email: "t@t.nl", password: "pass123" });
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8001/api/v1/auth/login",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("maps response to AuthSession", async () => {
    const session = await loginUser({ email: "t@t.nl", password: "pass123" });
    expect(session.token).toBe("test-token-123");
    expect(session.user.email).toBe("test@example.com");
  });
});
