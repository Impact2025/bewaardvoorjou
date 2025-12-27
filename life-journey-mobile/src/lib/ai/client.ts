import { API_BASE_URL } from '@/lib/config';

/**
 * AI Service Client for Whisper transcription and Claude chat
 * Uses the backend API which proxies to OpenRouter
 */

export interface TranscriptionRequest {
  audioUri: string;
  journeyId: string;
  chapterId: string;
  language?: string;
}

export interface TranscriptionResponse {
  id: string;
  text: string;
  language: string;
  duration: number;
  segments: TranscriptionSegment[];
  highlights?: EmotionalHighlight[];
}

export interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

export interface EmotionalHighlight {
  type: 'laughter' | 'insight' | 'love' | 'wisdom';
  startTime: number;
  endTime: number;
  text: string;
  confidence: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  journeyId: string;
  chapterId?: string;
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  message: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * AI Service Client
 */
export class AIClient {
  private baseUrl: string;
  private token: string;

  constructor(token: string) {
    this.baseUrl = API_BASE_URL;
    this.token = token;
  }

  /**
   * Transcribe audio using Whisper
   */
  async transcribeAudio(request: TranscriptionRequest): Promise<TranscriptionResponse> {
    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Read the audio file
      const audioFile = {
        uri: request.audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any;

      formData.append('file', audioFile);
      formData.append('journey_id', request.journeyId);
      formData.append('chapter_id', request.chapterId);
      if (request.language) {
        formData.append('language', request.language);
      }

      const response = await fetch(`${this.baseUrl}/transcriptions/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          // Don't set Content-Type - let FormData set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Transcription failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  /**
   * Get transcription by ID
   */
  async getTranscription(transcriptionId: string): Promise<TranscriptionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/transcriptions/${transcriptionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get transcription: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get transcription error:', error);
      throw error;
    }
  }

  /**
   * Chat with Claude AI assistant
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: request.messages,
          journey_id: request.journeyId,
          chapter_id: request.chapterId,
          stream: false, // Non-streaming for now
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Chat failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        message: data.message,
        usage: data.usage,
      };
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  /**
   * Stream chat with Claude AI assistant (Server-Sent Events)
   */
  async *streamChat(request: ChatRequest): AsyncGenerator<string, void, unknown> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          messages: request.messages,
          journey_id: request.journeyId,
          chapter_id: request.chapterId,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Stream failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                yield parsed.content;
              }
            } catch (e) {
              // Skip invalid JSON
              console.warn('Invalid JSON in stream:', data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream chat error:', error);
      throw error;
    }
  }

  /**
   * Get AI suggestions for a chapter
   */
  async getChapterSuggestions(chapterId: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/suggestions/${chapterId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get suggestions: ${response.status}`);
      }

      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Get suggestions error:', error);
      return [];
    }
  }

  /**
   * Detect emotional highlights in transcription
   */
  async detectHighlights(transcriptionId: string): Promise<EmotionalHighlight[]> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/highlights/${transcriptionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to detect highlights: ${response.status}`);
      }

      const data = await response.json();
      return data.highlights || [];
    } catch (error) {
      console.error('Detect highlights error:', error);
      return [];
    }
  }
}

/**
 * Helper function to create AI client
 */
export function createAIClient(token: string): AIClient {
  return new AIClient(token);
}
