import { apiFetch } from "./api-client";

export interface SharedPod {
  id: string;
  journey_id: string;
  title: string;
  description: string | null;
  created_by: string | null;
  is_active: boolean;
  last_activity: string;
  members: string[];
  created_at: string;
}

export interface PodMessage {
  id: string;
  pod_id: string;
  author_id: string | null;
  author_name: string;
  content: string;
  reactions: Record<string, string[]>;
  created_at: string;
}

export async function listPods(journeyId: string, token: string): Promise<SharedPod[]> {
  return apiFetch<SharedPod[]>(`/family/${journeyId}/pods`, { method: "GET" }, { token });
}

export async function createPod(
  journeyId: string,
  payload: { title: string; description?: string },
  token: string,
): Promise<SharedPod> {
  return apiFetch<SharedPod>(
    `/family/${journeyId}/pods`,
    { method: "POST", body: JSON.stringify(payload) },
    { token },
  );
}

export async function deletePod(journeyId: string, podId: string, token: string): Promise<void> {
  await apiFetch<void>(`/family/${journeyId}/pods/${podId}`, { method: "DELETE" }, { token });
}

export async function listMessages(journeyId: string, podId: string, token: string): Promise<PodMessage[]> {
  return apiFetch<PodMessage[]>(`/family/${journeyId}/pods/${podId}/messages`, { method: "GET" }, { token });
}

export async function postMessage(
  journeyId: string,
  podId: string,
  content: string,
  token: string,
): Promise<PodMessage> {
  return apiFetch<PodMessage>(
    `/family/${journeyId}/pods/${podId}/messages`,
    { method: "POST", body: JSON.stringify({ content }) },
    { token },
  );
}

export async function reactToMessage(
  journeyId: string,
  podId: string,
  messageId: string,
  emoji: string,
  token: string,
): Promise<PodMessage> {
  return apiFetch<PodMessage>(
    `/family/${journeyId}/pods/${podId}/messages/${messageId}/react`,
    { method: "POST", body: JSON.stringify({ emoji }) },
    { token },
  );
}
