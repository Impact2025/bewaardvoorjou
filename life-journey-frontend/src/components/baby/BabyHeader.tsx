"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useBabyTheme, THEME_CONFIG, type BabyTheme } from "./BabyThemeContext";

const NAV_LINKS = [
  { href: "/voor-baby/hoe-het-werkt", label: "Hoe werkt het" },
  { href: "/voor-baby#tijdlijn", label: "Het eerste jaar" },
  { href: "/voor-baby#prijs", label: "Prijzen" },
  { href: "/voor-baby/hoe-het-werkt#faq", label: "FAQ" },
  { href: "/voor-baby/over-ons", label: "Over ons" },
  { href: "/contact", label: "Contact" },
];

const THEMES: BabyTheme[] = ["meisje", "jongen", "neutraal"];

const THEME_LOGOS: Record<BabyTheme, string> = {
  meisje:   "/images/logo-baby-meisje.png",
  jongen:   "/images/logo-baby-jongen.png",
  neutraal: "/images/logo-baby-neutraal.png",
};

export function BabyHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme, t } = useBabyTheme();

  return (
    <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

        {/* Sub-brand logo */}
        <Link href="/voor-baby" className="flex items-center gap-3 shrink-0">
          <Image
            key={theme}
            src={THEME_LOGOS[theme]}
            alt="Bewaard voor Baby logo"
            width={40}
            height={40}
            className="w-10 h-10 object-contain transition-all duration-300"
            priority
          />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-gray-900 text-base">Bewaard voor Baby</span>
            <Link
              href="/"
              className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors leading-tight"
              onClick={(e) => e.stopPropagation()}
            >
              door BewaardVoorJou.nl
            </Link>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-5 text-sm text-slate-600">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-medium transition-colors hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: theme switcher + CTA */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme switcher */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            {THEMES.map((th) => {
              const cfg = THEME_CONFIG[th];
              const isActive = theme === th;
              return (
                <button
                  key={th}
                  onClick={() => setTheme(th)}
                  title={cfg.label}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? `${cfg.switcherBg} shadow-sm`
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Image
                    src={THEME_LOGOS[th]}
                    alt={cfg.label}
                    width={16}
                    height={16}
                    className="w-4 h-4 object-contain"
                  />
                  <span className="hidden xl:inline">{cfg.label}</span>
                </button>
              );
            })}
          </div>

          <Link
            href="/login"
            className="text-sm text-slate-600 hover:text-gray-900 font-medium transition-colors"
          >
            Inloggen
          </Link>

          <Link
            href="/checkout?package=BABY_GIFT"
            className={`${t.primary} ${t.primaryHover} text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm`}
          >
            Geef als cadeau
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-slate-700 hover:text-gray-900 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2.5 text-slate-700 hover:bg-gray-50 rounded-xl transition-colors text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-gray-100">
              <p className="px-4 text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">
                Thema kiezen
              </p>
              <div className="flex gap-2 px-4">
                {THEMES.map((th) => {
                  const cfg = THEME_CONFIG[th];
                  const isActive = theme === th;
                  return (
                    <button
                      key={th}
                      onClick={() => setTheme(th)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? `${cfg.switcherBg} shadow-sm`
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Image
                        src={THEME_LOGOS[th]}
                        alt={cfg.label}
                        width={18}
                        height={18}
                        className="w-4 h-4 object-contain"
                      />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 space-y-2">
              <Link
                href="/login"
                className="block px-4 py-2.5 text-slate-700 hover:bg-gray-50 rounded-xl transition-colors text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Inloggen
              </Link>
              <Link
                href="/checkout?package=BABY_GIFT"
                className={`block ${t.primary} ${t.primaryHover} text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors text-center shadow-sm`}
                onClick={() => setMobileOpen(false)}
              >
                Geef als cadeau — €59
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
