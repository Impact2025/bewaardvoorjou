"use client";

import { useRecorder } from "./RecorderContext";
import { formatTime } from "./RecorderTimer";

export function StatusIndicator() {
  const { state } = useRecorder();
  const { mode, state: recordingState, textContent, wordCount, recordingTime, mediaBlob } = state;

  const isRecording = recordingState === "recording";

  // Determine status text
  let statusText: string;
  if (mode === "text") {
    statusText = textContent.trim()
      ? `${wordCount} ${wordCount === 1 ? 'woord' : 'woorden'} geschreven`
      : "Klaar om te schrijven";
  } else if (isRecording) {
    statusText = `Opname bezig (${formatTime(recordingTime)})`;
  } else if (mediaBlob) {
    statusText = "Opname voltooid";
  } else {
    statusText = "Klaar om te starten";
  }

  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      {isRecording && mode !== "text" && (
        <span
          className="h-3 w-3 animate-pulse rounded-full bg-coral"
          aria-hidden="true"
        />
      )}
      <span role="status" aria-live="polite">
        {statusText}
      </span>
    </div>
  );
}

export default StatusIndicator;
