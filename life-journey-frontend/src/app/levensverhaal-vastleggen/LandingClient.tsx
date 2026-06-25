"use client";

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
  Lock,
  MessageCircle,
  Upload,
  BookOpen,
  Star,
  Users,
  PenLine,
  Clock,
  Euro,
} from "lucide-react";

const benefits = [
  {
    icon: <MessageCircle className="h-8 w-8 text-orange" />,
    title: "AI-interviewer die doorvraagt",
    description:
      "Geen leeg scherm meer. Onze AI stelt warme vragen die herinneringen losmaken en vraagt door op de momenten die ertoe doen.",
  },
  {
    icon: <Upload className="h-8 w-8 text-orange" />,
    title: "Kies je manier: audio, video of tekst",
    description:
      "Spreek in met je telefoon, neem een video op of type zelf. Jij kiest per hoofdstuk welk formaat het beste past.",
  },
  {
    icon: <Shield className="h-8 w-8 text-orange" />,
    title: "100% veilig op Nederlandse servers",
    description:
      "AES-256 versleuteling, AVG-compliant, Nederlandse servers. Alleen jij bepaalt wie jouw verhalen mag zien.",
  },
  {
    icon: <BookOpen className="h-8 w-8 text-orange" />,
    title: "78 doordachte hoofdstukken",
    description:
      "Van je vroegste herinneringen tot je levenslessen. Elk hoofdstuk staat op zichzelf — begin waar jij wilt.",
  },
  {
    icon: <Euro className="h-8 w-8 text-orange" />,
    title: "Gratis te starten — geen verborgen kosten",
    description:
      "Geen creditcard, geen proefperiode, geen automatische overgang naar betalen. De gratis versie heeft geen einddatum.",
  },
  {
    icon: <Clock className="h-8 w-8 text-orange" />,
    title: "In jouw eigen tempo",
    description:
      "Geen deadlines, geen druk. Tien minuten per dag of een uur per week — jouw verhaal wacht op jou.",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Maak gratis een account",
    description:
      "Registreren duurt minder dan een minuut. Geen creditcard nodig — echt gratis.",
  },
  {
    step: "2",
    title: "Laat je interviewen door AI",
    description:
      "Kies een hoofdstuk en de AI stelt warme, open vragen. Jij vertelt — in tekst, audio of video. De AI luistert en vraagt door.",
  },
  {
    step: "3",
    title: "Bewaar en deel met wie jij wilt",
    description:
      "Elk antwoord wordt veilig bewaard. Deel een link met familie, stel een tijdcapsule in, of exporteer je verhalen.",
  },
];

const comparisonData = [
  {
    method: "Ghostwriter",
    price: "€2.000 - €10.000",
    quality: "Professioneel boek",
    effort: "Weinig — ander doet het",
    time: "3-6 maanden",
    bestFor: "Mensen met een groot budget",
  },
  {
    method: "DIY platform (Astoldby)",
    price: "€80 - €115",
    quality: "Zelf geschreven boek",
    effort: "Gemiddeld — wekelijks een vraag",
    time: "1 jaar",
    bestFor: "Mensen die kunnen schrijven",
  },
  {
    method: "Invulboek",
    price: "€20 - €50",
    quality: "Beperkt",
    effort: "Hoog — zelf invullen",
    time: "Maanden-jaren",
    bestFor: "Mensen die van papier houden",
  },
  {
    method: "Zelf schrijven",
    price: "€0",
    quality: "Variabel",
    effort: "Zeer hoog — alles zelf",
    time: "Jaren (98% stopt)",
    bestFor: "Ervaren schrijvers",
  },
  {
    method: "BewaardVoorJou.nl",
    price: "Gratis te starten",
    quality: "AI-begeleid, audio/video/tekst",
    effort: "Laag — AI stelt vragen",
    time: "Eigen tempo",
    bestFor: "Iedereen — ook zonder schrijfervaring",
    highlighted: true,
  },
];

export default function LandingClient() {
  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />

      {/* Hero Section — exact zelfde design als homepage */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/Header-Image-min.png"
            alt="Levensverhaal vastleggen met BewaardVoorJou.nl"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/70 to-slate-900/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full py-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/20 backdrop-blur-md border border-orange/30 text-white text-sm font-medium mb-8 shadow-xl">
              <Sparkles className="h-4 w-4 text-orange-light" />
              <span>De compleetste gids voor je levensverhaal</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-6 drop-shadow-2xl">
              Je levensverhaal
              <span className="text-orange block mt-2">vastleggen?</span>
              <span className="block mt-2">Wij helpen</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/95 leading-relaxed mb-4 drop-shadow-lg font-light">
              Geen dure ghostwriter, geen schrijversblok. Gewoon jouw verhaal — in je eigen woorden, met AI die de vragen stelt.
            </p>

            <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-10 drop-shadow-lg">
              Ontdek alle methoden voor het vastleggen van je levensverhaal en kies wat bij jou past. Van ghostwriter tot AI — wij vergelijken ze voor je.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                asChild
                className="bg-orange hover:bg-orange/90 text-white text-lg px-10 py-7 rounded-xl shadow-2xl hover:shadow-orange/50 transition-all duration-300 hover:scale-105 font-semibold"
              >
                <Link href="/register" className="inline-flex items-center">
                  Start gratis <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
              <Button
                asChild
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-lg px-10 py-7 rounded-xl border-2 border-white/40 hover:border-white/60 transition-all duration-300"
              >
                <Link href="#vergelijking">
                  Methoden vergelijken
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium drop-shadow text-sm sm:text-base">Gratis starten</span>
              </div>
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium drop-shadow text-sm sm:text-base">AI-begeleiding</span>
              </div>
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium drop-shadow text-sm sm:text-base">Audio, video & tekst</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vergelijkingstabel — uniek voor deze pagina */}
      <section id="vergelijking" className="py-20 px-4 sm:px-6 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-slate-900 mb-4">
              Alle methoden vergeleken
            </h2>
            <p className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto">
              Van ghostwriter tot AI-interviewer — ontdek welke manier van levensverhaal vastleggen bij jou past
            </p>
          </div>

          {/* Mobiele kaarten, desktop tabel */}
          <div className="block md:hidden space-y-4">
            {comparisonData.map((item, i) => (
              <Card key={i} className={`border-2 ${item.highlighted ? "border-orange bg-orange/5 shadow-xl" : "border-neutral-sand hover:border-orange/30"}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className={`font-serif font-semibold ${item.highlighted ? "text-orange text-xl" : "text-slate-900 text-lg"}`}>
                      {item.method}
                    </h3>
                    <span className="font-bold text-lg">{item.price}</span>
                  </div>
                  <div className="space-y-1.5 text-sm text-slate-700">
                    <p><span className="font-medium text-slate-900">Kwaliteit:</span> {item.quality}</p>
                    <p><span className="font-medium text-slate-900">Inspanning:</span> {item.effort}</p>
                    <p><span className="font-medium text-slate-900">Tijd:</span> {item.time}</p>
                    <p><span className="font-medium text-slate-900">Beste voor:</span> {item.bestFor}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop tabel */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="py-4 px-4 font-serif font-semibold text-slate-900">Methode</th>
                  <th className="py-4 px-4 font-serif font-semibold text-slate-900">Prijs</th>
                  <th className="py-4 px-4 font-serif font-semibold text-slate-900">Kwaliteit</th>
                  <th className="py-4 px-4 font-serif font-semibold text-slate-900">Inspanning</th>
                  <th className="py-4 px-4 font-serif font-semibold text-slate-900">Tijd</th>
                  <th className="py-4 px-4 font-serif font-semibold text-slate-900">Beste voor</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((item, i) => (
                  <tr
                    key={i}
                    className={`border-b border-neutral-sand/50 transition-colors ${
                      item.highlighted
                        ? "bg-orange/5 border-l-4 border-l-orange"
                        : "hover:bg-orange/5"
                    }`}
                  >
                    <td className={`py-4 px-4 font-medium ${item.highlighted ? "text-orange" : "text-slate-900"}`}>
                      {item.method}
                    </td>
                    <td className={`py-4 px-4 font-semibold ${item.highlighted ? "text-orange" : "text-slate-900"}`}>
                      {item.price}
                    </td>
                    <td className="py-4 px-4 text-slate-700">{item.quality}</td>
                    <td className="py-4 px-4 text-slate-700">{item.effort}</td>
                    <td className="py-4 px-4 text-slate-700">{item.time}</td>
                    <td className="py-4 px-4 text-slate-700">{item.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-10">
            <p className="text-slate-700 mb-4">
              <strong>BewaardVoorJou.nl</strong> is de enige methode die AI-begeleiding, meerdere formaten en een gratis start combineert. Geen schrijver nodig.
            </p>
            <Button asChild className="bg-orange hover:bg-orange/90 text-white text-lg px-10 py-6">
              <Link href="/kennisbank/levensverhaal-laten-schrijven-kosten">
                Lees de volledige prijsvergelijking <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonial banner */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4 text-white">
            <Star className="h-8 w-8 text-orange flex-shrink-0 mt-1" />
            <div>
              <p className="text-lg md:text-xl leading-relaxed italic mb-4 opacity-95">
                "Ik dacht dat ik een schrijver moest betalen om mijn levensverhaal vast te leggen. 
                Maar BewaardVoorJou stelde mij gewoon de juiste vragen. Na drie maanden had ik meer 
                dan honderd pagina's die ik mijn kinderen met trots kon geven."
              </p>
              <p className="text-white/70 text-sm font-medium">— Henk, 74 jaar, gepensioneerd leraar</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section — exact zelfde design als homepage */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-slate-900 mb-4">
              Waarom BewaardVoorJou.nl?
            </h2>
            <p className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto">
              Alles wat je nodig hebt om je levensverhaal vast te leggen — zonder dat je zelf schrijver hoeft te zijn
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
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
                  <p className="text-slate-700 leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Video/Audio/Text Icons */}
          <div className="bg-gradient-to-br from-orange/5 to-gold/5 rounded-2xl p-8 md:p-12 border border-orange/20">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-serif font-semibold text-slate-900 mb-3">
                Kies hoe je vastlegt
              </h3>
              <p className="text-slate-700 text-lg">
                Wissel per hoofdstuk van formaat — elk moment verdient zijn eigen vorm
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <Mic className="h-10 w-10 text-orange mx-auto mb-3" />
                <h4 className="font-semibold text-slate-900 mb-2">Audio</h4>
                <p className="text-sm text-slate-600">Bewaar je stem voor altijd</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <Heart className="h-10 w-10 text-orange mx-auto mb-3" />
                <h4 className="font-semibold text-slate-900 mb-2">Video</h4>
                <p className="text-sm text-slate-600">Emotie vastgelegd voor later</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <FileText className="h-10 w-10 text-orange mx-auto mb-3" />
                <h4 className="font-semibold text-slate-900 mb-2">Tekst</h4>
                <p className="text-sm text-slate-600">Schrijf zoals je praat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — exact zelfde design als homepage */}
      <section id="hoe-werkt-het" className="py-20 px-4 sm:px-6 bg-gradient-to-br from-cream via-white to-warm-sand/20 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-slate-900 mb-4">
              Zo leg je je levensverhaal vast
            </h2>
            <p className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto">
              In drie eenvoudige stappen bewaar je jouw herinneringen voor altijd
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-12">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                {index < howItWorks.length - 1 && (
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
                    <p className="text-slate-700 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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

      {/* Trust & Security — exact zelfde design als homepage */}
      <section id="trust" className="py-20 px-4 sm:px-6 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-slate-900 mb-4">
              Jouw verhaal, veilig bewaard
            </h2>
            <p className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto">
              Privacy en veiligheid staan bij ons centraal
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-neutral-sand hover:border-green-500/30 transition-colors">
              <CardContent className="p-8">
                <Shield className="h-12 w-12 text-green-600 mb-4" />
                <h3 className="text-xl font-serif font-semibold text-slate-900 mb-3">
                  Bank-niveau versleuteling
                </h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Alle verhalen worden versleuteld opgeslagen op Nederlandse servers. Niemand kan ze lezen zonder jouw toestemming.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>End-to-end versleuteling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Veilige Nederlandse servers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>GDPR-compliant</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-neutral-sand hover:border-blue-500/30 transition-colors">
              <CardContent className="p-8">
                <Lock className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-serif font-semibold text-slate-900 mb-3">
                  Jij hebt de controle
                </h3>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Bepaal zelf wie toegang krijgt tot jouw verhalen en wanneer.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Deel selectief met familie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Tijdgestuurde vrijgave mogelijk</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Altijd je eigen data exporteren</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <Heart className="h-12 w-12 text-orange mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
                Gemaakt in Nederland, met zorg
              </h3>
              <p className="text-lg text-white/90 leading-relaxed">
                BewaardVoorJou.nl is ontwikkeld met respect voor jouw privacy en Nederlandse waarden.
                Geen grote tech-bedrijven, geen verrassingen. Gewoon een veilige plek voor jouw verhaal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA — exact zelfde design als homepage */}
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
                Start gratis <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-lg px-10 py-7 rounded-xl border-2 border-white/40 hover:border-white/60 transition-all duration-300"
            >
              <Link href="/kennisbank/levensverhaal-laten-schrijven-kosten">Bekijk prijzen</Link>
            </Button>
          </div>

          <p className="text-sm opacity-90 mb-12">
            Geen creditcard nodig • Altijd opzegbaar • 100% GDPR veilig
          </p>

          <div className="flex flex-wrap justify-center gap-6 md:gap-10 pt-12 border-t border-white/20">
            <div className="flex items-center gap-2 text-sm opacity-95">
              <Shield className="h-5 w-5" />
              <span>Nederlandse servers</span>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-95">
              <Lock className="h-5 w-5" />
              <span>AVG-compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm opacity-95">
              <Heart className="h-5 w-5" />
              <span>Met zorg gemaakt</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contextuele interne links — helpt ontdekking & SEO */}
      <section className="py-16 px-4 sm:px-6 bg-warm-50 border-t border-neutral-sand">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-8 text-center">
            Ontdek meer
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 text-slate-700">
            <Link href="/autobiografie-hulp" className="hover:text-orange transition-colors">Autobiografie schrijven →</Link>
            <Link href="/kennisbank/levensverhaal-laten-schrijven-kosten" className="hover:text-orange transition-colors">Wat kost een levensverhaal? →</Link>
            <Link href="/kennisbank/hoe-begin-ik-met-het-vastleggen-van-mijn-levensverhaal" className="hover:text-orange transition-colors">Hoe begin ik? Stap-voor-stap →</Link>
            <Link href="/kennisbank/memoires-schrijven-voorbeelden-en-tips" className="hover:text-orange transition-colors">Memoires schrijven: 10 voorbeelden →</Link>
            <Link href="/kennisbank/cadeau-70-jaar-originele-ideeen" className="hover:text-orange transition-colors">Cadeau voor 70-jarige? 10 ideeën →</Link>
            <Link href="/kennisbank/complete-gids-levensverhaal-vastleggen" className="hover:text-orange transition-colors">Complete gids levensverhaal →</Link>
            <Link href="/veilig-digitaal-familiearchief" className="hover:text-orange transition-colors">Digitaal familiearchief →</Link>
            <Link href="/blog" className="hover:text-orange transition-colors">Verhalen & inspiratie →</Link>
            <Link href="/faq" className="hover:text-orange transition-colors">Veelgestelde vragen →</Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
