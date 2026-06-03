"use client";

import { useState } from "react";
import { Tag, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { redeemPromoCode } from "@/lib/api/promo-codes";

export function PromoCodeRedeem() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRedeem = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const result = await redeemPromoCode(trimmed);
      setSuccess(result.message);
      setCode("");
      // Herlaad de pagina zodat het nieuwe pakket zichtbaar is
      setTimeout(() => window.location.reload(), 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Code inwisselen mislukt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E6E2DD] p-5">
      <button
        onClick={() => { setOpen(!open); setError(null); }}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FAF7F2] rounded-lg shrink-0">
            <Tag className="h-4 w-4 text-[#d4af37]" />
          </div>
          <p className="font-medium text-[#333333] text-sm">Promotiecode invoeren</p>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-[#999]" />
          : <ChevronDown className="h-4 w-4 text-[#999]" />}
      </button>

      {open && (
        <div className="mt-4">
          {success ? (
            <div className="flex items-start gap-2 text-[#2d5016]">
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
                  placeholder="JOUWCODE"
                  maxLength={32}
                  className="flex-1 px-3 py-2.5 rounded-lg border border-[#E6E2DD] font-mono text-sm focus:outline-none focus:border-[#d4af37] bg-[#FAF7F2] text-[#333333] transition-colors"
                />
                <button
                  onClick={handleRedeem}
                  disabled={loading || !code.trim()}
                  className="px-4 py-2.5 bg-[#333333] text-white text-sm font-medium rounded-lg hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "..." : "Inwisselen"}
                </button>
              </div>
              {error && (
                <p className="text-red-600 text-xs mt-2">{error}</p>
              )}
              <p className="text-xs text-[#999] mt-2">
                Heb je een code ontvangen van ons? Voer hem hier in om je account te activeren.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
