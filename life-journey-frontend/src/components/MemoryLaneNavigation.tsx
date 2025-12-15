"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  Users,
  Heart,
  Calendar,
  Settings,
  Sparkles,
  ChevronRight,
  Flower,
  Sun,
  Leaf,
  Snowflake
} from "lucide-react";

interface MemoryLaneNavigationProps {
  className?: string;
}

interface MemoryStop {
  id: string;
  label: string;
  path: string;
  icon: typeof Home;
  description: string;
  emotionalColor: string;
  isActive: boolean;
  progress?: number;
}

export function MemoryLaneNavigation({ className }: MemoryLaneNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentSeason, setCurrentSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring');
  const [showRipple, setShowRipple] = useState(false);

  // Determine current season based on date
  useEffect(() => {
    const now = new Date();
    const month = now.getMonth();
    if (month >= 2 && month <= 4) setCurrentSeason('spring');
    else if (month >= 5 && month <= 7) setCurrentSeason('summer');
    else if (month >= 8 && month <= 10) setCurrentSeason('autumn');
    else setCurrentSeason('winter');
  }, []);

  const memoryStops: MemoryStop[] = [
    {
      id: 'dashboard',
      label: 'Mijn Huis',
      path: '/dashboard',
      icon: Home,
      description: 'Terug naar mijn verhalen thuis',
      emotionalColor: 'emotion-reflection',
      isActive: pathname === '/dashboard',
      progress: 85
    },
    {
      id: 'journey',
      label: 'Mijn Reis',
      path: '/overview',
      icon: BookOpen,
      description: 'De reis door mijn leven',
      emotionalColor: 'emotion-joy',
      isActive: pathname.startsWith('/overview') || pathname.startsWith('/journey'),
      progress: 60
    },
    {
      id: 'timeline',
      label: 'Tijdlijn',
      path: '/timeline',
      icon: Calendar,
      description: 'Mijn levensweg door de tijd',
      emotionalColor: 'emotion-gratitude',
      isActive: pathname === '/timeline',
      progress: 70
    },
    {
      id: 'chapters',
      label: 'Hoofdstukken',
      path: '/chapters',
      icon: Sparkles,
      description: 'De hoofdstukken van mijn verhaal',
      emotionalColor: 'emotion-love',
      isActive: pathname.startsWith('/chapters') || pathname.startsWith('/chapter/'),
      progress: 45
    },
    {
      id: 'family',
      label: 'Familie',
      path: '/family',
      icon: Users,
      description: 'Delen met mijn geliefden',
      emotionalColor: 'emotion-love',
      isActive: pathname.startsWith('/family'),
      progress: 30
    },
    {
      id: 'recordings',
      label: 'Opnames',
      path: '/recordings',
      icon: Heart,
      description: 'Mijn opgenomen herinneringen',
      emotionalColor: 'emotion-joy',
      isActive: pathname === '/recordings',
      progress: 90
    }
  ];

  const handleNavigation = (stop: MemoryStop) => {
    // Trigger emotional ripple effect
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 1000);

    router.push(stop.path);
  };

  const getSeasonIcon = () => {
    switch (currentSeason) {
      case 'spring': return Flower;
      case 'summer': return Sun;
      case 'autumn': return Leaf;
      case 'winter': return Snowflake;
      default: return Flower;
    }
  };

  const SeasonIcon = getSeasonIcon();

  return (
    <nav className={cn("relative", className)}>
      {/* Seasonal background */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-20",
        `seasonal-${currentSeason}`
      )} />

      {/* Memory Lane Path */}
      <div className="relative p-6">
        {/* Season indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-orange/20">
            <SeasonIcon className="h-4 w-4 text-orange" />
            <span className="text-sm font-medium text-slate-700 capitalize">
              {currentSeason}
            </span>
          </div>
        </div>

        {/* Memory stops */}
        <div className="space-y-4">
          {memoryStops.map((stop, index) => {
            const Icon = stop.icon;
            const isLast = index === memoryStops.length - 1;

            return (
              <div key={stop.id} className="relative">
                {/* Connecting path */}
                {!isLast && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-gradient-to-b from-orange/30 to-transparent" />
                )}

                {/* Memory stop */}
                <button
                  onClick={() => handleNavigation(stop)}
                  className={cn(
                    "group relative w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300",
                    "hover:scale-105 hover:shadow-lg",
                    stop.isActive ? "bg-white shadow-md warm-glow" : "bg-white/60 hover:bg-white/80",
                    "emotional-transition"
                  )}
                >
                  {/* Emotional ripple effect */}
                  {showRipple && stop.isActive && (
                    <div className="absolute inset-0 rounded-xl emotional-ripple" />
                  )}

                  {/* Icon with emotional styling */}
                  <div className={cn(
                    "relative flex items-center justify-center w-12 h-12 rounded-full",
                    stop.emotionalColor,
                    stop.isActive ? "warm-glow" : "",
                    "transition-all duration-300"
                  )}>
                    <Icon className="h-6 w-6" />
                    {stop.isActive && (
                      <div className="absolute -inset-1 rounded-full border-2 border-orange animate-pulse" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <h3 className={cn(
                      "font-medium transition-colors",
                      stop.isActive ? "text-orange" : "text-slate-700 group-hover:text-orange"
                    )}>
                      {stop.label}
                    </h3>
                    <p className="text-sm text-slate-500 group-hover:text-slate-600">
                      {stop.description}
                    </p>

                    {/* Progress indicator */}
                    {stop.progress !== undefined && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange to-gold rounded-full transition-all duration-500"
                            style={{ width: `${stop.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{stop.progress}%</span>
                      </div>
                    )}
                  </div>

                  {/* Navigation arrow */}
                  <ChevronRight className={cn(
                    "h-5 w-5 transition-all duration-300",
                    stop.isActive ? "text-orange" : "text-slate-400 group-hover:text-orange"
                  )} />
                </button>

                {/* Floating memory bubble */}
                {stop.isActive && (
                  <div className="absolute -right-2 top-4 memory-bubble">
                    Je bent hier ✨
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Emotional encouragement */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/10 text-orange text-sm font-medium">
            <Heart className="h-4 w-4 heart-pulse" />
            <span>Elke stap is een herinnering waard</span>
          </div>
        </div>
      </div>
    </nav>
  );
}