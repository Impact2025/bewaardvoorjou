"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";
import { AccountActions } from "@/components/account-actions";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store/auth-context";
import { Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/overview", label: "Mijn Reis" },
  { href: "/timeline", label: "Tijdlijn" },
  { href: "/chapters", label: "Hoofdstukken" },
  { href: "/family", label: "Familie" },
  { href: "/recordings", label: "Mijn Opnames" },
  { href: "/memos", label: "Memo's" },
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
  { href: "/onboarding-wizard", label: "Nieuwe Onboarding" },
  { href: "/onboarding", label: "Instellingen" },
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
              {/* Mobile: compact brand name */}
              <span className="sm:hidden text-base font-semibold text-slate-900 font-serif">
                Bewaard voor jou
              </span>
              {/* Desktop: full page title + description */}
              <div className="hidden sm:block">
                <h1 className="text-xl font-semibold text-slate-900 font-serif">
                  {title}
                </h1>
                {description && (
                  <p className="text-sm text-slate-600">{description}</p>
                )}
              </div>
              {/* Accessible h1 for mobile screen readers */}
              <h1 className="sr-only">{title}</h1>
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
                      <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
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
                                className="w-full text-left block px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-gray-50"
                              >
                                {item.label}
                              </button>
                            );
                          }
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="block px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-gray-50"
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
