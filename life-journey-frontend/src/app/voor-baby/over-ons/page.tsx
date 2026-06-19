import type { Metadata } from "next";
import { OverOnsContent } from "./_content";

export const metadata: Metadata = {
  title: "Over Bewaard voor Baby | BewaardVoorJou.nl",
  description:
    "Waarom wij Bewaard voor Baby gebouwd hebben — het verhaal achter het digitale babyboek dat ouders helpt het eerste jaar te bewaren met wekelijkse vragen, mijlpalen en een gedrukt fotoboek.",
  alternates: {
    canonical: "https://bewaardvoorjou.nl/voor-baby/over-ons",
  },
  openGraph: {
    title: "Over Bewaard voor Baby",
    description:
      "Het eerste jaar gaat razendsnel. Wij helpen ouders elk moment te bewaren — met warmte, privacy en zonder gedoe.",
    url: "https://bewaardvoorjou.nl/voor-baby/over-ons",
  },
};

export default function OverOnsPage() {
  return <OverOnsContent />;
}
