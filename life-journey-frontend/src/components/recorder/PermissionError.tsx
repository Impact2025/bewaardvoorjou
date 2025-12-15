"use client";

import { useRecorder } from "./RecorderContext";

export function PermissionError() {
  const { state, setMode, setPermissionError } = useRecorder();
  const { mode, permissionError } = state;

  if (!permissionError) return null;

  const showAudioFallback = mode === "video" && permissionError.includes("Geen camera");

  return (
    <div
      className="bg-orange/10 border border-orange/30 p-4 rounded-lg"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg
            className="h-5 w-5 text-orange"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-900 font-medium mb-1">
            Camera/Microfoon niet beschikbaar
          </p>
          <p className="text-sm text-slate-700">{permissionError}</p>
          {showAudioFallback && (
            <button
              onClick={() => {
                setMode("audio");
                setPermissionError(null);
              }}
              className="mt-3 text-sm font-medium text-orange hover:text-orange-dark underline focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2"
            >
              → Schakel naar Audio-modus
            </button>
          )}
        </div>
        <button
          onClick={() => setPermissionError(null)}
          className="flex-shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal"
          aria-label="Sluit melding"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default PermissionError;
