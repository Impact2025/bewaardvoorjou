"use client";

import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { ChatOnboarding } from "@/components/onboarding/ChatOnboarding";

function OnboardingContent() {
  return (
    <AppShell
      title="Jouw verhaal starten"
      description="Een paar vragen om alles voor je klaar te zetten."
      activeHref="/onboarding"
    >
      <ChatOnboarding />
    </AppShell>
  );
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingContent />
    </ProtectedRoute>
  );
}
