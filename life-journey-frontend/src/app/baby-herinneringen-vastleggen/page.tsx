import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  ArrowRight,
  Mic,
  Video,
  PenLine,
  Heart,
  Baby,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: { absolute: "Baby herinneringen vastleggen — de eerste duizend dagen | BewaardVoorJou.nl" },
  description:
    "De dagen duren lang, de jaren vliegen. Leg de eerste duizend dagen van je kind vast in tekst, audio of video — zonder je telefoon vol te zetten. Rustig, veilig, blijvend.",
  keywords: [
    "baby herinneringen vastleggen",
    "eerste 1000 dagen",
    "herinneringen kind bewaren",
    "babyboek digitaal",
    "herinneringsdoos baby",
    "ouderschap herinneringen",
    "tropenjaren",
  ],
  alternates: { canonical: "https://bewaardvoorjou.nl/baby-herinneringen-vastleggen" },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://bewaardvoorjou.nl/baby-herinneringen-vastleggen",
    title: "Baby herinneringen vastleggen — de eerste duizend dagen",
    description:
      "De dagen duren lang, de jaren vliegen. Leg de eerste duizend dagen rustig vast, in je eigen stem.",
    siteName: "BewaardVoorJou.nl",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Baby herinneringen vastleggen",
  description:
    "Leg de eerste duizend dagen van je kind vast in tekst, audio of video en bewaar ze veilig voor later.",
  url: "https://bewaardvoorjou.nl/baby-herinneringen-vastleggen",
  mainEntity: {
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Waarom zou ik herinneringen vastleggen als ik al zoveel foto's maak?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Een foto laat zien hoe je kind eruitzag; een verhaal laat zien wie het was en wie jij was als ouder. Juist de kleine dingen — een verkeerd uitgesproken woord, wat je voelde in die eerste nacht — worden nergens vanzelf opgeslagen. Meer beeld is niet hetzelfde als meer herinnering.",
        },
      },
      {
        "@type": "Question",
        name: "Hoeveel tijd kost het om herinneringen vast te leggen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Een minuut is genoeg. Je spreekt een herinnering in terwijl je kind slaapt of vertelt iets recht in de camera. De app zet het om naar tekst en bewaart je stem erbij. Geen schrijftalent nodig.",
        },
      },
      {
        "@type": "Question",
        name: "Zijn de herinneringen van mijn kind veilig opgeslagen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja. Alles staat versleuteld op beveiligde Nederlandse servers en is standaard privé. Jij bepaalt zelf of en wanneer je iets deelt, ook met je kind van later.",
        },
      },
    ],
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://bewaardvoorjou.nl/" },
    { "@type": "ListItem", position: 2, name: "Baby herinneringen vastleggen", item: "https://bewaardvoorjou.nl/baby-herinneringen-vastleggen" },
  ],
};

export default function BabyHerinneringenPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <PublicHeader />

      <main className="min-h-screen bg-warm-50">
        {/* Hero */}
        <section className="bg-white border-b border-neutral-sand py-16 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/10 text-orange text-sm font-medium mb-6">
              <Baby className="h-4 w-4" />
              De eerste duizend dagen
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-semibold text-slate-900 mb-5 leading-tight">
              De dagen duren lang, maar de jaren vliegen voorbij
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Toen mijn eigen vader zijn verhaal wilde vastleggen, zag ik hoe veel al vervaagd was
              — simpelweg omdat niemand het op het moment zelf had opgeschreven. Bij het prille
              begin van een leven gaat dat nóg sneller. Leg de eerste duizend dagen vast voordat ze
              vervagen, in je eigen stem, zonder gedoe.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-orange text-white font-semibold hover:bg-orange/90 transition-colors shadow-md"
              >
                Leg je eerste herinnering vast
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/voor-baby"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Ontdek de baby-variant
              </Link>
            </div>
          </div>
        </section>

        {/* De paradox */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-900 mb-4">
            We maken meer beeld dan ooit, en toch vervaagt er meer dan ooit
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Ouders van jonge kinderen kennen het gevoel: de dagen zijn eindeloos, de nachten kort,
            en toch is het volgende jaar ineens voorbij. Dat eerste woordje, die specifieke manier
            waarop je kind &lsquo;nog een keer&rsquo; zei — het lijkt onvergetelijk, tot het
            vervaagt.
          </p>
          <div className="grid sm:grid-cols-2 gap-5 mt-8">
            <div className="bg-white rounded-2xl border border-neutral-sand p-6 text-center">
              <p className="text-3xl font-serif font-semibold text-orange mb-2">47%</p>
              <p className="text-sm text-slate-600">van de ouders ervaart overbelasting door de smartphone</p>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-sand p-6 text-center">
              <p className="text-3xl font-serif font-semibold text-orange mb-2">42%</p>
              <p className="text-sm text-slate-600">voelt zich soms afgeleid van het kind door &lsquo;always-on&rsquo; gedrag</p>
            </div>
          </div>
        </section>

        {/* SVI formule-kaart */}
        <section className="bg-white border-y border-neutral-sand py-14 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-900 mb-4">
              Waarom een eerste mutsje weggooien bijna pijn doet
            </h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              De psycholoog Russell Belk noemde het het &lsquo;verlengde zelf&rsquo;: de spullen om
              ons heen dragen een stukje van onze identiteit. Een eerste mutsje is geen stof, maar
              een bewijsstuk van een periode die je heeft gevormd. Onderzoekers vatten die
              emotionele waarde soms in een index — je hoeft geen wiskundige te zijn om te zien wat
              ze bedoelen.
            </p>
            <div className="rounded-2xl bg-warm-50 border border-orange/20 p-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-orange mb-3">
                De Sentimentele Waarde-index
              </p>
              <p className="text-xl sm:text-2xl font-serif text-slate-900 mb-4 tracking-tight">
                SVI = (zintuiglijke resonantie × identiteit) / (chaos × overgang)
              </p>
              <p className="text-slate-600 leading-relaxed">
                In gewone taal: de waarde van een herinnering stijgt naarmate ze méér zintuigen
                raakt en méér over wie je bent zegt, en daalt naarmate ze verdwijnt in chaos.
                De les zit in die noemer: duizend ongeordende foto&rsquo;s raken je minder dan één
                zorgvuldig bewaard verhaal. Bewaren werkt pas als je ook kiest.
              </p>
            </div>
          </div>
        </section>

        {/* Vastleggen zonder gedoe */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-900 mb-3 text-center">
            Vastleggen zonder er een project van te maken
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-center mb-10 leading-relaxed">
            Je hebt geen uren en geen schrijftalent nodig. Je kiest zelf hoe je vertelt.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border border-neutral-sand p-6">
              <Mic className="h-7 w-7 text-orange mb-3" />
              <h3 className="font-semibold text-slate-900 mb-1">Inspreken</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Spreek een herinnering in terwijl je kind slaapt. De app zet je woorden om naar
                tekst en bewaart je stem.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-sand p-6">
              <Video className="h-7 w-7 text-orange mb-3" />
              <h3 className="font-semibold text-slate-900 mb-1">Filmen</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Vertel recht in de camera. Zo bewaar je niet alleen de woorden, maar ook je gezicht
                en je stem.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-sand p-6">
              <PenLine className="h-7 w-7 text-orange mb-3" />
              <h3 className="font-semibold text-slate-900 mb-1">Typen</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Liever schrijven? De empathische AI-interviewer stelt de vraag die je anders nooit
                had bedacht.
              </p>
            </div>
          </div>
        </section>

        {/* Veiligheid geruststelling */}
        <section className="bg-white border-y border-neutral-sand py-12 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto flex items-start gap-4">
            <Shield className="h-8 w-8 text-orange shrink-0" />
            <div>
              <h2 className="text-xl font-serif font-semibold text-slate-900 mb-2">
                Veilig bewaard, en van jou
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Alles staat versleuteld op Nederlandse servers en is standaard privé. Jij bepaalt of
                en wanneer je iets deelt — bijvoorbeeld pas als je kind achttien wordt. Lees meer
                over{" "}
                <Link href="/kennisbank/tijdgestuurde-vrijgave-zelf-bepalen-wie-wat-wanneer-ziet" className="text-orange hover:underline">
                  tijdgestuurde vrijgave
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Duale CTA */}
        <section className="bg-warm-50 py-16 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <Heart className="h-8 w-8 text-orange mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-900 mb-3">
              Een cadeau aan je kind van later
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Ooit is dat kind volwassen en wil het weten hoe die eerste jaren echt waren — niet de
              geregisseerde foto&rsquo;s, maar het echte verhaal, in jouw stem. Dat maak je alleen nú.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-orange text-white font-semibold hover:bg-orange/90 transition-colors shadow-md"
              >
                Start gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://www.weareimpact.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-medium hover:bg-white transition-colors"
              >
                Voor organisaties met jonge gezinnen
              </a>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
