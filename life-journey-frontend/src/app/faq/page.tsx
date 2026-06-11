import type { Metadata } from "next";
import FAQContent from "./FAQContent";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const metadata: Metadata = {
  title: "Veelgestelde vragen",
  description:
    "Antwoorden op alle vragen over BewaardVoorJou.nl — van privacy en veiligheid tot hoe de AI-interviewer werkt, wat het kost en hoe je verhalen deelt met familie.",
  openGraph: {
    title: "Veelgestelde vragen | BewaardVoorJou.nl",
    description:
      "Antwoorden op alle vragen over BewaardVoorJou.nl — van privacy en veiligheid tot hoe de AI-interviewer werkt, wat het kost en hoe je verhalen deelt met familie.",
    url: "https://bewaardvoorjou.nl/faq",
  },
  alternates: {
    canonical: "https://bewaardvoorjou.nl/faq",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Wat is BewaardVoorJou.nl precies?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "BewaardVoorJou.nl is een digitaal platform waarmee je jouw levensverhaal op een gestructureerde, empathische manier kunt vastleggen voor toekomstige generaties. Onze AI-interviewer begeleidt je door 58 hoofdstukken die samen jouw unieke leven vertellen.",
      },
    },
    {
      "@type": "Question",
      name: "Voor wie is deze dienst bedoeld?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "BewaardVoorJou.nl is perfect voor iedereen die zijn of haar levensverhaal wil bewaren. Of je nu 35 bent of 85, of je wilt vastleggen voor je kinderen, kleinkinderen, of gewoon voor jezelf — ons platform helpt je om herinneringen te structureren en te bewaren.",
      },
    },
    {
      "@type": "Question",
      name: "Is BewaardVoorJou.nl gratis?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Op dit moment is BewaardVoorJou.nl volledig gratis tijdens de lanceringsfase. Je kunt alle 58 hoofdstukken opnemen, transcripties krijgen, delen met familie, en je verhalen veilig bewaren zonder te betalen.",
      },
    },
    {
      "@type": "Question",
      name: "Hoe veilig zijn mijn opnames en persoonlijke verhalen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Jouw privacy is onze hoogste prioriteit. Alle data wordt versleuteld opgeslagen met bank-level encryptie (AES-256), zowel tijdens verzending als opslag. Al onze servers staan in Europa en voldoen aan de strenge GDPR-wetgeving.",
      },
    },
    {
      "@type": "Question",
      name: "Worden mijn opnames gebruikt om AI te trainen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nee, absoluut niet. Jouw persoonlijke verhalen worden uitsluitend gebruikt voor de diensten die wij je bieden (transcriptie, highlights, zoekfunctie). We gebruiken je opnames niet om AI-modellen te trainen.",
      },
    },
    {
      "@type": "Question",
      name: "Hoe werkt de AI-interviewer precies?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Onze AI-interviewer stelt een open vraag over een hoofdstuk, luistert naar je antwoord via opname, analyseert wat je zegt en stelt relevante vervolgvragen. De AI past zich aan jouw tempo en stijl aan en respecteert stiltes.",
      },
    },
    {
      "@type": "Question",
      name: "Moet ik alle 58 hoofdstukken doen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nee, je bepaalt zelf. De 58 hoofdstukken bieden een complete structuur, maar je kunt kiezen welke hoofdstukken voor jou belangrijk zijn. Je kunt ook hoofdstukken in willekeurige volgorde doen — er is geen dwang.",
      },
    },
    {
      "@type": "Question",
      name: "Kan ik mijn data verwijderen of exporteren?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja, je hebt volledige controle. Je kunt individuele opnames verwijderen, je hele account permanent verwijderen, of al je data exporteren in standaard formaten (video/audio + PDF transcripties). We voldoen volledig aan de GDPR.",
      },
    },
    {
      "@type": "Question",
      name: "Welke apparaten kan ik gebruiken?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "BewaardVoorJou.nl werkt op elke moderne browser: Chrome, Safari, Firefox, Edge. Je kunt het gebruiken op computer, tablet of smartphone. Er is geen app-installatie nodig.",
      },
    },
    {
      "@type": "Question",
      name: "Hoe kan ik mijn verhalen delen met familie?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Je kunt per hoofdstuk of voor je hele verhaal een veilige deellink genereren. Je bepaalt wie toegang heeft, hoe lang de link geldig is, en of mensen reacties kunnen achterlaten. Je kunt toegang op elk moment intrekken.",
      },
    },
    {
      "@type": "Question",
      name: "Wat gebeurt er met mijn data als ik overlijdt?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "BewaardVoorJou.nl heeft een speciale Legacy Planning functie. Je kunt vertrouwde contactpersonen aanwijzen, een 'dead man's switch' instellen, of tijdcapsules maken die pas na een bepaalde datum geopend worden.",
      },
    },
    {
      "@type": "Question",
      name: "Kan ik een fysiek boek laten maken van mijn verhaal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dit is een van onze meest gevraagde functies en komt eraan. Je zult je hele levensverhaal kunnen laten omzetten naar een gedrukt boek met transcripties, foto's en QR-codes die linken naar video-fragmenten.",
      },
    },
  ],
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PublicHeader />
      <FAQContent />
      <PublicFooter />
    </div>
  );
}
