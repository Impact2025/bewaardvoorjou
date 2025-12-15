/**
 * Onboarding Components
 *
 * Two onboarding approaches:
 * 1. OnboardingModal - Quick slideshow for returning users or feature overview
 * 2. OnboardingWizard - Full wizard with data collection for new users
 */

// Original slideshow modal
export { OnboardingModal, hasSeenOnboarding, resetOnboarding } from "./onboarding-modal";
export { OnboardingSlideComponent } from "./onboarding-slide";
export { onboardingSlides } from "./onboarding-data";
export type { OnboardingSlide } from "./onboarding-data";

// New wizard for new users
export { OnboardingWizard } from "./OnboardingWizard";
