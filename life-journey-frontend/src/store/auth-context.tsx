"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PropsWithChildren } from "react";
import type { AuthSession } from "@/lib/types";

interface AuthContextValue {
  session: AuthSession | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "life-journey.auth";

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AuthSession;
        // Ensure the user object has all required properties
        if (parsed.user) {
          parsed.user.displayName = parsed.user.displayName || parsed.user.email || "User";
          parsed.user.email = parsed.user.email || "";
        }
        parsed.primaryJourneyId = parsed.primaryJourneyId ?? null;
        setSessionState(parsed);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const setSession = (newSession: AuthSession) => {
      const normalized: AuthSession = {
        ...newSession,
        // Ensure the user object has all required properties
        user: {
          ...newSession.user,
          displayName: newSession.user.displayName || newSession.user.email || "User"
        },
        primaryJourneyId: newSession.primaryJourneyId ?? null,
      };
      setSessionState(normalized);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      }
    };

    const clearSession = () => {
      setSessionState(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    };

    return {
      session,
      setSession,
      clearSession,
      isLoading,
    };
  }, [session, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}