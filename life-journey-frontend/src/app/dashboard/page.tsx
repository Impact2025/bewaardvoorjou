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
import { useJourneyBootstrap } from "@/hooks/use-journey-bootstrap";
import { OnboardingModal, hasSeenOnboarding } from "@/components/onboarding/onboarding-modal";
import type { ChapterId } from "@/lib/types";
import {
  Play,
  BookOpen,
  Settings,
  Share2,
  Clock,
  Mic,
  TrendingUp,
  Sparkles,
  Lightbulb,
  Mic2,
  Video,
  FileText,
  ArrowRight,
} from "lucide-react";
import { QuickThoughtFAB } from "@/components/quick-thoughts";
import { MemoryLaneNavigation } from "@/components/MemoryLaneNavigation";

// Lazy load heavy Timeline component (reduces initial bundle)
const Timeline = dynamic(
  () => import("@/components/timeline/Timeline").then((mod) => mod.Timeline),
  {
    loading: () => (
      <div className="h-96 rounded-xl bg-slate-100 animate-pulse" />
    ),
    ssr: false,
  }
);

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

const SEASON_GRADIENTS: Record<Season, string> = {
  spring: 'from-[#FF8C42] to-[#FFB84D]',
  summer: 'from-[#F5A623] to-[#FF8C42]',
  autumn: 'from-[#E06828] to-[#C0392B]',
  winter: 'from-[#5C6BC0] to-[#7986CB]',
};

function DashboardContent() {
  const router = useRouter();
  const { journey, profile, isLoading, error } = useJourneyBootstrap();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [milestonePulse, setMilestonePulse] = useState(false);
  const { triggerConfetti, ConfettiComponent } = useConfetti();
  const season = getCurrentSeason();

  // Auto-show onboarding for first-time users
  useEffect(() => {
    if (!hasSeenOnboarding()) {
      setShowOnboarding(true);
    }
  }, []);

  // Celebrate milestones with confetti
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
        <Card className="bg-white border border-gray-200">
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

  // Time-aware personalized greeting
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

    if (completedChapters === 1) {
      return `Fantastisch ${name}! Je eerste verhaal staat 🎉`;
    }

    if (completedChapters < 10) {
      return `Welkom terug, ${name}`;
    }

    if (completedChapters < 20) {
      return `Je doet het geweldig, ${name}`;
    }

    if (progressPercent >= 80) {
      return `Je bent er bijna, ${name}!`;
    }

    return `Hallo ${name}`;
  };

  // Emotional, meaningful progress messages
  const getProgressMessage = () => {
    if (completedChapters === 0) {
      return "Elk verhaal begint met één woord. Wat is jouw vroegste herinnering?";
    }

    if (completedChapters === 1) {
      return "Je eerste verhaal staat! 🎉 Hoe voelt dat? Zullen we doorgaan?";
    }

    if (completedChapters === 3) {
      return "3 hoofdstukken! Je bent op weg. Je kleinkinderen zullen dit koesteren.";
    }

    if (completedChapters === 5) {
      return "5 verhalen vol herinneringen. Dit wordt echt mooi.";
    }

    if (completedChapters === 10) {
      return "10 hoofdstukken! Je bouwt aan iets bijzonders hier.";
    }

    if (completedChapters === 15) {
      return "Halverwege! Elke herinnering die je deelt is een cadeau.";
    }

    if (progressPercent === 100) {
      return "Je hebt het gedaan. Je levensverhaal is compleet. ❤️";
    }

    if (progressPercent < 100) {
      return `${completedChapters} hoofdstukken verteld. Blijf zo doorgaan!`;
    }

    return "Je hebt alle hoofdstukken voltooid. Je levensverhaal is compleet.";
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
        <div className="space-y-4 sm:space-y-6 md:space-y-8 max-w-full overflow-hidden">
          {/* Mobile-only greeting (desktop sees greeting in AppShell header) */}
          <div className="sm:hidden">
            <p className="text-sm font-medium text-gray-400">
              {new Date().getHours() < 12
                ? "Goedemorgen"
                : new Date().getHours() < 18
                ? "Goedemiddag"
                : "Goedenavond"}
            </p>
            <h2 className="text-2xl font-bold text-slate-900 font-serif leading-tight">
              {profile?.displayName?.split(" ")[0] || "Welkom"}
            </h2>
          </div>

          {/* Hero Section — seizoensgebonden gradient */}
          <div className={cn(
            "relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 sm:p-6 md:p-8 text-white shadow-[0_4px_24px_rgba(255,140,66,0.25)]",
            SEASON_GRADIENTS[season]
          )}>
            <div className="absolute -right-6 -top-6 opacity-10">
              <Sparkles className="h-32 w-32" />
            </div>
            <div className="relative z-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-2xl font-bold mb-1">
                    {progressPercent === 0
                      ? "Begin je reis"
                      : progressPercent < 50
                      ? "Je bent goed op weg!"
                      : progressPercent < 100
                      ? "Bijna daar!"
                      : "Gefeliciteerd! 🎉"}
                  </h3>
                  <p className="text-white/80 text-sm sm:text-base max-w-md leading-relaxed">
                    {getProgressMessage()}
                  </p>
                </div>
                {nextChapter && (
                  <Button
                    asChild
                    className="w-full sm:w-auto bg-white text-orange font-semibold hover:bg-white/90 shadow-md whitespace-nowrap"
                  >
                    <Link href={`/chapter/${nextChapter}`}>
                      <Play className="h-4 w-4" />
                      {nextChapterTitle || "Start volgende"}
                    </Link>
                  </Button>
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-white/90">Voortgang</span>
                  <span className={cn("font-bold", milestonePulse && "heart-pulse inline-block")}>
                    {progressPercent}%
                  </span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(progressPercent, 2)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Nieuwe gebruiker: uitgebreide welkomst-sectie */}
          {isNewUser && (
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Zo werkt Bewaard voor jou</CardTitle>
                <CardDescription className="text-base">
                  In drie eenvoudige stappen leg je jouw levensverhaal vast.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      icon: <Mic2 className="h-6 w-6 text-orange" />,
                      step: "1",
                      title: "Kies een hoofdstuk",
                      desc: "Je begint bij het begin — jouw vroegste herinneringen.",
                    },
                    {
                      icon: <Video className="h-6 w-6 text-orange" />,
                      step: "2",
                      title: "Vertel je verhaal",
                      desc: "Praat, film of schrijf — jij kiest hoe je het liefst vertelt.",
                    },
                    {
                      icon: <FileText className="h-6 w-6 text-orange" />,
                      step: "3",
                      title: "Bewaar voor altijd",
                      desc: "Je verhaal wordt veilig opgeslagen en klaar voor je dierbaren.",
                    },
                  ].map(({ icon, step, title, desc }) => (
                    <div key={step} className="flex flex-col items-start gap-3 p-4 rounded-xl bg-cream">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-orange/15 text-orange text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {step}
                        </span>
                        {icon}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{title}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {nextChapter && (
                  <div className="mt-5">
                    <Button asChild className="btn-primary w-full sm:w-auto flex items-center gap-2 py-4 text-base">
                      <Link href={`/chapter/${nextChapter}`}>
                        <Play className="h-4 w-4" />
                        Begin met mijn eerste verhaal
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Storyteller CTA — prominent card for returning users */}
          {!isNewUser && (
            <Link href="/vertel" className="block group">
              <div
                className="rounded-2xl p-6 flex items-center gap-5 transition-opacity hover:opacity-90 active:opacity-80"
                style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)" }}
              >
                <span className="text-5xl">🎤</span>
                <div className="flex-1">
                  <p className="text-white font-serif text-xl font-semibold leading-tight">
                    Begin met vertellen
                  </p>
                  <p className="text-orange-100 text-sm mt-1">
                    Jouw volgende verhaalfragment wacht — één klik en je bent er
                  </p>
                </div>
                <ArrowRight className="h-6 w-6 text-white flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )}

          {/* Main Content Grid — sidebar first on mobile via CSS order */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_320px]">
            {/* Timeline — verborgen voor nieuwe gebruikers */}
            {!isNewUser && (
            <div className="order-2 md:order-1 space-y-6">
              <Card className="bg-white border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-orange" />
                      Je Levensreis
                    </CardTitle>
                    <CardDescription>
                      Volg je voortgang door alle levensfasen
                    </CardDescription>
                  </div>
                  <Button variant="ghost" asChild>
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
                    <p className="text-slate-600 text-center py-8">
                      Nog geen journey gestart
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
            )}

            {/* Sidebar — order-1 op mobile */}
            <div className={`order-1 md:order-2 space-y-4 sm:space-y-6 ${isNewUser ? "md:col-span-2 md:grid md:grid-cols-2 md:gap-4 md:space-y-0" : ""}`}>
              {/* Quick Stats — verborgen voor nieuwe gebruikers */}
              {!isNewUser && (
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-base">Snel overzicht</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 sm:block sm:space-y-4">
                    <QuickStat
                      icon={<BookOpen className="h-4 w-4" />}
                      label="Voltooid"
                      value={`${completedChapters}/${totalChapters}`}
                      color="emerald"
                    />
                    <QuickStat
                      icon={<Mic className="h-4 w-4" />}
                      label="Opnames"
                      value={String(journey?.media?.length || 0)}
                      color="blue"
                    />
                    <QuickStat
                      icon={<Clock className="h-4 w-4" />}
                      label="Bijgewerkt"
                      value={journey ? formatDate(journey.updatedAt) : "-"}
                      color="violet"
                    />
                  </div>
                </CardContent>
              </Card>
              )}

              {/* Memory Lane navigatie voor bestaande gebruikers */}
              {!isNewUser ? (
                <Card className="bg-white border border-gray-200 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Memory Lane</CardTitle>
                    <CardDescription>Navigeer door je levensverhaal</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 pb-2">
                    <MemoryLaneNavigation compact />
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-base">Snelle acties</CardTitle>
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

              {/* Help Card */}
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                      <Sparkles className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-amber-900 mb-1">
                        Vragen? Wij helpen je.
                      </h3>
                      <p className="text-sm text-amber-700 mb-3">
                        Bekijk een korte uitleg over hoe de app werkt.
                      </p>
                      <Button
                        variant="ghost"
                        onClick={() => setShowOnboarding(true)}
                        className="border-amber-300 text-amber-700 hover:bg-amber-100 text-sm"
                      >
                        Uitleg bekijken
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Quick Thought FAB — raised above mobile bottom nav */}
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
  color: "emerald" | "blue" | "violet";
}

const statColors = {
  emerald: "text-emerald-600 bg-emerald-50",
  blue: "text-blue-600 bg-blue-50",
  violet: "text-violet-600 bg-violet-50",
};

function QuickStat({ icon, label, value, color }: QuickStatProps) {
  return (
    <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:items-center sm:gap-3 sm:text-left">
      <div className={cn("p-2 rounded-lg flex-shrink-0", statColors[color])}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-900 truncate">{value}</p>
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
    <Button
      asChild
      variant={primary ? "primary" : "ghost"}
      className={cn(
        "w-full justify-start min-h-[44px] py-3 sm:py-2",
        primary
          ? "bg-teal-600 hover:bg-teal-700 text-white"
          : "text-slate-700 hover:bg-slate-100",
      )}
    >
      <Link href={href}>
        {icon}
        <span className="ml-2">{label}</span>
      </Link>
    </Button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero skeleton */}
      <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />

      {/* Content grid skeleton */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_320px]">
        <div className="h-96 rounded-xl bg-slate-100 animate-pulse" />
        <div className="space-y-6">
          <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-60 rounded-xl bg-slate-100 animate-pulse" />
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
