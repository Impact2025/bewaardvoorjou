"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Heart, Infinity, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const pricingTiers = [
  {
    id: "basis",
    name: "Basis",
    price: "Gratis",
    priceAmount: 0,
    billing: "altijd",
    icon: Sparkles,
    color: "from-slate-500 to-slate-600",
    popular: false,
    features: [
      "3 hoofdstukken",
      "30 minuten opname per maand",
      "Basis AI interviewer",
      "Audio & video opname",
      "Teksttranscriptie",
      "Delen met 1 persoon",
    ],
    limitations: [
      "Beperkte AI vragen",
      "Geen familie features",
      "Standaard support",
    ],
  },
  {
    id: "familie",
    name: "Familie",
    price: "€9,99",
    priceAmount: 9.99,
    billing: "per maand",
    icon: Heart,
    color: "from-pink-500 to-rose-600",
    popular: true,
    features: [
      "Alle hoofdstukken (19 totaal)",
      "10 uur opname per maand",
      "Geavanceerde AI interviewer",
      "Onbeperkte transcripties",
      "Emotionele highlights",
      "Deel met 5 familieleden",
      "Familiestamboom",
      "Gedeelde pods",
      "Prioriteit support",
    ],
    limitations: [],
  },
  {
    id: "legacy",
    name: "Legacy",
    price: "€19,99",
    priceAmount: 19.99,
    billing: "per maand",
    icon: Crown,
    color: "from-amber-500 to-orange-600",
    popular: false,
    features: [
      "Alles van Familie, plus:",
      "Onbeperkte opnames",
      "Voice cloning (beta)",
      "AI documentaire generatie",
      "Fysiek boek (1x per jaar)",
      "Onbeperkte familieleden",
      "Dead man's switch",
      "Tijdcapsule features",
      "Premium AI persona's",
      "VIP support (24/7)",
    ],
    limitations: [],
  },
  {
    id: "eeuwig",
    name: "Eeuwig",
    price: "€499",
    priceAmount: 499,
    billing: "eenmalig",
    icon: Infinity,
    color: "from-purple-500 to-indigo-600",
    popular: false,
    features: [
      "Alles van Legacy, plus:",
      "Levenslange toegang",
      "50 jaar bewaargranantie",
      "Geen maandelijkse kosten",
      "Overdraagbaar naar nakomelingen",
      "Premium fysieke boeken",
      "VR experience toegang",
      "Dedicated success manager",
    ],
    limitations: [],
    badge: "Beste Waarde",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const handleSelectPlan = (tierId: string) => {
    // TODO: Implement payment flow
    router.push(`/checkout?plan=${tierId}`);
  };

  return (
    <AppShell
      title="Kies je Plan"
      description="Bewaar je levensverhaal op jouw manier"
      activeHref="/pricing"
    >
      <div className="space-y-12 pb-20">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange/10 to-gold/10 border border-orange/20">
            <Zap className="h-4 w-4 text-orange" />
            <span className="text-sm font-medium text-slate-700">
              Speciaal introductieaanbod - 30% korting eerste 3 maanden
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            Kies het plan dat bij je past
          </h1>
          <p className="text-lg text-slate-600">
            Start gratis en upgrade wanneer je klaar bent om meer te delen
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {pricingTiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <Card
                key={tier.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 hover:shadow-xl",
                  tier.popular ? "ring-2 ring-orange border-orange scale-105" : "border-slate-200"
                )}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-br from-orange to-gold text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAIRST
                  </div>
                )}
                {tier.badge && (
                  <div className="absolute top-0 left-0 bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                    {tier.badge}
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <div
                    className={cn(
                      "mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4",
                      tier.color
                    )}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription className="text-slate-600 mt-2">
                    <div className="text-3xl font-bold text-slate-900">{tier.price}</div>
                    <div className="text-sm">{tier.billing}</div>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSelectPlan(tier.id)}
                    className={cn(
                      "w-full",
                      tier.popular
                        ? "bg-gradient-to-r from-orange to-gold hover:from-orange-dark hover:to-orange text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                    )}
                  >
                    {tier.id === "basis" ? "Start Gratis" : "Kies dit Plan"}
                  </Button>

                  {tier.id === "basis" && (
                    <p className="text-xs text-center text-slate-500">
                      Geen creditcard nodig
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Vergelijk alle features</h2>
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Feature</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">Basis</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700 bg-orange/5">
                        Familie
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">Legacy</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">Eeuwig</th>
                    </tr>
                  </thead>
                  <tbody>
                    <ComparisonRow
                      feature="Hoofdstukken"
                      values={["3", "19", "19", "19"]}
                      highlight={1}
                    />
                    <ComparisonRow
                      feature="Opnametijd per maand"
                      values={["30 min", "10 uur", "Onbeperkt", "Onbeperkt"]}
                      highlight={1}
                    />
                    <ComparisonRow
                      feature="Familieleden"
                      values={["1", "5", "Onbeperkt", "Onbeperkt"]}
                      highlight={1}
                    />
                    <ComparisonRow
                      feature="AI Interviewer"
                      values={[true, true, true, true]}
                      highlight={1}
                    />
                    <ComparisonRow
                      feature="Familiestamboom"
                      values={[false, true, true, true]}
                      highlight={1}
                    />
                    <ComparisonRow
                      feature="Voice Cloning"
                      values={[false, false, true, true]}
                      highlight={1}
                    />
                    <ComparisonRow
                      feature="Fysiek Boek"
                      values={[false, false, "1x/jaar", "Premium"]}
                      highlight={1}
                    />
                    <ComparisonRow
                      feature="VR Experience"
                      values={[false, false, false, true]}
                      highlight={1}
                    />
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-center">Veelgestelde Vragen</h2>
          <div className="space-y-4">
            <FAQItem
              question="Kan ik later upgraden?"
              answer="Ja, je kunt op elk moment upgraden. Je betaalt alleen het verschil naar rato."
            />
            <FAQItem
              question="Wat gebeurt er als ik mijn abonnement stopzet?"
              answer="Je kunt tot het einde van je betaalde periode nog toegang tot je verhalen. Daarna blijven ze bewaard maar kan je ze niet meer bewerken."
            />
            <FAQItem
              question="Is mijn data veilig?"
              answer="Absoluut. We gebruiken end-to-end encryptie en slaan alles op in beveiligde datacenters in de EU."
            />
            <FAQItem
              question="Kan ik mijn Eeuwig-plan overdragen?"
              answer="Ja, het Eeuwig-plan is overdraagbaar aan je kinderen of kleinkinderen."
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-4 bg-gradient-to-br from-orange/10 to-gold/10 rounded-2xl p-12 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900">
            Klaar om je verhaal te bewaren?
          </h2>
          <p className="text-lg text-slate-600">
            Start vandaag nog gratis, geen creditcard nodig
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-orange to-gold hover:from-orange-dark hover:to-orange text-white px-8"
            onClick={() => router.push("/register")}
          >
            Begin Nu Gratis
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

interface ComparisonRowProps {
  feature: string;
  values: (string | boolean)[];
  highlight?: number;
}

function ComparisonRow({ feature, values, highlight }: ComparisonRowProps) {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-3 px-4 text-sm text-slate-700">{feature}</td>
      {values.map((value, idx) => (
        <td
          key={idx}
          className={cn(
            "py-3 px-4 text-center text-sm",
            highlight === idx && "bg-orange/5"
          )}
        >
          {typeof value === "boolean" ? (
            value ? (
              <Check className="h-5 w-5 text-emerald-500 mx-auto" />
            ) : (
              <span className="text-slate-300">-</span>
            )
          ) : (
            <span className="text-slate-700">{value}</span>
          )}
        </td>
      ))}
    </tr>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          {question}
          <span className={cn("transition-transform", isOpen && "rotate-180")}>▼</span>
        </CardTitle>
      </CardHeader>
      {isOpen && (
        <CardContent>
          <p className="text-slate-600">{answer}</p>
        </CardContent>
      )}
    </Card>
  );
}
