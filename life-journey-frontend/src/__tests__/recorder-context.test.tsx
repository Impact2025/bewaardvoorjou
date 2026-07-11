import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { RecorderProvider, useRecorder } from "@/components/recorder/RecorderContext";

function wrapper({ children }: { children: ReactNode }) {
  return <RecorderProvider initialMode="audio">{children}</RecorderProvider>;
}

describe("RecorderContext — state machine", () => {
  it("start in idle met de meegegeven initialMode", () => {
    const { result } = renderHook(() => useRecorder(), { wrapper });
    expect(result.current.state.mode).toBe("audio");
    expect(result.current.state.state).toBe("idle");
    expect(result.current.state.mediaBlob).toBeNull();
    expect(result.current.state.recordingTime).toBe(0);
  });

  it("gooit een duidelijke fout buiten de provider", () => {
    expect(() => renderHook(() => useRecorder())).toThrow(
      "useRecorder must be used within a RecorderProvider",
    );
  });

  it("wist mediaBlob en reset state/tijd bij modus-wissel (voorkomt video-blob in audio-modus)", () => {
    const { result } = renderHook(() => useRecorder(), { wrapper });

    act(() => {
      result.current.setMediaBlob(new Blob(["opname"], { type: "audio/webm" }));
      result.current.setRecordingState("completed");
      result.current.incrementTime();
      result.current.incrementTime();
    });
    expect(result.current.state.mediaBlob).not.toBeNull();
    expect(result.current.state.recordingTime).toBe(2);

    act(() => {
      result.current.setMode("video");
    });

    expect(result.current.state.mode).toBe("video");
    expect(result.current.state.mediaBlob).toBeNull();
    expect(result.current.state.state).toBe("idle");
    expect(result.current.state.recordingTime).toBe(0);
  });

  it("telt woorden bij setTextContent en negeert extra witruimte", () => {
    const { result } = renderHook(() => useRecorder(), { wrapper });

    act(() => {
      result.current.setTextContent("  Dit is  een   testverhaal  ");
    });
    expect(result.current.state.wordCount).toBe(4);

    act(() => {
      result.current.setTextContent("   ");
    });
    expect(result.current.state.wordCount).toBe(0);
  });

  it("doorloopt de conversatie-cyclus: start → update → einde", () => {
    const { result } = renderHook(() => useRecorder(), { wrapper });

    act(() => {
      result.current.dispatch({
        type: "START_CONVERSATION",
        payload: { sessionId: "s-1", question: "Waar ben je geboren?" },
      });
    });
    expect(result.current.state.conversationSessionId).toBe("s-1");
    expect(result.current.state.currentQuestion).toBe("Waar ben je geboren?");
    expect(result.current.state.conversationTurnNumber).toBe(1);
    expect(result.current.state.conversationComplete).toBe(false);

    act(() => {
      result.current.dispatch({
        type: "UPDATE_CONVERSATION",
        payload: { question: "Vertel meer over dat huis", turnNumber: 2, depth: 3, complete: false },
      });
    });
    expect(result.current.state.currentQuestion).toBe("Vertel meer over dat huis");
    expect(result.current.state.conversationTurnNumber).toBe(2);
    expect(result.current.state.conversationStoryDepth).toBe(3);

    act(() => {
      result.current.dispatch({ type: "END_CONVERSATION" });
    });
    expect(result.current.state.conversationSessionId).toBeNull();
    expect(result.current.state.currentQuestion).toBeNull();
    expect(result.current.state.conversationTurnNumber).toBe(0);
  });

  it("RESET zet alles terug maar behoudt de gekozen modus", () => {
    const { result } = renderHook(() => useRecorder(), { wrapper });

    act(() => {
      result.current.setMode("video");
      result.current.setTextContent("concept tekst");
      result.current.setUploadStatus("Bezig...");
      result.current.setPermissionError("Geen toegang");
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.mode).toBe("video");
    expect(result.current.state.textContent).toBe("");
    expect(result.current.state.uploadStatus).toBeNull();
    expect(result.current.state.permissionError).toBeNull();
    expect(result.current.state.state).toBe("idle");
  });
});
