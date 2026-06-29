import type { Metadata } from "next";
import VaderdagContent from "./VaderdagContent";

export const metadata: Metadata = {
  title: "Vaderdag cadeau — BewaardVoorJou.nl",
  description:
    "Vaderdag cadeau? Geef je vader zijn levensverhaal, voor altijd bewaard. Maak van Vaderdag een blijvend cadeau. Gratis te starten.",
  alternates: {
    canonical: "https://bewaardvoorjou.nl/vaderdag",
  },
  openGraph: {
    title: "Vaderdag cadeau — BewaardVoorJou.nl",
    description:
      "Vaderdag cadeau? Geef je vader zijn levensverhaal, voor altijd bewaard. Maak van Vaderdag een blijvend cadeau. Gratis te starten.",
    url: "https://bewaardvoorjou.nl/vaderdag",
    images: ["/vaderdag-cadeau.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Vaderdag cadeau — zijn levensverhaal vastgelegd",
  description:
    "Geef je vader het mooiste Vaderdagcadeau: zijn levensverhaal, vastgelegd met een geduldige gespreksleider. Zijn stem, zijn lach, zijn wijsheid — voor altijd bewaard.",
  url: "https://bewaardvoorjou.nl/vaderdag",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://bewaardvoorjou.nl" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Vaderdag cadeau",
        item: "https://bewaardvoorjou.nl/vaderdag",
      },
    ],
  },
};

export default function VaderdagPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VaderdagContent />
    </>
  );
}
