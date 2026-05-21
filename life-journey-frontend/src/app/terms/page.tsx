import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const metadata: Metadata = {
  title: "Algemene voorwaarden",
  description:
    "De algemene voorwaarden van BewaardVoorJou.nl. Lees onze gebruiksvoorwaarden, rechten, verplichtingen en aansprakelijkheidsbepalingen.",
  openGraph: {
    title: "Algemene voorwaarden | BewaardVoorJou.nl",
    description:
      "De algemene voorwaarden van BewaardVoorJou.nl — transparant en begrijpelijk geschreven.",
    url: "https://bewaardvoorjou.nl/terms",
  },
  alternates: { canonical: "https://bewaardvoorjou.nl/terms" },
  robots: { index: true, follow: true },
};

const articles = [
  {
    id: "definities",
    title: "Artikel 1 – Definities",
    content: [
      "**BewaardVoorJou.nl**: het digitale platform beheerd door BewaardVoorJou B.V., gevestigd in Nederland.",
      "**Gebruiker**: iedere natuurlijke persoon die een account aanmaakt en gebruik maakt van de Dienst.",
      "**Dienst**: het geheel van functionaliteiten aangeboden via bewaardvoorjou.nl, waaronder het vastleggen van levensverhalen, AI-interviews, transcripties en de deelfunctie.",
      "**Account**: de persoonlijke omgeving die de Gebruiker aanmaakt om gebruik te kunnen maken van de Dienst.",
      "**Inhoud**: alle audio-opnames, video-opnames, teksten, foto's en andere bestanden die de Gebruiker via de Dienst uploadt of aanmaakt.",
      "**Pakket**: een betaald abonnement of eenmalige aanschaf die extra functionaliteiten of opslagruimte biedt.",
    ],
  },
  {
    id: "toepasselijkheid",
    title: "Artikel 2 – Toepasselijkheid",
    content: [
      "Deze algemene voorwaarden zijn van toepassing op elk gebruik van de Dienst.",
      "Door een account aan te maken of de Dienst te gebruiken, aanvaardt de Gebruiker deze voorwaarden.",
      "BewaardVoorJou.nl behoudt zich het recht voor deze voorwaarden te wijzigen. Wijzigingen worden minimaal 30 dagen van tevoren aangekondigd via e-mail.",
      "Indien de Gebruiker niet akkoord gaat met gewijzigde voorwaarden, kan hij/zij het account vóór de ingangsdatum beëindigen.",
    ],
  },
  {
    id: "account",
    title: "Artikel 3 – Account en toegang",
    content: [
      "De Gebruiker dient minimaal 16 jaar oud te zijn om een account aan te maken.",
      "De Gebruiker is verantwoordelijk voor de geheimhouding van zijn/haar inloggegevens en voor alle activiteiten die via zijn/haar account plaatsvinden.",
      "Bij vermoed misbruik dient de Gebruiker onmiddellijk contact op te nemen via info@bewaardvoorjou.nl.",
      "BewaardVoorJou.nl mag een account opschorten of verwijderen bij schending van deze voorwaarden, na voorafgaande kennisgeving tenzij de situatie directe actie vereist.",
      "De Gebruiker mag per persoon één account aanmaken voor persoonlijk, niet-commercieel gebruik.",
    ],
  },
  {
    id: "dienst",
    title: "Artikel 4 – Gebruik van de Dienst",
    content: [
      "De Gebruiker mag de Dienst uitsluitend gebruiken voor persoonlijke, niet-commerciële doeleinden.",
      "Het is verboden om via de Dienst inhoud te plaatsen die: onrechtmatig, beledigend, lasterlijk, discriminerend of schadelijk is; inbreuk maakt op rechten van derden; malware of schadelijke code bevat.",
      "De Gebruiker mag de Dienst niet gebruiken voor het stelselmatig opnemen van derden zonder hun uitdrukkelijke toestemming.",
      "BewaardVoorJou.nl behoudt zich het recht voor Inhoud die in strijd is met deze voorwaarden te verwijderen.",
    ],
  },
  {
    id: "intellectueel",
    title: "Artikel 5 – Intellectueel eigendom",
    content: [
      "De Gebruiker behoudt alle intellectuele eigendomsrechten op de Inhoud die hij/zij aanmaakt.",
      "Door Inhoud te uploaden verleent de Gebruiker BewaardVoorJou.nl een beperkte, niet-exclusieve licentie om de Inhoud op te slaan, te verwerken en te tonen — uitsluitend voor de levering van de Dienst aan de Gebruiker.",
      "BewaardVoorJou.nl gebruikt de Inhoud van de Gebruiker niet voor het trainen van AI-modellen.",
      "Alle overige intellectuele eigendomsrechten op de Dienst, het platform en de technologie berusten bij BewaardVoorJou.nl of haar licentiegevers.",
    ],
  },
  {
    id: "betaling",
    title: "Artikel 6 – Pakketten en betalingen",
    content: [
      "De gratis versie van de Dienst is beschikbaar zonder betaling. BewaardVoorJou.nl kan de gratis functies te allen tijde aanpassen, met een kennisgeving van minimaal 30 dagen.",
      "Betaalde Pakketten worden vóóraf in rekening gebracht via de beschikbare betaalmethoden (iDEAL, creditcard en overige Stripe-methoden).",
      "Betalingen worden verwerkt door Stripe. BewaardVoorJou.nl slaat geen betaalgegevens op.",
      "Eenmalige aankopen worden niet terugbetaald tenzij de Dienst aantoonbaar niet naar behoren heeft gefunctioneerd.",
      "Prijswijzigingen voor lopende abonnementen worden minimaal 30 dagen van tevoren aangekondigd.",
    ],
  },
  {
    id: "privacy",
    title: "Artikel 7 – Privacy en gegevensbescherming",
    content: [
      "BewaardVoorJou.nl verwerkt persoonsgegevens conform de Algemene Verordening Gegevensbescherming (AVG / GDPR).",
      "Het volledige privacybeleid is beschikbaar op bewaardvoorjou.nl/privacy.",
      "De Gebruiker heeft het recht op inzage, rectificatie, verwijdering, beperking en overdraagbaarheid van zijn/haar persoonsgegevens.",
      "Voor vragen over gegevensbescherming kan de Gebruiker contact opnemen via privacy@bewaardvoorjou.nl.",
    ],
  },
  {
    id: "beschikbaarheid",
    title: "Artikel 8 – Beschikbaarheid en onderhoud",
    content: [
      "BewaardVoorJou.nl streeft naar een beschikbaarheid van minimaal 99% per jaar, exclusief gepland onderhoud.",
      "Gepland onderhoud wordt minimaal 24 uur van tevoren aangekondigd via de website of per e-mail.",
      "BewaardVoorJou.nl is niet aansprakelijk voor schade als gevolg van tijdelijke onbeschikbaarheid.",
    ],
  },
  {
    id: "aansprakelijkheid",
    title: "Artikel 9 – Aansprakelijkheid",
    content: [
      "BewaardVoorJou.nl is uitsluitend aansprakelijk voor directe schade die het directe gevolg is van een aantoonbare toerekenbare tekortkoming van BewaardVoorJou.nl.",
      "De aansprakelijkheid is beperkt tot het bedrag dat de Gebruiker in de afgelopen 12 maanden aan BewaardVoorJou.nl heeft betaald, met een maximum van € 500.",
      "BewaardVoorJou.nl is niet aansprakelijk voor: verlies van Inhoud door overmacht; gevolgschade, gederfde winst of immateriële schade; schade door ongeautoriseerde toegang door derden ondanks redelijke beveiligingsmaatregelen.",
      "De Gebruiker is verantwoordelijk voor het maken van back-ups van zijn/haar Inhoud. BewaardVoorJou.nl biedt exportfuncties voor dit doel.",
    ],
  },
  {
    id: "beindiging",
    title: "Artikel 10 – Duur en beëindiging",
    content: [
      "De overeenkomst wordt aangegaan voor onbepaalde tijd en kan door de Gebruiker op elk moment worden beëindigd door het account te verwijderen.",
      "Na beëindiging heeft de Gebruiker 30 dagen de mogelijkheid zijn/haar Inhoud te downloaden. Daarna wordt de Inhoud permanent verwijderd.",
      "BewaardVoorJou.nl kan de overeenkomst met onmiddellijke ingang beëindigen bij ernstige schending van deze voorwaarden, na voorafgaande schriftelijke waarschuwing.",
    ],
  },
  {
    id: "geschillen",
    title: "Artikel 11 – Klachten en geschillen",
    content: [
      "Klachten kunnen worden ingediend via info@bewaardvoorjou.nl. BewaardVoorJou.nl streeft naar afhandeling binnen 14 werkdagen.",
      "Op deze voorwaarden is Nederlands recht van toepassing.",
      "Geschillen worden in eerste instantie voorgelegd aan de bevoegde rechter in het arrondissement Amsterdam, tenzij dwingende wettelijke bepalingen anders vereisen.",
      "De Gebruiker kan ook een klacht indienen bij de Autoriteit Consument & Markt of de Autoriteit Persoonsgegevens.",
    ],
  },
  {
    id: "overig",
    title: "Artikel 12 – Overige bepalingen",
    content: [
      "Indien een bepaling in deze voorwaarden ongeldig of niet-afdwingbaar blijkt, blijven de overige bepalingen onverminderd van kracht.",
      "BewaardVoorJou.nl mag haar rechten en verplichtingen overdragen aan een derde partij bij een bedrijfsovername, mits de Gebruiker hierover tijdig wordt geïnformeerd.",
      "Het niet of niet tijdig handhaven van rechten door BewaardVoorJou.nl houdt geen afstand van die rechten in.",
      "Deze algemene voorwaarden zijn voor het laatst bijgewerkt op 1 mei 2025.",
    ],
  },
];

function renderText(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-50 via-cream to-warm-sand/20 py-16 md:py-20 px-4 border-b border-neutral-sand">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange/10 text-orange rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            Laatste update: 1 mei 2025
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
            Algemene voorwaarden
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
            We schrijven onze voorwaarden zo begrijpelijk mogelijk. Heb je vragen?{" "}
            <Link href="/contact" className="text-orange underline hover:text-orange/80">
              Neem gerust contact op.
            </Link>
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Inhoudsopgave */}
          <nav className="bg-white rounded-2xl border border-neutral-sand p-6 mb-10 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Inhoudsopgave
            </h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              {articles.map((article) => (
                <li key={article.id}>
                  <a
                    href={`#${article.id}`}
                    className="text-sm text-slate-700 hover:text-orange transition-colors hover:underline"
                  >
                    {article.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Artikelen */}
          <div className="space-y-10">
            {articles.map((article) => (
              <div
                key={article.id}
                id={article.id}
                className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24"
              >
                <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                  {article.title}
                </h2>
                <ol className="space-y-3 list-decimal list-outside pl-5">
                  {article.content.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-slate-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderText(item) }}
                    />
                  ))}
                </ol>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-10 bg-orange/5 rounded-2xl border border-orange/20 p-6 md:p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Vragen over de algemene voorwaarden?
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Stuur ons een e-mail en we helpen je graag verder. We streven naar een reactie
              binnen 2 werkdagen.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:info@bewaardvoorjou.nl"
                className="inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange/90 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
              >
                info@bewaardvoorjou.nl
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-cream text-slate-700 text-sm font-medium px-5 py-2.5 rounded-full border border-neutral-sand transition-colors"
              >
                Contactformulier
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
