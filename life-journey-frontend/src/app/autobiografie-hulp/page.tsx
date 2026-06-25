import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Heart,
  Mic,
  FileText,
  Shield,
  ArrowRight,
  CheckCircle,
  Sparkles,
  BookOpen,
  Users,
  Clock,
  MessageCircle,
  ChevronDown,
  Star,
  PenLine,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Autobiografie schrijven — Hulp & AI-begeleiding in het Nederlands | BewaardVoorJou.nl",
  description:
    "Autobiografie schrijven hoeft niet moeilijk te zijn. BewaardVoorJou.nl begeleidt je stap voor stap met warme AI-interviews. Geen schrijfervaring nodig — jij vertelt, wij helpen structureren.",
  keywords: [
    "autobiografie hulp",
    "autobiografie schrijven",
    "autobiografie schrijven hulp",
    "hoe schrijf ik mijn autobiografie",
    "autobiografie voorbeeld",
    "persoonlijke biografie schrijven",
    "memoires schrijven",
    "levensverhaal opschrijven",
    "eigen levensverhaal schrijven",
    "biografie laten schrijven",
  ],
  alternates: {
    canonical: "https://bewaardvoorjou.nl/autobiografie-hulp",
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://bewaardvoorjou.nl/autobiografie-hulp",
    title: "Autobiografie schrijven — Hulp & AI-begeleiding in het Nederlands",
    description:
      "Autobiografie schrijven hoeft niet moeilijk te zijn. BewaardVoorJou.nl begeleidt je stap voor stap. Geen schrijfervaring nodig.",
    siteName: "BewaardVoorJou.nl",
    images: [
      {
        url: "/Logo_Bewaardvoorjou.png",
        width: 1200,
        height: 630,
        alt: "Autobiografie hulp met BewaardVoorJou.nl",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Autobiografie hulp",
  description:
    "Hulp bij het schrijven van je autobiografie. BewaardVoorJou.nl begeleidt je met AI-interviews door je hele levensverhaal.",
  url: "https://bewaardvoorjou.nl/autobiografie-hulp",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://bewaardvoorjou.nl" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Autobiografie hulp",
        item: "https://bewaardvoorjou.nl/autobiografie-hulp",
      },
    ],
  },
  mainEntity: {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Hoe begin ik met het schrijven van mijn autobiografie?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Het moeilijkste aan een autobiografie is beginnen. Bij BewaardVoorJou.nl hoef je dat probleem niet op te lossen: onze AI-interviewer stelt je warme, open vragen die herinneringen losmaken. Jij antwoordt gewoon — de structuur regelen wij.",
        },
      },
      {
        "@type": "Question",
        name: "Heb ik schrijfervaring nodig voor een autobiografie?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nee. Je hoeft helemaal niet te kunnen schrijven. Je kunt je antwoorden ook inspreken of opnemen als video. Schrijven doe je gewoon zoals je praat — dat is juist wat een autobiografie authentiek maakt.",
        },
      },
      {
        "@type": "Question",
        name: "Wat is het verschil tussen een autobiografie en memoires?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Een autobiografie beschrijft je hele leven chronologisch. Memoires richten zich op een specifieke periode of thema. Bij BewaardVoorJou.nl werk je door 30 gestructureerde hoofdstukken — van je vroegste herinneringen tot je levenslessen — wat neerkomt op een complete autobiografie.",
        },
      },
      {
        "@type": "Question",
        name: "Hoe lang duurt het om een autobiografie te schrijven?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Dat verschilt sterk per persoon. De meeste gebruikers werken een paar maanden aan hun autobiografie, gemiddeld een uur per week. Er is geen deadline — je werkt op jouw eigen tempo.",
        },
      },
      {
        "@type": "Question",
        name: "Kan ik mijn autobiografie later ook als boek laten drukken?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja. We werken aan een print-on-demand optie waarmee je jouw complete autobiografie als een echt, gedrukt boek kunt bestellen. Beschikbaar in de premium versie.",
        },
      },
      {
        "@type": "Question",
        name: "Is mijn autobiografie veilig opgeslagen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absoluut. Alles is end-to-end versleuteld opgeslagen op beveiligde Nederlandse servers. Alleen jij bepaalt wie jouw autobiografie mag lezen. We voldoen volledig aan de AVG/GDPR-wetgeving.",
        },
      },
    ],
  },
};

const benefits = [
  {
    icon: <MessageCircle className="h-8 w-8 text-orange" />,
    title: "AI-interviewer als schrijfhulp",
    description:
      "Geen leeg scherm meer. Onze AI stelt je precies de vragen die het verhaal losmaken — jij hoeft alleen maar te antwoorden.",
  },
  {
    icon: <BookOpen className="h-8 w-8 text-orange" />,
    title: "Bewezen autobiografie-structuur",
    description:
      "30 gestructureerde hoofdstukken van vroegste herinneringen tot levenslessen. Een complete autobiografie, stap voor stap.",
  },
  {
    icon: <PenLine className="h-8 w-8 text-orange" />,
    title: "Schrijven, spreken of filmen",
    description:
      "Typ, spreek in of neem op video op. Jij kiest het formaat dat bij jou past — en mag dat per hoofdstuk wisselen.",
  },
  {
    icon: <Users className="h-8 w-8 text-orange" />,
    title: "Bewaard voor je nakomelingen",
    description:
      "Jouw autobiografie blijft beschikbaar voor kinderen, kleinkinderen en wie jij wilt. Gedeeld wanneer jij dat kiest.",
  },
  {
    icon: <Shield className="h-8 w-8 text-orange" />,
    title: "100% veilig & privé",
    description:
      "End-to-end versleuteld op Nederlandse servers. AVG-compliant. Jij hebt altijd de volledige controle.",
  },
  {
    icon: <Clock className="h-8 w-8 text-orange" />,
    title: "Op jouw tempo",
    description:
      "Geen deadlines, geen druk. Tien minuten per week of een uur per dag — jouw autobiografie wacht op jou.",
  },
];

const steps = [
  {
    step: "1",
    title: "Maak gratis een account",
    description: "Registreren duurt minder dan een minuut. Geen creditcard nodig.",
  },
  {
    step: "2",
    title: "Laat je interviewen",
    description:
      "Onze AI stelt warme, open vragen over jouw leven. Jij antwoordt — in tekst, audio of video.",
  },
  {
    step: "3",
    title: "Jouw autobiografie groeit",
    description:
      "Elk antwoord wordt bewaard. Stap voor stap ontstaat er een compleet levensverhaal dat je kunt delen.",
  },
];

const faqs = [
  {
    question: "Hoe begin ik met het schrijven van mijn autobiografie?",
    answer:
      "Het moeilijkste aan een autobiografie is beginnen. Bij BewaardVoorJou.nl hoef je dat probleem niet op te lossen: onze AI stelt open vragen die herinneringen losmaken. Jij antwoordt gewoon — de structuur regelen wij.",
  },
  {
    question: "Heb ik schrijfervaring nodig?",
    answer:
      "Nee. Je kunt je antwoorden ook inspreken of opnemen als video. Schrijven doe je gewoon zoals je praat — dat is juist wat een autobiografie authentiek maakt.",
  },
  {
    question: "Wat is het verschil tussen een autobiografie en memoires?",
    answer:
      "Een autobiografie beschrijft je hele leven chronologisch. Memoires richten zich op een specifieke periode of thema. Bij BewaardVoorJou.nl bouw je door 58 hoofdstukken een complete autobiografie op — van vroegste herinneringen tot levenslessen.",
  },
  {
    question: "Hoe lang duurt het om een autobiografie te schrijven?",
    answer:
      "Dat verschilt sterk. De meeste gebruikers werken een paar maanden aan hun autobiografie, gemiddeld een uur per week. Er is geen deadline — je werkt op jouw tempo.",
  },
  {
    question: "Kan ik mijn autobiografie als boek laten drukken?",
    answer:
      "Ja. We werken aan een print-on-demand optie waarmee je jouw autobiografie als een echt gedrukt boek kunt bestellen. Beschikbaar in de premium versie.",
  },
  {
    question: "Is mijn autobiografie veilig opgeslagen?",
    answer:
      "Absoluut. Alles is end-to-end versleuteld op beveiligde Nederlandse servers. Alleen jij bepaalt wie jouw autobiografie mag lezen. Volledig AVG/GDPR-compliant.",
  },
];

export default function AutobiografieHulpPage() {
  return (
    <div className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicHeader />

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/Header-Image-min.png"
            alt="Autobiografie hulp met BewaardVoorJou.nl"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/88 via-slate-900/72 to-slate-900/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full py-20">
          <div className="max-w-3xl">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 text-white/60 text-sm">
                <li>
                  <Link href="/" className="hover:text-white/90 transition-colors">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-white/90">Autobiografie hulp</li>
              </ol>
            </nav>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/20 backdrop-blur-md border border-orange/30 text-white text-sm font-medium mb-8 shadow-xl">
              <Sparkles className="h-4 w-4 text-orange-light" />
              <span>AI-schrijfhulp in het Nederlands</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white leading-tight mb-6 drop-shadow-2xl">
              Hulp bij het schrijven
              <span className="text-orange block mt-2">van jouw</span>
              <span className="block mt-2">autobiografie</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/95 leading-relaxed mb-4 drop-shadow-lg font-light">
              Weet je niet hoe je moet beginnen? Onze AI-interviewer stelt de vragen — jij hoeft alleen maar te vertellen.
            </p>

            <p className="text-lg text-white/90 leading-relaxed mb-10 drop-shadow-lg">
              Geen schrijfervaring nodig. Geen leeg scherm. Gewoon jouw verhaal — in tekst, audio of video — veilig bewaard voor je familie en volgende generaties.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                asChild
                className="bg-orange hover:bg-orange/90 text-white text-lg px-10 py-7 rounded-xl shadow-2xl hover:shadow-orange/50 transition-all duration-300 hover:scale-105 font-semibold"
              >
                <Link href="/register" className="inline-flex items-center">
                  Begin gratis <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
              <Button
                asChild
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-lg px-10 py-7 rounded-xl border-2 border-white/40 hover:border-white/60 transition-all duration-300"
              >
                <Link href="#hoe-werkt-het">Hoe werkt het?</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium drop-shadow text-sm sm:text-base">Gratis starten</span>
              </div>
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium drop-shadow text-sm sm:text-base">Geen schrijfervaring nodig</span>
              </div>
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium drop-shadow text-sm sm:text-base">Op jouw tempo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why section */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">
              Waarom een autobiografie schrijven?
            </h2>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto">
              Jij hebt een uniek leven geleefd. Dat verhaal verdient meer dan een vaag gevoel — het verdient een plek die blijft.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-orange/5 to-gold/5 rounded-2xl p-6 border border-orange/20 text-center">
              <div className="text-4xl font-bold text-orange mb-2">73%</div>
              <p className="text-slate-700 text-sm leading-relaxed">
                van de mensen zegt spijt te hebben dat ze het levensverhaal van een ouder of grootouder nooit hebben vastgelegd
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange/5 to-gold/5 rounded-2xl p-6 border border-orange/20 text-center">
              <div className="text-4xl font-bold text-orange mb-2">3 gen.</div>
              <p className="text-slate-700 text-sm leading-relaxed">
                na ons leven zijn de meeste autobiografieën verloren als ze niet digitaal worden bewaard
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange/5 to-gold/5 rounded-2xl p-6 border border-orange/20 text-center">
              <div className="text-4xl font-bold text-orange mb-2">30</div>
              <p className="text-slate-700 text-sm leading-relaxed">
                gestructureerde hoofdstukken begeleiden je van vroegste herinneringen tot je diepste levenslessen
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 md:p-10 text-white">
            <div className="flex items-start gap-4">
              <Star className="h-8 w-8 text-orange flex-shrink-0 mt-1" />
              <div>
                <p className="text-lg md:text-xl text-white/95 leading-relaxed italic mb-4">
                  "Ik had altijd gedacht dat ik een schrijver moest zijn om mijn autobiografie te maken. Maar BewaardVoorJou stelde mij gewoon de juiste vragen. Na drie maanden had ik meer dan honderd pagina's die ik mijn kinderen met trots kon geven."
                </p>
                <p className="text-white/70 text-sm font-medium">— Henk, 74 jaar, gepensioneerd leraar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits / Features */}
      <section id="functies" className="py-20 px-4 sm:px-6 bg-gradient-to-br from-cream via-white to-warm-sand/20 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-slate-900 mb-4">
              Jouw autobiografie schrijven, zo werkt de hulp
            </h2>
            <p className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto">
              BewaardVoorJou.nl geeft je alles wat je nodig hebt — zonder dat je zelf schrijver hoeft te zijn
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-cream via-white to-warm-sand/10 border-2 border-neutral-sand hover:border-orange/30 hover:shadow-2xl transition-all duration-300 group"
              >
                <CardContent className="p-8">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange/10 mb-6 group-hover:bg-orange/20 group-hover:scale-110 transition-all duration-300">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-slate-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-700 leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="hoe-werkt-het" className="py-20 px-4 sm:px-6 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-slate-900 mb-4">
              Zo schrijf je jouw autobiografie
            </h2>
            <p className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto">
              Van leeg scherm naar een compleet levensverhaal in drie stappen
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-12">
            {steps.map((item, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-orange to-orange/20" />
                )}
                <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-neutral-sand">
                  <div className="absolute -top-6 left-8 h-12 w-12 rounded-full bg-gradient-to-br from-orange to-gold flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {item.step}
                  </div>
                  <div className="mt-6">
                    <h3 className="text-xl font-serif font-semibold text-slate-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-slate-700 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Format choices */}
          <div className="bg-gradient-to-br from-orange/5 to-gold/5 rounded-2xl p-8 md:p-12 border border-orange/20">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-serif font-semibold text-slate-900 mb-3">
                Kies jouw manier van vertellen
              </h3>
              <p className="text-slate-700 text-lg">
                Schrijven, inspreken of opnemen — elk formaat is even waardevol
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <FileText className="h-10 w-10 text-orange mx-auto mb-3" />
                <h4 className="font-semibold text-slate-900 mb-2">Schrijven</h4>
                <p className="text-sm text-slate-600">Typ je autobiografie op eigen tempo</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <Mic className="h-10 w-10 text-orange mx-auto mb-3" />
                <h4 className="font-semibold text-slate-900 mb-2">Inspreken</h4>
                <p className="text-sm text-slate-600">Bewaar je stem — uniek en onvervangbaar</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <Heart className="h-10 w-10 text-orange mx-auto mb-3" />
                <h4 className="font-semibold text-slate-900 mb-2">Video</h4>
                <p className="text-sm text-slate-600">Laat ook je gezicht en emoties bewaard blijven</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild className="bg-orange hover:bg-orange/90 text-white text-lg px-10 py-6">
              <Link href="/register">
                Begin mijn autobiografie <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* For whom */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-cream via-white to-warm-sand/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">
              Voor wie is deze autobiografie-hulp?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Heart className="h-8 w-8 text-orange" />,
                title: "Ouderen met een rijke geschiedenis",
                description:
                  "Je hebt decennia aan verhalen in je hoofd. Dit platform helpt je ze op te schrijven — op jouw tempo, zonder technische drempels, in gewone mensentaal.",
              },
              {
                icon: <Users className="h-8 w-8 text-orange" />,
                title: "Kinderen die hun ouders helpen",
                description:
                  "Geef je ouders of grootouders hulp bij hun autobiografie. Of schenk een account als cadeau — een van de meest betekenisvolle dingen die je kunt doen.",
              },
              {
                icon: <PenLine className="h-8 w-8 text-orange" />,
                title: "Iedereen met een verhaal",
                description:
                  "Je hoeft niet oud te zijn om een autobiografie te schrijven. Elk leven is de moeite waard om vast te leggen — voor nu en voor later.",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="bg-white border-2 border-neutral-sand hover:border-orange/30 hover:shadow-xl transition-all duration-300 group"
              >
                <CardContent className="p-8 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orange/10 mb-6 group-hover:bg-orange/20 transition-all duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-slate-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-700 leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="veelgestelde-vragen" className="py-20 px-4 sm:px-6 bg-white scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">
              Veelgestelde vragen over autobiografie schrijven
            </h2>
            <p className="text-lg text-slate-700">
              Alles wat je wilt weten voordat je begint
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group border-2 border-neutral-sand rounded-2xl overflow-hidden hover:border-orange/30 transition-colors"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                  <h3 className="text-lg font-serif font-semibold text-slate-900 pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown className="h-5 w-5 text-orange flex-shrink-0 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-slate-700 leading-relaxed border-t border-neutral-sand/50">
                  <p className="pt-4">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-slate-600 mb-4">Nog een vraag? We helpen je graag.</p>
            <Link
              href="/contact"
              className="text-orange font-semibold hover:underline inline-flex items-center gap-1"
            >
              Neem contact op <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Lange content — SEO deep-dive */}
      <section className="py-20 px-4 sm:px-6 bg-white border-t border-neutral-sand/50">
        <div className="max-w-3xl mx-auto prose prose-slate prose-lg max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-strong:text-slate-900 prose-a:text-orange prose-a:no-underline hover:prose-a:underline prose-hr:border-neutral-sand">
          <blockquote>
            <p><strong>In het kort:</strong> Hulp bij het schrijven van je autobiografie hoeft niet duur of ingewikkeld te zijn. BewaardVoorJou.nl begeleidt je stap voor stap met een AI-interviewer die de juiste vragen stelt — jij hoeft alleen te vertellen. Geen schrijfervaring, geen stress, gewoon jouw verhaal.</p>
          </blockquote>

          <h2>Waarom autobiografie schrijven hulp zo waardevol is</h2>
          <p>Een autobiografie schrijven is een van de mooiste dingen die je voor jezelf — en je familie — kunt doen. Toch beginnen de meeste mensen er nooit aan. Waarom? Omdat het schrijven van een heel levensverhaal voelt als een onmogelijke opgave. Waar begin je? Wat laat je weg? Hoe zorg je dat het leesbaar is?</p>
          <p>Die vragen weerhouden talloze mensen ervan om hun herinneringen vast te leggen. En dat is zonde, want onderzoek toont aan dat het delen van levensverhalen niet alleen waardevol is voor de volgende generatie, maar ook therapeutisch werkt voor de verteller zelf.</p>
          <p>BewaardVoorJou.nl is ontworpen om precies die drempel weg te nemen. Geen leeg scherm, geen schrijversblok, geen prestatiedruk. Onze AI-interviewer stelt je warme, open vragen — zoals een goed gesprek aan de keukentafel. Jij antwoordt, de structuur regelen wij.</p>

          <blockquote>
            <p>"Ik dacht altijd dat ik een schrijver moest zijn om mijn autobiografie te maken. Maar BewaardVoorJou stelde me gewoon de juiste vragen. Na drie maanden had ik meer dan honderd pagina's." — Henk, 74 jaar</p>
          </blockquote>

          <h2>Wat maakt autobiografie schrijven met AI anders?</h2>
          <p>Traditionele hulp bij autobiografie schrijven bestaat uit dure schrijfcoaches (€3.000 - €6.500), invulboeken die aanvoelen als huiswerk, of het helemaal alleen doen. Geen van deze opties werkt structureel voor de meeste mensen.</p>
          <p>AI-schrijfhulp voor autobiografieën combineert het beste van beide werelden:</p>
          <ul>
            <li><strong>Geen leeg scherm</strong> — de AI stelt de vragen, jij hoeft alleen te antwoorden</li>
            <li><strong>Structuur zonder dwang</strong> — 78 hoofdstukken verdeeld over 7 levensfasen, maar je begint waar jij wilt</li>
            <li><strong>Meerdere invoermethoden</strong> — typen, inspreken of video, jij kiest per hoofdstuk</li>
            <li><strong>Betaalbaar</strong> — een fractie van wat een professionele schrijver kost</li>
            <li><strong>Eigen regie</strong> — jij bepaalt wie wat mag zien, en wanneer</li>
          </ul>

          <h2>Hoe schrijf je een autobiografie met hulp van AI?</h2>
          <p>Het proces is verrassend eenvoudig. Je hoeft geen technische kennis te hebben, geen apps te installeren en geen handleidingen te lezen.</p>

          <h3>1. Begin met één herinnering</h3>
          <p>Niet met je geboorte, niet met een complete tijdlijn. Gewoon één herinnering die op dit moment bij je opkomt. Een geur uit je kindertijd, de dag dat je je partner ontmoette, je eerste baan. De AI-interviewer pakt dat draadje op en vraagt door — precies zoals een goede gesprekspartner dat doet.</p>
          <p>Lees ook: <a href="/kennisbank/hoe-begin-ik-met-het-vastleggen-van-mijn-levensverhaal">hoe begin ik met mijn levensverhaal? Stap-voor-stap gids</a></p>

          <h3>2. Kies je manier van vertellen</h3>
          <p>Sommige mensen denken sneller dan ze typen. Anderen worden emotioneel van hun eigen stem. Weer anderen willen hun gezicht en expressie bewaren voor later. Bij BewaardVoorJou.nl kun je per hoofdstuk kiezen:</p>
          <ul>
            <li><strong>Audio:</strong> spreek in met je telefoon — automatisch omgezet naar tekst</li>
            <li><strong>Video:</strong> neem jezelf op — bewaar niet alleen je woorden, maar ook je stem en glimlach</li>
            <li><strong>Tekst:</strong> type zelf, op je eigen tempo</li>
          </ul>
          <p>Je mag per hoofdstuk wisselen. Het ene hoofdstuk spreek je in, het andere type je. Alles wordt veilig bewaard op Nederlandse servers.</p>

          <h3>3. Bouw stap voor stap je autobiografie op</h3>
          <p>De 78 hoofdstukken zijn verdeeld over 7 fases: van je wortels en jeugd, via liefde en gezin, naar je levenslessen en nalatenschap. Je hoeft niet chronologisch te werken — spring naar het onderwerp dat jou het meest raakt. De AI-interviewer helpt je als je vastloopt met doorvragen.</p>

          <h3>4. Deel met wie jij wilt</h3>
          <p>Elk hoofdstuk is standaard privé. Jij bepaalt wie wat mag zien, of je het wilt delen met familie, en of er een tijdcapsule moet worden ingesteld voor later. Lees meer over <a href="/veilig-digitaal-familiearchief">veilig digitaal familiearchief</a>.</p>

          <hr />

          <h2>Autobiografie vs memoires: wat is het verschil?</h2>
          <p>Veel mensen gebruiken de termen door elkaar, maar er is een wezenlijk verschil:</p>
          <ul>
            <li><strong>Autobiografie:</strong> beschrijft je hele leven, van vroegste herinneringen tot nu. Chronologisch, volledig, compleet.</li>
            <li><strong>Memoires:</strong> richten zich op een specifieke periode, thema of gebeurtenis in je leven. Bijvoorbeeld je oorlogservaringen, je carrière, of een bijzondere reis.</li>
          </ul>
          <p>BewaardVoorJou.nl is ontworpen voor een complete autobiografie, maar je kunt net zo goed alleen bepaalde fases invullen. Jij bepaalt de reikwijdte.</p>

          <h2>Veelvoorkomende struikelblokken (en hoe wij ze oplossen)</h2>
          <table>
            <thead>
              <tr><th>Struikelblok</th><th>Traditionele aanpak</th><th>BewaardVoorJou</th></tr>
            </thead>
            <tbody>
              <tr><td>Ik weet niet waar ik moet beginnen</td><td>Zelf uitzoeken, schrijftips lezen</td><td>AI stelt de eerste vraag voor je</td></tr>
              <tr><td>Ik ben geen schrijver</td><td>Schrijfcoach inhuren (duur)</td><td>Inspreken of video opnemen</td></tr>
              <tr><td>Ik vergeet de helft</td><td>Notities maken, oude foto's zoeken</td><td>Doorvragen haalt verborgen herinneringen boven</td></tr>
              <tr><td>Het voelt als een te grote klus</td><td>Nooit beginnen</td><td>Eén hoofdstuk tegelijk, geen deadline</td></tr>
              <tr><td>Ik wil het privé houden</td><td>In een la stoppen (verloren risico)</td><td>Versleuteld op NL-servers, jij bepaalt</td></tr>
            </tbody>
          </table>

          <p>Benieuwd naar ervaringen? Lees ook: <a href="/blog/levensverhaal-bewaren-geschenk-kinderen">levensverhaal bewaren — het grootste geschenk aan je kinderen</a>.</p>

          <hr />

          <p><strong>Klaar om te beginnen? Je eerste hoofdstuk duurt 10 minuten. Geen schrijfervaring nodig, geen creditcard, geen verplichtingen.</strong></p>
          <p><a href="https://bewaardvoorjou.nl/register" className="font-semibold">Begin gratis met jouw autobiografie →</a></p>
        </div>
      </section>

      {/* Internal links */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-br from-cream via-white to-warm-sand/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-8 text-center">
            Meer inspiratie & hulp
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <Link
              href="/levensverhaal-opschrijven"
              className="bg-white rounded-xl p-6 border-2 border-neutral-sand hover:border-orange/30 hover:shadow-md transition-all group"
            >
              <h3 className="font-serif font-semibold text-slate-900 mb-2 group-hover:text-orange transition-colors">
                Levensverhaal opschrijven
              </h3>
              <p className="text-sm text-slate-600">Alles over het vastleggen van herinneringen</p>
            </Link>
            <Link
              href="/kennisbank/hoe-begin-ik-met-het-vastleggen-van-mijn-levensverhaal"
              className="bg-white rounded-xl p-6 border-2 border-neutral-sand hover:border-orange/30 hover:shadow-md transition-all group"
            >
              <h3 className="font-serif font-semibold text-slate-900 mb-2 group-hover:text-orange transition-colors">
                Stap-voor-stap beginnen
              </h3>
              <p className="text-sm text-slate-600">Lees onze uitgebreide gids voor beginners</p>
            </Link>
            <Link
              href="/blog"
              className="bg-white rounded-xl p-6 border-2 border-neutral-sand hover:border-orange/30 hover:shadow-md transition-all group"
            >
              <h3 className="font-serif font-semibold text-slate-900 mb-2 group-hover:text-orange transition-colors">
                Schrijftips & inspiratie
              </h3>
              <p className="text-sm text-slate-600">Lees onze blogs over autobiografieën en herinneringen</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-orange via-orange-dark to-gold text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-tight">
            Begin vandaag met jouw autobiografie
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-95 leading-relaxed">
            Elke dag dat je wacht, is een herinnering die vervaagt.
            <span className="block mt-2 font-semibold">Start vandaag, gratis.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              asChild
              className="bg-white text-orange hover:bg-neutral-light text-lg px-10 py-7 shadow-2xl font-semibold"
            >
              <Link href="/register">
                Schrijf mijn autobiografie <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-lg px-10 py-7 rounded-xl border-2 border-white/40 hover:border-white/60 transition-all duration-300"
            >
              <Link href="/pricing">Bekijk abonnementen</Link>
            </Button>
          </div>

          <p className="text-sm opacity-90 mb-12">
            Geen creditcard nodig · Altijd opzegbaar · 100% AVG-veilig
          </p>

          <div className="flex flex-wrap justify-center gap-6 md:gap-10 pt-12 border-t border-white/20">
            <div className="flex items-center gap-2 text-sm opacity-95">
              <Shield className="h-5 w-5" />
              <span>Nederlandse servers</span>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-95">
              <CheckCircle className="h-5 w-5" />
              <span>AVG-compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-95">
              <Heart className="h-5 w-5" />
              <span>Met zorg gemaakt in NL</span>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
