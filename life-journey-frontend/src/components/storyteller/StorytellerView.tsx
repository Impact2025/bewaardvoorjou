"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { NextQuestion } from "@/lib/storyteller-client";
import { submitTextAnswer, getUploadUrl, uploadAudioBlob } from "@/lib/storyteller-client";

type StorytellerState = "question" | "recording" | "typing" | "saving" | "saved" | "error";

interface StorytellerViewProps {
  question: NextQuestion;
  journeyId: string;
  token: string;
  familyMemberName?: string;
  onNext: () => void;
  onClose?: () => void;
}

export function StorytellerView({
  question,
  journeyId,
  token,
  familyMemberName,
  onNext,
  onClose,
}: StorytellerViewProps) {
  const [state, setState] = useState<StorytellerState>("question");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [textValue, setTextValue] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (state === "question") {
      setTimeout(() => startBtnRef.current?.focus(), 100);
    }
  }, [state]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.start(1000);
      mediaRecorderRef.current = recorder;

      setElapsedSeconds(0);
      setState("recording");
      timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    } catch {
      setErrorMsg("Kan geen toegang krijgen tot de microfoon. Controleer je browserinstellingen.");
      setState("error");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.onstop = async () => {
      setState("saving");
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      try {
        const ext = recorder.mimeType.includes("webm") ? "webm" : "ogg";
        const filename = `${question.chapterId}_${Date.now()}.${ext}`;
        const { uploadUrl, uploadMethod, fields } = await getUploadUrl(
          journeyId,
          question.chapterId,
          filename,
          recorder.mimeType,
          token,
          blob.size,
        );
        await uploadAudioBlob(uploadUrl, blob, recorder.mimeType, uploadMethod, fields);
        setState("saved");
      } catch {
        setErrorMsg("Er ging iets mis bij het opslaan. Probeer het opnieuw.");
        setState("error");
      }
      recorder.stream.getTracks().forEach((t) => t.stop());
    };
    recorder.stop();
  }, [journeyId, question.chapterId, token]);

  const submitText = useCallback(async () => {
    if (!textValue.trim()) return;
    setState("saving");
    try {
      await submitTextAnswer(journeyId, question.chapterId, textValue.trim(), token);
      setState("saved");
    } catch {
      setErrorMsg("Er ging iets mis bij het opslaan. Probeer het opnieuw.");
      setState("error");
    }
  }, [journeyId, question.chapterId, textValue, token]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div
      data-storyteller-mode="true"
      className="flex flex-col items-center justify-center min-h-screen px-6 py-10"
      style={{ background: "#FAF7F2" }}
    >
      {/* Question state */}
      {state === "question" && (
        <div className="w-full max-w-lg text-center">
          <p className="text-2xl mb-2" style={{ color: "#F97316", fontWeight: 600 }}>
            Dag{familyMemberName ? ` ${familyMemberName}` : ""}! ☀️
          </p>
          <p className="text-sm mb-8" style={{ color: "#6B6456" }}>
            {question.chapterTitle}
          </p>

          <div
            className="rounded-2xl p-8 mb-10 text-left"
            style={{ background: "#FFF7ED", borderLeft: "4px solid #F97316" }}
          >
            <p className="font-serif leading-relaxed" style={{ fontSize: "22px", color: "#2C2416" }}>
              {question.question}
            </p>
          </div>

          <button
            ref={startBtnRef}
            onClick={startRecording}
            className="w-full rounded-2xl font-semibold text-white transition-opacity active:opacity-80 mb-4"
            style={{
              background: "#F97316",
              fontSize: "22px",
              padding: "22px 32px",
              minHeight: "80px",
            }}
          >
            🎤 Begin met vertellen
          </button>

          <button
            onClick={() => setState("typing")}
            className="text-base underline-offset-2 hover:underline transition-colors"
            style={{ color: "#6B6456", fontSize: "18px" }}
          >
            Liever typen? Klik hier
          </button>
        </div>
      )}

      {/* Recording state */}
      {state === "recording" && (
        <div className="w-full max-w-lg text-center">
          <p className="mb-2 text-sm" style={{ color: "#6B6456" }}>
            {question.chapterTitle}
          </p>
          <p className="font-serif mb-10" style={{ fontSize: "20px", color: "#4A4239" }}>
            {question.question}
          </p>

          <div className="flex justify-center mb-6">
            <div
              className="rounded-full flex items-center justify-center animate-pulse"
              style={{ width: "120px", height: "120px", background: "#FEE2E2" }}
            >
              <div
                className="rounded-full"
                style={{ width: "72px", height: "72px", background: "#EF4444" }}
              />
            </div>
          </div>

          <p className="text-4xl font-mono font-bold mb-10" style={{ color: "#2C2416" }}>
            {formatTime(elapsedSeconds)}
          </p>

          <button
            onClick={stopRecording}
            className="w-full rounded-2xl font-semibold text-white transition-opacity active:opacity-80"
            style={{
              background: "#2C2416",
              fontSize: "22px",
              padding: "22px 32px",
              minHeight: "80px",
            }}
          >
            ⏹ Klaar
          </button>
        </div>
      )}

      {/* Typing state */}
      {state === "typing" && (
        <div className="w-full max-w-lg">
          <div
            className="rounded-2xl p-6 mb-6"
            style={{ background: "#FFF7ED", borderLeft: "4px solid #F97316" }}
          >
            <p className="font-serif" style={{ fontSize: "20px", color: "#2C2416" }}>
              {question.question}
            </p>
          </div>

          <textarea
            autoFocus
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder="Schrijf hier je antwoord…"
            className="w-full rounded-2xl p-6 outline-none resize-none border-2 mb-6"
            style={{
              fontSize: "20px",
              lineHeight: "1.7",
              minHeight: "220px",
              color: "#2C2416",
              borderColor: "#E9E4DB",
              background: "#FFFFFF",
            }}
          />

          <button
            onClick={submitText}
            disabled={!textValue.trim()}
            className="w-full rounded-2xl font-semibold text-white transition-opacity mb-4 disabled:opacity-40"
            style={{
              background: "#F97316",
              fontSize: "20px",
              padding: "20px 32px",
              minHeight: "72px",
            }}
          >
            Bewaren
          </button>
          <button
            onClick={() => setState("question")}
            className="w-full text-base underline-offset-2 hover:underline"
            style={{ color: "#6B6456", fontSize: "18px" }}
          >
            Terug — liever inspreken
          </button>
        </div>
      )}

      {/* Saving state */}
      {state === "saving" && (
        <div className="w-full max-w-lg text-center">
          <div className="text-7xl mb-8 animate-spin" style={{ display: "inline-block" }}>💾</div>
          <p className="font-serif text-2xl" style={{ color: "#2C2416" }}>
            Bezig met opslaan…
          </p>
        </div>
      )}

      {/* Saved state */}
      {state === "saved" && (
        <div className="w-full max-w-lg text-center">
          <div className="text-7xl mb-6">✅</div>
          <h2 className="font-serif text-3xl font-semibold mb-4" style={{ color: "#2C2416" }}>
            Bewaard!
          </h2>
          <p className="text-xl mb-2" style={{ color: "#4A4239" }}>
            Je verhaal is veilig opgeslagen.
          </p>
          {familyMemberName && (
            <p className="text-base mb-10" style={{ color: "#6B6456" }}>
              {familyMemberName} kan het nu beluisteren. 🤗
            </p>
          )}
          {!familyMemberName && <div className="mb-10" />}

          <button
            onClick={onNext}
            className="w-full rounded-2xl font-semibold text-white transition-opacity active:opacity-80 mb-4"
            style={{
              background: "#F97316",
              fontSize: "20px",
              padding: "20px 32px",
              minHeight: "72px",
            }}
          >
            Volgende vraag
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-full text-base"
              style={{ color: "#6B6456", fontSize: "18px" }}
            >
              Stoppen voor nu
            </button>
          )}
        </div>
      )}

      {/* Error state */}
      {state === "error" && (
        <div className="w-full max-w-lg text-center">
          <div className="text-7xl mb-6">😕</div>
          <h2 className="font-serif text-2xl font-semibold mb-4" style={{ color: "#2C2416" }}>
            Oops, er ging iets mis
          </h2>
          <p className="text-lg mb-8" style={{ color: "#4A4239" }}>
            {errorMsg}
          </p>
          <button
            onClick={() => { setErrorMsg(null); setState("question"); }}
            className="w-full rounded-2xl font-semibold text-white"
            style={{
              background: "#F97316",
              fontSize: "20px",
              padding: "20px 32px",
              minHeight: "72px",
            }}
          >
            Probeer opnieuw
          </button>
        </div>
      )}
    </div>
  );
}
