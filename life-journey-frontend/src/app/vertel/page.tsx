"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StorytellerView } from "@/components/storyteller/StorytellerView";
import { getNextQuestion } from "@/lib/storyteller-client";
import type { NextQuestion } from "@/lib/storyteller-client";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/store/auth-context";

type PageState = "loading" | "ready" | "done" | "error";

function VertelContent() {
  const router = useRouter();
  const { session } = useAuth();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [question, setQuestion] = useState<NextQuestion | null>(null);

  const loadNextQuestion = useCallback(async () => {
    if (!session?.token || !session?.primaryJourneyId) {
      router.push("/login");
      return;
    }
    setPageState("loading");
    try {
      const q = await getNextQuestion(session.primaryJourneyId, session.token);
      if (q) {
        setQuestion(q);
        setPageState("ready");
      } else {
        setPageState("done");
      }
    } catch {
      setPageState("error");
    }
  }, [session, router]);

  useEffect(() => {
    void loadNextQuestion();
  }, [loadNextQuestion]);

  const handleNext = useCallback(() => {
    void loadNextQuestion();
  }, [loadNextQuestion]);

  const handleClose = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  if (pageState === "loading") {
    return (
      <div
        data-storyteller-mode="true"
        className="flex min-h-screen items-center justify-center"
        style={{ background: "#FAF7F2" }}
      >
        <div className="text-center">
          <div className="text-6xl mb-6 animate-pulse">✨</div>
          <p className="font-serif text-2xl" style={{ color: "#2C2416" }}>
            Even laden…
          </p>
        </div>
      </div>
    );
  }

  if (pageState === "done") {
    return (
      <div
        data-storyteller-mode="true"
        className="flex min-h-screen items-center justify-center px-6"
        style={{ background: "#FAF7F2" }}
      >
        <div className="w-full max-w-lg text-center">
          <div className="text-7xl mb-6">🎉</div>
          <h2 className="font-serif text-3xl font-semibold mb-4" style={{ color: "#2C2416" }}>
            Alle vragen beantwoord!
          </h2>
          <p className="text-xl mb-10" style={{ color: "#4A4239" }}>
            Wat een prestatie — je verhaal is compleet.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-2xl font-semibold text-white"
            style={{ background: "#F97316", fontSize: "20px", padding: "20px 32px" }}
          >
            Naar mijn verhalen
          </button>
        </div>
      </div>
    );
  }

  if (pageState === "error" || !question) {
    return (
      <div
        data-storyteller-mode="true"
        className="flex min-h-screen items-center justify-center px-6"
        style={{ background: "#FAF7F2" }}
      >
        <div className="w-full max-w-lg text-center">
          <div className="text-7xl mb-6">😕</div>
          <p className="font-serif text-2xl mb-8" style={{ color: "#2C2416" }}>
            Kon de volgende vraag niet laden.
          </p>
          <button
            onClick={loadNextQuestion}
            className="w-full rounded-2xl font-semibold text-white"
            style={{ background: "#F97316", fontSize: "20px", padding: "20px 32px" }}
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  return (
    <StorytellerView
      question={question}
      journeyId={session!.primaryJourneyId!}
      token={session!.token}
      familyMemberName={session?.user?.displayName}
      onNext={handleNext}
      onClose={handleClose}
    />
  );
}

export default function VertelPage() {
  return (
    <ProtectedRoute>
      <VertelContent />
    </ProtectedRoute>
  );
}
