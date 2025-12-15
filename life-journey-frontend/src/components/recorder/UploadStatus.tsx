"use client";

import { cn } from "@/lib/utils";
import { useRecorder } from "./RecorderContext";

export function UploadStatus() {
  const { state } = useRecorder();
  const { uploadStatus } = state;

  if (!uploadStatus) return null;

  const isSuccess = uploadStatus.includes("geslaagd") || uploadStatus.includes("opgeslagen");
  const isError = uploadStatus.includes("mislukt") || uploadStatus.includes("Error");

  return (
    <span
      className={cn(
        "text-xs font-medium px-3 py-1.5 rounded-full",
        isSuccess && "bg-success-green/10 text-success-green",
        isError && "bg-red-500/10 text-red-600",
        !isSuccess && !isError && "bg-orange/10 text-orange"
      )}
      role="status"
      aria-live="polite"
    >
      {uploadStatus}
    </span>
  );
}

export default UploadStatus;
