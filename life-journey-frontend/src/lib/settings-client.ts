import { apiFetch } from "@/lib/api-client";

export interface EmailPreferences {
  welcomeEmails: boolean;
  chapterEmails: boolean;
  milestoneEmails: boolean;
  weeklyQuestionEmails: boolean;
  inactivityReminders: boolean;
  seasonalEmails: boolean;
  familyNotifications: boolean;
  unsubscribedAll: boolean;
}

interface EmailPrefsDto {
  welcome_emails: boolean;
  chapter_emails: boolean;
  milestone_emails: boolean;
  weekly_question_emails: boolean;
  inactivity_reminders: boolean;
  seasonal_emails: boolean;
  family_notifications: boolean;
  unsubscribed_all: boolean;
}

function mapPrefs(dto: EmailPrefsDto): EmailPreferences {
  return {
    welcomeEmails: dto.welcome_emails,
    chapterEmails: dto.chapter_emails,
    milestoneEmails: dto.milestone_emails,
    weeklyQuestionEmails: dto.weekly_question_emails,
    inactivityReminders: dto.inactivity_reminders,
    seasonalEmails: dto.seasonal_emails,
    familyNotifications: dto.family_notifications,
    unsubscribedAll: dto.unsubscribed_all,
  };
}

export async function getEmailPreferences(token: string): Promise<EmailPreferences> {
  const dto = await apiFetch<EmailPrefsDto>("/emails/preferences", undefined, { token });
  return mapPrefs(dto);
}

export async function updateEmailPreferences(
  patch: Partial<EmailPreferences>,
  token: string,
): Promise<EmailPreferences> {
  const body: Partial<EmailPrefsDto> = {};
  if (patch.welcomeEmails !== undefined) body.welcome_emails = patch.welcomeEmails;
  if (patch.chapterEmails !== undefined) body.chapter_emails = patch.chapterEmails;
  if (patch.milestoneEmails !== undefined) body.milestone_emails = patch.milestoneEmails;
  if (patch.weeklyQuestionEmails !== undefined) body.weekly_question_emails = patch.weeklyQuestionEmails;
  if (patch.inactivityReminders !== undefined) body.inactivity_reminders = patch.inactivityReminders;
  if (patch.seasonalEmails !== undefined) body.seasonal_emails = patch.seasonalEmails;
  if (patch.familyNotifications !== undefined) body.family_notifications = patch.familyNotifications;
  if (patch.unsubscribedAll !== undefined) body.unsubscribed_all = patch.unsubscribedAll;

  const dto = await apiFetch<EmailPrefsDto>("/emails/preferences", {
    method: "PUT",
    body: JSON.stringify(body),
  }, { token });
  return mapPrefs(dto);
}

export async function requestDataExport(journeyId: string, token: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/sharing/${journeyId}/export`, {
    method: "POST",
  }, { token });
}

export async function downloadBackup(
  type: "quick" | "full",
  token: string,
): Promise<void> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";
  const res = await fetch(`${base}/account/backup?type=${type}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Backup mislukt (${res.status})`);
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? `backup_${type}.zip`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadUsbToken(token: string): Promise<void> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";
  const res = await fetch(`${base}/account/usb-token`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Koppelbestand mislukt (${res.status})`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "koppelbestand.txt";
  a.click();
  URL.revokeObjectURL(url);
}

export async function deleteAccount(password: string, token: string): Promise<void> {
  await apiFetch<void>("/account/me", {
    method: "DELETE",
    body: JSON.stringify({ password, confirm: true }),
  }, { token });
}
