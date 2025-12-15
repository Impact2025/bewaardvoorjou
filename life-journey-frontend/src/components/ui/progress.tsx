"use client";

import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "error";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const sizeClasses = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

const variantClasses = {
  default: "bg-teal",
  success: "bg-success-green",
  warning: "bg-orange",
  error: "bg-red-500",
};

export function Progress({
  value,
  max = 100,
  size = "md",
  variant = "default",
  showLabel = false,
  label,
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="mb-1 flex items-center justify-between text-sm">
          {label && <span className="text-slate-600">{label}</span>}
          {showLabel && (
            <span className="text-slate-900 font-medium">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-slate-200",
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `${Math.round(percentage)}% voltooid`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Indeterminate progress (loading spinner alternative)
export function ProgressIndeterminate({
  size = "md",
  variant = "default",
  className,
}: Pick<ProgressProps, "size" | "variant" | "className">) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-slate-200",
        sizeClasses[size],
        className
      )}
      role="progressbar"
      aria-label="Laden..."
    >
      <div
        className={cn(
          "h-full w-1/3 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]",
          variantClasses[variant]
        )}
        style={{
          animation: "indeterminate 1.5s ease-in-out infinite",
        }}
      />
      <style jsx>{`
        @keyframes indeterminate {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }
      `}</style>
    </div>
  );
}

export default Progress;
