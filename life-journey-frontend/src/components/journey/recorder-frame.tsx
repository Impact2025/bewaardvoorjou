"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, PauseCircle, PlayCircle, Video, Waves, Square, FileText, Sparkles, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/store/auth-context";
import { CHAPTERS } from "@/lib/chapters";
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";
import { useRouter } from "next/navigation";
import { AIAssistantChat } from "@/components/journey/ai-assistant-chat";

const frameThemes = [
  { id: "modern", label: "Modern", accent: "from-teal/40" },
  { id: "warm", label: "Warm", accent: "from-orange/40" },
  { id: "light", label: "Light", accent: "from-highlight/40" },
];

interface RecorderFrameProps {
  chapterId?: string;
  mode?: "video" | "audio" | "text";
}

// Helper function to get default mode for a chapter
function getDefaultModeForChapter(chapterId?: string): "video" | "audio" | "text" {
  if (!chapterId) return "text";

  const chapter = CHAPTERS.find(ch => ch.id === chapterId);
  if (!chapter) return "text";

  // Return the first default modality for this chapter
  if (chapter.defaultModalities.includes("text")) return "text";
  if (chapter.defaultModalities.includes("audio")) return "audio";
  if (chapter.defaultModalities.includes("video")) return "video";

  return "text";
}

// Helper function to get next chapter ID
function getNextChapterId(currentChapterId?: string): string | null {
  if (!currentChapterId) return null;

  const currentIndex = CHAPTERS.findIndex(ch => ch.id === currentChapterId);
  if (currentIndex === -1 || currentIndex === CHAPTERS.length - 1) {
    return null; // No next chapter
  }

  return CHAPTERS[currentIndex + 1].id;
}

export function RecorderFrame({ chapterId, mode: initialMode }: RecorderFrameProps) {
  const { session } = useAuth();
  const { journey } = useJourneyBootstrap();
  const router = useRouter();

  // Use provided mode or determine from chapter's default modalities
  const defaultMode = initialMode || getDefaultModeForChapter(chapterId);
  const [mode, setMode] = useState<"video" | "audio" | "text">(defaultMode);
  const [theme, setTheme] = useState(frameThemes[0]);
  const [showNextChapterPrompt, setShowNextChapterPrompt] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);

  // Text mode state
  const [textContent, setTextContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [isGettingAISuggestion, setIsGettingAISuggestion] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // AI Assistant Chat state
  const [isAssistantChatOpen, setIsAssistantChatOpen] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playbackRef = useRef<HTMLVideoElement | null>(null);

  // Start camera preview (without recording)
  const startPreview = async () => {
    try {
      setPermissionError(null);
      setShowPreview(true);  // Set this FIRST so video element renders
      console.log("Starting preview...", { mode });

      const constraints = mode === "video"
        ? { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      console.log("Got stream:", stream.getTracks());

      // Wait for video element to render, then attach stream
      if (mode === "video") {
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            console.log("✅ Set srcObject on video element");
            videoRef.current.onloadedmetadata = () => {
              console.log("Video metadata loaded, playing...");
              videoRef.current?.play().catch(e => console.error("Play error:", e));
              setPreviewReady(true);
            };
          } else {
            console.error("❌ videoRef.current is still null after timeout!");
          }
        }, 50);
      }

      console.log("Preview state set to true");
    } catch (error: any) {
      console.error("Error starting preview:", error);
      handleMediaError(error);
    }
  };

  // Stop camera preview
  const stopPreview = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowPreview(false);
    setPreviewReady(false);
  };

  // Handle media errors
  const handleMediaError = (error: any) => {
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

    setTimeout(() => {
      setPermissionError(null);
    }, 10000);
  };

  // Request permissions and start recording
  const startRecording = async () => {
    try {
      // Clear any previous permission errors
      setPermissionError(null);
      console.log("🎬 Starting recording in", mode, "mode");

      // If we don't have a stream yet, get one
      if (!streamRef.current) {
        console.log("No existing stream, requesting media access...");
        const constraints = mode === "video"
          ? { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true }
          : { audio: true };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        console.log("✅ Got stream:", stream.getTracks());

        // If video mode, show preview and wait for element
        if (mode === "video") {
          setShowPreview(true);
          // Wait for video element to render
          await new Promise(resolve => setTimeout(resolve, 50));

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            console.log("✅ Set stream on preview video");
          } else {
            console.warn("⚠️ videoRef.current is null, but continuing anyway");
          }
        }
      } else {
        console.log("✅ Using existing stream");
      }

      // Create media recorder with supported options
      let options: MediaRecorderOptions = {};

      // Try to find a supported MIME type
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
          console.log("Using MIME type:", mimeType);
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log("MediaRecorder stopped, chunks collected:", chunksRef.current.length);
        const mimeType = mediaRecorder.mimeType || (mode === "video" ? 'video/webm' : 'audio/webm');
        const blob = new Blob(chunksRef.current, { type: mimeType });
        console.log("Created blob:", blob.size, "bytes, type:", blob.type);
        setMediaBlob(blob);

        // Wait for React to render the playback element, then set source
        setTimeout(() => {
          if (playbackRef.current) {
            const blobUrl = URL.createObjectURL(blob);
            console.log("✅ Setting blob URL for playback:", blobUrl);
            console.log("Playback element:", playbackRef.current);

            // Set source and load
            playbackRef.current.src = blobUrl;
            playbackRef.current.load();

            console.log("Video/audio source set and loading...");
          } else {
            console.error("❌ playbackRef.current is null! Cannot set video source");
          }
        }, 100);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setShowPreview(true);

      // Start recording timer
      setRecordingTime(0); // Reset timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          console.log('Timer tick:', prev + 1);
          return prev + 1;
        });
      }, 1000);
    } catch (error: any) {
      console.error("Error starting recording:", error);
      handleMediaError(error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    console.log("🛑 Stopping recording...");
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      // Stop all tracks
      if (streamRef.current) {
        console.log("Stopping media tracks...");
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Clear timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      console.log("Recording stopped, waiting for onstop event...");
    }
  };

  // Pause/resume recording
  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        // Resume timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
        recordingTimerRef.current = setInterval(() => {
          setRecordingTime(prev => {
            console.log('Timer resume tick:', prev + 1);
            return prev + 1;
          });
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        // Pause timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      }
    }
  };

  // Reset after upload or discard
  const resetRecording = () => {
    setMediaBlob(null);
    setRecordingTime(0);
    if (playbackRef.current) {
      playbackRef.current.src = "";
    }
  };

  // Upload recording to backend
  const uploadRecording = async () => {
    if (!mediaBlob || !session) return;

    setIsUploading(true);
    setUploadStatus("Bezig met uploaden...");

    try {
      // First, get presigned URL from backend
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
            size_bytes: mediaBlob.size,
            checksum: "",
          }),
        },
        { token: session.token },
      );
      
      let uploadOk = false;

      // Check if it's a local storage URL
      if (presignResponse.upload_url.includes("/media/local-upload/")) {
        // Local storage: use FormData
        const formData = new FormData();
        formData.append("file", mediaBlob, `recording-${Date.now()}.webm`);
        const uploadResponse = await fetch(presignResponse.upload_url, {
          method: "PUT",
          body: formData,
        });
        uploadOk = uploadResponse.ok;
      } else if (presignResponse.upload_method === "POST" && presignResponse.fields) {
        // S3 multipart upload
        const formData = new FormData();
        Object.entries(presignResponse.fields).forEach(([key, value]) => {
          formData.append(key, value);
        });
        formData.append("file", mediaBlob);
        const uploadResponse = await fetch(presignResponse.upload_url, {
          method: "POST",
          body: formData,
        });
        uploadOk = uploadResponse.ok;
      } else {
        // S3 simple PUT
        const uploadResponse = await fetch(presignResponse.upload_url, {
          method: "PUT",
          body: mediaBlob,
          headers: {
            "Content-Type": mediaBlob.type || "application/octet-stream",
          },
        });
        uploadOk = uploadResponse.ok;
      }
      
      if (!uploadOk) {
        throw new Error("Upload failed");
      }
      
      // Notify backend that upload is complete
      await apiFetch(
        `/media/${presignResponse.asset_id}/complete`,
        {
          method: "POST",
        },
        { token: session.token },
      );
      
      setUploadStatus("Upload geslaagd!");

      // Show prompt to go to next chapter BEFORE resetting
      setShowNextChapterPrompt(true);

      // Don't reset recording immediately - let user decide what to do next
      // resetRecording() will be called when user clicks "Blijf hier" or navigates away

      // Reset status after 2 seconds
      setTimeout(() => {
        setUploadStatus(null);
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      const message =
        error instanceof Error ? error.message : "Upload mislukt. Probeer opnieuw.";
      setUploadStatus(message);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle text input changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setTextContent(text);

    // Update word count
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  // Get AI writing suggestion
  const getAISuggestion = async () => {
    if (!session) return;

    setIsGettingAISuggestion(true);
    setAiSuggestion(null);

    try {
      // Get a new prompt/follow-up question from the AI interviewer
      const chapter = CHAPTERS.find(ch => ch.id === chapterId);
      if (!chapter) {
        throw new Error("Chapter not found");
      }

      // Call the prompt generation endpoint with journey context
      const response = await apiFetch<{ prompt: string }>(
        `/assistant/prompt`,
        {
          method: "POST",
          body: JSON.stringify({
            chapter_id: chapterId,
            follow_ups: [],
            journey_id: journey?.id  // Include journey ID for context from previous chapters
          })
        },
        { token: session.token }
      );

      setAiSuggestion(response.prompt);
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
      setAiSuggestion("Probeer wat meer details toe te voegen over je emoties en ervaringen. Wat voelde je op dat moment?");
    } finally {
      setIsGettingAISuggestion(false);
    }
  };

  // Save text content
  const saveTextContent = async () => {
    console.log("💾 saveTextContent CALLED!", {
      hasText: !!textContent.trim(),
      textLength: textContent.length,
      hasSession: !!session,
      isUploading
    });

    if (!textContent.trim() || !session) {
      console.log("❌ Early return - missing text or session", { textContent: textContent.substring(0, 50), session: !!session });
      return;
    }

    setIsUploading(true);
    setUploadStatus("Bezig met opslaan...");

    try {
      if (!session.primaryJourneyId) {
        throw new Error("Geen journey beschikbaar. Voltooi eerst de onboarding.");
      }
      console.log("Starting text save...", { journeyId: session.primaryJourneyId, chapterId });

      // Create a text blob to upload
      const textBlob = new Blob([textContent], { type: 'text/plain' });

      // Get presigned URL from backend
      console.log("Requesting presigned URL...");
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
      console.log("Got presigned URL response:", presignResponse);

      let uploadOk = false;

      // Check if it's a local storage URL
      console.log("Uploading file...");
      if (presignResponse.upload_url.includes("/media/local-upload/")) {
        // Local storage: use FormData
        console.log("Using local storage");
        const formData = new FormData();
        formData.append("file", textBlob, `text-${Date.now()}.txt`);
        const uploadResponse = await fetch(presignResponse.upload_url, {
          method: "PUT",
          body: formData,
        });
        uploadOk = uploadResponse.ok;
        console.log("Local upload response:", uploadResponse.status, uploadOk);
      } else if (presignResponse.upload_method === "POST" && presignResponse.fields) {
        // S3 multipart upload
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
        // S3 simple PUT
        const uploadResponse = await fetch(presignResponse.upload_url, {
          method: "PUT",
          body: textBlob,
          headers: {
            "Content-Type": textBlob.type || "text/plain",
          },
        });
        uploadOk = uploadResponse.ok;
      }

      if (!uploadOk) {
        console.error("Upload failed!");
        throw new Error("Upload failed");
      }

      // Notify backend that upload is complete
      console.log("Notifying backend of upload completion...");
      await apiFetch(
        `/media/${presignResponse.asset_id}/complete`,
        {
          method: "POST",
        },
        { token: session.token },
      );
      console.log("Upload complete notification sent!");

      setUploadStatus("Tekst opgeslagen!");
      console.log("Text saved successfully!");

      // Show prompt to go to next chapter
      setShowNextChapterPrompt(true);

      // Reset after showing the prompt
      setTimeout(() => {
        setUploadStatus(null);
      }, 2000);
    } catch (error) {
      console.error("Save error:", error);
      const message =
        error instanceof Error ? error.message : "Opslaan mislukt. Probeer opnieuw.";
      setUploadStatus(message);
    } finally {
      setIsUploading(false);
    }
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle mode changes - stop preview when switching modes
  useEffect(() => {
    if (showPreview && !isRecording) {
      stopPreview();
    }
  }, [mode]);

  // Update mode when chapter changes
  useEffect(() => {
    const newMode = getDefaultModeForChapter(chapterId);
    setMode(newMode);
  }, [chapterId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop any ongoing recording
      if (mediaRecorderRef.current) {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          // Ignore if already stopped
        }
      }

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Clear timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []); // Only run on unmount

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          {isRecording && mode !== "text" ? (
            <span className="h-3 w-3 animate-pulse rounded-full bg-coral" />
          ) : null}
          {mode === "text"
            ? textContent.trim()
              ? `${wordCount} ${wordCount === 1 ? 'woord' : 'woorden'} geschreven`
              : "Klaar om te schrijven"
            : isRecording
              ? `Opname bezig (${formatTime(recordingTime)})`
              : mediaBlob
                ? "Opname voltooid"
                : "Klaar om te starten"}
        </div>
        <div className="flex items-center gap-2">
          {/* AI Assistant Help Button */}
          <Button
            onClick={() => setIsAssistantChatOpen(true)}
            variant="ghost"
            size="sm"
            className="border-orange/30 bg-gradient-to-br from-orange/10 to-gold/10 text-orange-dark hover:from-orange/20 hover:to-gold/20 flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Hulp nodig?</span>
          </Button>

          <div className="flex items-center gap-2 rounded-full border border-neutral-sand bg-cream p-1 text-xs">
            <button
              type="button"
              onClick={() => setMode("video")}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-2 transition",
                mode === "video"
                  ? "bg-teal/20 text-teal"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              <Video className="h-3.5 w-3.5" /> Video
            </button>
            <button
              type="button"
              onClick={() => setMode("audio")}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-2 transition",
                mode === "audio"
                  ? "bg-teal/20 text-teal"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              <Mic className="h-3.5 w-3.5" /> Audio
            </button>
            <button
              type="button"
              onClick={() => setMode("text")}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-2 transition",
              mode === "text"
                ? "bg-teal/20 text-teal"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            <FileText className="h-3.5 w-3.5" /> Tekst
          </button>
        </div>
      </div>
    </div>

      <div className="relative overflow-hidden rounded-[42px] border border-teal/30 bg-cream p-6 shadow-2xl">
        <div
          className={cn(
            "absolute inset-0 -z-10 bg-gradient-to-br via-transparent to-transparent",
            theme.accent,
          )}
        />
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Kanaal · {CHAPTERS.find(ch => ch.id === chapterId)?.title || chapterId}</span>
            <div className="flex items-center gap-2">
              <button className="rounded-full border border-neutral-sand bg-cream px-3 py-1 text-[11px] uppercase tracking-wide text-slate-700">
                Veiligheidsmodus
              </button>
              <button className="rounded-full border border-neutral-sand bg-cream px-3 py-1 text-[11px] uppercase tracking-wide text-slate-700">
                Camera vervagen
              </button>
            </div>
          </div>

          <div className={cn(
            "relative mx-auto flex w-full items-center justify-center rounded-[32px] border border-neutral-sand bg-cream overflow-hidden text-center text-sm text-slate-700",
            mode === "text" ? "max-w-6xl min-h-[850px]" : "aspect-[4/3] max-w-[540px]"
          )}>
            {mode === "text" ? (
              <div className="w-full h-full flex flex-col gap-4 p-6">
                <div className="flex-1 flex flex-col">
                  <textarea
                    value={textContent}
                    onChange={handleTextChange}
                    placeholder="Begin hier te schrijven... Deel je verhaal, herinneringen en gedachten. Neem de tijd die je nodig hebt."
                    className="flex-1 w-full resize-none rounded-xl border-2 border-input-border bg-white px-6 py-4 text-input text-lg leading-relaxed focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
                  />
                  <div className="flex items-center justify-between mt-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-orange bg-orange/10 px-2 py-1 rounded-full">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-orange" />
                        Aan het schrijven
                      </span>
                      <span className="text-xs text-slate-500">
                        {wordCount} {wordCount === 1 ? 'woord' : 'woorden'}
                      </span>
                    </div>
                    {textContent.length > 20 && (
                      <Button
                        onClick={getAISuggestion}
                        disabled={isGettingAISuggestion}
                        variant="ghost"
                        size="sm"
                        className="text-xs text-orange hover:text-orange-dark"
                      >
                        <Sparkles className="h-3.5 w-3.5 mr-1" />
                        {isGettingAISuggestion ? "AI denkt mee..." : "Vraag AI om suggestie"}
                      </Button>
                    )}
                  </div>
                </div>
                {aiSuggestion && (
                  <div className="bg-gold/10 border border-gold/30 rounded-lg p-3 text-left">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-900 mb-1">AI-suggestie</p>
                        <p className="text-sm text-slate-700 italic">{aiSuggestion}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : mode === "video" && mediaBlob ? (
              // Playback after recording
              <div className="w-full h-full relative bg-black">
                <video
                  ref={playbackRef}
                  controls
                  playsInline
                  className="w-full h-full object-contain rounded-[24px]"
                  onLoadedMetadata={(e) => {
                    console.log("Playback video metadata loaded");
                    console.log("Video dimensions:", e.currentTarget.videoWidth, "x", e.currentTarget.videoHeight);
                    console.log("Video duration:", e.currentTarget.duration, "seconds");
                    // Try to play
                    e.currentTarget.play().then(() => {
                      console.log("✅ Video playing");
                    }).catch(err => {
                      console.error("❌ Could not autoplay:", err);
                    });
                  }}
                  onError={(e) => {
                    console.error("Playback video error:", e);
                    const video = e.currentTarget;
                    console.error("Error code:", video.error?.code, "Message:", video.error?.message);
                  }}
                  onCanPlay={() => console.log("Video can play")}
                  onPlay={() => console.log("Video is playing")}
                  onPause={() => console.log("Video paused")}
                />
                <div className="absolute top-2 left-2 bg-success-green/90 text-white text-xs px-3 py-1 rounded-full">
                  Opname voltooid - {(mediaBlob.size / (1024 * 1024)).toFixed(1)} MB
                </div>
              </div>
            ) : mode === "video" && (showPreview || isRecording) ? (
              // Live camera preview or recording
              <div className="w-full h-full relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-[24px] scale-x-[-1]"
                />
                {isRecording && (
                  <div className="absolute top-2 left-2 flex items-center gap-2 bg-coral/90 text-white text-xs px-3 py-1 rounded-full">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                    Opname bezig
                  </div>
                )}
                {showPreview && !isRecording && (
                  <div className="absolute top-2 left-2 bg-teal/90 text-white text-xs px-3 py-1 rounded-full">
                    Camera preview
                  </div>
                )}
              </div>
            ) : mode === "video" ? (
              // Video mode - not started yet
              <div className="space-y-4 p-6">
                <Video className="h-16 w-16 mx-auto text-teal" />
                <p className="text-balance text-base font-medium">
                  "Hoe zou je de sfeer van je ouderlijk huis omschrijven? Welke geluiden of geuren herinner je je?"
                </p>
                <p className="text-xs text-slate-500">
                  Klik op "Camera preview" om jezelf te zien voordat je begint.
                </p>
                <p className="text-xs text-orange mt-2">
                  💡 Tip: Geef toestemming voor camera als je browser daarom vraagt
                </p>
                <Button
                  onClick={startPreview}
                  variant="ghost"
                  className="text-sm text-teal border border-teal hover:bg-teal/10"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Camera preview
                </Button>
              </div>
            ) : isRecording ? (
              <div className="flex flex-col items-center gap-4 p-6">
                <Waves className="h-16 w-16 text-teal animate-pulse" />
                <p className="max-w-sm text-pretty text-base">
                  Audio-opname bezig... Je stem wordt vol en warm opgenomen.
                </p>
              </div>
            ) : mediaBlob ? (
              <div className="flex flex-col items-center gap-4 p-6">
                <div className="w-full max-w-md">
                  <audio
                    ref={playbackRef}
                    controls
                    className="w-full"
                    onLoadedMetadata={() => console.log("Audio metadata loaded")}
                    onError={(e) => console.error("Audio playback error:", e)}
                  />
                </div>
                <Waves className="h-16 w-16 text-success-green" />
                <p className="max-w-sm text-pretty text-base">
                  Opname voltooid! Luister je opname en klik op "Uploaden" om op te slaan.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 p-6">
                <Waves className="h-16 w-16 text-teal" />
                <p className="max-w-sm text-pretty text-base">
                  Audio-modus actief. Je stem wordt vol en warm opgenomen, zonder video.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-3xl border border-neutral-sand bg-cream px-4 py-3 text-xs text-slate-600">
            <span>Tempo · Zacht & nieuwsgierig</span>
            <span>Verstreken: {formatTime(recordingTime)}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              Thema:
              {frameThemes.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option)}
                  className={cn(
                    "rounded-full border px-3 py-1",
                    theme.id === option.id
                      ? "border-teal text-teal"
                      : "border-neutral-sand text-slate-500 hover:text-slate-700",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {uploadStatus && (
                <span className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded-full",
                  uploadStatus.includes("geslaagd") || uploadStatus.includes("opgeslagen")
                    ? "bg-success-green/10 text-success-green"
                    : uploadStatus.includes("mislukt") || uploadStatus.includes("Error")
                      ? "bg-red-500/10 text-red-600"
                      : "bg-orange/10 text-orange"
                )}>
                  {uploadStatus}
                </span>
              )}
              {mode === "text" ? (
                showNextChapterPrompt ? (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setShowNextChapterPrompt(false);
                        setTextContent("");
                        setWordCount(0);
                      }}
                      variant="ghost"
                      className="border-neutral-sand text-slate-700 hover:bg-neutral-sand"
                    >
                      Blijf hier
                    </Button>
                    <Button
                      onClick={() => {
                        const nextChapter = getNextChapterId(chapterId);
                        if (nextChapter) {
                          router.push(`/chapter/${nextChapter}`);
                        } else {
                          router.push("/chapters");
                        }
                      }}
                      className="btn-primary flex items-center gap-2"
                    >
                      Ga naar volgend hoofdstuk
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      console.log("🖱️ Opslaan button clicked!");
                      saveTextContent();
                    }}
                    disabled={isUploading || !textContent.trim()}
                    className="btn-primary px-8 py-6 text-lg font-semibold"
                  >
                    {isUploading ? "Opslaan..." : "💾 Opslaan"}
                  </Button>
                )
              ) : isRecording ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={togglePause}
                    className="border-neutral-sand text-slate-700 hover:bg-neutral-sand"
                  >
                    {isPaused ? (
                      <>
                        <PlayCircle className="h-4 w-4" /> Hervatten
                      </>
                    ) : (
                      <>
                        <PauseCircle className="h-4 w-4" /> Pauzeren
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={stopRecording}
                    className="btn-secondary"
                  >
                    <Square className="h-4 w-4" /> Stop opname
                  </Button>
                </>
              ) : mediaBlob ? (
                showNextChapterPrompt ? (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setShowNextChapterPrompt(false);
                        resetRecording();
                      }}
                      variant="ghost"
                      className="border-neutral-sand text-slate-700 hover:bg-neutral-sand"
                    >
                      Blijf hier
                    </Button>
                    <Button
                      onClick={() => {
                        const nextChapter = getNextChapterId(chapterId);
                        if (nextChapter) {
                          router.push(`/chapter/${nextChapter}`);
                        } else {
                          router.push("/chapters");
                        }
                      }}
                      className="btn-primary flex items-center gap-2"
                    >
                      Ga naar volgend hoofdstuk
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      onClick={resetRecording}
                      variant="ghost"
                      className="border-neutral-sand text-slate-700 hover:bg-neutral-sand"
                    >
                      Opnieuw opnemen
                    </Button>
                    <Button
                      onClick={uploadRecording}
                      disabled={isUploading}
                      className="btn-primary"
                    >
                      {isUploading ? "Uploaden..." : "Uploaden"}
                    </Button>
                  </>
                )
              ) : showPreview && mode === "video" ? (
                <>
                  <Button
                    onClick={stopPreview}
                    variant="ghost"
                    className="border-neutral-sand text-slate-700 hover:bg-neutral-sand"
                  >
                    Camera uit
                  </Button>
                  <Button
                    onClick={startRecording}
                    className="btn-primary"
                  >
                    <PlayCircle className="h-4 w-4" /> Start opname
                  </Button>
                </>
              ) : (
                <Button
                  onClick={startRecording}
                  className="btn-primary"
                >
                  <PlayCircle className="h-4 w-4" /> Start opname
                </Button>
              )}
            </div>
          </div>
          
          {permissionError && (
            <div className="bg-orange/10 border border-orange/30 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-5 w-5 text-orange" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900 font-medium mb-1">Camera/Microfoon niet beschikbaar</p>
                  <p className="text-sm text-slate-700">{permissionError}</p>
                  {mode === "video" && permissionError.includes("Geen camera") && (
                    <button
                      onClick={() => {
                        setMode("audio");
                        setPermissionError(null);
                      }}
                      className="mt-3 text-sm font-medium text-orange hover:text-orange-dark underline"
                    >
                      → Schakel naar Audio-modus
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Chat Modal */}
      {chapterId && (
        <AIAssistantChat
          chapterId={chapterId as any}
          journeyId={journey?.id}
          isOpen={isAssistantChatOpen}
          onClose={() => setIsAssistantChatOpen(false)}
        />
      )}
    </div>
  );
}