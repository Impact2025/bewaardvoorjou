"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, Mail, Package, Truck, Clock } from "lucide-react";
import { PACKAGE_NAMES } from "@/lib/api/orders";
import { type CheckoutState } from "./CheckoutContent";

interface Props {
  state: CheckoutState;
}

export default function StepConfirmation({ state }: Props) {
  const router = useRouter();
  const hasRecipientEmail = !!state.recipientEmail;
  const hasAddress = !state.skipShipping && !!state.shippingAddress.city;

  const nextSteps = [
    {
      icon: Mail,
      title: hasRecipientEmail
        ? `Welkomstlink verstuurd naar ${state.recipientEmail}`
        : "Bevestigingsmail verstuurd",
      desc: hasRecipientEmail
        ? "De ontvanger kan direct inloggen en beginnen met herinneringen vastleggen."
        : "Check je inbox voor de bestelbevestiging en je digitale toegang.",
    },
    hasAddress
      ? {
          icon: Truck,
          title: "Doos bezorging: september",
          desc: `We sturen de fysieke doos naar ${state.shippingAddress.city} zodra de voorraad klaar is.`,
        }
      : {
          icon: Clock,
          title: "Doos-adres later invullen",
          desc: "Je ontvangt een herinnering in september om je bezorgadres door te geven.",
        },
    {
      icon: Package,
      title: "Box wordt zorgvuldig ingepakt",
      desc: "Elke box is uniek — ons team pakt hem persoonlijk in voor september.",
    },
  ];

  return (
    <div className="space-y-8 text-center">
      {/* Succes */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 bg-[#2d5016]/10 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-[#2d5016]" />
        </div>
        <div>
          <h2 className="font-serif text-3xl font-bold text-[#1a1a1a] mb-2">
            Bedankt voor je bestelling!
          </h2>
          <p className="text-[#888]">
            {hasRecipientEmail
              ? `De digitale welkomstlink is verstuurd naar ${state.recipientEmail}.`
              : "Je digitale toegang is direct actief."}
          </p>
        </div>
      </div>

      {/* Bestelling samenvatting */}
      <div className="bg-[#1a1a1a] rounded-2xl p-6 text-white text-left">
        <h3 className="font-serif font-bold text-lg mb-4 text-[#d4af37]">Jouw bestelling</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#aaa]">Pakket</span>
            <span>{PACKAGE_NAMES[state.packageType]}</span>
          </div>
          {state.recipientName && (
            <div className="flex justify-between">
              <span className="text-[#aaa]">Voor</span>
              <span>{state.recipientName}</span>
            </div>
          )}
          {state.orderId && (
            <div className="flex justify-between">
              <span className="text-[#aaa]">Bestelnummer</span>
              <span className="font-mono text-xs">{state.orderId.slice(0, 8).toUpperCase()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[#aaa]">Doos bezorging</span>
            <span>{hasAddress ? `${state.shippingAddress.city} · september` : "Adres volgt (september)"}</span>
          </div>
        </div>
      </div>

      {/* Wat nu? */}
      <div className="bg-white rounded-2xl border border-[#e5e0d8] p-6 text-left">
        <h3 className="font-medium text-[#1a1a1a] mb-4">Wat gebeurt er nu?</h3>
        <div className="space-y-4">
          {nextSteps.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-[#d4af37]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-[#d4af37]" />
                </div>
                <div>
                  <p className="font-medium text-[#1a1a1a] text-sm">{item.title}</p>
                  <p className="text-[#888] text-xs">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cadeau bevestiging — ontvanger heeft welkomstlink gekregen */}
      {hasRecipientEmail ? (
        <div className="bg-[#f0f7eb] rounded-2xl border border-[#2d5016]/20 p-6 text-left">
          <h3 className="font-medium text-[#2d5016] mb-2">✓ Cadeau verstuurd</h3>
          <p className="text-sm text-[#555]">
            {state.recipientName ? `${state.recipientName} heeft` : "De ontvanger heeft"} een
            persoonlijke welkomstlink ontvangen op{" "}
            <span className="font-medium">{state.recipientEmail}</span>.
          </p>
        </div>
      ) : (
        <div className="bg-[#f0f7eb] rounded-2xl border border-[#2d5016]/20 p-6 text-left">
          <h3 className="font-medium text-[#2d5016] mb-2">✓ Digitale toegang geactiveerd</h3>
          <p className="text-sm text-[#555]">
            Maak een account aan en begin direct met het vastleggen van herinneringen — de box
            volgt in september.
          </p>
          <div className="mt-3 flex gap-2">
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
