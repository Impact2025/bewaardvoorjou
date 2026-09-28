import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const alt = "Mijlpaal cadeau voor 50, 60 of 65 jaar | BewaardVoorJou.nl";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return renderOgCard({
    title: "Mijlpaal cadeau",
    subtitle: "Voor 50, 60 of 65 jaar",
    description: "Geen envelop met geld, maar een eerbetoon dat blijft. Samen te maken met familie of collega's.",
    bullets: ["Samen te geven", "Inspreken, video of typen", "58 hoofdstukken"],
  });
}
