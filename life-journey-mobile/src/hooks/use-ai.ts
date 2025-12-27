import { useState, useCallback, useRef } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  createAIClient,
  type ChatMessage,
  type TranscriptionResponse,
  type EmotionalHighlight,
} from '@/lib/ai/client';

/**
 * Hook for AI transcription
 */
export function useTranscription() {
  const { session } = useAuthStore();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transcribe = useCallback(
    async (audioUri: string, chapterId: string) => {
      if (!session?.token || !session?.primaryJourneyId) {
        setError('Not authenticated');
        return null;
      }

      setIsTranscribing(true);
      setError(null);

      try {
        const client = createAIClient(session.token);
        const result = await client.transcribeAudio({
          audioUri,
          journeyId: session.primaryJourneyId,
          chapterId,
          language: 'nl',
        });

        setTranscription(result);
        return result;
      } catch (err: any) {
        const errorMessage = err.message || 'Transcriptie mislukt';
        setError(errorMessage);
        console.error('Transcription error:', err);
        return null;
      } finally {
        setIsTranscribing(false);
      }
    },
    [session]
  );

  const getTranscription = useCallback(
    async (transcriptionId: string) => {
      if (!session?.token) {
        setError('Not authenticated');
        return null;
      }

      try {
        const client = createAIClient(session.token);
        const result = await client.getTranscription(transcriptionId);
        setTranscription(result);
        return result;
      } catch (err: any) {
        const errorMessage = err.message || 'Ophalen transcriptie mislukt';
        setError(errorMessage);
        console.error('Get transcription error:', err);
        return null;
      }
    },
    [session]
  );

  return {
    transcribe,
    getTranscription,
    isTranscribing,
    transcription,
    error,
  };
}

/**
 * Hook for AI chat
 */
export function useAIChat() {
  const { session } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string, chapterId?: string) => {
      if (!session?.token || !session?.primaryJourneyId) {
        setError('Not authenticated');
        return;
      }

      const userMessage: ChatMessage = { role: 'user', content };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const client = createAIClient(session.token);
        const response = await client.chat({
          messages: [...messages, userMessage],
          journeyId: session.primaryJourneyId,
          chapterId,
        });

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.message,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: any) {
        const errorMessage = err.message || 'Chat mislukt';
        setError(errorMessage);
        console.error('Chat error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [session, messages]
  );

  const streamMessage = useCallback(
    async (content: string, chapterId?: string) => {
      if (!session?.token || !session?.primaryJourneyId) {
        setError('Not authenticated');
        return;
      }

      const userMessage: ChatMessage = { role: 'user', content };
      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setStreamingMessage('');
      setError(null);

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        const client = createAIClient(session.token);
        let fullMessage = '';

        for await (const chunk of client.streamChat({
          messages: [...messages, userMessage],
          journeyId: session.primaryJourneyId,
          chapterId,
          stream: true,
        })) {
          fullMessage += chunk;
          setStreamingMessage(fullMessage);
        }

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: fullMessage,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingMessage('');
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // Stream was cancelled
          return;
        }

        const errorMessage = err.message || 'Streaming mislukt';
        setError(errorMessage);
        console.error('Stream error:', err);
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [session, messages]
  );

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setStreamingMessage('');
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingMessage('');
    setError(null);
  }, []);

  return {
    messages,
    streamingMessage,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    streamMessage,
    cancelStream,
    clearMessages,
  };
}

/**
 * Hook for AI suggestions
 */
export function useAISuggestions(chapterId: string) {
  const { session } = useAuthStore();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestions = useCallback(async () => {
    if (!session?.token) {
      setError('Not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = createAIClient(session.token);
      const result = await client.getChapterSuggestions(chapterId);
      setSuggestions(result);
    } catch (err: any) {
      const errorMessage = err.message || 'Suggesties laden mislukt';
      setError(errorMessage);
      console.error('Suggestions error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session, chapterId]);

  return {
    suggestions,
    isLoading,
    error,
    loadSuggestions,
  };
}

/**
 * Hook for emotional highlights
 */
export function useHighlights() {
  const { session } = useAuthStore();
  const [highlights, setHighlights] = useState<EmotionalHighlight[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectHighlights = useCallback(
    async (transcriptionId: string) => {
      if (!session?.token) {
        setError('Not authenticated');
        return [];
      }

      setIsDetecting(true);
      setError(null);

      try {
        const client = createAIClient(session.token);
        const result = await client.detectHighlights(transcriptionId);
        setHighlights(result);
        return result;
      } catch (err: any) {
        const errorMessage = err.message || 'Highlights detecteren mislukt';
        setError(errorMessage);
        console.error('Highlights error:', err);
        return [];
      } finally {
        setIsDetecting(false);
      }
    },
    [session]
  );

  return {
    highlights,
    isDetecting,
    error,
    detectHighlights,
  };
}
