import type { Metadata } from "next";
import Home from "./HomeClient";

export const metadata: Metadata = {
  title: "Bewaard voor jou – Bewaar je levensverhaal met AI | BewaardVoorJou.nl",
  description:
    "Leg je levensverhaal stap voor stap vast met een empathische AI-interviewer. Geen schrijfervaring nodig. Deel veilig met je familie. Gratis te starten.",
  alternates: {
    canonical: "https://bewaardvoorjou.nl",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BewaardVoorJou.nl",
  url: "https://bewaardvoorjou.nl",
  logo: "https://bewaardvoorjou.nl/Logo_Bewaardvoorjou.png",
  description:
    "Platform om je levensverhaal vast te leggen met AI-begeleiding en veilig te delen met familie.",
  sameAs: [],
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BewaardVoorJou.nl",
  url: "https://bewaardvoorjou.nl",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://bewaardvoorjou.nl/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <Home />
    </>
  );
}
