"use client";

import { useRouter } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default function OnboardingWizardPage() {
  const router = useRouter();

  const handleComplete = (journeyId: string) => {
    // Redirect to dashboard after successful onboarding
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-cream to-warm-sand/30">
      <OnboardingWizard onComplete={handleComplete} />
    </div>
  );
}
