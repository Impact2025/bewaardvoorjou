import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const alt = "Persoonlijk cadeau voor je vader: zijn verhaal, voor altijd bewaard | BewaardVoorJou.nl";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return renderOgCard({
    title: "Een cadeau voor je vader",
    subtitle: "Zijn verhaal, voor altijd bewaard",
    description: "Laat hem vertellen over zijn leven. Zijn stem en verhalen blijven bewaard voor de familie.",
    bullets: ["Cadeaubon om te printen", "Kies zelf de datum", "Inspreken, video of typen"],
  });
}
