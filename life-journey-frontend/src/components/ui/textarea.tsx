"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";

const baseStyles = "flex min-h-[80px] w-full rounded-md border border-neutral-sand bg-cream px-3 py-2 text-sm ring-offset-cream placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(baseStyles, className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
