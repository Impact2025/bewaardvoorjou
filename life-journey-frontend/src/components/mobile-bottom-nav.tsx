"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, BookOpen, Layers, Mic, AlignJustify } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/chapters", label: "Verhalen", icon: BookOpen },
  { href: "/timeline", label: "Tijdlijn", icon: Layers },
  { href: "/recordings", label: "Opnames", icon: Mic },
  { href: "/overview", label: "Meer", icon: AlignJustify },
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
        <div className="flex h-16 items-center justify-around px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 px-3 transition-transform active:scale-90"
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  className={cn(
                    "flex h-8 w-10 items-center justify-center rounded-full transition-all duration-200",
                    isActive && "bg-orange/10"
                  )}
                >
                  <Icon
                    className={cn(
                      "transition-all duration-200",
                      isActive
                        ? "h-[22px] w-[22px] text-orange"
                        : "h-5 w-5 text-gray-400"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold leading-none",
                    isActive ? "text-orange" : "text-gray-400"
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
