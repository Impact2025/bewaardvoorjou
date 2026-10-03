import type { Metadata } from "next";
import { BookHeart, Heart, Mic, Users } from "lucide-react";
import {
  GiftLandingPage,
  type GiftLandingConfig,
} from "@/components/landing/GiftLandingPage";

const PAGE_URL = "https://bewaardvoorjou.nl/cadeau-vader-verjaardag";
const OG_IMAGE = `${PAGE_URL}/opengraph-image`;
const TITLE = "Persoonlijk cadeau voor je vader: zijn verhaal, voor altijd bewaard";
const DESCRIPTION =
  "Een cadeau voor je vader die alles al heeft? Laat hem vertellen over zijn leven. Zijn stem en verhalen blijven bewaard, voor zijn 60e, 70e of 80e verjaardag.";

export const metadata: Metadata = {
  title: { absolute: "Cadeau voor je vader: zijn verhaal bewaard | BewaardVoorJou.nl" },
  description: DESCRIPTION,
  keywords: [
    "cadeau vader verjaardag",
    "persoonlijk cadeau vader",
    "cadeau vader 60 jaar",
    "cadeau vader 70 jaar",
    "cadeau voor vader die alles heeft",
    "origineel cadeau vader",
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
  breadcrumbName: "Cadeau voor je vader",
  productName: "Levensverhaal als cadeau voor je vader",
  productDescription:
    "Een digitaal cadeau waarmee je vader zijn levensverhaal vastlegt met hulp van een geduldige gespreksleider: 58 hoofdstukken, inspreken, video of typen.",
  h1Plain: "Persoonlijk cadeau voor je vader:",
  h1Accent: "zijn verhaal, voor altijd bewaard",
  lead:
    "Een vader die alles al heeft, koopt zelf wat hij mist. Wat de familie wel mist, zijn zijn verhalen: hoe hij werkte, wat hij meemaakte en wat hij nooit eerder vertelde. Geef hem de ruimte om dat te doen.",
  ctaLabel: "Geef je vader zijn verhaal",
  recipient: "je vader",
  inShort: (
    <>
      Een persoonlijk cadeau voor je vader is een cadeau dat over hem gaat. Met
      BewaardVoorJou.nl vertelt hij zijn levensverhaal aan een geduldige
      gespreksleider, die vragen stelt over zijn jeugd, zijn werk en zijn gezin.
      Hij spreekt zijn antwoorden in, neemt ze op video op of typt ze. Zijn
      verhalen en stem blijven bewaard voor de familie. Dit is geen vaderdagactie:
      je kunt het op elke verjaardag geven. Je kiest zelf wanneer hij de
      uitnodiging per e-mail krijgt.
    </>
  ),
  reasonsTitle: "Waarom dit cadeau werkt bij een vader die niet veel zegt",
  reasons: [
    {
      icon: <Heart className="h-7 w-7 text-orange" />,
      title: "Hij hoeft niet te schrijven",
      desc: "Veel vaders praten liever dan dat ze schrijven. Hij spreekt gewoon in, op zijn eigen tempo.",
    },
    {
      icon: <Mic className="h-7 w-7 text-orange" />,
      title: "Zijn stem blijft",
      desc: "Zijn verhalen, zijn grappen en de manier waarop hij ze vertelt. Dat is wat de kleinkinderen later willen horen.",
    },
    {
      icon: <Users className="h-7 w-7 text-orange" />,
      title: "Vragen die jij zelf niet durft te stellen",
      desc: "De gespreksleider vraagt door op een manier die vaak makkelijker is dan een gesprek met je eigen kind.",
    },
    {
      icon: <BookHeart className="h-7 w-7 text-orange" />,
      title: "Voor de hele familie",
      desc: "Hij deelt zijn verhalen via een link met wie hij wil. Zo wordt het een begin van het familiearchief.",
    },
  ],
  themesTitle: "Waar je vader over gaat vertellen",
  themesIntro:
    "De gespreksleider loopt met hem door 58 hoofdstukken van een leven. Een paar onderwerpen die vaak de mooiste verhalen opleveren:",
  themes: [
    "Zijn eerste baan en wat hij daar leerde",
    "Zijn dienstplicht, werk of vak en de collega's die hij nooit vergat",
    "Hoe hij jouw moeder leerde kennen",
    "De dag dat hij vader werd",
    "De moeilijke jaren en hoe hij ze doorkwam",
    "Wat hij zijn kleinkinderen wil meegeven",
  ],
  ageTitle: "Een cadeau voor je vader van 60, 70 of 80 jaar",
  ageBlocks: [
    {
      label: "Voor zijn 60e",
      text: "Hij staat vaak nog midden in het werkzame leven, of net op de drempel van pensioen. Een goed moment om rustig terug te kijken, zonder dat het zwaar voelt.",
    },
    {
      label: "Voor zijn 70e",
      text: "Het pensioen geeft ruimte. Veel vaders hebben dan voor het eerst de tijd om verhalen uit te werken die ze al jaren in zich dragen.",
    },
    {
      label: "Voor zijn 80e",
      text: "Het is waardevol als iemand naast hem zit bij de eerste vraag. De gespreksleider stelt korte, duidelijke vragen en elk antwoord wordt bewaard.",
    },
  ],
  offerTitle: "Geef je vader zijn verhaal",
  faqs: [
    {
      question: "Wat geef je je vader voor zijn verjaardag als hij alles al heeft?",
      answer:
        "Iets wat niet te koop is in een winkel: zijn eigen verhaal, vastgelegd. Met BewaardVoorJou.nl vertelt hij over zijn leven aan een geduldige gespreksleider. Zijn woorden en zijn stem blijven bewaard voor de familie.",
    },
    {
      question: "Mijn vader is geen prater. Werkt dit dan wel?",
      answer:
        "Vaak wel. De gespreksleider stelt één concrete vraag per keer, bijvoorbeeld over zijn eerste baan of zijn eerste auto. Dat is makkelijker dan 'vertel eens iets over je leven'. Hij bepaalt zelf hoeveel hij vertelt.",
    },
    {
      question: "Wat is het verschil met de vaderdagpagina?",
      answer:
        "Dit cadeau is hetzelfde, maar niet gebonden aan Vaderdag. Je kunt het geven voor zijn 60e, 70e of 80e verjaardag, voor zijn pensioen of zomaar.",
    },
    {
      question: "Kan ik het op zijn verjaardag laten aankomen?",
      answer:
        "Ja. In de checkout kies je de datum waarop hij de uitnodiging per e-mail ontvangt. Je krijgt ook een cadeaubon om te printen, met zijn naam en jouw bericht.",
    },
    {
      question: "Wat kost dit cadeau en wat krijgt hij?",
      answer:
        "De actuele prijs en wat erbij hoort staat in het aanbod hierboven. Hij krijgt toegang tot alle 58 hoofdstukken, onbeperkte gesprekssessies, een digitaal archief met deellinks en PDF-export. Je hebt 14 dagen bedenktijd.",
    },
  ],
  faqIntro: "Over het levensverhaal als cadeau voor je vader.",
  related: [
    { href: "/cadeau-moeder-verjaardag", label: "Persoonlijk cadeau voor je moeder" },
    { href: "/cadeau-opa-80-jaar", label: "Origineel cadeau voor opa van 80 jaar" },
    { href: "/vaderdag", label: "Vaderdagcadeau met zijn verhaal" },
    { href: "/kennisbank/interview-ouders-25-vragen", label: "25 vragen voor een interview met je ouders" },
    { href: "/levensverhaal-vastleggen", label: "Zo leg je een levensverhaal vast" },
  ],
};

export default function CadeauVaderVerjaardagPage() {
  return <GiftLandingPage config={config} ogImage={OG_IMAGE} />;
}
