"use client";

import { JourneyProvider } from "@/store/journey-store";
import { AuthProvider } from "@/store/auth-context";
import { ErrorBoundary } from "@/components/error-boundary";
import { AccessibilityProvider } from "@/lib/accessibility-context";
import { ToastProvider } from "@/components/ui/toast";
import type { PropsWithChildren } from "react";

export function Providers({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <AuthProvider>
          <JourneyProvider>
            <ToastProvider>{children}</ToastProvider>
          </JourneyProvider>
        </AuthProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}
