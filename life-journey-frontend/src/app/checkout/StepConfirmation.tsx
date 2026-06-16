"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Mail, Package, Truck, Printer, Phone } from "lucide-react";
import { PACKAGE_NAMES, getOrderStatus, type OrderStatusResponse } from "@/lib/api/orders";
import { type CheckoutState } from "./CheckoutContent";

interface Props {
  state: CheckoutState;
}

export default function StepConfirmation({ state }: Props) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderStatusResponse | null>(null);

  // Haal de gezaghebbende orderdata op (o.a. de redemption-token voor de startkaart).
  useEffect(() => {
    if (!state.orderId) return;
    let active = true;
    getOrderStatus(state.orderId)
      .then((res) => active && setOrder(res))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [state.orderId]);

  const recipientName = order?.recipient_name || state.recipientName || "";
  const recipientEmail = order?.recipient_email || state.recipientEmail || "";
  const hasRecipientEmail = !!recipientEmail;
  const hasShipping = order ? order.has_shipping : !state.skipShipping && !!state.shippingAddress.city;
  const shippingCity = order?.shipping_city || state.shippingAddress.city;
  const redemptionToken = order?.redemption_token || "";
  const isGift = !state.forSelf && (!!recipientName || !!redemptionToken);
  const who = recipientName || "de ontvanger";

  const startkaartUrl = redemptionToken ? `/cadeau/${redemptionToken}` : "";

  return (
    <div className="space-y-8 text-center">
      {/* Succes */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 bg-[#2d5016]/10 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-[#2d5016]" />
        </div>
        <div>
          <h2 className="font-serif text-3xl font-bold text-[#1a1a1a] mb-2">
            {isGift ? `Je cadeau is onderweg naar ${who}` : "Bedankt voor je bestelling!"}
          </h2>
          <p className="text-[#888]">
            {isGift
              ? "We laten je weten zodra het bezorgd is."
              : "Je digitale toegang is direct actief."}
          </p>
        </div>
      </div>

      {/* Startkaart — koper kan deze printen/overhandigen (elk pakket) */}
      {isGift && startkaartUrl && (
        <div className="bg-[#1a1a1a] rounded-2xl p-6 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Printer className="h-5 w-5 text-[#d4af37]" />
            <h3 className="font-serif font-bold text-lg text-[#d4af37]">De startkaart van {who}</h3>
          </div>
          <p className="text-sm text-[#bbb] mb-4">
            Hiermee opent {who} het cadeau — print de kaart of laat de QR-code op je telefoon zien.
            Jouw persoonlijke bericht is het eerste wat ze zien.
          </p>
          <button
            onClick={() => window.open(startkaartUrl, "_blank")}
            className="bg-[#d4af37] hover:bg-[#c49e2a] text-[#1a1a1a] font-bold px-5 py-3 rounded-xl transition-colors"
          >
            Bekijk &amp; print de startkaart →
          </button>
        </div>
      )}

      {/* Bestelling samenvatting */}
      <div className="bg-white rounded-2xl border border-[#e5e0d8] p-6 text-left">
        <h3 className="font-medium text-[#1a1a1a] mb-4">Jouw bestelling</h3>
        <div className="space-y-2 text-sm">
          <Row label="Pakket" value={PACKAGE_NAMES[state.packageType]} />
          {recipientName && <Row label="Voor" value={recipientName} />}
          {state.orderId && (
            <Row label="Bestelnummer" value={state.orderId.slice(0, 8).toUpperCase()} mono />
          )}
        </div>
      </div>

      {/* Wat gebeurt er nu? */}
      <div className="bg-white rounded-2xl border border-[#e5e0d8] p-6 text-left">
        <h3 className="font-medium text-[#1a1a1a] mb-4">Wat gebeurt er nu?</h3>
        <div className="space-y-4">
          {hasRecipientEmail && (
            <NextStep
              icon={Mail}
              title={`Uitnodiging onderweg naar ${recipientEmail}`}
              desc={`${who} ontvangt een persoonlijke link${state.deliveryDate ? ` op ${state.deliveryDate}` : ""}. Jouw bericht is het eerste wat ze zien.`}
            />
          )}
          {hasShipping && (
            <NextStep
              icon={Truck}
              title="Doos wordt verzonden"
              desc={`We sturen de fysieke doos naar ${shippingCity}. Je ontvangt een track & trace zodra het pakket onderweg is.`}
            />
          )}
          {isGift && (
            <NextStep
              icon={Phone}
              title="Ons mooiste advies"
              desc={`Bel ${who} op het moment dat ze het cadeau openen en doe samen het eerste hoofdstuk — jij aan de telefoon, ${who} met de kaart in de hand. Zo begint het verhaal samen.`}
            />
          )}
          {!isGift && (
            <NextStep
              icon={Package}
              title="Begin direct"
              desc="Je digitale toegang is actief. Maak een account aan en leg je eerste herinnering vast."
            />
          )}
        </div>
      </div>

      {!isGift && (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => router.push("/register")}
            className="bg-[#2d5016] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#3a6620] transition-colors"
          >
            Account aanmaken
          </button>
          <button
            onClick={() => router.push("/login")}
            className="border border-[#2d5016] text-[#2d5016] text-sm px-4 py-2 rounded-lg hover:bg-[#2d5016]/5 transition-colors"
          >
            Inloggen
          </button>
        </div>
      )}

      <button
        onClick={() => router.push("/")}
        className="text-sm text-[#888] hover:text-[#1a1a1a] underline underline-offset-2 transition-colors"
      >
        Terug naar de homepage
      </button>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-[#888]">{label}</span>
      <span className={mono ? "font-mono text-xs text-[#1a1a1a]" : "text-[#1a1a1a]"}>{value}</span>
    </div>
  );
}

function NextStep({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 bg-[#d4af37]/20 rounded-full flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-[#d4af37]" />
      </div>
      <div>
        <p className="font-medium text-[#1a1a1a] text-sm">{title}</p>
        <p className="text-[#888] text-xs">{desc}</p>
      </div>
    </div>
  );
}
