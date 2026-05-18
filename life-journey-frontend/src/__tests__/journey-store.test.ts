import { describe, it, expect, beforeEach } from "vitest";
import { getJourneyStore } from "@/store/journey-store";

describe("journeyStore", () => {
  it("starts with null journey and profile", () => {
    const store = getJourneyStore();
    const state = store.getState();
    expect(state.journey).toBeNull();
    expect(state.profile).toBeNull();
  });

  it("sets journey via setJourney", () => {
    const store = getJourneyStore();
    const mockJourney = {
      id: "j-1",
      title: "Mijn verhaal",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
      activeChapterId: "intro-reflection",
      progress: {},
      activeChapters: [],
      media: [],
      transcripts: [],
      highlights: [],
      promptRuns: [],
      shareGrants: [],
      consentLog: [],
      chapterStatuses: {},
      journeyProgress: { totalChapters: 30, completedChapters: 0, availableChapters: 1, percentComplete: 0 },
    };
    store.getState().setJourney(mockJourney);
    expect(store.getState().journey?.id).toBe("j-1");
    expect(store.getState().journey?.title).toBe("Mijn verhaal");
  });

  it("enqueues and clears offline recording items", () => {
    const store = getJourneyStore();
    const item = { id: "rec-1", chapterId: "intro-reflection", blob: new Blob(), status: "pending" as const, createdAt: "2025-01-01T00:00:00Z" };
    store.getState().enqueueRecording(item);
    expect(store.getState().offlineQueue).toHaveLength(1);
    store.getState().clearQueueItem("rec-1");
    expect(store.getState().offlineQueue).toHaveLength(0);
  });
});
