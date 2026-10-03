import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const alt = "Persoonlijk cadeau voor je moeder: haar verhaal, voor altijd bewaard | BewaardVoorJou.nl";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return renderOgCard({
    title: "Een cadeau voor je moeder",
    subtitle: "Haar verhaal, voor altijd bewaard",
    description: "Laat haar vertellen over haar leven. Haar stem en verhalen blijven bewaard voor de familie.",
    bullets: ["Cadeaubon om te printen", "Kies zelf de datum", "Inspreken, video of typen"],
  });
}
