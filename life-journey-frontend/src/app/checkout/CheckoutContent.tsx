"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Check, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PACKAGE_NAMES,
  PACKAGE_PRICES,
  ADDON_OPTIONS,
  type PackageType,
  type AddonCode,
  type ShippingAddress,
} from "@/lib/api/orders";
import { getEarlyBirdStatus, type EarlyBirdStatus } from "@/lib/api/early-bird";
import { validatePromoCode } from "@/lib/api/promo-codes";
import StepPersonalize from "./StepPersonalize";
import StepPayment from "./StepPayment";
import StepConfirmation from "./StepConfirmation";

const SOLD_OUT_PACKAGES = new Set(["ERFGOED", "VOOR_ALTIJD"]);
const DIGITAL_ONLY_PACKAGES = new Set(["DIGITAAL"]);

const STEPS = ["Pakket", "Personaliseer", "Betalen", "Bevestiging"] as const;

export interface CheckoutState {
  packageType: PackageType;
  addons: AddonCode[];
  recipientName: string;
  recipientEmail: string;
  personalMessage: string;
  shippingAddress: ShippingAddress;
  skipShipping: boolean;
  guestEmail: string;
  orderId: string;
  paymentIntentId: string;
  promoCode: string;
  promoDiscountCents: number;
}

const DEFAULT_ADDRESS: ShippingAddress = {
  full_name: "",
  street: "",
  house_number: "",
  postal_code: "",
  city: "",
  country: "NL",
};

export default function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawPackage = searchParams.get("package") ?? "BEGIN";
  const packageType: PackageType = ["BEGIN", "ERFGOED", "VOOR_ALTIJD", "DIGITAAL"].includes(rawPackage)
    ? (rawPackage as PackageType)
    : "BEGIN";

  // Redirect uitverkochte pakketten terug naar de pricing pagina
  useEffect(() => {
    if (SOLD_OUT_PACKAGES.has(packageType)) {
      router.replace("/pricing");
    }
  }, [packageType, router]);

  const [earlyBird, setEarlyBird] = useState<EarlyBirdStatus | null>(null);
  useEffect(() => { getEarlyBirdStatus().then(setEarlyBird); }, []);

  const [step, setStep] = useState(0);
  const [state, setState] = useState<CheckoutState>({
    packageType,
    addons: [],
    recipientName: "",
    recipientEmail: "",
    personalMessage: "",
    shippingAddress: DEFAULT_ADDRESS,
    skipShipping: DIGITAL_ONLY_PACKAGES.has(packageType),
    guestEmail: "",
    orderId: "",
    paymentIntentId: "",
    promoCode: "",
    promoDiscountCents: 0,
  });

  // Lees return_url voor Stripe iDEAL redirect
  useEffect(() => {
    const returnStep = searchParams.get("step");
    const orderId = searchParams.get("order_id");
    if (returnStep === "confirmation" && orderId) {
      setState((s) => ({ ...s, orderId }));
      setStep(3);
    }
  }, [searchParams]);

  const totalAddons = state.addons.reduce((sum, code) => {
    const opt = ADDON_OPTIONS.find((o) => o.code === code);
    return sum + (opt?.price ?? 0);
  }, 0);
  const earlyBirdDiscount = earlyBird?.active
    ? state.packageType === "BEGIN"
      ? earlyBird.discount_cents / 100
      : state.packageType === "DIGITAAL"
      ? (earlyBird.digitaal_discount_cents ?? 0) / 100
      : 0
    : 0;
  const promoDiscount = state.promoDiscountCents / 100;
  const baseAfterEarlyBird = Math.max(0, PACKAGE_PRICES[state.packageType] + totalAddons - earlyBirdDiscount);
  const effectivePromoDiscount = Math.min(promoDiscount, baseAfterEarlyBird);
  const totalPrice = Math.max(0, baseAfterEarlyBird - effectivePromoDiscount);

  return (
    <div className="min-h-screen bg-[#f8f6f2]">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e0d8] px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => (step > 0 ? setStep(step - 1) : router.push("/pricing"))}
            className="flex items-center gap-1 text-sm text-[#888] hover:text-[#1a1a1a] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {step === 0 ? "Terug naar pakketten" : "Vorige stap"}
          </button>
          <div className="text-center">
            <p className="text-xs text-[#888]">Bewaardvoorjou</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-[#1a1a1a]">{totalPrice === 0 ? "Gratis" : `€${totalPrice}`}</p>
            <p className="text-xs text-[#888]">eenmalig</p>
          </div>
        </div>
      </div>

      {/* Stappen indicator */}
      <div className="bg-white border-b border-[#e5e0d8] px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                      i < step
                        ? "bg-[#2d5016] text-white"
                        : i === step
                        ? "bg-[#d4af37] text-[#1a1a1a]"
                        : "bg-[#f0ece6] text-[#aaa]"
                    )}
                  >
                    {i < step ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={cn("text-xs mt-1 hidden sm:block", i === step ? "text-[#1a1a1a] font-medium" : "text-[#aaa]")}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("h-px w-8 sm:w-16 mx-1 sm:mx-2 transition-colors", i < step ? "bg-[#2d5016]" : "bg-[#e5e0d8]")} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {step === 0 && (
          <StepSelectPlan
            state={state}
            earlyBirdDiscount={earlyBirdDiscount}
            promoDiscount={effectivePromoDiscount}
            onChange={(updates) => setState((s) => ({ ...s, ...updates }))}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <StepPersonalize
            state={state}
            onChange={(updates) => setState((s) => ({ ...s, ...updates }))}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <StepPayment
            state={state}
            totalPrice={totalPrice}
            onSuccess={(orderId) => {
              setState((s) => ({ ...s, orderId }));
              setStep(3);
            }}
          />
        )}
        {step === 3 && (
          <StepConfirmation state={state} />
        )}
      </div>
    </div>
  );
}

// ─── Stap 1: Pakket kiezen + add-ons ─────────────────────────────────────────

function StepSelectPlan({
  state,
  earlyBirdDiscount,
  promoDiscount,
  onChange,
  onNext,
}: {
  state: CheckoutState;
  earlyBirdDiscount: number;
  promoDiscount: number;
  onChange: (updates: Partial<CheckoutState>) => void;
  onNext: () => void;
}) {
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoApplied, setPromoApplied] = useState(!!state.promoCode);

  const totalAddons = state.addons.reduce((sum, code) => {
    const opt = ADDON_OPTIONS.find((o) => o.code === code);
    return sum + (opt?.price ?? 0);
  }, 0);
  const ebDiscount = ["BEGIN", "DIGITAAL"].includes(state.packageType) ? earlyBirdDiscount : 0;
  const total = Math.max(0, PACKAGE_PRICES[state.packageType] + totalAddons - ebDiscount - promoDiscount);

  const handleApplyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    setPromoError(null);
    try {
      const result = await validatePromoCode(code, state.packageType);
      if (result.valid) {
        onChange({ promoCode: code, promoDiscountCents: result.discount_cents });
        setPromoApplied(true);
      } else {
        setPromoError(result.error ?? "Ongeldige code");
        onChange({ promoCode: "", promoDiscountCents: 0 });
      }
    } catch {
      setPromoError("Validatie mislukt, probeer opnieuw");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoInput("");
    setPromoApplied(false);
    setPromoError(null);
    onChange({ promoCode: "", promoDiscountCents: 0 });
  };

  const toggleAddon = (code: AddonCode) => {
    const addons = state.addons.includes(code)
      ? state.addons.filter((a) => a !== code)
      : [...state.addons, code];
    onChange({ addons });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-1">Jouw pakket</h2>
        <p className="text-[#888] text-sm">Bevestig je keuze en voeg eventueel extra's toe</p>
      </div>

      {/* Pakket keuze */}
      <div className="space-y-3">
        {(["BEGIN", "ERFGOED", "VOOR_ALTIJD", "DIGITAAL"] as PackageType[]).map((pkg) => {
          const soldOut = SOLD_OUT_PACKAGES.has(pkg);
          return (
            <label
              key={pkg}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-colors",
                soldOut
                  ? "opacity-60 cursor-not-allowed border-[#e5e0d8] bg-[#f8f6f2]"
                  : state.packageType === pkg
                  ? "cursor-pointer border-[#d4af37] bg-[#d4af37]/10"
                  : "cursor-pointer border-[#e5e0d8] bg-white hover:border-[#d4af37]/50"
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="package"
                  value={pkg}
                  checked={state.packageType === pkg}
                  onChange={() => !soldOut && onChange({ packageType: pkg })}
                  disabled={soldOut}
                  className="accent-[#d4af37]"
                />
                <div>
                  <p className="font-medium text-[#1a1a1a]">{PACKAGE_NAMES[pkg]}</p>
                  {soldOut && <p className="text-xs text-[#e07020] font-medium">Uitverkocht — wachtlijst via /pricing</p>}
                  {!soldOut && pkg === "ERFGOED" && <p className="text-xs text-[#d4af37]">⭐ Meest gekozen</p>}
                  {!soldOut && pkg === "VOOR_ALTIJD" && <p className="text-xs text-[#888]">Launch aanbieding</p>}
                </div>
              </div>
              <span className={cn("font-bold", soldOut ? "text-[#aaa]" : "text-[#1a1a1a]")}>
                €{PACKAGE_PRICES[pkg]}
              </span>
            </label>
          );
        })}
      </div>

      {/* Add-ons */}
      <div>
        <h3 className="font-medium text-[#1a1a1a] mb-3">Maak je cadeau nog specialer</h3>
        <div className="space-y-2">
          {ADDON_OPTIONS.map((addon) => (
            <label
              key={addon.code}
              className={cn(
                "flex items-start justify-between p-4 rounded-xl border cursor-pointer transition-colors",
                state.addons.includes(addon.code)
                  ? "border-[#2d5016] bg-[#2d5016]/5"
                  : "border-[#e5e0d8] bg-white hover:border-[#2d5016]/30"
              )}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={state.addons.includes(addon.code)}
                  onChange={() => toggleAddon(addon.code)}
                  className="mt-1 accent-[#2d5016]"
                />
                <div>
                  <p className="font-medium text-[#1a1a1a] text-sm">{addon.label}</p>
                  <p className="text-xs text-[#888]">{addon.description}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-[#555] ml-4 flex-shrink-0">+€{addon.price}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Kortingscode */}
      <div>
        <h3 className="font-medium text-[#1a1a1a] mb-3">Kortingscode</h3>
        {promoApplied && state.promoCode ? (
          <div className="flex items-center justify-between p-3 bg-[#2d5016]/5 border border-[#2d5016]/30 rounded-xl">
            <div>
              <span className="font-mono font-bold text-[#2d5016] text-sm">{state.promoCode}</span>
              <span className="text-[#2d5016] text-sm ml-2">toegepast</span>
            </div>
            <button
              onClick={handleRemovePromo}
              className="text-xs text-[#888] hover:text-[#e04040] transition-colors underline"
            >
              Verwijder
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
              placeholder="Voer code in"
              maxLength={32}
              className="flex-1 px-4 py-3 rounded-xl border border-[#e5e0d8] bg-white text-[#1a1a1a] font-mono text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
            />
            <button
              onClick={handleApplyPromo}
              disabled={promoLoading || !promoInput.trim()}
              className="px-5 py-3 bg-[#1a1a1a] text-white text-sm font-medium rounded-xl hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {promoLoading ? "..." : "Toepassen"}
            </button>
          </div>
        )}
        {promoError && (
          <p className="text-red-600 text-xs mt-2">{promoError}</p>
        )}
      </div>

      {/* Totaal + CTA */}
      <div className="bg-white rounded-xl border border-[#e5e0d8] p-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[#888] text-sm">{PACKAGE_NAMES[state.packageType]}</span>
          <span className="text-[#333]">€{PACKAGE_PRICES[state.packageType]}</span>
        </div>
        {state.addons.length > 0 && (
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#888] text-sm">Extra's ({state.addons.length})</span>
            <span className="text-[#333]">+€{totalAddons}</span>
          </div>
        )}
        {ebDiscount > 0 && (
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#2d5016] text-sm font-medium">⚡ Early Bird korting</span>
            <span className="text-[#2d5016] font-medium">−€{ebDiscount}</span>
          </div>
        )}
        {promoDiscount > 0 && (
          <div className="flex justify-between items-center mb-1">
            <span className="text-[#2d5016] text-sm font-medium">Kortingscode {state.promoCode}</span>
            <span className="text-[#2d5016] font-medium">−€{promoDiscount}</span>
          </div>
        )}
        <div className="flex justify-between items-center font-bold text-[#1a1a1a] border-t border-[#f0ece6] pt-2 mt-2">
          <span>Totaal</span>
          <span>{total === 0 ? "Gratis 🎉" : `€${total}`}</span>
        </div>
        <p className="text-xs text-[#888] mt-1">Inclusief gratis verzending</p>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-[#d4af37] hover:bg-[#c49e2a] text-[#1a1a1a] font-bold py-4 rounded-xl transition-colors text-lg"
      >
        Volgende: Personaliseer →
      </button>
    </div>
  );
}
