"use client";

import { JourneyProvider } from "@/store/journey-store";
import { AuthProvider } from "@/store/auth-context";
import { ErrorBoundary } from "@/components/error-boundary";
import type { PropsWithChildren } from "react";

export function Providers({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <JourneyProvider>{children}</JourneyProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
