"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  HelpCircle,
  X,
  Send,
  ChevronDown,
  ArrowRight,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { sendHelpdeskMessage, type HelpdeskMessage, type HelpdeskActionLink } from "@/lib/api/helpdesk";
import { createTicket, type TicketCategory } from "@/lib/api/support";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  actionLinks?: HelpdeskActionLink[];
  suggestedQuestions?: string[];
  escalate?: boolean;
}

// ─── Routes with mobile bottom nav ───────────────────────────────────────────

const APP_ROUTE_PREFIXES = [
  "/dashboard", "/chapters", "/timeline", "/family",
  "/recordings", "/memos", "/vertel", "/record", "/overview",
  "/settings", "/instellingen", "/legacy",
];

function hasBottomNav(pathname: string) {
  return APP_ROUTE_PREFIXES.some((p) => pathname.startsWith(p));
}

// ─── Opening suggestions ──────────────────────────────────────────────────────

const OPENING_SUGGESTIONS = [
  "Hoe start ik een opname?",
  "Mijn microfoon werkt niet",
  "Hoe zeg ik mijn abonnement op?",
  "Kan ik mijn data exporteren?",
];

// ─── Inline escalation form ───────────────────────────────────────────────────

function EscalationForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await createTicket({
        guest_name: name,
        guest_email: email,
        category: "overig" as TicketCategory,
        subject: message.slice(0, 80),
        message,
      });
      setSent(true);
    } catch {
      setError("Versturen mislukt. Probeer het opnieuw.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-2 py-5 px-4 text-center">
        <CheckCircle className="w-9 h-9 text-green-500" />
        <p className="font-semibold text-sm text-neutral-800">Ontvangen!</p>
        <p className="text-xs text-neutral-500">We antwoorden binnen 24 uur.</p>
        <button onClick={onClose} className="mt-1 text-xs text-orange hover:underline">
          Sluiten
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-2.5">
      <p className="text-xs text-neutral-500 pt-1">
        Ons team reageert binnen 24 uur op werkdagen.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Naam"
          className="text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
        />
      </div>
      <textarea
        required
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Beschrijf je vraag of probleem..."
        className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange resize-none"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 text-sm text-neutral-500 border border-neutral-200 rounded-lg py-2 hover:bg-neutral-50 transition-colors"
        >
          Annuleren
        </button>
        <button
          type="submit"
          disabled={sending}
          className="flex-1 text-sm font-medium bg-orange text-white rounded-lg py-2 hover:bg-orange/90 disabled:opacity-60 flex items-center justify-center gap-1.5 transition-colors"
        >
          {sending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Versturen
        </button>
      </div>
    </form>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
        <HelpCircle className="w-4 h-4 text-orange" />
      </div>
      <div className="bg-neutral-100 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function EscalationCard({ onOpenForm }: { onOpenForm: () => void }) {
  return (
    <div className="flex items-start gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-orange/10 flex items-center justify-center shrink-0 mt-0.5">
        <HelpCircle className="w-4 h-4 text-orange" />
      </div>
      <div className="max-w-[85%] space-y-2">
        <div className="bg-neutral-100 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-neutral-800 leading-relaxed">
          Hiervoor zet ik je door naar ons team. Vul het formulier in en we antwoorden binnen 24 uur.
        </div>
        <button
          onClick={onOpenForm}
          className="flex items-center gap-2 text-sm font-medium text-white bg-orange hover:bg-orange/90 rounded-xl px-4 py-2.5 transition-colors"
        >
          Stel je vraag aan ons team
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function MessageBubble({
  msg,
  onSuggestionClick,
  onOpenForm,
}: {
  msg: ChatMessage;
  onSuggestionClick: (q: string) => void;
  onOpenForm: () => void;
}) {
  if (msg.role === "system") {
    return (
      <div className="flex justify-center mb-3">
        <span className="text-xs text-neutral-400 bg-neutral-50 px-3 py-1 rounded-full">
          {msg.content}
        </span>
      </div>
    );
  }

  if (msg.role === "user") {
    return (
      <div className="flex justify-end mb-3">
        <div className="bg-orange text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%] text-sm leading-relaxed">
          {msg.content}
        </div>
      </div>
    );
  }

  if (msg.escalate) {
    return <EscalationCard onOpenForm={onOpenForm} />;
  }

  return (
    <div className="flex items-start gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-orange/10 flex items-center justify-center shrink-0 mt-0.5">
        <HelpCircle className="w-4 h-4 text-orange" />
      </div>
      <div className="max-w-[85%] space-y-2">
        <div className="bg-neutral-100 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-neutral-800 leading-relaxed">
          {msg.content}
        </div>

        {msg.actionLinks && msg.actionLinks.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {msg.actionLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-orange border border-orange/30 bg-orange/5 hover:bg-orange/10 rounded-lg px-3 py-1.5 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {msg.suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => onSuggestionClick(q)}
                className="text-left text-xs text-neutral-600 hover:text-orange bg-white border border-neutral-200 hover:border-orange/30 rounded-lg px-3 py-2 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Widget ───────────────────────────────────────────────────────────────

export function HelpdeskWidget() {
  const pathname = usePathname();
  const withBottomNav = hasBottomNav(pathname);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hoi! Hoe kan ik je helpen? Stel gerust je vraag.",
      suggestedQuestions: OPENING_SUGGESTIONS,
    },
  ]);
  const [apiHistory, setApiHistory] = useState<HelpdeskMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      if (!showForm) setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages, showForm]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text.trim(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);
      setShowForm(false);

      const newHistory: HelpdeskMessage[] = [
        ...apiHistory,
        { role: "user", content: text.trim() },
      ];

      try {
        const res = await sendHelpdeskMessage(text.trim(), apiHistory);

        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: res.message,
          actionLinks: res.escalate ? [] : res.action_links,
          suggestedQuestions: res.escalate ? [] : res.suggested_questions,
          escalate: res.escalate,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setApiHistory([
          ...newHistory,
          { role: "assistant", content: res.message },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: "assistant",
            content: "Er ging iets mis. Probeer het opnieuw.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, apiHistory]
  );

  return (
    <div
      className={`fixed right-4 z-40 flex flex-col items-end gap-3 sm:bottom-8 sm:right-6 ${
        withBottomNav ? "bottom-24" : "bottom-8"
      }`}
    >
      {open && (
        <div className="w-[320px] sm:w-[360px] bg-white rounded-2xl shadow-2xl border border-neutral-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200 max-h-[540px]">
          {/* Header */}
          <div className="bg-orange px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">Helpdesk</p>
                <p className="text-xs text-white/70 leading-tight">BewaardVoorJou.nl</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <ChevronDown className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Messages */}
          {!showForm && (
            <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  onSuggestionClick={sendMessage}
                  onOpenForm={() => setShowForm(true)}
                />
              ))}
              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Inline escalation form */}
          {showForm && (
            <div className="flex-1 overflow-y-auto min-h-0 pt-2">
              <EscalationForm onClose={() => setShowForm(false)} />
            </div>
          )}

          {/* Input — verborgen wanneer formulier open is */}
          {!showForm && (
            <div className="border-t border-neutral-100 px-3 py-2.5 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Stel je vraag..."
                  disabled={loading}
                  className="flex-1 text-sm border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange disabled:opacity-50 bg-neutral-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-xl bg-orange hover:bg-orange/90 text-white flex items-center justify-center transition-colors disabled:opacity-40 shrink-0"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Helpdesk sluiten" : "Helpdesk openen"}
        className="w-14 h-14 rounded-full bg-orange hover:bg-orange/90 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
      >
        {open ? <X className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
