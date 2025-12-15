"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play, Square, RotateCcw, Heart, Sparkles } from "lucide-react";
import { useConfetti } from "@/components/Confetti";

interface FirstMemoryStepProps {
  onNext: () => void;
}

export function FirstMemoryStep({ onNext }: FirstMemoryStepProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { triggerConfetti, ConfettiComponent } = useConfetti();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_RECORDING_TIME = 60; // 60 seconds

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Kon microfoon niet openen. Controleer je browser instellingen.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setHasRecording(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playRecording = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const resetRecording = () => {
    setHasRecording(false);
    setRecordingTime(0);
    setIsCompleted(false);
    if (audioRef.current) {
      audioRef.current.src = '';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    setIsCompleted(true);
    // Trigger emotional celebration
    triggerConfetti(4000, 100);

    // In a real app, you would upload the recording here
    setTimeout(() => {
      onNext();
    }, 2000);
  };

  return (
    <div className="relative">
      {/* Confetti celebration */}
      <ConfettiComponent />

      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <Mic className="h-8 w-8 text-green-600" />
      </div>

      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
        Je eerste herinnering
      </h2>
      <p className="text-slate-600 text-center mb-8 max-w-md mx-auto">
        Neem 60 seconden de tijd om je eerste herinnering te delen.
        Dit helpt ons je verhaal beter te begrijpen.
      </p>

      <div className="max-w-md mx-auto">
        {/* Recording Interface */}
        <div className="bg-slate-50 rounded-2xl p-6 mb-6">
          <div className="text-center mb-4">
            <div className="text-3xl font-mono font-bold text-slate-900 mb-2">
              {formatTime(recordingTime)}
            </div>
            <div className="text-sm text-slate-500">
              {isRecording ? 'Opnemen...' : hasRecording ? 'Opname klaar' : 'Max 60 seconden'}
            </div>
          </div>

          <div className="flex justify-center gap-3 mb-4">
            {!hasRecording ? (
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "danger" : "primary"}
                className="rounded-full w-16 h-16"
              >
                {isRecording ? (
                  <Square className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={playRecording}
                  variant="ghost"
                  className="rounded-full w-12 h-12"
                  disabled={isPlaying}
                >
                  <Play className="h-5 w-5" />
                </Button>
                <Button
                  onClick={resetRecording}
                  variant="ghost"
                  className="rounded-full w-12 h-12"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          {isRecording && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-red-600">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                Opnemen
              </div>
            </div>
          )}
        </div>

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            onClick={resetRecording}
            variant="ghost"
            className="flex-1"
            disabled={!hasRecording}
          >
            Opnieuw
          </Button>
          <Button
            onClick={handleComplete}
            disabled={!hasRecording || isCompleted}
            className="flex-1 bg-green-600 hover:bg-green-700 relative overflow-hidden"
          >
            {isCompleted ? (
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Geweldig! 🎉</span>
              </div>
            ) : (
              'Doorgaan'
            )}

            {/* Emotional heart burst */}
            {isCompleted && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="h-20 w-20 text-pink-400 animate-ping" />
              </div>
            )}
          </Button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-4">
          Je opname wordt alleen gebruikt om je verhaal te verbeteren
        </p>
      </div>
    </div>
  );
}