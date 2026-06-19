"use client";

import Link from "next/link";
import { Heart, Shield, Smile, ArrowRight } from "lucide-react";
import { BabyHeader } from "@/components/baby/BabyHeader";
import { BabyFooter } from "@/components/baby/BabyFooter";
import { useBabyTheme } from "@/components/baby/BabyThemeContext";

const VALUES = [
  {
    Icon: Smile,
    title: "Warmte boven perfectie",
    body: "Ouders hebben geen tijd voor ingewikkelde tools. Bewaard voor Baby stelt elke week één gerichte vraag — niet meer. Schrijf wanneer het jou uitkomt, ook als het om 3 uur 's nachts is.",
  },
  {
    Icon: Shield,
    title: "Jouw verhaal is van jou",
    body: "Wij verkopen geen data, gebruiken jouw foto's niet voor AI-training en slaan alles versleuteld op Europese servers op. Volledig AVG-compliant, altijd.",
  },
  {
    Icon: Heart,
    title: "Voor generaties",
    body: "Het eerste jaar gaat razendsnel. De details die je nu vergeet — het gewicht bij de geboorte, het eerste echte lachje, de bijnamen die je verzon — zijn over 20 jaar onbetaalbaar. Wij helpen je ze te bewaren.",
  },
];

export function OverOnsContent() {
  const { t } = useBabyTheme();

  return (
    <div className="min-h-screen bg-white">
      <BabyHeader />

      {/* Hero */}
      <section className="bg-gray-900 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className={`inline-flex items-center gap-2 ${t.primaryBgMedium} ${t.primaryText} text-sm font-medium px-4 py-1.5 rounded-full mb-6`}>
            Bewaard voor Baby
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Waarom wij dit{" "}
            <span className={t.heroAccent}>gebouwd hebben</span>
          </h1>
          <p className="text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
            Het eerste jaar van een baby gaat zo snel dat ouders achteraf niet meer weten
            wanneer de eerste glimlach was. Wij wilden daar iets aan doen.
          </p>
        </div>
      </section>

      {/* Het probleem */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Het probleem</h2>
          <div className="space-y-5 text-gray-700 text-lg leading-relaxed">
            <p>
              Bijna elke ouder neemt zich voor het eerste jaar goed bij te houden.
              Een babyboek. Maandelijkse foto&apos;s. Een dagboek. Maar dan begint
              de realiteit: slaaptekort, kraamvisite, koliek, voedingen om 3 uur 's
              nachts.
            </p>
            <p>
              Het boek blijft leeg. De foto&apos;s staan wel op de telefoon, maar
              het verhaal erbij is weg. En twee jaar later weet je niet meer wanneer
              ze voor het eerst alleen stonden, of hoe dat eerste echte lachje klonk.
            </p>
            <p className="font-semibold text-gray-900">
              Niet omdat je het niet wilde bewaren. Maar omdat je nooit aan een tool
              had die je er iedere week vriendelijk aan herinnert.
            </p>
          </div>
        </div>
      </section>

      {/* Onze oplossing */}
      <section className={`py-16 px-4 ${t.primaryBg}`}>
        <div className="max-w-2xl mx-auto">
          <div className={`bg-white border ${t.primaryBorder} rounded-2xl p-8 md:p-10`}>
            <div className="text-4xl mb-5">💡</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Onze oplossing: één vraag per week
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              In plaats van een leeg babyboek dat je moet invullen, sturen wij
              jou elke week één warme, persoonlijke vraag. Niet een formulier.
              Niet een checklist. Gewoon een vraag in je inbox, klaar om te
              beantwoorden wanneer het jou uitkomt.
            </p>
            <p className="text-gray-700 leading-relaxed">
              De vragen zijn geschreven voor jouw specifieke rol — moeder,
              partner, of samen — en passen bij de fase waarin jullie baby zich
              bevindt. Na 52 weken heb je zonder het te beseffen een compleet
              verhaal over het meest bijzondere jaar van jullie leven.
            </p>
          </div>
        </div>
      </section>

      {/* Achtergrond / founder */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Het verhaal erachter</h2>
          <div className="space-y-5 text-gray-700 leading-relaxed">
            <p>
              Bewaard voor Baby is een product van{" "}
              <Link href="/" className={`${t.primaryText} font-medium hover:underline`}>
                BewaardVoorJou.nl
              </Link>
              , het platform dat helpt om levensverhalen te bewaren voor toekomstige
              generaties. Dat platform is ontstaan toen de vader van oprichter Vincent
              van Munster begon met het op papier zetten van zijn eigen levensverhaal —
              en al snel merkte hoe uitdagend dat is zonder begeleiding.
            </p>
            <p>
              BewaardVoorJou.nl helpt sindsdien ouderen hun verhaal te vertellen.
              Maar ouders vroegen steeds vaker: <em>&ldquo;Bestaat zoiets ook voor het
              eerste jaar van onze baby?&rdquo;</em>
            </p>
            <p>
              Bewaard voor Baby is het antwoord op die vraag. Hetzelfde principe —
              warme begeleiding, AI-gestuurde vragen, één stap tegelijk — maar dan
              speciaal voor het eerste jaar van een nieuw leven.
            </p>
          </div>
          <div className="mt-8">
            <Link
              href="/about"
              className={`inline-flex items-center gap-2 ${t.primaryText} font-medium text-sm hover:underline`}
            >
              Lees het volledige verhaal van BewaardVoorJou.nl
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Waarden */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Waar wij voor staan
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {VALUES.map(({ Icon, title, body }) => (
              <div key={title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className={`w-12 h-12 rounded-2xl ${t.primaryBg} flex items-center justify-center mb-5`}>
                  <Icon className={`w-5 h-5 ${t.primaryText}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy blok */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-4 items-start p-8 rounded-2xl bg-gray-900 text-white">
            <Shield className={`w-8 h-8 ${t.primaryText} shrink-0 mt-1`} />
            <div>
              <h3 className="font-bold text-lg mb-2">Privacy — geen compromissen</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Jouw babyboek is privé. Wij verkopen geen data, gebruiken jouw foto&apos;s
                en verhalen niet voor het trainen van AI-modellen, en slaan alles versleuteld
                op servers in Europa op. Volledig AVG-compliant. Lees ons{" "}
                <Link href="/privacy" className={`${t.primaryText} hover:underline`}>
                  privacybeleid
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`py-16 px-4 ${t.quoteSection}`}>
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Laat dit jaar niet verloren gaan
          </h2>
          <p className="text-white/75 mb-8 text-sm">
            Eenmalig €59 · Geen abonnement · 1 jaar toegang + fotoboek-voucher
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/checkout?package=BABY_GIFT"
              className="bg-white text-gray-900 font-semibold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm"
            >
              Geef als kraamcadeau
            </Link>
            <Link
              href="/voor-baby/hoe-het-werkt"
              className="border border-white/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              Hoe werkt het?
            </Link>
          </div>
        </div>
      </section>

      <BabyFooter />
    </div>
  );
}
