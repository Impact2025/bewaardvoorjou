"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Accordion Context
interface AccordionContextValue {
  openItems: string[];
  toggleItem: (value: string) => void;
  type: "single" | "multiple";
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordion() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
}

// Accordion Root
interface AccordionProps {
  children: ReactNode;
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  className?: string;
}

export function Accordion({
  children,
  type = "single",
  defaultValue,
  className,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(() => {
    if (!defaultValue) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  });

  const toggleItem = (value: string) => {
    setOpenItems((prev) => {
      const isOpen = prev.includes(value);

      if (type === "single") {
        return isOpen ? [] : [value];
      }

      return isOpen
        ? prev.filter((item) => item !== value)
        : [...prev, value];
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={cn("divide-y divide-slate-200", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// Accordion Item
interface AccordionItemProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  return (
    <div className={cn("py-2", className)} data-value={value}>
      {children}
    </div>
  );
}

// Accordion Trigger
interface AccordionTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function AccordionTrigger({
  value,
  children,
  className,
}: AccordionTriggerProps) {
  const { openItems, toggleItem } = useAccordion();
  const isOpen = openItems.includes(value);

  return (
    <button
      type="button"
      onClick={() => toggleItem(value)}
      className={cn(
        "flex w-full items-center justify-between py-2 text-left font-medium text-slate-900",
        "transition-colors hover:text-teal",
        "focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2",
        className
      )}
      aria-expanded={isOpen}
      aria-controls={`accordion-content-${value}`}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-5 w-5 text-slate-500 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
        aria-hidden="true"
      />
    </button>
  );
}

// Accordion Content
interface AccordionContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function AccordionContent({
  value,
  children,
  className,
}: AccordionContentProps) {
  const { openItems } = useAccordion();
  const isOpen = openItems.includes(value);

  return (
    <div
      id={`accordion-content-${value}`}
      role="region"
      className={cn(
        "overflow-hidden transition-all duration-200",
        isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
      )}
      aria-hidden={!isOpen}
    >
      <div className={cn("pb-4 pt-1 text-sm text-slate-600", className)}>
        {children}
      </div>
    </div>
  );
}

export default Accordion;
