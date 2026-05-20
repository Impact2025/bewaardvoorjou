"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AccessibilityState {
  largeText: boolean;
  highContrast: boolean;
}

interface AccessibilityContextValue extends AccessibilityState {
  toggleLargeText: () => void;
  toggleHighContrast: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

const STORAGE_KEY = "bvj.accessibility";

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccessibilityState>({
    largeText: false,
    highContrast: false,
  });

  // Laad opgeslagen voorkeur bij start
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AccessibilityState;
        setState(parsed);
        applyToHtml(parsed);
      }
    } catch {
      // localStorage niet beschikbaar — geen probleem
    }
  }, []);

  function applyToHtml(s: AccessibilityState) {
    const html = document.documentElement;
    html.setAttribute("data-large-text", String(s.largeText));
    html.setAttribute("data-high-contrast", String(s.highContrast));
  }

  function update(next: AccessibilityState) {
    setState(next);
    applyToHtml(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function toggleLargeText() {
    update({ ...state, largeText: !state.largeText });
  }

  function toggleHighContrast() {
    update({ ...state, highContrast: !state.highContrast });
  }

  return (
    <AccessibilityContext.Provider value={{ ...state, toggleLargeText, toggleHighContrast }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
