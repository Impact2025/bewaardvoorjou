"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import {
  getTicket,
  replyToTicket,
  CATEGORY_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  type Ticket,
  type TicketMessage,
} from "@/lib/api/support";
import {
  ArrowLeft,
  Loader2,
  Send,
  User,
  Headphones,
} from "lucide-react";

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessageBubble({ message }: { message: TicketMessage }) {
  const isStaff = message.sender_type === "medewerker";
  return (
    <div className={`flex gap-3 ${isStaff ? "flex-row" : "flex-row-reverse"}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isStaff ? "bg-orange/10" : "bg-slate-100"
        }`}
      >
        {isStaff ? (
          <Headphones className="w-4 h-4 text-orange" />
        ) : (
          <User className="w-4 h-4 text-slate-500" />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isStaff ? "" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isStaff
              ? "bg-orange/5 border border-orange/10 text-slate-800 rounded-tl-sm"
              : "bg-slate-100 text-slate-800 rounded-tr-sm"
          }`}
        >
          {message.content}
        </div>
        <p className={`text-xs text-slate-400 mt-1 ${isStaff ? "text-left" : "text-right"}`}>
          {message.sender_name} &bull; {formatDateTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}

function TicketDetail({ ticketId }: { ticketId: string }) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadTicket() {
    try {
      const data = await getTicket(ticketId);
      setTicket(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !ticket) return;
    setSending(true);
    setError(null);
    try {
      const newMessage = await replyToTicket(ticket.id, replyText.trim());
      setTicket((prev) =>
        prev ? { ...prev, messages: [...prev.messages, newMessage] } : prev
      );
      setReplyText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kon je reactie niet versturen.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <AppShell title="Mijn vraag">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-orange" />
        </div>
      </AppShell>
    );
  }

  if (!ticket) {
    return (
      <AppShell title="Mijn vraag">
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p className="text-slate-500">Ticket niet gevonden.</p>
          <Link href="/dashboard/support" className="text-orange text-sm hover:underline mt-2 inline-block">
            Terug naar mijn vragen
          </Link>
        </div>
      </AppShell>
    );
  }

  const isClosed = ticket.status === "gesloten";

  return (
    <AppShell title="Mijn vraag">
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col min-h-[80vh]">
        {/* Terug + header */}
        <div className="mb-6">
          <Link
            href="/dashboard/support"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Mijn vragen
          </Link>

          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-slate-400">
                    BVJ-{String(ticket.ticket_number).padStart(4, "0")}
                  </span>
                  <span
                    className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[ticket.status]}`}
                  >
                    {STATUS_LABELS[ticket.status]}
                  </span>
                </div>
                <h1 className="font-serif font-bold text-slate-900 text-lg">{ticket.subject}</h1>
                <p className="text-xs text-slate-500 mt-1">
                  {CATEGORY_LABELS[ticket.category]}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Berichten */}
        <div className="flex-1 bg-white rounded-2xl border border-neutral-100 p-5 space-y-6 mb-4 overflow-y-auto">
          {ticket.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Antwoordbox */}
        {isClosed ? (
          <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-4 text-center text-sm text-slate-500">
            Dit ticket is gesloten. Heb je nog een vraag?{" "}
            <Link href="/dashboard/support" className="text-orange hover:underline">
              Stel een nieuwe vraag
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReply} className="bg-white rounded-2xl border border-neutral-100 p-4">
            {error && (
              <p className="text-sm text-red-600 mb-3">{error}</p>
            )}
            <div className="flex gap-3 items-end">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Typ je reactie..."
                rows={3}
                className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition resize-none"
              />
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                className="mb-0.5 w-11 h-11 rounded-full bg-orange hover:bg-orange/90 disabled:opacity-40 text-white flex items-center justify-center flex-shrink-0 transition-colors"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}

export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRoute>
      <TicketDetail ticketId={id} />
    </ProtectedRoute>
  );
}
