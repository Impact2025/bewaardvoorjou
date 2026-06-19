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

export interface ShippingAddress {
  full_name: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  country: string;
}

export type AddonCode =
  | "GIFT_BOX"
  | "EXTRA_USB"
  | "PHOTO_BOOK"
  | "EXTRA_STORAGE"
  | "VIDEO_INTRO";

export type PackageType = "VERHAAL" | "ERFGOED" | "NALATENSCHAP" | "BABY_GIFT" | "BEGIN" | "VOOR_ALTIJD" | "DIGITAAL";

export type RecipientRelation =
  | "vader" | "moeder" | "opa" | "oma" | "schoonouder" | "partner" | "anders"
  // Baby-specifieke relaties (voor BABY_GIFT cadeau-flow)
  | "zus" | "broer" | "vriend" | "vriendin" | "collega";

export type GiftReveal = "SURPRISE" | "ANNOUNCED";

export type MessageMediaType = "text" | "audio" | "video";

export interface CreatePaymentIntentPayload {
  package_type: PackageType;
  addons: AddonCode[];
  for_self?: boolean;
  recipient_name: string;
  recipient_email?: string;
  recipient_relation?: RecipientRelation;
  personal_message: string;
  card_message?: string;
  message_media_url?: string;
  message_media_type?: MessageMediaType;
  gift_reveal?: GiftReveal;
  delivery_date?: string; // YYYY-MM-DD
  shipping_address?: ShippingAddress;
  guest_email?: string;
  promo_code?: string;
}

export interface CreatePaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
  order_id: string;
  amount_cents: number;
  publishable_key: string;
}

export async function createPaymentIntent(
  payload: CreatePaymentIntentPayload
): Promise<CreatePaymentIntentResponse> {
  const token = getToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/orders/create-payment-intent`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Betaling kon niet worden gestart");
  }

  return res.json();
}

export type OrderPaymentStatus = "paid" | "processing" | "pending" | "failed";

export interface OrderStatusResponse {
  order_id: string;
  status: OrderPaymentStatus;
  package_type: PackageType;
  recipient_name: string | null;
  recipient_email: string | null;
  has_shipping: boolean;
  shipping_city: string | null;
  redemption_token: string | null;
  gift_reveal: string | null;
  delivery_date: string | null;
}

/**
 * Haalt de gezaghebbende betaalstatus van een order op bij de backend.
 * Gebruikt na een Stripe-redirect (iDEAL) i.p.v. de onbetrouwbare `redirect_status`.
 */
export async function getOrderStatus(orderId: string): Promise<OrderStatusResponse> {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}/status`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Kon de betaalstatus niet ophalen");
  }
  return res.json();
}

// ─── Cadeaubericht (audio/video) upload ──────────────────────────────────────

interface GiftMessagePresignResponse {
  upload_url: string;
  object_key: string;
  upload_method: string;
}

/**
 * Upload een opgenomen of geüpload audio/video cadeaubericht.
 * Retourneert de object_key die als `message_media_url` meegaat naar create-payment-intent.
 */
export async function uploadGiftMessage(
  blob: Blob,
  filename: string,
  modality: "audio" | "video"
): Promise<string> {
  const presignRes = await fetch(`${API_BASE}/orders/gift-message/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, modality, size_bytes: blob.size }),
  });
  if (!presignRes.ok) {
    const err = await presignRes.json().catch(() => ({}));
    throw new Error(err.detail ?? "Kon het bericht niet voorbereiden");
  }
  const presign: GiftMessagePresignResponse = await presignRes.json();

  const uploadRes = await fetch(presign.upload_url, {
    method: presign.upload_method || "PUT",
    headers: { "Content-Type": blob.type || "application/octet-stream" },
    body: blob,
  });
  if (!uploadRes.ok) {
    throw new Error("Het uploaden van het bericht is mislukt");
  }
  return presign.object_key;
}

// ─── Cadeau-ontgrendeling (redemption) ───────────────────────────────────────

export interface GiftRedemption {
  recipient_name: string | null;
  recipient_relation: string | null;
  package_type: PackageType;
  gifter_name: string | null;
  personal_message: string | null;
  message_media_type: MessageMediaType | null;
  message_media_url: string | null;
  message_transcript: string | null;
  message_status: string | null;
  card_message: string | null;
  already_redeemed: boolean;
}

/** Haalt de ontgrendel-data op voor een cadeau-token (publiek, via QR/startkaart). */
export async function getGiftRedemption(token: string): Promise<GiftRedemption> {
  const res = await fetch(`${API_BASE}/orders/redeem/${encodeURIComponent(token)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Cadeau niet gevonden");
  }
  return res.json();
}

/**
 * Start het cadeau vanaf de QR/startkaart: de ontvanger geeft zijn e-mail op en
 * krijgt een magic link die het pakket activeert (geen wachtwoord nodig).
 */
export async function startGiftRedemption(token: string, email: string): Promise<void> {
  const res = await fetch(`${API_BASE}/orders/redeem/${encodeURIComponent(token)}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Kon het cadeau niet starten");
  }
}

export const PACKAGE_PRICES: Record<PackageType, number> = {
  VERHAAL: 79,
  ERFGOED: 149,
  NALATENSCHAP: 229,
  BABY_GIFT: 59,
  // Legacy
  BEGIN: 89,
  VOOR_ALTIJD: 399,
  DIGITAAL: 49,
};

export const PACKAGE_NAMES: Record<PackageType, string> = {
  VERHAAL: "Verhaal",
  ERFGOED: "Erfgoed",
  NALATENSCHAP: "Nalatenschap",
  BABY_GIFT: "Bewaard voor Baby",
  // Legacy
  BEGIN: "Het Begin",
  VOOR_ALTIJD: "Voor Altijd",
  DIGITAAL: "Digitaal",
};

export const ADDON_OPTIONS: { code: AddonCode; label: string; price: number; description: string }[] = [
  { code: "GIFT_BOX", label: "Luxe cadeauverpakking", price: 15, description: "Nog mooiere outer box, linten, extra kaart" },
  { code: "EXTRA_USB", label: "Extra USB-stick", price: 19, description: "Grootouders + ouders krijgen elk eigen kopie" },
  { code: "PHOTO_BOOK", label: "Gedrukt fotoboek (20 pag.)", price: 39, description: "Mooiste foto's in hardcover boek" },
  { code: "EXTRA_STORAGE", label: "Verlengde opslag +5 jaar", price: 49, description: "Voor Erfgoed Box: 10→15 jaar opslag" },
  { code: "VIDEO_INTRO", label: "Professionele video-intro", price: 99, description: "Wij maken 2 min intro video van hun leven" },
];
