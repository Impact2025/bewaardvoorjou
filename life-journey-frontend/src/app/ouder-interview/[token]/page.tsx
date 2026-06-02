"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { CheckCircle, Loader2, Heart } from "lucide-react";
import { getPublicInterview, submitAnswers, type PublicInterview, type AnswerItem } from "@/lib/parent-interview-client";

type PageState = "loading" | "ready" | "submitting" | "done" | "error" | "already_done";

export default function OuderInterviewPage() {
  const params = useParams();
  const token = typeof params?.token === "string" ? params.token : "";

  const [pageState, setPageState] = useState<PageState>("loading");
  const [interview, setInterview] = useState<PublicInterview | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    getPublicInterview(token)
      .then(data => {
        setInterview(data);
        if (data.is_completed) {
          setPageState("already_done");
        } else {
          const initial: Record<string, string> = {};
          data.questions.forEach(q => { initial[q.id] = ""; });
          setAnswers(initial);
          setPageState("ready");
        }
      })
      .catch(() => {
        setErrorMessage("Deze interviewlink bestaat niet of is verlopen.");
        setPageState("error");
      });
  }, [token]);

  const answeredCount = Object.values(answers).filter(a => a.trim()).length;
  const totalQuestions = interview?.questions.length ?? 0;
  const canSubmit = answeredCount > 0;

  const handleSubmit = useCallback(async () => {
    if (!token || !interview) return;
    setPageState("submitting");

    const payload: AnswerItem[] = Object.entries(answers)
      .filter(([, text]) => text.trim())
      .map(([question_id, answer_text]) => ({ question_id, answer_text: answer_text.trim() }));

    try {
      await submitAnswers(token, payload);
      setPageState("done");
    } catch {
      setErrorMessage("Er ging iets mis. Probeer het opnieuw.");
      setPageState("ready");
    }
  }, [token, interview, answers]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (pageState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF7F2" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#FF8C42" }} />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (pageState === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FAF7F2" }}>
        <div className="max-w-md text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="font-serif text-2xl font-semibold mb-2" style={{ color: "#2C2416" }}>Link niet gevonden</h1>
          <p className="text-sm" style={{ color: "#6B6456" }}>{errorMessage}</p>
        </div>
      </div>
    );
  }

  // ── Already done ─────────────────────────────────────────────────────────────
  if (pageState === "already_done") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FAF7F2" }}>
        <div className="max-w-md text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4" style={{ color: "#22C55E" }} />
          <h1 className="font-serif text-2xl font-semibold mb-2" style={{ color: "#2C2416" }}>
            Je antwoorden zijn al opgeslagen
          </h1>
          <p className="text-sm" style={{ color: "#6B6456" }}>
            Bedankt! {interview?.journey_owner_name} kan jouw verhaal nu lezen en bewaren voor altijd.
          </p>
        </div>
      </div>
    );
  }

  // ── Done ─────────────────────────────────────────────────────────────────────
  if (pageState === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FAF7F2" }}>
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="font-serif text-2xl font-semibold mb-3" style={{ color: "#2C2416" }}>
            Dankjewel, {interview?.interviewee_name}!
          </h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "#6B6456" }}>
            Je antwoorden zijn veilig opgeslagen. {interview?.journey_owner_name} zal ze
            koesteren — jij hebt zojuist een stukje familiegeschiedenis bewaard voor altijd.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: "#FF8C42" }}>
            <Heart className="h-4 w-4" />
            <span>Bewaard voor de volgende generaties</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Ready ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
      {/* Top bar */}
      <div className="border-b bg-white px-4 py-3 flex items-center gap-3">
        <Image
          src="/Logo_Bewaardvoorjou.png"
          alt="Bewaard voor jou"
          width={32}
          height={32}
          className="w-8 h-8"
        />
        <span className="text-sm font-medium" style={{ color: "#2C2416" }}>BewaardVoorJou</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Intro card */}
        <div className="bg-white rounded-2xl border border-[#E9E4DB] overflow-hidden">
          <div className="h-1 bg-[#FF8C42]" />
          <div className="p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#FF8C42" }}>
              Persoonlijk interview
            </p>
            <h1 className="font-serif text-2xl font-semibold mb-2" style={{ color: "#2C2416" }}>
              Hallo {interview?.interviewee_name}!
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "#6B6456" }}>
              <strong style={{ color: "#2C2416" }}>{interview?.journey_owner_name}</strong> heeft dit
              interview voor jou aangemaakt via BewaardVoorJou — een platform om levensverhalen te bewaren
              voor toekomstige generaties.
            </p>
            {interview?.personal_message && (
              <blockquote
                className="mt-4 pl-4 border-l-2 text-sm italic leading-relaxed"
                style={{ borderColor: "#FF8C42", color: "#4A4239" }}
              >
                {interview.personal_message}
              </blockquote>
            )}
            <p className="mt-4 text-xs" style={{ color: "#999" }}>
              Beantwoord zoveel of zo weinig vragen als je wilt. Er is geen minimum.
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: "#6B6456" }}>{answeredCount} van {totalQuestions} beantwoord</span>
          <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: "#E9E4DB" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${totalQuestions ? (answeredCount / totalQuestions) * 100 : 0}%`, background: "#FF8C42" }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-5">
          {interview?.questions.map((q, i) => (
            <div key={q.id} className="bg-white rounded-2xl border border-[#E9E4DB] p-5 sm:p-6">
              <label htmlFor={`q-${q.id}`} className="block mb-3">
                <span
                  className="inline-block w-6 h-6 rounded-full text-xs font-bold text-center leading-6 mr-2"
                  style={{ background: "#FFF0E6", color: "#FF8C42" }}
                >
                  {i + 1}
                </span>
                <span className="font-medium" style={{ color: "#2C2416" }}>{q.text}</span>
              </label>
              <textarea
                id={`q-${q.id}`}
                value={answers[q.id] ?? ""}
                onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                placeholder="Schrijf hier je antwoord…"
                rows={4}
                className="w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 transition-shadow"
                style={{ borderColor: "#E9E4DB", background: "#FAFAF9", color: "#2C2416" }}
              />
            </div>
          ))}
        </div>

        {/* Submit */}
        {errorMessage && (
          <p className="text-sm text-center" style={{ color: "#DC2626" }}>{errorMessage}</p>
        )}
        <div className="pb-10">
          <button
            onClick={() => void handleSubmit()}
            disabled={!canSubmit || pageState === "submitting"}
            className="w-full rounded-2xl py-4 font-semibold text-white text-base transition-opacity disabled:opacity-40"
            style={{ background: "#FF8C42" }}
          >
            {pageState === "submitting" ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Opslaan…
              </span>
            ) : (
              "Mijn antwoorden insturen"
            )}
          </button>
          <p className="text-xs text-center mt-3" style={{ color: "#999" }}>
            Je antwoorden worden veilig bewaard en alleen gedeeld met {interview?.journey_owner_name}.
          </p>
        </div>
      </div>
    </div>
  );
}
