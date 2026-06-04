"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/store/auth-context";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  type Ticket,
  type TicketListItem,
  type TicketStatus,
  type TicketPriority,
  type TicketMessage,
} from "@/lib/api/support";
import {
  Headphones,
  Send,
  Loader2,
  User,
  ChevronRight,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  Lock,
  RefreshCw,
  StickyNote,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  laag: "bg-slate-100 text-slate-600",
  normaal: "bg-blue-50 text-blue-700",
  hoog: "bg-amber-100 text-amber-800",
  urgent: "bg-red-100 text-red-700",
};

const STATUS_ICONS: Record<TicketStatus, React.ElementType> = {
  open: AlertCircle,
  in_behandeling: Clock,
  opgelost: CheckCircle,
  gesloten: Lock,
};

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
  });
}

// ---------------------------------------------------------------------------
// Stats bar
// ---------------------------------------------------------------------------
function StatsBar({ tickets }: { tickets: TicketListItem[] }) {
  const counts = {
    open: tickets.filter((t) => t.status === "open").length,
    in_behandeling: tickets.filter((t) => t.status === "in_behandeling").length,
    opgelost: tickets.filter((t) => t.status === "opgelost").length,
    gesloten: tickets.filter((t) => t.status === "gesloten").length,
  };

  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {(Object.entries(counts) as [TicketStatus, number][]).map(([status, count]) => {
        const Icon = STATUS_ICONS[status];
        return (
          <div key={status} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${STATUS_COLORS[status]}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 leading-none">{count}</p>
              <p className="text-xs text-slate-400 mt-0.5">{STATUS_LABELS[status]}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ticket detail panel
// ---------------------------------------------------------------------------
function TicketPanel({
  ticket,
  onStatusChange,
  onClose,
  authToken,
}: {
  ticket: Ticket;
  onStatusChange: (t: Ticket) => void;
  onClose: () => void;
  authToken: string;
}) {
  const [reply, setReply] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [currentTicket, setCurrentTicket] = useState<Ticket>(ticket);
  const [changingStatus, setChangingStatus] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentTicket(ticket);
  }, [ticket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentTicket.messages]);

  async function handleReply() {
    if (!reply.trim()) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch(`${API}/admin/support/${currentTicket.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ content: reply.trim(), is_internal: isInternal }),
      });
      if (!res.ok) throw new Error("Kon reactie niet versturen");
      const msg: TicketMessage = await res.json();
      const updated = { ...currentTicket, messages: [...currentTicket.messages, msg] };
      if (!isInternal && currentTicket.status === "open") {
        updated.status = "in_behandeling";
      }
      setCurrentTicket(updated);
      onStatusChange(updated);
      setReply("");
    } catch {
      setSendError("Kon niet versturen. Probeer opnieuw.");
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(newStatus: TicketStatus) {
    setChangingStatus(true);
    try {
      const res = await fetch(`${API}/admin/support/${currentTicket.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      const updated: Ticket = await res.json();
      setCurrentTicket(updated);
      onStatusChange(updated);
    } finally {
      setChangingStatus(false);
    }
  }

  const submitterName = currentTicket.guest_name || "Lid";
  const submitterEmail = currentTicket.guest_email || "";

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-100">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-slate-400">
                BVJ-{String(currentTicket.ticket_number).padStart(4, "0")}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[currentTicket.status]}`}>
                {STATUS_LABELS[currentTicket.status]}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[currentTicket.priority]}`}>
                {currentTicket.priority}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 text-base leading-snug">{currentTicket.subject}</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors text-lg leading-none mt-0.5">
            ×
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {submitterName}
            {submitterEmail && <span className="text-slate-400">({submitterEmail})</span>}
          </span>
          <span>{CATEGORY_LABELS[currentTicket.category]}</span>
          <span>{formatDateTime(currentTicket.created_at)}</span>
        </div>

        {/* Status actions */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {(["open", "in_behandeling", "opgelost", "gesloten"] as TicketStatus[]).map((s) => (
            <button
              key={s}
              disabled={currentTicket.status === s || changingStatus}
              onClick={() => handleStatusChange(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-40 ${
                currentTicket.status === s
                  ? "border-orange bg-orange/10 text-orange font-medium"
                  : "border-slate-200 text-slate-600 hover:border-orange/50 hover:text-orange"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
          {changingStatus && <Loader2 className="w-4 h-4 animate-spin text-orange self-center" />}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {currentTicket.messages.map((msg) => {
          const isStaff = msg.sender_type === "medewerker";
          return (
            <div key={msg.id} className={`flex gap-3 ${isStaff ? "" : "flex-row-reverse"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isStaff
                  ? msg.is_internal ? "bg-amber-100" : "bg-orange/10"
                  : "bg-slate-100"
              }`}>
                {isStaff
                  ? msg.is_internal
                    ? <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                    : <Headphones className="w-3.5 h-3.5 text-orange" />
                  : <User className="w-3.5 h-3.5 text-slate-500" />
                }
              </div>
              <div className={`max-w-[80%] ${isStaff ? "" : ""}`}>
                <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.is_internal
                    ? "bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-sm"
                    : isStaff
                      ? "bg-orange/5 border border-orange/10 text-slate-800 rounded-tl-sm"
                      : "bg-slate-100 text-slate-800 rounded-tr-sm"
                }`}>
                  {msg.is_internal && (
                    <p className="text-xs font-semibold text-amber-700 mb-1">Interne notitie</p>
                  )}
                  {msg.content}
                </div>
                <p className={`text-xs text-slate-400 mt-1 ${isStaff ? "text-left" : "text-right"}`}>
                  {msg.sender_name} · {formatDateTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      <div className="p-4 border-t border-slate-100 flex-shrink-0">
        {sendError && <p className="text-xs text-red-600 mb-2">{sendError}</p>}

        {/* Internal toggle */}
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => setIsInternal(!isInternal)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
              isInternal
                ? "bg-amber-100 border-amber-300 text-amber-800 font-medium"
                : "border-slate-200 text-slate-500 hover:border-slate-300"
            }`}
          >
            <StickyNote className="w-3 h-3" />
            {isInternal ? "Interne notitie" : "Klant antwoord"}
          </button>
          <span className="text-xs text-slate-400">
            {isInternal ? "Niet zichtbaar voor klant" : "Klant ontvangt een e-mail notificatie"}
          </span>
        </div>

        <div className="flex gap-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleReply();
            }}
            placeholder={isInternal ? "Voeg een interne notitie toe..." : "Typ je antwoord aan de klant..."}
            rows={3}
            className={`flex-1 rounded-xl border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition resize-none ${
              isInternal ? "bg-amber-50 border-amber-200" : "bg-neutral-50 border-neutral-200"
            }`}
          />
          <button
            onClick={handleReply}
            disabled={sending || !reply.trim()}
            className="self-end w-10 h-10 rounded-full bg-orange hover:bg-orange/90 disabled:opacity-40 text-white flex items-center justify-center flex-shrink-0 transition-colors"
            title="Verstuur (Ctrl+Enter)"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1.5">Ctrl+Enter om te versturen</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function AdminSupportPage() {
  const { session } = useAuth();
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "alle">("alle");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const authToken = session?.token ?? "";

  async function loadTickets() {
    if (!authToken) return;
    setLoading(true);
    try {
      const url = statusFilter === "alle"
        ? `${API}/admin/support`
        : `${API}/admin/support?status=${statusFilter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${authToken}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTickets(data.tickets);
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(ticketId: string) {
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API}/admin/support/${ticketId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error();
      setSelectedTicket(await res.json());
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, [statusFilter, authToken]);

  function handleStatusChange(updated: Ticket) {
    setSelectedTicket(updated);
    setTickets((prev) =>
      prev.map((t) =>
        t.id === updated.id
          ? { ...t, status: updated.status, priority: updated.priority, updated_at: updated.updated_at }
          : t
      )
    );
  }

  const filtered = tickets;
  const openCount = tickets.filter((t) => t.status === "open").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Headphones className="w-6 h-6 text-orange" />
            Support Tickets
            {openCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {openCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{tickets.length} tickets in totaal</p>
        </div>
        <button
          onClick={loadTickets}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Vernieuwen
        </button>
      </div>

      <StatsBar tickets={tickets} />

      {/* Filter + list / detail split */}
      <div className={`grid gap-6 ${selectedTicket ? "lg:grid-cols-[380px_1fr]" : ""}`}>

        {/* Left: list */}
        <div className="space-y-3">
          {/* Status filter */}
          <div className="flex gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400 self-center" />
            {(["alle", "open", "in_behandeling", "opgelost", "gesloten"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  statusFilter === s
                    ? "bg-orange text-white border-orange"
                    : "border-slate-200 text-slate-600 hover:border-orange/50"
                }`}
              >
                {s === "alle" ? "Alle" : STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-orange" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Headphones className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Geen tickets gevonden</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((ticket) => {
                const StatusIcon = STATUS_ICONS[ticket.status];
                const isSelected = selectedTicket?.id === ticket.id;
                return (
                  <button
                    key={ticket.id}
                    onClick={() => loadDetail(ticket.id)}
                    className={`w-full text-left rounded-xl border p-4 transition-all ${
                      isSelected
                        ? "border-orange/40 bg-orange/5 shadow-sm"
                        : "border-slate-100 bg-white hover:border-orange/20 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-xs text-slate-400">
                            BVJ-{String(ticket.ticket_number).padStart(4, "0")}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[ticket.status]}`}>
                            {STATUS_LABELS[ticket.status]}
                          </span>
                          {ticket.priority !== "normaal" && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                              {ticket.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-slate-900 truncate">{ticket.subject}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {CATEGORY_LABELS[ticket.category]} · {formatDate(ticket.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusIcon className={`w-4 h-4 ${
                          ticket.status === "open" ? "text-blue-500" :
                          ticket.status === "in_behandeling" ? "text-amber-500" :
                          ticket.status === "opgelost" ? "text-green-500" : "text-slate-400"
                        }`} />
                        {loadingDetail && isSelected
                          ? <Loader2 className="w-4 h-4 animate-spin text-orange" />
                          : <ChevronRight className="w-4 h-4 text-slate-300" />
                        }
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: detail panel */}
        {selectedTicket && (
          <div className="rounded-xl border border-slate-100 overflow-hidden" style={{ height: "70vh" }}>
            <TicketPanel
              ticket={selectedTicket}
              onStatusChange={handleStatusChange}
              onClose={() => setSelectedTicket(null)}
              authToken={authToken}
            />
          </div>
        )}
      </div>
    </div>
  );
}
