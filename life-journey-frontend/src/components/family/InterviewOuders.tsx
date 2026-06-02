"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/store/auth-context";
import { cn } from "@/lib/utils";
import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  Plus,
  Trash2,
  X,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  listInterviews,
  createInterview,
  deleteInterview,
  getAnswers,
  type Interview,
  type AnswerResponse,
} from "@/lib/parent-interview-client";

interface InterviewOudersProps {
  journeyId: string;
  className?: string;
}

export function InterviewOuders({ journeyId, className }: InterviewOudersProps) {
  const { session } = useAuth();
  const token = session?.token ?? "";

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [answersCache, setAnswersCache] = useState<Record<string, AnswerResponse[]>>({});
  const [loadingAnswers, setLoadingAnswers] = useState<string | null>(null);

  // Create form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    listInterviews(journeyId, token)
      .then(setInterviews)
      .catch(() => setInterviews([]))
      .finally(() => setIsLoading(false));
  }, [journeyId, token]);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || !token) return;
    setIsCreating(true);
    setCreateError(null);
    try {
      const interview = await createInterview(
        journeyId,
        {
          interviewee_name: name.trim(),
          interviewee_email: email.trim() || undefined,
          personal_message: message.trim() || undefined,
        },
        token,
      );
      setInterviews(prev => [interview, ...prev]);
      setName("");
      setEmail("");
      setMessage("");
      setShowCreate(false);
      setExpandedId(interview.id);
    } catch {
      setCreateError("Aanmaken mislukt. Probeer het opnieuw.");
    } finally {
      setIsCreating(false);
    }
  }, [name, email, message, journeyId, token]);

  const handleDelete = useCallback(async (interview: Interview) => {
    if (!token) return;
    await deleteInterview(journeyId, interview.id, token);
    setInterviews(prev => prev.filter(i => i.id !== interview.id));
    if (expandedId === interview.id) setExpandedId(null);
  }, [journeyId, token, expandedId]);

  const handleExpand = useCallback(async (interview: Interview) => {
    const isOpening = expandedId !== interview.id;
    setExpandedId(isOpening ? interview.id : null);

    if (isOpening && interview.is_completed && !answersCache[interview.id]) {
      setLoadingAnswers(interview.id);
      try {
        const answers = await getAnswers(journeyId, interview.id, token);
        setAnswersCache(prev => ({ ...prev, [interview.id]: answers }));
      } finally {
        setLoadingAnswers(null);
      }
    }
  }, [expandedId, answersCache, journeyId, token]);

  const handleCopy = useCallback((interview: Interview) => {
    void navigator.clipboard.writeText(interview.share_url);
    setCopiedId(interview.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#FF8C42" }} />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: "#2C2416" }}>Interview je Ouders</h3>
          <p className="text-sm" style={{ color: "#6B6456" }}>
            Stuur een persoonlijke vragenlijst — zij antwoorden zonder account.
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-[#FF8C42] hover:bg-[#F47B3B] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nieuw interview
        </Button>
      </div>

      {/* How it works (only when empty) */}
      {interviews.length === 0 && !showCreate && (
        <div className="rounded-xl border border-[#E9E4DB] overflow-hidden">
          <div className="h-1 bg-[#FF8C42]" />
          <div className="p-6">
            <p className="font-medium mb-4" style={{ color: "#2C2416" }}>Zo werkt het</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { step: "1", title: "Maak een interview aan", desc: "Vul de naam van je ouder/familielid in. Wij genereren meteen 7 persoonlijke vragen." },
                { step: "2", title: "Deel de link", desc: "Kopieer de unieke link en stuur die via WhatsApp, e-mail of SMS. Geen account nodig." },
                { step: "3", title: "Lees de antwoorden", desc: "Zodra je ouder de vragen heeft beantwoord, zie jij de antwoorden hier terug." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-3">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5"
                    style={{ background: "#FFF0E6", color: "#FF8C42" }}
                  >
                    {step}
                  </span>
                  <div>
                    <p className="font-medium text-sm" style={{ color: "#2C2416" }}>{title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#6B6456" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interview list */}
      <div className="space-y-3">
        {interviews.map(interview => (
          <div
            key={interview.id}
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: interview.is_completed ? "#BBF7D0" : "#E9E4DB", background: "#FFFFFF" }}
          >
            {/* Header row */}
            <div className="px-5 py-4 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                style={{ background: interview.is_completed ? "#F0FDF4" : "#FFF0E6", color: interview.is_completed ? "#15803D" : "#FF8C42" }}
              >
                {interview.interviewee_name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate" style={{ color: "#2C2416" }}>
                    {interview.interviewee_name}
                  </p>
                  {interview.is_completed ? (
                    <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "#F0FDF4", color: "#15803D" }}>
                      <Check className="h-3 w-3" /> Beantwoord
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "#FFF7ED", color: "#C2410C" }}>
                      <Clock className="h-3 w-3" /> Wacht op antwoord
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: "#999" }}>
                  Aangemaakt {new Date(interview.created_at).toLocaleDateString("nl-NL")}
                  {interview.answer_count > 0 && ` · ${interview.answer_count} antwoord${interview.answer_count !== 1 ? "en" : ""}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopy(interview)}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors"
                  style={{ borderColor: "#E9E4DB", color: copiedId === interview.id ? "#15803D" : "#6B6456" }}
                >
                  {copiedId === interview.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedId === interview.id ? "Gekopieerd" : "Kopieer link"}
                </button>
                <a
                  href={interview.share_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg border transition-colors"
                  style={{ borderColor: "#E9E4DB", color: "#6B6456" }}
                  title="Open interviewpagina"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => void handleExpand(interview)}
                  className="p-1.5 rounded-lg border transition-colors"
                  style={{ borderColor: "#E9E4DB", color: "#6B6456" }}
                >
                  {expandedId === interview.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => void handleDelete(interview)}
                  className="p-1.5 rounded-lg border transition-colors"
                  style={{ borderColor: "#E9E4DB", color: "#FECACA" }}
                  title="Verwijder interview"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Expanded: questions + answers */}
            {expandedId === interview.id && (
              <div className="border-t px-5 py-5 space-y-5" style={{ borderColor: "#F0EDE8", background: "#FAFAF9" }}>
                {loadingAnswers === interview.id ? (
                  <div className="flex items-center gap-2 py-4 justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: "#FF8C42" }} />
                    <span className="text-sm" style={{ color: "#6B6456" }}>Antwoorden laden…</span>
                  </div>
                ) : interview.is_completed ? (
                  /* Completed: show questions with answers */
                  (() => {
                    const answers = answersCache[interview.id] ?? [];
                    const answerMap = Object.fromEntries(answers.map(a => [a.question_id, a]));
                    return interview.questions.map((q, i) => {
                      const answer = answerMap[q.id];
                      return (
                        <div key={q.id} className="space-y-2">
                          <p className="text-sm font-semibold leading-snug" style={{ color: "#2C2416" }}>
                            <span style={{ color: "#FF8C42" }}>{i + 1}.&nbsp;</span>{q.text}
                          </p>
                          {answer ? (
                            <div
                              className="rounded-xl px-4 py-3 text-sm leading-relaxed"
                              style={{ background: "#FFF8F3", border: "1px solid #FFE4CC", color: "#4A4239" }}
                            >
                              {answer.answer_text}
                            </div>
                          ) : (
                            <p className="text-xs italic pl-1" style={{ color: "#BBBBBB" }}>
                              — niet beantwoord
                            </p>
                          )}
                        </div>
                      );
                    });
                  })()
                ) : (
                  /* Not yet completed: show pending questions */
                  interview.questions.map((q, i) => (
                    <div key={q.id} className="space-y-1">
                      <p className="text-sm font-medium leading-snug" style={{ color: "#2C2416" }}>
                        <span style={{ color: "#FF8C42" }}>{i + 1}.&nbsp;</span>{q.text}
                      </p>
                      <p className="text-xs italic pl-1" style={{ color: "#BBBBBB" }}>Wacht op antwoord…</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif font-semibold text-lg" style={{ color: "#2C2416" }}>
                  Nieuw ouder-interview
                </h3>
                <p className="text-sm" style={{ color: "#6B6456" }}>
                  Wij genereren 7 persoonlijke vragen via AI.
                </p>
              </div>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#2C2416" }}>
                  Naam van je ouder / familielid <span className="text-red-400">*</span>
                </label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Bijv. Mama, Opa Jan, Tante Riet"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#2C2416" }}>
                  E-mailadres <span className="text-slate-400 font-normal">(optioneel — voor bevestiging)</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="mama@familie.nl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#2C2416" }}>
                  Persoonlijk berichtje <span className="text-slate-400 font-normal">(optioneel)</span>
                </label>
                <Textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Bijv. Lieve mama, ik bewaar dit voor de kinderen. Neem de tijd!"
                  rows={3}
                />
              </div>

              {createError && (
                <p className="text-sm" style={{ color: "#DC2626" }}>{createError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowCreate(false)}
                  disabled={isCreating}
                >
                  Annuleren
                </Button>
                <Button
                  className="flex-1 bg-[#FF8C42] hover:bg-[#F47B3B] text-white"
                  onClick={() => void handleCreate()}
                  disabled={!name.trim() || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Vragen genereren…
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Interview aanmaken
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewOuders;
