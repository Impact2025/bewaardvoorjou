const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

export type WaitlistPackage = "ERFGOED" | "VOOR_ALTIJD";

export interface WaitlistResponse {
  message: string;
  already_registered: boolean;
}

export async function joinWaitlist(
  email: string,
  packageType: WaitlistPackage
): Promise<WaitlistResponse> {
  const res = await fetch(`${API_BASE}/waitlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, package_type: packageType }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Inschrijven mislukt, probeer het opnieuw");
  }

  return res.json();
}
