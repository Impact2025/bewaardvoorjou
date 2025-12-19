"use client";

import { useCallback, useEffect } from "react";
import { useRecorder } from "./RecorderContext";
import { logger } from "@/lib/logger";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/store/auth-context";
import { CHAPTERS } from "@/lib/chapters";
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";
import { startConversationSession, continueConversation, endConversationSession } from "@/lib/conversation-client";
import { useConfetti } from "@/components/Confetti";

const log = logger.forComponent("useRecorderActions");

interface UseRecorderActionsProps {
  chapterId?: string;
}

export function useRecorderActions({ chapterId }: UseRecorderActionsProps) {
  const { session } = useAuth();
  const { journey } = useJourneyBootstrap();
  const { triggerConfetti } = useConfetti();
  const {
    state,
    refs,
    setRecordingState,
    setMediaBlob,
    setPermissionError,
    setUploadStatus,
    setAiSuggestion,
    showNextChapter,
    reset,
    incrementTime,
    dispatch,
  } = useRecorder();

  const { mode, conversationSessionId, conversationComplete } = state;

  // Handle media errors
  const handleMediaError = useCallback((error: Error) => {
    let errorMessage = "Kon geen toegang krijgen tot camera/microfoon. ";

    if (error.name === "NotAllowedError") {
      errorMessage += "Toegang geweigerd. Klik op het camerapictogram in de adresbalk om toestemming te geven.";
    } else if (error.name === "NotFoundError") {
      if (mode === "video") {
        errorMessage = "Geen camera gevonden. Probeer Audio-modus, Tekst-modus, of sluit een camera aan.";
      } else if (mode === "audio") {
        errorMessage = "Geen microfoon gevonden. Probeer Tekst-modus of sluit een microfoon aan en probeer opnieuw.";
      } else {
        errorMessage = "Geen apparaat gevonden. Controleer uw apparaatinstellingen.";
      }
    } else if (error.name === "NotReadableError") {
      errorMessage += "Camera/microfoon is bezet. Sluit andere apps die deze gebruiken (bijv. Zoom, Teams, Skype).";
    } else {
      errorMessage += `Controleer de permissies in uw browserinstellingen. (Fout: ${error.name})`;
    }

    setPermissionError(errorMessage);

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      setPermissionError(null);
    }, 10000);
  }, [mode, setPermissionError]);

  // Start camera preview
  const startPreview = useCallback(async () => {
    try {
      setPermissionError(null);
      setRecordingState("previewing");
      log.debug("Starting preview", { mode });

      const constraints = mode === "video"
        ? { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      refs.stream.current = stream;
      log.debug("Got stream", { tracks: stream.getTracks().length });

      // Wait for video element to render, then attach stream
      if (mode === "video") {
        setTimeout(() => {
          if (refs.videoPreview.current) {
            refs.videoPreview.current.srcObject = stream;
            log.debug("Set srcObject on video element");
            refs.videoPreview.current.onloadedmetadata = () => {
              log.debug("Video metadata loaded");
              refs.videoPreview.current?.play().catch(e =>
                log.warn("Play error", { error: e })
              );
            };
          } else {
            log.warn("videoRef.current is null after timeout");
          }
        }, 50);
      }
    } catch (error) {
      log.error("Error starting preview", error);
      handleMediaError(error as Error);
      setRecordingState("idle");
    }
  }, [mode, refs, setPermissionError, setRecordingState, handleMediaError]);

  // Stop camera preview
  const stopPreview = useCallback(() => {
    if (refs.stream.current) {
      refs.stream.current.getTracks().forEach(track => track.stop());
      refs.stream.current = null;
    }
    if (refs.videoPreview.current) {
      refs.videoPreview.current.srcObject = null;
    }
    setRecordingState("idle");
    log.debug("Preview stopped");
  }, [refs, setRecordingState]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setPermissionError(null);
      log.debug("Starting recording", { mode });

      // If we don't have a stream yet, get one
      if (!refs.stream.current) {
        log.debug("No existing stream, requesting media access");
        const constraints = mode === "video"
          ? { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true }
          : { audio: true };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        refs.stream.current = stream;
        log.debug("Got stream", { tracks: stream.getTracks().length });

        // If video mode, set preview
        if (mode === "video" && refs.videoPreview.current) {
          refs.videoPreview.current.srcObject = stream;
        }
      }

      // Create media recorder with supported options
      let options: MediaRecorderOptions = {};

      // Use different MIME types for video vs audio-only recording
      const mimeTypes = mode === "video"
        ? [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=h264,opus',
            'video/webm',
            'video/mp4',
          ]
        : [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/mp4',
          ];

      log.info("Checking MIME types for mode", { mode, availableTypes: mimeTypes });
      for (const mimeType of mimeTypes) {
        const supported = MediaRecorder.isTypeSupported(mimeType);
        log.debug("MIME type support check", { mimeType, supported });
        if (supported) {
          options.mimeType = mimeType;
          log.info("Selected MIME type", { mimeType, mode });
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(refs.stream.current, options);
      refs.mediaRecorder.current = mediaRecorder;
      refs.chunks.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          refs.chunks.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const chunkCount = refs.chunks.current.length;
        log.info("MediaRecorder stopped", { chunks: chunkCount });

        if (chunkCount === 0) {
          log.warn("No audio data recorded - chunks array is empty");
          setRecordingState("idle");
          return;
        }

        const mimeType = mediaRecorder.mimeType || (mode === "video" ? 'video/webm' : 'audio/webm');
        const blob = new Blob(refs.chunks.current, { type: mimeType });
        log.info("Created blob", { size: blob.size, type: blob.type, mimeType });

        // Minimum 1KB for audio, 10KB for video - anything smaller is just headers
        const minSize = mode === "video" ? 10000 : 1000;
        if (blob.size < minSize) {
          log.warn("Recording too short - blob is too small to contain valid media", {
            size: blob.size,
            minSize,
            mode,
          });
          setRecordingState("idle");
          setPermissionError("Opname te kort. Neem minimaal 1 seconde op.");
          return;
        }

        setMediaBlob(blob);
        setRecordingState("completed");
        // Note: blob URL is now created in RecorderPreview via useMemo
      };

      // Add error handler to detect issues
      mediaRecorder.onerror = (event) => {
        log.error("MediaRecorder error", new Error("MediaRecorder error"), {
          error: (event as ErrorEvent).error,
          type: event.type,
        });
      };

      // Log state changes for debugging
      mediaRecorder.onstart = () => {
        log.info("MediaRecorder started", { state: mediaRecorder.state });
      };

      // Monitor audio track state
      const audioTrack = refs.stream.current.getAudioTracks()[0];
      if (audioTrack) {
        log.info("Audio track state", {
          enabled: audioTrack.enabled,
          muted: audioTrack.muted,
          readyState: audioTrack.readyState,
          label: audioTrack.label,
        });
        audioTrack.onended = () => {
          log.warn("Audio track ended unexpectedly");
        };
        audioTrack.onmute = () => {
          log.warn("Audio track muted");
        };
      } else {
        log.error("No audio track found in stream!");
      }

      mediaRecorder.start();
      setRecordingState("recording");

      // Start recording timer
      dispatch({ type: "SET_RECORDING_TIME", payload: 0 });
      if (refs.recordingTimer.current) {
        clearInterval(refs.recordingTimer.current);
      }
      refs.recordingTimer.current = setInterval(() => {
        incrementTime();
      }, 1000);

      log.debug("Recording started");
    } catch (error) {
      log.error("Error starting recording", error);
      handleMediaError(error as Error);
    }
  }, [mode, refs, setPermissionError, setMediaBlob, setRecordingState, dispatch, incrementTime, handleMediaError]);

  // Stop recording
  const stopRecording = useCallback(() => {
    log.debug("Stopping recording");
    if (refs.mediaRecorder.current && state.state === "recording") {
      refs.mediaRecorder.current.stop();

      // Stop all tracks
      if (refs.stream.current) {
        log.debug("Stopping media tracks");
        refs.stream.current.getTracks().forEach(track => track.stop());
        refs.stream.current = null;
      }

      // Clear timer
      if (refs.recordingTimer.current) {
        clearInterval(refs.recordingTimer.current);
        refs.recordingTimer.current = null;
      }
    }
  }, [refs, state.state]);

  // Toggle pause
  const togglePause = useCallback(() => {
    if (!refs.mediaRecorder.current) return;

    if (state.state === "paused") {
      refs.mediaRecorder.current.resume();
      setRecordingState("recording");
      // Resume timer
      if (refs.recordingTimer.current) {
        clearInterval(refs.recordingTimer.current);
      }
      refs.recordingTimer.current = setInterval(() => {
        incrementTime();
      }, 1000);
    } else {
      refs.mediaRecorder.current.pause();
      setRecordingState("paused");
      // Pause timer
      if (refs.recordingTimer.current) {
        clearInterval(refs.recordingTimer.current);
        refs.recordingTimer.current = null;
      }
    }
  }, [refs, state.state, setRecordingState, incrementTime]);

  // Reset recording
  const resetRecording = useCallback(() => {
    setMediaBlob(null);
    dispatch({ type: "SET_RECORDING_TIME", payload: 0 });
    if (refs.playback.current) {
      refs.playback.current.src = "";
    }
    setRecordingState("idle");
    log.debug("Recording reset");
  }, [refs, setMediaBlob, setRecordingState, dispatch]);

  // Upload recording
  const uploadRecording = useCallback(async () => {
    if (!state.mediaBlob || !session) return;

    setRecordingState("uploading");
    setUploadStatus("Bezig met uploaden...");

    try {
      if (!session.primaryJourneyId) {
        throw new Error("Geen journey beschikbaar. Voltooi eerst de onboarding.");
      }

      const presignResponse = await apiFetch<{
        upload_url: string;
        asset_id: string;
        upload_method: "POST" | "PUT";
        fields?: Record<string, string>;
      }>(
        "/media/presign",
        {
          method: "POST",
          body: JSON.stringify({
            journey_id: session.primaryJourneyId,
            chapter_id: chapterId,
            modality: mode,
            filename: `recording-${Date.now()}.${mode === "video" ? "webm" : "webm"}`,
            size_bytes: state.mediaBlob.size,
            checksum: "",
          }),
        },
        { token: session.token },
      );

      let uploadOk = false;

      if (presignResponse.upload_url.includes("/media/local-upload/")) {
        // Upload raw binary data for local storage
        const uploadResponse = await fetch(presignResponse.upload_url, {
          method: "PUT",
          body: state.mediaBlob,
          headers: {
            "Content-Type": state.mediaBlob.type || "application/octet-stream",
          },
        });
        uploadOk = uploadResponse.ok;
      } else if (presignResponse.upload_method === "POST" && presignResponse.fields) {
        const formData = new FormData();
        Object.entries(presignResponse.fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append("file", state.mediaBlob);
        const uploadResponse = await fetch(presignResponse.upload_url, {
          method: "POST",
          body: formData,
        });
        uploadOk = uploadResponse.ok;
      } else {
        const uploadResponse = await fetch(presignResponse.upload_url, {
          method: "PUT",
          body: state.mediaBlob,
          headers: {
            "Content-Type": state.mediaBlob.type || "application/octet-stream",
          },
        });
        uploadOk = uploadResponse.ok;
      }

      if (!uploadOk) {
        throw new Error("Upload failed");
      }

      await apiFetch(
        `/media/${presignResponse.asset_id}/complete`,
        { method: "POST" },
        { token: session.token },
      );

      setUploadStatus("Upload geslaagd!");
      showNextChapter();
      setRecordingState("completed");

      setTimeout(() => {
        setUploadStatus(null);
      }, 2000);

      log.debug("Upload completed successfully");

      // AI Interviewer 2.0: Start or continue conversation
      if (!conversationSessionId) {
        // First recording - initialize conversation
        await initializeConversation(presignResponse.asset_id);
      } else if (!conversationComplete) {
        // Subsequent recording - continue conversation
        await handleConversationAfterUpload(presignResponse.asset_id);
      }
    } catch (error) {
      log.error("Upload error", error);
      const message = error instanceof Error ? error.message : "Upload mislukt. Probeer opnieuw.";
      setUploadStatus(message);
      setRecordingState("completed");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.mediaBlob, session, chapterId, mode, setRecordingState, setUploadStatus, showNextChapter, conversationSessionId, conversationComplete]);

  // AI Interviewer 2.0: Initialize conversation session
  const initializeConversation = useCallback(async (assetId: string) => {
    if (!session?.token || !session.primaryJourneyId || !chapterId) {
      log.warn("Cannot start conversation - missing required data");
      return;
    }

    try {
      log.debug("Starting conversation session", { assetId, chapterId });

      const conversationSession = await startConversationSession(
        session.token,
        session.primaryJourneyId,
        chapterId as any,
        assetId
      );

      dispatch({
        type: "START_CONVERSATION",
        payload: {
          sessionId: conversationSession.sessionId,
          question: conversationSession.openingQuestion,
        },
      });

      log.debug("Conversation session started", {
        sessionId: conversationSession.sessionId,
        question: conversationSession.openingQuestion
      });
    } catch (error) {
      log.error("Failed to start conversation", error);
      // Fallback to old flow if conversation fails
    }
  }, [session, chapterId, dispatch]);

  // AI Interviewer 2.0: Handle conversation continuation after upload
  const handleConversationAfterUpload = useCallback(async (assetId: string) => {
    if (!session?.token || !conversationSessionId) return;

    try {
      log.debug("Waiting for transcription...");
      setUploadStatus("Transcriptie wordt gemaakt...");

      // Poll for transcription (simplified - in production you'd use websockets)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Get transcription
      const transcriptResponse = await apiFetch<{ text: string }>(
        `/media/${assetId}/transcript`,
        {},
        { token: session.token }
      );

      if (!transcriptResponse.text) {
        log.warn("No transcription available yet");
        return;
      }

      log.debug("Got transcription, continuing conversation");
      setUploadStatus("AI denkt na...");

      // Continue conversation with transcription
      const response = await continueConversation(
        session.token,
        conversationSessionId,
        transcriptResponse.text
      );

      dispatch({
        type: "UPDATE_CONVERSATION",
        payload: {
          question: response.nextQuestion,
          turnNumber: response.turnNumber,
          depth: response.storyDepth,
          complete: response.conversationComplete,
        },
      });

      if (response.conversationComplete) {
        // Conversation complete! 🎉
        log.debug("Conversation completed!", { turns: response.turnNumber, depth: response.storyDepth });

        const summary = await endConversationSession(session.token, conversationSessionId);

        setUploadStatus(`Gesprek compleet! ${summary.totalTurns} verhalen verteld ✨`);
        triggerConfetti(5000, 150);

        setTimeout(() => {
          showNextChapter();
          setUploadStatus(null);
        }, 3000);
      } else {
        // More questions to ask
        setUploadStatus(`Vraag ${response.turnNumber} volgt...`);
        log.debug("Next question", { question: response.nextQuestion, depth: response.storyDepth });

        setTimeout(() => {
          setUploadStatus(null);
        }, 2000);
      }
    } catch (error) {
      log.error("Conversation continuation failed", error);
      setUploadStatus("Volgende vraag laden...");
      setTimeout(() => setUploadStatus(null), 2000);
    }
  }, [session, conversationSessionId, dispatch, triggerConfetti, showNextChapter, setUploadStatus]);

  // Save text content
  const saveTextContent = useCallback(async () => {
    log.debug("saveTextContent called", {
      hasText: !!state.textContent.trim(),
      textLength: state.textContent.length,
    });

    if (!state.textContent.trim() || !session) {
      log.debug("Early return - missing text or session");
      return;
    }

    setRecordingState("uploading");
    setUploadStatus("Bezig met opslaan...");

    try {
      if (!session.primaryJourneyId) {
        throw new Error("Geen journey beschikbaar. Voltooi eerst de onboarding.");
      }

      const textBlob = new Blob([state.textContent], { type: 'text/plain' });

      const presignResponse = await apiFetch<{
        upload_url: string;
        asset_id: string;
        upload_method: "POST" | "PUT";
        fields?: Record<string, string>;
      }>(
        "/media/presign",
        {
          method: "POST",
          body: JSON.stringify({
            journey_id: session.primaryJourneyId,
            chapter_id: chapterId,
            modality: "text",
            filename: `text-${Date.now()}.txt`,
            size_bytes: textBlob.size,
            checksum: "",
          }),
        },
        { token: session.token },
      );

      let uploadOk = false;

      if (presignResponse.upload_url.includes("/media/local-upload/")) {
        const formData = new FormData();
        formData.append("file", textBlob, `text-${Date.now()}.txt`);
        const uploadResponse = await fetch(presignResponse.upload_url, {
          method: "PUT",
          body: formData,
        });
        uploadOk = uploadResponse.ok;
      } else if (presignResponse.upload_method === "POST" && presignResponse.fields) {
        const formData = new FormData();
        Object.entries(presignResponse.fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append("file", textBlob);
        const uploadResponse = await fetch(presignResponse.upload_url, {
          method: "POST",
          body: formData,
        });
        uploadOk = uploadResponse.ok;
      } else {
        const uploadResponse = await fetch(presignResponse.upload_url, {
          method: "PUT",
          body: textBlob,
          headers: { "Content-Type": "text/plain" },
        });
        uploadOk = uploadResponse.ok;
      }

      if (!uploadOk) {
        throw new Error("Upload failed");
      }

      await apiFetch(
        `/media/${presignResponse.asset_id}/complete`,
        { method: "POST" },
        { token: session.token },
      );

      setUploadStatus("Tekst opgeslagen!");
      setRecordingState("idle");

      log.debug("Text saved successfully, starting AI conversation flow");

      // AI Interviewer 2.0: Handle conversation for text mode
      // For text, we don't need transcription - the text IS the transcript
      const savedText = state.textContent;

      if (!conversationSessionId) {
        // First text entry - start conversation
        try {
          // Use journey.id from bootstrap, which is more reliable than session.primaryJourneyId
          const journeyId = journey?.id || session.primaryJourneyId;

          log.debug("Starting conversation session for text", {
            assetId: presignResponse.asset_id,
            journeyId,
            chapterId,
          });

          if (!journeyId) {
            log.warn("No journey ID available, skipping conversation");
            showNextChapter();
            return;
          }

          const conversationSession = await startConversationSession(
            session.token,
            journeyId,
            chapterId as any,
            presignResponse.asset_id
          );

          log.debug("Conversation session started", { sessionId: conversationSession.sessionId });

          dispatch({
            type: "START_CONVERSATION",
            payload: {
              sessionId: conversationSession.sessionId,
              question: conversationSession.openingQuestion,
            },
          });

          // Now continue with the text they just saved
          setUploadStatus("AI analyseert je verhaal...");

          const response = await continueConversation(
            session.token,
            conversationSession.sessionId,
            savedText
          );

          dispatch({
            type: "UPDATE_CONVERSATION",
            payload: {
              question: response.nextQuestion,
              turnNumber: response.turnNumber,
              depth: response.storyDepth,
              complete: response.conversationComplete,
            },
          });

          if (response.conversationComplete) {
            setUploadStatus(`Mooi verhaal! ${response.turnNumber} delen gedeeld`);
            triggerConfetti(3000, 100);
            setTimeout(() => {
              showNextChapter();
              setUploadStatus(null);
            }, 2500);
          } else {
            setUploadStatus("Vervolgvraag klaar!");
            // Clear text for next response
            dispatch({ type: "SET_TEXT_CONTENT", payload: "" });
            setTimeout(() => setUploadStatus(null), 1500);
          }
        } catch (error: any) {
          log.error("Failed to start text conversation", error, {
            message: error?.message,
            status: error?.status,
          });
          setUploadStatus(null);
          showNextChapter();
        }
      } else if (!conversationComplete) {
        // Continuing conversation with text
        try {
          setUploadStatus("AI denkt na over je antwoord...");

          const response = await continueConversation(
            session.token,
            conversationSessionId,
            savedText
          );

          dispatch({
            type: "UPDATE_CONVERSATION",
            payload: {
              question: response.nextQuestion,
              turnNumber: response.turnNumber,
              depth: response.storyDepth,
              complete: response.conversationComplete,
            },
          });

          if (response.conversationComplete) {
            setUploadStatus(`Gesprek compleet! ${response.turnNumber} verhalen verteld`);
            triggerConfetti(5000, 150);

            const summary = await endConversationSession(session.token, conversationSessionId);
            log.debug("Conversation ended", summary);

            setTimeout(() => {
              showNextChapter();
              setUploadStatus(null);
            }, 3000);
          } else {
            setUploadStatus(`Vraag ${response.turnNumber} - ga verder!`);
            // Clear text for next response
            dispatch({ type: "SET_TEXT_CONTENT", payload: "" });
            setTimeout(() => setUploadStatus(null), 1500);
          }
        } catch (error) {
          log.error("Failed to continue text conversation", error);
          setUploadStatus(null);
          showNextChapter();
        }
      } else {
        // Conversation already complete, just show success
        setTimeout(() => {
          setUploadStatus(null);
          showNextChapter();
        }, 2000);
      }
    } catch (error) {
      log.error("Save error", error);
      const message = error instanceof Error ? error.message : "Opslaan mislukt. Probeer opnieuw.";
      setUploadStatus(message);
      setRecordingState("idle");
    }
  }, [state.textContent, session, chapterId, setRecordingState, setUploadStatus, showNextChapter, conversationSessionId, conversationComplete, dispatch, triggerConfetti]);

  // Get AI suggestion
  const getAISuggestion = useCallback(async () => {
    if (!session) return;

    dispatch({ type: "SET_IS_GETTING_AI_SUGGESTION", payload: true });
    setAiSuggestion(null);

    try {
      const chapter = CHAPTERS.find(ch => ch.id === chapterId);
      if (!chapter) {
        throw new Error("Chapter not found");
      }

      const response = await apiFetch<{ prompt: string }>(
        `/assistant/prompt`,
        {
          method: "POST",
          body: JSON.stringify({
            chapter_id: chapterId,
            follow_ups: [],
            journey_id: journey?.id,
          }),
        },
        { token: session.token },
      );

      setAiSuggestion(response.prompt);
    } catch (error) {
      log.error("Error getting AI suggestion", error);
      setAiSuggestion("Probeer wat meer details toe te voegen over je emoties en ervaringen. Wat voelde je op dat moment?");
    } finally {
      dispatch({ type: "SET_IS_GETTING_AI_SUGGESTION", payload: false });
    }
  }, [session, chapterId, journey?.id, dispatch, setAiSuggestion]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refs.mediaRecorder.current) {
        try {
          refs.mediaRecorder.current.stop();
        } catch {
          // Ignore if already stopped
        }
      }

      if (refs.stream.current) {
        refs.stream.current.getTracks().forEach(track => track.stop());
      }

      if (refs.recordingTimer.current) {
        clearInterval(refs.recordingTimer.current);
      }
    };
  }, [refs]);

  // Handle mode changes - stop preview when switching modes
  useEffect(() => {
    if (state.state === "previewing") {
      stopPreview();
    }
  }, [mode]); // Only react to mode changes

  return {
    startPreview,
    stopPreview,
    startRecording,
    stopRecording,
    togglePause,
    resetRecording,
    uploadRecording,
    saveTextContent,
    getAISuggestion,
    // AI Interviewer 2.0
    initializeConversation,
    handleConversationAfterUpload,
  };
}

export default useRecorderActions;
