"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Star, Phone, Shield, Truck, Mail, Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { joinWaitlist, type WaitlistPackage } from "@/lib/api/waitlist";
import { getEarlyBirdStatus, type EarlyBirdStatus } from "@/lib/api/early-bird";

// ─── Pakket definities ───────────────────────────────────────────────────────

const packages = [
  {
    id: "BEGIN",
    name: "Het Begin",
    price: 89,
    priceDisplay: "€89",
    subtitle: "Voor wie voorzichtig wil beginnen",
    hero: false,
    badge: null,
    ctaLabel: "Bestel Het Begin",
    perfectFor: ["Verjaardagscadeau (60-75 jaar)", '"Ik wil het eerst proberen"', "Budget €50-100"],
    socialProof: "234 families begonnen hier",
    features: [
      "Elegante matzwarte geschenkdoos",
      "USB-stick 16GB",
      "Welkomstkaart met persoonlijke boodschap",
      "3 levensfasen vastleggen",
      "30 AI-gestuurde interviews in het Nederlands",
      "50 foto's uploaden en bewaren",
      "Audio-opnames van je stem",
      "3 jaar veilige cloud-opslag (NL servers)",
      "Mooi vormgegeven PDF-boek",
      "Delen met 2 familieleden",
      "Email support",
    ],
    missingHighlights: [
      "Geen geurkaars (ritueel ervaring)",
      "Geen telefoonhouder (comfort)",
      "Geen onbeperkte verhalen",
      "Slechts 3 jaar opslag (vs 10 jaar)",
    ],
  },
  {
    id: "ERFGOED",
    name: "De Erfgoed Box",
    price: 249,
    priceDisplay: "€249",
    subtitle: "De complete ervaring om samen te beleven",
    hero: true,
    badge: "MEEST GEKOZEN",
    ctaLabel: "Bestel De Erfgoed Box",
    perfectFor: ["70e verjaardag, jubileum, pensioen", '"Dit is een bijzonder moment"', "Budget €150-300"],
    socialProof: "862 families kozen deze",
    features: [
      // Ritueel
      "Premium magneetdoos met goudfolie",
      "Houten telefoonhouder (gegraveerd)",
      'Geurkaars "Warm Memory"',
      'Premium thee "Reflection Blend"',
      "Houten zandloper (20 minuten ritueel)",
      'Notitieboekje "Voor Later"',
      // Digitaal
      "5 fase-kaarten met QR-code (luxe, goudfolie)",
      "Onbeperkte levensfasen vastleggen",
      "Onbeperkte AI-interviews (empathisch, NL)",
      "Onbeperkt foto's en video's",
      "Automatische transcriptie",
      "Tijdlijn-weergave door je leven",
      "Simpele stamboom (3 generaties)",
      // Opslag
      "USB-stick 64GB metaal",
      "10 jaar gegarandeerde cloud-opslag",
      "Premium PDF + ePub boek",
      "5 familieleden kunnen meekijken",
      "Automatische backup",
      // Support
      "Telefonische hulp (Nederlands, geen chatbot)",
      "Prioriteit support",
      "Video-tutorials",
    ],
    missingHighlights: [],
  },
  {
    id: "VOOR_ALTIJD",
    name: "Voor Altijd",
    price: 399,
    priceDisplay: "€399",
    originalPrice: "€449",
    priceNote: "launch aanbieding",
    subtitle: "Het ultieme erfstuk voor generaties",
    hero: false,
    badge: null,
    ctaLabel: "Bestel Voor Altijd",
    perfectFor: ['"Once in a lifetime" moment', "Pensioen, ernstige ziekte", "Estate planning"],
    socialProof: "138 families investeerden in levenslang",
    features: [
      "Alles van De Erfgoed Box, plus:",
      "XL premium doos (family tree gravering)",
      "Premium houten houder (custom gravering naam)",
      "USB 128GB + extra backup USB-stick",
      "LEVENSLANGE cloud-opslag (geen vervaldatum)",
      "USB wordt elk jaar ververst (10 jaar garantie)",
      "Overdracht aan erfgenamen automatisch geregeld",
      "Testament-integratie",
      "60 minuten biografie video-consult",
      "White-glove onboarding (persoonlijk intake call)",
      "Premium phone support (altijd voorrang)",
      "Technische hulp bij installatie (video call)",
      "Toegang voor rouwverwerkers na overlijden",
      '"Memorial space" waar familie kan toevoegen',
      "Jaarlijkse herinnering (verjaardag updates)",
      "10 familieleden kunnen meekijken",
    ],
    missingHighlights: [],
  },
] as const;

// ─── Sold-out configuratie ───────────────────────────────────────────────────
// Zet een pakket-ID hier neer om het als uitverkocht te markeren.
// Verwijder het entry zodra de dozen leverbaar zijn.
const SOLD_OUT: Partial<Record<string, { availableFrom: string }>> = {
  ERFGOED: { availableFrom: "september" },
  VOOR_ALTIJD: { availableFrom: "september" },
};

// ─── Vergelijkingstabel ──────────────────────────────────────────────────────

const compareRows = [
  { label: "Prijs", values: ["€89", "€249", "€399"] },
  { label: "Luxe verpakking", values: ["Basis", "Premium ✓", "XL Premium ✓"] },
  { label: "Telefoonhouder", values: [false, "Hout ✓", "Custom gegrav. ✓"] },
  { label: "Geurkaars", values: [false, true, true] },
  { label: "Premium thee", values: [false, true, true] },
  { label: "Zandloper", values: [false, true, true] },
  { label: "Levensfasen", values: ["3", "Onbeperkt", "Onbeperkt"] },
  { label: "AI-interviews", values: ["30", "Onbeperkt", "Onbeperkt"] },
  { label: "Foto's", values: ["50", "Onbeperkt", "Onbeperkt"] },
  { label: "Video's", values: [false, true, true] },
  { label: "Familieleden", values: ["2", "5", "10"] },
  { label: "Stamboom", values: [false, true, true] },
  { label: "Cloud bewaring", values: ["3 jaar", "10 jaar", "LEVENSLANG"] },
  { label: "USB-stick", values: ["16GB", "64GB", "128GB + backup"] },
  { label: "Jaarlijkse refresh", values: [false, false, "✓ (10 jaar)"] },
  { label: "Email support", values: [true, true, true] },
  { label: "Telefonische hulp", values: [false, true, "Priority ✓"] },
  { label: "Biografie consult", values: [false, false, "60 min ✓"] },
  { label: "PDF boek", values: ["Basis", "Premium ✓", "Premium ✓"] },
  { label: "Testament integratie", values: [false, false, true] },
  { label: "Memorial space", values: [false, false, true] },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: "Is dit niet te moeilijk voor mijn ouders?",
    a: "Nee! We hebben het speciaal ontworpen voor mensen die niet tech-savvy zijn. De QR-codes starten alles automatisch. En we hebben Nederlandse telefoonsupport als ze vast zitten.",
  },
  {
    q: "Wat gebeurt er na 10 jaar? (Erfgoed Box)",
    a: "Je kunt verlengen (€29/jaar) of alles downloaden. Je USB-stick bevat altijd een volledige backup.",
  },
  {
    q: "Kunnen meerdere mensen tegelijk verhalen toevoegen?",
    a: "Ja! Tot 5 familieleden kunnen inloggen en verhalen toevoegen, reacties plaatsen, of oude foto's uploaden.",
  },
  {
    q: "Wat als mijn ouder overlijdt?",
    a: "De toegang gaat automatisch over naar jou als erfgenaam. Alle verhalen blijven toegankelijk.",
  },
  {
    q: "Is mijn data veilig?",
    a: "Ja. Opgeslagen op Nederlandse servers, volledig GDPR-compliant, en encrypted. Wij verkopen nooit je data aan derden.",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function PricingContent() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [earlyBird, setEarlyBird] = useState<EarlyBirdStatus | null>(null);

  useEffect(() => {
    getEarlyBirdStatus().then(setEarlyBird);
  }, []);

  const handleSelectPackage = (packageId: string) => {
    router.push(`/checkout?package=${packageId}`);
  };

  return (
    <div className="min-h-screen bg-[#f8f6f2]">
      {/* ── Pricing hero ── */}
      <section className="py-16 px-4 text-center max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
          Kies jouw pakket
        </h1>
        <p className="text-lg text-[#555] mb-2">
          Eenmalige betaling. Geen abonnement. Altijd van jou.
        </p>
        <div className="inline-flex items-center gap-2 bg-[#d4af37]/15 border border-[#d4af37]/40 rounded-full px-4 py-2 text-sm text-[#1a1a1a] font-medium mb-4">
          🎁 Vaderdag — direct beschikbaar via e-mail · doos volgt in september
        </div>
        <div className="flex items-center justify-center gap-6 text-sm text-[#555] mt-2">
          <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> Gratis verzending (september)</span>
          <span className="flex items-center gap-1"><Shield className="h-4 w-4" /> 14 dagen bedenktijd</span>
          <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> NL telefoonsupport</span>
        </div>
      </section>

      {/* ── Pakket kaarten ── */}
      <section className="px-4 pb-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              soldOut={SOLD_OUT[pkg.id] ?? null}
              earlyBird={pkg.id === "BEGIN" ? earlyBird : null}
              onSelect={handleSelectPackage}
            />
          ))}
        </div>

        {/* Vergelijkingstabel toggle */}
        <div className="text-center mt-10">
          <button
            onClick={() => setShowCompare(!showCompare)}
            className="text-[#1a1a1a] underline underline-offset-4 text-sm hover:text-[#d4af37] transition-colors"
          >
            {showCompare ? "Verberg vergelijking" : "Bekijk alle features vergelijking →"}
          </button>
        </div>

        {showCompare && <ComparisonTable />}
      </section>

      {/* ── Testimoniaal ── */}
      <section className="bg-[#1a1a1a] text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-[#d4af37] text-2xl mb-4">⭐⭐⭐⭐⭐</div>
          <blockquote className="font-serif text-xl md:text-2xl leading-relaxed mb-6">
            "Mijn moeder was 78 en had kanker. Dit gaf ons de tijd om rustig te praten over haar
            leven. Drie maanden later overleed ze. Ik ben zo dankbaar dat we dit hebben."
          </blockquote>
          <p className="text-[#d4af37] font-medium">— Robert, Amsterdam</p>
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="py-10 px-4 bg-[#f8f6f2]">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-6 text-sm text-[#555]">
          {[
            "🇳🇱 100% Nederlands product",
            "🔒 Data opgeslagen in Nederland",
            "✓ GDPR-compliant",
            "↩️ 14 dagen niet-goed-geld-terug",
            "📞 Telefonische support in het Nederlands",
          ].map((item) => (
            <span key={item} className="flex items-center gap-1">{item}</span>
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
            <div
              key={i}
              className="bg-white border border-[#e5e0d8] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-[#f8f6f2] transition-colors"
              >
                <span className="font-medium text-[#1a1a1a]">{faq.q}</span>
                <span className={cn("text-[#d4af37] transition-transform text-lg", openFaq === i && "rotate-45")}>+</span>
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
          Hun verhaal verdient het om verteld te worden
        </h2>
        <p className="text-[#aaa] mb-8 text-lg">
          Wacht niet tot "later." Later wordt vaak nooit.
        </p>
        <button
          onClick={() => handleSelectPackage("BEGIN")}
          className="bg-[#d4af37] hover:bg-[#c49e2a] text-[#1a1a1a] font-bold px-10 py-4 rounded-xl text-lg transition-colors"
        >
          Start Nu — Het Begin →
        </button>
        <p className="text-[#666] text-sm mt-4">Gratis verzending · 14 dagen bedenktijd</p>
        <p className="text-[#555] text-xs mt-2">
          De Erfgoed Box &amp; Voor Altijd zijn beschikbaar vanaf september —{" "}
          <span className="underline cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            schrijf je in voor de wachtlijst
          </span>
        </p>
      </section>
    </div>
  );
}

// ─── Pakket kaart ─────────────────────────────────────────────────────────────

function PackageCard({
  pkg,
  soldOut,
  earlyBird,
  onSelect,
}: {
  pkg: (typeof packages)[number];
  soldOut: { availableFrom: string } | null;
  earlyBird: EarlyBirdStatus | null;
  onSelect: (id: string) => void;
}) {
  const [showMissing, setShowMissing] = useState(false);

  return (
    <div
      className={cn(
        "relative bg-white rounded-2xl overflow-hidden border transition-shadow",
        soldOut
          ? "border-[#e5e0d8] shadow-md opacity-90"
          : pkg.hero
          ? "border-[#d4af37] shadow-2xl md:scale-105 ring-2 ring-[#d4af37]/30"
          : "border-[#e5e0d8] shadow-md hover:shadow-lg"
      )}
    >
      {/* Sold-out banner (vervangt hero badge) */}
      {soldOut ? (
        <div className="bg-[#1a1a1a] text-white text-xs font-bold text-center py-2 tracking-widest">
          UITVERKOCHT VOOR VADERDAG · BESCHIKBAAR VANAF {soldOut.availableFrom.toUpperCase()}
        </div>
      ) : pkg.hero ? (
        <div className="bg-[#d4af37] text-[#1a1a1a] text-xs font-bold text-center py-2 tracking-widest">
          ⭐ MEEST GEKOZEN · BESTE PRIJS-KWALITEIT ⭐
        </div>
      ) : null}

      <div className={cn("p-6 md:p-8", soldOut && "relative")}>
        {/* Sold-out overlay op de kaartinhoud */}
        {soldOut && (
          <div className="absolute inset-0 bg-white/40 pointer-events-none rounded-b-2xl z-0" />
        )}

        <div className="relative z-10">
          {/* Early bird badge */}
          {earlyBird?.active && !soldOut && (
            <div className="flex items-center gap-1.5 bg-[#d4af37]/15 border border-[#d4af37]/50 rounded-lg px-3 py-1.5 mb-4 w-fit">
              <Zap className="h-3 w-3 text-[#d4af37]" />
              <span className="text-xs font-bold text-[#1a1a1a]">
                EARLY BIRD — €{earlyBird.discount_cents / 100} korting
              </span>
            </div>
          )}

          {/* Header */}
          <div className="mb-6">
            <h3 className={cn("font-serif text-2xl font-bold mb-1", soldOut ? "text-[#888]" : "text-[#1a1a1a]")}>
              {pkg.name}
            </h3>
            <p className="text-[#888] text-sm mb-4">{pkg.subtitle}</p>
            <div className="flex items-baseline gap-2">
              {earlyBird?.active && !soldOut ? (
                <>
                  <span className="text-4xl font-bold text-[#1a1a1a]">
                    €{pkg.price - earlyBird.discount_cents / 100}
                  </span>
                  <span className="text-[#aaa] line-through text-lg">{pkg.priceDisplay}</span>
                </>
              ) : (
                <>
                  <span className={cn("text-4xl font-bold", soldOut ? "text-[#aaa]" : "text-[#1a1a1a]")}>
                    {pkg.priceDisplay}
                  </span>
                  {"originalPrice" in pkg && pkg.originalPrice && (
                    <span className="text-[#aaa] line-through text-lg">{pkg.originalPrice}</span>
                  )}
                </>
              )}
            </div>
            {earlyBird?.active && !soldOut ? (
              <div className="mt-1">
                <EarlyBirdCountdown deadlineIso={earlyBird.deadline_iso} />
              </div>
            ) : (
              <>
                {"priceNote" in pkg && pkg.priceNote && (
                  <p className="text-xs text-[#d4af37] font-medium mt-1">{pkg.priceNote}</p>
                )}
                <p className="text-xs text-[#888] mt-1">(eenmalig)</p>
              </>
            )}
          </div>

          {/* Social proof */}
          <p className="text-xs text-[#888] mb-4 flex items-center gap-1">
            <Star className="h-3 w-3 fill-[#d4af37] text-[#d4af37]" />
            {pkg.socialProof}
          </p>

          {/* CTA: sold-out wachtlijst OF bestelknop */}
          {soldOut ? (
            <WaitlistForm packageId={pkg.id as WaitlistPackage} availableFrom={soldOut.availableFrom} />
          ) : (
            <button
              onClick={() => onSelect(pkg.id)}
              className={cn(
                "w-full py-3 rounded-xl font-bold text-sm transition-colors mb-6",
                pkg.hero
                  ? "bg-[#d4af37] hover:bg-[#c49e2a] text-[#1a1a1a]"
                  : "bg-[#1a1a1a] hover:bg-[#333] text-white"
              )}
            >
              {pkg.ctaLabel} →
            </button>
          )}

          {/* Feature lijst */}
          <ul className="space-y-2 mb-6">
            {pkg.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className={cn("h-4 w-4 flex-shrink-0 mt-0.5", soldOut ? "text-[#bbb]" : "text-[#2d5016]")} />
                <span className={soldOut ? "text-[#aaa]" : "text-[#333]"}>{f}</span>
              </li>
            ))}
          </ul>

          {/* "Wat je mist" voor BEGIN pakket */}
          {"missingHighlights" in pkg && pkg.missingHighlights.length > 0 && (
            <div className="border-t border-[#f0ece6] pt-4">
              <button
                onClick={() => setShowMissing(!showMissing)}
                className="text-xs text-[#aaa] hover:text-[#888] underline underline-offset-2"
              >
                {showMissing ? "Verberg" : "Wat mis je in dit pakket?"}
              </button>
              {showMissing && (
                <ul className="mt-3 space-y-1">
                  {pkg.missingHighlights.map((m, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#aaa]">
                      <X className="h-3 w-3 flex-shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Perfect voor */}
          <div className="mt-4 bg-[#f8f6f2] rounded-xl p-4">
            <p className="text-xs font-semibold text-[#888] uppercase tracking-wider mb-2">Perfect voor</p>
            <ul className="space-y-1">
              {pkg.perfectFor.map((p, i) => (
                <li key={i} className={cn("text-xs", soldOut ? "text-[#bbb]" : "text-[#555]")}>→ {p}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Wachtlijst formulier ─────────────────────────────────────────────────────

function WaitlistForm({
  packageId,
  availableFrom,
}: {
  packageId: WaitlistPackage;
  availableFrom: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "already" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [guaranteedDiscount, setGuaranteedDiscount] = useState(0);
  const [earlyBird, setEarlyBird] = useState<EarlyBirdStatus | null>(null);

  useEffect(() => {
    getEarlyBirdStatus().then(setEarlyBird);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await joinWaitlist(email.trim(), packageId);
      setGuaranteedDiscount(res.guaranteed_discount_cents);
      setStatus(res.already_registered ? "already" : "success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Probeer het opnieuw");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="mb-6 bg-[#2d5016]/10 border border-[#2d5016]/30 rounded-xl p-4">
        <p className="text-[#2d5016] font-bold text-sm">✓ Je staat op de wachtlijst!</p>
        {guaranteedDiscount > 0 && (
          <p className="text-[#d4af37] font-bold text-xs mt-1">
            🎉 Early Bird garantie: €{guaranteedDiscount / 100} korting bij lancering
          </p>
        )}
        <p className="text-[#555] text-xs mt-1">
          We sturen je een mail zodra de dozen beschikbaar zijn in {availableFrom}.
        </p>
      </div>
    );
  }

  if (status === "already") {
    return (
      <div className="mb-6 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-xl p-4 text-center">
        <p className="text-[#1a1a1a] font-bold text-sm">Je staat er al op!</p>
        <p className="text-[#555] text-xs mt-1">
          We bewaren je plek voor de lancering in {availableFrom}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-2">
      {earlyBird?.active && earlyBird.waitlist_discount_cents > 0 && (
        <div className="flex items-center gap-1.5 bg-[#d4af37]/10 rounded-lg px-2.5 py-1.5">
          <Zap className="h-3 w-3 text-[#d4af37] flex-shrink-0" />
          <p className="text-xs text-[#1a1a1a] font-semibold">
            Early Bird: schrijf je in en ontvang €{earlyBird.waitlist_discount_cents / 100} garantiekorting bij lancering
          </p>
        </div>
      )}
      <p className="text-xs text-[#555] font-medium">
        Beschikbaar vanaf {availableFrom} — schrijf je in:
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#aaa]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jouw@email.nl"
            required
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#e5e0d8] rounded-xl focus:outline-none focus:border-[#d4af37] bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-[#1a1a1a] hover:bg-[#333] disabled:opacity-60 text-white text-xs font-bold px-4 rounded-xl transition-colors flex items-center gap-1 flex-shrink-0"
        >
          {status === "loading" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            "Aanmelden"
          )}
        </button>
      </div>
      {status === "error" && (
        <p className="text-red-500 text-xs">{errorMsg}</p>
      )}
    </form>
  );
}

// ─── Early Bird Countdown ─────────────────────────────────────────────────────

function EarlyBirdCountdown({ deadlineIso }: { deadlineIso: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const deadline = new Date(deadlineIso).getTime();

    const update = () => {
      const diff = deadline - Date.now();
      if (diff <= 0) { setTimeLeft("Verlopen"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(d > 0 ? `${d}d ${h}u ${m}m` : `${h}u ${m}m ${s}s`);
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [deadlineIso]);

  if (!timeLeft) return null;

  return (
    <p className="text-xs font-bold text-[#d4af37] flex items-center gap-1 mt-1">
      <Zap className="h-3 w-3" />
      Nog {timeLeft} — daarna €{89} (eenmalig)
    </p>
  );
}

// ─── Vergelijkingstabel ───────────────────────────────────────────────────────

function ComparisonTable() {
  return (
    <div className="mt-10 bg-white rounded-2xl border border-[#e5e0d8] overflow-hidden shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e5e0d8]">
              <th className="text-left py-4 px-4 font-medium text-[#888] w-40">Feature</th>
              <th className="text-center py-4 px-4 font-medium text-[#1a1a1a]">Het Begin<br /><span className="font-bold">€89</span></th>
              <th className="text-center py-4 px-4 font-medium text-[#1a1a1a] bg-[#d4af37]/10">
                Erfgoed Box ⭐<br /><span className="font-bold">€249</span>
              </th>
              <th className="text-center py-4 px-4 font-medium text-[#1a1a1a]">Voor Altijd<br /><span className="font-bold">€399</span></th>
            </tr>
          </thead>
          <tbody>
            {compareRows.map((row, i) => (
              <tr key={i} className={cn("border-b border-[#f0ece6]", i % 2 === 0 && "bg-[#faf9f7]")}>
                <td className="py-3 px-4 text-[#555]">{row.label}</td>
                {row.values.map((val, j) => (
                  <td key={j} className={cn("py-3 px-4 text-center", j === 1 && "bg-[#d4af37]/5")}>
                    {typeof val === "boolean" ? (
                      val
                        ? <Check className="h-4 w-4 text-[#2d5016] mx-auto" />
                        : <span className="text-[#ddd]">—</span>
                    ) : (
                      <span className="text-[#333]">{val}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 text-center text-xs text-[#aaa]">
        🚚 Gratis verzending · 🇳🇱 Nederlands product · 🔒 GDPR-compliant
      </div>
    </div>
  );
}
