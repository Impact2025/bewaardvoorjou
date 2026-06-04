"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { searchFaq, type FaqItem } from "@/lib/faq-data";
import { Lightbulb, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface FaqPrescreenProps {
  query: string;
  onDismiss?: () => void;
}

function FaqResult({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-orange/20 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-orange/5 transition-colors"
      >
        <span className="text-sm font-medium text-slate-800 leading-snug">{item.question}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-orange flex-shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="w-4 h-4 text-orange flex-shrink-0 mt-0.5" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0">
          <p className="text-sm text-slate-600 leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  );
}

export function FaqPrescreen({ query, onDismiss }: FaqPrescreenProps) {
  const [results, setResults] = useState<FaqItem[]>([]);

  useEffect(() => {
    const found = searchFaq(query);
    setResults(found);
  }, [query]);

  if (results.length === 0) return null;

  return (
    <div className="rounded-2xl bg-orange/5 border border-orange/15 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-orange flex-shrink-0" />
          <p className="text-sm font-semibold text-slate-800">
            Misschien helpt dit al?
          </p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Verbergen
          </button>
        )}
      </div>

      <div className="space-y-2">
        {results.map((item) => (
          <FaqResult key={item.id} item={item} />
        ))}
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-slate-400">
          Staat je vraag er niet bij?
        </p>
        <Link
          href="/faq"
          target="_blank"
          className="inline-flex items-center gap-1 text-xs text-orange hover:underline font-medium"
        >
          Bekijk alle FAQ
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
