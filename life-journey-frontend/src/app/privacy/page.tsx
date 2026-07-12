import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const metadata: Metadata = {
  title: { absolute: "Privacyverklaring | BewaardVoorJou.nl" },
  description:
    "Volledig privacybeleid van BewaardVoorJou.nl — hoe wij uw persoonsgegevens verwerken, welke rechten u heeft en hoe u contact kunt opnemen.",
  openGraph: {
    title: "Privacyverklaring | BewaardVoorJou.nl",
    description:
      "Volledig privacybeleid van BewaardVoorJou.nl conform de AVG (GDPR). Transparant over dataverwerking, rechtsgronden en uw rechten.",
    url: "https://bewaardvoorjou.nl/privacy",
  },
  alternates: { canonical: "https://bewaardvoorjou.nl/privacy" },
  robots: { index: true, follow: true },
};

const sections = [
  { id: "verwerkingsverantwoordelijke", title: "1. Verwerkingsverantwoordelijke" },
  { id: "welke-gegevens", title: "2. Welke persoonsgegevens verwerken wij?" },
  { id: "doeleinden", title: "3. Doeleinden en rechtsgronden" },
  { id: "bijzondere-categorieen", title: "4. Bijzondere categorieën persoonsgegevens" },
  { id: "ontvangers", title: "5. Ontvangers en verwerkers" },
  { id: "doorgifte", title: "6. Doorgifte buiten de EER" },
  { id: "bewaartermijnen", title: "7. Bewaartermijnen" },
  { id: "uw-rechten", title: "8. Uw rechten als betrokkene" },
  { id: "minderjarigen", title: "9. Minderjarigen" },
  { id: "nalatenschap", title: "10. Nalatenschap en overlijden" },
  { id: "beveiliging", title: "11. Beveiligingsmaatregelen" },
  { id: "cookies", title: "12. Cookies" },
  { id: "ai-verwerking", title: "13. Geautomatiseerde besluitvorming en AI" },
  { id: "wijzigingen", title: "14. Wijzigingen" },
  { id: "klachtrecht", title: "15. Klachtrecht bij de Autoriteit Persoonsgegevens" },
  { id: "contact", title: "16. Contactgegevens" },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange/10 via-warm-amber/5 to-cream py-16 md:py-20 px-4 border-b border-neutral-sand">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange/10 text-orange rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            AVG-conform · Versie 2.1 · Ingangsdatum 1 juni 2025
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
            Privacyverklaring
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
            Uw levensverhaal is intiem. Wij behandelen het als zodanig. Deze verklaring legt
            precies uit welke gegevens wij verwerken, waarom, op welke grondslag en welke
            rechten u heeft.
          </p>
          <p className="text-sm text-slate-500 mt-4">
            Vragen? Stuur een e-mail naar{" "}
            <a href="mailto:privacy@bewaardvoorjou.nl" className="text-orange underline">
              privacy@bewaardvoorjou.nl
            </a>
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

          <div className="space-y-10">

            {/* 1. Verwerkingsverantwoordelijke */}
            <div id="verwerkingsverantwoordelijke" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                1. Verwerkingsverantwoordelijke
              </h2>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>
                  De verwerkingsverantwoordelijke in de zin van de Algemene Verordening
                  Gegevensbescherming (AVG / GDPR, EU 2016/679) is:
                </p>
                <div className="bg-cream rounded-xl p-4 border border-neutral-sand font-mono text-xs space-y-1">
                  <p className="font-sans font-semibold text-slate-800 text-sm">WeAreImpact B.V. (handelend onder de naam BewaardVoorJou)</p>
                  <p>Heintje Hoeksteeg 11a</p>
                  <p>1012 GR Amsterdam, Nederland</p>
                  <p>KVK-nummer: 70285888</p>
                  <p>Btw-nummer: NL858236369B01</p>
                  <p>E-mail: <a href="mailto:privacy@bewaardvoorjou.nl" className="text-orange underline">privacy@bewaardvoorjou.nl</a></p>
                  <p>Website: <a href="https://bewaardvoorjou.nl" className="text-orange underline">www.bewaardvoorjou.nl</a></p>
                </div>
                <p>
                  Voor vragen over deze privacyverklaring of over de verwerking van uw
                  persoonsgegevens kunt u te allen tijde contact opnemen via bovenstaand
                  e-mailadres.
                </p>
              </div>
            </div>

            {/* 2. Welke persoonsgegevens */}
            <div id="welke-gegevens" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                2. Welke persoonsgegevens verwerken wij?
              </h2>
              <div className="space-y-5 text-sm text-slate-700 leading-relaxed">

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">2.1 Accountgegevens</h3>
                  <p className="mb-2">Bij het aanmaken van een account verwerken wij:</p>
                  <ul className="list-disc list-outside pl-5 space-y-1">
                    <li>Naam of alias (door u zelf gekozen weergavenaam)</li>
                    <li>E-mailadres</li>
                    <li>Geboortejaar (optioneel, voor personalisatie)</li>
                    <li>Land (ISO-landcode)</li>
                    <li>Wachtwoord (opgeslagen als niet-omkeerbare hash via Argon2 — nooit als leesbare tekst)</li>
                    <li>E-mailverificatiestatus en verificatietokens (tijdelijk, 24 uur geldig)</li>
                    <li>Tijdstip van laatste login</li>
                    <li>Pakketkeuze en activatiedatum</li>
                    <li>Accountinstellingen (voorkeursmethode, toegankelijkheidsinstellingen, AI-voorkeur)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">
                    2.2 Audio- en video-opnamen{" "}
                    <span className="text-xs font-normal text-orange bg-orange/10 rounded-full px-2 py-0.5 ml-1">
                      Bijzondere categorie
                    </span>
                  </h3>
                  <p className="mb-2">
                    Wanneer u via het platform een opname maakt, verwerken wij:
                  </p>
                  <ul className="list-disc list-outside pl-5 space-y-1">
                    <li>De ruwe audio- of video-opname (bestand)</li>
                    <li>Bestandsnaam, bestandsgrootte en duur</li>
                    <li>Tijdstip van opname</li>
                    <li>Opnamewijze (audio, video of tekst)</li>
                    <li>Verwerkingsstatus (in wachtrij, klaar, gefaald)</li>
                  </ul>
                  <p className="mt-2 text-slate-500">
                    Audio- en video-opnamen kunnen bijzondere categorieën persoonsgegevens
                    bevatten. Zie sectie 4.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">
                    2.3 Getranscribeerde tekst{" "}
                    <span className="text-xs font-normal text-orange bg-orange/10 rounded-full px-2 py-0.5 ml-1">
                      Bijzondere categorie
                    </span>
                  </h3>
                  <p>
                    Uw gesproken woorden worden via spraak-naar-tekst-technologie (Whisper van
                    OpenAI, verwerkt via OpenRouter) automatisch omgezet naar tekst. Deze
                    tekst kan persoonsgegevens bevatten van uzelf én van derden die u noemt
                    in uw verhalen, zoals familieleden of vrienden. De getranscribeerde tekst
                    wordt opgeslagen als afzonderlijke tekstsegmenten inclusief timing.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">
                    2.4 AI-gegenereerde analyse en highlights{" "}
                    <span className="text-xs font-normal text-orange bg-orange/10 rounded-full px-2 py-0.5 ml-1">
                      Bijzondere categorie
                    </span>
                  </h3>
                  <p>
                    Op basis van uw transcripties genereert onze AI-dienst (Claude van
                    Anthropic, verwerkt via OpenRouter) aanvullende analyse:
                  </p>
                  <ul className="list-disc list-outside pl-5 space-y-1 mt-2">
                    <li>Sentimentinschatting per segment (positief / neutraal / negatief)</li>
                    <li>Emotie-indicatie (vreugde / verdriet / woede / angst / neutraal)</li>
                    <li>Gemarkeerde emotionele hoogtepunten (lach, inzicht, liefde, wijsheid)</li>
                    <li>Geëxtraheerde sleutelpersonen, -plaatsen en -levensgebeurtenissen</li>
                    <li>Samenvatting per hoofdstuk (2–3 zinnen, maximaal 120 woorden)</li>
                    <li>Thematische categorisering van uw verhalen</li>
                  </ul>
                  <p className="mt-2 text-slate-500">
                    Deze analyses hebben geen rechtsgevolgen. U kunt AI-analyse volledig
                    uitschakelen in uw accountinstellingen.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">2.5 Familiegegevens (gegevens van derden)</h3>
                  <p className="mb-2">
                    Wanneer u familieleden of vrienden uitnodigt voor uw familiebibliotheek,
                    verwerken wij van die personen:
                  </p>
                  <ul className="list-disc list-outside pl-5 space-y-1">
                    <li>Naam en e-mailadres</li>
                    <li>Familierelatie tot de gebruiker</li>
                    <li>Toegangsniveau tot de verhalen</li>
                    <li>Uitnodigingsstatus (verzonden, geopend, geaccepteerd, afgewezen)</li>
                    <li>Tijdstip van uitnodiging en reactie</li>
                  </ul>
                  <p className="mt-2 text-slate-500">
                    U bent verantwoordelijk voor het informeren van derden wier gegevens
                    u via het platform verwerkt, in overeenstemming met Art. 14 AVG.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">2.6 Betaalgegevens</h3>
                  <p className="mb-2">
                    Betalingen worden volledig verwerkt door Stripe. Wij slaan geen
                    volledige kaartgegevens op. Wij verwerken wel:
                  </p>
                  <ul className="list-disc list-outside pl-5 space-y-1">
                    <li>Betaalmethode (iDEAL / creditcard / Bancontact)</li>
                    <li>Stripe payment intent ID (referentie)</li>
                    <li>Orderstatus, gefactureerd bedrag en pakketkeuze</li>
                    <li>Verzendadres bij bestelling van fysieke producten</li>
                    <li>Naam ontvanger en persoonlijk bericht (bij cadeaubestellingen)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">2.7 Nalatenschapsgegevens</h3>
                  <p className="mb-2">
                    Als u de legacy-functie activeert, verwerken wij:
                  </p>
                  <ul className="list-disc list-outside pl-5 space-y-1">
                    <li>Naam en e-mailadres van aangewezen beheerders (trustees)</li>
                    <li>Uw instellingen voor nalatenschap (vrijgavedrempel, vrijgavedatum)</li>
                    <li>Uw persoonlijk label voor de legacy-situatie</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">2.8 Technische en beveiligingsgegevens</h3>
                  <ul className="list-disc list-outside pl-5 space-y-1">
                    <li>IP-adres (bij anonieme verzoeken, voor rate limiting en fraudepreventie)</li>
                    <li>Sessietokens (JWT, maximale geldigheidsduur 60 minuten)</li>
                    <li>Tijdstip van laatste login</li>
                    <li>E-mailbounce- en spamklachtstatus</li>
                    <li>E-mailvoorkeuren en afmeldingstijdstip</li>
                    <li>Auditregistratie van beheerdersacties (inclusief tijdstip en betrokken account)</li>
                  </ul>
                </div>

              </div>
            </div>

            {/* 3. Doeleinden en rechtsgronden */}
            <div id="doeleinden" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                3. Doeleinden en rechtsgronden
              </h2>
              <div className="text-sm text-slate-700 leading-relaxed">
                <p className="mb-4">
                  Wij verwerken uw persoonsgegevens uitsluitend voor de volgende doeleinden,
                  op basis van de vermelde rechtsgrond uit Art. 6 (en indien van toepassing
                  Art. 9) van de AVG:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-cream">
                        <th className="text-left p-3 border border-neutral-sand font-semibold text-slate-800">Doel</th>
                        <th className="text-left p-3 border border-neutral-sand font-semibold text-slate-800">Rechtsgrond</th>
                        <th className="text-left p-3 border border-neutral-sand font-semibold text-slate-800">AVG-artikel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Accountaanmaak, verificatie en inloggen", "Uitvoering overeenkomst", "Art. 6(1)(b)"],
                        ["Levering van de basisdienst (verhalen vastleggen, hoofdstukken, AI-interview)", "Uitvoering overeenkomst", "Art. 6(1)(b)"],
                        ["Audio- en video-opname en opslag", "Uitdrukkelijke toestemming", "Art. 6(1)(a) + Art. 9(2)(a)"],
                        ["Automatische transcriptie van opnamen", "Uitdrukkelijke toestemming", "Art. 6(1)(a) + Art. 9(2)(a)"],
                        ["Emotie- en sentimentanalyse via AI", "Uitdrukkelijke toestemming", "Art. 6(1)(a) + Art. 9(2)(a)"],
                        ["Genereren van AI-interviewvragen op basis van uw context", "Uitvoering overeenkomst + Toestemming", "Art. 6(1)(b) + Art. 6(1)(a)"],
                        ["Delen van verhalen met familieleden en vrienden", "Toestemming", "Art. 6(1)(a)"],
                        ["Legacy-functie en nalatenschapsbeheer", "Toestemming", "Art. 6(1)(a) + Art. 9(2)(a)"],
                        ["Betalingsverwerking en facturatie", "Uitvoering overeenkomst", "Art. 6(1)(b)"],
                        ["Bewaring van factuurgegevens", "Wettelijke verplichting (fiscale bewaarplicht)", "Art. 6(1)(c)"],
                        ["Dienst-gerelateerde e-mailberichten (verificatie, milestones)", "Uitvoering overeenkomst", "Art. 6(1)(b)"],
                        ["Nieuwsbrief en marketinge-mails", "Toestemming", "Art. 6(1)(a)"],
                        ["Fraudepreventie, beveiliging en misbruikdetectie", "Gerechtvaardigd belang", "Art. 6(1)(f)"],
                        ["Afhandeling van klachten en verzoeken van betrokkenen", "Wettelijke verplichting", "Art. 6(1)(c)"],
                        ["Verbetering van de dienst via anonieme statistieken", "Gerechtvaardigd belang", "Art. 6(1)(f)"],
                      ].map(([doel, grondslag, artikel], i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-cream/50"}>
                          <td className="p-3 border border-neutral-sand">{doel}</td>
                          <td className="p-3 border border-neutral-sand">{grondslag}</td>
                          <td className="p-3 border border-neutral-sand font-mono text-orange">{artikel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-slate-500">
                  Wij gebruiken uw gegevens nooit voor andere doeleinden dan hierboven
                  vermeld, tenzij wij u daar voorafgaand apart over informeren en, indien
                  vereist, uw toestemming verkrijgen.
                </p>
              </div>
            </div>

            {/* 4. Bijzondere categorieën */}
            <div id="bijzondere-categorieen" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                4. Bijzondere categorieën persoonsgegevens
              </h2>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>
                  Uw levensverhalen kunnen van nature bijzondere categorieën persoonsgegevens
                  bevatten in de zin van Art. 9 AVG. Voorbeelden hiervan zijn:
                </p>
                <ul className="list-disc list-outside pl-5 space-y-1">
                  <li>Raciale of etnische afkomst</li>
                  <li>Politieke opvattingen</li>
                  <li>Religieuze of levensbeschouwelijke overtuigingen</li>
                  <li>Gezondheidsgegevens (ziekten, operaties, psychische gezondheid)</li>
                  <li>Gegevens over het seksuele leven of seksuele geaardheid</li>
                </ul>
                <p>
                  Wij verwerken deze gegevens uitsluitend op basis van uw <strong>uitdrukkelijke
                  toestemming</strong> (Art. 9(2)(a) AVG), die u verleent bij de eerste opname
                  via ons platform. U kunt deze toestemming te allen tijde intrekken via uw
                  accountinstellingen.
                </p>
                <div className="bg-orange/5 border border-orange/20 rounded-xl p-4">
                  <p className="font-semibold text-slate-800 mb-1">Belangrijk:</p>
                  <p>
                    Intrekking van toestemming heeft geen terugwerkende kracht. Reeds
                    verwerkte gegevens worden na intrekking niet automatisch verwijderd,
                    maar er vindt geen nieuwe verwerking meer plaats. Voor verwijdering
                    van reeds verwerkte gegevens kunt u een wissingsverzoek indienen
                    (zie sectie 8).
                  </p>
                </div>
                <p>
                  Wij nemen voor de verwerking van bijzondere categorieën aanvullende
                  beveiligingsmaatregelen, waaronder afzonderlijke toegangscontrole en
                  encryptie van uw opnamen in transit en in rust.
                </p>
              </div>
            </div>

            {/* 5. Ontvangers en verwerkers */}
            <div id="ontvangers" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                5. Ontvangers en verwerkers
              </h2>
              <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                <p>
                  Wij maken gebruik van de volgende externe verwerkers voor het leveren van
                  onze dienst. Met elk van hen is een verwerkersovereenkomst gesloten conform
                  Art. 28 AVG:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-cream">
                        <th className="text-left p-3 border border-neutral-sand font-semibold text-slate-800">Verwerker</th>
                        <th className="text-left p-3 border border-neutral-sand font-semibold text-slate-800">Land</th>
                        <th className="text-left p-3 border border-neutral-sand font-semibold text-slate-800">Doel</th>
                        <th className="text-left p-3 border border-neutral-sand font-semibold text-slate-800">Doorgiftebescherming</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Anthropic / OpenRouter", "VS", "AI-interviewvragen, geheugenanalyse, samenvattingen", "SCCs 2021"],
                        ["OpenAI Whisper (via OpenRouter)", "VS", "Automatische spraak-naar-tekst transcriptie", "SCCs 2021"],
                        ["Stripe Inc.", "VS / IE", "Betalingsverwerking en fraudedetectie", "SCCs 2021 + adequaatheidsbesluit (IE)"],
                        ["Cloudflare R2 / AWS S3", "EU (eu-central-1)", "Opslag van audio-, video- en mediabestanden", "Verwerking binnen EU — geen doorgifte"],
                        ["Neon.tech", "VS / EU", "Databaseopslag (PostgreSQL)", "SCCs 2021"],
                        ["Resend Inc.", "FR", "Bezorging van transactionele e-mails", "Verwerking binnen EU"],
                        ["Sentry (optioneel)", "VS", "Foutregistratie en prestatieanalyse", "SCCs 2021"],
                      ].map(([v, l, d, b], i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-cream/50"}>
                          <td className="p-3 border border-neutral-sand font-medium">{v}</td>
                          <td className="p-3 border border-neutral-sand">{l}</td>
                          <td className="p-3 border border-neutral-sand">{d}</td>
                          <td className="p-3 border border-neutral-sand text-orange font-medium">{b}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>
                  Wij verkopen uw persoonsgegevens nooit aan derden. Wij delen uw gegevens
                  uitsluitend met de hierboven genoemde verwerkers, voor zover noodzakelijk
                  voor de levering van de dienst, of op grond van een wettelijke verplichting.
                </p>
                <p>
                  Uw content (audio, video, transcripties) wordt <strong>niet</strong> gebruikt
                  voor het trainen van AI-modellen door onze verwerkers. Dit is contractueel
                  vastgelegd in onze verwerkersovereenkomsten.
                </p>
              </div>
            </div>

            {/* 6. Doorgifte buiten de EER */}
            <div id="doorgifte" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                6. Doorgifte buiten de Europese Economische Ruimte
              </h2>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>
                  Enkele van onze verwerkers (Anthropic/OpenRouter, Neon.tech en Sentry) zijn
                  gevestigd in de Verenigde Staten. De VS heeft geen algemeen
                  adequaatheidsbesluit van de Europese Commissie voor alle sectoren.
                </p>
                <p>
                  Voor deze doorgifte buiten de EER maken wij gebruik van de{" "}
                  <strong>Standaard Contractuele Clausules (SCCs)</strong> vastgesteld door
                  de Europese Commissie op 4 juni 2021 (Uitvoeringsbesluit 2021/914/EU). Deze
                  SCCs bieden passende waarborgen conform Art. 46(2)(c) AVG.
                </p>
                <p>
                  U kunt een kopie van de toepasselijke SCCs opvragen via{" "}
                  <a href="mailto:privacy@bewaardvoorjou.nl" className="text-orange underline">
                    privacy@bewaardvoorjou.nl
                  </a>
                  .
                </p>
                <p>
                  Onze media-opslag (audio, video) vindt uitsluitend plaats binnen de
                  Europese Unie (EU-regio eu-central-1). Transcripties worden tijdelijk
                  verwerkt via externe API-aanroepen naar VS-gebaseerde diensten, waarbij
                  de SCCs van toepassing zijn.
                </p>
              </div>
            </div>

            {/* 7. Bewaartermijnen */}
            <div id="bewaartermijnen" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                7. Bewaartermijnen
              </h2>
              <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                <p>
                  Wij bewaren uw persoonsgegevens niet langer dan noodzakelijk voor het doel
                  waarvoor zij zijn verzameld, of zolang als wettelijk vereist. De volgende
                  bewaartermijnen gelden:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-cream">
                        <th className="text-left p-3 border border-neutral-sand font-semibold text-slate-800">Gegevenscategorie</th>
                        <th className="text-left p-3 border border-neutral-sand font-semibold text-slate-800">Bewaartermijn</th>
                        <th className="text-left p-3 border border-neutral-sand font-semibold text-slate-800">Grondslag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Accountgegevens", "Zolang account actief is + 12 maanden na verwijdering", "Dienstverlening"],
                        ["Audio- en video-opnamen", "Conform gekozen pakket (1 / 5 / onbeperkt jaar)", "Contractuele afspraak"],
                        ["Getranscribeerde tekst", "Gelijk aan de bijbehorende opname", "Dienstverlening"],
                        ["AI-analyses en highlights", "Gelijk aan de bijbehorende opname", "Dienstverlening"],
                        ["Betaalgegevens (facturen)", "7 jaar", "Fiscale bewaarplicht (Art. 52 AWR)"],
                        ["E-maillogs", "2 jaar", "Fraudepreventie + gerechtvaardigd belang"],
                        ["Auditlogs (beheerdersacties)", "3 jaar", "Beveiligingsverplichting"],
                        ["Beveiligingsincidenten", "5 jaar", "Wettelijke verplichting (Art. 33 AVG)"],
                        ["Familieuitnodigingen (niet geaccepteerd)", "90 dagen na afloop uitnodiging", "Dataminimalisatie"],
                        ["Nalatenschapsgegevens", "Tot account verwijderd + max. 25 jaar na overlijden", "Contractuele afspraak"],
                        ["Data na accountverwijdering", "Verwijderd binnen 30 dagen", "Art. 17 AVG"],
                        ["Sessietokens (JWT)", "60 minuten (automatisch verlopen)", "Beveiliging"],
                      ].map(([cat, term, gr], i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-cream/50"}>
                          <td className="p-3 border border-neutral-sand font-medium">{cat}</td>
                          <td className="p-3 border border-neutral-sand">{term}</td>
                          <td className="p-3 border border-neutral-sand text-slate-500">{gr}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 8. Uw rechten */}
            <div id="uw-rechten" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                8. Uw rechten als betrokkene
              </h2>
              <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                <p>
                  Op grond van de AVG heeft u de volgende rechten. U kunt deze uitoefenen via
                  uw accountinstellingen of via{" "}
                  <a href="mailto:privacy@bewaardvoorjou.nl" className="text-orange underline">
                    privacy@bewaardvoorjou.nl
                  </a>
                  . Wij reageren binnen <strong>30 dagen</strong>; bij complexe verzoeken
                  kan deze termijn worden verlengd met maximaal 60 dagen (Art. 12(3) AVG).
                </p>

                <div className="space-y-3">
                  {[
                    {
                      recht: "Recht op inzage (Art. 15)",
                      uitleg: "U kunt opvragen welke persoonsgegevens wij van u verwerken, voor welk doel, en aan wie deze zijn doorgegeven. U ontvangt een volledig overzicht.",
                    },
                    {
                      recht: "Recht op rectificatie (Art. 16)",
                      uitleg: "U kunt onjuiste of onvolledige persoonsgegevens laten corrigeren. Veel gegevens kunt u zelf aanpassen in uw accountinstellingen.",
                    },
                    {
                      recht: "Recht op wissing — 'recht om vergeten te worden' (Art. 17)",
                      uitleg: "U kunt verzoeken uw account en alle bijbehorende gegevens permanent te verwijderen. Na verificatie van uw identiteit via uw geregistreerde e-mailadres worden uw gegevens binnen 30 dagen verwijderd. Uitzondering: gegevens die wij op grond van een wettelijke bewaarplicht moeten bewaren (bijv. facturen, 7 jaar).",
                    },
                    {
                      recht: "Recht op beperking van verwerking (Art. 18)",
                      uitleg: "U kunt vragen om de verwerking van uw gegevens tijdelijk te beperken, bijvoorbeeld als u de juistheid van de gegevens betwist of als u bezwaar heeft gemaakt en de uitkomst nog afgewacht wordt.",
                    },
                    {
                      recht: "Recht op gegevensoverdraagbaarheid (Art. 20)",
                      uitleg: "U kunt een volledige export van uw gegevens aanvragen in een machine-leesbaar formaat (JSON). Dit omvat uw accountprofiel, verhalen, transcripties, highlights en nalatenschapsinstellingen. Mediabestanden (audio/video) kunnen worden gedownload via uw accountomgeving.",
                    },
                    {
                      recht: "Recht van bezwaar (Art. 21)",
                      uitleg: "U kunt bezwaar maken tegen verwerking die plaatsvindt op basis van gerechtvaardigd belang (Art. 6(1)(f)). Wij stoppen dan met de betreffende verwerking, tenzij wij dwingende gerechtvaardigde gronden kunnen aanvoeren die zwaarder wegen dan uw belangen.",
                    },
                    {
                      recht: "Recht op intrekking van toestemming",
                      uitleg: "U kunt verleende toestemming — ook voor bijzondere categorieën — te allen tijde intrekken via uw accountinstellingen. Intrekking heeft geen terugwerkende kracht op reeds verwerkte gegevens.",
                    },
                  ].map(({ recht, uitleg }) => (
                    <div key={recht} className="flex gap-3 rounded-xl border border-neutral-sand bg-cream px-4 py-3">
                      <span className="text-orange mt-0.5 flex-shrink-0">&#10003;</span>
                      <div>
                        <p className="font-semibold text-slate-800 mb-1">{recht}</p>
                        <p className="text-slate-600">{uitleg}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-cream rounded-xl p-4 border border-neutral-sand">
                  <p className="font-semibold text-slate-800 mb-1">Procedure voor het indienen van een verzoek:</p>
                  <ol className="list-decimal list-outside pl-5 space-y-1 text-slate-600">
                    <li>Stuur een e-mail naar <a href="mailto:privacy@bewaardvoorjou.nl" className="text-orange underline">privacy@bewaardvoorjou.nl</a> met uw naam, e-mailadres en het gewenste verzoek.</li>
                    <li>Wij verifiëren uw identiteit via het bij ons bekende e-mailadres (challenge-response).</li>
                    <li>Wij bevestigen ontvangst binnen 3 werkdagen en reageren op het verzoek binnen 30 dagen.</li>
                    <li>Bij afwijzing ontvangt u een schriftelijke motivering.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* 9. Minderjarigen */}
            <div id="minderjarigen" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                9. Minderjarigen
              </h2>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>
                  Ons platform is bedoeld voor personen van <strong>18 jaar en ouder</strong>.
                  Wij verzamelen niet bewust persoonsgegevens van kinderen jonger dan 18 jaar
                  als accounthouder.
                </p>
                <p>
                  Wanneer u in uw levensverhaal personen noemt die minderjarig zijn of waren
                  (bijv. kleinkinderen, kinderen), verwerken wij hun gegevens uitsluitend als
                  onderdeel van uw eigen verhaal, op basis van uw toestemming. U bent
                  verantwoordelijk voor het waarborgen dat u daartoe gerechtigd bent.
                </p>
                <p>
                  Wanneer wij vaststellen dat een accounthouder jonger is dan 18 jaar, zullen
                  wij dat account en de bijbehorende gegevens verwijderen en u hierover
                  informeren via het opgegeven e-mailadres.
                </p>
              </div>
            </div>

            {/* 10. Nalatenschap */}
            <div id="nalatenschap" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                10. Nalatenschap en overlijden van de gebruiker
              </h2>
              <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                <p>
                  BewaardVoorJou biedt een optionele legacy-functie waarmee u kunt instellen
                  wat er met uw verhalen gebeurt na uw overlijden of langdurige inactiviteit.
                  Deze functie is volledig vrijwillig en vereist uw uitdrukkelijke toestemming.
                </p>

                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Hoe de legacy-functie werkt:</h3>
                  <ol className="list-decimal list-outside pl-5 space-y-2">
                    <li>U stelt beheerders (trustees) in via hun e-mailadres en bepaalt welk toegangsniveau zij krijgen.</li>
                    <li>U kiest een vrijgavedrempel: inactiviteit gedurende 6, 12 of 24 maanden, of een specifieke datum.</li>
                    <li>Bij het bereiken van de drempel ontvangen uw beheerders een notificatie.</li>
                    <li>Een beheerder dient het overlijden te bevestigen via <a href="mailto:privacy@bewaardvoorjou.nl" className="text-orange underline">privacy@bewaardvoorjou.nl</a>, inclusief een officieel bewijs van overlijden (overlijdensakte of verklaring van een bevoegde instantie).</li>
                    <li>Na verificatie krijgen aangewezen beheerders toegang conform de door u ingestelde rechten.</li>
                  </ol>
                </div>

                <div className="bg-orange/5 border border-orange/20 rounded-xl p-4">
                  <p className="font-semibold text-slate-800 mb-2">Juridische kanttekening:</p>
                  <ul className="space-y-2 text-slate-600">
                    <li>— Het AVG-recht op wissing (Art. 17) is persoonsgebonden en vervalt niet automatisch bij overlijden in zijn geheel, maar erfgenamen kunnen dit recht onder omstandigheden uitoefenen conform nationaal recht.</li>
                    <li>— Erfgenamen hebben <strong>geen automatisch recht</strong> op inzage in de persoonsgegevens van de overledene, tenzij u dit expliciet heeft vastgelegd via de legacy-functie.</li>
                    <li>— De legacy-functie vervangt geen juridisch testament. Voor vragen over erfrecht verwijzen wij u naar een notaris.</li>
                    <li>— Bewaartermijn na overlijden: maximaal 25 jaar na de vrijgavedatum, tenzij uw beheerder eerder verwijdering verzoekt.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 11. Beveiliging */}
            <div id="beveiliging" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                11. Beveiligingsmaatregelen
              </h2>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>
                  Wij nemen passende technische en organisatorische maatregelen ter
                  bescherming van uw persoonsgegevens conform Art. 32 AVG:
                </p>
                <ul className="list-disc list-outside pl-5 space-y-1">
                  <li>Wachtwoorden worden nooit opgeslagen als leesbare tekst; wij gebruiken Argon2 hashing (memory-hard algoritme)</li>
                  <li>Alle communicatie verloopt via TLS (HTTPS)</li>
                  <li>Sessietokens (JWT) verlopen automatisch na 60 minuten</li>
                  <li>Rate limiting op alle gevoelige eindpunten (inloggen: max. 3 pogingen/minuut; registreren: max. 5/uur)</li>
                  <li>Strikte toegangscontrole: gebruikers hebben alleen toegang tot hun eigen gegevens</li>
                  <li>Familieleden kunnen uitsluitend de hoofdstukken zien die de eigenaar heeft gedeeld</li>
                  <li>Alle beheerdersacties worden gelogd in een auditregistratie</li>
                  <li>Verificatie van webhook-handtekeningen via HMAC-SHA256</li>
                  <li>Periodieke beveiligingsreviews</li>
                </ul>
                <p>
                  Ondanks deze maatregelen kan geen enkel systeem volledig worden beveiligd
                  tegen alle risico's. In het geval van een datalek dat een risico inhoudt
                  voor uw rechten en vrijheden, zullen wij u onverwijld informeren conform
                  Art. 34 AVG en de Autoriteit Persoonsgegevens notify conform Art. 33 AVG.
                </p>
              </div>
            </div>

            {/* 12. Cookies */}
            <div id="cookies" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                12. Cookies
              </h2>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>
                  Wij gebruiken uitsluitend <strong>functionele cookies</strong> die
                  technisch noodzakelijk zijn voor de werking van het platform:
                </p>
                <ul className="list-disc list-outside pl-5 space-y-1">
                  <li>Sessie- en authenticatiecookies (inlogstatus)</li>
                  <li>Voorkeurscookies (taalinstelling)</li>
                </ul>
                <p>
                  Er worden <strong>geen</strong> tracking-, profiling- of marketingcookies
                  geplaatst. Eventuele bezoekersanalyse vindt anoniem en geaggregeerd
                  plaats, zonder het plaatsen van cookies waarvoor toestemming vereist is.
                </p>
                <p>
                  Voor functionele cookies is op grond van de Telecommunicatiewet geen
                  voorafgaande toestemming vereist.
                </p>
              </div>
            </div>

            {/* 13. AI verwerking */}
            <div id="ai-verwerking" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                13. Geautomatiseerde besluitvorming en AI
              </h2>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>
                  BewaardVoorJou maakt gebruik van AI-diensten voor het genereren van
                  interviewvragen, transcriptie van opnamen en analyse van uw verhalen.
                  Wij informeren u hierover conform Art. 13(2)(f) en Art. 22 AVG:
                </p>
                <ul className="list-disc list-outside pl-5 space-y-1">
                  <li>
                    <strong>Interviewvragen</strong> worden gegenereerd op basis van uw
                    eerdere antwoorden en het hoofdstuk dat u bewerkt. Dit is een
                    ondersteunende functie zonder rechtsgevolgen.
                  </li>
                  <li>
                    <strong>Transcriptie</strong> van uw opnamen vindt plaats via Whisper
                    (OpenAI) en wordt doorgegeven aan de VS op basis van SCCs.
                  </li>
                  <li>
                    <strong>Emotie- en sentimentanalyse</strong> dient uitsluitend ter
                    markering van hoogtepunten in uw eigen verhaal. Deze analyse heeft
                    geen rechtsgevolgen voor u en wordt niet gebruikt voor profilering
                    ten behoeve van derden.
                  </li>
                  <li>
                    <strong>Uw content wordt niet gebruikt voor AI-training</strong> door
                    onze verwerkers. Dit is contractueel vastgelegd.
                  </li>
                </ul>
                <p>
                  U kunt AI-verwerking (uitsluitend analyses en highlights; transcriptie
                  is onderdeel van de kerndienst) uitschakelen in uw accountinstellingen
                  onder &apos;AI-voorkeuren&apos;.
                </p>
              </div>
            </div>

            {/* 14. Wijzigingen */}
            <div id="wijzigingen" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                14. Wijzigingen in deze privacyverklaring
              </h2>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>
                  Wij behouden het recht deze privacyverklaring te wijzigen. Wezenlijke
                  wijzigingen kondigen wij minimaal <strong>30 dagen</strong> van tevoren
                  aan via het bij ons bekende e-mailadres en via een melding op ons platform.
                </p>
                <p>
                  De meest recente versie is altijd raadpleegbaar op{" "}
                  <a href="https://bewaardvoorjou.nl/privacy" className="text-orange underline">
                    bewaardvoorjou.nl/privacy
                  </a>
                  . De ingangsdatum staat vermeld bovenaan dit document.
                </p>
                <p>
                  Bij ingrijpende wijzigingen die uw rechten beperken, vragen wij uw
                  uitdrukkelijke hernieuwde toestemming vóór de inwerkingtreding.
                </p>
              </div>
            </div>

            {/* 15. Klachtrecht */}
            <div id="klachtrecht" className="bg-white rounded-2xl border border-neutral-sand p-6 md:p-8 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-neutral-sand">
                15. Klachtrecht bij de Autoriteit Persoonsgegevens
              </h2>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>
                  Als u van mening bent dat wij uw persoonsgegevens onrechtmatig verwerken,
                  verzoeken wij u eerst contact met ons op te nemen via{" "}
                  <a href="mailto:privacy@bewaardvoorjou.nl" className="text-orange underline">
                    privacy@bewaardvoorjou.nl
                  </a>
                  . Wij streven ernaar klachten binnen 14 werkdagen op te lossen.
                </p>
                <p>
                  U heeft altijd het recht een klacht in te dienen bij de toezichthoudende
                  autoriteit. Voor Nederland is dat de{" "}
                  <strong>Autoriteit Persoonsgegevens (AP)</strong>:
                </p>
                <div className="bg-cream rounded-xl p-4 border border-neutral-sand font-mono text-xs space-y-1">
                  <p className="font-sans font-semibold text-slate-800">Autoriteit Persoonsgegevens</p>
                  <p>Postbus 93374</p>
                  <p>2509 AJ Den Haag</p>
                  <p>Telefoon: 088 – 1805 250</p>
                  <p>
                    Website:{" "}
                    <a
                      href="https://www.autoriteitpersoonsgegevens.nl"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange underline"
                    >
                      www.autoriteitpersoonsgegevens.nl
                    </a>
                  </p>
                </div>
                <p>
                  Bent u woonachtig in een andere EU-lidstaat? Dan kunt u ook terecht bij
                  de toezichthoudende autoriteit van uw land van verblijf.
                </p>
              </div>
            </div>

            {/* 16. Contact */}
            <div id="contact" className="bg-orange/5 rounded-2xl border border-orange/20 p-6 md:p-8 scroll-mt-24">
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-4 pb-3 border-b border-orange/20">
                16. Contactgegevens
              </h2>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>
                  Voor vragen, verzoeken of klachten omtrent deze privacyverklaring of de
                  verwerking van uw persoonsgegevens kunt u contact opnemen met:
                </p>
                <div className="bg-white rounded-xl p-4 border border-orange/20 space-y-1">
                  <p className="font-semibold text-slate-800">WeAreImpact B.V. (BewaardVoorJou)</p>
                  <p>Heintje Hoeksteeg 11a</p>
                  <p>1012 GR Amsterdam, Nederland</p>
                  <p>
                    E-mail:{" "}
                    <a href="mailto:privacy@bewaardvoorjou.nl" className="text-orange underline">
                      privacy@bewaardvoorjou.nl
                    </a>
                  </p>
                  <p>KVK: 70285888 · BTW: NL858236369B01</p>
                </div>
                <p className="text-slate-500 text-xs">
                  Wij streven naar een reactie binnen 3 werkdagen. Voor formele verzoeken
                  ex Art. 15–21 AVG reageren wij binnen 30 dagen.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <a
                    href="mailto:privacy@bewaardvoorjou.nl"
                    className="inline-flex items-center justify-center gap-2 bg-orange hover:bg-orange/90 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
                  >
                    privacy@bewaardvoorjou.nl
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

          </div>

          <p className="text-center text-xs text-slate-400 mt-10">
            Privacyverklaring BewaardVoorJou B.V. · Versie 2.1 · Ingangsdatum 1 juni 2025
          </p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
