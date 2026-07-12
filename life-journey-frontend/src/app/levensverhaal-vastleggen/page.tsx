import type { Metadata } from "next";
import LandingClient from "./LandingClient";

export const metadata: Metadata = {
  title: { absolute: "Levensverhaal vastleggen? De complete oplossing [2026] | BewaardVoorJou.nl" },
  description:
    "Je levensverhaal vastleggen in je eigen woorden, met AI die de vragen stelt. Geen dure ghostwriter, geen schrijfervaring nodig. Gratis te starten.",
  alternates: {
    canonical: "https://bewaardvoorjou.nl/levensverhaal-vastleggen",
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://bewaardvoorjou.nl/levensverhaal-vastleggen",
    title: "Levensverhaal vastleggen? De complete oplossing [2026]",
    description:
      "Je levensverhaal vastleggen met AI-begeleiding. Geen ghostwriter nodig, geen schrijfervaring. Gratis starten.",
    siteName: "BewaardVoorJou.nl",
    images: [
      {
        url: "/Logo_Bewaardvoorjou.png",
        width: 1200,
        height: 630,
        alt: "Je levensverhaal vastleggen met BewaardVoorJou.nl",
      },
    ],
  },
};

export default function Page() {
  return <LandingClient />;
}
