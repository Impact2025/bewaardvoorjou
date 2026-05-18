import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/store/auth-context";

const mockSession = {
  token: "tok-123",
  tokenType: "bearer",
  primaryJourneyId: "j-1",
  user: { id: "u-1", displayName: "Test", email: "t@t.nl", country: "NL", locale: "nl", birthYear: null, privacyLevel: "private", isAdmin: false, createdAt: "2025-01-01T00:00:00Z", updatedAt: null },
};

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with null session when localStorage is empty", () => {
    let capturedSession: unknown = "not-set";
    function Inspector() {
      const { session, isLoading } = useAuth();
      if (!isLoading) capturedSession = session;
      return null;
    }
    act(() => {
      render(<AuthProvider><Inspector /></AuthProvider>);
    });
    expect(capturedSession).toBeNull();
  });

  it("reads session from localStorage on mount", () => {
    localStorage.setItem("life-journey.auth", JSON.stringify(mockSession));
    let capturedSession: unknown = "not-set";
    function Inspector() {
      const { session, isLoading } = useAuth();
      if (!isLoading) capturedSession = session;
      return null;
    }
    act(() => {
      render(<AuthProvider><Inspector /></AuthProvider>);
    });
    expect((capturedSession as typeof mockSession)?.token).toBe("tok-123");
  });

  it("clearSession removes from localStorage", () => {
    localStorage.setItem("life-journey.auth", JSON.stringify(mockSession));
    let clearFn: (() => void) | null = null;
    function Inspector() {
      const { clearSession } = useAuth();
      clearFn = clearSession;
      return null;
    }
    act(() => {
      render(<AuthProvider><Inspector /></AuthProvider>);
    });
    act(() => { clearFn?.(); });
    expect(localStorage.getItem("life-journey.auth")).toBeNull();
  });
});
