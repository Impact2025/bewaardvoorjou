import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

export const alt = "Kerstcadeau voor ouders die alles al hebben: hun eigen verhaal | BewaardVoorJou.nl";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OgImage() {
  return renderOgCard({
    title: "Kerstcadeau voor je ouders",
    subtitle: "Hun eigen verhaal, voor altijd bewaard",
    description: "Zij vertellen, een geduldige gespreksleider stelt de vragen. Ook op 24 december nog te geven.",
    bullets: ["Cadeaubon om te printen", "Kies zelf de datum", "Inspreken, video of typen"],
  });
}
