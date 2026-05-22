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

export type PackageType = "BEGIN" | "ERFGOED" | "VOOR_ALTIJD";

export interface CreatePaymentIntentPayload {
  package_type: PackageType;
  addons: AddonCode[];
  recipient_name: string;
  personal_message: string;
  shipping_address: ShippingAddress;
  guest_email?: string;
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

export const PACKAGE_PRICES: Record<PackageType, number> = {
  BEGIN: 89,
  ERFGOED: 249,
  VOOR_ALTIJD: 399,
};

export const PACKAGE_NAMES: Record<PackageType, string> = {
  BEGIN: "Het Begin",
  ERFGOED: "De Erfgoed Box",
  VOOR_ALTIJD: "Voor Altijd",
};

export const ADDON_OPTIONS: { code: AddonCode; label: string; price: number; description: string }[] = [
  { code: "GIFT_BOX", label: "Luxe cadeauverpakking", price: 15, description: "Nog mooiere outer box, linten, extra kaart" },
  { code: "EXTRA_USB", label: "Extra USB-stick", price: 19, description: "Grootouders + ouders krijgen elk eigen kopie" },
  { code: "PHOTO_BOOK", label: "Gedrukt fotoboek (20 pag.)", price: 39, description: "Mooiste foto's in hardcover boek" },
  { code: "EXTRA_STORAGE", label: "Verlengde opslag +5 jaar", price: 49, description: "Voor Erfgoed Box: 10→15 jaar opslag" },
  { code: "VIDEO_INTRO", label: "Professionele video-intro", price: 99, description: "Wij maken 2 min intro video van hun leven" },
];
