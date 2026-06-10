import type { Metadata } from "next";
import VaderdagContent from "./VaderdagContent";

export const metadata: Metadata = {
  title: "Vaderdag cadeau — BewaardVoorJou.nl",
  description:
    "Geef je vader het mooiste cadeau: zijn levensverhaal, vastgelegd voor altijd. Een geduldige gespreksleider begeleidt hem door zijn mooiste herinneringen. Bestel vóór 17 juni.",
  openGraph: {
    title: "Vaderdag cadeau — BewaardVoorJou.nl",
    description:
      "Zijn stem, zijn lach, zijn wijsheid — voor altijd bewaard. Het mooiste cadeau voor Vaderdag.",
    images: ["/vaderdag-cadeau.jpg"],
  },
};

export default function VaderdagPage() {
  return <VaderdagContent />;
}
