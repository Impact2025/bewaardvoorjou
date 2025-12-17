"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { useState } from "react";
import { AccountActions } from "@/components/account-actions";
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

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Header */}
      <header
        className="sticky top-0 z-50 bg-white shadow-sm"
        role="banner"
      >
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          {/* Top bar with logo/title and account actions */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex-shrink-0">
                <Image
                  src="/Logo_Bewaardvoorjou.png"
                  alt="Bewaard voor jou Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12"
                  priority
                />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 font-serif">{title}</h1>
                {description ? (
                  <p className="text-sm text-slate-600 hidden sm:block">{description}</p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {actions}
              {session && (
                <div className="relative">
                  <button
                    onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                    className="rounded-full p-2 text-slate-600 hover:bg-gray-100 hover:text-slate-900 transition-colors"
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
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                        {settingsItems.map((item) => {
                          // Hide admin dashboard if user is not admin
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
                                className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-gray-100 transition-colors"
                              >
                                {item.label}
                              </button>
                            );
                          }
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="block px-4 py-2 text-sm text-slate-700 hover:bg-gray-100 transition-colors"
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
              <AccountActions />
            </div>
          </div>
          
          {/* Navigation bar - only show when user is authenticated */}
          {session && (
            <nav
              id="main-navigation"
              className="border-t border-gray-200 py-3 -mx-6 sm:-mx-10 px-6 sm:px-10"
              role="navigation"
              aria-label="Hoofdnavigatie"
            >
              <div className="flex items-center gap-1 overflow-x-auto text-sm text-slate-600">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full px-4 py-2 transition-colors whitespace-nowrap",
                      "focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2",
                      activeHref === item.href
                        ? "bg-orange/20 text-orange font-medium"
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
        className="mx-auto max-w-6xl px-6 py-8 sm:px-10 sm:py-12"
        role="main"
        aria-label="Hoofdinhoud"
      >
        {children}
      </main>
    </div>
  );
}