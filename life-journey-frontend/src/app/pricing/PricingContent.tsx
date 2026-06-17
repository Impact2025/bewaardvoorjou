"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, Shield, Truck, Phone, Star, Gift, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Configuratie ─────────────────────────────────────────────────────────────

// Zet op false zodra dozen beschikbaar zijn (over 2 weken)
const BOX_IS_PREORDER = true;
const ERFGOED_SOLD_OUT = true;
const NALATENSCHAP_SOLD_OUT = true;

// Vaderdag deal actief t/m 15 juni 2026
const VADERDAG_DEAL_ACTIVE = true;
const VADERDAG_DEADLINE = "2026-06-21T23:59:59+02:00";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1";

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: "Hoe werkt de gratis proefperiode?",
    a: "Je maakt een gratis account aan — geen creditcard nodig. Je krijgt direct toegang tot de onboarding en de eerste 3 hoofdstukken met de persoonlijke gespreksleider (aangedreven door AI). Na 30 dagen kun je je verhalen blijven lezen en delen, maar voor nieuwe opnames upgrade je naar een betaald pakket.",
  },
  {
    q: "Wanneer ontvang ik de Erfgoed Box?",
    a: BOX_IS_PREORDER
      ? "De dozen zijn momenteel in productie en worden over circa 2 weken verzonden. Na je bestelling ontvang je direct digitale toegang zodat je alvast kunt beginnen. De doos volgt vanzelf."
      : "Binnen 2–4 werkdagen na je bestelling. Je ontvangt een track & trace zodra je pakket op weg is.",
  },
  {
    q: "Wat zit er precies in de Erfgoed Box?",
    a: "Een A5 magneetdoos, een handgemaakte USB-stick in walnouthout (waarop later je verhalen worden gezet), een zwart hout grafiet potlood en een A6 notitieboekje voor analoge aantekeningen. Alles is zorgvuldig uitgekozen om het moment van beginnen bijzonder te maken.",
  },
  {
    q: "Wat is het Nalatenschap pakket?",
    a: "Het Nalatenschap pakket geeft je levenslange digitale toegang — je betaalt eenmalig €229, nooit meer. Inclusief de Erfgoed Box, toegang voor 5 familieleden en 2 kredieten voor een gedrukt boek (zodra die functie beschikbaar is). Ideaal als je abonnementsmoeheid hebt.",
  },
  {
    q: "Wat is een Founding Member?",
    a: "De eerste 100 klanten die een betaald pakket kopen krijgen de eeuwige Founding Member status in hun profiel. Geen financieel voordeel — puur een erkenning dat je bij de allereerste mensen hoort die dit platform mogelijk hebben gemaakt.",
  },
  {
    q: "Kan ik dit als cadeau geven?",
    a: "Ja. Kies bij afrekenen voor 'Cadeau voor iemand anders', voer de naam en het e-mailadres van de ontvanger in en voeg een persoonlijk bericht toe. De ontvanger krijgt een uitnodigingslink per e-mail. De fysieke doos (Erfgoed/Nalatenschap) gaat naar het verzendadres dat je opgeeft.",
  },
  {
    q: "Is mijn data veilig?",
    a: "Ja. Alle data wordt opgeslagen op Nederlandse servers, volledig GDPR-compliant en versleuteld. Wij verkopen nooit data aan derden. Bij het Nalatenschap pakket kun je elk jaar een volledige backup naar de USB-stick laten zetten.",
  },
  {
    q: "Wat als ik stop met betalen (Verhaal / Erfgoed)?",
    a: "Je verhalen blijven altijd leesbaar en deelbaar. Je kunt ze niet meer bewerken of nieuwe opnames toevoegen totdat je verlengt. We sturen 30 dagen van tevoren een herinnering.",
  },
];

// ─── Vergelijkingstabel ───────────────────────────────────────────────────────

const compareRows = [
  { label: "Prijs",               values: ["Gratis (30 dgn)", "€79/jaar", "€149 jaar 1 →\n€99/jaar", "€229 eenmalig"] },
  { label: "Alle 58 hoofdstukken",values: ["3 hoofdstukken",  true,       true,                       true]            },
  { label: "Persoonlijke gespreksleider", values: [true,       true,       true,                       true]            },
  { label: "Digitaal archief",    values: [true,              true,       true,                       true]            },
  { label: "Deellinks",          values: [true,              true,       true,                       true]            },
  { label: "Erfgoed Box",         values: [false,             false,      true,                       true]            },
  { label: "Familieleden",        values: [false,             false,      "5",                        "5"]             },
  { label: "Jaarlijkse verlenging",values:[false,             "€79/jaar", "€99/jaar",                 "Nooit meer"]    },
  { label: "Levenslange toegang", values: [false,             false,      false,                      true]            },
  { label: "Founding Member",     values: [false,             true,       true,                       true]            },
  { label: "Support",             values: ["Email",           "Email",    "Prioriteit",               "Prioriteit"]    },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PricingContent() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [foundingSpots, setFoundingSpots] = useState<{ remaining: number; total: number } | null>(null);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/orders/founding-member-spots`)
      .then((r) => r.json())
      .then(setFoundingSpots)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!VADERDAG_DEAL_ACTIVE) return;
    const deadline = new Date(VADERDAG_DEADLINE).getTime();
    const update = () => {
      const diff = deadline - Date.now();
      if (diff <= 0) { setCountdown(""); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setCountdown(d > 0 ? `${d} dag${d !== 1 ? "en" : ""} en ${h} uur` : `${h}u ${m}m`);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f6f2]">

      {/* ── Vaderdag deal banner ── */}
      {VADERDAG_DEAL_ACTIVE && countdown && (
        <div className="bg-[#1a1a1a] py-3 px-4 text-center">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="flex items-center gap-2 text-white">
              <Clock className="h-4 w-4 text-[#d4af37]" />
              <span className="text-sm font-medium">
                <span className="text-[#d4af37] font-bold">Vaderdag deal</span>
                {" "}— 5 jaar toegang inbegrepen · nog{" "}
                <span className="font-bold">{countdown}</span>
              </span>
            </div>
            <button
              onClick={() => router.push("/vaderdag")}
              className="text-xs font-bold text-[#1a1a1a] bg-[#d4af37] hover:bg-[#c49e2a] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Bekijk Vaderdag pagina →
            </button>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section className="py-16 px-4 text-center max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4 leading-tight">
          Bewaar het verhaal van je ouder(s)<br className="hidden md:block" /> — voor altijd
        </h1>
        <p className="text-lg text-[#555] mb-8 max-w-xl mx-auto leading-relaxed">
          Een geduldige gespreksleider in het Nederlands begeleidt het gesprek. Jij luistert. De verhalen blijven.
        </p>

        {/* Gratis start CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={() => router.push("/register")}
            className="bg-[#1a1a1a] hover:bg-[#333] text-white font-bold px-8 py-4 rounded-xl text-base transition-colors"
          >
            Start gratis — 3 hoofdstukken →
          </button>
          {!ERFGOED_SOLD_OUT && (
            <button
              onClick={() => router.push("/checkout?package=ERFGOED")}
              className="bg-[#d4af37] hover:bg-[#c49e2a] text-[#1a1a1a] font-bold px-8 py-4 rounded-xl text-base transition-colors"
            >
              Bestel de Erfgoed Box
            </button>
          )}
        </div>
        <p className="text-sm text-[#888]">Gratis start: geen creditcard · 30 dagen · stop wanneer je wilt</p>

        {/* Founding member teller */}
        {foundingSpots && foundingSpots.remaining > 0 && foundingSpots.remaining < foundingSpots.total && (
          <div className="mt-6 inline-flex items-center gap-2 bg-[#d4af37]/15 border border-[#d4af37]/40 rounded-full px-5 py-2.5 text-sm text-[#1a1a1a] font-medium">
            <Star className="h-4 w-4 text-[#d4af37] fill-[#d4af37]" />
            Nog <strong>{foundingSpots.remaining}</strong> van de {foundingSpots.total} Founding Member plekken beschikbaar
          </div>
        )}
      </section>

      {/* ── Trust badges ── */}
      <div className="flex flex-wrap justify-center gap-5 text-sm text-[#666] px-4 pb-12">
        {[
          { icon: <Shield className="h-4 w-4" />, text: "Data op NL servers · GDPR" },
          { icon: <Truck className="h-4 w-4" />, text: BOX_IS_PREORDER ? "Doos volgt over 2 weken" : "Gratis verzending (NL)" },
          { icon: <Phone className="h-4 w-4" />, text: "NL telefoonsupport" },
          { icon: <Gift className="h-4 w-4" />, text: "Cadeau-optie bij alle pakketten" },
        ].map((b, i) => (
          <span key={i} className="flex items-center gap-1.5">{b.icon}{b.text}</span>
        ))}
      </div>

      {/* ── Pakket kaarten ── */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">

        {/* Gratis start banner */}
        <div className="bg-white border border-[#e5e0d8] rounded-2xl p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-serif text-xl font-bold text-[#1a1a1a]">Gratis starten</p>
            <p className="text-[#555] text-sm mt-1">Maak een account aan en begin vandaag. Geen creditcard nodig.</p>
            <ul className="mt-3 space-y-1">
              {["Onboarding + eerste 3 hoofdstukken", "Persoonlijke gespreksleider actief", "30 dagen volledig gratis"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#555]">
                  <Check className="h-4 w-4 text-[#2d5016] flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => router.push("/register")}
            className="flex-shrink-0 bg-[#f0ece6] hover:bg-[#e5e0d8] text-[#1a1a1a] font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
          >
            Account aanmaken →
          </button>
        </div>

        {/* Betaalde pakketten */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          <PackageCard
            id="VERHAAL"
            name="Verhaal"
            price="€79"
            priceSub={VADERDAG_DEAL_ACTIVE ? "5 jaar inbegrepen — Vaderdag deal" : "5 jaar inbegrepen"}
            subtitle="Het complete digitale levensverhaal"
            hero={false}
            badge={null}
            isPreorder={false}
            foundingSpots={foundingSpots}
            features={[
              "Alle 58 hoofdstukken",
              "Onbeperkte gesprekssessies",
              "Digitaal archief — levenslang leesbaar",
              "Deellinks met verlooptijd",
              "PDF/digitale export",
              "Email support",
            ]}
            perfectFor={[
              "Voor jezelf beginnen",
              "Digitaal-vaardige gebruiker",
              "Eerst proberen na de gratis periode",
            ]}
            ctaLabel="Bestel Verhaal"
            onSelect={() => router.push("/checkout?package=VERHAAL")}
          />

          <PackageCard
            id="ERFGOED"
            name="Erfgoed"
            price="€149"
            priceSub={VADERDAG_DEAL_ACTIVE ? "5 jaar inbegrepen + doos — Vaderdag deal" : "5 jaar inbegrepen (doos inbegrepen)"}
            priceNote={undefined}
            image="/erfgoed-box.jpg"
            subtitle="Met de fysieke herinneringsdoos"
            hero={true}
            badge="MEEST GEKOZEN"
            isPreorder={BOX_IS_PREORDER}
            soldOut={ERFGOED_SOLD_OUT}
            foundingSpots={foundingSpots}
            features={[
              "Alles van Verhaal",
              "A5 Magneetdoos",
              "USB-stick in walnouthout",
              "Zwart hout grafiet potlood",
              "A6 Notitieboekje",
              "Tot 5 familieleden kunnen meelezen",
              "Prioriteit support",
            ]}
            perfectFor={[
              "Cadeau voor vader of moeder",
              "70e verjaardag, pensioen, jubileum",
              '"Dit verdient een bijzonder moment"',
            ]}
            ctaLabel={BOX_IS_PREORDER ? "Pre-order Erfgoed" : "Bestel Erfgoed"}
            onSelect={() => router.push("/checkout?package=ERFGOED")}
          />

          <PackageCard
            id="NALATENSCHAP"
            name="Nalatenschap"
            price="€229"
            priceSub="eenmalig — nooit meer betalen"
            subtitle="Eén keer betalen, voor altijd bewaard"
            hero={false}
            badge={null}
            isPreorder={BOX_IS_PREORDER}
            soldOut={NALATENSCHAP_SOLD_OUT}
            foundingSpots={foundingSpots}
            features={[
              "Alles van Erfgoed",
              "Levenslange digitale toegang",
              "Certificaat in waszegel-envelop",
              "5 familieleden kunnen meelezen",
              "Jaarlijkse USB-export backup",
              "2 gedrukt boek-credits*",
              "Prioriteit support",
            ]}
            perfectFor={[
              "Geen abonnementskosten meer",
              "Groot cadeau-moment (bijv. 70e verjaardag)",
              "Estate planning / nalatenschap",
            ]}
            ctaLabel={BOX_IS_PREORDER ? "Pre-order Nalatenschap" : "Bestel Nalatenschap"}
            onSelect={() => router.push("/checkout?package=NALATENSCHAP")}
          />
        </div>

        {BOX_IS_PREORDER && (
          <p className="text-center text-xs text-[#888] mt-4">
            * Dozen worden over circa 2 weken verzonden. Digitale toegang start direct na betaling.
            Gedrukt boek-credit beschikbaar zodra printfunctie live is.
          </p>
        )}

        {/* Vergelijkingstabel */}
        <div className="text-center mt-10">
          <button
            onClick={() => setShowCompare(!showCompare)}
            className="text-[#1a1a1a] underline underline-offset-4 text-sm hover:text-[#d4af37] transition-colors"
          >
            {showCompare ? "Verberg vergelijking" : "Bekijk alle features naast elkaar →"}
          </button>
        </div>
        {showCompare && <ComparisonTable />}
      </section>

      {/* ── Founding Member sectie ── */}
      {foundingSpots && foundingSpots.remaining > 0 && foundingSpots.remaining < foundingSpots.total && (
        <section className="bg-[#1a1a1a] py-14 px-4 text-center">
          <div className="max-w-xl mx-auto">
            <Star className="h-8 w-8 text-[#d4af37] fill-[#d4af37] mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold text-white mb-3">
              Founding Member — nog {foundingSpots.remaining} plekken
            </h2>
            <p className="text-[#aaa] text-sm leading-relaxed mb-6">
              De eerste 100 klanten die een betaald pakket kopen krijgen de eeuwige Founding Member status
              in hun profiel. Geen financieel voordeel — puur de erkenning dat jij dit platform mede mogelijk hebt gemaakt.
            </p>
            <button
              onClick={() => router.push(`/checkout?package=${ERFGOED_SOLD_OUT ? "VERHAAL" : "ERFGOED"}`)}
              className="bg-[#d4af37] hover:bg-[#c49e2a] text-[#1a1a1a] font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Word Founding Member →
            </button>
          </div>
        </section>
      )}

      {/* ── Cadeau sectie ── */}
      <section className="py-14 px-4 bg-[#f8f6f2]">
        <div className="max-w-3xl mx-auto text-center">
          <Gift className="h-8 w-8 text-[#d4af37] mx-auto mb-4" />
          <h2 className="font-serif text-3xl font-bold text-[#1a1a1a] mb-3">
            Geef het verhaal van je ouder(s)
          </h2>
          <p className="text-[#555] mb-8 max-w-xl mx-auto">
            Kies bij afrekenen voor "Cadeau voor iemand anders". De ontvanger krijgt een persoonlijke uitnodiging per e-mail
            en de doos gaat naar het adres dat jij opgeeft.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {[
              { step: "1", title: "Kies een pakket", desc: "Erfgoed of Nalatenschap werkt het mooist als cadeau" },
              { step: "2", title: "Personaliseer", desc: "Voer naam, e-mail en een persoonlijk bericht in" },
              { step: "3", title: "Wij regelen de rest", desc: "De ontvanger krijgt een uitnodiging, jij de doos" },
            ].map((s) => (
              <div key={s.step} className="bg-white rounded-xl border border-[#e5e0d8] p-5">
                <div className="w-7 h-7 rounded-full bg-[#d4af37] text-[#1a1a1a] font-bold text-sm flex items-center justify-center mb-3">
                  {s.step}
                </div>
                <p className="font-semibold text-[#1a1a1a] text-sm mb-1">{s.title}</p>
                <p className="text-[#888] text-xs">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            {!ERFGOED_SOLD_OUT && (
              <button
                onClick={() => router.push("/checkout?package=ERFGOED&gift=true")}
                className="bg-[#d4af37] hover:bg-[#c49e2a] text-[#1a1a1a] font-bold px-7 py-3 rounded-xl transition-colors"
              >
                Geef de Erfgoed Box →
              </button>
            )}
            {!NALATENSCHAP_SOLD_OUT && (
              <button
                onClick={() => router.push("/checkout?package=NALATENSCHAP&gift=true")}
                className="bg-[#1a1a1a] hover:bg-[#333] text-white font-bold px-7 py-3 rounded-xl transition-colors"
              >
                Geef Nalatenschap →
              </button>
            )}
            {ERFGOED_SOLD_OUT && NALATENSCHAP_SOLD_OUT && (
              <p className="text-sm text-[#888]">
                De dozen zijn tijdelijk uitverkocht. Meld je aan op de wachtlijst via de pakketkaarten hierboven.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="bg-[#1a1a1a] text-white py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-[#d4af37] text-xl mb-4">⭐⭐⭐⭐⭐</div>
          <blockquote className="font-serif text-xl md:text-2xl leading-relaxed mb-6">
            "Eindelijk een plek waar je jouw leven kunt vastleggen — niet als een droog CV,
            maar als een echt verhaal. Voor de mensen die na jou komen."
          </blockquote>
          <p className="text-[#d4af37] font-medium text-sm">— Ben van Munster, eerste gebruiker</p>
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="py-10 px-4 bg-[#f8f6f2]">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-5 text-sm text-[#555]">
          {[
            "🇳🇱 100% Nederlands product",
            "🔒 Data opgeslagen in Nederland",
            "✓ GDPR-compliant",
            "↩️ 14 dagen bedenktijd",
            "📞 Telefonische support",
          ].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-4 max-w-2xl mx-auto">
        <h2 className="font-serif text-3xl font-bold text-center text-[#1a1a1a] mb-10">
          Veelgestelde vragen
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-[#e5e0d8] rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-[#f8f6f2] transition-colors"
              >
                <span className="font-medium text-[#1a1a1a] text-sm">{faq.q}</span>
                <span className={cn("text-[#d4af37] transition-transform text-lg flex-shrink-0 ml-3", openFaq === i && "rotate-45")}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4 text-[#555] text-sm leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-[#1a1a1a] py-20 px-4 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
          Wacht niet tot "later."
        </h2>
        <p className="text-[#aaa] mb-8 text-lg">Later wordt vaak nooit.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/register")}
            className="bg-white hover:bg-[#f0ece6] text-[#1a1a1a] font-bold px-8 py-4 rounded-xl transition-colors"
          >
            Start gratis →
          </button>
          {!ERFGOED_SOLD_OUT && (
            <button
              onClick={() => router.push("/checkout?package=ERFGOED")}
              className="bg-[#d4af37] hover:bg-[#c49e2a] text-[#1a1a1a] font-bold px-8 py-4 rounded-xl transition-colors"
            >
              Bestel de Erfgoed Box →
            </button>
          )}
        </div>
        <p className="text-[#555] text-xs mt-5">
          {BOX_IS_PREORDER ? "Doos volgt over 2 weken · " : "Gratis verzending · "}
          14 dagen bedenktijd · Data op NL servers
        </p>
      </section>
    </div>
  );
}

// ─── Pakket kaart ─────────────────────────────────────────────────────────────

function PackageCard({
  id,
  name,
  price,
  priceSub,
  priceNote,
  image,
  subtitle,
  hero,
  badge,
  isPreorder,
  soldOut = false,
  foundingSpots,
  features,
  perfectFor,
  ctaLabel,
  onSelect,
}: {
  id: string;
  name: string;
  price: string;
  priceSub: string;
  priceNote?: string;
  image?: string;
  subtitle: string;
  hero: boolean;
  badge: string | null;
  isPreorder: boolean;
  soldOut?: boolean;
  foundingSpots: { remaining: number; total: number } | null;
  features: string[];
  perfectFor: string[];
  ctaLabel: string;
  onSelect: () => void;
}) {
  const showFoundingBadge = foundingSpots && foundingSpots.remaining > 0 && foundingSpots.remaining < foundingSpots.total;
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyStatus, setNotifyStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");

  async function handleNotify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotifyStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: notifyEmail, package_type: id }),
      });
      const data = await res.json();
      setNotifyStatus(res.ok && !data.already_registered ? "success" : res.ok ? "duplicate" : "error");
    } catch {
      setNotifyStatus("error");
    }
  }

  return (
    <div
      className={cn(
        "relative bg-white rounded-2xl overflow-hidden border transition-shadow",
        soldOut
          ? "border-[#e5e0d8] shadow-md"
          : hero
          ? "border-[#d4af37] shadow-2xl md:scale-105 ring-2 ring-[#d4af37]/30"
          : "border-[#e5e0d8] shadow-md hover:shadow-lg"
      )}
    >
      {badge && (
        <div className="bg-[#d4af37] text-[#1a1a1a] text-xs font-bold text-center py-2 tracking-widest">
          ⭐ {badge} ⭐
        </div>
      )}
      {soldOut ? (
        <div className="bg-[#888] text-white text-xs font-bold text-center py-2 tracking-widest">
          TIJDELIJK UITVERKOCHT
        </div>
      ) : (
        <>
          {isPreorder && !badge && (
            <div className="bg-[#1a1a1a] text-white text-xs font-bold text-center py-2 tracking-widest">
              PRE-ORDER · DIGITAAL DIRECT BESCHIKBAAR
            </div>
          )}
          {isPreorder && badge && (
            <div className="bg-[#1a1a1a]/80 text-white text-xs font-medium text-center py-1 tracking-wider">
              PRE-ORDER · DIGITAAL DIRECT BESCHIKBAAR
            </div>
          )}
        </>
      )}

      <div className="p-6 md:p-7">
        {/* Founding member badge */}
        {showFoundingBadge && id !== "VERHAAL" && !soldOut && (
          <div className="flex items-center gap-1.5 bg-[#d4af37]/15 border border-[#d4af37]/40 rounded-lg px-3 py-1.5 mb-4 w-fit">
            <Star className="h-3 w-3 text-[#d4af37] fill-[#d4af37]" />
            <span className="text-xs font-bold text-[#1a1a1a]">Founding Member inbegrepen</span>
          </div>
        )}

        {/* Prijs */}
        <div className="mb-5">
          <h3 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-1">{name}</h3>
          <p className="text-[#888] text-sm mb-3">{subtitle}</p>
          {image && (
            <div className={cn("relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4", soldOut && "opacity-60")}>
              <Image
                src={image}
                alt={`${name} box`}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 350px"
              />
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className={cn("text-4xl font-bold", soldOut ? "text-[#aaa]" : "text-[#1a1a1a]")}>{price}</span>
          </div>
          <p className="text-[#888] text-xs mt-1">{priceSub}</p>
          {priceNote && <p className="text-xs text-[#d4af37] font-medium mt-0.5">{priceNote}</p>}
        </div>

        {/* CTA */}
        {soldOut ? (
          <div className="mb-5">
            {notifyStatus === "success" ? (
              <div className="w-full py-3 rounded-xl bg-[#f0ece6] text-[#1a1a1a] text-sm text-center font-medium">
                ✓ Je staat op de wachtlijst!
              </div>
            ) : notifyStatus === "duplicate" ? (
              <div className="w-full py-3 rounded-xl bg-[#f0ece6] text-[#1a1a1a] text-sm text-center font-medium">
                Je staat al op de wachtlijst.
              </div>
            ) : (
              <form onSubmit={handleNotify} className="space-y-2">
                <p className="text-xs text-[#888] text-center">Stuur me een melding als dit pakket weer beschikbaar is</p>
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="jouw@email.nl"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-[#e5e0d8] text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
                />
                <button
                  type="submit"
                  disabled={notifyStatus === "loading"}
                  className="w-full py-3 rounded-xl font-bold text-sm bg-[#1a1a1a] hover:bg-[#333] text-white transition-colors disabled:opacity-60"
                >
                  {notifyStatus === "loading" ? "Bezig…" : "Stuur me een melding →"}
                </button>
                {notifyStatus === "error" && (
                  <p className="text-xs text-red-600 text-center">Er ging iets mis. Probeer het opnieuw.</p>
                )}
              </form>
            )}
          </div>
        ) : (
          <button
            onClick={onSelect}
            className={cn(
              "w-full py-3 rounded-xl font-bold text-sm transition-colors mb-5",
              hero
                ? "bg-[#d4af37] hover:bg-[#c49e2a] text-[#1a1a1a]"
                : "bg-[#1a1a1a] hover:bg-[#333] text-white"
            )}
          >
            {ctaLabel} →
          </button>
        )}

        {/* Features */}
        <ul className="space-y-2 mb-5">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#2d5016]" />
              <span className="text-[#333]">{f}</span>
            </li>
          ))}
        </ul>

        {/* Perfect voor */}
        <div className="bg-[#f8f6f2] rounded-xl p-4">
          <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2">Perfect voor</p>
          <ul className="space-y-1">
            {perfectFor.map((p, i) => (
              <li key={i} className="text-xs text-[#555]">→ {p}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Vergelijkingstabel ───────────────────────────────────────────────────────

function ComparisonTable() {
  const headers = ["Gratis", "Verhaal", "Erfgoed", "Nalatenschap"];
  return (
    <div className="mt-10 bg-white rounded-2xl border border-[#e5e0d8] overflow-hidden shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e0d8]">
              <th className="text-left py-4 px-4 font-medium text-[#888] w-40">Feature</th>
              {headers.map((h, i) => (
                <th
                  key={h}
                  className={cn(
                    "text-center py-4 px-4 font-medium text-[#1a1a1a]",
                    i === 2 && "bg-[#d4af37]/10"
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compareRows.map((row, i) => (
              <tr key={i} className={cn("border-b border-[#f0ece6]", i % 2 === 0 && "bg-[#faf9f7]")}>
                <td className="py-3 px-4 text-[#555] text-xs">{row.label}</td>
                {row.values.map((val, j) => (
                  <td key={j} className={cn("py-3 px-4 text-center", j === 2 && "bg-[#d4af37]/5")}>
                    {typeof val === "boolean" ? (
                      val
                        ? <Check className="h-4 w-4 text-[#2d5016] mx-auto" />
                        : <span className="text-[#ddd]">—</span>
                    ) : (
                      <span className="text-[#333] text-xs whitespace-pre-line">{val}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 text-center text-xs text-[#aaa]">
        🚚 Gratis verzending (NL) · 🇳🇱 Nederlands product · 🔒 GDPR-compliant
      </div>
    </div>
  );
}
