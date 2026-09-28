import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const alt = "Origineel cadeau voor opa van 80 jaar: zijn levensverhaal | BewaardVoorJou.nl";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return renderOgCard({
    title: "Cadeau voor opa van 80",
    subtitle: "Zijn levensverhaal, voor altijd bewaard",
    description: "Een geduldige gespreksleider stelt de vragen. Zijn stem en verhalen blijven bewaard voor de familie.",
    bullets: ["Cadeaubon om te printen", "Kies zelf de datum", "Inspreken, video of typen"],
  });
}
