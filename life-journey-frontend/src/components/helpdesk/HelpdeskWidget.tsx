"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  HelpCircle,
  X,
  Send,
  ChevronDown,
  AlertCircle,
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
  isEscalation?: boolean;
}

interface EscalationFormData {
  name: string;
  email: string;
  message: string;
}

// ─── Suggested opening questions ──────────────────────────────────────────────

const OPENING_SUGGESTIONS = [
  "Hoe start ik een opname?",
  "Mijn microfoon werkt niet",
  "Hoe zeg ik mijn abonnement op?",
  "Kan ik mijn data exporteren?",
];

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

function AssistantAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-orange/10 flex items-center justify-center shrink-0 mt-0.5">
      <HelpCircle className="w-4 h-4 text-orange" />
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center mb-3">
        <span className="text-xs text-neutral-400 bg-neutral-50 px-3 py-1 rounded-full">
          {msg.content}
        </span>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="flex justify-end mb-3">
        <div className="bg-orange text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%] text-sm leading-relaxed">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 mb-3">
      <AssistantAvatar />
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
                data-suggestion={q}
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

function EscalationForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: EscalationFormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<EscalationFormData>({
    name: "",
    email: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      await onSubmit(form);
      setSent(true);
    } catch {
      setError("Kon je bericht niet versturen. Probeer het opnieuw.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 px-4 text-center">
        <CheckCircle className="w-10 h-10 text-green-500" />
        <div>
          <p className="font-semibold text-neutral-800">Ontvangen!</p>
          <p className="text-sm text-neutral-500 mt-1">
            We antwoorden binnen 24 uur op jouw bericht.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-sm text-orange hover:underline mt-2"
        >
          Sluiten
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-4 pb-4">
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          Ons team neemt je vraag over. We antwoorden binnen 24 uur.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Naam</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Jouw naam"
            className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">E-mail</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="jouw@email.nl"
            className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">Jouw vraag of probleem</label>
        <textarea
          required
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Beschrijf wat er is..."
          rows={3}
          className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 text-sm text-neutral-500 border border-neutral-200 rounded-lg py-2 hover:bg-neutral-50 transition-colors"
        >
          Annuleren
        </button>
        <button
          type="submit"
          disabled={sending}
          className="flex-1 text-sm font-medium bg-orange text-white rounded-lg py-2 hover:bg-orange/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {sending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Versturen
        </button>
      </div>
    </form>
  );
}

// ─── Main Widget ───────────────────────────────────────────────────────────────

export function HelpdeskWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEscalationForm, setShowEscalationForm] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hoi! Hoe kan ik je helpen? Stel gerust je vraag — ik snap ook als je spelfouten maakt of iets anders omschrijft.",
      suggestedQuestions: OPENING_SUGGESTIONS,
    },
  ]);

  const [apiHistory, setApiHistory] = useState<HelpdeskMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  const lastMessage = messages[messages.length - 1];
  const hasEscalated = lastMessage?.isEscalation;

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
      setShowEscalationForm(false);

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
          actionLinks: res.action_links,
          suggestedQuestions: res.escalate ? [] : res.suggested_questions,
          isEscalation: res.escalate,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setApiHistory([
          ...newHistory,
          { role: "assistant", content: res.message },
        ]);

        if (res.escalate) {
          setShowEscalationForm(true);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: "assistant",
            content: "Er ging iets mis. Probeer je bericht opnieuw te sturen.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, apiHistory]
  );

  function handleSuggestionClick(e: React.MouseEvent<HTMLDivElement>) {
    const btn = (e.target as HTMLElement).closest("[data-suggestion]") as HTMLButtonElement | null;
    if (btn) {
      sendMessage(btn.dataset.suggestion!);
    }
  }

  async function handleEscalationSubmit(data: EscalationFormData) {
    const conversationSummary = apiHistory
      .map((m) => `${m.role === "user" ? "Gebruiker" : "Assistent"}: ${m.content}`)
      .join("\n");

    const fullMessage = data.message + (conversationSummary ? `\n\n---\nGesprekshistorie:\n${conversationSummary}` : "");

    await createTicket({
      guest_name: data.name,
      guest_email: data.email,
      category: "overig" as TicketCategory,
      subject: apiHistory[0]?.content?.slice(0, 80) || "Vraag via helpdesk",
      message: fullMessage,
    });
  }

  return (
    <div className="fixed bottom-24 right-4 sm:bottom-8 sm:right-6 z-40 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div className="w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-neutral-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200 max-h-[580px]">
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
          <div
            className="flex-1 overflow-y-auto px-3 py-3 space-y-0 min-h-0"
            onClick={handleSuggestionClick}
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Escalation form */}
          {showEscalationForm && !loading && (
            <div className="border-t border-neutral-100">
              <EscalationForm
                onSubmit={handleEscalationSubmit}
                onCancel={() => setShowEscalationForm(false)}
              />
            </div>
          )}

          {/* Input */}
          {!showEscalationForm && (
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
                  placeholder={hasEscalated ? "Of stel een andere vraag..." : "Stel je vraag..."}
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

      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Helpdesk sluiten" : "Helpdesk openen"}
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
