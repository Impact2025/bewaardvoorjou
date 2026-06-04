"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, X, MessageSquarePlus, BookOpen, Phone } from "lucide-react";

export function HelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 sm:bottom-8 sm:right-6 z-40 flex flex-col items-end gap-3">
      {/* Pop-up menu */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setOpen(false)}
          />
          <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-1 min-w-[220px] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-2">
              Hulp nodig?
            </p>

            <Link
              href="/dashboard/support"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-orange/5 hover:text-orange rounded-xl transition-colors"
            >
              <MessageSquarePlus className="w-4 h-4 text-orange" />
              <span>Stel een vraag</span>
            </Link>

            <Link
              href="/faq"
              target="_blank"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-orange/5 hover:text-orange rounded-xl transition-colors"
            >
              <BookOpen className="w-4 h-4 text-orange" />
              <span>Bekijk de FAQ</span>
            </Link>

            <a
              href="mailto:info@bewaardvoorjou.nl"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-orange/5 hover:text-orange rounded-xl transition-colors"
            >
              <Phone className="w-4 h-4 text-orange" />
              <span>E-mail ons direct</span>
            </a>
          </div>
        </>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Hulp"
        className="w-14 h-14 rounded-full bg-orange hover:bg-orange/90 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <HelpCircle className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
