import type { Metadata } from "next";
import PricingContent from "./PricingContent";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const metadata: Metadata = {
  title: "Pakketten & Prijzen — Bewaardvoorjou",
  description:
    "Bekijk de BewaardVoorJou prijzen: eenmalige betaling. Geen abonnement. Kies het pakket dat past bij jouw moment: Het Begin (€89), De Erfgoed Box (€249) of Voor Altijd (€399).",
  openGraph: {
    title: "Pakketten & Prijzen | BewaardVoorJou.nl",
    description:
      "Bekijk de BewaardVoorJou prijzen: eenmalige betaling. Geen abonnement. Kies het pakket dat past bij jouw moment: Het Begin (€89), De Erfgoed Box (€249) of Voor Altijd (€399).",
    url: "https://bewaardvoorjou.nl/pricing",
  },
  alternates: {
    canonical: "https://bewaardvoorjou.nl/pricing",
  },
};

const PAGE_URL = "https://bewaardvoorjou.nl/pricing";

const pricingJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: "Pakketten & Prijzen — Eenmalige betaling, geen abonnement",
      description:
        "Bekijk de pakketten van BewaardVoorJou.nl: Het Begin (€89), De Erfgoed Box (€249) of Voor Altijd (€399). Eenmalige betaling, geen abonnement.",
      url: PAGE_URL,
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://bewaardvoorjou.nl" },
          {
            "@type": "ListItem",
            position: 2,
            name: "Pakketten & Prijzen",
            item: PAGE_URL,
          },
        ],
      },
    },
    {
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
    },
  ],
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
      <PublicHeader />
      <PricingContent />
      <PublicFooter />
    </div>
  );
}
