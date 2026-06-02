const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

export interface EarlyBirdStatus {
  active: boolean;
  discount_cents: number;
  deadline_iso: string;
  waitlist_discount_cents: number;
}

let _cache: EarlyBirdStatus | null = null;

export async function getEarlyBirdStatus(): Promise<EarlyBirdStatus> {
  if (_cache) return _cache;
  try {
    const res = await fetch(`${API_BASE}/orders/early-bird`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error();
    _cache = await res.json();
    return _cache!;
  } catch {
    return { active: false, discount_cents: 0, deadline_iso: "", waitlist_discount_cents: 0 };
  }
}
