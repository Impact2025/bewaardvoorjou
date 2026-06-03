"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createPaymentIntent, PACKAGE_NAMES, ADDON_OPTIONS } from "@/lib/api/orders";
import { type CheckoutState } from "./CheckoutContent";
import { Shield, Lock } from "lucide-react";

interface Props {
  state: CheckoutState;
  totalPrice: number;
  onSuccess: (orderId: string) => void;
}

export default function StepPayment({ state, totalPrice, onSuccess }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
          recipient_email: state.recipientEmail || undefined,
          personal_message: state.personalMessage,
          shipping_address: state.skipShipping ? undefined : state.shippingAddress,
          guest_email: state.guestEmail || undefined,
        });
        if (!cancelled) {
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
  }, []);  // Alleen bij mount — intentioneel

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#888] text-sm">Betaalpagina voorbereiden...</p>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (!clientSecret || !publishableKey) return null;

  const stripePromise = loadStripe(publishableKey);

  return (
    <Elements
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
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-1">Betalen</h2>
        <p className="text-[#888] text-sm">Kies je betaalmethode — iDEAL, creditcard of Klarna</p>
      </div>

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
            paymentMethodOrder: ["ideal", "card"],
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
            Betaal €{totalPrice} →
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
