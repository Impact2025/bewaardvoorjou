import type { Metadata } from "next";
import PricingContent from "./PricingContent";

export const metadata: Metadata = {
  title: "Pakketten & Prijzen — Bewaardvoorjou",
  description:
    "Eenmalige betaling. Geen abonnement. Kies het pakket dat past bij jouw moment: Het Begin (€89), De Erfgoed Box (€249) of Voor Altijd (€399).",
  openGraph: {
    title: "Pakketten & Prijzen | BewaardVoorJou.nl",
    description:
      "Eenmalige betaling. Geen abonnement. Kies het pakket dat past bij jouw moment: Het Begin (€89), De Erfgoed Box (€249) of Voor Altijd (€399).",
    url: "https://bewaardvoorjou.nl/pricing",
  },
  alternates: {
    canonical: "https://bewaardvoorjou.nl/pricing",
  },
};

const pricingJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "BewaardVoorJou.nl Pakketten",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "Product",
        name: "Het Begin",
        description: "Voor wie voorzichtig wil beginnen. 3 levensfasen, 30 AI-interviews, 50 foto's, 3 jaar cloud-opslag.",
        offers: {
          "@type": "Offer",
          price: "89",
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
        name: "De Erfgoed Box",
        description: "De complete ervaring om samen te beleven. Premium magneetdoos, onbeperkte AI-interviews, 10 jaar cloud-opslag.",
        offers: {
          "@type": "Offer",
          price: "249",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
        },
      },
    },
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "Product",
        name: "Voor Altijd",
        description: "Het ultieme erfstuk voor generaties. Levenslange cloud-opslag, 60 min biografie video-consult, testament-integratie.",
        offers: {
          "@type": "Offer",
          price: "399",
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
