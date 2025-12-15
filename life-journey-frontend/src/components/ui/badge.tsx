"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variantClasses = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-success-green/10 text-success-green",
  warning: "bg-orange/10 text-orange",
  error: "bg-red-500/10 text-red-600",
  info: "bg-teal/10 text-teal",
  outline: "bg-transparent border border-slate-300 text-slate-600",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1 text-sm",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Dot badge for status indicators
interface DotBadgeProps {
  status: "online" | "offline" | "busy" | "away";
  className?: string;
}

const dotColorClasses = {
  online: "bg-success-green",
  offline: "bg-slate-400",
  busy: "bg-red-500",
  away: "bg-orange",
};

export function DotBadge({ status, className }: DotBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full",
        dotColorClasses[status],
        className
      )}
      aria-label={status}
    />
  );
}

// Counter badge for notifications
interface CounterBadgeProps {
  count: number;
  max?: number;
  className?: string;
}

export function CounterBadge({ count, max = 99, className }: CounterBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-medium rounded-full bg-coral text-white",
        className
      )}
      aria-label={`${count} notificaties`}
    >
      {displayCount}
    </span>
  );
}

export default Badge;
