"use client";

import {
  createContext,
  useContext,
  type PropsWithChildren,
} from "react";
import { createStore } from "zustand";
import { useStore } from "zustand";
import type {
  Journey,
  JourneyState,
  OfflineQueueItem,
  UserProfile,
} from "@/lib/types";

type JourneyStore = ReturnType<typeof createJourneyStore>;

const JourneyStoreContext = createContext<JourneyStore | null>(null);

const EMPTY_STATE: JourneyState = {
  profile: null,
  journey: null,
  offlineQueue: [],
  setProfile: () => undefined,
  setJourney: () => undefined,
  updateJourney: () => undefined,
  enqueueRecording: () => undefined,
  updateQueueItem: () => undefined,
  clearQueueItem: () => undefined,
};

function createJourneyStore(initialState?: Partial<JourneyState>) {
  return createStore<JourneyState>((set, get) => ({
    ...EMPTY_STATE,
    ...initialState,
    setProfile: (profile: UserProfile) => set({ profile }),
    setJourney: (journey: Journey) => set({ journey }),
    updateJourney: (journeyPatch: Partial<Journey>) => {
      const current = get().journey ?? createDefaultJourney();
      set({ journey: { ...current, ...journeyPatch, updatedAt: new Date().toISOString() } });
    },
    enqueueRecording: (item: OfflineQueueItem) =>
      set({ offlineQueue: [item, ...get().offlineQueue] }),
    updateQueueItem: (id: string, patch: Partial<OfflineQueueItem>) =>
      set({
        offlineQueue: get().offlineQueue.map((entry) =>
          entry.id === id ? { ...entry, ...patch } : entry,
        ),
      }),
    clearQueueItem: (id: string) =>
      set({
        offlineQueue: get().offlineQueue.filter((entry) => entry.id !== id),
      }),
  }));
}

function createDefaultJourney(): Journey {
  return {
    id: "draft",
    title: "Mijn levensverhaal",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activeChapterId: "intro-reflection",
    progress: {
      "intro-reflection": 0,
      "intro-intention": 0,
      "intro-uniqueness": 0,
      "youth-favorite-place": 0,
      "youth-sounds": 0,
      "youth-hero": 0,
      "love-connection": 0,
      "love-lessons": 0,
      "love-symbol": 0,
      "work-dream-job": 0,
      "work-passion": 0,
      "work-challenge": 0,
      "future-message": 0,
      "future-dream": 0,
      "future-gratitude": 0,
      "bonus-funny": 0,
      "bonus-relive": 0,
      "bonus-culture": 0,
      "deep-daily-ritual": 0,
      "deep-favorite-time": 0,
      "deep-ugly-object": 0,
      "deep-near-death": 0,
      "deep-misconception": 0,
      "deep-recurring-dream": 0,
      "deep-life-chapters": 0,
      "deep-intuition-choice": 0,
      "deep-money-impact": 0,
      "deep-shadow-side": 0,
      "deep-life-meal": 0,
      "deep-statue": 0,
    },
    activeChapters: ["intro-reflection"],
    media: [],
    transcripts: [],
    highlights: [],
    promptRuns: [],
    shareGrants: [],
    consentLog: [],
    chapterStatuses: {},
    journeyProgress: {
      totalChapters: 30,
      completedChapters: 0,
      availableChapters: 18,
      percentComplete: 0,
    },
  };
}

const journeyStore = createJourneyStore();

export function JourneyProvider({ children }: PropsWithChildren) {
  return (
    <JourneyStoreContext.Provider value={journeyStore}>
      {children}
    </JourneyStoreContext.Provider>
  );
}

export function useJourneyStore<T>(selector: (state: JourneyState) => T): T {
  const store = useContext(JourneyStoreContext);
  if (!store) {
    throw new Error("Journey store is not initialised");
  }
  return useStore(store, selector);
}

export function getJourneyStore() {
  return journeyStore;
}
