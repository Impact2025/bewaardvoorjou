import type { Metadata } from "next";
import PricingContent from "./PricingContent";

export const metadata: Metadata = {
  title: "Prijzen & Abonnementen",
  description:
    "Start gratis en bewaar je levensverhaal voor altijd. Kies het plan dat bij jou past — van gratis tot een eenmalige Eeuwig-licentie voor generaties na je.",
  openGraph: {
    title: "Prijzen & Abonnementen | BewaardVoorJou.nl",
    description:
      "Start gratis en bewaar je levensverhaal voor altijd. Kies het plan dat bij jou past — van gratis tot een eenmalige Eeuwig-licentie voor generaties na je.",
    url: "https://bewaardvoorjou.nl/pricing",
  },
  alternates: {
    canonical: "https://bewaardvoorjou.nl/pricing",
  },
};

const pricingJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "BewaardVoorJou.nl Abonnementen",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Product",
        name: "Basis",
        description: "Start gratis met 3 hoofdstukken, 30 minuten opname per maand en basis AI-interviewer.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "Product",
        name: "Familie",
        description: "Alle 19 hoofdstukken, 10 uur opname per maand, familiestamboom en gedeelde pods.",
        offers: {
          "@type": "Offer",
          price: "9.99",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "9.99",
            priceCurrency: "EUR",
            unitCode: "MON",
          },
        },
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "Product",
        name: "Legacy",
        description: "Onbeperkte opnames, voice cloning, fysiek boek per jaar en VIP support.",
        offers: {
          "@type": "Offer",
          price: "19.99",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "19.99",
            priceCurrency: "EUR",
            unitCode: "MON",
          },
        },
      },
    },
    {
      "@type": "ListItem",
      position: 4,
      item: {
        "@type": "Product",
        name: "Eeuwig",
        description: "Eenmalige betaling voor levenslange toegang en 50 jaar bewaargarantie. Overdraagbaar aan nakomelingen.",
        offers: {
          "@type": "Offer",
          price: "499",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
        },
      },
    },
  ],
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
      <PricingContent />
    </>
  );
}
