"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no session, redirect to login
    if (!isLoading && !session) {
      router.push("/login");
    }
  }, [session, isLoading, router]);

  // Show nothing while checking auth status
  if (isLoading || !session) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
}