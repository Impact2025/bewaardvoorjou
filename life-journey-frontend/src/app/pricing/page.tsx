import type { Metadata } from "next";
import PricingContent from "./PricingContent";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { buildProductJsonLd, priceLabel, SITE_URL } from "@/lib/pricing";

const PAGE_URL = `${SITE_URL}/pricing`;

const PACKAGE_SUMMARY = `Verhaal (${priceLabel("VERHAAL")}), Erfgoed (${priceLabel(
  "ERFGOED",
)}) of Nalatenschap (${priceLabel("NALATENSCHAP")} eenmalig, levenslang)`;

const DESCRIPTION = `Bekijk de BewaardVoorJou prijzen. Kies het pakket dat past bij jouw moment: ${PACKAGE_SUMMARY}. Gratis te starten, geen creditcard nodig.`;

export const metadata: Metadata = {
  title: "Pakketten & Prijzen — Bewaardvoorjou",
  description: DESCRIPTION,
  openGraph: {
    title: "Pakketten & Prijzen | BewaardVoorJou.nl",
    description: DESCRIPTION,
    url: PAGE_URL,
  },
  alternates: {
    canonical: PAGE_URL,
  },
};

const pricingJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: "Pakketten & Prijzen — Bewaardvoorjou",
      description: DESCRIPTION,
      url: PAGE_URL,
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Pakketten & Prijzen",
            item: PAGE_URL,
          },
        ],
      },
    },
    // Losse Product-nodes, geen ItemList: producten die als ListItem in een
    // ItemList hangen tellen niet mee als product-snippet en waren daardoor
    // onzichtbaar in Search Console.
    buildProductJsonLd({
      name: "Verhaal — het complete digitale levensverhaal",
      description:
        "Het complete digitale levensverhaal: alle 58 hoofdstukken, onbeperkte gesprekssessies met de persoonlijke gespreksleider, digitaal archief, deellinks met verlooptijd en PDF-export.",
      url: PAGE_URL,
      offers: [{ code: "VERHAAL" }],
    }),
    buildProductJsonLd({
      name: "Erfgoed — met de fysieke herinneringsdoos",
      description:
        "Alles van Verhaal, plus de Erfgoed Box: een A5 magneetdoos, een handgemaakte USB-stick in walnotenhout, een grafiet potlood en een A6 notitieboekje. Tot 5 familieleden lezen mee.",
      url: PAGE_URL,
      offers: [{ code: "ERFGOED" }],
    }),
    buildProductJsonLd({
      name: "Nalatenschap — eenmalig betalen, voor altijd bewaard",
      description:
        "Levenslange digitale toegang voor een eenmalig bedrag. Inclusief de Erfgoed Box, een certificaat in waszegel-envelop, toegang voor 5 familieleden en een jaarlijkse USB-export backup.",
      url: PAGE_URL,
      offers: [{ code: "NALATENSCHAP" }],
    }),
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
