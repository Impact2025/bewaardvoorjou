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
} from "lucide-react";

export const metadata: Metadata = {
  title: { absolute: "Levensverhaal opschrijven — AI-begeleiding in het Nederlands | BewaardVoorJou.nl" },
  description:
    "Jouw levensverhaal opschrijven was nog nooit zo eenvoudig. Onze warme AI begeleidt jou. Veilig bewaard voor altijd. Begin vandaag gratis.",
  keywords: [
    "levensverhaal opschrijven",
    "memoires schrijven",
    "autobiografie schrijven",
    "herinneringen vastleggen",
    "levensverhaal bewaren",
    "persoonlijk verhaal opschrijven",
    "ouders levensverhaal",
    "levensverhaal voor kleinkinderen",
    "digitale memoires",
    "levensverhaal hulp",
  ],
  alternates: {
    canonical: "https://bewaardvoorjou.nl/levensverhaal-opschrijven",
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://bewaardvoorjou.nl/levensverhaal-opschrijven",
    title: "Levensverhaal opschrijven — AI-begeleiding in het Nederlands",
    description:
      "Jouw levensverhaal opschrijven was nog nooit zo eenvoudig. Onze warme AI begeleidt jou. Veilig bewaard, voor altijd. Begin vandaag gratis.",
    siteName: "BewaardVoorJou.nl",
    images: [
      {
        url: "/Logo_Bewaardvoorjou.png",
        width: 1200,
        height: 630,
        alt: "Levensverhaal opschrijven met BewaardVoorJou.nl",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: "Levensverhaal opschrijven",
      description:
        "Jouw levensverhaal opschrijven met AI-begeleiding. BewaardVoorJou.nl begeleidt je door 58 hoofdstukken van je leven.",
      url: "https://bewaardvoorjou.nl/levensverhaal-opschrijven",
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://bewaardvoorjou.nl" },
          {
            "@type": "ListItem",
            position: 2,
            name: "Levensverhaal opschrijven",
            item: "https://bewaardvoorjou.nl/levensverhaal-opschrijven",
          },
        ],
      },
    },
    {
      "@type": "HowTo",
      name: "Jouw levensverhaal opschrijven met AI-begeleiding",
      description:
        "In drie stappen je levensverhaal opschrijven met hulp van een AI-interviewer.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Maak gratis een account",
          text: "Registreren duurt minder dan een minuut. Geen creditcard nodig.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Kies een hoofdstuk en vertel je verhaal",
          text: "Onze AI-interviewer begeleidt je met warme, open vragen. Jij vertelt in tekst, audio of video — wij zorgen voor de structuur.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Bewaar & deel jouw verhaal",
          text: "Je verhaal blijft veilig bewaard op Nederlandse servers. Deel het wanneer jij wilt met de mensen die voor jou tellen.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Hoe begin ik met mijn levensverhaal opschrijven?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Bij BewaardVoorJou.nl begin je met een gratis account. Onze AI-interviewer stelt je warme, open vragen waardoor herinneringen vanzelf naar boven komen. Je hoeft niet te weten waar je begint — wij begeleiden je stap voor stap door 58 hoofdstukken.",
          },
        },
        {
          "@type": "Question",
          name: "Is mijn levensverhaal veilig opgeslagen?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Ja. Alle verhalen zijn end-to-end versleuteld opgeslagen op beveiligde Nederlandse servers. Alleen jij bepaalt wie toegang krijgt. We voldoen volledig aan de AVG/GDPR-wetgeving.",
          },
        },
        {
          "@type": "Question",
          name: "Kan ik ook video of audio opnemen in plaats van schrijven?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Absoluut. Je kiest zelf per herinnering of je liever schrijft, een audio-opname maakt of een video opneemt. Elk formaat wordt veilig bewaard en kan worden gedeeld met familie.",
          },
        },
        {
          "@type": "Question",
          name: "Voor wie is BewaardVoorJou.nl bedoeld?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Voor iedereen die een verhaal heeft om te vertellen — van ouderen die hun leven willen doorgeven aan kleinkinderen, tot mensen die hun ouders willen helpen hun verhaal vast te leggen. Het platform is ontworpen voor alle leeftijden.",
          },
        },
      ],
    },
  ],
};

const benefits = [
  {
    icon: <MessageCircle className="h-8 w-8 text-orange" />,
    title: "AI-begeleiding die echt luistert",
    description:
      "Onze interviewer stelt warme, open vragen die precies de juiste herinneringen losmaken. Geen strak script, maar een echt gesprek.",
  },
  {
    icon: <BookOpen className="h-8 w-8 text-orange" />,
    title: "30 gestructureerde hoofdstukken",
    description:
      "Van je vroegste herinneringen tot je levenslessen — een bewezen structuur zodat je nooit voor een leeg scherm zit.",
  },
  {
    icon: <Mic className="h-8 w-8 text-orange" />,
    title: "Schrijven, spreken of opnemen",
    description:
      "Typ je verhaal, neem je stem op of maak een video. Jij kiest de vorm die bij jou past, per herinnering opnieuw.",
  },
  {
    icon: <Users className="h-8 w-8 text-orange" />,
    title: "Bewaard voor je familie",
    description:
      "Deel je verhaal selectief met kinderen, kleinkinderen of vrienden. Zelf bepalen wie wat mag zien.",
  },
  {
    icon: <Shield className="h-8 w-8 text-orange" />,
    title: "100% veilig & privé",
    description:
      "End-to-end versleuteld op Nederlandse servers. GDPR-compliant. Jij hebt altijd de controle.",
  },
  {
    icon: <Clock className="h-8 w-8 text-orange" />,
    title: "Op jouw tempo",
    description:
      "Geen deadlines, geen druk. Begin vandaag met één herinnering en bouw rustig verder wanneer het uitkomt.",
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
    title: "Kies een hoofdstuk",
    description:
      "Onze AI-interviewer begeleidt je met warme, open vragen. Jij vertelt, wij zorgen voor de structuur.",
  },
  {
    step: "3",
    title: "Bewaar & deel jouw verhaal",
    description:
      "Je verhaal blijft veilig bewaard. Deel het wanneer jij wilt met de mensen die voor jou tellen.",
  },
];

const faqs = [
  {
    question: "Hoe begin ik met mijn levensverhaal opschrijven?",
    answer:
      "Je begint met een gratis account en kiest een van de 58 hoofdstukken. Onze AI-interviewer stelt open vragen die herinneringen losmaken. Je hoeft zelf niets te bedenken — gewoon vertellen.",
  },
  {
    question: "Moet ik goed kunnen schrijven?",
    answer:
      "Nee. Je kunt ook een audio- of video-opname maken. En schrijven doe je gewoon zoals je praat — onze structuur zorgt voor de rest. Er is geen goed of fout.",
  },
  {
    question: "Wat als ik halverwege stop?",
    answer:
      "Geen enkel probleem. Je kunt op elk moment stoppen en later verder gaan. Alles wordt automatisch opgeslagen. Jouw verhaal wacht gewoon op je.",
  },
  {
    question: "Is dit ook een cadeau voor mijn ouders?",
    answer:
      "Absoluut. Een account op BewaardVoorJou.nl is een van de meest betekenisvolle cadeaus die je kunt geven. We hebben een cadeauoptie die direct per e-mail verstuurd wordt.",
  },
  {
    question: "Hoelang duurt het om een levensverhaal op te schrijven?",
    answer:
      "Dat is heel persoonlijk. Sommigen schrijven tien minuten per week, anderen zitten er uren in. De meeste mensen ronden een volledig levensverhaal in een paar maanden af — maar er is geen tijdslimiet.",
  },
  {
    question: "Kan ik mijn verhaal later ook als boek laten drukken?",
    answer:
      "Ja, we werken aan een print-on-demand optie waarmee je jouw verhaal als een echt boek kunt bestellen. Beschikbaar in de premium versie.",
  },
];

export default function LevensverhaalOpschrijvenPage() {
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
            alt="Levensverhaal opschrijven met BewaardVoorJou.nl"
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
            {/* Breadcrumb (SEO + UX) */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 text-white/60 text-sm">
                <li>
                  <Link href="/" className="hover:text-white/90 transition-colors">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="text-white/90">Levensverhaal opschrijven</li>
              </ol>
            </nav>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/20 backdrop-blur-md border border-orange/30 text-white text-sm font-medium mb-8 shadow-xl">
              <Sparkles className="h-4 w-4 text-orange-light" />
              <span>AI-begeleiding in het Nederlands</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white leading-tight mb-6 drop-shadow-2xl">
              Jouw levensverhaal
              <span className="text-orange block mt-2">opschrijven,</span>
              <span className="block mt-2">eenvoudig gemaakt</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/95 leading-relaxed mb-4 drop-shadow-lg font-light">
              Weet je niet hoe je moet beginnen? Onze warme AI-interviewer stelt de juiste vragen — jij hoeft alleen maar te vertellen.
            </p>

            <p className="text-lg text-white/90 leading-relaxed mb-10 drop-shadow-lg">
              Bewaar je herinneringen in tekst, audio of video. Veilig opgeslagen, voor altijd beschikbaar voor je familie en volgende generaties.
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
              Waarom je levensverhaal opschrijven zo waardevol is
            </h2>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto">
              Herinneringen vervagen. Verhalen verdwijnen. Maar jouw leven — elk lief en moeilijk moment — verdient een plek die blijft.
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
                na ons leven zijn de meeste persoonlijke verhalen verloren gegaan als ze niet bewaard worden
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange/5 to-gold/5 rounded-2xl p-6 border border-orange/20 text-center">
              <div className="text-4xl font-bold text-orange mb-2">∞</div>
              <p className="text-slate-700 text-sm leading-relaxed">
                hoe lang jouw verhaal bewaard blijft op BewaardVoorJou.nl — voor altijd toegankelijk voor je familie
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 md:p-10 text-white">
            <div className="flex items-start gap-4">
              <Star className="h-8 w-8 text-orange flex-shrink-0 mt-1" />
              <div>
                <p className="text-lg md:text-xl text-white/95 leading-relaxed italic mb-4">
                  "Mijn vader begon op zijn 78ste met zijn levensverhaal opschrijven. Hij wist niet hoe hij moest beginnen. Dankzij de AI-vragen van BewaardVoorJou kwamen er verhalen naar boven die wij als kinderen nooit hadden gehoord. Nu bewaren we ze voor altijd."
                </p>
                <p className="text-white/70 text-sm font-medium">— Sandra, 51 jaar, dochter van een gebruiker</p>
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
              Alles wat je nodig hebt
            </h2>
            <p className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto">
              BewaardVoorJou.nl maakt levensverhalen opschrijven eenvoudig, persoonlijk en duurzaam
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
              Zo schrijf je jouw levensverhaal op
            </h2>
            <p className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto">
              In drie stappen van leeg scherm naar een compleet levensverhaal
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
                Kies hoe jij vertelt
              </h3>
              <p className="text-slate-700 text-lg">
                Schrijven, inspreken of opnemen — elk formaat is even waardevol
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <FileText className="h-10 w-10 text-orange mx-auto mb-3" />
                <h4 className="font-semibold text-slate-900 mb-2">Schrijven</h4>
                <p className="text-sm text-slate-600">Typ je herinneringen op je eigen tempo</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <Mic className="h-10 w-10 text-orange mx-auto mb-3" />
                <h4 className="font-semibold text-slate-900 mb-2">Inspreken</h4>
                <p className="text-sm text-slate-600">Bewaar je stem — die is uniek en kostbaar</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <Heart className="h-10 w-10 text-orange mx-auto mb-3" />
                <h4 className="font-semibold text-slate-900 mb-2">Video</h4>
                <p className="text-sm text-slate-600">Laat ook je gezicht en expressies bewaard blijven</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild className="bg-orange hover:bg-orange/90 text-white text-lg px-10 py-6">
              <Link href="/register">
                Begin nu gratis <ArrowRight className="ml-2 h-5 w-5" />
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
              Voor wie is BewaardVoorJou.nl?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Heart className="h-8 w-8 text-orange" />,
                title: "Voor ouderen",
                description:
                  "Je hebt een leven geleefd vol verhalen. Dit platform helpt je ze op te schrijven — op jouw tempo, in jouw woorden, zonder technische drempels.",
              },
              {
                icon: <Users className="h-8 w-8 text-orange" />,
                title: "Voor kinderen & kleinkinderen",
                description:
                  "Geef je ouders of grootouders het mooiste cadeau: help ze hun verhaal vastleggen. Of schenk ze een account voor hun verjaardag.",
              },
              {
                icon: <BookOpen className="h-8 w-8 text-orange" />,
                title: "Voor iedereen met een verhaal",
                description:
                  "Je hoeft niet oud te zijn om je verhaal op te schrijven. Elk leven is de moeite waard om te bewaren — voor nu en voor later.",
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
              Veelgestelde vragen
            </h2>
            <p className="text-lg text-slate-700">
              Alles over levensverhalen opschrijven met BewaardVoorJou.nl
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

      {/* Internal links / related content — naar KB */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-br from-cream via-white to-warm-sand/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-8 text-center">
            Meer over levensverhalen
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <Link
              href="/kennisbank/complete-gids-levensverhaal-vastleggen"
              className="bg-white rounded-xl p-6 border-2 border-neutral-sand hover:border-orange/30 hover:shadow-md transition-all group"
            >
              <h3 className="font-serif font-semibold text-slate-900 mb-2 group-hover:text-orange transition-colors">
                Complete gids: levensverhaal vastleggen
              </h3>
              <p className="text-sm text-slate-600">Stap-voor-stap je verhaal vastleggen</p>
            </Link>
            <Link
              href="/kennisbank/memoires-schrijven-voorbeelden-en-tips"
              className="bg-white rounded-xl p-6 border-2 border-neutral-sand hover:border-orange/30 hover:shadow-md transition-all group"
            >
              <h3 className="font-serif font-semibold text-slate-900 mb-2 group-hover:text-orange transition-colors">
                Memoires schrijven: voorbeelden & tips
              </h3>
              <p className="text-sm text-slate-600">Inspiratie voor jouw autobiografie</p>
            </Link>
            <Link
              href="/kennisbank/levensverhaal-laten-schrijven-kosten"
              className="bg-white rounded-xl p-6 border-2 border-neutral-sand hover:border-orange/30 hover:shadow-md transition-all group"
            >
              <h3 className="font-serif font-semibold text-slate-900 mb-2 group-hover:text-orange transition-colors">
                Wat kost een levensverhaal laten schrijven?
              </h3>
              <p className="text-sm text-slate-600">Vergelijk prijzen en opties</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-orange via-orange-dark to-gold text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-tight">
            Begin vandaag met jouw levensverhaal
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
                Schrijf jouw levensverhaal <ArrowRight className="ml-2 h-5 w-5" />
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
