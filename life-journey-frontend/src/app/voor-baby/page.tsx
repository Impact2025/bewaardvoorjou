import type { Metadata } from "next";
import { VoorBabyContent } from "./_VoorBabyContent";
import { buildProductJsonLd } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Bewaard voor Baby — Het digitale babyboek als kraamcadeau",
  description:
    "Het mooiste kraamcadeau: een jaar lang herinneringen bewaren met AI-begeleide vragen, mijlpalen bijhouden en maandelijkse updates voor opa en oma. Bestel als kraamcadeau voor €59 eenmalig.",
  openGraph: {
    title: "Bewaard voor Baby | BewaardVoorJou.nl",
    description:
      "Het mooiste kraamcadeau: een jaar lang herinneringen bewaren met AI-begeleide vragen, mijlpalen bijhouden en maandelijkse updates voor opa en oma. Bestel als kraamcadeau voor €59 eenmalig.",
    url: "https://bewaardvoorjou.nl/voor-baby",
  },
  alternates: {
    canonical: "https://bewaardvoorjou.nl/voor-baby",
  },
};

const productJsonLd = {
  "@context": "https://schema.org",
  ...buildProductJsonLd({
    name: "Bewaard voor Baby",
    description:
      "Het digitale babyboek als kraamcadeau. Een jaar lang herinneringen bewaren met AI-begeleide vragen, mijlpalen bijhouden en maandelijkse updates voor opa en oma.",
    url: "https://bewaardvoorjou.nl/voor-baby",
    offers: [{ code: "BABY_GIFT" }],
  }),
  category: "Digital Baby Book",
  audience: {
    "@type": "Audience",
    audienceType: "New parents, gift givers",
  },
  featureList:
    "14 diepgaande hoofdstukken, 28 mijlpalen, wekelijkse AI-vragen, partner meeschrijven, grootouder-updates, fotoboek-voucher",
};

export default function VoorBabyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <VoorBabyContent />
    </>
  );
}
