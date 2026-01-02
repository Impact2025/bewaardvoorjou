"use client";

/**
 * QuickThoughtFAB - Floating Action Button voor snelle gedachten
 *
 * Een pulserende knop die altijd zichtbaar is en de QuickThoughtRecorder
 * opent in een modal.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickThoughtRecorder } from "./QuickThoughtRecorder";
import { cn } from "@/lib/utils";

interface QuickThoughtFABProps {
  chapterId?: string;
  className?: string;
  onThoughtCreated?: (thoughtId: string) => void;
}

export function QuickThoughtFAB({
  chapterId,
  className,
  onThoughtCreated,
}: QuickThoughtFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleComplete = (thoughtId: string) => {
    onThoughtCreated?.(thoughtId);
    setIsOpen(false);
  };

  return (
    <>
      {/* FAB Button */}
      <motion.div
        className={cn(
          "fixed bottom-6 right-6 z-40",
          className
        )}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className={cn(
              "rounded-full w-14 h-14 shadow-lg p-0",
              "bg-gradient-to-br from-amber-500 to-orange-600",
              "hover:from-amber-600 hover:to-orange-700",
              "border-0"
            )}
          >
            <Lightbulb className="w-6 h-6 text-white" />
          </Button>
        </motion.div>

        {/* Pulse animation */}
        <motion.div
          className="absolute inset-0 rounded-full bg-amber-400 -z-10"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 0, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Recorder Modal */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn(
                "fixed z-50",
                "bottom-6 right-6 left-6",
                "md:left-auto md:w-[420px]"
              )}
            >
              <QuickThoughtRecorder
                chapterId={chapterId}
                onComplete={handleComplete}
                onCancel={() => setIsOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
