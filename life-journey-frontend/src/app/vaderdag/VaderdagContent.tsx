"use client";

import Link from "next/link";
import Image from "next/image";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle,
  Heart,
  Mic,
  Shield,
  Clock,
  Gift,
  Sparkles,
  Star,
} from "lucide-react";

const steps = [
  {
    step: "1",
    title: "Kies het pakket",
    description: "Erfgoed (€149) of Nalatenschap (€229). Digitale toegang start direct na betaling.",
  },
  {
    step: "2",
    title: "Voer naam & e-mail in",
    description: "Vul de naam van je vader en zijn e-mailadres in. Voeg een persoonlijk bericht toe.",
  },
  {
    step: "3",
    title: "Hij ontvangt een uitnodiging",
    description: "Een warme welkomstmail nodigt hem uit. De doos bezorgen we daarna op het opgegeven adres.",
  },
];

const reasons = [
  {
    icon: <Mic className="h-7 w-7 text-orange" />,
    title: "Zijn stem, voor altijd bewaard",
    desc: "Audio- en video-opnames zodat kleinkinderen hem later nog kunnen horen — ook als hij er niet meer is.",
  },
  {
    icon: <Heart className="h-7 w-7 text-orange" />,
    title: "Geen stress, wél verbinding",
    desc: "Een geduldige gespreksleider stelt de vragen. Hij hoeft niks voor te bereiden. Gewoon vertellen.",
  },
  {
    icon: <Gift className="h-7 w-7 text-orange" />,
    title: "Een cadeau dat blijft",
    desc: "Geen gadget die stof verzamelt. Een verhaal dat generaties lang bewaard blijft.",
  },
  {
    icon: <Shield className="h-7 w-7 text-orange" />,
    title: "100% veilig & privé",
    desc: "Nederlandse servers, GDPR-compliant. Alleen de mensen die hij uitnodigt kunnen meelezen.",
  },
];

export default function VaderdagContent() {
  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />

      {/* ── Hero ── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/vaderdag-cadeau.jpg"
            alt="Vader ontvangt zijn BewaardVoorJou box"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/88 via-slate-900/72 to-slate-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full py-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange/20 backdrop-blur-md border border-orange/30 text-white text-sm font-medium mb-8 shadow-xl">
              <Sparkles className="h-4 w-4 text-orange-light" />
              <span>Vaderdag — zondag 21 juni 2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white leading-tight mb-6 drop-shadow-2xl">
              Geef je vader
              <span className="text-orange block mt-2">zijn levensverhaal</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/95 leading-relaxed mb-4 drop-shadow-lg font-light">
              Zijn stem, zijn lach, zijn wijsheid — voor altijd bewaard.
              Voor jou, voor je kinderen, voor de generaties die komen.
            </p>

            <p className="text-lg text-white/85 leading-relaxed mb-10 drop-shadow-lg">
              Een geduldige gespreksleider begeleidt hem door zijn mooiste herinneringen.
              Hij hoeft niks voor te bereiden. Gewoon vertellen.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button
                asChild
                className="bg-orange hover:bg-orange/90 text-white text-lg px-10 py-7 rounded-xl shadow-2xl hover:shadow-orange/50 transition-all duration-300 hover:scale-105 font-semibold"
              >
                <Link href="/checkout?package=ERFGOED&gift=true" className="inline-flex items-center">
                  Bestel de Erfgoed Box — €149 <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
              <Button
                asChild
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white text-lg px-10 py-7 rounded-xl border-2 border-white/40 hover:border-white/60 transition-all duration-300"
              >
                <Link href="#hoe-werkt-het">
                  Hoe werkt het?
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium text-sm drop-shadow">Digitale toegang direct na betaling</span>
              </div>
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium text-sm drop-shadow">Doos bezorgd binnen 2 weken</span>
              </div>
              <div className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-medium text-sm drop-shadow">14 dagen bedenktijd</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Urgentie banner ── */}
      <section className="bg-[#1a1a1a] py-5 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-[#d4af37] flex-shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm">Bestel vóór dinsdag 17 juni voor Vaderdag levering</p>
              <p className="text-[#aaa] text-xs">Digitale toegang start altijd direct · doos volgt daarna</p>
            </div>
          </div>
          <Link
            href="/checkout?package=ERFGOED&gift=true"
            className="flex-shrink-0 bg-[#d4af37] hover:bg-[#c49e2a] text-[#1a1a1a] font-bold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
          >
            Bestel nu →
          </Link>
        </div>
      </section>

      {/* ── Waarom ── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-serif font-semibold text-slate-900 mb-4">
              Waarom dit het mooiste cadeau is
            </h2>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto">
              Niet nog een fles wijn. Niet nog een boek dat hij niet leest.
              Iets dat echt telt — voor altijd.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reasons.map((r, i) => (
              <Card
                key={i}
                className="bg-gradient-to-br from-cream via-white to-warm-sand/10 border-2 border-neutral-sand hover:border-orange/30 hover:shadow-xl transition-all duration-300 group"
              >
                <CardContent className="p-7 text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 mb-5 group-hover:bg-orange/20 group-hover:scale-110 transition-all duration-300">
                    {r.icon}
                  </div>
                  <h3 className="text-lg font-serif font-semibold text-slate-900 mb-2">{r.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{r.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pakketten ── */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-cream via-white to-warm-sand/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange/10 border border-orange/30 text-orange text-xs font-bold mb-4 uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              Vaderdag deal — t/m 21 juni
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">
              Kies het perfecte cadeau
            </h2>
            <p className="text-slate-700">5 jaar inbegrepen. Digitale toegang start direct. De doos bezorgen we binnen 2 weken.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Erfgoed */}
            <div className="relative bg-white rounded-2xl border-2 border-[#d4af37] shadow-2xl overflow-hidden">
              <div className="bg-[#d4af37] text-[#1a1a1a] text-xs font-bold text-center py-2 tracking-widest">
                ⭐ MEEST GEKOZEN VOOR VADERDAG ⭐
              </div>
              <div className="p-8">
                <h3 className="font-serif text-2xl font-bold text-slate-900 mb-1">Erfgoed Box</h3>
                <p className="text-slate-500 text-sm mb-4">De complete Vaderdag-ervaring</p>
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-5">
                  <Image
                    src="/erfgoed-box.jpg"
                    alt="Erfgoed Box inhoud"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
                <div className="mb-1">
                  <span className="text-4xl font-bold text-slate-900">€149</span>
                </div>
                <p className="text-slate-400 text-xs mb-6">5 jaar inbegrepen · doos inbegrepen</p>
                <ul className="space-y-2.5 mb-7">
                  {[
                    "Alle 18 hoofdstukken van zijn leven",
                    "Persoonlijke gespreksleider in het Nederlands",
                    "A5 magneetdoos met goudfolie logo",
                    "USB-stick in walnouthout",
                    "Grafiet potlood & A6 notitieboekje",
                    "5 familieleden kunnen meelezen",
                    "Prioriteit support",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="w-full bg-[#d4af37] hover:bg-[#c49e2a] text-[#1a1a1a] font-bold py-6 text-base"
                >
                  <Link href="/checkout?package=ERFGOED&gift=true">
                    Geef de Erfgoed Box <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Nalatenschap */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-[#1a1a1a] text-white text-xs font-bold text-center py-2 tracking-widest">
                EENMALIG · NOOIT MEER BETALEN
              </div>
              <div className="p-8">
                <h3 className="font-serif text-2xl font-bold text-slate-900 mb-1">Nalatenschap</h3>
                <p className="text-slate-500 text-sm mb-5">Het ultieme erfstuk — levenslang</p>
                <div className="mb-1">
                  <span className="text-4xl font-bold text-slate-900">€229</span>
                </div>
                <p className="text-slate-400 text-xs mb-6">eenmalig — geen verdere kosten ooit</p>
                <ul className="space-y-2.5 mb-7">
                  {[
                    "Alles van de Erfgoed Box",
                    "Levenslange digitale toegang",
                    "Certificaat in waszegel-envelop",
                    "Jaarlijkse USB-export backup",
                    "2 gedrukt boek-credits*",
                    "5 familieleden kunnen meelezen",
                    "Prioriteit support",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="w-full bg-slate-900 hover:bg-slate-700 text-white font-bold py-6 text-base"
                >
                  <Link href="/checkout?package=NALATENSCHAP&gift=true">
                    Geef Nalatenschap <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <p className="text-xs text-slate-400 mt-3 text-center">* gedrukt boek beschikbaar zodra printfunctie live is</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hoe werkt het ── */}
      <section id="hoe-werkt-het" className="py-20 px-4 sm:px-6 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900 mb-4">
              In drie stappen geregeld
            </h2>
            <p className="text-slate-700">Bestellen duurt minder dan 5 minuten.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
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
                    <h3 className="text-xl font-serif font-semibold text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-700 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild className="bg-orange hover:bg-orange/90 text-white text-lg px-10 py-6">
              <Link href="/checkout?package=ERFGOED&gift=true">
                Bestel nu — bezorging binnen 2 weken <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Quote ── */}
      <section className="bg-[#1a1a1a] py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center gap-1 mb-5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-[#d4af37] fill-[#d4af37]" />
            ))}
          </div>
          <blockquote className="font-serif text-xl md:text-2xl text-white leading-relaxed mb-6">
            "Mijn vader heeft zijn hele leven nooit echt over vroeger gepraat.
            Drie sessies later huilde hij tranen van geluk. Dit cadeau is onbetaalbaar."
          </blockquote>
          <p className="text-[#d4af37] font-medium text-sm">— Mirjam, 47 jaar · gaf dit aan haar vader van 74</p>
        </div>
      </section>

      {/* ── Trust ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: <Shield className="h-7 w-7 text-green-600 mx-auto mb-2" />, title: "100% veilig", desc: "Nederlandse servers · GDPR-compliant" },
              { icon: <Heart className="h-7 w-7 text-orange mx-auto mb-2" />, title: "14 dagen bedenktijd", desc: "Geen goed? Geld terug, geen vragen" },
              { icon: <Gift className="h-7 w-7 text-orange mx-auto mb-2" />, title: "Cadeau-ervaring", desc: "Persoonlijke uitnodiging per e-mail" },
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-cream border border-neutral-sand">
                {t.icon}
                <p className="font-semibold text-slate-900 text-sm">{t.title}</p>
                <p className="text-slate-500 text-xs mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-orange via-orange-dark to-gold text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 leading-tight">
            Zijn verhaal verdient<br className="hidden md:block" /> een thuis
          </h2>
          <p className="text-xl mb-10 opacity-95">
            Bestel vóór dinsdag 17 juni voor bezorging met Vaderdag.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-white text-orange hover:bg-neutral-light text-lg px-10 py-7 shadow-2xl font-semibold"
            >
              <Link href="/checkout?package=ERFGOED&gift=true">
                Geef de Erfgoed Box — €149 <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              className="bg-white/15 backdrop-blur-md hover:bg-white/25 text-white text-lg px-10 py-7 border-2 border-white/40 transition-all"
            >
              <Link href="/checkout?package=NALATENSCHAP&gift=true">
                Nalatenschap — €229 eenmalig
              </Link>
            </Button>
          </div>
          <p className="text-sm opacity-80 mt-6">
            Digitale toegang start direct · Doos bezorging binnen 2 weken · 14 dagen bedenktijd
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
