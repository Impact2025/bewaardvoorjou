import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const alt = "Vaderdag cadeau: zijn levensverhaal, voor altijd bewaard | BewaardVoorJou.nl";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return renderOgCard({
    title: "Vaderdag cadeau",
    subtitle: "Zijn verhaal, voor altijd bewaard",
    description: "Een geduldige gespreksleider stelt de vragen. Zijn stem, zijn lach en zijn wijsheid blijven bewaard.",
    bullets: ["Zijn stem blijft bewaard", "Inspreken, video of typen", "58 hoofdstukken"],
  });
}
