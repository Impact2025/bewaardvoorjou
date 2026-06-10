"use client";

import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createPaymentIntent, PACKAGE_NAMES, ADDON_OPTIONS } from "@/lib/api/orders";
import { validatePromoCode } from "@/lib/api/promo-codes";
import { type CheckoutState } from "./CheckoutContent";
import { Shield, Lock } from "lucide-react";

interface Props {
  state: CheckoutState;
  totalPrice: number;
  onChange: (updates: Partial<CheckoutState>) => void;
  onSuccess: (orderId: string) => void;
}

export default function StepPayment({ state, totalPrice, onChange, onSuccess }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // (Her)initialiseer de PaymentIntent. Draait bij mount en telkens als de
  // kortingscode wijzigt — het bedrag verandert dan, dus Stripe heeft een
  // nieuwe PaymentIntent (en client secret) nodig.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError(null);
      try {
        const result = await createPaymentIntent({
          package_type: state.packageType,
          addons: state.addons,
          recipient_name: state.recipientName,
          recipient_email: state.forSelf ? state.guestEmail : (state.recipientEmail || undefined),
          personal_message: state.personalMessage,
          shipping_address: state.skipShipping ? undefined : state.shippingAddress,
          guest_email: state.guestEmail || undefined,
          promo_code: state.promoCode || undefined,
        });
        if (!cancelled) {
          if (result.amount_cents === 0) {
            // Gratis order (bijv. 100%-kortingscode) — geen Stripe nodig
            onSuccess(result.order_id);
            return;
          }
          setClientSecret(result.client_secret);
          setPublishableKey(result.publishable_key);
          setOrderId(result.order_id);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Betaling kon niet worden gestart");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
    // Her-init bij wijziging van de kortingscode (bedrag verandert)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.promoCode]);

  const stripePromise = useMemo(
    () => (publishableKey ? loadStripe(publishableKey) : null),
    [publishableKey]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-1">Betalen</h2>
        <p className="text-[#888] text-sm">Kies je betaalmethode — iDEAL, creditcard of Bancontact</p>
      </div>

      {/* Kortingscode — ook hier zodat het bij het afrekenen vindbaar is */}
      <PromoField state={state} onChange={onChange} disabled={loading} />

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#888] text-sm">Betaalpagina voorbereiden...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium mb-2">Oops, er ging iets mis</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            Opnieuw proberen
          </button>
        </div>
      )}

      {!loading && !error && clientSecret && stripePromise && (
        <Elements
          key={clientSecret}
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#d4af37",
                colorBackground: "#ffffff",
                colorText: "#1a1a1a",
                colorDanger: "#df1b41",
                fontFamily: "Inter, sans-serif",
                borderRadius: "8px",
              },
            },
            locale: "nl",
          }}
        >
          <PaymentForm
            state={state}
            totalPrice={totalPrice}
            orderId={orderId}
            onSuccess={onSuccess}
          />
        </Elements>
      )}
    </div>
  );
}

function PromoField({
  state,
  onChange,
  disabled,
}: {
  state: CheckoutState;
  onChange: (updates: Partial<CheckoutState>) => void;
  disabled: boolean;
}) {
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const applied = !!state.promoCode;

  const handleApply = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    setPromoError(null);
    try {
      const result = await validatePromoCode(code, state.packageType);
      if (result.valid) {
        // Werkt de parent-state bij → triggert her-init van de PaymentIntent
        onChange({ promoCode: code, promoDiscountCents: result.discount_cents });
        setPromoInput("");
      } else {
        setPromoError(result.error ?? "Ongeldige code");
      }
    } catch {
      setPromoError("Validatie mislukt, probeer opnieuw");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemove = () => {
    setPromoError(null);
    setPromoInput("");
    onChange({ promoCode: "", promoDiscountCents: 0 });
  };

  return (
    <div className="bg-white rounded-xl border border-[#e5e0d8] p-4">
      <h3 className="font-medium text-[#1a1a1a] text-sm mb-1">Kortingscode</h3>
      <p className="text-xs text-[#888] mb-3">Heb je een code? Voer hem hier in.</p>

      {applied ? (
        <div className="flex items-center justify-between p-3 bg-[#2d5016]/5 border border-[#2d5016]/30 rounded-xl">
          <div>
            <span className="font-mono font-bold text-[#2d5016] text-sm">{state.promoCode}</span>
            <span className="text-[#2d5016] text-sm ml-2">toegepast</span>
          </div>
          <button
            onClick={handleRemove}
            disabled={disabled}
            className="text-xs text-[#888] hover:text-[#e04040] transition-colors underline disabled:opacity-50"
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
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="Voer code in"
            maxLength={32}
            className="flex-1 px-4 py-3 rounded-xl border border-[#e5e0d8] bg-white text-[#1a1a1a] font-mono text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
          />
          <button
            onClick={handleApply}
            disabled={promoLoading || !promoInput.trim()}
            className="px-5 py-3 bg-[#1a1a1a] text-white text-sm font-medium rounded-xl hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {promoLoading ? "..." : "Toepassen"}
          </button>
        </div>
      )}
      {promoError && <p className="text-red-600 text-xs mt-2">{promoError}</p>}
    </div>
  );
}

function PaymentForm({
  state,
  totalPrice,
  orderId,
  onSuccess,
}: {
  state: CheckoutState;
  totalPrice: number;
  orderId: string;
  onSuccess: (orderId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAddons = state.addons.reduce((sum, code) => {
    const opt = ADDON_OPTIONS.find((o) => o.code === code);
    return sum + (opt?.price ?? 0);
  }, 0);
  const promoDiscount = state.promoDiscountCents / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    // Return URL voor iDEAL redirect (na bank-redirect)
    const returnUrl = `${window.location.origin}/checkout?step=confirmation&order_id=${orderId}`;

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
    });

    // Als we hier komen is de redirect niet gelukt (bijv. kaartbetaling mislukt)
    if (stripeError) {
      setError(
        stripeError.type === "card_error" || stripeError.type === "validation_error"
          ? stripeError.message ?? "Betaling mislukt"
          : "Er is een onverwachte fout opgetreden. Probeer opnieuw."
      );
      setSubmitting(false);
    } else {
      // Niet-redirect betaalmethoden (zeldzaam): direct success
      onSuccess(orderId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Samenvatting */}
      <div className="bg-[#1a1a1a] rounded-xl p-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-serif font-bold text-lg">{PACKAGE_NAMES[state.packageType]}</p>
            {state.recipientName && (
              <p className="text-[#aaa] text-xs mt-0.5">Voor: {state.recipientName}</p>
            )}
            {state.addons.length > 0 && (
              <p className="text-[#888] text-xs mt-0.5">+ {state.addons.length} extra{state.addons.length > 1 ? "'s" : ""} (€{totalAddons})</p>
            )}
            {state.promoCode && (
              <p className="text-[#7bbf6a] text-xs mt-0.5">Kortingscode {state.promoCode}: −€{promoDiscount}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#d4af37]">€{totalPrice}</p>
            <p className="text-xs text-[#666]">eenmalig</p>
          </div>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="bg-white rounded-xl border border-[#e5e0d8] p-5">
        <PaymentElement
          options={{
            layout: "tabs",
            paymentMethodOrder: ["ideal", "card", "bancontact"],
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || !stripe}
        className="w-full bg-[#d4af37] hover:bg-[#c49e2a] disabled:opacity-60 disabled:cursor-not-allowed text-[#1a1a1a] font-bold py-4 rounded-xl transition-colors text-lg flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <div className="w-5 h-5 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin" />
            Betaling verwerken...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            {totalPrice === 0 ? "Bevestig gratis bestelling →" : `Betaal €${totalPrice} →`}
          </>
        )}
      </button>

      {/* Trust */}
      <div className="flex items-center justify-center gap-2 text-xs text-[#aaa]">
        <Shield className="h-3 w-3" />
        <span>Beveiligde betaling via Stripe · SSL-versleuteld</span>
      </div>
    </form>
  );
}
