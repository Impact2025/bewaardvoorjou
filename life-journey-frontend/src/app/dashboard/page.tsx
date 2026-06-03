"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useConfetti } from "@/components/Confetti";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CHAPTERS } from "@/lib/chapters";
import { cn, formatDate } from "@/lib/utils";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/store/auth-context";
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";
import { OnboardingModal, hasSeenOnboarding } from "@/components/onboarding/onboarding-modal";
import type { ChapterId } from "@/lib/types";
import {
  Play,
  BookOpen,
  Clock,
  Mic,
  TrendingUp,
  Lightbulb,
  Mic2,
  Video,
  FileText,
  ArrowRight,
} from "lucide-react";
import { QuickThoughtFAB } from "@/components/quick-thoughts";
import { MemoryLaneNavigation } from "@/components/MemoryLaneNavigation";

const Timeline = dynamic(
  () => import("@/components/timeline/Timeline").then((mod) => mod.Timeline),
  {
    loading: () => (
      <div className="h-96 rounded-xl bg-[#F5F2ED] animate-pulse" />
    ),
    ssr: false,
  }
);

function DashboardContent() {
  const router = useRouter();
  const { session } = useAuth();
  const { journey, profile, isLoading, error } = useJourneyBootstrap();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (session && !session.primaryJourneyId) {
      router.replace("/onboarding");
    }
  }, [session, router]);
  const [milestonePulse, setMilestonePulse] = useState(false);
  const { triggerConfetti, ConfettiComponent } = useConfetti();

  useEffect(() => {
    if (!hasSeenOnboarding()) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    const completedChapters = journey?.journeyProgress?.completedChapters ?? 0;
    if (completedChapters === 0) return;

    const milestones = [1, 5, 10, 15, 30];
    const lastCelebrated = Number(localStorage.getItem('last_milestone') || '0');

    if (milestones.includes(completedChapters) && completedChapters > lastCelebrated) {
      const duration = completedChapters === 30 ? 6000 : completedChapters >= 10 ? 4000 : 2500;
      const particleCount = completedChapters === 30 ? 80 : completedChapters >= 10 ? 60 : 40;

      triggerConfetti(duration, particleCount);
      setMilestonePulse(true);
      setTimeout(() => setMilestonePulse(false), 2000);
      localStorage.setItem('last_milestone', String(completedChapters));
    }
  }, [journey?.journeyProgress?.completedChapters, triggerConfetti]);

  const handleChapterSelect = (chapterId: ChapterId) => {
    router.push(`/chapter/${chapterId}`);
  };

  if (isLoading && !journey) {
    return (
      <AppShell
        title="Mijn dashboard"
        description="Ontdek wat je al hebt opgebouwd"
        activeHref="/dashboard"
      >
        <DashboardSkeleton />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell
        title="Mijn dashboard"
        description="Ontdek wat je al hebt opgebouwd"
        activeHref="/dashboard"
      >
        <Card className="bg-white border border-[#E6E2DD]">
          <CardHeader>
            <CardTitle>Kon dashboard niet laden</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </AppShell>
    );
  }

  const progressPercent = journey?.journeyProgress?.percentComplete ?? 0;
  const completedChapters = journey?.journeyProgress?.completedChapters ?? 0;
  const totalChapters = journey?.journeyProgress?.totalChapters ?? 30;
  const nextChapter = journey?.journeyProgress?.nextAvailableChapter ?? journey?.activeChapterId;
  const nextChapterTitle = nextChapter
    ? CHAPTERS.find((ch) => ch.id === nextChapter)?.title
    : null;
  const isNewUser = completedChapters === 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = profile?.displayName || 'daar';

    if (completedChapters === 0) {
      return hour < 12
        ? `Goedemorgen ${name}, klaar om te beginnen?`
        : hour < 18
        ? `Goedemiddag ${name}, welkom bij je levensverhaal`
        : `Goedenavond ${name}, tijd voor herinneringen`;
    }

    if (completedChapters === 1) return `Fantastisch ${name}! Je eerste verhaal staat.`;
    if (completedChapters < 10) return `Welkom terug, ${name}`;
    if (completedChapters < 20) return `Je doet het geweldig, ${name}`;
    if (progressPercent >= 80) return `Je bent er bijna, ${name}`;
    return `Hallo ${name}`;
  };

  const getProgressMessage = () => {
    if (completedChapters === 0) return "Elk verhaal begint met één woord. Wat is jouw vroegste herinnering?";
    if (completedChapters === 1) return "Je eerste verhaal staat! Zullen we doorgaan?";
    if (completedChapters === 3) return "3 hoofdstukken! Je bent op weg. Je kleinkinderen zullen dit koesteren.";
    if (completedChapters === 5) return "5 verhalen vol herinneringen. Dit wordt echt mooi.";
    if (completedChapters === 10) return "10 hoofdstukken! Je bouwt aan iets bijzonders hier.";
    if (completedChapters === 15) return "Halverwege! Elke herinnering die je deelt is een cadeau.";
    if (progressPercent === 100) return "Je hebt het gedaan. Je levensverhaal is compleet.";
    return `${completedChapters} hoofdstukken verteld. Blijf zo doorgaan!`;
  };

  return (
    <>
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
      <ConfettiComponent />
      <AppShell
        title={getGreeting()}
        description={`Je levensverhaal · ${completedChapters}/${totalChapters} hoofdstukken voltooid`}
        activeHref="/dashboard"
        onShowHandleiding={() => setShowOnboarding(true)}
      >
        <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
          {/* Mobile-only greeting */}
          <div className="sm:hidden">
            <p className="text-xs font-medium text-[#999]">
              {new Date().getHours() < 12 ? "Goedemorgen" : new Date().getHours() < 18 ? "Goedemiddag" : "Goedenavond"}
            </p>
            <h2 className="text-2xl font-serif font-semibold text-[#333333] leading-tight">
              {profile?.displayName?.split(" ")[0] || "Welkom"}
            </h2>
          </div>

          {/* Progress card */}
          <div className="bg-white rounded-xl border border-[#E6E2DD] overflow-hidden">
            <div className="h-1 bg-[#FF8C42]" />
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#FF8C42] mb-1">
                    Je voortgang
                  </p>
                  <h3 className="font-serif font-semibold text-[#333333] text-xl sm:text-2xl mb-1">
                    {progressPercent === 0
                      ? "Begin je reis"
                      : progressPercent < 50
                      ? "Je bent goed op weg"
                      : progressPercent < 100
                      ? "Bijna daar"
                      : "Voltooid"}
                  </h3>
                  <p className="text-[#555555] text-sm leading-relaxed max-w-md">
                    {getProgressMessage()}
                  </p>
                </div>
                {nextChapter && (
                  <Link
                    href={`/chapter/${nextChapter}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FF8C42] hover:bg-[#F47B3B] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <Play className="h-3.5 w-3.5" />
                    {nextChapterTitle || "Start volgende"}
                  </Link>
                )}
              </div>
              <div className="mt-5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[#999]">Voortgang</span>
                  <span className={cn("text-xs font-bold text-[#FF8C42]", milestonePulse && "heart-pulse inline-block")}>
                    {progressPercent}%
                  </span>
                </div>
                <div className="h-1.5 bg-[#E6E2DD] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF8C42] rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(progressPercent, 2)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* New user: how it works */}
          {isNewUser && (
            <Card className="bg-white border border-[#E6E2DD]">
              <CardHeader>
                <CardTitle className="text-lg font-serif">Zo werkt Bewaard voor jou</CardTitle>
                <CardDescription>
                  In drie stappen leg je jouw levensverhaal vast.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      icon: <Mic2 className="h-5 w-5 text-[#FF8C42]" />,
                      step: "1",
                      title: "Kies een hoofdstuk",
                      desc: "Je begint bij het begin — jouw vroegste herinneringen.",
                    },
                    {
                      icon: <Video className="h-5 w-5 text-[#FF8C42]" />,
                      step: "2",
                      title: "Vertel je verhaal",
                      desc: "Praat, film of schrijf — jij kiest hoe je het liefst vertelt.",
                    },
                    {
                      icon: <FileText className="h-5 w-5 text-[#FF8C42]" />,
                      step: "3",
                      title: "Bewaar voor altijd",
                      desc: "Je verhaal wordt veilig opgeslagen en klaar voor je dierbaren.",
                    },
                  ].map(({ icon, step, title, desc }) => (
                    <div key={step} className="flex flex-col gap-3 p-4 rounded-xl bg-[#FAF7F2] border border-[#E6E2DD]">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#FF8C42]/15 text-[#FF8C42] text-[10px] font-bold flex items-center justify-center shrink-0">
                          {step}
                        </span>
                        {icon}
                      </div>
                      <div>
                        <p className="font-semibold text-[#333333] text-sm">{title}</p>
                        <p className="text-xs text-[#555555] mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {nextChapter && (
                  <div className="mt-5">
                    <Link
                      href={`/chapter/${nextChapter}`}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#FF8C42] hover:bg-[#F47B3B] text-white text-sm font-semibold transition-colors"
                    >
                      <Play className="h-4 w-4" />
                      Begin met mijn eerste verhaal
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Returning user: continue CTA */}
          {!isNewUser && (
            <Link href="/vertel" className="block group">
              <div className="bg-white rounded-xl border border-[#E6E2DD] hover:border-[#FF8C42]/40 hover:shadow-[0_4px_12px_rgba(255,140,66,0.08)] transition-all duration-200 p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FF8C42]/10 flex items-center justify-center shrink-0">
                  <Mic2 className="h-5 w-5 text-[#FF8C42]" />
                </div>
                <div className="flex-1">
                  <p className="font-serif font-semibold text-[#333333] leading-tight">
                    Begin met vertellen
                  </p>
                  <p className="text-[#555555] text-sm mt-0.5">
                    Jouw volgende verhaalfragment wacht
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-[#FF8C42] group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            </Link>
          )}

          {/* Main content grid */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_320px]">
            {/* Timeline */}
            {!isNewUser && (
              <div className="order-2 md:order-1 space-y-6">
                <Card className="bg-white border border-[#E6E2DD]">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-[#333333]">
                        <TrendingUp className="h-4 w-4 text-[#FF8C42]" />
                        Je Levensreis
                      </CardTitle>
                      <CardDescription>
                        Volg je voortgang door alle levensfasen
                      </CardDescription>
                    </div>
                    <Button variant="ghost" asChild className="text-[#555555] hover:text-[#FF8C42]">
                      <Link href="/chapters">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Alle hoofdstukken
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {journey?.id ? (
                      <Timeline
                        journeyId={journey.id}
                        onChapterSelect={handleChapterSelect}
                      />
                    ) : (
                      <p className="text-[#555555] text-center py-8">
                        Nog geen journey gestart
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Sidebar */}
            <div className={`order-1 md:order-2 space-y-4 ${isNewUser ? "md:col-span-2 md:grid md:grid-cols-2 md:gap-4 md:space-y-0" : ""}`}>
              {/* Quick stats */}
              {!isNewUser && (
                <Card className="bg-white border border-[#E6E2DD]">
                  <CardHeader>
                    <CardTitle className="text-sm text-[#333333]">Snel overzicht</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3 sm:block sm:space-y-4">
                      <QuickStat
                        icon={<BookOpen className="h-4 w-4" />}
                        label="Voltooid"
                        value={`${completedChapters}/${totalChapters}`}
                      />
                      <QuickStat
                        icon={<Mic className="h-4 w-4" />}
                        label="Opnames"
                        value={String(journey?.media?.length || 0)}
                      />
                      <QuickStat
                        icon={<Clock className="h-4 w-4" />}
                        label="Bijgewerkt"
                        value={journey ? formatDate(journey.updatedAt) : "-"}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Memory Lane / Quick actions */}
              {!isNewUser ? (
                <Card className="bg-white border border-[#E6E2DD] overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-[#333333]">Memory Lane</CardTitle>
                    <CardDescription>Navigeer door je levensverhaal</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 pb-2">
                    <MemoryLaneNavigation compact />
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white border border-[#E6E2DD]">
                  <CardHeader>
                    <CardTitle className="text-sm text-[#333333]">Snelle acties</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {nextChapter && (
                      <QuickActionButton
                        href={`/chapter/${nextChapter}`}
                        icon={<Play className="h-4 w-4" />}
                        label="Begin met mijn verhaal"
                        primary
                      />
                    )}
                    <QuickActionButton
                      href="/recordings"
                      icon={<Mic className="h-4 w-4" />}
                      label="Mijn opnames"
                    />
                    <QuickActionButton
                      href="/memos"
                      icon={<BookOpen className="h-4 w-4" />}
                      label="Mijn memo's"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Help card */}
              <div className="bg-white rounded-xl border border-[#E6E2DD] p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#FAF7F2] rounded-lg shrink-0">
                    <Lightbulb className="h-4 w-4 text-[#FF8C42]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[#333333] text-sm mb-1">
                      Vragen? Wij helpen je.
                    </h3>
                    <p className="text-xs text-[#555555] mb-3 leading-relaxed">
                      Bekijk een korte uitleg over hoe de app werkt.
                    </p>
                    <button
                      onClick={() => setShowOnboarding(true)}
                      className="text-xs font-semibold text-[#FF8C42] hover:underline"
                    >
                      Uitleg bekijken
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <QuickThoughtFAB
          className="bottom-24 sm:bottom-6"
          onThoughtCreated={(thoughtId) => {
            console.log("Quick thought created:", thoughtId);
          }}
        />
      </AppShell>
    </>
  );
}

interface QuickStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function QuickStat({ icon, label, value }: QuickStatProps) {
  return (
    <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:items-center sm:gap-3 sm:text-left">
      <div className="p-2 rounded-lg bg-[#FAF7F2] text-[#FF8C42] shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-[#999]">{label}</p>
        <p className="text-sm font-semibold text-[#333333] truncate">{value}</p>
      </div>
    </div>
  );
}

interface QuickActionButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}

function QuickActionButton({ href, icon, label, primary }: QuickActionButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
        primary
          ? "bg-[#FF8C42] hover:bg-[#F47B3B] text-white"
          : "text-[#555555] hover:bg-[#FAF7F2]",
      )}
    >
      <span className={primary ? "text-white" : "text-[#FF8C42]"}>{icon}</span>
      {label}
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-40 rounded-xl bg-[#F5F2ED] animate-pulse" />
      <div className="grid gap-4 sm:gap-6 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_320px]">
        <div className="h-96 rounded-xl bg-[#F5F2ED] animate-pulse" />
        <div className="space-y-4">
          <div className="h-40 rounded-xl bg-[#F5F2ED] animate-pulse" />
          <div className="h-48 rounded-xl bg-[#F5F2ED] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
