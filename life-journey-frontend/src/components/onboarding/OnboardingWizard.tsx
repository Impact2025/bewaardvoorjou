"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth-context";
import {
  getOnboardingProgress,
  saveOnboardingProgress,
  completeOnboarding,
} from "@/lib/onboarding-client";
import type {
  OnboardingStep,
  OnboardingProgress,
  PersonalInfoData,
  StoryPurposeData,
  RecordingPrefsData,
  PrivacySettingsData,
  ChapterSelectionData,
  AccessibilityPrefs,
} from "@/lib/onboarding-types";
import {
  STEP_ORDER,
  STEP_LABELS,
  getStepIndex,
  getNextStep,
  getPrevStep,
  getProgressPercentage,
} from "@/lib/onboarding-types";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
import {
   ChevronLeft,
   ChevronRight,
   Sparkles,
   User,
   Mic,
   Target,
   Video,
   Lock,
   BookOpen,
   Accessibility,
   Check,
   Loader2,
} from "lucide-react";

// Step components
import { WelcomeStep } from "./steps/WelcomeStep";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { FirstMemoryStep } from "./steps/FirstMemoryStep";
import { StoryPurposeStep } from "./steps/StoryPurposeStep";
import { RecordingPrefsStep } from "./steps/RecordingPrefsStep";
import { PrivacyStep } from "./steps/PrivacyStep";
import { ChapterSelectionStep } from "./steps/ChapterSelectionStep";
import { AccessibilityStep } from "./steps/AccessibilityStep";
import { CompleteStep } from "./steps/CompleteStep";

const STEP_ICONS: Record<OnboardingStep, typeof Sparkles> = {
   welcome: Sparkles,
   personal_info: User,
   first_memory: Mic,
   story_purpose: Target,
   recording_preferences: Video,
   privacy_settings: Lock,
   chapter_selection: BookOpen,
   accessibility: Accessibility,
   complete: Check,
};

interface OnboardingWizardProps {
  onComplete?: (journeyId: string) => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const router = useRouter();
  const { session } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({
    display_name: "",
    family_photo: undefined,
  });
  const [storyPurpose, setStoryPurpose] = useState<StoryPurposeData>({
    purpose: "legacy",
    recipients: [],
  });
  const [recordingPrefs, setRecordingPrefs] = useState<RecordingPrefsData>({
    preferred_method: "mixed",
    session_reminder: true,
    ai_assistance: "full",
  });
  const [privacySettings, setPrivacySettings] = useState<PrivacySettingsData>({
    privacy_level: "trusted",
    auto_backup: true,
    analytics_consent: false,
  });
  const [chapterSelection, setChapterSelection] = useState<ChapterSelectionData>({
    selected_phases: ["intro", "youth", "love", "work", "future"],
  });
  const [accessibility, setAccessibility] = useState<AccessibilityPrefs>({
    captions: false,
    high_contrast: false,
    large_text: false,
  });

  // Load existing progress
  useEffect(() => {
    async function loadProgress() {
      if (!session?.token) return;

      try {
        const response = await getOnboardingProgress(session.token);
        if (response.has_progress && response.progress) {
          const p = response.progress;
          setCurrentStep(p.current_step);
          if (p.personal_info) setPersonalInfo(p.personal_info);
          if (p.story_purpose) setStoryPurpose(p.story_purpose);
          if (p.recording_prefs) setRecordingPrefs(p.recording_prefs);
          if (p.privacy_settings) setPrivacySettings(p.privacy_settings);
          if (p.chapter_selection) setChapterSelection(p.chapter_selection);
          if (p.accessibility) setAccessibility(p.accessibility);
        }
      } catch (err) {
        logger.error("Failed to load onboarding progress", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProgress();
  }, [session?.token]);

  // Save progress to server
  const saveProgress = useCallback(async (step: OnboardingStep) => {
    if (!session?.token) return;

    try {
      setIsSaving(true);
      await saveOnboardingProgress(session.token, {
        current_step: step,
        personal_info: personalInfo,
        story_purpose: storyPurpose,
        recording_prefs: recordingPrefs,
        privacy_settings: privacySettings,
        chapter_selection: chapterSelection,
        accessibility: accessibility,
      });
    } catch (err) {
      logger.error("Failed to save progress", err);
    } finally {
      setIsSaving(false);
    }
  }, [session?.token, personalInfo, storyPurpose, recordingPrefs, privacySettings, chapterSelection, accessibility]);

  // Navigate to next step
  const handleNext = useCallback(async () => {
    const next = getNextStep(currentStep);
    if (next) {
      await saveProgress(next);
      setCurrentStep(next);
    }
  }, [currentStep, saveProgress]);

  // Navigate to previous step
  const handlePrev = useCallback(() => {
    const prev = getPrevStep(currentStep);
    if (prev) {
      setCurrentStep(prev);
    }
  }, [currentStep]);

  // Complete onboarding
  const handleComplete = useCallback(async () => {
    if (!session?.token) return;

    try {
      setIsSaving(true);
      setError(null);

      const response = await completeOnboarding(session.token, {
        personal_info: personalInfo,
        story_purpose: storyPurpose,
        recording_prefs: recordingPrefs,
        privacy_settings: privacySettings,
        chapter_selection: chapterSelection,
        accessibility: accessibility,
      });

      logger.info("Onboarding completed", { journeyId: response.journey_id });

      if (onComplete) {
        onComplete(response.journey_id);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      logger.error("Failed to complete onboarding", err);
      setError("Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setIsSaving(false);
    }
  }, [
    session?.token,
    personalInfo,
    storyPurpose,
    recordingPrefs,
    privacySettings,
    chapterSelection,
    accessibility,
    onComplete,
    router,
  ]);

  // Validate current step before proceeding
  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case "personal_info":
        return personalInfo.display_name.trim().length >= 2;
      case "story_purpose":
        return !!storyPurpose.purpose;
      case "chapter_selection":
        return chapterSelection.selected_phases.length > 0;
      default:
        return true;
    }
  }, [currentStep, personalInfo, storyPurpose, chapterSelection]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange mx-auto mb-4" />
          <p className="text-slate-600">Even geduld...</p>
        </div>
      </div>
    );
  }

  const progress = getProgressPercentage(currentStep);
  const stepIndex = getStepIndex(currentStep);
  const isFirstStep = stepIndex === 0;
  const isLastStep = currentStep === "complete";

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <div
          className="h-full bg-orange transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="hidden md:flex fixed left-8 top-1/2 -translate-y-1/2 flex-col gap-3 z-40">
        {STEP_ORDER.slice(0, -1).map((step, index) => {
          const Icon = STEP_ICONS[step];
          const isCompleted = index < stepIndex;
          const isCurrent = step === currentStep;

          return (
            <div
              key={step}
              className={cn(
                "flex items-center gap-3 transition-all duration-300",
                isCurrent && "scale-110"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isCompleted && "bg-green-500 text-white",
                  isCurrent && "bg-orange text-white shadow-lg shadow-orange/30",
                  !isCompleted && !isCurrent && "bg-slate-200 text-slate-400"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={cn(
                  "text-sm font-medium transition-all",
                  isCurrent ? "text-orange" : "text-slate-400"
                )}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 py-16 md:py-24">
        {/* Mobile step indicator */}
        <div className="md:hidden mb-8">
          <p className="text-sm text-slate-500 text-center">
            Stap {stepIndex + 1} van {STEP_ORDER.length - 1}
          </p>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {currentStep === "welcome" && (
            <WelcomeStep onNext={handleNext} />
          )}
          {currentStep === "personal_info" && (
            <PersonalInfoStep
              data={personalInfo}
              onChange={setPersonalInfo}
            />
          )}
          {currentStep === "first_memory" && (
            <FirstMemoryStep
              onNext={handleNext}
            />
          )}
          {currentStep === "story_purpose" && (
            <StoryPurposeStep
              data={storyPurpose}
              onChange={setStoryPurpose}
            />
          )}
          {currentStep === "recording_preferences" && (
            <RecordingPrefsStep
              data={recordingPrefs}
              onChange={setRecordingPrefs}
            />
          )}
          {currentStep === "privacy_settings" && (
            <PrivacyStep
              data={privacySettings}
              onChange={setPrivacySettings}
            />
          )}
          {currentStep === "chapter_selection" && (
            <ChapterSelectionStep
              data={chapterSelection}
              onChange={setChapterSelection}
            />
          )}
          {currentStep === "accessibility" && (
            <AccessibilityStep
              data={accessibility}
              onChange={setAccessibility}
            />
          )}
          {currentStep === "complete" && (
            <CompleteStep
              displayName={personalInfo.display_name}
              selectedPhases={chapterSelection.selected_phases}
              onComplete={handleComplete}
              isLoading={isSaving}
            />
          )}

          {/* Error message */}
          {error && (
            <div className="mt-6 p-4 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Navigation buttons */}
          {currentStep !== "welcome" && currentStep !== "complete" && (
            <div className="flex justify-between mt-10 pt-6 border-t">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={isFirstStep || isSaving}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Vorige
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed() || isSaving}
                className="bg-orange hover:bg-orange/90"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isLastStep ? "Afronden" : "Volgende"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>

        {/* Skip option */}
        {currentStep !== "welcome" && currentStep !== "complete" && (
          <div className="text-center mt-6">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Overslaan en later invullen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnboardingWizard;
