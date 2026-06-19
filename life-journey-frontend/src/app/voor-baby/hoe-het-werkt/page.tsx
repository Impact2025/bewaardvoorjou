import type { Metadata } from "next";
import { HoeHetWerktContent } from "./_content";

export const metadata: Metadata = {
  title: "Hoe werkt Bewaard voor Baby? | BewaardVoorJou.nl",
  description:
    "In 7 stappen leg je het complete eerste jaar van jullie baby vast. Wekelijkse vragen in je inbox, mijlpalen bijhouden, grootouder-updates en een gedrukt fotoboek na een jaar.",
  alternates: {
    canonical: "https://bewaardvoorjou.nl/voor-baby/hoe-het-werkt",
  },
  openGraph: {
    title: "Hoe werkt Bewaard voor Baby?",
    description:
      "In 7 stappen leg je het complete eerste jaar van jullie baby vast — inclusief FAQ en cadeau-opties.",
    url: "https://bewaardvoorjou.nl/voor-baby/hoe-het-werkt",
  },
};

export default function HoeHetWerktPage() {
  return <HoeHetWerktContent />;
}
