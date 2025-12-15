"use client";

import { useRecorder } from "./RecorderContext";

interface RecorderTimerProps {
  className?: string;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function RecorderTimer({ className }: RecorderTimerProps) {
  const { state } = useRecorder();
  const { recordingTime } = state;

  return (
    <span className={className} aria-live="polite" aria-atomic="true">
      Verstreken: {formatTime(recordingTime)}
    </span>
  );
}

export default RecorderTimer;
