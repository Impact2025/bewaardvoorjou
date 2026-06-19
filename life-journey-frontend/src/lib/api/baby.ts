/**
 * BewaardVoorBaby — API client.
 * Alle aanroepen naar /api/v1/baby/*
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("life-journey.auth");
  if (!raw) return null;
  try { return JSON.parse(raw).token ?? null; } catch { return null; }
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as Record<string, string>).detail ?? "API-fout");
  }
  return res.json();
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as Record<string, string>).detail ?? "API-fout");
  }
  return res.json();
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as Record<string, string>).detail ?? "API-fout");
  }
  return res.json();
}

async function apiDelete<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: authHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as Record<string, string>).detail ?? "API-fout");
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NarratorRole = "MOEDER" | "PARTNER" | "SAMEN";

export interface GrandparentEntry {
  name: string;
  email: string;
  digest_active: boolean;
}

export interface BabyJourneyCreate {
  baby_name: string;
  narrator_role: NarratorRole;
  baby_birth_date?: string;        // YYYY-MM-DD
  birth_time_str?: string;         // "HH:MM"
  birth_weight_grams?: number;
  birth_length_cm?: number;
  partner_email?: string;
  grandparent_emails?: GrandparentEntry[];
  order_id?: string;
}

export interface BabyJourneyPublic {
  id: string;
  journey_id: string;
  user_id: string;
  baby_name: string;
  narrator_role: NarratorRole;
  baby_birth_date: string | null;
  birth_time_str: string | null;
  birth_weight_grams: number | null;
  birth_length_cm: number | null;
  first_outfit_photo_url: string | null;
  partner_email: string | null;
  partner_joined_at: string | null;
  grandparent_emails: GrandparentEntry[];
  photobook_voucher_active: boolean;
  photobook_voucher_claimed: boolean;
  pivot_to_monthly: boolean;
  created_at: string;
}

export interface BabyJourneyWithProgress extends BabyJourneyPublic {
  milestones_completed: number;
  milestones_total: number;
  photobook_progress_pct: number;
  current_age_weeks: number | null;
  next_chapter_id: string | null;
  next_chapter_label: string | null;
}

export interface BabyMilestoneCreate {
  milestone_type: string;
  milestone_date?: string;   // YYYY-MM-DD
  notes?: string;
  photo_url?: string;
}

export interface BabyMilestonePublic {
  id: string;
  baby_journey_id: string;
  milestone_type: string;
  milestone_label: string;
  milestone_date: string | null;
  notes: string | null;
  photo_url: string | null;
  chapter_id_triggered: string | null;
  email_triggered: boolean;
  marked_at: string;
}

export interface PhotobookVoucherStatus {
  active: boolean;
  claimed: boolean;
  claimed_at: string | null;
  milestones_completed: number;
  milestones_total: number;
  progress_pct: number;
  eligible_to_claim: boolean;
}

// ---------------------------------------------------------------------------
// Milestone metadata (alle 28 types + labels)
// ---------------------------------------------------------------------------

export const MILESTONE_TYPES_ORDERED = [
  "eerste_bad_thuis",
  "eerste_glimlach",
  "eerste_lach",
  "eerste_doorslapen",
  "eerste_omrollen_buik_naar_rug",
  "eerste_omrollen_rug_naar_buik",
  "eerste_hapjes",
  "eerste_tandje",
  "eerste_zitten",
  "eerste_kruipen",
  "eerste_zwaaien",
  "eerste_klappen",
  "eerste_kusje",
  "eerste_staan",
  "eerste_woordje_mama",
  "eerste_woordje_papa",
  "eerste_stapjes",
  "eerste_knipbeurt",
  "eerste_zwemmen",
  "eerste_fiets",
  "eerste_nachtje_logeren",
  "eerste_vakantie",
  "eerste_feestdag_kerst",
  "eerste_sinterklaas",
  "eerste_crèche",
  "eerste_blowout",
  "eerste_lopen",
  "eerste_verjaardag",
  "eerste_cake_smash",
] as const;

export type MilestoneType = (typeof MILESTONE_TYPES_ORDERED)[number];

export const MILESTONE_LABELS: Record<string, string> = {
  eerste_bad_thuis:              "Eerste bad thuis",
  eerste_glimlach:               "Eerste sociale glimlach",
  eerste_lach:                   "Eerste schaterlach",
  eerste_doorslapen:             "Eerste keer doorslapen",
  eerste_omrollen_buik_naar_rug: "Eerste omrollen (buik → rug)",
  eerste_omrollen_rug_naar_buik: "Eerste omrollen (rug → buik)",
  eerste_hapjes:                 "Eerste hapjes vaste voeding",
  eerste_tandje:                 "Eerste tandje",
  eerste_zitten:                 "Zelfstandig zitten",
  eerste_kruipen:                "Eerste kruipen / tijgeren",
  eerste_zwaaien:                "Eerste keer zwaaien",
  eerste_klappen:                "Eerste keer klappen",
  eerste_kusje:                  "Eerste kusje",
  eerste_staan:                  "Eerste keer zelfstandig staan",
  eerste_woordje_mama:           "Eerste woordje 'mama'",
  eerste_woordje_papa:           "Eerste woordje 'papa'",
  eerste_stapjes:                "Eerste stapjes",
  eerste_knipbeurt:              "Eerste knipbeurt",
  eerste_zwemmen:                "Eerste keer zwemmen",
  eerste_fiets:                  "Eerste fietstocht / loopfiets",
  eerste_nachtje_logeren:        "Eerste nachtje logeren",
  eerste_vakantie:               "Eerste vakantie",
  eerste_feestdag_kerst:         "Eerste Kerstmis",
  eerste_sinterklaas:            "Eerste Sinterklaas",
  "eerste_crèche":               "Eerste dag crèche / opvang",
  eerste_blowout:                "De legendarische blowout",
  eerste_lopen:                  "Zelfstandig lopen",
  eerste_verjaardag:             "Eerste verjaardag",
  eerste_cake_smash:             "Cake smash",
};

// ---------------------------------------------------------------------------
// API functies
// ---------------------------------------------------------------------------

export async function createBabyJourney(
  payload: BabyJourneyCreate
): Promise<BabyJourneyPublic> {
  return apiPost("/baby/journeys", payload);
}

export async function getMyBabyJourney(): Promise<BabyJourneyWithProgress> {
  return apiGet("/baby/journeys/me");
}

export async function updateBabyJourney(
  payload: Partial<BabyJourneyCreate>
): Promise<BabyJourneyPublic> {
  return apiPatch("/baby/journeys/me", payload);
}

export async function getBabyMilestones(): Promise<BabyMilestonePublic[]> {
  return apiGet("/baby/journeys/me/milestones");
}

export async function markBabyMilestone(
  payload: BabyMilestoneCreate
): Promise<BabyMilestonePublic> {
  return apiPost("/baby/journeys/me/milestones", payload);
}

export async function invitePartner(partnerEmail: string): Promise<{ detail: string }> {
  return apiPost("/baby/journeys/me/partner", { partner_email: partnerEmail });
}

export async function addGrandparent(
  entry: GrandparentEntry
): Promise<BabyJourneyPublic> {
  return apiPost("/baby/journeys/me/grandparents", entry);
}

export async function removeGrandparent(email: string): Promise<BabyJourneyPublic> {
  return apiDelete("/baby/journeys/me/grandparents", { email });
}

export async function getPhotobookStatus(): Promise<PhotobookVoucherStatus> {
  return apiGet("/baby/journeys/me/photobook");
}

export async function claimPhotobookVoucher(): Promise<PhotobookVoucherStatus> {
  return apiPost("/baby/journeys/me/photobook/claim", {});
}

export async function getBabyInterviewQuestion(
  chapterId: string
): Promise<{ question: string; chapter_id: string }> {
  return apiPost(`/baby/interview/${chapterId}`, {});
}
