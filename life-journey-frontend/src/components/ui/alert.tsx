"use client";

import { ReactNode } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "success" | "error" | "warning" | "info";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: ReactNode;
  className?: string;
}

const variantClasses = {
  success: "bg-success-green/10 border-success-green/30 text-success-green",
  error: "bg-red-500/10 border-red-500/30 text-red-600",
  warning: "bg-orange/10 border-orange/30 text-orange",
  info: "bg-teal/10 border-teal/30 text-teal",
};

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export function Alert({
  variant = "info",
  title,
  children,
  dismissible = false,
  onDismiss,
  icon,
  className,
}: AlertProps) {
  const Icon = icon ? null : iconMap[variant];

  return (
    <div
      className={cn(
        "relative flex gap-3 rounded-lg border p-4",
        variantClasses[variant],
        className
      )}
      role="alert"
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {icon || (Icon && <Icon className="h-5 w-5" aria-hidden="true" />)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="font-medium text-slate-900 mb-1">{title}</h3>
        )}
        <div className="text-sm text-slate-700">{children}</div>
      </div>

      {/* Dismiss button */}
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 rounded p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal"
          aria-label="Sluit melding"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Inline alert for form validation
interface InlineAlertProps {
  variant?: "error" | "warning";
  children: ReactNode;
  className?: string;
}

export function InlineAlert({
  variant = "error",
  children,
  className,
}: InlineAlertProps) {
  const Icon = variant === "error" ? AlertCircle : AlertTriangle;

  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-sm",
        variant === "error" ? "text-red-600" : "text-orange",
        className
      )}
      role="alert"
    >
      <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

export default Alert;
