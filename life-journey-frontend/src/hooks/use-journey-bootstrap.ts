"use client";

import { useEffect, useState } from "react";

import { fetchJourneyDetail } from "@/lib/journey-client";
import type { Journey, UserProfile, OfflineQueueItem } from "@/lib/types";
import { useAuth } from "@/store/auth-context";
import { useJourneyStore } from "@/store/journey-store";

interface JourneyBootstrapResult {
  journey: Journey | null;
  profile: UserProfile | null;
  offlineQueue: OfflineQueueItem[];
  isLoading: boolean;
  error: string | null;
}

export function useJourneyBootstrap(): JourneyBootstrapResult {
  const { session } = useAuth();
  const journey = useJourneyStore((state) => state.journey);
  const profile = useJourneyStore((state) => state.profile);
  const offlineQueue = useJourneyStore((state) => state.offlineQueue);
  const setProfile = useJourneyStore((state) => state.setProfile);
  const setJourney = useJourneyStore((state) => state.setJourney);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.primaryJourneyId || !session.token) {
      setIsLoading(false);
      return;
    }

    if (journey && profile) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void fetchJourneyDetail(session.primaryJourneyId, session.token)
      .then(({ journey: fetchedJourney, owner }) => {
        if (cancelled) return;
        setJourney(fetchedJourney);
        setProfile(owner);
      })
      .catch((cause) => {
        if (cancelled) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Kon je journey niet laden. Probeer het later opnieuw.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session?.primaryJourneyId, session?.token, journey, profile, setJourney, setProfile]);

  return { journey, profile, offlineQueue, isLoading, error };
}