"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, BookOpen, Mic2, Mic, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/chapters", label: "Verhalen", icon: BookOpen },
  { href: "/vertel", label: "Vertel", icon: Mic2, primary: true },
  { href: "/recordings", label: "Opnames", icon: Mic },
  { href: "/family", label: "Familie", icon: Users },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 sm:hidden"
      aria-label="Mobiele navigatie"
    >
      <div
        className="border-t border-gray-100 bg-white/95 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
      >
        <div className="flex h-[68px] items-center justify-around px-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, ...rest }) => {
            const isPrimary = "primary" in rest && rest.primary;
            const isActive =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-transform active:scale-90 min-w-0"
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  className={cn(
                    "flex h-9 w-11 items-center justify-center rounded-full transition-all duration-200",
                    isPrimary
                      ? "bg-orange"
                      : isActive
                        ? "bg-orange/10"
                        : ""
                  )}
                >
                  <Icon
                    className={cn(
                      "transition-all duration-200",
                      isPrimary
                        ? "h-6 w-6 text-white"
                        : isActive
                          ? "h-6 w-6 text-orange"
                          : "h-5 w-5 text-gray-400"
                    )}
                    strokeWidth={isActive || isPrimary ? 2.5 : 2}
                  />
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold leading-none truncate",
                    isPrimary
                      ? "text-orange"
                      : isActive
                        ? "text-orange"
                        : "text-gray-400"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
