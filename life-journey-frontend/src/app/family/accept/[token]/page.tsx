"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AcceptResult {
  success: boolean;
  journey_title: string;
  inviter_name: string;
  access_level: string;
  requires_login: boolean;
  login_url: string | null;
}

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [result, setResult] = useState<AcceptResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!token) return;

    const accept = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
        const res = await fetch(`${apiUrl}/family/accept-invite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data.detail || "Er is iets misgegaan.");
          setStatus("error");
          return;
        }

        setResult(data);
        setStatus("success");
      } catch {
        setErrorMessage("Kan geen verbinding maken met de server.");
        setStatus("error");
      }
    };

    accept();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E6E2DD] shadow-sm max-w-md w-full overflow-hidden">
        <div className="h-1.5 bg-[#FF8C42]" />
        <div className="p-8 text-center space-y-6">
          {/* Logo / branding */}
          <div className="flex justify-center">
            <div className="p-3 bg-[#FAF7F2] rounded-full">
              <Heart className="h-8 w-8 text-[#FF8C42]" />
            </div>
          </div>

          {status === "loading" && (
            <>
              <Loader2 className="h-10 w-10 text-[#FF8C42] animate-spin mx-auto" />
              <p className="text-[#555555]">Uitnodiging verwerken…</p>
            </>
          )}

          {status === "success" && result && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div className="space-y-2">
                <h1 className="font-serif text-2xl font-semibold text-[#333333]">
                  Welkom in de familie!
                </h1>
                <p className="text-[#555555] text-sm leading-relaxed">
                  <strong>{result.inviter_name}</strong> heeft je uitgenodigd om mee te kijken in{" "}
                  <em>{result.journey_title}</em>.
                </p>
              </div>

              {result.requires_login ? (
                <div className="space-y-3">
                  <p className="text-sm text-[#777777]">
                    Maak een gratis account aan om de herinneringen te bekijken.
                  </p>
                  <Button
                    className="w-full bg-[#FF8C42] hover:bg-[#e67a35] text-white"
                    onClick={() =>
                      router.push(result.login_url ?? "/login?redirect=/family")
                    }
                  >
                    Account aanmaken of inloggen
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full bg-[#FF8C42] hover:bg-[#e67a35] text-white"
                  onClick={() => router.push("/family")}
                >
                  Naar de familiebibliotheek
                </Button>
              )}
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-red-400 mx-auto" />
              <div className="space-y-2">
                <h1 className="font-serif text-xl font-semibold text-[#333333]">
                  Uitnodiging niet geldig
                </h1>
                <p className="text-[#777777] text-sm">{errorMessage}</p>
                <p className="text-[#999999] text-xs">
                  De link is mogelijk verlopen of al eerder gebruikt. Vraag de uitnodiging opnieuw aan.
                </p>
              </div>
              <Button
                variant="secondary"
                className="w-full border-[#E6E2DD]"
                onClick={() => router.push("/")}
              >
                Naar de homepage
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
