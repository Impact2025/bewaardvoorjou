"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { StorytellerView } from "@/components/storyteller/StorytellerView";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
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
    if (!session?.token) {
      router.push("/login");
      return;
    }
    if (!session?.primaryJourneyId) {
      router.push("/onboarding");
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
        className="flex min-h-screen items-center justify-center pb-20"
        style={{ background: "#FAF7F2" }}
      >
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Loader2 className="h-14 w-14 animate-spin" style={{ color: "#F97316" }} />
          </div>
          <p className="font-serif text-2xl" style={{ color: "#2C2416" }}>
            Even laden…
          </p>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  if (pageState === "done") {
    return (
      <div
        data-storyteller-mode="true"
        className="flex min-h-screen items-center justify-center px-6 pb-20"
        style={{ background: "#FAF7F2" }}
      >
        <div className="w-full max-w-lg text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-20 w-20" style={{ color: "#22C55E" }} />
          </div>
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
        <MobileBottomNav />
      </div>
    );
  }

  if (pageState === "error" || !question) {
    return (
      <div
        data-storyteller-mode="true"
        className="flex min-h-screen items-center justify-center px-6 pb-20"
        style={{ background: "#FAF7F2" }}
      >
        <div className="w-full max-w-lg text-center">
          <div className="flex justify-center mb-6">
            <AlertCircle className="h-20 w-20" style={{ color: "#EF4444" }} />
          </div>
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
        <MobileBottomNav />
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
