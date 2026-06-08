"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/store/auth-context";
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";
import {
  getEmailPreferences,
  updateEmailPreferences,
  requestDataExport,
  deleteAccount,
  downloadBackup,
  type EmailPreferences,
} from "@/lib/settings-client";

type SaveState = "idle" | "saving" | "saved" | "error";
type ExportState = "idle" | "loading" | "sent" | "error";
type BackupState = "idle" | "downloading" | "done" | "error";
type DeleteState = "idle" | "confirm" | "deleting" | "error";

function Toggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-4 py-4 cursor-pointer group">
      <div className="flex-1">
        <p className="font-medium text-base" style={{ color: "#2C2416" }}>
          {label}
        </p>
        <p className="text-sm mt-0.5" style={{ color: "#6B6456" }}>
          {description}
        </p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="relative flex-shrink-0 mt-0.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 disabled:opacity-40"
        style={{
          width: "48px",
          height: "28px",
          background: checked ? "#F97316" : "#D4D0C8",
        }}
      >
        <span
          className="absolute top-1 rounded-full bg-white shadow transition-transform"
          style={{
            width: "20px",
            height: "20px",
            left: "4px",
            transform: checked ? "translateX(20px)" : "translateX(0)",
          }}
        />
      </button>
    </label>
  );
}

const BACKUP_LS_KEY = "bvj_last_backup";

function BackupSection({
  token,
  journeyId,
}: {
  token: string;
  journeyId: string;
}) {
  const [quickState, setQuickState] = useState<BackupState>("idle");
  const [fullState, setFullState] = useState<BackupState>("idle");
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  useEffect(() => {
    setLastBackup(localStorage.getItem(BACKUP_LS_KEY));
  }, []);

  const handleDownload = useCallback(
    async (type: "quick" | "full") => {
      const setter = type === "quick" ? setQuickState : setFullState;
      setter("downloading");
      try {
        await downloadBackup(type, token);
        setter("done");
        const now = new Date().toLocaleDateString("nl-NL", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        localStorage.setItem(BACKUP_LS_KEY, now);
        setLastBackup(now);
        setTimeout(() => setter("idle"), 4000);
      } catch {
        setter("error");
        setTimeout(() => setter("idle"), 4000);
      }
    },
    [token],
  );

  const busy = quickState === "downloading" || fullState === "downloading";

  return (
    <section>
      <h2 className="text-xl font-serif font-semibold mb-1" style={{ color: "#2C2416" }}>
        Mijn backup
      </h2>
      <p className="text-sm mb-4" style={{ color: "#6B6456" }}>
        Download je verhalen direct naar je computer. Geen e-mail nodig — het ZIP-bestand staat binnen seconden op je scherm.
      </p>

      <div
        className="rounded-2xl overflow-hidden divide-y"
        style={{ background: "#FFFFFF", border: "1px solid #E9E4DB" }}
      >
        {/* Tussentijdse backup */}
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold" style={{ color: "#2C2416" }}>
                Tussentijdse backup
              </p>
              <p className="text-sm mt-0.5" style={{ color: "#6B6456" }}>
                Al je opnames (.mp3) met transcripties en notities als ZIP. Klaar in ~30 seconden.
              </p>
            </div>
            <button
              onClick={() => handleDownload("quick")}
              disabled={busy}
              className="flex-shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: quickState === "done" ? "#22C55E" : "#F97316", minWidth: "130px" }}
            >
              {quickState === "downloading" ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Bezig…
                </span>
              ) : quickState === "done" ? (
                "✓ Gedownload"
              ) : quickState === "error" ? (
                "Probeer opnieuw"
              ) : (
                "⬇ Download"
              )}
            </button>
          </div>
          <ul className="mt-3 text-xs space-y-0.5" style={{ color: "#9C8E82" }}>
            <li>✔ Audio-opnames (.mp3)</li>
            <li>✔ Transcripties als tekst (.txt)</li>
            <li>✔ Notities en memo&#39;s</li>
          </ul>
        </div>

        {/* Eindversie */}
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold" style={{ color: "#2C2416" }}>
                Eindversie — USB-kopie
              </p>
              <p className="text-sm mt-0.5" style={{ color: "#6B6456" }}>
                Identiek aan de USB-stick die wij versturen: levensboek (PDF), opnames, en offline dashboard. Duurt ~2 minuten.
              </p>
            </div>
            <button
              onClick={() => handleDownload("full")}
              disabled={busy}
              className="flex-shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50"
              style={{
                background: fullState === "done" ? "#22C55E" : "transparent",
                border: fullState === "done" ? "none" : "2px solid #F97316",
                color: fullState === "done" ? "#FFFFFF" : "#F97316",
                minWidth: "130px",
              }}
            >
              {fullState === "downloading" ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Bezig…
                </span>
              ) : fullState === "done" ? (
                "✓ Gedownload"
              ) : fullState === "error" ? (
                "Probeer opnieuw"
              ) : (
                "⬇ Download"
              )}
            </button>
          </div>
          <ul className="mt-3 text-xs space-y-0.5" style={{ color: "#9C8E82" }}>
            <li>✔ Levensboek als PDF</li>
            <li>✔ Alle audio-opnames</li>
            <li>✔ Offline HTML-dashboard</li>
            <li>✔ Zelfde inhoud als uw USB-stick</li>
          </ul>
        </div>

        {/* Laatste backup */}
        {lastBackup && (
          <div className="px-6 py-3">
            <p className="text-xs" style={{ color: "#9C8E82" }}>
              Laatste download: {lastBackup}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function SettingsContent() {
  const router = useRouter();
  const { session, clearSession } = useAuth();
  const { journey } = useJourneyBootstrap();
  const [prefs, setPrefs] = useState<EmailPreferences | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [exportState, setExportState] = useState<ExportState>("idle");
  const [deleteState, setDeleteState] = useState<DeleteState>("idle");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session?.token) return;
    getEmailPreferences(session.token)
      .then(setPrefs)
      .catch(() => {});
  }, [session?.token]);

  const toggle = useCallback(
    async (key: keyof EmailPreferences, value: boolean) => {
      if (!prefs || !session?.token) return;
      const optimistic = { ...prefs, [key]: value };
      setPrefs(optimistic);
      setSaveState("saving");
      try {
        const updated = await updateEmailPreferences({ [key]: value }, session.token);
        setPrefs(updated);
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
      } catch {
        setPrefs(prefs);
        setSaveState("error");
        setTimeout(() => setSaveState("idle"), 3000);
      }
    },
    [prefs, session?.token],
  );

  const handleExport = useCallback(async () => {
    if (!journey?.id || !session?.token) return;
    setExportState("loading");
    try {
      await requestDataExport(journey.id, session.token);
      setExportState("sent");
    } catch {
      setExportState("error");
      setTimeout(() => setExportState("idle"), 3000);
    }
  }, [journey?.id, session?.token]);

  const openDeleteConfirm = useCallback(() => {
    setDeleteState("confirm");
    setDeletePassword("");
    setDeleteError(null);
    setTimeout(() => passwordInputRef.current?.focus(), 100);
  }, []);

  const cancelDelete = useCallback(() => {
    setDeleteState("idle");
    setDeletePassword("");
    setDeleteError(null);
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    if (!session?.token || !deletePassword) return;
    setDeleteState("deleting");
    setDeleteError(null);
    try {
      await deleteAccount(deletePassword, session.token);
      clearSession();
      router.push("/login?deleted=1");
    } catch (err) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String(err.message)
          : "Er ging iets mis. Controleer je wachtwoord en probeer opnieuw.";
      setDeleteError(msg);
      setDeleteState("confirm");
    }
  }, [session?.token, deletePassword, clearSession, router]);

  const disabled = prefs?.unsubscribedAll ?? false;

  return (
    <AppShell title="Instellingen" activeHref="/instellingen">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Account section */}
        <section>
          <h2 className="text-xl font-serif font-semibold mb-1" style={{ color: "#2C2416" }}>
            Account
          </h2>
          <p className="text-sm mb-4" style={{ color: "#6B6456" }}>
            {session?.user?.email}
          </p>
          <div
            className="rounded-2xl overflow-hidden divide-y"
            style={{ background: "#FFFFFF", border: "1px solid #E9E4DB" }}
          >
            <div className="px-6 py-4 flex justify-between items-center">
              <div>
                <p className="font-medium" style={{ color: "#2C2416" }}>Naam</p>
                <p className="text-sm" style={{ color: "#6B6456" }}>{session?.user?.displayName}</p>
              </div>
            </div>
            <div className="px-6 py-4 flex justify-between items-center">
              <div>
                <p className="font-medium" style={{ color: "#2C2416" }}>Pakket</p>
                <p className="text-sm" style={{ color: "#6B6456" }}>
                  {session?.user?.packageTier === "NONE" || !session?.user?.packageTier
                    ? "Gratis"
                    : session.user.packageTier}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Email preferences */}
        <section>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-serif font-semibold" style={{ color: "#2C2416" }}>
              E-mailvoorkeuren
            </h2>
            {saveState === "saving" && (
              <span className="text-sm" style={{ color: "#6B6456" }}>Opslaan…</span>
            )}
            {saveState === "saved" && (
              <span className="text-sm" style={{ color: "#22C55E" }}>✓ Opgeslagen</span>
            )}
            {saveState === "error" && (
              <span className="text-sm" style={{ color: "#EF4444" }}>Fout bij opslaan</span>
            )}
          </div>
          <p className="text-sm mb-4" style={{ color: "#6B6456" }}>
            Kies welke e-mails je van ons wilt ontvangen.
          </p>

          {!prefs ? (
            <div className="rounded-2xl p-6 animate-pulse" style={{ background: "#FFFFFF", border: "1px solid #E9E4DB" }}>
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ) : (
            <div
              className="rounded-2xl overflow-hidden divide-y px-6"
              style={{ background: "#FFFFFF", border: "1px solid #E9E4DB" }}
            >
              <Toggle
                label="Wekelijkse vraag"
                description="Elke maandag een persoonlijke interviewvraag in je inbox."
                checked={prefs.weeklyQuestionEmails && !prefs.unsubscribedAll}
                disabled={disabled}
                onChange={(v) => toggle("weeklyQuestionEmails", v)}
              />
              <Toggle
                label="Herinneringen bij inactiviteit"
                description="We sturen een zachte herinnering als je langer dan 7 dagen niets hebt verteld."
                checked={prefs.inactivityReminders && !prefs.unsubscribedAll}
                disabled={disabled}
                onChange={(v) => toggle("inactivityReminders", v)}
              />
              <Toggle
                label="Seizoensgebonden e-mails"
                description="Bijzondere vragen op Moederdag, Kerst en andere momenten."
                checked={prefs.seasonalEmails && !prefs.unsubscribedAll}
                disabled={disabled}
                onChange={(v) => toggle("seasonalEmails", v)}
              />
              <Toggle
                label="Familie-notificaties"
                description="Je familieleden horen wanneer je een nieuw verhaalfragment hebt toegevoegd."
                checked={prefs.familyNotifications && !prefs.unsubscribedAll}
                disabled={disabled}
                onChange={(v) => toggle("familyNotifications", v)}
              />
              <Toggle
                label="Voortgangs- en welkomst-e-mails"
                description="E-mails bij het voltooien van hoofdstukken en mijlpalen."
                checked={(prefs.chapterEmails || prefs.milestoneEmails) && !prefs.unsubscribedAll}
                disabled={disabled}
                onChange={(v) => { void toggle("chapterEmails", v); void toggle("milestoneEmails", v); }}
              />
              <div className="py-4">
                <Toggle
                  label="Alle e-mails uitschakelen"
                  description="Je ontvangt geen e-mails meer van Bewaardvoorjou."
                  checked={prefs.unsubscribedAll}
                  disabled={false}
                  onChange={(v) => toggle("unsubscribedAll", v)}
                />
              </div>
            </div>
          )}
        </section>

        {/* Backup */}
        {session?.token && journey?.id && (
          <BackupSection token={session.token} journeyId={journey.id} />
        )}

        {/* Data export */}
        <section>
          <h2 className="text-xl font-serif font-semibold mb-1" style={{ color: "#2C2416" }}>
            Mijn gegevens downloaden
          </h2>
          <p className="text-sm mb-4" style={{ color: "#6B6456" }}>
            Exporteer al je verhalen, transcripties en opnames als ZIP-bestand. Je ontvangt een download-link per e-mail.
          </p>
          <div
            className="rounded-2xl p-6"
            style={{ background: "#FFFFFF", border: "1px solid #E9E4DB" }}
          >
            {exportState === "sent" ? (
              <div className="text-center py-2">
                <div className="text-4xl mb-3">📬</div>
                <p className="font-medium" style={{ color: "#2C2416" }}>
                  Je download-link is onderweg!
                </p>
                <p className="text-sm mt-1" style={{ color: "#6B6456" }}>
                  Controleer je inbox — de link is 24 uur geldig.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm mb-4" style={{ color: "#4A4239" }}>
                  Het exportbestand bevat:
                </p>
                <ul className="text-sm space-y-1 mb-6" style={{ color: "#4A4239" }}>
                  <li>✅ Transcripties van alle verhalen</li>
                  <li>✅ Metadata en tijdlijn</li>
                  <li>✅ Alle notities</li>
                  <li>✅ Overzicht van opnames</li>
                </ul>
                <button
                  onClick={handleExport}
                  disabled={exportState === "loading" || !journey?.id}
                  className="w-full rounded-xl py-3 font-semibold text-white transition-opacity disabled:opacity-50"
                  style={{ background: "#F97316" }}
                >
                  {exportState === "loading" ? "Bezig met voorbereiden…" : "⬇️ Exporteer mijn verhalen"}
                </button>
                {exportState === "error" && (
                  <p className="text-sm mt-2 text-center" style={{ color: "#EF4444" }}>
                    Er ging iets mis. Probeer het later opnieuw.
                  </p>
                )}
              </>
            )}
          </div>
        </section>

        {/* Account verwijderen (AVG Art. 17) */}
        <section>
          <h2 className="text-xl font-serif font-semibold mb-1" style={{ color: "#7F1D1D" }}>
            Account verwijderen
          </h2>
          <p className="text-sm mb-4" style={{ color: "#6B6456" }}>
            Dit verwijdert je account en alle bijbehorende gegevens permanent. Deze actie kan niet ongedaan worden gemaakt.
          </p>

          <div
            className="rounded-2xl p-6"
            style={{ background: "#FFFFFF", border: "1px solid #FECACA" }}
          >
            {deleteState === "idle" && (
              <button
                onClick={openDeleteConfirm}
                className="w-full rounded-xl py-3 font-semibold text-white transition-opacity"
                style={{ background: "#DC2626" }}
              >
                Account permanent verwijderen
              </button>
            )}

            {(deleteState === "confirm" || deleteState === "deleting") && (
              <div className="space-y-4">
                <div
                  className="rounded-xl p-4 text-sm"
                  style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#7F1D1D" }}
                >
                  <p className="font-semibold mb-1">Weet je het zeker?</p>
                  <p>
                    Al je verhalen, opnames, transcripties en notities worden permanent verwijderd.
                    Facturen worden bewaard vanwege de wettelijke bewaarplicht.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#2C2416" }}>
                    Bevestig met je wachtwoord
                  </label>
                  <input
                    ref={passwordInputRef}
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Jouw wachtwoord"
                    autoComplete="current-password"
                    disabled={deleteState === "deleting"}
                    className="w-full rounded-xl border px-4 py-3 text-sm disabled:opacity-50"
                    style={{ borderColor: "#FECACA", outline: "none" }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && deletePassword) void handleDeleteAccount();
                    }}
                  />
                </div>

                {deleteError && (
                  <p className="text-sm" style={{ color: "#DC2626" }}>{deleteError}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={cancelDelete}
                    disabled={deleteState === "deleting"}
                    className="flex-1 rounded-xl py-3 font-semibold text-sm transition-opacity disabled:opacity-40"
                    style={{ background: "#F5F5F4", color: "#2C2416" }}
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteState === "deleting" || !deletePassword}
                    className="flex-1 rounded-xl py-3 font-semibold text-sm text-white transition-opacity disabled:opacity-40"
                    style={{ background: "#DC2626" }}
                  >
                    {deleteState === "deleting" ? "Verwijderen…" : "Ja, verwijder mijn account"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>
    </AppShell>
  );
}

export default function InstellingenPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
