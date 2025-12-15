"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "circular" | "rectangular";
  animation?: "pulse" | "shimmer" | "none";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "default",
  animation = "pulse",
  width,
  height,
}: SkeletonProps) {
  const variantClasses = {
    default: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    shimmer: "animate-shimmer bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]",
    none: "",
  };

  return (
    <div
      className={cn(
        "bg-slate-200",
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
      aria-hidden="true"
    />
  );
}

// Pre-built skeleton layouts
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full" // Last line shorter
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border border-slate-200 p-4", className)}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return <Skeleton variant="circular" className={sizeClasses[size]} />;
}

export function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-10 w-24 rounded-lg", className)} />;
}

export function SkeletonImage({ aspectRatio = "16/9", className }: { aspectRatio?: string; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-lg", className)} style={{ aspectRatio }}>
      <Skeleton className="h-full w-full" />
    </div>
  );
}

// Timeline skeleton
export function SkeletonTimeline({ items = 3, className }: { items?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton variant="circular" className="h-8 w-8 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Recording card skeleton
export function SkeletonRecordingCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 overflow-hidden", className)}>
      <SkeletonImage aspectRatio="16/9" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
