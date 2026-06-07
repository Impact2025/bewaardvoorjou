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

export interface HelpdeskMessage {
  role: "user" | "assistant";
  content: string;
}

export interface HelpdeskActionLink {
  label: string;
  href: string;
}

export interface HelpdeskResponse {
  message: string;
  escalate: boolean;
  suggested_questions: string[];
  action_links: HelpdeskActionLink[];
}

export async function sendHelpdeskMessage(
  message: string,
  conversationHistory: HelpdeskMessage[]
): Promise<HelpdeskResponse> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/helpdesk/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      message,
      conversation_history: conversationHistory,
    }),
  });

  if (!res.ok) {
    throw new Error("Kon je bericht niet versturen. Probeer het opnieuw.");
  }

  return res.json();
}
