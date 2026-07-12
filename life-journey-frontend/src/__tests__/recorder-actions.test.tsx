import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { RecorderProvider, useRecorder } from "@/components/recorder/RecorderContext";
import { useRecorderActions } from "@/components/recorder/useRecorderActions";

// ─── Gedeelde mocks (gehoist zodat de vi.mock-factories erbij kunnen) ────────

const h = vi.hoisted(() => ({
  apiFetch: vi.fn(),
  startConversationSession: vi.fn(),
  continueConversation: vi.fn(),
  endConversationSession: vi.fn(),
  auth: { session: null as { token: string; primaryJourneyId: string | null } | null },
}));

vi.mock("@/lib/api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-client")>();
  return { ...actual, apiFetch: h.apiFetch };
});

vi.mock("@/lib/conversation-client", () => ({
  startConversationSession: h.startConversationSession,
  continueConversation: h.continueConversation,
  endConversationSession: h.endConversationSession,
  resumeConversationSession: vi.fn(),
}));

vi.mock("@/store/auth-context", () => ({
  useAuth: () => h.auth,
}));

vi.mock("@/hooks/use-journey-bootstrap", () => ({
  useJourneyBootstrap: () => ({
    journey: { id: "j-1" },
    profile: null,
    offlineQueue: [],
    isLoading: false,
    error: null,
  }),
}));

vi.mock("@/components/Confetti", () => ({
  useConfetti: () => ({ triggerConfetti: vi.fn() }),
}));

// ─── Browser-API fakes: MediaRecorder + getUserMedia ─────────────────────────

class FakeMediaRecorder {
  static instances: FakeMediaRecorder[] = [];
  static isTypeSupported = vi.fn(() => true);

  state: "inactive" | "recording" | "paused" = "inactive";
  mimeType: string;
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onstart: (() => void) | null = null;
  onerror: ((e: Event) => void) | null = null;

  constructor(
    public stream: unknown,
    public options?: { mimeType?: string },
  ) {
    this.mimeType = options?.mimeType ?? "";
    FakeMediaRecorder.instances.push(this);
  }

  start() {
    this.state = "recording";
    this.onstart?.();
  }
  stop() {
    this.state = "inactive";
    this.onstop?.();
  }
  pause() {
    this.state = "paused";
  }
  resume() {
    this.state = "recording";
  }
}

vi.stubGlobal("MediaRecorder", FakeMediaRecorder as unknown as typeof MediaRecorder);

const uploadFetch = vi.fn();
vi.stubGlobal("fetch", uploadFetch);

const getUserMedia = vi.fn();

function makeTrack() {
  return {
    stop: vi.fn(),
    enabled: true,
    muted: false,
    readyState: "live",
    label: "test-microfoon",
    onended: null,
    onmute: null,
  };
}

function makeStream(track: ReturnType<typeof makeTrack>) {
  return {
    getTracks: () => [track],
    getAudioTracks: () => [track],
  } as unknown as MediaStream;
}

// ─── Test harness ────────────────────────────────────────────────────────────

const CHAPTER_ID = "eerste-herinnering";

function wrapper({ children }: { children: ReactNode }) {
  return <RecorderProvider initialMode="audio">{children}</RecorderProvider>;
}

function renderRecorder() {
  return renderHook(
    () => ({ ctx: useRecorder(), actions: useRecorderActions({ chapterId: CHAPTER_ID }) }),
    { wrapper },
  );
}

function mediaBlob(bytes: number, type = "audio/webm") {
  return new Blob([new Uint8Array(bytes)], { type });
}

let track: ReturnType<typeof makeTrack>;

beforeEach(() => {
  vi.useFakeTimers();
  h.apiFetch.mockReset();
  h.startConversationSession.mockReset();
  h.continueConversation.mockReset();
  h.endConversationSession.mockReset();
  uploadFetch.mockReset().mockResolvedValue({ ok: true, status: 200 });
  FakeMediaRecorder.instances = [];
  FakeMediaRecorder.isTypeSupported.mockReturnValue(true);
  track = makeTrack();
  getUserMedia.mockReset().mockResolvedValue(makeStream(track));
  Object.defineProperty(navigator, "mediaDevices", {
    value: { getUserMedia },
    configurable: true,
  });
  h.auth.session = { token: "tok-1", primaryJourneyId: "j-1" };
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── Opname: state-overgangen ────────────────────────────────────────────────

describe("useRecorderActions — opname state-overgangen", () => {
  it("doorloopt start → pauze → hervat → stop met lopende en stilstaande timer", async () => {
    const { result } = renderRecorder();

    await act(async () => {
      await result.current.actions.startRecording();
    });

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(result.current.ctx.state.state).toBe("recording");
    const rec = FakeMediaRecorder.instances[0];
    expect(rec.options?.mimeType).toBe("audio/webm;codecs=opus");

    // Timer telt per seconde op
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.ctx.state.recordingTime).toBe(3);

    // Pauze: MediaRecorder gepauzeerd en timer staat stil
    act(() => {
      result.current.actions.togglePause();
    });
    expect(result.current.ctx.state.state).toBe("paused");
    expect(rec.state).toBe("paused");
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.ctx.state.recordingTime).toBe(3);

    // Hervatten: timer loopt weer
    act(() => {
      result.current.actions.togglePause();
    });
    expect(result.current.ctx.state.state).toBe("recording");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.ctx.state.recordingTime).toBe(4);

    // Stop: blob wordt samengesteld, tracks gestopt, state completed
    act(() => {
      rec.ondataavailable?.({ data: mediaBlob(2048) });
      result.current.actions.stopRecording();
    });
    expect(result.current.ctx.state.state).toBe("completed");
    expect(result.current.ctx.state.mediaBlob?.size).toBe(2048);
    expect(track.stop).toHaveBeenCalled();
  });

  it("wijst een te korte opname af met een Nederlandse melding", async () => {
    const { result } = renderRecorder();

    await act(async () => {
      await result.current.actions.startRecording();
    });
    const rec = FakeMediaRecorder.instances[0];

    act(() => {
      rec.ondataavailable?.({ data: mediaBlob(10) }); // < 1KB minimum voor audio
      result.current.actions.stopRecording();
    });

    expect(result.current.ctx.state.state).toBe("idle");
    expect(result.current.ctx.state.mediaBlob).toBeNull();
    expect(result.current.ctx.state.permissionError).toBe(
      "Opname te kort. Neem minimaal 1 seconde op.",
    );
  });

  it("geeft een gerichte melding bij geweigerde toestemming (NotAllowedError)", async () => {
    const err = new Error("Permission denied");
    err.name = "NotAllowedError";
    getUserMedia.mockRejectedValueOnce(err);
    const { result } = renderRecorder();

    await act(async () => {
      await result.current.actions.startRecording();
    });

    expect(result.current.ctx.state.permissionError).toContain("Toegang geweigerd");
    expect(result.current.ctx.state.state).toBe("idle");
  });

  it("adviseert tekst-modus als er geen microfoon is (NotFoundError, audio-modus)", async () => {
    const err = new Error("No device");
    err.name = "NotFoundError";
    getUserMedia.mockRejectedValueOnce(err);
    const { result } = renderRecorder();

    await act(async () => {
      await result.current.actions.startRecording();
    });

    expect(result.current.ctx.state.permissionError).toBe(
      "Geen microfoon gevonden. Probeer Tekst-modus of sluit een microfoon aan en probeer opnieuw.",
    );
  });
});

// ─── Upload-flow ─────────────────────────────────────────────────────────────

describe("useRecorderActions — uploadRecording", () => {
  const presignResponse = {
    upload_url: "https://uploads.example/put-hier",
    asset_id: "asset-1",
    upload_method: "PUT" as const,
  };

  it("doet niets zonder opgenomen blob", async () => {
    const { result } = renderRecorder();

    await act(async () => {
      await result.current.actions.uploadRecording();
    });

    expect(h.apiFetch).not.toHaveBeenCalled();
    expect(result.current.ctx.state.state).toBe("idle");
  });

  it("presignt, uploadt via PUT, meldt gereed en start de AI-conversatie", async () => {
    h.apiFetch
      .mockResolvedValueOnce(presignResponse) // /media/presign
      .mockResolvedValueOnce(undefined); // /media/:id/complete
    h.startConversationSession.mockResolvedValueOnce({
      sessionId: "s-1",
      openingQuestion: "Wat gebeurde er daarna?",
    });

    const { result } = renderRecorder();
    const blob = mediaBlob(5000);
    act(() => {
      result.current.ctx.setMediaBlob(blob);
    });

    await act(async () => {
      await result.current.actions.uploadRecording();
    });

    // Presign-payload: journey, hoofdstuk, modaliteit en bestandsgrootte
    const [presignPath, presignInit, presignOpts] = h.apiFetch.mock.calls[0];
    expect(presignPath).toBe("/media/presign");
    expect(presignOpts).toEqual({ token: "tok-1" });
    const presignBody = JSON.parse(presignInit.body);
    expect(presignBody).toMatchObject({
      journey_id: "j-1",
      chapter_id: CHAPTER_ID,
      modality: "audio",
      size_bytes: 5000,
    });

    // Binaire upload naar de presigned URL
    const [uploadUrl, uploadInit] = uploadFetch.mock.calls[0];
    expect(uploadUrl).toBe("https://uploads.example/put-hier");
    expect(uploadInit.method).toBe("PUT");
    expect(uploadInit.body).toBe(blob);

    // Afgerond bij de backend gemeld
    expect(h.apiFetch.mock.calls[1][0]).toBe("/media/asset-1/complete");

    expect(result.current.ctx.state.uploadStatus).toBe("Upload geslaagd!");
    expect(result.current.ctx.state.state).toBe("completed");
    expect(result.current.ctx.state.showNextChapterPrompt).toBe(true);

    // AI Interviewer gestart met het nieuwe asset
    expect(h.startConversationSession).toHaveBeenCalledWith("tok-1", "j-1", CHAPTER_ID, "asset-1");
    expect(result.current.ctx.state.conversationSessionId).toBe("s-1");
    expect(result.current.ctx.state.currentQuestion).toBe("Wat gebeurde er daarna?");
  });

  it("bouwt een FormData-payload bij een presigned POST met fields (S3-stijl)", async () => {
    h.apiFetch
      .mockResolvedValueOnce({
        upload_url: "https://s3.example/bucket",
        asset_id: "asset-2",
        upload_method: "POST" as const,
        fields: { key: "media/asset-2.webm", policy: "p-1" },
      })
      .mockResolvedValueOnce(undefined);

    const { result } = renderRecorder();
    const blob = mediaBlob(4000);
    act(() => {
      result.current.ctx.setMediaBlob(blob);
    });

    await act(async () => {
      await result.current.actions.uploadRecording();
    });

    const [uploadUrl, uploadInit] = uploadFetch.mock.calls[0];
    expect(uploadUrl).toBe("https://s3.example/bucket");
    expect(uploadInit.method).toBe("POST");
    expect(uploadInit.body).toBeInstanceOf(FormData);
    const fd = uploadInit.body as FormData;
    expect(fd.get("key")).toBe("media/asset-2.webm");
    expect(fd.get("policy")).toBe("p-1");
    expect(fd.get("file")).toBeInstanceOf(Blob);
  });

  it("kondigt bij 402 (betaalmuur) de doorverwijzing naar de pakketten aan", async () => {
    h.apiFetch.mockRejectedValueOnce({
      message: "Je gratis hoofdstukken zijn op.",
      status: 402,
    });

    const { result } = renderRecorder();
    act(() => {
      result.current.ctx.setMediaBlob(mediaBlob(5000));
    });

    await act(async () => {
      await result.current.actions.uploadRecording();
    });

    expect(result.current.ctx.state.uploadStatus).toBe(
      "Je gratis hoofdstukken zijn op. Je wordt doorgestuurd naar de pakketten…",
    );
    expect(result.current.ctx.state.state).toBe("completed");
    expect(uploadFetch).not.toHaveBeenCalled();
  });

  it("toont de foutboodschap en blijft in completed bij een mislukte upload", async () => {
    h.apiFetch.mockResolvedValueOnce(presignResponse);
    uploadFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const { result } = renderRecorder();
    act(() => {
      result.current.ctx.setMediaBlob(mediaBlob(5000));
    });

    await act(async () => {
      await result.current.actions.uploadRecording();
    });

    expect(result.current.ctx.state.uploadStatus).toBe("Upload failed");
    expect(result.current.ctx.state.state).toBe("completed");
    // Complete-call mag niet gebeuren als de upload faalde
    expect(h.apiFetch).toHaveBeenCalledTimes(1);
  });
});

// ─── Tekst opslaan ───────────────────────────────────────────────────────────

describe("useRecorderActions — saveTextContent", () => {
  it("doet niets bij lege tekst", async () => {
    const { result } = renderRecorder();
    act(() => {
      result.current.ctx.setTextContent("   ");
    });

    await act(async () => {
      await result.current.actions.saveTextContent();
    });

    expect(h.apiFetch).not.toHaveBeenCalled();
  });

  it("slaat tekst op als asset, wist het concept en zet het gesprek voort", async () => {
    const tekst = "Mijn verhaal begint hier.";
    localStorage.setItem(`draft-chapter-${CHAPTER_ID}`, tekst);

    h.apiFetch
      .mockResolvedValueOnce({
        upload_url: "https://uploads.example/tekst",
        asset_id: "asset-3",
        upload_method: "PUT" as const,
      })
      .mockResolvedValueOnce(undefined); // complete
    h.startConversationSession.mockResolvedValueOnce({
      sessionId: "s-9",
      openingQuestion: "Openingsvraag",
    });
    h.continueConversation.mockResolvedValueOnce({
      nextQuestion: "Wie was daar nog meer bij?",
      turnNumber: 2,
      conversationComplete: false,
      storyDepth: 1,
    });

    const { result } = renderRecorder();
    act(() => {
      result.current.ctx.setTextContent(tekst);
    });

    await act(async () => {
      await result.current.actions.saveTextContent();
    });

    // Presign met modality "text"
    const presignBody = JSON.parse(h.apiFetch.mock.calls[0][1].body);
    expect(presignBody).toMatchObject({
      journey_id: "j-1",
      chapter_id: CHAPTER_ID,
      modality: "text",
    });

    // Concept is opgeruimd na succesvol opslaan
    expect(localStorage.getItem(`draft-chapter-${CHAPTER_ID}`)).toBeNull();

    // Gesprek gestart en voortgezet met de opgeslagen tekst
    expect(h.startConversationSession).toHaveBeenCalledWith("tok-1", "j-1", CHAPTER_ID, "asset-3");
    expect(h.continueConversation).toHaveBeenCalledWith("tok-1", "s-9", tekst);

    // Vervolgvraag staat klaar en het tekstveld is leeggemaakt voor het volgende antwoord
    expect(result.current.ctx.state.currentQuestion).toBe("Wie was daar nog meer bij?");
    expect(result.current.ctx.state.conversationTurnNumber).toBe(2);
    expect(result.current.ctx.state.textContent).toBe("");
    expect(result.current.ctx.state.state).toBe("idle");
    expect(result.current.ctx.state.uploadStatus).toBe("Vervolgvraag klaar!");
  });
});
