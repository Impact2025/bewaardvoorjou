"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import {
  getMyTickets,
  createTicket,
  CATEGORY_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  type TicketCategory,
  type TicketListItem,
} from "@/lib/api/support";
import { FaqPrescreen } from "@/components/support/FaqPrescreen";
import {
  MessageSquarePlus,
  Inbox,
  ChevronRight,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";

const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: "account", label: "Mijn account" },
  { value: "technisch", label: "Technisch probleem" },
  { value: "privacy", label: "Privacy & gegevens" },
  { value: "abonnement", label: "Abonnement & betaling" },
  { value: "overig", label: "Overig" },
];

function NewTicketModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [category, setCategory] = useState<TicketCategory>("overig");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [prescreenDismissed, setPrescreenDismissed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createTicket({
        category,
        subject: `${CATEGORY_LABELS[category]} — vraag van lid`,
        message,
      });
      setSuccess(true);
      setTimeout(() => {
        onCreated();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kon je vraag niet versturen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <h2 className="text-lg font-serif font-bold text-slate-900">Stel een nieuwe vraag</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <p className="font-semibold text-slate-900 mb-1">Je vraag is verstuurd!</p>
            <p className="text-sm text-slate-500">We reageren binnen 1–2 werkdagen.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Waar gaat je vraag over?
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Jouw vraag of bericht <span className="text-orange">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => { setMessage(e.target.value); setPrescreenDismissed(false); }}
                placeholder="Vertel ons hoe we je kunnen helpen..."
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition resize-none"
              />
              {!prescreenDismissed && (
                <FaqPrescreen
                  query={message}
                  onDismiss={() => setPrescreenDismissed(true)}
                />
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-full border border-neutral-200 text-sm text-slate-600 hover:bg-neutral-50 transition-colors"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-full bg-orange hover:bg-orange/90 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Versturen..." : "Verstuur"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function SupportContent() {
  const [tickets, setTickets] = useState<TicketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  async function loadTickets() {
    try {
      const data = await getMyTickets();
      setTickets(data.tickets);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <AppShell title="Mijn vragen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">Mijn vragen</h1>
            <p className="text-sm text-slate-500 mt-1">Bekijk de status van je vragen aan ons team</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-orange hover:bg-orange/90 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors shadow-sm"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Nieuwe vraag
          </button>
        </div>

        {/* Ticketlijst */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-orange" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-7 h-7 text-orange" />
            </div>
            <h2 className="font-semibold text-slate-900 mb-2">Nog geen vragen gesteld</h2>
            <p className="text-sm text-slate-500 mb-6">
              Heb je een vraag of probleem? We helpen je graag.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-orange hover:bg-orange/90 text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors"
            >
              <MessageSquarePlus className="w-4 h-4" />
              Stel een vraag
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/dashboard/support/${ticket.id}`}
                className="block bg-white rounded-2xl border border-neutral-100 p-5 hover:border-orange/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
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
                    <p className="font-medium text-slate-900 truncate">{ticket.subject}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {CATEGORY_LABELS[ticket.category]} &bull; {formatDate(ticket.created_at)}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <NewTicketModal
          onClose={() => setShowModal(false)}
          onCreated={loadTickets}
        />
      )}
    </AppShell>
  );
}

export default function SupportPage() {
  return (
    <ProtectedRoute>
      <SupportContent />
    </ProtectedRoute>
  );
}
