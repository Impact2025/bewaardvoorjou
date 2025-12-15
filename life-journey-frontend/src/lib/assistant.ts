import { apiFetch } from "@/lib/api-client";
import type { ChapterId } from "@/lib/types";

// =============================================================================
// Types
// =============================================================================

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantChatRequest {
  message: string;
  chapter_id?: ChapterId;
  journey_id?: string;
  conversation_history?: ConversationMessage[];
}

export interface AssistantChatResponse {
  response: string;
  suggestions?: string[];
}

/** Analysis of a transcript with extracted themes and emotions */
export interface TranscriptAnalysis {
  themes: string[];
  people: string[];
  emotions: string[];
  encouragement?: string;
}

/** Request for generating a context-aware follow-up question */
export interface FollowUpRequest {
  journey_id: string;
  chapter_id: ChapterId;
  transcript: string;
  previous_prompts?: string[];
  include_analysis?: boolean;
}

/** Response with follow-up question and optional analysis */
export interface FollowUpResponse {
  follow_up: string;
  analysis?: TranscriptAnalysis;
}

/** Request for prompt generation with journey context */
export interface PromptRequest {
  chapter_id: ChapterId;
  follow_ups?: string[];
  journey_id?: string;
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Fetch an AI-generated interview prompt for a chapter.
 * Now supports context-aware prompting with journey memory.
 */
export async function fetchAssistantPrompt(
  chapterId: ChapterId,
  followUps: string[] = [],
  token?: string,
  journeyId?: string,
): Promise<string> {
  try {
    const data = await apiFetch<{ prompt: string }>(
      "/assistant/prompt",
      {
        method: "POST",
        body: JSON.stringify({
          chapter_id: chapterId,
          follow_ups: followUps,
          journey_id: journeyId,
        }),
      },
      token ? { token } : undefined,
    );
    return data.prompt;
  } catch (error) {
    return (
      "Vertel eens over een moment dat je nog niemand hebt toevertrouwd. Wat maakte het zo bijzonder?"
    );
  }
}

export async function chatWithAssistant(
  request: AssistantChatRequest,
  token?: string,
): Promise<AssistantChatResponse> {
  try {
    const data = await apiFetch<AssistantChatResponse>(
      "/assistant/chat",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
      token ? { token } : undefined,
    );
    return data;
  } catch (error) {
    console.error("Failed to chat with assistant:", error);
    return {
      response: "Sorry, ik kon je vraag niet verwerken. Probeer het opnieuw.",
      suggestions: [],
    };
  }
}

export async function getHelpSuggestions(
  chapterId: ChapterId,
  token?: string,
): Promise<string[]> {
  try {
    const data = await apiFetch<{ suggestions: string[] }>(
      "/assistant/help-suggestions",
      {
        method: "POST",
        body: JSON.stringify({ chapter_id: chapterId }),
      },
      token ? { token } : undefined,
    );
    return data.suggestions;
  } catch (error) {
    console.error("Failed to get help suggestions:", error);
    return [
      "Hoe kan ik mijn verhaal het beste structureren?",
      "Ik vind het moeilijk om te beginnen, wat raad je aan?",
      "Hoe maak ik een goede audio/video opname?",
    ];
  }
}

/**
 * Generate an intelligent follow-up question based on transcript.
 * Uses AI to analyze what the user said and ask deeper questions.
 */
export async function generateFollowUp(
  request: FollowUpRequest,
  token?: string,
): Promise<FollowUpResponse> {
  try {
    const data = await apiFetch<FollowUpResponse>(
      "/assistant/follow-up",
      {
        method: "POST",
        body: JSON.stringify(request),
      },
      token ? { token } : undefined,
    );
    return data;
  } catch (error) {
    console.error("Failed to generate follow-up:", error);
    return {
      follow_up: "Kun je daar wat meer over vertellen?",
    };
  }
}

/**
 * Analyze transcript to extract themes, emotions, and mentioned people.
 * Useful for real-time feedback during recording.
 */
export async function analyzeTranscript(
  transcript: string,
  token?: string,
): Promise<TranscriptAnalysis> {
  try {
    const data = await apiFetch<TranscriptAnalysis>(
      "/assistant/analyze-transcript",
      {
        method: "POST",
        body: JSON.stringify({ transcript }),
      },
      token ? { token } : undefined,
    );
    return data;
  } catch (error) {
    console.error("Failed to analyze transcript:", error);
    return {
      themes: [],
      people: [],
      emotions: [],
    };
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Map emotion type to Dutch display label.
 */
export const EMOTION_LABELS: Record<string, string> = {
  positive: "Positief",
  somber: "Reflectief",
  anxious: "Gespannen",
  frustrated: "Gefrustreerd",
};

/**
 * Map theme type to Dutch display label.
 */
export const THEME_LABELS: Record<string, string> = {
  familie: "Familie",
  jeugd: "Jeugd",
  werk: "Werk",
  liefde: "Liefde",
  verlies: "Verlies",
};

/**
 * Get a display-friendly label for an emotion.
 */
export function getEmotionLabel(emotion: string): string {
  return EMOTION_LABELS[emotion] || emotion;
}

/**
 * Get a display-friendly label for a theme.
 */
export function getThemeLabel(theme: string): string {
  return THEME_LABELS[theme] || theme;
}
