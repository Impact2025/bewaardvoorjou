import { apiFetch } from "./api-client";

export interface QuestionItem {
  id: string;
  text: string;
}

export interface Interview {
  id: string;
  journey_id: string;
  interviewee_name: string;
  interviewee_email: string | null;
  personal_message: string | null;
  questions: QuestionItem[];
  token: string;
  share_url: string;
  is_completed: boolean;
  completed_at: string | null;
  email_sent_at: string | null;
  created_at: string;
  answer_count: number;
}

export interface PublicInterview {
  id: string;
  interviewee_name: string;
  personal_message: string | null;
  questions: QuestionItem[];
  is_completed: boolean;
  journey_owner_name: string;
}

export interface AnswerItem {
  question_id: string;
  answer_text: string;
}

export async function listInterviews(journeyId: string, token: string): Promise<Interview[]> {
  return apiFetch<Interview[]>(`/family/${journeyId}/parent-interviews`, { method: "GET" }, { token });
}

export async function createInterview(
  journeyId: string,
  payload: { interviewee_name: string; interviewee_email?: string; personal_message?: string; topic?: string },
  token: string,
): Promise<Interview> {
  return apiFetch<Interview>(
    `/family/${journeyId}/parent-interviews`,
    { method: "POST", body: JSON.stringify(payload) },
    { token },
  );
}

export async function deleteInterview(journeyId: string, interviewId: string, token: string): Promise<void> {
  await apiFetch<void>(`/family/${journeyId}/parent-interviews/${interviewId}`, { method: "DELETE" }, { token });
}

export async function getPublicInterview(token: string): Promise<PublicInterview> {
  return apiFetch<PublicInterview>(`/parent-interview/${token}`);
}

export async function submitAnswers(token: string, answers: AnswerItem[]): Promise<void> {
  await apiFetch<void>(
    `/parent-interview/${token}/answers`,
    { method: "POST", body: JSON.stringify({ answers }) },
  );
}
