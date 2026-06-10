"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Heart,
  BookOpen,
  RefreshCw,
  Clock,
  Shield,
  UserCircle2,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────────────────────────

type AccessLevel = "full" | "selected" | "highlights" | "none";

interface InvitePreview {
  inviter_name: string;
  invitee_name: string;
  journey_title: string;
  access_level: AccessLevel;
  expires_at: string;
}

type ErrorCode =
  | "network"
  | "expired"
  | "already_accepted"
  | "not_found"
  | "rate_limited"
  | "unknown";

type PageState =
  | { type: "loading" }
  | { type: "preview"; data: InvitePreview }
  | { type: "accepting" }
  | { type: "success"; inviter_name: string; journey_title: string; requires_login: boolean; login_url: string | null }
  | { type: "declined"; inviter_name: string }
  | { type: "error"; code: ErrorCode };

// ── Constants ──────────────────────────────────────────────────────────────────

const ACCESS_CONFIG: Record<AccessLevel, { label: string; description: string; icon: string }> = {
  full: { label: "Volledige toegang", description: "Je kunt alle herinneringen en hoofdstukken lezen", icon: "🔓" },
  selected: { label: "Geselecteerde hoofdstukken", description: "Je hebt toegang tot specifieke gedeelten", icon: "📖" },
  highlights: { label: "Hoogtepunten", description: "Je ziet de mooiste en meest bijzondere momenten", icon: "✨" },
  none: { label: "Leestoegang", description: "Je kunt meekijken als gast", icon: "👁️" },
};

const ERROR_CONFIG: Record<ErrorCode, {
  title: string;
  body: string;
  hint: string;
  canRetry: boolean;
  showLogin: boolean;
}> = {
  network: {
    title: "Verbindingsprobleem",
    body: "We kunnen de server niet bereiken.",
    hint: "Controleer je internetverbinding en probeer het opnieuw.",
    canRetry: true,
    showLogin: false,
  },
  expired: {
    title: "Link verlopen",
    body: "Deze uitnodigingslink is niet meer geldig.",
    hint: "Vraag de persoon die jou uitnodigde om een nieuwe link te sturen.",
    canRetry: false,
    showLogin: false,
  },
  already_accepted: {
    title: "Al geaccepteerd",
    body: "Deze uitnodiging is al eerder gebruikt.",
    hint: "Je hebt al een account? Log in om de herinneringen te bekijken.",
    canRetry: false,
    showLogin: true,
  },
  not_found: {
    title: "Link niet gevonden",
    body: "Deze uitnodigingslink bestaat niet.",
    hint: "Controleer of je de juiste link hebt geopend, of vraag een nieuwe aan.",
    canRetry: false,
    showLogin: false,
  },
  rate_limited: {
    title: "Even wachten",
    body: "Je hebt het te vaak geprobeerd.",
    hint: "Wacht een minuut en probeer het daarna opnieuw.",
    canRetry: true,
    showLogin: false,
  },
  unknown: {
    title: "Er ging iets mis",
    body: "Er is een onverwachte fout opgetreden.",
    hint: "Probeer het later opnieuw of vraag een nieuwe uitnodiging aan.",
    canRetry: true,
    showLogin: false,
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function daysUntil(isoDate: string): number {
  const diff = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function errorCodeFromResponse(status: number, detail: string): ErrorCode {
  if (status === 404) return "not_found";
  if (status === 410) return "expired";
  if (status === 409) return "already_accepted";
  if (status === 429) return "rate_limited";
  const d = detail.toLowerCase();
  if (d.includes("verlopen")) return "expired";
  if (d.includes("geaccepteerd")) return "already_accepted";
  if (d.includes("gevonden")) return "not_found";
  return "unknown";
}

// ── Sub-states ─────────────────────────────────────────────────────────────────

function LoadingState({ label }: { label: string }) {
  return (
    <div className="space-y-4 py-4">
      <Loader2 className="h-10 w-10 text-[#FF8C42] animate-spin mx-auto" />
      <p className="text-[#777777] text-sm">{label}</p>
    </div>
  );
}

function PreviewState({
  data,
  onAccept,
  onDecline,
}: {
  data: InvitePreview;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const days = daysUntil(data.expires_at);
  const access = ACCESS_CONFIG[data.access_level];

  return (
    <div className="space-y-6 text-left">
      <div className="text-center space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#FF8C42]">Uitnodiging</p>
        <h1 className="font-serif text-2xl font-semibold text-[#333333]">
          Je bent uitgenodigd!
        </h1>
        <p className="text-[#777777] text-sm">
          <span className="font-medium text-[#444444]">{data.inviter_name}</span> wil graag herinneringen delen met jou
          {data.invitee_name ? `, ${data.invitee_name}` : ""}.
        </p>
      </div>

      {/* Journey info */}
      <div className="rounded-xl border border-[#E6E2DD] bg-[#FAF7F2] p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-lg border border-[#E6E2DD] shrink-0">
            <BookOpen className="h-4 w-4 text-[#FF8C42]" />
          </div>
          <div>
            <p className="text-xs text-[#999999] uppercase tracking-wide font-medium">Levensverhaal</p>
            <p className="font-medium text-[#333333] text-sm leading-snug">{data.journey_title}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-lg border border-[#E6E2DD] shrink-0">
            <Shield className="h-4 w-4 text-[#FF8C42]" />
          </div>
          <div>
            <p className="text-xs text-[#999999] uppercase tracking-wide font-medium">Toegangsniveau</p>
            <p className="font-medium text-[#333333] text-sm">{access.icon} {access.label}</p>
            <p className="text-xs text-[#999999] mt-0.5">{access.description}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-lg border border-[#E6E2DD] shrink-0">
            <UserCircle2 className="h-4 w-4 text-[#FF8C42]" />
          </div>
          <div>
            <p className="text-xs text-[#999999] uppercase tracking-wide font-medium">Uitgenodigd door</p>
            <p className="font-medium text-[#333333] text-sm">{data.inviter_name}</p>
          </div>
        </div>
      </div>

      {/* Expiry */}
      {days <= 3 && days > 0 && (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <Clock className="h-4 w-4 shrink-0" />
          <p className="text-xs font-medium">
            Let op: deze link verloopt over {days} {days === 1 ? "dag" : "dagen"}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-1">
        <Button
          className="w-full bg-[#FF8C42] hover:bg-[#e67a35] text-white font-medium shadow-sm transition-all active:scale-[0.98]"
          onClick={onAccept}
        >
          Uitnodiging accepteren
        </Button>
        <button
          onClick={onDecline}
          className="w-full text-sm text-[#999999] hover:text-[#666666] transition-colors py-1.5 flex items-center justify-center gap-1.5"
        >
          <ThumbsDown className="h-3.5 w-3.5" />
          Bedankt, maar ik weiger
        </button>
      </div>

      <p className="text-center text-xs text-[#BBBBBB]">
        Door te accepteren ga je akkoord met onze privacyvoorwaarden.
      </p>
    </div>
  );
}

function SuccessState({
  inviter_name,
  journey_title,
  requires_login,
  login_url,
  onNavigate,
}: {
  inviter_name: string;
  journey_title: string;
  requires_login: boolean;
  login_url: string | null;
  onNavigate: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex justify-center">
        <div className="relative">
          <CheckCircle className="h-14 w-14 text-green-500" />
          <span className="absolute -top-1 -right-1 text-lg">🎉</span>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-2xl font-semibold text-[#333333]">Welkom in de familie!</h1>
        <p className="text-[#555555] text-sm leading-relaxed">
          <span className="font-medium">{inviter_name}</span> heeft je toegang gegeven tot{" "}
          <em className="not-italic font-medium text-[#FF8C42]">{journey_title}</em>.
        </p>
      </div>

      {requires_login ? (
        <div className="space-y-3">
          <div className="bg-[#FAF7F2] border border-[#E6E2DD] rounded-xl p-4 text-sm text-[#555555] leading-relaxed">
            Maak een gratis account aan om de herinneringen te bekijken — het duurt minder dan een minuut.
          </div>
          <Button
            className="w-full bg-[#FF8C42] hover:bg-[#e67a35] text-white font-medium shadow-sm transition-all active:scale-[0.98]"
            onClick={onNavigate}
          >
            Account aanmaken of inloggen
          </Button>
        </div>
      ) : (
        <Button
          className="w-full bg-[#FF8C42] hover:bg-[#e67a35] text-white font-medium shadow-sm transition-all active:scale-[0.98]"
          onClick={onNavigate}
        >
          Naar de familiebibliotheek →
        </Button>
      )}
    </div>
  );
}

function DeclinedState({
  inviter_name,
  onHome,
}: {
  inviter_name: string;
  onHome: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex justify-center">
        <div className="p-3 bg-gray-100 rounded-full">
          <Heart className="h-8 w-8 text-gray-400" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="font-serif text-xl font-semibold text-[#333333]">Begrepen</h1>
        <p className="text-[#777777] text-sm leading-relaxed">
          Je hebt de uitnodiging van <span className="font-medium text-[#555555]">{inviter_name}</span> geweigerd.
          Mocht je van gedachten veranderen, vraag dan een nieuwe link aan.
        </p>
      </div>
      <Button
        variant="secondary"
        className="w-full border-[#E6E2DD] text-[#555555] hover:bg-[#FAF7F2]"
        onClick={onHome}
      >
        Naar de homepage
      </Button>
    </div>
  );
}

function ErrorState({
  code,
  onRetry,
  onHome,
  onLogin,
}: {
  code: ErrorCode;
  onRetry: () => void;
  onHome: () => void;
  onLogin: () => void;
}) {
  const cfg = ERROR_CONFIG[code];

  return (
    <div className="space-y-5">
      <div className="flex justify-center">
        <div className="p-3 bg-red-50 rounded-full">
          <XCircle className="h-10 w-10 text-red-400" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-xl font-semibold text-[#333333]">{cfg.title}</h1>
        <p className="text-[#777777] text-sm">{cfg.body}</p>
        <p className="text-[#AAAAAA] text-xs leading-relaxed">{cfg.hint}</p>
      </div>

      <div className="space-y-2">
        {cfg.canRetry && (
          <Button
            className="w-full bg-[#FF8C42] hover:bg-[#e67a35] text-white font-medium shadow-sm transition-all active:scale-[0.98]"
            onClick={onRetry}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Opnieuw proberen
          </Button>
        )}
        {cfg.showLogin && (
          <Button
            className="w-full bg-[#FF8C42] hover:bg-[#e67a35] text-white font-medium shadow-sm"
            onClick={onLogin}
          >
            Inloggen
          </Button>
        )}
        <Button
          variant="secondary"
          className="w-full border-[#E6E2DD] text-[#555555] hover:bg-[#FAF7F2]"
          onClick={onHome}
        >
          Naar de homepage
        </Button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [state, setState] = useState<PageState>({ type: "loading" });
  const hasFetched = useRef(false);

  const loadPreview = useCallback(async () => {
    setState({ type: "loading" });
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${apiUrl}/family/invite/${token}`);
      const data = await res.json();
      if (!res.ok) {
        setState({ type: "error", code: errorCodeFromResponse(res.status, data.detail ?? "") });
        return;
      }
      setState({ type: "preview", data });
    } catch {
      setState({ type: "error", code: "network" });
    }
  }, [token]);

  useEffect(() => {
    if (!token || hasFetched.current) return;
    hasFetched.current = true;
    loadPreview();
  }, [token, loadPreview]);

  const handleAccept = async () => {
    const preview = state.type === "preview" ? state.data : null;
    setState({ type: "accepting" });
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${apiUrl}/family/accept-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ type: "error", code: errorCodeFromResponse(res.status, data.detail ?? "") });
        return;
      }
      setState({
        type: "success",
        inviter_name: data.inviter_name,
        journey_title: data.journey_title,
        requires_login: data.requires_login,
        login_url: data.login_url,
      });
    } catch {
      // Restore preview if we have it so user can retry
      if (preview) {
        setState({ type: "preview", data: preview });
      } else {
        setState({ type: "error", code: "network" });
      }
    }
  };

  const handleDecline = async () => {
    const inviterName =
      state.type === "preview" ? state.data.inviter_name : "de uitnodiger";
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
      await fetch(`${apiUrl}/family/decline-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    } catch {
      // Best-effort; proceed to declined state regardless
    }
    setState({ type: "declined", inviter_name: inviterName });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E6E2DD] shadow-sm max-w-md w-full overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#FF8C42] to-[#c45a10]" />

        <div className="p-8 text-center space-y-4">
          {/* Branding icon — hidden on preview to save vertical space */}
          {state.type !== "preview" && (
            <div className="flex justify-center">
              <div className="p-3 bg-[#FAF7F2] rounded-full">
                <Heart className="h-8 w-8 text-[#FF8C42]" />
              </div>
            </div>
          )}

          {state.type === "loading" && <LoadingState label="Uitnodiging laden…" />}
          {state.type === "accepting" && <LoadingState label="Bezig met accepteren…" />}

          {state.type === "preview" && (
            <PreviewState
              data={state.data}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          )}

          {state.type === "success" && (
            <SuccessState
              inviter_name={state.inviter_name}
              journey_title={state.journey_title}
              requires_login={state.requires_login}
              login_url={state.login_url}
              onNavigate={() =>
                router.push(
                  state.requires_login
                    ? (state.login_url ?? "/login?redirect=/family")
                    : "/family"
                )
              }
            />
          )}

          {state.type === "declined" && (
            <DeclinedState
              inviter_name={state.inviter_name}
              onHome={() => router.push("/")}
            />
          )}

          {state.type === "error" && (
            <ErrorState
              code={state.code}
              onRetry={loadPreview}
              onHome={() => router.push("/")}
              onLogin={() => router.push("/login")}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#F0EDE8] px-8 py-3 text-center">
          <p className="text-xs text-[#CCCCCC]">BewaardVoorJou — Herinneringen voor altijd</p>
        </div>
      </div>
    </div>
  );
}
