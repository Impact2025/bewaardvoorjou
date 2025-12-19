/**
 * Conversation API Client
 *
 * Wraps the multi-turn conversation engine endpoints.
 * This connects to the sophisticated conversation system that already exists
 * in the backend (app/services/ai/conversation.py).
 */

import { apiFetch } from './api-client';
import type { ChapterId } from './types';

export interface ConversationSession {
  sessionId: string;
  openingQuestion: string;
}

export interface ConversationResponse {
  nextQuestion: string | null;
  turnNumber: number;
  conversationComplete: boolean;
  storyDepth: number | null;
  analysis?: {
    emotions: string[];
    peopleMentioned: string[];
    placesMentioned: string[];
    themes: string[];
  };
}

export interface ConversationSummary {
  totalTurns: number;
  completed: boolean;
  storyDepth: number;
  keyThemes: string[];
  peopleMentioned: string[];
  placesMentioned: string[];
}

/**
 * Start a new multi-turn conversation session for a chapter
 */
export async function startConversationSession(
  token: string,
  journeyId: string,
  chapterId: ChapterId,
  assetId: string
): Promise<ConversationSession> {
  const response = await apiFetch<{
    session_id: string;
    opening_question: string;
  }>(
    '/assistant/conversation/start',
    {
      method: 'POST',
      body: JSON.stringify({
        journey_id: journeyId,
        chapter_id: chapterId,
        asset_id: assetId,
      }),
    },
    { token }
  );

  // Map snake_case to camelCase
  return {
    sessionId: response.session_id,
    openingQuestion: response.opening_question,
  };
}

/**
 * Continue the conversation with user's response
 */
export async function continueConversation(
  token: string,
  sessionId: string,
  responseText: string
): Promise<ConversationResponse> {
  const response = await apiFetch<{
    next_question: string | null;
    turn_number: number;
    conversation_complete: boolean;
    story_depth: number | null;
  }>(
    '/assistant/conversation/continue',
    {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        response_text: responseText,
      }),
    },
    { token }
  );

  // Map snake_case to camelCase
  return {
    nextQuestion: response.next_question,
    turnNumber: response.turn_number,
    conversationComplete: response.conversation_complete,
    storyDepth: response.story_depth,
  };
}

/**
 * End the conversation session and get summary
 */
export async function endConversationSession(
  token: string,
  sessionId: string
): Promise<ConversationSummary> {
  const response = await apiFetch<{
    total_turns: number;
    completed: boolean;
    story_depth: number;
    key_themes: string[];
    people_mentioned: string[];
    places_mentioned?: string[];
  }>(
    '/assistant/conversation/end',
    {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
      }),
    },
    { token }
  );

  // Map snake_case to camelCase
  return {
    totalTurns: response.total_turns,
    completed: response.completed,
    storyDepth: response.story_depth,
    keyThemes: response.key_themes,
    peopleMentioned: response.people_mentioned,
    placesMentioned: response.places_mentioned || [],
  };
}
