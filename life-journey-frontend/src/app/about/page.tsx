import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  Shield,
  Users,
  CheckCircle,
  ArrowRight,
  Building2,
  Lightbulb,
  Lock
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

const PAGE_URL = "https://bewaardvoorjou.nl/about";
const PAGE_DESCRIPTION =
  "Het verhaal achter BewaardVoorJou.nl — ontstaan uit een persoonlijke familiebehoefte en de missie om levensverhalen te bewaren voor volgende generaties.";

export const metadata: Metadata = {
  title: "Over ons | BewaardVoorJou.nl",
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: PAGE_URL,
    siteName: "Bewaard voor jou",
    title: "Over ons | BewaardVoorJou.nl",
    description: PAGE_DESCRIPTION,
  },
};

export default function OverOnsPage() {
  const coreValues = [
    {
      icon: <Heart className="h-8 w-8 text-orange" />,
      title: "Menselijke warmte voorop",
      description:
        "Technologie moet verbinden, niet distantiëren. Onze AI-begeleiding voelt aan als een warm gesprek aan de keukentafel met een geïnteresseerde luisteraar.",
    },
    {
      icon: <Lock className="h-8 w-8 text-orange" />,
      title: "100% Nederlandse privacy",
      description:
        "Jouw levensverhaal is van jou. Wij geloven niet in 'Big Tech' die met je data aan de haal gaat. Het platform draait volledig op streng beveiligde Nederlandse servers en voldoet aan de hoogste AVG-privacywetgeving.",
    },
    {
      icon: <Users className="h-8 w-8 text-orange" />,
      title: "Toegankelijk voor iedereen",
      description:
        "Geen ingewikkelde menu's of technische drempels. Het platform is zo ontworpen dat ook ouderen of mensen met minder computerervaring er direct in hun eigen tempo mee aan de slag kunnen.",
    },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />

      {/* Hero */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight">
            Het verhaal achter{" "}
            <span className="text-orange">BewaardVoorJou.nl</span>
          </h1>
          <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
            Ontstaan op het snijvlak van een persoonlijke familiebehoefte en
            technologische innovatie.
          </p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif font-semibold text-slate-900 mb-8">
            Hoe het begon
          </h2>
          <div className="prose prose-lg text-slate-700 space-y-6">
            <p>
              BewaardVoorJou.nl is ontstaan op het snijvlak van een persoonlijke
              familiebehoefte en technologische innovatie. Toen de vader van
              oprichter Vincent van Munster begon met het op papier zetten van
              zijn levensverhaal, werd al snel duidelijk hoe waardevol — maar ook
              hoe uitdagend — dat proces is. Hoe begin je? Welke herinneringen
              horen erin thuis? En hoe zorg je dat de essentie en de stem van die
              herinneringen écht behouden blijven voor de volgende generaties?
            </p>
            <p>
              Het bleek een universele behoefte: iedereen heeft een verhaal dat
              het waard is om bewaard te worden, maar niet iedereen is een geboren
              schrijver of heeft de tijd om uren achter een computer door te
              brengen.
            </p>
            <p>
              Om zijn vader — en inmiddels vele anderen — te helpen hun
              geschiedenis levend te houden, besloot Vincent zijn expertise in te
              zetten. Als oprichter van WeAreImpact ontwikkelt hij dagelijks
              slimme software- en AI-oplossingen die mens en technologie
              verbinden. Dit keer besloot hij die kennis te gebruiken voor iets
              heel persoonlijks: een veilige, warme en eenvoudige plek waar
              levensverhalen moeiteloos vorm krijgen.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-6 bg-cream border-t border-neutral-sand">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-orange/10 to-gold/10 rounded-2xl p-8 md:p-12 border border-orange/20">
            <Lightbulb className="h-10 w-10 text-orange mb-4" />
            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-slate-900 mb-4">
              Onze missie: Technologie met een warm hart
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Bij BewaardVoorJou.nl geloven we dat een levensverhaal het mooiste
              fundament van een familie is. Onze missie is om het vastleggen van
              deze herinneringen zo laagdrempelig en persoonlijk mogelijk te
              maken.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Met de technologische basis van WeAreImpact hebben we een
              empathische, digitale interviewer ontwikkeld. Deze stelt op het
              juiste moment de juiste vragen om herinneringen stap voor stap naar
              boven te halen. Of je nu het liefst praat tegen een microfoon,
              jezelf opneemt op video, of typt: het platform past zich aan jou
              aan. Precies zoals Vincent het voor zijn eigen vader heeft
              ontworpen.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-6 bg-white border-t border-neutral-sand">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-serif font-semibold text-slate-900 text-center mb-4">
            Waar wij voor staan
          </h2>
          <p className="text-center text-slate-700 mb-12">
            BewaardVoorJou.nl is gebouwd op de kernwaarden van WeAreImpact:
            tastbare resultaten leveren met oog voor de menselijke maat.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {coreValues.map((value, index) => (
              <Card
                key={index}
                className="border-2 border-neutral-sand hover:border-orange/30 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-8">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 mb-5">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-serif font-semibold text-slate-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WeAreImpact */}
      <section className="py-16 px-6 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="h-8 w-8 text-orange" />
            <h2 className="text-2xl font-serif font-semibold">Over WeAreImpact</h2>
          </div>
          <p className="text-white/90 leading-relaxed text-lg">
            BewaardVoorJou.nl is een concept van{" "}
            <a
              href="https://weareimpact.nl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange hover:underline"
            >
              WeAreImpact
            </a>
            , het platform waarmee Vincent van Munster organisaties, teams en
            welzijnsprofessionals helpt te vernieuwen met behulp van AI en
            technologie. Vanuit de visie dat innovatie altijd de mens moet
            ondersteunen, bouwt WeAreImpact aan oplossingen die écht
            maatschappelijke waarde toevoegen. BewaardVoorJou.nl is daar het
            meest persoonlijke voorbeeld van: een platform dat families dichter
            bij elkaar brengt en zorgt dat kostbare verhalen nooit verloren gaan.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-cream">
        <div className="max-w-2xl mx-auto text-center">
          <Heart className="h-10 w-10 text-orange mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-serif font-semibold text-slate-900 mb-4">
            Laat jouw verhaal niet verloren gaan
          </h2>
          <p className="text-slate-700 mb-8">
            Start vandaag en geef je levensverhaal een thuis — voor jezelf, je
            familie en de volgende generaties.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-orange hover:bg-orange/90 text-white text-lg px-8 py-6"
            >
              <Link href="/register">
                Begin gratis <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="border-2 border-slate-300 text-slate-700 hover:border-orange hover:text-orange text-lg px-8 py-6"
            >
              <Link href="/contact">Neem contact op</Link>
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
