"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { onboardingSlides } from "./onboarding-data";
import { OnboardingSlideComponent } from "./onboarding-slide";
import { useRouter } from "next/navigation";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ONBOARDING_SEEN_KEY = "memories_onboarding_seen";

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const router = useRouter();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, skipSnaps: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowLeft") {
        scrollPrev();
      } else if (e.key === "ArrowRight") {
        scrollNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, scrollPrev, scrollNext]);

  const handleClose = () => {
    // Mark onboarding as seen
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_SEEN_KEY, "true");
    }
    onClose();
  };

  const handleComplete = () => {
    handleClose();
    router.push("/dashboard");
  };

  const isLastSlide = selectedIndex === onboardingSlides.length - 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="relative rounded-2xl bg-white shadow-2xl">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-20 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Sluiten"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Carousel */}
          <div className="overflow-hidden rounded-t-2xl" ref={emblaRef}>
            <div className="flex">
              {onboardingSlides.map((slide, index) => (
                <OnboardingSlideComponent
                  key={slide.id}
                  slide={slide}
                  isActive={index === selectedIndex}
                />
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t border-slate-200 px-8 py-6">
            <div className="flex items-center justify-between">
              {/* Previous button */}
              <Button
                variant="ghost"

                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className="text-slate-600 disabled:opacity-0 transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Vorige
              </Button>

              {/* Dot indicators */}
              <div className="flex gap-2">
                {onboardingSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === selectedIndex
                        ? "w-8 bg-orange"
                        : "w-2 bg-slate-300 hover:bg-slate-400"
                    }`}
                    aria-label={`Ga naar slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Next/Complete button */}
              {isLastSlide ? (
                <Button
                  onClick={handleComplete}
                  className="bg-orange hover:bg-orange/90 text-white transition-all duration-200 hover:scale-105"
                >
                  Start mijn verhaal
                </Button>
              ) : (
                <Button
                  variant="ghost"

                  onClick={scrollNext}
                  disabled={!canScrollNext}
                  className="text-slate-600 transition-all duration-200"
                >
                  Volgende
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to check if user has seen onboarding
export function hasSeenOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_SEEN_KEY) === "true";
}

// Helper function to reset onboarding (for testing or re-showing)
export function resetOnboarding(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ONBOARDING_SEEN_KEY);
}
