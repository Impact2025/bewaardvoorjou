import type { Metadata } from "next";
import Home from "./HomeClient";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://bewaardvoorjou.nl",
  },
};

export default function HomePage() {
  return <Home />;
}
