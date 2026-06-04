const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("life-journey.auth");
  if (!raw) return null;
  try {
    return JSON.parse(raw).token ?? null;
  } catch {
    return null;
  }
}

function authHeaders(extra?: Record<string, string>): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export type TicketCategory = "technisch" | "account" | "privacy" | "abonnement" | "overig";
export type TicketStatus = "open" | "in_behandeling" | "opgelost" | "gesloten";
export type TicketPriority = "laag" | "normaal" | "hoog" | "urgent";
export type SenderType = "klant" | "medewerker" | "systeem";

export interface TicketMessage {
  id: string;
  sender_type: SenderType;
  sender_name: string;
  content: string;
  is_internal: boolean;
  created_at: string;
}

export interface Ticket {
  id: string;
  ticket_number: number;
  category: TicketCategory;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  guest_name?: string;
  guest_email?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  messages: TicketMessage[];
}

export interface TicketListItem {
  id: string;
  ticket_number: number;
  category: TicketCategory;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketPayload {
  guest_name?: string;
  guest_email?: string;
  category: TicketCategory;
  subject: string;
  message: string;
}

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  technisch: "Technisch probleem",
  account: "Mijn account",
  privacy: "Privacy & gegevens",
  abonnement: "Abonnement & betaling",
  overig: "Overig",
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Ontvangen",
  in_behandeling: "We zijn er mee bezig",
  opgelost: "Opgelost",
  gesloten: "Gesloten",
};

export const STATUS_COLORS: Record<TicketStatus, string> = {
  open: "bg-blue-100 text-blue-800",
  in_behandeling: "bg-amber-100 text-amber-800",
  opgelost: "bg-green-100 text-green-800",
  gesloten: "bg-neutral-100 text-neutral-600",
};

export async function createTicket(payload: CreateTicketPayload): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/support`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Kon je vraag niet versturen. Probeer het opnieuw.");
  }
  return res.json();
}

export async function getMyTickets(): Promise<{ tickets: TicketListItem[]; total: number }> {
  const res = await fetch(`${API_BASE}/support/mine`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Kon je vragen niet ophalen");
  return res.json();
}

export async function getTicket(ticketId: string): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/support/${ticketId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Ticket niet gevonden");
  return res.json();
}

export async function getOpenTicketCount(): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/support/count`, {
      headers: authHeaders(),
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.open ?? 0;
  } catch {
    return 0;
  }
}

export async function replyToTicket(ticketId: string, content: string): Promise<TicketMessage> {
  const res = await fetch(`${API_BASE}/support/${ticketId}/reply`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Kon je reactie niet versturen");
  }
  return res.json();
}
