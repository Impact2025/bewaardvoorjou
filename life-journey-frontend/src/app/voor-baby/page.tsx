import type { Metadata } from "next";
import { VoorBabyContent } from "./_VoorBabyContent";

export const metadata: Metadata = {
  title: "Bewaard voor Baby — Het digitale babyboek als kraamcadeau",
  description:
    "Het mooiste kraamcadeau: een jaar lang herinneringen bewaren met AI-begeleide vragen, mijlpalen bijhouden en maandelijkse updates voor opa en oma. €59 eenmalig.",
  openGraph: {
    title: "Bewaard voor Baby | BewaardVoorJou.nl",
    description:
      "14 diepgaande hoofdstukken. 28 mijlpalen. Wekelijkse herinneringsvragen. Grootouder-updates. Fotoboek-voucher na een jaar. €59 eenmalig.",
    url: "https://bewaardvoorjou.nl/voor-baby",
  },
  alternates: {
    canonical: "https://bewaardvoorjou.nl/voor-baby",
  },
};

export default function VoorBabyPage() {
  return <VoorBabyContent />;
}
