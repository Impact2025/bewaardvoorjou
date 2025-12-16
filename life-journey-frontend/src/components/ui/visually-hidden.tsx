"use client";

import React, { ReactNode } from "react";

interface VisuallyHiddenProps {
  children: ReactNode;
  as?: React.ElementType;
}

/**
 * Visually hides content while keeping it accessible to screen readers.
 * Use for:
 * - Icon-only buttons that need labels
 * - Skip links
 * - Form instructions
 * - Status messages for screen readers
 */
export function VisuallyHidden({ children, as: Component = "span" }: VisuallyHiddenProps) {
  return (
    <Component
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {children}
    </Component>
  );
}

/**
 * Live region for announcing dynamic content to screen readers.
 * Use for:
 * - Form validation messages
 * - Loading states
 * - Success/error notifications
 * - Content updates
 */
interface LiveRegionProps {
  children: ReactNode;
  politeness?: "polite" | "assertive";
  atomic?: boolean;
}

export function LiveRegion({
  children,
  politeness = "polite",
  atomic = true,
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
}

export default VisuallyHidden;
