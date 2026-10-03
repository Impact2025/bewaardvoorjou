import type { Metadata } from "next";
import { BookHeart, Heart, Mic, Users } from "lucide-react";
import {
  GiftLandingPage,
  type GiftLandingConfig,
} from "@/components/landing/GiftLandingPage";

const PAGE_URL = "https://bewaardvoorjou.nl/cadeau-moeder-verjaardag";
const OG_IMAGE = `${PAGE_URL}/opengraph-image`;
const TITLE = "Persoonlijk cadeau voor je moeder: haar verhaal, voor altijd bewaard";
const DESCRIPTION =
  "Een cadeau voor je moeder dat niet in de kast verdwijnt? Laat haar vertellen over haar leven. Haar stem en verhalen blijven bewaard, voor haar 60e, 70e of 80e verjaardag.";

export const metadata: Metadata = {
  title: { absolute: "Cadeau voor je moeder: haar verhaal bewaard | BewaardVoorJou.nl" },
  description: DESCRIPTION,
  keywords: [
    "cadeau moeder verjaardag",
    "persoonlijk cadeau moeder",
    "cadeau moeder 60 jaar",
    "cadeau moeder 70 jaar",
    "cadeau voor moeder die alles heeft",
    "origineel cadeau moeder",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: PAGE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "BewaardVoorJou.nl",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
    creator: "@bewaardvoorjou",
  },
};

const config: GiftLandingConfig = {
  pageUrl: PAGE_URL,
  title: TITLE,
  description: DESCRIPTION,
  breadcrumbName: "Cadeau voor je moeder",
  productName: "Levensverhaal als cadeau voor je moeder",
  productDescription:
    "Een digitaal cadeau waarmee je moeder haar levensverhaal vastlegt met hulp van een geduldige gespreksleider: 58 hoofdstukken, inspreken, video of typen.",
  h1Plain: "Persoonlijk cadeau voor je moeder:",
  h1Accent: "haar verhaal, voor altijd bewaard",
  lead:
    "Je moeder heeft alles al, of koopt wat ze nodig heeft zelf. Wat ze niet kan kopen is iemand die tijd neemt om haar verhaal te horen, en een plek waar het bewaard blijft voor haar kinderen en kleinkinderen.",
  ctaLabel: "Geef je moeder haar verhaal",
  recipient: "je moeder",
  inShort: (
    <>
      Een persoonlijk cadeau voor je moeder is een cadeau dat over haar gaat. Met
      BewaardVoorJou.nl vertelt ze haar levensverhaal aan een geduldige
      gespreksleider, die vragen stelt over haar jeugd, haar gezin en haar werk.
      Ze spreekt haar antwoorden in, neemt ze op video op of typt ze. De
      verhalen en haar stem blijven bewaard voor de familie. Je kiest zelf de
      datum waarop ze de uitnodiging per e-mail krijgt.
    </>
  ),
  reasonsTitle: "Waarom dit cadeau anders is dan bloemen of een weekendje weg",
  reasons: [
    {
      icon: <Heart className="h-7 w-7 text-orange" />,
      title: "Het gaat over haar",
      desc: "Geen spullen, maar de vraag: hoe was het toen je jong was? Veel moeders worden zelden gevraagd naar hun eigen verhaal.",
    },
    {
      icon: <Mic className="h-7 w-7 text-orange" />,
      title: "Haar stem blijft",
      desc: "Een ingesproken verhaal bewaart haar lach en haar uitdrukkingen. Dat haal je uit geen foto of kaart.",
    },
    {
      icon: <Users className="h-7 w-7 text-orange" />,
      title: "Voor kinderen en kleinkinderen",
      desc: "Via een deellink lezen en luisteren zij mee, nu en later. Een begin van het familiearchief.",
    },
    {
      icon: <BookHeart className="h-7 w-7 text-orange" />,
      title: "Op haar eigen tempo",
      desc: "Eén vraag per keer, wanneer het haar uitkomt. Geen deadline, en ze bepaalt zelf wat ze deelt.",
    },
  ],
  themesTitle: "Waar je moeder over gaat vertellen",
  themesIntro:
    "De gespreksleider loopt met haar door 58 hoofdstukken van een leven. Een paar onderwerpen die vaak de mooiste verhalen opleveren:",
  themes: [
    "Hoe het was om op te groeien in haar ouderlijk huis",
    "De tijd dat ze jong was en wat ze toen wilde worden",
    "Hoe ze jouw vader leerde kennen",
    "De dag dat jij of je broers en zussen geboren werden",
    "Wat ze zelf van haar eigen moeder heeft geleerd",
    "Wat ze jou en de kleinkinderen wil meegeven",
  ],
  ageTitle: "Een cadeau voor je moeder van 60, 70 of 80 jaar",
  ageBlocks: [
    {
      label: "Voor haar 60e",
      text: "Ze vertelt makkelijk en heeft vaak zin om terug te kijken, bijvoorbeeld bij pensioen of als de kinderen het huis uit zijn. Een goed moment om rustig te beginnen.",
    },
    {
      label: "Voor haar 70e",
      text: "Dit is vaak het moment waarop de kleinkinderen vragen gaan stellen over vroeger. Haar antwoorden zijn dan nog levendig en gedetailleerd.",
    },
    {
      label: "Voor haar 80e",
      text: "Het helpt als iemand naast haar zit met de telefoon of laptop. De vragen zijn kort en duidelijk, en elk antwoord wordt bewaard, hoe kort ook.",
    },
  ],
  offerTitle: "Geef je moeder haar verhaal",
  faqs: [
    {
      question: "Wat is een persoonlijk cadeau voor je moeder dat niet in de kast verdwijnt?",
      answer:
        "Een cadeau waar ze zelf iets mee doet en dat blijft. Met BewaardVoorJou.nl vertelt je moeder haar levensverhaal, geholpen door een geduldige gespreksleider. Haar verhalen en stem worden bewaard in een digitaal archief dat ze met de familie kan delen.",
    },
    {
      question: "Mijn moeder is niet handig met computers. Lukt het toch?",
      answer:
        "Ja. Ze kan haar antwoorden gewoon inspreken, typen hoeft niet. Je kunt de eerste keer naast haar zitten om het account en de eerste vraag samen te doen.",
    },
    {
      question: "Kan ik het op haar verjaardag laten aankomen?",
      answer:
        "Ja. In de checkout kies je de datum waarop ze de uitnodiging per e-mail ontvangt. Je krijgt ook een cadeaubon om te printen, met haar naam en jouw bericht, zodat je het persoonlijk kunt overhandigen.",
    },
    {
      question: "Wat als ze niet over alles wil praten?",
      answer:
        "Dat hoeft niet. Ze bepaalt zelf welke vragen ze beantwoordt en met wie ze haar verhalen deelt. Ze kan een vraag overslaan of er later op terugkomen.",
    },
    {
      question: "Wat kost dit cadeau en wat krijgt ze?",
      answer:
        "De actuele prijs en wat erbij hoort staat in het aanbod hierboven. Ze krijgt toegang tot alle 58 hoofdstukken, onbeperkte gesprekssessies, een digitaal archief met deellinks en PDF-export. Je hebt 14 dagen bedenktijd.",
    },
  ],
  faqIntro: "Over het levensverhaal als cadeau voor je moeder.",
  related: [
    { href: "/cadeau-vader-verjaardag", label: "Persoonlijk cadeau voor je vader" },
    { href: "/cadeau-oma", label: "Een origineel cadeau voor oma" },
    { href: "/kerstcadeau-ouders", label: "Kerstcadeau voor ouders die alles al hebben" },
    { href: "/kennisbank/interview-ouders-25-vragen", label: "25 vragen voor een interview met je ouders" },
    { href: "/levensverhaal-vastleggen", label: "Zo leg je een levensverhaal vast" },
  ],
};

export default function CadeauMoederVerjaardagPage() {
  return <GiftLandingPage config={config} ogImage={OG_IMAGE} />;
}
