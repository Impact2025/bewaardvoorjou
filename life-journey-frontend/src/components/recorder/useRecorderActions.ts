"use client";

import { useCallback, useEffect } from "react";
import { useRecorder } from "./RecorderContext";
import { logger } from "@/lib/logger";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/store/auth-context";
import { CHAPTERS } from "@/lib/chapters";
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";

const log = logger.forComponent("useRecorderActions");

interface UseRecorderActionsProps {
  chapterId?: string;
}

export function useRecorderActions({ chapterId }: UseRecorderActionsProps) {
  const { session } = useAuth();
  const { journey } = useJourneyBootstrap();
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

  const { mode } = state;

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
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=h264,opus',
        'video/webm',
        'video/mp4',
      ];

      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          options.mimeType = mimeType;
          log.debug("Using MIME type", { mimeType });
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
        log.debug("MediaRecorder stopped", { chunks: refs.chunks.current.length });
        const mimeType = mediaRecorder.mimeType || (mode === "video" ? 'video/webm' : 'audio/webm');
        const blob = new Blob(refs.chunks.current, { type: mimeType });
        log.debug("Created blob", { size: blob.size, type: blob.type });
        setMediaBlob(blob);
        setRecordingState("completed");

        // Set playback source
        setTimeout(() => {
          if (refs.playback.current) {
            const blobUrl = URL.createObjectURL(blob);
            log.debug("Setting blob URL for playback");
            refs.playback.current.src = blobUrl;
            (refs.playback.current as HTMLMediaElement).load();
          }
        }, 100);
      };

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
        const formData = new FormData();
        formData.append("file", state.mediaBlob, `recording-${Date.now()}.webm`);
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
    } catch (error) {
      log.error("Upload error", error);
      const message = error instanceof Error ? error.message : "Upload mislukt. Probeer opnieuw.";
      setUploadStatus(message);
      setRecordingState("completed");
    }
  }, [state.mediaBlob, session, chapterId, mode, setRecordingState, setUploadStatus, showNextChapter]);

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
      showNextChapter();
      setRecordingState("idle");

      setTimeout(() => {
        setUploadStatus(null);
      }, 2000);

      log.debug("Text saved successfully");
    } catch (error) {
      log.error("Save error", error);
      const message = error instanceof Error ? error.message : "Opslaan mislukt. Probeer opnieuw.";
      setUploadStatus(message);
      setRecordingState("idle");
    }
  }, [state.textContent, session, chapterId, setRecordingState, setUploadStatus, showNextChapter]);

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
  };
}

export default useRecorderActions;
