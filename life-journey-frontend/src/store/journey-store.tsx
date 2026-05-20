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
import { CHAPTERS } from "@/lib/chapters";

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
    progress: Object.fromEntries(CHAPTERS.map((ch) => [ch.id, 0])) as Record<import("@/lib/types").ChapterId, number>,
    activeChapters: ["intro-reflection"],
    media: [],
    transcripts: [],
    highlights: [],
    promptRuns: [],
    shareGrants: [],
    consentLog: [],
    chapterStatuses: {},
    journeyProgress: {
      totalChapters: CHAPTERS.filter((ch) => ch.phase !== "optional").length,
      completedChapters: 0,
      availableChapters: 3,
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
