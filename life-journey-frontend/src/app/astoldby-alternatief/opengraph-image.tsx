import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const alt = "AsToldBy alternatief: vertellen in plaats van schrijven | BewaardVoorJou.nl";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return renderOgCard({
    title: "AsToldBy alternatief",
    subtitle: "Vertellen in plaats van schrijven",
    description: "Een eerlijke vergelijking: 52 weekvragen en een boek, of een gespreksleider die met je meepraat.",
    bullets: ["Eerlijke vergelijking", "58 hoofdstukken", "Je stem blijft bewaard"],
  });
}
