"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Mail, Package, Truck, Printer, Phone, FileText } from "lucide-react";
import { PACKAGE_NAMES, getOrderStatus, type OrderStatusResponse } from "@/lib/api/orders";
import { type CheckoutState } from "./CheckoutContent";
import { useBabyTheme } from "@/components/baby/BabyThemeContext";

interface Props {
  state: CheckoutState;
}

export default function StepConfirmation({ state }: Props) {
  const router = useRouter();
  const { t: babyT } = useBabyTheme();
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
  const isBaby = state.packageType === "BABY_GIFT";
  const who = recipientName || "de ontvanger";

  const startkaartUrl = redemptionToken ? `/cadeau/${redemptionToken}` : "";

  return (
    <div className="space-y-8 text-center">
      {/* Succes */}
      <div className="flex flex-col items-center gap-4">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isBaby ? babyT.primaryBgMedium : "bg-[#2d5016]/10"}`}>
          <CheckCircle className={`h-10 w-10 ${isBaby ? babyT.primaryText : "text-[#2d5016]"}`} />
        </div>
        <div>
          <h2 className="font-serif text-3xl font-bold text-[#1a1a1a] mb-2">
            {isGift
              ? isBaby
                ? `Het eerste jaar van ${who} kan beginnen`
                : `Je cadeau is onderweg naar ${who}`
              : isBaby
              ? "Gefeliciteerd! Jouw babyboek is klaar."
              : "Bedankt voor je bestelling!"}
          </h2>
          <p className="text-[#888]">
            {isGift
              ? isBaby
                ? `${who} ontvangt een uitnodiging om direct te starten.`
                : "We laten je weten zodra het bezorgd is."
              : isBaby
              ? "Maak een account aan en leg de eerste herinnering vast."
              : "Je digitale toegang is direct actief."}</p>
        </div>
      </div>

      {/* Startkaart — koper kan deze printen/overhandigen (elk pakket) */}
      {isGift && startkaartUrl && (
        <div className="bg-[#1a1a1a] rounded-2xl p-6 text-left space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Printer className="h-5 w-5 text-[#d4af37]" />
              <h3 className="font-serif font-bold text-lg text-[#d4af37]">Iets voor {who}</h3>
            </div>
            <p className="text-sm text-[#bbb] mb-4">
              Hiermee opent {who} het cadeau — laat de QR-code zien of geef de cadeaubon persoonlijk mee.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Cadeaubon (A4 PDF) */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-[#d4af37]" />
                <p className="text-white text-sm font-semibold">Cadeaubon (A4)</p>
              </div>
              <p className="text-[#999] text-xs mb-3 leading-relaxed">
                Mooie, drukbare cadeaubon met naam, bericht en QR-code. Perfect om in een envelop te doen.
              </p>
              <button
                onClick={() => window.open(`/cadeaubon/${redemptionToken}`, "_blank")}
                className="w-full bg-[#d4af37] hover:bg-[#c49e2a] text-[#1a1a1a] font-bold px-4 py-2.5 rounded-lg transition-colors text-sm"
              >
                Download cadeaubon →
              </button>
            </div>

            {/* Digitale startkaart (QR) */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Printer className="h-4 w-4 text-[#aaa]" />
                <p className="text-white text-sm font-semibold">Digitale startkaart</p>
              </div>
              <p className="text-[#999] text-xs mb-3 leading-relaxed">
                Activatiepagina met QR-code. {who} vult hier hun e-mailadres in om direct te starten.
              </p>
              <button
                onClick={() => window.open(startkaartUrl, "_blank")}
                className="w-full border border-white/20 text-white hover:bg-white/10 font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
              >
                Bekijk startkaart →
              </button>
            </div>
          </div>
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
              isBaby={isBaby}
              babyIconBg={babyT.primaryBgMedium}
              babyIconColor={babyT.primaryText}
            />
          )}
          {hasShipping && (
            <NextStep
              icon={Truck}
              title="Doos wordt verzonden"
              desc={`We sturen de fysieke doos naar ${shippingCity}. Je ontvangt een track & trace zodra het pakket onderweg is.`}
              isBaby={isBaby}
              babyIconBg={babyT.primaryBgMedium}
              babyIconColor={babyT.primaryText}
            />
          )}
          {isGift && (
            <NextStep
              icon={Phone}
              title="Ons mooiste advies"
              desc={
                isBaby
                  ? `Bel ${who} op de kraamdag en vertel dat je dit hebt gegeven. Jouw boodschap is het eerste dat ze lezen wanneer ze het eerste hoofdstuk starten.`
                  : `Bel ${who} op het moment dat ze het cadeau openen en doe samen het eerste hoofdstuk — jij aan de telefoon, ${who} met de kaart in de hand. Zo begint het verhaal samen.`
              }
              isBaby={isBaby}
              babyIconBg={babyT.primaryBgMedium}
              babyIconColor={babyT.primaryText}
            />
          )}
          {!isGift && (
            <NextStep
              icon={Package}
              title={isBaby ? "Begin met het eerste hoofdstuk" : "Begin direct"}
              desc={
                isBaby
                  ? "Je babyboek is klaar. Maak een account aan en begin met het allereerste hoofdstuk: de geboortedag."
                  : "Je digitale toegang is actief. Maak een account aan en leg je eerste herinnering vast."
              }
              isBaby={isBaby}
              babyIconBg={babyT.primaryBgMedium}
              babyIconColor={babyT.primaryText}
            />
          )}
        </div>
      </div>

      {!isGift && (
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            onClick={() =>
              router.push(isBaby ? "/voor-baby/onboarding" : "/register")
            }
            className={`text-sm px-5 py-2.5 rounded-lg transition-colors font-medium ${
              isBaby
                ? `${babyT.primary} ${babyT.primaryHover} text-white`
                : "bg-[#2d5016] text-white hover:bg-[#3a6620]"
            }`}
          >
            {isBaby ? "Begin het eerste jaar →" : "Account aanmaken"}
          </button>
          <button
            onClick={() => router.push("/login")}
            className={`text-sm px-5 py-2.5 rounded-lg transition-colors border ${
              isBaby ? babyT.outlineBtn : "border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016]/5"
            }`}
          >
            Inloggen
          </button>
        </div>
      )}

      <button
        onClick={() => router.push(isBaby ? "/voor-baby" : "/")}
        className="text-sm text-[#888] hover:text-[#1a1a1a] underline underline-offset-2 transition-colors"
      >
        {isBaby ? "Terug naar Bewaard voor Baby" : "Terug naar de homepage"}
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
  isBaby,
  babyIconBg,
  babyIconColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  isBaby?: boolean;
  babyIconBg?: string;
  babyIconColor?: string;
}) {
  return (
    <div className="flex gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isBaby ? babyIconBg : "bg-[#d4af37]/20"}`}>
        <Icon className={`h-4 w-4 ${isBaby ? babyIconColor : "text-[#d4af37]"}`} />
      </div>
      <div>
        <p className="font-medium text-[#1a1a1a] text-sm">{title}</p>
        <p className="text-[#888] text-xs">{desc}</p>
      </div>
    </div>
  );
}
