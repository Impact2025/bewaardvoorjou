"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
  xl: "h-16 w-16 text-xl",
};

const iconSizeClasses = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
};

function getInitials(name?: string): string {
  if (!name) return "";

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getColorFromName(name?: string): string {
  if (!name) return "bg-slate-200";

  const colors = [
    "bg-teal",
    "bg-orange",
    "bg-coral",
    "bg-gold",
    "bg-success-green",
    "bg-slate-600",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  className,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  // Show image if available and not errored
  if (src && !imageError) {
    return (
      <div
        className={cn(
          "relative inline-flex shrink-0 overflow-hidden rounded-full",
          sizeClasses[size],
          className
        )}
      >
        <img
          src={src}
          alt={alt || name || "Avatar"}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Show initials if name is available
  if (initials) {
    return (
      <div
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white",
          sizeClasses[size],
          bgColor,
          className
        )}
        aria-label={name}
      >
        {initials}
      </div>
    );
  }

  // Fallback to user icon
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600",
        sizeClasses[size],
        className
      )}
      aria-label="Gebruiker"
    >
      <User className={iconSizeClasses[size]} aria-hidden="true" />
    </div>
  );
}

// Avatar group for displaying multiple avatars
interface AvatarGroupProps {
  avatars: Array<{ src?: string; name?: string }>;
  max?: number;
  size?: AvatarProps["size"];
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = "sm",
  className,
}: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-medium ring-2 ring-white",
            sizeClasses[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

export default Avatar;
