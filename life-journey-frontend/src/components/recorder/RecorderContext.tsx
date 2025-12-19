"use client";

import { createContext, useContext, useReducer, useRef, useCallback, useMemo, ReactNode } from "react";
import { logger } from "@/lib/logger";

const log = logger.forComponent("RecorderContext");

// Types
export type RecordingMode = "video" | "audio" | "text";
export type RecordingState = "idle" | "previewing" | "recording" | "paused" | "completed" | "uploading";

export interface RecorderState {
  mode: RecordingMode;
  state: RecordingState;
  recordingTime: number;
  mediaBlob: Blob | null;
  permissionError: string | null;
  uploadStatus: string | null;
  showNextChapterPrompt: boolean;
  // Text mode
  textContent: string;
  wordCount: number;
  aiSuggestion: string | null;
  isGettingAISuggestion: boolean;
  // AI Chat
  isAssistantChatOpen: boolean;
  // Multi-turn Conversation (AI Interviewer 2.0)
  conversationSessionId: string | null;
  conversationTurnNumber: number;
  conversationStoryDepth: number | null;
  conversationComplete: boolean;
  currentQuestion: string | null;
}

type RecorderAction =
  | { type: "SET_MODE"; payload: RecordingMode }
  | { type: "SET_STATE"; payload: RecordingState }
  | { type: "SET_RECORDING_TIME"; payload: number }
  | { type: "INCREMENT_TIME" }
  | { type: "SET_MEDIA_BLOB"; payload: Blob | null }
  | { type: "SET_PERMISSION_ERROR"; payload: string | null }
  | { type: "SET_UPLOAD_STATUS"; payload: string | null }
  | { type: "SET_SHOW_NEXT_CHAPTER"; payload: boolean }
  | { type: "SET_TEXT_CONTENT"; payload: string }
  | { type: "SET_AI_SUGGESTION"; payload: string | null }
  | { type: "SET_IS_GETTING_AI_SUGGESTION"; payload: boolean }
  | { type: "SET_ASSISTANT_CHAT_OPEN"; payload: boolean }
  | { type: "START_CONVERSATION"; payload: { sessionId: string; question: string } }
  | { type: "UPDATE_CONVERSATION"; payload: { question: string | null; turnNumber: number; depth: number | null; complete: boolean } }
  | { type: "END_CONVERSATION" }
  | { type: "SET_CURRENT_QUESTION"; payload: string | null }
  | { type: "RESET" };

const initialState: RecorderState = {
  mode: "text",
  state: "idle",
  recordingTime: 0,
  mediaBlob: null,
  permissionError: null,
  uploadStatus: null,
  showNextChapterPrompt: false,
  textContent: "",
  wordCount: 0,
  aiSuggestion: null,
  isGettingAISuggestion: false,
  isAssistantChatOpen: false,
  conversationSessionId: null,
  conversationTurnNumber: 0,
  conversationStoryDepth: null,
  conversationComplete: false,
  currentQuestion: null,
};

function recorderReducer(state: RecorderState, action: RecorderAction): RecorderState {
  switch (action.type) {
    case "SET_MODE":
      // Clear mediaBlob and reset state when switching modes to prevent
      // trying to play a video blob in audio mode or vice versa
      return { ...state, mode: action.payload, mediaBlob: null, state: "idle", recordingTime: 0 };
    case "SET_STATE":
      return { ...state, state: action.payload };
    case "SET_RECORDING_TIME":
      return { ...state, recordingTime: action.payload };
    case "INCREMENT_TIME":
      return { ...state, recordingTime: state.recordingTime + 1 };
    case "SET_MEDIA_BLOB":
      return { ...state, mediaBlob: action.payload };
    case "SET_PERMISSION_ERROR":
      return { ...state, permissionError: action.payload };
    case "SET_UPLOAD_STATUS":
      return { ...state, uploadStatus: action.payload };
    case "SET_SHOW_NEXT_CHAPTER":
      return { ...state, showNextChapterPrompt: action.payload };
    case "SET_TEXT_CONTENT": {
      const words = action.payload.trim().split(/\s+/).filter(word => word.length > 0);
      return { ...state, textContent: action.payload, wordCount: words.length };
    }
    case "SET_AI_SUGGESTION":
      return { ...state, aiSuggestion: action.payload };
    case "SET_IS_GETTING_AI_SUGGESTION":
      return { ...state, isGettingAISuggestion: action.payload };
    case "SET_ASSISTANT_CHAT_OPEN":
      return { ...state, isAssistantChatOpen: action.payload };
    case "START_CONVERSATION":
      return {
        ...state,
        conversationSessionId: action.payload.sessionId,
        currentQuestion: action.payload.question,
        conversationTurnNumber: 1,
        conversationStoryDepth: null,
        conversationComplete: false,
      };
    case "UPDATE_CONVERSATION":
      return {
        ...state,
        currentQuestion: action.payload.question,
        conversationTurnNumber: action.payload.turnNumber,
        conversationStoryDepth: action.payload.depth,
        conversationComplete: action.payload.complete,
      };
    case "END_CONVERSATION":
      return {
        ...state,
        conversationSessionId: null,
        currentQuestion: null,
        conversationTurnNumber: 0,
        conversationStoryDepth: null,
        conversationComplete: false,
      };
    case "SET_CURRENT_QUESTION":
      return { ...state, currentQuestion: action.payload };
    case "RESET":
      return {
        ...initialState,
        mode: state.mode, // Keep current mode
      };
    default:
      return state;
  }
}

// Refs type for media handling
export interface RecorderRefs {
  mediaRecorder: React.MutableRefObject<MediaRecorder | null>;
  stream: React.MutableRefObject<MediaStream | null>;
  chunks: React.MutableRefObject<Blob[]>;
  recordingTimer: React.MutableRefObject<NodeJS.Timeout | null>;
  videoPreview: React.MutableRefObject<HTMLVideoElement | null>;
  playback: React.MutableRefObject<HTMLVideoElement | HTMLAudioElement | null>;
}

interface RecorderContextValue {
  state: RecorderState;
  dispatch: React.Dispatch<RecorderAction>;
  refs: RecorderRefs;
  // Helper actions
  setMode: (mode: RecordingMode) => void;
  setRecordingState: (state: RecordingState) => void;
  setMediaBlob: (blob: Blob | null) => void;
  setPermissionError: (error: string | null) => void;
  setUploadStatus: (status: string | null) => void;
  setTextContent: (content: string) => void;
  setAiSuggestion: (suggestion: string | null) => void;
  setAssistantChatOpen: (open: boolean) => void;
  showNextChapter: () => void;
  hideNextChapter: () => void;
  reset: () => void;
  incrementTime: () => void;
}

const RecorderContext = createContext<RecorderContextValue | null>(null);

interface RecorderProviderProps {
  children: ReactNode;
  initialMode?: RecordingMode;
}

export function RecorderProvider({ children, initialMode = "text" }: RecorderProviderProps) {
  const [state, dispatch] = useReducer(recorderReducer, {
    ...initialState,
    mode: initialMode,
  });

  // Refs for media handling (don't trigger re-renders)
  // IMPORTANT: Each useRef must be called at the top level, then collected into a stable object
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const playbackRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);

  // Memoize the refs object so it doesn't change on every render
  // This is critical - changing refs triggers cleanup effects that stop recording!
  const refs: RecorderRefs = useMemo(() => ({
    mediaRecorder: mediaRecorderRef,
    stream: streamRef,
    chunks: chunksRef,
    recordingTimer: recordingTimerRef,
    videoPreview: videoPreviewRef,
    playback: playbackRef,
  }), []);

  // Helper actions
  const setMode = useCallback((mode: RecordingMode) => {
    log.debug("Mode changed", { mode });
    dispatch({ type: "SET_MODE", payload: mode });
  }, []);

  const setRecordingState = useCallback((newState: RecordingState) => {
    log.debug("Recording state changed", { state: newState });
    dispatch({ type: "SET_STATE", payload: newState });
  }, []);

  const setMediaBlob = useCallback((blob: Blob | null) => {
    log.debug("Media blob updated", { size: blob?.size });
    dispatch({ type: "SET_MEDIA_BLOB", payload: blob });
  }, []);

  const setPermissionError = useCallback((error: string | null) => {
    if (error) log.warn("Permission error", { error });
    dispatch({ type: "SET_PERMISSION_ERROR", payload: error });
  }, []);

  const setUploadStatus = useCallback((status: string | null) => {
    log.debug("Upload status", { status });
    dispatch({ type: "SET_UPLOAD_STATUS", payload: status });
  }, []);

  const setTextContent = useCallback((content: string) => {
    dispatch({ type: "SET_TEXT_CONTENT", payload: content });
  }, []);

  const setAiSuggestion = useCallback((suggestion: string | null) => {
    dispatch({ type: "SET_AI_SUGGESTION", payload: suggestion });
  }, []);

  const setAssistantChatOpen = useCallback((open: boolean) => {
    dispatch({ type: "SET_ASSISTANT_CHAT_OPEN", payload: open });
  }, []);

  const showNextChapter = useCallback(() => {
    dispatch({ type: "SET_SHOW_NEXT_CHAPTER", payload: true });
  }, []);

  const hideNextChapter = useCallback(() => {
    dispatch({ type: "SET_SHOW_NEXT_CHAPTER", payload: false });
  }, []);

  const reset = useCallback(() => {
    log.debug("Resetting recorder state");
    dispatch({ type: "RESET" });
  }, []);

  const incrementTime = useCallback(() => {
    dispatch({ type: "INCREMENT_TIME" });
  }, []);

  const value: RecorderContextValue = {
    state,
    dispatch,
    refs,
    setMode,
    setRecordingState,
    setMediaBlob,
    setPermissionError,
    setUploadStatus,
    setTextContent,
    setAiSuggestion,
    setAssistantChatOpen,
    showNextChapter,
    hideNextChapter,
    reset,
    incrementTime,
  };

  return (
    <RecorderContext.Provider value={value}>
      {children}
    </RecorderContext.Provider>
  );
}

export function useRecorder() {
  const context = useContext(RecorderContext);
  if (!context) {
    throw new Error("useRecorder must be used within a RecorderProvider");
  }
  return context;
}

export default RecorderContext;
