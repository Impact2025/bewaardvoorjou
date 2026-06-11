import type { Metadata } from "next";

const PAGE_URL = "https://bewaardvoorjou.nl/contact";
const TITLE = "Contact | BewaardVoorJou.nl";
const DESCRIPTION =
  "Neem contact op met BewaardVoorJou.nl — voor algemene vragen, ondersteuning of privacy- en gegevensvragen. We helpen je graag verder.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: PAGE_URL,
    siteName: "Bewaard voor jou",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
