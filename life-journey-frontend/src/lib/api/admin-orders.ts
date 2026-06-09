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

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ShippingAddress {
  full_name: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  country: string;
}

export interface AdminOrder {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  buyer_email: string | null;
  buyer_name: string | null;
  package_type: string;
  price_paid: number;
  discount_cents: number;
  addons: string[];
  addons_price: number;
  stripe_payment_intent_id: string | null;
  stripe_payment_method: string | null;
  status: "PENDING" | "PAID" | "FULFILLED" | "CANCELLED" | "REFUNDED";
  recipient_name: string | null;
  recipient_email: string | null;
  personal_message: string | null;
  gift_card_code: string | null;
  shipping_address: ShippingAddress | null;
  promo_code_used: string | null;
  created_at: string;
  paid_at: string | null;
  fulfilled_at: string | null;
  usb_burned_at: string | null;
  usb_burned_by: string | null;
}

export interface OrderListResponse {
  orders: AdminOrder[];
  total: number;
  skip: number;
  limit: number;
}

export interface OrderStats {
  total_orders: number;
  paid_orders: number;
  pending_fulfillment: number;
  total_revenue_cents: number;
  usb_needed: number;
}

export interface ListOrdersParams {
  skip?: number;
  limit?: number;
  search?: string;
  status?: string;
  package_type?: string;
  date_from?: string;
  date_to?: string;
}

export async function getOrderStats(): Promise<OrderStats> {
  const res = await fetch(`${API_BASE}/admin/orders/stats`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Statistieken laden mislukt");
  return res.json();
}

export async function listAdminOrders(params: ListOrdersParams = {}): Promise<OrderListResponse> {
  const qs = new URLSearchParams();
  if (params.skip !== undefined) qs.set("skip", String(params.skip));
  if (params.limit !== undefined) qs.set("limit", String(params.limit));
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.package_type) qs.set("package_type", params.package_type);
  if (params.date_from) qs.set("date_from", params.date_from);
  if (params.date_to) qs.set("date_to", params.date_to);

  const res = await fetch(`${API_BASE}/admin/orders?${qs}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Bestellingen laden mislukt");
  return res.json();
}

export async function getAdminOrder(orderId: string): Promise<AdminOrder> {
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Bestelling laden mislukt");
  return res.json();
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: AdminOrder["status"]
): Promise<AdminOrder> {
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ status: newStatus }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Status bijwerken mislukt");
  }
  return res.json();
}

export async function markUsbBurned(orderId: string): Promise<AdminOrder> {
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}/usb-burned`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("USB markeren mislukt");
  return res.json();
}

export async function resendOrderEmails(
  orderId: string
): Promise<{ sent: string[]; errors: string[] }> {
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}/resend-emails`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "E-mails opnieuw sturen mislukt");
  }
  return res.json();
}

export function exportOrdersCsvUrl(status?: string): string {
  const qs = status ? `?status=${status}` : "";
  return `${API_BASE}/admin/orders/export/csv${qs}`;
}
