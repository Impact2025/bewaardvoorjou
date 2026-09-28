import Link from "next/link";
import { ArrowRight, CheckCircle, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ERFGOED_SOLD_OUT,
  PACKAGES,
  giftCheckoutPath,
  giftPackage,
  priceLabel,
} from "@/lib/pricing";

const VERHAAL_FEATURES = [
  "Alle 58 hoofdstukken van een heel leven",
  "Een geduldige gespreksleider in het Nederlands",
  "Inspreken, video opnemen of typen",
  "Digitaal archief met deellinks en PDF-export",
  "Toegang start direct na betaling",
];

const ERFGOED_FEATURES = [
  "Alles van Verhaal",
  "Luxe A5 magneetdoos met USB-stick in walnotenhout",
  "Grafietpotlood en A6-notitieboekje",
  "Tot 5 familieleden lezen mee",
];

/**
 * Het cadeau-aanbod op een landingspagina. Leest de voorraadvlaggen uit
 * lib/pricing.ts, zodat een pagina nooit iets aanprijst dat de checkout
 * daarna weigert.
 */
export function GiftOffer({ recipient = "hem of haar" }: { recipient?: string }) {
  const code = giftPackage();
  const features = code === "ERFGOED" ? ERFGOED_FEATURES : VERHAAL_FEATURES;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl border-2 border-[#d4af37] shadow-2xl overflow-hidden">
      <div className="bg-[#d4af37] text-[#1a1a1a] text-xs font-bold text-center py-2 tracking-widest">
        DIRECT CADEAU TE GEVEN
      </div>
      <div className="p-8">
        <div className="flex items-center gap-2 text-orange text-xs font-bold uppercase tracking-widest mb-1">
          <Gift className="h-4 w-4" /> Pakket {PACKAGES[code].name}
        </div>
        <div className="mb-1">
          <span className="text-4xl font-bold text-slate-900">{priceLabel(code)}</span>
        </div>
        <p className="text-slate-500 text-sm mb-6">
          Jij betaalt, {recipient} ontvangt een persoonlijke uitnodiging per e-mail.
        </p>
        <ul className="space-y-2.5 mb-7">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>
        <Button
          asChild
          className="w-full bg-orange hover:bg-orange/90 text-white font-bold py-6 text-base"
        >
          <Link href={giftCheckoutPath(code)}>
            Geef dit cadeau <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        {ERFGOED_SOLD_OUT && (
          <p className="text-xs text-slate-500 mt-4 text-center leading-relaxed">
            De fysieke Erfgoed Box is tijdelijk uitverkocht. Op de{" "}
            <Link href="/pricing" className="underline hover:text-orange">
              prijspagina
            </Link>{" "}
            meld je je aan voor de wachtlijst.
          </p>
        )}
        <p className="text-xs text-slate-400 mt-3 text-center">
          Liever eerst proberen?{" "}
          <Link href="/register" className="underline hover:text-orange">
            Start gratis met 3 hoofdstukken
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

/**
 * Korte melding voor pagina's die de doos beschrijven. Rendert niets zolang
 * de doos leverbaar is.
 */
export function BoxSoldOutNotice({ className = "" }: { className?: string }) {
  if (!ERFGOED_SOLD_OUT) return null;
  return (
    <div
      role="note"
      className={`rounded-xl border border-orange/40 bg-[#fff7ef] px-5 py-4 text-sm text-slate-800 ${className}`}
    >
      <strong>Let op:</strong> de fysieke Erfgoed Box is tijdelijk uitverkocht. Het
      digitale pakket Verhaal ({priceLabel("VERHAAL")}) kun je nu al cadeau geven,
      en voor de doos staat een{" "}
      <Link href="/pricing" className="underline font-medium hover:text-orange">
        wachtlijst
      </Link>{" "}
      open.
    </div>
  );
}
