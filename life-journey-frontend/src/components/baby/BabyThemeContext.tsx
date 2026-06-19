"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type BabyTheme = "meisje" | "jongen" | "neutraal";

export const THEME_CONFIG = {
  meisje: {
    label: "Meisje",
    emoji: "🩷",
    primary: "bg-pink-600",
    primaryHover: "hover:bg-pink-700",
    primaryText: "text-pink-600",
    primaryTextMedium: "text-pink-700",
    primaryTextLight: "text-pink-500",
    primaryBg: "bg-pink-50",
    primaryBgMedium: "bg-pink-100",
    primaryBorder: "border-pink-100",
    primaryBorderMedium: "border-pink-200",
    badge: "bg-pink-100 text-pink-700",
    featureCard: "border-pink-100 bg-pink-50/40 hover:bg-pink-50",
    timelineBg: "bg-pink-50",
    timelineDot: "bg-pink-600",
    timelineLine: "bg-pink-200",
    timelineLabel: "text-pink-500",
    quoteSection: "bg-pink-600",
    progressActive: "bg-pink-500",
    progressBg: "bg-pink-200",
    gradientHero: "from-pink-50 to-white",
    gradientCard: "from-pink-50 to-white",
    outlineBtn: "border-pink-200 text-pink-700 hover:bg-pink-50",
    inputRing: "focus:ring-pink-400",
    itemBg: "bg-pink-50",
    checkColor: "text-pink-500",
    selectedBorder: "border-pink-500 bg-pink-50",
    selectedDot: "bg-pink-500",
    hoverBorder: "hover:border-pink-300 hover:bg-pink-50/30",
    heroAccent: "text-pink-600",
    switcherBg: "bg-pink-100 text-pink-700",
  },
  jongen: {
    label: "Jongen",
    emoji: "💙",
    primary: "bg-sky-500",
    primaryHover: "hover:bg-sky-600",
    primaryText: "text-sky-500",
    primaryTextMedium: "text-sky-600",
    primaryTextLight: "text-sky-400",
    primaryBg: "bg-sky-50",
    primaryBgMedium: "bg-sky-100",
    primaryBorder: "border-sky-100",
    primaryBorderMedium: "border-sky-200",
    badge: "bg-sky-100 text-sky-700",
    featureCard: "border-sky-100 bg-sky-50/40 hover:bg-sky-50",
    timelineBg: "bg-sky-50",
    timelineDot: "bg-sky-500",
    timelineLine: "bg-sky-200",
    timelineLabel: "text-sky-500",
    quoteSection: "bg-sky-500",
    progressActive: "bg-sky-400",
    progressBg: "bg-sky-200",
    gradientHero: "from-sky-50 to-white",
    gradientCard: "from-sky-50 to-white",
    outlineBtn: "border-sky-200 text-sky-600 hover:bg-sky-50",
    inputRing: "focus:ring-sky-400",
    itemBg: "bg-sky-50",
    checkColor: "text-sky-500",
    selectedBorder: "border-sky-500 bg-sky-50",
    selectedDot: "bg-sky-500",
    hoverBorder: "hover:border-sky-300 hover:bg-sky-50/30",
    heroAccent: "text-sky-500",
    switcherBg: "bg-sky-100 text-sky-700",
  },
  neutraal: {
    label: "Neutraal",
    emoji: "🌿",
    primary: "bg-teal-600",
    primaryHover: "hover:bg-teal-700",
    primaryText: "text-teal-600",
    primaryTextMedium: "text-teal-700",
    primaryTextLight: "text-teal-500",
    primaryBg: "bg-teal-50",
    primaryBgMedium: "bg-teal-100",
    primaryBorder: "border-teal-100",
    primaryBorderMedium: "border-teal-200",
    badge: "bg-teal-100 text-teal-700",
    featureCard: "border-teal-100 bg-teal-50/40 hover:bg-teal-50",
    timelineBg: "bg-teal-50",
    timelineDot: "bg-teal-600",
    timelineLine: "bg-teal-200",
    timelineLabel: "text-teal-500",
    quoteSection: "bg-teal-600",
    progressActive: "bg-teal-500",
    progressBg: "bg-teal-200",
    gradientHero: "from-teal-50 to-white",
    gradientCard: "from-teal-50 to-white",
    outlineBtn: "border-teal-200 text-teal-700 hover:bg-teal-50",
    inputRing: "focus:ring-teal-400",
    itemBg: "bg-teal-50",
    checkColor: "text-teal-500",
    selectedBorder: "border-teal-500 bg-teal-50",
    selectedDot: "bg-teal-500",
    hoverBorder: "hover:border-teal-300 hover:bg-teal-50/30",
    heroAccent: "text-teal-600",
    switcherBg: "bg-teal-100 text-teal-700",
  },
} as const;

export type ThemeTokens = (typeof THEME_CONFIG)[BabyTheme];

interface BabyThemeContextType {
  theme: BabyTheme;
  setTheme: (theme: BabyTheme) => void;
  t: ThemeTokens;
}

const BabyThemeContext = createContext<BabyThemeContextType>({
  theme: "neutraal",
  setTheme: () => {},
  t: THEME_CONFIG.neutraal,
});

export function BabyThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<BabyTheme>("neutraal");

  useEffect(() => {
    const stored = localStorage.getItem("baby-theme") as BabyTheme | null;
    if (stored && stored in THEME_CONFIG) setThemeState(stored);
  }, []);

  const setTheme = (next: BabyTheme) => {
    setThemeState(next);
    localStorage.setItem("baby-theme", next);
  };

  return (
    <BabyThemeContext.Provider value={{ theme, setTheme, t: THEME_CONFIG[theme] }}>
      {children}
    </BabyThemeContext.Provider>
  );
}

export function useBabyTheme() {
  return useContext(BabyThemeContext);
}
