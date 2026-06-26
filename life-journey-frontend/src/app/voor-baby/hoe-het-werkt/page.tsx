import type { Metadata } from "next";
import { HoeHetWerktContent } from "./_content";

export const metadata: Metadata = {
  title: "Hoe werkt Bewaard voor Baby? | BewaardVoorJou.nl",
  description:
    "In 7 stappen leg je het complete eerste jaar van jullie baby vast. Wekelijkse vragen in je inbox, mijlpalen bijhouden, grootouder-updates en een gedrukt fotoboek na een jaar.",
  alternates: {
    canonical: "https://bewaardvoorjou.nl/voor-baby/hoe-het-werkt",
  },
  openGraph: {
    title: "Hoe werkt Bewaard voor Baby?",
    description:
      "In 7 stappen leg je het complete eerste jaar van jullie baby vast — inclusief FAQ en cadeau-opties.",
    url: "https://bewaardvoorjou.nl/voor-baby/hoe-het-werkt",
  },
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Hoe werkt Bewaard voor Baby?",
  description:
    "In 7 stappen leg je het complete eerste jaar van jullie baby vast.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Koop het cadeau",
      text: "Koop Bewaard voor Baby voor €59 eenmalig — als kraamcadeau of voor jezelf.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Activeer het babyboek",
      text: "Vul de naam en geboortedatum van de baby in. Duurt minder dan 5 minuten.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Kies jullie rol",
      text: "Kies of je moeder, partner of samen bent. Dit bepaalt hoe de AI-vragen worden gesteld.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Nodig de partner en grootouders uit",
      text: "Voeg e-mailadressen toe. Partner schrijft mee, grootouders krijgen maandelijkse updates.",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Ontvang wekelijkse vragen",
      text: "Elke week een warme, persoonlijke vraag in je inbox, passend bij de ontwikkelingsfase.",
    },
    {
      "@type": "HowToStep",
      position: 6,
      name: "Markeer mijlpalen",
      text: "Eerste glimlach, eerste stapje, eerste woordje — markeer ze met datum, foto en verhaal.",
    },
    {
      "@type": "HowToStep",
      position: 7,
      name: "Claim je fotoboek",
      text: "Na 12 maanden ontvang je een voucher voor een professioneel gedrukt fotoboek.",
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is het moeilijk in gebruik?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nee — als je een e-mail kunt lezen en sturen, kun je dit. Je ontvangt elke week gewoon een vraag in je inbox en schrijft je antwoord.",
      },
    },
    {
      "@type": "Question",
      name: "Kan ik het cadeau geven terwijl de baby er nog niet is?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absoluut. Je kunt het cadeau geven vóór de geboorte. De ontvanger activeert het zodra de baby geboren is. De activatiecode is een jaar geldig.",
      },
    },
    {
      "@type": "Question",
      name: "Schrijft de partner dan dezelfde dingen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nee — de partner krijgt eigen, aangepaste vragen geschreven vanuit het perspectief van de partner. Zo ontstaan twee unieke verhalen over hetzelfde jaar.",
      },
    },
    {
      "@type": "Question",
      name: "Hoe ontvangen opa en oma de maandelijkse updates?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Via e-mail, automatisch. Zij hoeven niets te installeren of in te loggen. Elke maand ontvangen ze een overzicht van nieuwe mijlpalen.",
      },
    },
    {
      "@type": "Question",
      name: "Wanneer ontvang ik de fotoboek-voucher?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Zodra je alle 12 maandelijkse hoofdstukken hebt afgerond, verschijnt er in het dashboard een knop om de voucher op te halen.",
      },
    },
    {
      "@type": "Question",
      name: "Hoelang heb ik toegang?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Eén jaar volledige toegang na activatie. Na het jaar blijft je babyboek leesbaar en deelbaar.",
      },
    },
  ],
};

export default function HoeHetWerktPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HoeHetWerktContent />
    </>
  );
}
