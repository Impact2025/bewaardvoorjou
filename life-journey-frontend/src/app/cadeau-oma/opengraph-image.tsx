import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const alt = "Origineel cadeau voor oma: haar verhaal, voor altijd bewaard | BewaardVoorJou.nl";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return renderOgCard({
    title: "Een cadeau voor oma",
    subtitle: "Haar verhaal, voor altijd bewaard",
    description: "Laat oma vertellen over vroeger. Haar stem en verhalen blijven bewaard voor de kleinkinderen.",
    bullets: ["Cadeaubon om te printen", "Kies zelf de datum", "Inspreken, video of typen"],
  });
}
