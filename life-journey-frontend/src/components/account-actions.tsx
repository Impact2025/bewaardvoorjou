"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth-context";

export function AccountActions() {
  const { session, clearSession, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (isLoading) {
    return null;
  }

  if (session) {
    // Safely handle displayName, with fallback to email or "there"
    const displayName = session.user.displayName || session.user.email || "there";
    const firstName = displayName.split(" ")[0];

    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-slate-600 sm:inline">
          Hallo,&nbsp;{firstName}
        </span>
        <Button
          variant="ghost"
          className="text-slate-700 hover:bg-gray-100"
          onClick={() => {
            clearSession();
            if (pathname.startsWith("/journey")) {
              router.push("/");
            }
          }}
        >
          Uitloggen
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" className="text-slate-700 hover:bg-gray-100" asChild>
        <Link href="/login">Inloggen</Link>
      </Button>
      <Button className="bg-orange hover:bg-orange/90 text-white" asChild>
        <Link href="/register">Account maken</Link>
      </Button>
    </div>
  );
}