import type { Metadata } from "next";
import Home from "./HomeClient";

export const metadata: Metadata = {
  title: "Bewaard voor jou – Bewaar je levensverhaal met AI | BewaardVoorJou.nl",
  description:
    "Leg je levensverhaal stap voor stap vast met een empathische AI-interviewer. Geen schrijfervaring nodig. Deel veilig met je familie. Gratis te starten.",
  alternates: {
    canonical: "https://bewaardvoorjou.nl",
  },
};

// Organization- en WebSite-JSON-LD staan sitebreed in app/layout.tsx.
export default function HomePage() {
  return <Home />;
}
