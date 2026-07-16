import type { Metadata } from "next";
import LandingClient from "./LandingClient";
import { buildProductJsonLd } from "@/lib/pricing";

export const metadata: Metadata = {
  title: { absolute: "Levensverhaal vastleggen? De complete oplossing [2026] | BewaardVoorJou.nl" },
  description:
    "Je levensverhaal vastleggen in eigen woorden, met AI die de vragen stelt. Geen dure ghostwriter, geen ervaring nodig. Gratis te starten zonder creditcard.",
  alternates: {
    canonical: "https://bewaardvoorjou.nl/levensverhaal-vastleggen",
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://bewaardvoorjou.nl/levensverhaal-vastleggen",
    title: "Levensverhaal vastleggen? De complete oplossing [2026]",
    description:
      "Je levensverhaal vastleggen met AI-begeleiding. Geen dure ghostwriter, geen ervaring nodig. Gratis te starten zonder creditcard.",
    siteName: "BewaardVoorJou.nl",
    images: [
      {
        url: "/Logo_Bewaardvoorjou.png",
        width: 1200,
        height: 630,
        alt: "Je levensverhaal vastleggen met BewaardVoorJou.nl",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: "Levensverhaal vastleggen",
      description:
        "Je levensverhaal vastleggen met AI die de vragen stelt. Geen ghostwriter, geen schrijfervaring nodig. Gratis starten.",
      url: "https://bewaardvoorjou.nl/levensverhaal-vastleggen",
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://bewaardvoorjou.nl" },
          {
            "@type": "ListItem",
            position: 2,
            name: "Levensverhaal vastleggen",
            item: "https://bewaardvoorjou.nl/levensverhaal-vastleggen",
          },
        ],
      },
    },
    buildProductJsonLd({
      name: "BewaardVoorJou.nl — Levensverhaal vastleggen",
      description:
        "Je levensverhaal vastleggen met een AI-interviewer die de vragen stelt. Kies uit drie pakketten: Verhaal, Erfgoed of Nalatenschap.",
      url: "https://bewaardvoorjou.nl/levensverhaal-vastleggen",
      offers: [{ code: "VERHAAL" }, { code: "ERFGOED" }, { code: "NALATENSCHAP" }],
    }),
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingClient />
    </>
  );
}
