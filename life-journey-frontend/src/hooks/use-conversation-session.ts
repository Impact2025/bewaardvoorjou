"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/store/auth-context";

const STORAGE_KEY_PREFIX = "bvj_conv_session_";

interface ConversationState {
  sessionId: string | null;
  currentQuestion: string | null;
  turnNumber: number;
  isComplete: boolean;
  isLoading: boolean;
}

interface UseConversationSessionResult extends ConversationState {
  startSession: (assetId: string) => Promise<void>;
  continueSession: (responseText: string) => Promise<string | null>;
  endSession: () => Promise<void>;
}

export function useConversationSession(
  journeyId: string | null | undefined,
  chapterId: string | null | undefined,
): UseConversationSessionResult {
  const { session } = useAuth();
  const [state, setState] = useState<ConversationState>({
    sessionId: null,
    currentQuestion: null,
    turnNumber: 0,
    isComplete: false,
    isLoading: true,
  });

  // Stable ref so callbacks don't go stale
  const stateRef = useRef(state);
  stateRef.current = state;

  const storageKey = journeyId && chapterId
    ? `${STORAGE_KEY_PREFIX}${journeyId}_${chapterId}`
    : null;

  // On mount: try to resume an existing session from the backend.
  // Falls back to the session_id stored in localStorage if the backend
  // has already evicted the record (edge case: complete on another device).
  useEffect(() => {
    if (!journeyId || !chapterId || !session?.token) {
      setState(s => ({ ...s, isLoading: false }));
      return;
    }

    let cancelled = false;

    async function tryResume() {
      try {
        const result = await apiFetch<{
          session_id: string | null;
          current_question: string | null;
          turn_number: number;
          conversation_complete: boolean;
        }>(
          `/assistant/conversation/resume/${journeyId}/${chapterId}`,
          { method: "GET" },
          { token: session!.token },
        );

        if (cancelled) return;

        if (result.session_id && result.current_question) {
          // We have an active session — restore it
          if (storageKey) localStorage.setItem(storageKey, result.session_id);
          setState({
            sessionId: result.session_id,
            currentQuestion: result.current_question,
            turnNumber: result.turn_number,
            isComplete: result.conversation_complete,
            isLoading: false,
          });
        } else {
          setState(s => ({ ...s, isLoading: false }));
        }
      } catch {
        if (!cancelled) setState(s => ({ ...s, isLoading: false }));
      }
    }

    tryResume();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journeyId, chapterId, session?.token]);

  const startSession = useCallback(async (assetId: string) => {
    if (!journeyId || !chapterId || !session?.token) return;

    setState(s => ({ ...s, isLoading: true }));
    try {
      const result = await apiFetch<{ session_id: string; opening_question: string }>(
        "/assistant/conversation/start",
        {
          method: "POST",
          body: JSON.stringify({ journey_id: journeyId, chapter_id: chapterId, asset_id: assetId }),
        },
        { token: session.token },
      );

      if (storageKey) localStorage.setItem(storageKey, result.session_id);
      setState({
        sessionId: result.session_id,
        currentQuestion: result.opening_question,
        turnNumber: 1,
        isComplete: false,
        isLoading: false,
      });
    } catch {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, [journeyId, chapterId, session?.token, storageKey]);

  const continueSession = useCallback(async (responseText: string): Promise<string | null> => {
    const { sessionId } = stateRef.current;
    if (!sessionId || !session?.token) return null;

    const result = await apiFetch<{
      next_question: string | null;
      turn_number: number;
      conversation_complete: boolean;
      story_depth: number | null;
    }>(
      "/assistant/conversation/continue",
      {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId, response_text: responseText }),
      },
      { token: session.token },
    );

    if (result.conversation_complete || result.next_question === null) {
      if (storageKey) localStorage.removeItem(storageKey);
      setState(s => ({ ...s, isComplete: true, currentQuestion: null, turnNumber: result.turn_number }));
    } else {
      setState(s => ({
        ...s,
        currentQuestion: result.next_question,
        turnNumber: result.turn_number,
      }));
    }

    return result.next_question;
  }, [session?.token, storageKey]);

  const endSession = useCallback(async () => {
    const { sessionId } = stateRef.current;
    if (!sessionId || !session?.token) return;

    try {
      await apiFetch(
        "/assistant/conversation/end",
        { method: "POST", body: JSON.stringify({ session_id: sessionId }) },
        { token: session.token },
      );
    } catch {
      // Non-blocking
    }

    if (storageKey) localStorage.removeItem(storageKey);
    setState(s => ({ ...s, isComplete: true, sessionId: null, currentQuestion: null }));
  }, [session?.token, storageKey]);

  return {
    ...state,
    startSession,
    continueSession,
    endSession,
  };
}
