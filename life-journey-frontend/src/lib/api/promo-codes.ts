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

export interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: "PERCENTAGE" | "FIXED";
  discount_value: number;
  applicable_packages: string[] | null;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  grants_package: string | null;
}

export interface ValidatePromoResponse {
  valid: boolean;
  discount_cents: number;
  discount_type: string | null;
  discount_value: number | null;
  error: string | null;
}

export interface RedeemPromoCodeResponse {
  success: boolean;
  message: string;
  grants_package: string | null;
}

export interface CreatePromoCodePayload {
  code: string;
  description?: string;
  discount_type: "PERCENTAGE" | "FIXED";
  discount_value: number;
  applicable_packages?: string[] | null;
  max_uses?: number | null;
  expires_at?: string | null;
  grants_package?: string | null;
}

export async function validatePromoCode(
  code: string,
  packageType: string
): Promise<ValidatePromoResponse> {
  const res = await fetch(`${API_BASE}/promo-codes/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, package_type: packageType }),
  });
  if (!res.ok) {
    return { valid: false, discount_cents: 0, discount_type: null, discount_value: null, error: "Validatie mislukt" };
  }
  return res.json();
}

export async function listPromoCodes(): Promise<PromoCode[]> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/admin/promo-codes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Laden mislukt");
  return res.json();
}

export async function createPromoCode(data: CreatePromoCodePayload): Promise<PromoCode> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/admin/promo-codes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Aanmaken mislukt");
  }
  return res.json();
}

export async function updatePromoCode(
  id: string,
  data: { is_active?: boolean; max_uses?: number | null; expires_at?: string | null }
): Promise<PromoCode> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/admin/promo-codes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Bijwerken mislukt");
  return res.json();
}

export async function deletePromoCode(id: string): Promise<void> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/admin/promo-codes/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Verwijderen mislukt");
}

export async function redeemPromoCode(code: string): Promise<RedeemPromoCodeResponse> {
  const token = getToken();
  if (!token) throw new Error("Niet ingelogd");
  const res = await fetch(`${API_BASE}/promo-codes/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Inwisselen mislukt");
  }
  return res.json();
}
