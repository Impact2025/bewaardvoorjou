"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";
import { AccountActions } from "@/components/account-actions";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth-context";
import { useAccessibility } from "@/lib/accessibility-context";
import { Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/overview", label: "Mijn Reis" },
  { href: "/timeline", label: "Tijdlijn" },
  { href: "/chapters", label: "Hoofdstukken" },
  { href: "/family", label: "Familie" },
  { href: "/recordings", label: "Mijn Opnames" },
  { href: "/memos", label: "Memo's" },
  { href: "/instellingen", label: "Instellingen" },
];

interface AppShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  activeHref?: string;
  onShowHandleiding?: () => void;
}

const settingsItems = [
  { href: "/pricing", label: "Upgrade Plan" },
  { href: "/admin", label: "Admin Dashboard" },
  { href: "/onboarding", label: "Profiel aanvullen" },
  { href: "#handleiding", label: "Handleiding" },
  { href: "/about", label: "Over" },
  { href: "/privacy", label: "Privacy" },
  { href: "/security", label: "Veiligheid" },
  { href: "/legacy", label: "Legacy" },
];

export function AppShell({
  title,
  description,
  children,
  actions,
  activeHref,
  onShowHandleiding,
}: AppShellProps) {
  const { session } = useAuth();
  const { largeText, highContrast, toggleLargeText, toggleHighContrast } = useAccessibility();
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  const userInitial =
    session?.user?.displayName?.[0]?.toUpperCase() ||
    session?.user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <div className="min-h-screen bg-white">
      <header
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-[0_1px_0_0_#f3f4f6]"
        role="banner"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
          <div className="flex items-center justify-between py-3 sm:py-4">
            {/* Left: logo + title */}
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex-shrink-0">
                <Image
                  src="/Logo_Bewaardvoorjou.png"
                  alt="Bewaard voor jou Logo"
                  width={48}
                  height={48}
                  className="h-9 w-9 sm:h-12 sm:w-12"
                  priority
                />
              </Link>
              {/* Mobile: show page title */}
              <div className="sm:hidden">
                <h1 className="text-base font-semibold text-slate-900 font-serif leading-tight">
                  {title}
                </h1>
              </div>
              {/* Desktop: full page title + description */}
              <div className="hidden sm:block">
                <h1 className="text-xl font-semibold text-slate-900 font-serif">
                  {title}
                </h1>
                {description && (
                  <p className="text-sm text-slate-600">{description}</p>
                )}
              </div>
            </div>

            {/* Right: icon actions */}
            <div className="flex items-center gap-2">
              {actions}
              {session && (
                <div className="relative">
                  <button
                    onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-gray-100 hover:text-slate-900"
                    aria-label="Instellingen"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                  {showSettingsDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowSettingsDropdown(false)}
                      />
                      <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
                        {/* Toegankelijkheid toggles bovenaan */}
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Toegankelijkheid</p>
                          <button
                            type="button"
                            onClick={toggleLargeText}
                            className="flex w-full items-center justify-between py-1.5 text-base text-slate-700 hover:text-slate-900"
                          >
                            <span>Grote tekst</span>
                            <span className={cn(
                              "w-9 h-5 rounded-full transition-colors relative flex-shrink-0",
                              largeText ? "bg-orange" : "bg-slate-200"
                            )}>
                              <span className={cn(
                                "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                                largeText ? "translate-x-4" : "translate-x-0.5"
                              )} />
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={toggleHighContrast}
                            className="flex w-full items-center justify-between py-1.5 text-base text-slate-700 hover:text-slate-900"
                          >
                            <span>Hoog contrast</span>
                            <span className={cn(
                              "w-9 h-5 rounded-full transition-colors relative flex-shrink-0",
                              highContrast ? "bg-orange" : "bg-slate-200"
                            )}>
                              <span className={cn(
                                "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                                highContrast ? "translate-x-4" : "translate-x-0.5"
                              )} />
                            </span>
                          </button>
                        </div>
                        {settingsItems.map((item) => {
                          if (item.href === "/admin" && !session?.user?.isAdmin) {
                            return null;
                          }
                          if (item.href === "#handleiding") {
                            return (
                              <button
                                key={item.href}
                                onClick={() => {
                                  setShowSettingsDropdown(false);
                                  onShowHandleiding?.();
                                }}
                                className="w-full text-left block px-4 py-3 text-base text-slate-700 transition-colors hover:bg-gray-50"
                              >
                                {item.label}
                              </button>
                            );
                          }
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="block px-4 py-3 text-base text-slate-700 transition-colors hover:bg-gray-50"
                              onClick={() => setShowSettingsDropdown(false)}
                            >
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
              {/* Desktop: full logout/login actions */}
              <div className="hidden sm:flex">
                <AccountActions />
              </div>
              {/* Mobile: user initial avatar */}
              {session && (
                <div className="sm:hidden flex h-9 w-9 select-none items-center justify-center rounded-full bg-orange/15 text-sm font-bold text-orange">
                  {userInitial}
                </div>
              )}
            </div>
          </div>

          {/* Desktop-only horizontal nav */}
          {session && (
            <nav
              id="main-navigation"
              className="hidden sm:block border-t border-gray-100 py-3 -mx-6 sm:-mx-10 px-6 sm:px-10"
              role="navigation"
              aria-label="Hoofdnavigatie"
            >
              <div className="flex items-center gap-1 overflow-x-auto text-sm text-slate-600">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-full px-4 py-2 transition-colors whitespace-nowrap",
                      "focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2",
                      activeHref === item.href
                        ? "bg-orange/10 text-orange font-medium"
                        : "hover:bg-gray-100 hover:text-slate-900",
                    )}
                    aria-current={activeHref === item.href ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto max-w-6xl px-4 pt-6 pb-28 sm:px-6 sm:py-8 md:px-10 md:py-12"
        role="main"
        aria-label="Hoofdinhoud"
      >
        {children}
      </main>

      <MobileBottomNav />
    </div>
  );
}
