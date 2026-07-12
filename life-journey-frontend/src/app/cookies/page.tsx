import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const metadata: Metadata = {
  title: { absolute: "Cookieverklaring | BewaardVoorJou.nl" },
  description:
    "Informatie over het gebruik van cookies op BewaardVoorJou.nl. Wij gebruiken uitsluitend functionele cookies.",
  openGraph: {
    title: "Cookieverklaring | BewaardVoorJou.nl",
    description: "Wij gebruiken uitsluitend functionele cookies — geen tracking, geen advertenties.",
    url: "https://bewaardvoorjou.nl/cookies",
  },
  alternates: { canonical: "https://bewaardvoorjou.nl/cookies" },
  robots: { index: true, follow: true },
};

const sections = [
  { id: "wat-zijn-cookies", title: "1. Wat zijn cookies?" },
  { id: "welke-cookies", title: "2. Welke cookies gebruiken wij?" },
  { id: "geen-tracking", title: "3. Geen tracking- of marketingcookies" },
  { id: "toestemming", title: "4. Toestemming en wettelijke grondslag" },
  { id: "derde-partijen", title: "5. Cookies van derde partijen" },
  { id: "beheer", title: "6. Cookies beheren of verwijderen" },
  { id: "wijzigingen", title: "7. Wijzigingen" },
  { id: "contact", title: "8. Contact" },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange/10 via-warm-amber/5 to-cream py-16 md:py-20 px-4 border-b border-neutral-sand">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange/10 text-orange rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            Versie 1.0 · Ingangsdatum 1 juni 2025
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
            Cookieverklaring
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
            Wij maken op BewaardVoorJou.nl uitsluitend gebruik van functionele cookies.
            Geen tracking. Geen advertenties. Geen profilering.
          </p>
        </div>
      </section>

      {/* Document */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Inhoudsopgave */}
          <nav className="bg-white rounded-2xl border border-neutral-sand p-6 mb-10 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Inhoudsopgave
            </h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm text-slate-700 hover:text-orange transition-colors hover:underline"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-8">

            {/* 1. Wat zijn cookies */}
            <div id="wat-zijn-cookies" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                1. Wat zijn cookies?
              </h2>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>
                  Cookies zijn kleine tekstbestanden die door een website op uw apparaat
                  (computer, tablet of smartphone) worden opgeslagen wanneer u die website
                  bezoekt. Cookies worden gebruikt om informatie op te slaan over uw bezoek,
                  zodat de website goed kan functioneren.
                </p>
                <p>
                  Er bestaan verschillende soorten cookies: functionele cookies (noodzakelijk
                  voor de werking van de site), analytische cookies (inzicht in bezoekersgedrag)
                  en marketing- of trackingcookies (voor gepersonaliseerde advertenties). Wij
                  gebruiken uitsluitend de eerste categorie.
                </p>
              </div>
            </div>

            {/* 2. Welke cookies */}
            <div id="welke-cookies" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                2. Welke cookies gebruiken wij?
              </h2>
              <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                <p>
                  Wij plaatsen uitsluitend <strong>functionele cookies</strong> die
                  technisch noodzakelijk zijn voor de werking van ons platform. Voor
                  deze cookies is op grond van de Telecommunicatiewet geen voorafgaande
                  toestemming vereist.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-cream">
                        <th className="text-left p-3 border border-neutral-sand font-semibold text-slate-800">Naam</th>
                        <th className="text-left p-3 border border-neutral-sand font-semibold text-slate-800">Doel</th>
                        <th className="text-left p-3 border border-neutral-sand font-semibold text-slate-800">Type</th>
                        <th className="text-left p-3 border border-neutral-sand font-semibold text-slate-800">Bewaartermijn</th>
                        <th className="text-left p-3 border border-neutral-sand font-semibold text-slate-800">Partij</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["auth_token", "Inlogstatus / sessie authenticatie (JWT)", "Sessie", "60 minuten", "Eigen"],
                        ["locale", "Taalvoorkeur van de gebruiker", "Persistent", "1 jaar", "Eigen"],
                        ["onboarding_step", "Bijhouden van onboarding-voortgang", "Sessie", "Sessie", "Eigen"],
                      ].map(([naam, doel, type, termijn, partij], i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-cream/50"}>
                          <td className="p-3 border border-neutral-sand font-mono text-orange">{naam}</td>
                          <td className="p-3 border border-neutral-sand">{doel}</td>
                          <td className="p-3 border border-neutral-sand">{type}</td>
                          <td className="p-3 border border-neutral-sand">{termijn}</td>
                          <td className="p-3 border border-neutral-sand">{partij}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-slate-500 text-xs">
                  Sessiecookies worden automatisch verwijderd wanneer u uw browser sluit.
                  Persistente cookies blijven staan totdat de bewaartermijn is verstreken
                  of totdat u ze handmatig verwijdert.
                </p>
              </div>
            </div>

            {/* 3. Geen tracking */}
            <div id="geen-tracking" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                3. Geen tracking- of marketingcookies
              </h2>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>
                  Wij plaatsen <strong>geen</strong> tracking-, profiling- of
                  marketingcookies. Dit betekent:
                </p>
                <ul className="list-disc list-outside pl-5 space-y-1">
                  <li>Geen Google Analytics, Hotjar of vergelijkbare analytische diensten die persoonlijke data verwerken</li>
                  <li>Geen Facebook Pixel, Google Ads of andere advertentiecookies</li>
                  <li>Geen retargeting of cross-site tracking</li>
                  <li>Geen socialemediaknoppen die uw surfgedrag bijhouden</li>
                </ul>
                <p>
                  Eventuele bezoekersstatistieken worden uitsluitend verzameld in
                  geaggregeerde, geanonimiseerde vorm via serverlogboeken, zonder het
                  plaatsen van cookies.
                </p>
              </div>
            </div>

            {/* 4. Toestemming */}
            <div id="toestemming" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                4. Toestemming en wettelijke grondslag
              </h2>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>
                  Wij plaatsen uitsluitend functionele cookies die technisch noodzakelijk
                  zijn voor de werking van het platform. Op grond van Art. 11.7a van de
                  Telecommunicatiewet (Tw) is voor deze categorie cookies geen
                  voorafgaande toestemming vereist.
                </p>
                <p>
                  Mochten wij in de toekomst niet-noodzakelijke cookies willen plaatsen
                  (bijv. voor analytische doeleinden), dan zullen wij:
                </p>
                <ul className="list-disc list-outside pl-5 space-y-1">
                  <li>Voorafgaand aan plaatsing uw expliciete toestemming vragen via een cookiebanner</li>
                  <li>Een granulaire keuze aanbieden per cookiecategorie</li>
                  <li>Het eenvoudig mogelijk maken toestemming in te trekken</li>
                  <li>Deze cookieverklaring updaten minimaal 30 dagen voordat de wijziging ingaat</li>
                </ul>
              </div>
            </div>

            {/* 5. Derde partijen */}
            <div id="derde-partijen" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                5. Cookies van derde partijen
              </h2>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>
                  Wij maken gebruik van Stripe voor betalingsverwerking. Wanneer u een
                  betaalpagina bezoekt, kan Stripe eigen cookies plaatsen voor
                  fraudepreventie en sessiebeveiliging. Dit zijn functionele cookies van
                  Stripe Inc. Zie het{" "}
                  <a
                    href="https://stripe.com/cookie-settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange underline"
                  >
                    cookiebeleid van Stripe
                  </a>{" "}
                  voor meer informatie.
                </p>
                <p>
                  Buiten de betalingspagina worden geen third-party cookies geplaatst via
                  ons platform.
                </p>
              </div>
            </div>

            {/* 6. Beheer */}
            <div id="beheer" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                6. Cookies beheren of verwijderen
              </h2>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>
                  U kunt cookies altijd beheren of verwijderen via de instellingen van uw
                  browser. Let op: het uitschakelen van functionele cookies kan ertoe leiden
                  dat u niet meer kunt inloggen of dat bepaalde functionaliteiten niet meer
                  werken.
                </p>
                <p>Instructies voor veelgebruikte browsers:</p>
                <ul className="list-disc list-outside pl-5 space-y-1">
                  <li>
                    <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-orange underline">
                      Google Chrome
                    </a>
                  </li>
                  <li>
                    <a href="https://support.mozilla.org/nl/kb/cookies-verwijderen-gegevens-wissen-websites-opgeslagen" target="_blank" rel="noopener noreferrer" className="text-orange underline">
                      Mozilla Firefox
                    </a>
                  </li>
                  <li>
                    <a href="https://support.apple.com/nl-nl/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-orange underline">
                      Safari (Mac)
                    </a>
                  </li>
                  <li>
                    <a href="https://support.microsoft.com/nl-nl/microsoft-edge/cookies-verwijderen-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-orange underline">
                      Microsoft Edge
                    </a>
                  </li>
                </ul>
                <p>
                  U kunt ook gebruik maken van{" "}
                  <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer" className="text-orange underline">
                    www.youronlinechoices.eu
                  </a>{" "}
                  voor meer informatie over het beheren van online trackers.
                </p>
              </div>
            </div>

            {/* 7. Wijzigingen */}
            <div id="wijzigingen" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                7. Wijzigingen in deze cookieverklaring
              </h2>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>
                  Wij behouden het recht deze cookieverklaring te wijzigen. Wezenlijke
                  wijzigingen — met name het toevoegen van niet-functionele cookies —
                  kondigen wij minimaal 30 dagen van tevoren aan via het bij ons bekende
                  e-mailadres en via een melding op het platform.
                </p>
                <p>
                  De meest actuele versie is altijd raadpleegbaar op{" "}
                  <a href="https://bewaardvoorjou.nl/cookies" className="text-orange underline">
                    bewaardvoorjou.nl/cookies
                  </a>
                  .
                </p>
              </div>
            </div>

            {/* 8. Contact */}
            <div id="contact" className="bg-orange/5 rounded-2xl border border-orange/20 p-6 md:p-8 scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-orange/20">
                8. Contact
              </h2>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>
                  Voor vragen over deze cookieverklaring kunt u contact opnemen met:
                </p>
                <div className="bg-white rounded-xl p-4 border border-orange/20 space-y-1">
                  <p className="font-semibold text-slate-800">WeAreImpact B.V. (BewaardVoorJou)</p>
                  <p>Heintje Hoeksteeg 11a</p>
                  <p>1012 GR Amsterdam</p>
                  <p>
                    E-mail:{" "}
                    <a href="mailto:privacy@bewaardvoorjou.nl" className="text-orange underline">
                      privacy@bewaardvoorjou.nl
                    </a>
                  </p>
                  <p>KVK: 70285888</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    href="/privacy"
                    className="inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange/90 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
                  >
                    Privacyverklaring
                  </Link>
                  <Link
                    href="/terms"
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-cream text-slate-700 text-sm font-medium px-5 py-2.5 rounded-full border border-neutral-sand transition-colors"
                  >
                    Algemene voorwaarden
                  </Link>
                </div>
              </div>
            </div>

          </div>

          <p className="text-center text-xs text-slate-400 mt-10">
            Cookieverklaring WeAreImpact B.V. (BewaardVoorJou) · Versie 1.0 · Ingangsdatum 1 juni 2025
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
