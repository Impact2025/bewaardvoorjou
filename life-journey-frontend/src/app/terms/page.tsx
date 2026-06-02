import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export const metadata: Metadata = {
  title: "Algemene voorwaarden | BewaardVoorJou.nl",
  description:
    "De volledige algemene voorwaarden van BewaardVoorJou.nl — inclusief bepalingen over AI-verwerking, familie-ecosysteem en nalatenschap.",
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
      "**BewaardVoorJou** of **Wij**: WeAreImpact B.V., handelend onder de naam BewaardVoorJou, gevestigd aan de Heintje Hoeksteeg 11a, 1012 GR Amsterdam, ingeschreven bij de Kamer van Koophandel te Amsterdam onder nummer 70285888, btw-nummer NL858236369B01, beheerder van het platform bewaardvoorjou.nl.",
      "**Platform**: het digitale platform bewaardvoorjou.nl en alle bijbehorende applicaties, API's en diensten aangeboden door BewaardVoorJou.",
      "**Gebruiker**: iedere natuurlijke persoon van 18 jaar of ouder die een account aanmaakt en gebruik maakt van het Platform.",
      "**Dienst**: het geheel van functionaliteiten aangeboden via het Platform, waaronder het vastleggen van levensverhalen via AI-gestuurde interviews, audio- en video-opnamen, automatische transcriptie, emotionele hoogtepunten, het familie-ecosysteem en de legacy-functie.",
      "**Account**: de persoonlijke, beveiligde omgeving die de Gebruiker aanmaakt om gebruik te maken van de Dienst.",
      "**Inhoud**: alle audio-opnamen, video-opnamen, teksten, foto's, aantekeningen en andere bestanden die de Gebruiker via het Platform uploadt, opneemt of aanmaakt.",
      "**Pakket**: een betaald abonnement of eenmalige aankoop dat extra functionaliteiten, opslagcapaciteit of bewaartermijnen biedt (BEGIN, ERFGOED, VOOR ALTIJD).",
      "**Familielid**: een door de Gebruiker uitgenodigde persoon die via het famille-ecosysteem toegang heeft tot (een deel van) de verhalen van de Gebruiker.",
      "**Trustee (beheerder)**: een door de Gebruiker aangewezen persoon die in het kader van de legacy-functie toegang kan krijgen tot de Inhoud na overlijden of langdurige inactiviteit van de Gebruiker.",
      "**AI-dienst**: de geautomatiseerde functionaliteit die gebruik maakt van grote taalmodellen (waaronder Claude van Anthropic) voor het genereren van interviewvragen, transcriptie, analyse en samenvatting van Inhoud.",
      "**AVG**: de Algemene Verordening Gegevensbescherming (EU 2016/679).",
    ],
  },
  {
    id: "toepasselijkheid",
    title: "Artikel 2 – Toepasselijkheid en aanvaarding",
    content: [
      "Deze algemene voorwaarden zijn van toepassing op alle aanbiedingen, overeenkomsten en het gebruik van de Dienst.",
      "Door een account aan te maken of de Dienst te gebruiken, aanvaardt de Gebruiker deze voorwaarden volledig en onvoorwaardelijk.",
      "BewaardVoorJou behoudt zich het recht voor deze voorwaarden te wijzigen. Wezenlijke wijzigingen worden minimaal 30 dagen van tevoren aangekondigd via het bij ons bekende e-mailadres en via een melding op het Platform.",
      "Indien de Gebruiker niet akkoord gaat met gewijzigde voorwaarden, kan hij/zij het account vóór de ingangsdatum van de wijziging beëindigen. Voortgezet gebruik na de ingangsdatum geldt als aanvaarding van de gewijzigde voorwaarden.",
      "Afwijking van deze voorwaarden is alleen geldig indien schriftelijk overeengekomen.",
      "Eventuele algemene voorwaarden van de Gebruiker zijn niet van toepassing, tenzij schriftelijk anders overeengekomen.",
    ],
  },
  {
    id: "account",
    title: "Artikel 3 – Account, registratie en toegang",
    content: [
      "De Gebruiker dient minimaal 18 jaar oud te zijn om een account aan te maken. Door te registreren bevestigt de Gebruiker aan deze leeftijdseis te voldoen.",
      "De Gebruiker mag per persoon één account aanmaken voor persoonlijk, niet-commercieel gebruik.",
      "De Gebruiker is verplicht bij registratie juiste en volledige informatie te verstrekken en deze actueel te houden.",
      "De Gebruiker is verantwoordelijk voor de geheimhouding van zijn/haar inloggegevens en voor alle activiteiten die via zijn/haar account plaatsvinden.",
      "Bij vermoed misbruik, verlies of diefstal van inloggegevens dient de Gebruiker onmiddellijk contact op te nemen via info@bewaardvoorjou.nl of het wachtwoord te resetten via de daarvoor bestemde functie.",
      "BewaardVoorJou biedt naast wachtwoord-inloggen ook een wachtwoordloze inlogmethode via een magic link. Magic links zijn eenmalig geldig en verlopen automatisch na 24 uur.",
      "Accounts zijn strikt persoonlijk en mogen niet worden gedeeld of overgedragen aan derden.",
      "BewaardVoorJou mag een account opschorten of beëindigen bij schending van deze voorwaarden, na voorafgaande kennisgeving tenzij de situatie directe actie vereist ter bescherming van andere gebruikers of de integriteit van het Platform.",
    ],
  },
  {
    id: "dienst",
    title: "Artikel 4 – Gebruik van de Dienst",
    content: [
      "De Gebruiker mag de Dienst uitsluitend gebruiken voor persoonlijke, niet-commerciële doeleinden in overeenstemming met deze voorwaarden.",
      "Het is verboden om via de Dienst Inhoud te plaatsen die: onrechtmatig, beledigend, lasterlijk, discriminerend of schadelijk is voor personen of groepen; inbreuk maakt op intellectuele eigendomsrechten van derden; malware, virussen of andere schadelijke code bevat; misleidend of frauduleus is.",
      "De Gebruiker mag de Dienst niet gebruiken voor het stelselmatig opnemen van derden zonder hun uitdrukkelijke, voorafgaande en aantoonbare toestemming.",
      "De Gebruiker mag de technische beveiligingsmaatregelen van het Platform niet omzeilen, doorbreken of anderszins ondermijnen.",
      "BewaardVoorJou behoudt zich het recht voor Inhoud die in strijd is met deze voorwaarden of de wet te verwijderen, na voorafgaande kennisgeving aan de Gebruiker tenzij directe actie noodzakelijk is.",
      "BewaardVoorJou behoudt zich het recht voor de Dienst geheel of gedeeltelijk te wijzigen, te beperken of te staken, met een voorafgaande kennisgevingstermijn van minimaal 30 dagen voor substantiële wijzigingen die de kerndienst raken.",
    ],
  },
  {
    id: "intellectueel",
    title: "Artikel 5 – Intellectueel eigendom en licenties",
    content: [
      "De Gebruiker behoudt alle intellectuele eigendomsrechten op de Inhoud die hij/zij aanmaakt, opneemt of uploadt via het Platform.",
      "Door Inhoud te plaatsen verleent de Gebruiker BewaardVoorJou een beperkte, niet-exclusieve, niet-overdraagbare, royaltyvrije licentie om de Inhoud op te slaan, te verwerken, te transcriberen en te tonen — uitsluitend voor de levering van de Dienst aan de Gebruiker en de door de Gebruiker uitgenodigde Familieleden.",
      "BewaardVoorJou gebruikt de Inhoud van de Gebruiker niet voor het trainen van AI-modellen, noch voor commerciële doeleinden buiten de levering van de Dienst. Dit is contractueel vastgelegd met onze AI-verwerkers.",
      "Alle overige intellectuele eigendomsrechten op de Dienst, het Platform, de technologie, de software, de vormgeving en de content (niet zijnde Inhoud van de Gebruiker) berusten bij BewaardVoorJou of haar licentiegevers.",
      "Het is de Gebruiker niet toegestaan de software van het Platform te kopiëren, te reverse-engineeren, te decompileren of te distribueren.",
      "BewaardVoorJou respecteert intellectuele eigendomsrechten van derden. Meldingen van vermeende inbreuk kunt u sturen naar info@bewaardvoorjou.nl.",
    ],
  },
  {
    id: "ai",
    title: "Artikel 6 – AI-functionaliteit en geautomatiseerde verwerking",
    content: [
      "BewaardVoorJou maakt gebruik van AI-diensten (waaronder het Claude-taalmodel van Anthropic, verwerkt via OpenRouter, en Whisper van OpenAI voor transcriptie) ter ondersteuning van de Dienst.",
      "De AI-interviewfunctie genereert op basis van uw verhalen en de gesprekscontext nieuwe vragen. Deze vragen zijn ondersteunend van aard en vormen geen medisch, juridisch, psychologisch of financieel advies.",
      "Automatische transcriptie van audio- en video-opnamen is onderdeel van de kerndienst. Transcripties kunnen onnauwkeurigheden bevatten. De Gebruiker kan transcripties inzien via zijn/haar account.",
      "AI-analyses (emotie-detectie, sentimentanalyse, extractie van sleutelpersonen en -plaatsen) zijn hulpmiddelen voor de Gebruiker en hebben geen rechtsgevolgen, noch worden zij gebruikt voor profilering jegens derden.",
      "Voor het gebruik van AI-functionaliteit verleent de Gebruiker toestemming dat relevante (geanonimiseerde) context van zijn/haar verhalen wordt doorgegeven aan externe AI-verwerkers, uitsluitend voor de levering van de Dienst. Zie de privacyverklaring voor details.",
      "De Gebruiker kan AI-analyse (niet zijnde transcriptie) uitschakelen via de accountinstellingen onder 'AI-voorkeuren'. Transcriptie is onderdeel van de basisdienst en kan niet afzonderlijk worden uitgeschakeld.",
      "BewaardVoorJou geeft geen garantie op de kwaliteit, volledigheid of juistheid van AI-gegenereerde output en is niet aansprakelijk voor beslissingen die de Gebruiker baseert op deze output.",
      "De AI-diensten zijn uitsluitend beschikbaar in de door de Dienst ondersteunde talen (momenteel: Nederlands).",
    ],
  },
  {
    id: "familie",
    title: "Artikel 7 – Familie-ecosysteem en delen",
    content: [
      "De Gebruiker kan via het familie-ecosysteem andere personen uitnodigen om (delen van) zijn/haar verhalen te bekijken. De Gebruiker is de enige die bepaalt wie toegang krijgt en tot welke inhoud.",
      "Door een persoon uit te nodigen bevestigt de Gebruiker: (a) gerechtigd te zijn de gegevens van die persoon (naam, e-mailadres) in te voeren; (b) dat de beoogde ontvanger op de hoogte zal worden gesteld van de uitnodiging en de verwerking van zijn/haar gegevens conform Art. 14 AVG.",
      "Uitnodigingen verlopen automatisch na 7 dagen indien niet geaccepteerd. BewaardVoorJou verwijdert uitnodigingstokens na acceptatie of verloping.",
      "Familieleden hebben uitsluitend leestoegang tot de door de Gebruiker gedeelde hoofdstukken. Zij kunnen geen Inhoud toevoegen, wijzigen of verwijderen, tenzij de Gebruiker hen daarvoor uitdrukkelijk machtiging verleent.",
      "De Gebruiker kan de toegang van een Familielid op elk moment intrekken via zijn/haar accountinstellingen.",
      "BewaardVoorJou is niet aansprakelijk voor de gevolgen van het delen van verhalen met derden door de Gebruiker, waaronder mogelijke privacy-inbreuken jegens in de verhalen genoemde personen.",
      "Bij het gebruik van de deelfunctie erkent de Gebruiker dat personen die worden genoemd in zijn/haar verhalen mogelijk worden geïdentificeerd door ontvangers. De Gebruiker draagt hiervoor de verantwoordelijkheid.",
    ],
  },
  {
    id: "nalatenschap",
    title: "Artikel 8 – Legacy-functie en nalatenschap",
    content: [
      "BewaardVoorJou biedt een optionele legacy-functie waarmee de Gebruiker kan instellen wat er met zijn/haar Inhoud en account geschiedt bij overlijden of langdurige inactiviteit. Activering van deze functie is volledig vrijwillig.",
      "De Gebruiker kan via de legacy-instellingen: (a) één of meer Trustees (beheerders) aanwijzen via hun e-mailadres; (b) een vrijgavedrempel instellen (inactiviteitsperiode van 6, 12 of 24 maanden, of een specifieke datum); (c) het toegangsniveau voor Trustees bepalen (lezen, downloaden of volledig beheer).",
      "Bij het bereiken van de vrijgavedrempel ontvangt de aangewezen Trustee een notificatie. De Trustee dient het overlijden of de situatie te bevestigen via privacy@bewaardvoorjou.nl met een geldig bewijs van overlijden (overlijdensakte of gelijkwaardig officieel document).",
      "Na verificatie door BewaardVoorJou krijgen Trustees uitsluitend de rechten die de Gebruiker hen heeft toegekend. BewaardVoorJou verleent geen toegang aan erfgenamen die niet als Trustee zijn aangewezen, tenzij een rechterlijke uitspraak daartoe verplicht.",
      "BewaardVoorJou is niet aansprakelijk voor: (a) de gevolgen van de keuzes die de Gebruiker maakt bij het instellen van de legacy-functie; (b) geschillen tussen erfgenamen en Trustees over de toegang tot of het gebruik van de Inhoud; (c) het overlijden van een Trustee vóór de Gebruiker.",
      "De legacy-functie vervangt geen juridisch testament. Voor vragen over erfrecht en de juridische gevolgen van nalatenschapsinstellingen verwijst BewaardVoorJou de Gebruiker naar een notaris of juridisch adviseur.",
      "De bewaartermijn na vrijgave bedraagt maximaal 25 jaar, tenzij de Trustee eerder verwijdering verzoekt. Na afloop van de bewaartermijn worden alle gegevens permanent verwijderd.",
      "Het recht op wissing (Art. 17 AVG) is persoonsgebonden. Erfgenamen kunnen dit recht onder omstandigheden uitoefenen conform nationaal recht; BewaardVoorJou zal dergelijke verzoeken beoordelen op grond van de geldende regelgeving.",
    ],
  },
  {
    id: "betaling",
    title: "Artikel 9 – Pakketten, betalingen en herroepingsrecht",
    content: [
      "BewaardVoorJou biedt een gratis basisversie en betaalde Pakketten (BEGIN, ERFGOED, VOOR ALTIJD). De kenmerken en prijzen van Pakketten zijn beschikbaar op bewaardvoorjou.nl/pricing.",
      "Betaalde Pakketten worden vooraf in rekening gebracht via de beschikbare betaalmethoden (iDEAL, creditcard, Klarna en overige Stripe-methoden).",
      "Betalingen worden verwerkt door Stripe Inc. BewaardVoorJou slaat geen volledige betaalgegevens op.",
      "**Herroepingsrecht**: Als consument heeft u het recht de overeenkomst voor een betaald Pakket te herroepen binnen 14 dagen na aankoop, zonder opgave van redenen (Art. 6:230o BW, Richtlijn 2011/83/EU). U kunt uw herroepingsrecht uitoefenen via info@bewaardvoorjou.nl. Het herroepingsrecht vervalt zodra de Dienst volledig is geleverd of zodra de Gebruiker uitdrukkelijk toestemming heeft gegeven voor levering vóór het verstrijken van de herroepingstermijn en heeft erkend dat hij/zij zijn/haar herroepingsrecht verliest bij volledige uitvoering van de overeenkomst.",
      "Eenmalige aankopen (fysieke producten, extra opslag) worden niet terugbetaald tenzij de Dienst of het product aantoonbaar niet naar behoren heeft gefunctioneerd.",
      "Prijswijzigingen voor lopende abonnementen worden minimaal 30 dagen van tevoren aangekondigd via e-mail. Bij niet-akkoord kan de Gebruiker het abonnement opzeggen vóór de ingangsdatum.",
      "BewaardVoorJou mag de gratis basisversie te allen tijde aanpassen, met een voorafgaande kennisgeving van minimaal 30 dagen voor wezenlijke beperkingen.",
      "Facturatie en ordergeschiedenis zijn raadpleegbaar in uw accountomgeving.",
    ],
  },
  {
    id: "privacy-verwerking",
    title: "Artikel 10 – Privacy en gegevensbescherming",
    content: [
      "BewaardVoorJou verwerkt persoonsgegevens conform de Algemene Verordening Gegevensbescherming (AVG / GDPR, EU 2016/679) en de Uitvoeringswet AVG (UAVG).",
      "De volledige privacyverklaring, inclusief informatie over rechtsgronden, bewaartermijnen, verwerkers, internationale doorgifte en uw rechten als betrokkene, is beschikbaar op bewaardvoorjou.nl/privacy.",
      "De Gebruiker heeft het recht op inzage, rectificatie, verwijdering, beperking van verwerking, gegevensoverdraagbaarheid en bezwaar. Verzoeken kunnen worden ingediend via privacy@bewaardvoorjou.nl.",
      "BewaardVoorJou verwerkt bijzondere categorieën persoonsgegevens (audio/video, emotie-analyse) uitsluitend op basis van de uitdrukkelijke toestemming van de Gebruiker. De Gebruiker kan deze toestemming te allen tijde intrekken.",
      "De Gebruiker die via het Platform gegevens van derden invoert (familieleden, Trustees) is verantwoordelijk voor het informeren van die derden conform Art. 14 AVG.",
    ],
  },
  {
    id: "beschikbaarheid",
    title: "Artikel 11 – Beschikbaarheid, onderhoud en back-up",
    content: [
      "BewaardVoorJou streeft naar een beschikbaarheid van het Platform van minimaal 99% per kalenderjaar, exclusief gepland onderhoud.",
      "Gepland onderhoud wordt minimaal 24 uur van tevoren aangekondigd via de website of per e-mail, tenzij spoedeisende omstandigheden dit verhinderen.",
      "BewaardVoorJou is niet aansprakelijk voor schade als gevolg van tijdelijke onbeschikbaarheid van het Platform, tenzij er sprake is van grove nalatigheid of opzet.",
      "BewaardVoorJou maakt reguliere back-ups van uw Inhoud voor herstel bij technische storingen. De Gebruiker blijft zelf verantwoordelijk voor het maken van eigen back-ups. BewaardVoorJou biedt exportfuncties voor dit doel.",
      "BewaardVoorJou is niet aansprakelijk voor verlies van Inhoud als gevolg van overmacht, hackaanvallen of andere omstandigheden buiten haar redelijke invloedsfeer, mits zij passende beveiligingsmaatregelen heeft getroffen conform Art. 32 AVG.",
    ],
  },
  {
    id: "aansprakelijkheid",
    title: "Artikel 12 – Aansprakelijkheid en garanties",
    content: [
      "BewaardVoorJou is uitsluitend aansprakelijk voor directe schade die het directe gevolg is van een aantoonbare, aan BewaardVoorJou toerekenbare tekortkoming in de nakoming van de overeenkomst.",
      "De totale aansprakelijkheid van BewaardVoorJou per schadegeval is beperkt tot het bedrag dat de Gebruiker in de 12 maanden voorafgaand aan het schadeveroorzakende feit aan BewaardVoorJou heeft betaald, met een absoluut maximum van € 500 per Gebruiker.",
      "BewaardVoorJou is niet aansprakelijk voor: (a) indirecte schade, gevolgschade, gederfde winst of immateriële schade; (b) schade door ongeautoriseerde toegang door derden ondanks redelijke beveiligingsmaatregelen; (c) schade door overmacht; (d) schade als gevolg van onjuiste, onvolledige of misleidende Inhoud geplaatst door de Gebruiker; (e) schade als gevolg van beslissingen die de Gebruiker baseert op AI-gegenereerde output.",
      "De uitsluitingen en beperkingen van aansprakelijkheid gelden niet bij opzet of bewuste roekeloosheid van BewaardVoorJou of haar leidinggevenden.",
      "BewaardVoorJou geeft geen garantie dat de Dienst foutloos of ononderbroken zal werken, of dat AI-gegenereerde output nauwkeurig, volledig of geschikt is voor enig specifiek doel.",
      "De Gebruiker vrijwaart BewaardVoorJou voor aanspraken van derden die voortvloeien uit het gebruik van de Dienst door de Gebruiker, waaronder aanspraken verband houdende met onrechtmatige Inhoud of schending van rechten van derden.",
    ],
  },
  {
    id: "beindiging",
    title: "Artikel 13 – Duur en beëindiging",
    content: [
      "De overeenkomst wordt aangegaan voor onbepaalde tijd en kan door de Gebruiker op elk moment worden beëindigd door het account te verwijderen via de accountinstellingen.",
      "Na het indienen van een verwijderingsverzoek heeft de Gebruiker 30 dagen de mogelijkheid zijn/haar Inhoud te exporteren en te downloaden. Na afloop van deze termijn wordt alle Inhoud en alle persoonsgegevens permanent verwijderd, met uitzondering van gegevens die BewaardVoorJou op grond van een wettelijke bewaarplicht dient te bewaren.",
      "BewaardVoorJou kan de overeenkomst met onmiddellijke ingang beëindigen indien: (a) de Gebruiker deze voorwaarden ernstig schendt; (b) de Gebruiker fraude pleegt of poogt te plegen; (c) de Gebruiker anderen of het Platform schaadt. BewaardVoorJou stuurt bij minder ernstige overtredingen eerst een schriftelijke waarschuwing.",
      "Bij beëindiging door BewaardVoorJou op grond van wanprestatie van de Gebruiker is BewaardVoorJou niet gehouden tot restitutie van reeds betaalde abonnementsgelden.",
      "Bij beëindiging van een betaald Pakket door de Gebruiker buiten de herroepingstermijn worden geen abonnementsgelden gerestitueerd voor de resterende periode, tenzij sprake is van een wezenlijke tekortkoming aan de zijde van BewaardVoorJou.",
    ],
  },
  {
    id: "overmacht",
    title: "Artikel 14 – Overmacht",
    content: [
      "BewaardVoorJou is niet gehouden haar verplichtingen na te komen indien zij daartoe verhinderd is als gevolg van een omstandigheid die niet is te wijten aan haar schuld en ook niet voor haar rekening komt.",
      "Onder overmacht wordt verstaan: storingen bij internet service providers, stroomstoringen, DDoS-aanvallen, stakingen, brand, overstromingen, overheidsmaatregelen, pandemieën, of het niet beschikbaar zijn van diensten van derden waarvan BewaardVoorJou afhankelijk is (zoals cloud-infrastructuur of AI-providers), mits BewaardVoorJou redelijke maatregelen heeft getroffen ter voorkoming en beperking.",
      "BewaardVoorJou zal de Gebruiker zo spoedig mogelijk informeren bij een situatie van overmacht.",
      "Indien een overmachtssituatie langer dan 30 dagen duurt, heeft elk der partijen het recht de overeenkomst te ontbinden, zonder verplichting tot schadevergoeding.",
    ],
  },
  {
    id: "geschillen",
    title: "Artikel 15 – Klachten, toepasselijk recht en geschillen",
    content: [
      "BewaardVoorJou beschikt over een interne klachtenprocedure. Klachten kunnen worden ingediend via info@bewaardvoorjou.nl. BewaardVoorJou streeft naar afhandeling binnen 14 werkdagen.",
      "Op deze voorwaarden en op de overeenkomst tussen BewaardVoorJou en de Gebruiker is uitsluitend Nederlands recht van toepassing.",
      "Geschillen worden in eerste instantie voorgelegd aan de bevoegde rechter in het arrondissement Amsterdam. Indien de Gebruiker als consument handelt, is ook de rechter van de woonplaats of vestigingsplaats van de consument bevoegd.",
      "Onverminderd het recht van de Gebruiker om een klacht in te dienen bij de bevoegde rechter, heeft de Gebruiker de mogelijkheid een geschil voor te leggen via het Europese ODR-platform (online geschillenbeslechting) op ec.europa.eu/consumers/odr.",
      "De Gebruiker kan ook een klacht indienen bij de Autoriteit Consument & Markt (ACM) of, voor privacygerelateerde klachten, bij de Autoriteit Persoonsgegevens (AP).",
    ],
  },
  {
    id: "overig",
    title: "Artikel 16 – Overige bepalingen",
    content: [
      "Indien een bepaling in deze voorwaarden ongeldig of niet-afdwingbaar blijkt te zijn, blijven de overige bepalingen onverminderd van kracht. De ongeldige bepaling wordt vervangen door een geldige bepaling die zo veel mogelijk hetzelfde effect heeft.",
      "BewaardVoorJou mag haar rechten en verplichtingen uit de overeenkomst overdragen aan een rechtsopvolger of derde partij bij een bedrijfsovername, fusie of splitsing. De Gebruiker wordt hierover minimaal 30 dagen van tevoren geïnformeerd en heeft het recht de overeenkomst te beëindigen indien hij/zij niet akkoord gaat.",
      "Het niet of niet tijdig handhaven van rechten door BewaardVoorJou houdt geen afstand van die rechten in.",
      "BewaardVoorJou is ingeschreven bij de Kamer van Koophandel onder nummer 70285888 en heeft btw-nummer NL858236369B01.",
      "Voor vragen over deze voorwaarden kunt u terecht bij info@bewaardvoorjou.nl.",
      "Deze algemene voorwaarden zijn voor het laatst bijgewerkt op 1 juni 2025 (versie 2.1).",
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
            Versie 2.1 · Ingangsdatum 1 juni 2025
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
          <p className="text-sm text-slate-500 mt-3">
            Zie ook onze{" "}
            <Link href="/privacy" className="text-orange underline hover:text-orange/80">
              Privacyverklaring
            </Link>{" "}
            voor informatie over hoe wij met uw persoonsgegevens omgaan.
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
              <Link
                href="/privacy"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-cream text-slate-700 text-sm font-medium px-5 py-2.5 rounded-full border border-neutral-sand transition-colors"
              >
                Privacyverklaring
              </Link>
            </div>
            <p className="text-xs text-slate-400 mt-4">
              WeAreImpact B.V. (BewaardVoorJou) · KVK 70285888 · BTW NL858236369B01 · Versie 2.1 · 1 juni 2025
            </p>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
