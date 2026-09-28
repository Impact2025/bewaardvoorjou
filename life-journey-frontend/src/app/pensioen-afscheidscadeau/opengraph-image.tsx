import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const alt = "Pensioen afscheidscadeau: een afscheid dat blijft | BewaardVoorJou.nl";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return renderOgCard({
    title: "Pensioen afscheidscadeau",
    subtitle: "Een afscheid dat blijft",
    description: "Een eerbetoon aan een hele loopbaan, van collega's en familie samen.",
    bullets: ["Voor collega's en familie", "Inspreken, video of typen", "Verhalen blijven bewaard"],
  });
}
