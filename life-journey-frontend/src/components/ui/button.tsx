"use client";

import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

const baseStyles = "inline-flex items-center justify-center gap-2 rounded-full border border-transparent px-4 sm:px-5 py-2.5 sm:py-2 text-sm min-h-[44px] sm:min-h-0 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-warm-amber disabled:pointer-events-none disabled:opacity-60";

const variants = {
  primary:
    "bg-warm-amber text-slate-900 hover:bg-warm-amber/90 focus-visible:ring-offset-2 focus-visible:ring-slate-900",
  secondary:
    "bg-soft-blue text-slate-900 hover:bg-soft-blue/90 focus-visible:ring-offset-2 focus-visible:ring-slate-900",
  ghost:
    "bg-transparent border-neutral-sand text-label hover:bg-neutral-light",
  danger:
    "bg-coral text-slate-50 hover:bg-coral/90 focus-visible:ring-offset-2 focus-visible:ring-slate-900",
} as const;

type Variant = keyof typeof variants;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  asChild?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", asChild = false, type, ...props }, ref) => {
    const classes = cn(baseStyles, variants[variant], className);

    if (asChild) {
      return <Slot className={classes} {...props} />;
    }

    return <button className={classes} ref={ref} type={type ?? "button"} {...props} />;
  },
);

Button.displayName = "Button";