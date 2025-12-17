"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ChevronUp, Mail, Shield, Heart, Sparkles } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: React.ReactNode;
  questions: FAQItem[];
}

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const faqCategories: FAQCategory[] = [
    {
      title: "Over BewaardVoorJou.nl",
      icon: <Heart className="w-6 h-6 text-orange" />,
      questions: [
        {
          question: "Wat is BewaardVoorJou.nl precies?",
          answer:
            "BewaardVoorJou.nl is een digitaal platform waarmee je jouw levensverhaal op een gestructureerde, empathische manier kunt vastleggen voor toekomstige generaties. Onze AI-interviewer begeleidt je door 30 hoofdstukken die samen jouw unieke leven vertellen - van je kinderjaren tot je grootste levenslessen. Het resultaat is een veilig bewaard digitaal erfgoed dat je kunt delen met familie, of later kunt doorgeven als nalatenschap.",
        },
        {
          question: "Voor wie is deze dienst bedoeld?",
          answer:
            "BewaardVoorJou.nl is perfect voor iedereen die zijn of haar levensverhaal wil bewaren. Of je nu 35 bent of 85, of je wilt vastleggen voor je kinderen, kleinkinderen, of gewoon voor jezelf - onze platform helpt je om herinneringen te structureren en te bewaren. Veel gebruikers zijn senioren die hun levenswijsheid willen doorgeven, maar ook jongere mensen die hun verhaal willen documenteren voordat details vervagen.",
        },
        {
          question: "Waarom zou ik dit gebruiken in plaats van zelf filmpjes opnemen?",
          answer:
            "Dat kun je natuurlijk doen! Maar de meeste mensen weten niet waar ze moeten beginnen, welke verhalen belangrijk zijn, of hoe ze alles gestructureerd kunnen bewaren. BewaardVoorJou.nl biedt: (1) Een empathische AI-interviewer die de juiste vragen stelt op het juiste moment, (2) Een gestructureerde aanpak door 30 zorgvuldig samengestelde hoofdstukken, (3) Automatische transcriptie zodat verhalen ook geschreven beschikbaar zijn, (4) Veilige opslag met backup en toegangscontrole, (5) Mogelijkheid om alles later te delen of door te geven als nalatenschap. Het is het verschil tussen losse fragmenten en een compleet, georganiseerd levensverhaal.",
        },
        {
          question: "Hoeveel tijd kost het om mijn verhaal vast te leggen?",
          answer:
            "Dat bepaal je helemaal zelf. Elk hoofdstuk duurt ongeveer 10-20 minuten om op te nemen, maar je kunt zo lang of kort antwoorden als je wilt. Sommige gebruikers werken een paar hoofdstukken per week af, anderen nemen er rustig een paar maanden voor. Je kunt altijd pauzeren en later verder gaan. Een volledig levensverhaal (alle 30 hoofdstukken) neemt gemiddeld 6-10 uur opnametijd in beslag, verspreid over weken of maanden.",
        },
        {
          question: "Is BewaardVoorJou.nl een Nederlandse dienst?",
          answer:
            "Ja, BewaardVoorJou.nl is volledig ontwikkeld in Nederland. Onze servers staan in Europa, we voldoen aan de strenge Europese privacywetgeving (GDPR), en onze AI-interviewer spreekt natuurlijk Nederlands met begrip voor Nederlandse cultuur en geschiedenis. We begrijpen de waarde van herinneringen in de Nederlandse context - van oorlogsverhalen tot Elfstedentochten, van emigratie naar Indië tot de gouden jaren van de wederopbouw.",
        },
      ],
    },
    {
      title: "Privacy & Veiligheid",
      icon: <Shield className="w-6 h-6 text-orange" />,
      questions: [
        {
          question: "Hoe veilig zijn mijn opnames en persoonlijke verhalen?",
          answer:
            "Jouw privacy is onze hoogste prioriteit. Alle data wordt versleuteld opgeslagen met bank-level encryptie (AES-256), zowel tijdens verzending als opslag. Alleen jij hebt toegang tot je verhalen, tenzij je expliciet kiest om ze te delen. We maken regelmatig backups, maar zelfs wij kunnen je opnames niet bekijken zonder jouw toestemming. Al onze servers staan in Europa en voldoen aan de strenge GDPR-wetgeving.",
        },
        {
          question: "Wie kan mijn verhalen zien?",
          answer:
            "Standaard ben alleen jij de eigenaar en kan alleen jij je opnames bekijken. Je kunt ervoor kiezen om specifieke hoofdstukken of je hele verhaal te delen met familieleden via een veilige deellink. Je hebt volledige controle: je kunt toegang op elk moment intrekken, verloopdata instellen, of kiezen wie wat mag zien. We verkopen nooit je data aan derden en gebruiken je verhalen niet voor andere doeleinden.",
        },
        {
          question: "Wat gebeurt er met mijn data als ik overlijdt?",
          answer:
            "BewaardVoorJou.nl heeft een speciale Legacy Planning functie. Je kunt: (1) Vertrouwde contactpersonen aanwijzen die na je overlijden toegang krijgen, (2) Een 'dead man's switch' instellen die automatisch toegang geeft na een bepaalde periode van inactiviteit, (3) Tijdcapsules maken die pas na een bepaalde datum geopend worden (bijvoorbeeld voor kleinkinderen die dan 18 zijn). Je bepaalt zelf wat er met je verhalen gebeurt - het is jouw digitale erfgoed.",
        },
        {
          question: "Worden mijn opnames gebruikt om AI te trainen?",
          answer:
            "Nee, absoluut niet. Jouw persoonlijke verhalen worden uitsluitend gebruikt voor de diensten die wij je bieden (transcriptie, highlights, zoekfunctie). We gebruiken je opnames niet om AI-modellen te trainen en delen ze niet met AI-leveranciers voor dat doel. De AI-interviewer die je begeleidt is een generiek model dat geen toegang heeft tot verhalen van andere gebruikers.",
        },
        {
          question: "Kan ik mijn data verwijderen of exporteren?",
          answer:
            "Ja, je hebt volledige controle. Je kunt op elk moment: (1) Individuele opnames verwijderen, (2) Je hele account met alle data permanent verwijderen, (3) Al je data exporteren in standaard formaten (video/audio bestanden + transcripties in PDF). We voldoen volledig aan de GDPR 'recht op vergetelheid' en 'recht op dataportabiliteit'.",
        },
        {
          question: "Hoe lang blijven mijn verhalen bewaard?",
          answer:
            "Jouw verhalen blijven bewaard zolang je account actief is. Voor gratis accounts betekent dit zolang je minimaal eens per jaar inlogt. Voor betaalde accounts (in de toekomst) garanderen we permanente opslag. We waarschuwen je ruim van tevoren als een account riskeert verwijderd te worden wegens inactiviteit, en je kunt altijd je data exporteren voordat dat gebeurt.",
        },
      ],
    },
    {
      title: "Hoe het werkt",
      icon: <Sparkles className="w-6 h-6 text-orange" />,
      questions: [
        {
          question: "Hoe werkt de AI-interviewer precies?",
          answer:
            "Onze AI-interviewer is getraind om empathisch en respectvol door te vragen, net als een goede gesprekpartner. Het systeem: (1) Stelt een open vraag over een hoofdstuk (bijv. 'Vertel over je kindertijd'), (2) Luistert naar je antwoord via opname, (3) Analyseert wat je zegt en stelt relevante vervolgvragen, (4) Past zich aan jouw tempo en stijl aan. De AI oordeelt nooit, haast nooit, en respecteert stiltes. Het voelt als een waardig gesprek, niet als een technische vragenlijst.",
        },
        {
          question: "Moet ik alle 30 hoofdstukken doen?",
          answer:
            "Nee, je bepaalt zelf. De 30 hoofdstukken bieden een complete structuur - van je kinderjaren tot je levensfilosofie - maar je kunt kiezen welke hoofdstukken voor jou belangrijk zijn. Sommige mensen overslaan hoofdstukken die niet relevant zijn (bijv. 'Carrière' als je nooit gewerkt hebt), anderen doen alleen de hoofdstukken die ze graag willen delen. Je kunt ook hoofdstukken in willekeurige volgorde doen - er is geen dwang.",
        },
        {
          question: "Welke onderwerpen komen aan bod in de 30 hoofdstukken?",
          answer:
            "De hoofdstukken dekken je hele leven: Fase 1 (Intro): Reflectie, intentie, jeugdfoto's. Fase 2 (Jeugd): Kindertijd, school, eerste vriendschappen. Fase 3 (Volwassenheid): Carrière, relaties, ouderschap. Fase 4 (Identiteit): Geloof, cultuur, moeilijke keuzes. Fase 5 (Nalatenschap): Levenswijsheid, berichten voor naasten, trots en dankbaarheid. Bonusfases: Verdiepende vragen, onverwachte herinneringen, dromen en ambities. Elk hoofdstuk is ontworpen om authentieke, betekenisvolle verhalen naar boven te halen.",
        },
        {
          question: "Kan ik opnames opnieuw doen als ik niet tevreden ben?",
          answer:
            "Ja, absoluut. Je kunt elk hoofdstuk opnieuw opnemen zo vaak als je wilt. De vorige opname wordt vervangen (tenzij je hem eerst downloadt). Dit geeft je de vrijheid om te experimenteren - als je halverwege denkt 'dit kan beter', begin dan gewoon opnieuw. Er is geen limiet aan het aantal pogingen.",
        },
        {
          question: "Kan ik opnames bewerken na het opnemen?",
          answer:
            "Op dit moment kun je hele hoofdstukken opnieuw opnemen, maar geen opnames bewerken (knippen, plakken, filters). Dit is een bewuste keuze: we willen de authenticiteit en spontaniteit behouden. Een levensverhaal hoeft niet perfect gemonteerd te zijn - juist de ongepolijste momenten maken het echt. In de toekomst overwegen we basisbewerkingstools als daar vraag naar is.",
        },
        {
          question: "Hoe werkt de transcriptie?",
          answer:
            "Na elke opname analyseren we automatisch je audio en zetten deze om naar tekst met geavanceerde spraakherkenning (Whisper AI). Dit gebeurt binnen een paar minuten. De transcriptie verschijnt onder je video/audio en is doorzoekbaar. Hierdoor kunnen familieleden later specifieke verhalen terugvinden ('Opa's verhaal over de oorlog') zonder alles te hoeven bekijken. De transcripties zijn niet 100% perfect, vooral bij dialecten of achtergrondgeluid, maar meestal zeer accuraat.",
        },
        {
          question: "Wat zijn 'emotionele highlights'?",
          answer:
            "Onze AI detecteert automatisch bijzondere momenten in je verhalen: momenten van humor (lachen), inzicht (aha-momenten), liefde (warmte, verbondenheid) en wijsheid (levenslessen). Deze highlights krijgen een label en zijn makkelijk terug te vinden. Het helpt familieleden later om snel de meest betekenisvolle fragmenten te ontdekken, zonder uren aan opnames te moeten doorspitten.",
        },
        {
          question: "Kan ik ook alleen audio opnemen, zonder video?",
          answer:
            "Ja, je kunt kiezen tussen video, alleen audio, of zelfs getypte tekst. Sommige mensen voelen zich comfortabeler zonder camera, anderen willen juist gezichtsuitdrukkingen vastleggen. Het is helemaal aan jou. Je kunt ook per hoofdstuk wisselen - bijvoorbeeld video voor persoonlijke verhalen en audio voor gevoelige onderwerpen.",
        },
      ],
    },
    {
      title: "Delen & Familie",
      icon: <Heart className="w-6 h-6 text-orange" />,
      questions: [
        {
          question: "Hoe kan ik mijn verhalen delen met familie?",
          answer:
            "Je kunt per hoofdstuk of voor je hele verhaal een veilige deellink genereren. Deze link kun je versturen via e-mail, WhatsApp of op papier geven. Je bepaalt: (1) Wie toegang heeft (alleen met link, of specifieke e-mailadressen), (2) Hoelang de link geldig is (permanant, of bijv. 1 jaar), (3) Of mensen reacties kunnen achterlaten. Je kunt toegang op elk moment intrekken.",
        },
        {
          question: "Kunnen familieleden reageren op mijn verhalen?",
          answer:
            "Ja, als je dat toestaat kunnen familieleden die toegang hebben reacties en eigen herinneringen toevoegen. Dit creëert een dialoog - bijvoorbeeld een kleinzoon die reageert op opa's oorlogsverhaal, of een zus die een vergeten detail toevoegt. Het wordt een levend familiearchief in plaats van een statisch document. Je kunt deze functie ook uitschakelen als je liever geen reacties ontvangt.",
        },
        {
          question: "Kan ik anderen uitnodigen om hun verhaal toe te voegen?",
          answer:
            "In de toekomst komt er een 'Familiepod' functie waarbij meerdere familieleden hun eigen verhalen vastleggen in een gedeelde ruimte. Denk aan: opa en oma die beide hun kant van het verhaal vertellen, broers en zussen die hun jeugd elk vanuit hun perspectief beschrijven. Dit is nog niet beschikbaar in de huidige versie, maar staat hoog op onze roadmap.",
        },
        {
          question: "Wat als ik sommige verhalen privé wil houden?",
          answer:
            "Elk hoofdstuk heeft individuele privacy-instellingen. Je kunt bijvoorbeeld: (1) 20 hoofdstukken delen met heel de familie, (2) 5 gevoelige hoofdstukken alleen voor jezelf houden, (3) 3 specifieke hoofdstukken alleen delen met je partner of beste vrienden. Je hebt volledige granulaire controle - niet alles of niets.",
        },
        {
          question: "Kunnen familieleden mij helpen met opnemen?",
          answer:
            "Absoluut. Veel gebruikers nemen op samen met een kind, kleinzoon of partner die helpt met de techniek of aanmoedigt om door te gaan. Je kunt iemand naast je hebben zitten tijdens het interview - de AI-interviewer merkt niet wie praat, dus jullie kunnen het gesprek samen voeren. Sommige families maken er een gezellig ritueel van: elke zondagmiddag een hoofdstuk opnemen met koffie en gebak.",
        },
      ],
    },
    {
      title: "Technische vragen",
      icon: <Sparkles className="w-6 h-6 text-orange" />,
      questions: [
        {
          question: "Welke apparaten kan ik gebruiken?",
          answer:
            "BewaardVoorJou.nl werkt op elke moderne browser: Chrome, Safari, Firefox, Edge. Je kunt het gebruiken op: (1) Computer (Windows, Mac, Linux), (2) Tablet (iPad, Android), (3) Smartphone (iPhone, Android). We raden een tablet of computer aan voor comfort tijdens langere opnames, maar alles werkt ook prima op je telefoon. Er is geen app-installatie nodig - alles werkt via je browser.",
        },
        {
          question: "Heb ik een goede camera of microfoon nodig?",
          answer:
            "Nee, de ingebouwde camera en microfoon van je apparaat zijn prima. Moderne smartphones en laptops hebben verrassend goede kwaliteit. Tips voor betere opnames: (1) Zit in een rustige ruimte zonder achtergrondgeluid, (2) Zorg voor goede verlichting (raam of lamp voor je, niet achter je), (3) Zit dichtbij genoeg zodat je goed verstaanbaar bent. Geen dure apparatuur nodig - je stem en verhaal zijn belangrijker dan perfecte productiekwaliteit.",
        },
        {
          question: "Hoeveel opslagruimte krijg ik?",
          answer:
            "Gratis accounts krijgen op dit moment voldoende opslag voor alle 30 hoofdstukken in standaard kwaliteit (meestal 10-20GB). Gemiddeld neemt één hoofdstuk van 15 minuten ongeveer 300-500MB in beslag. Als je veel langere opnames maakt of alles in hoge resolutie wilt, kun je in de toekomst upgraden naar een betaald plan met meer opslag. We waarschuwen je als je tegen je limiet aanloopt.",
        },
        {
          question: "Wat gebeurt er als mijn internetverbinding wegvalt tijdens opnemen?",
          answer:
            "Je opname wordt lokaal op je apparaat opgeslagen terwijl je opneemt. Als je internet wegvalt, kun je de opname gewoon afmaken. Zodra je weer verbinding hebt, kun je de opname uploaden. We raden aan om op te nemen met WiFi in plaats van mobiele data, vooral voor video, om vertraging en kosten te voorkomen.",
        },
        {
          question: "In welke formaten kan ik mijn verhalen downloaden?",
          answer:
            "Je kunt je opnames downloaden als: (1) Video: MP4 (H.264) - universeel afspeelbaar, (2) Audio: MP3 - voor alleen geluid, (3) Transcriptie: PDF of TXT - om te printen of te archiveren. Je kunt ook je hele verhaal in één keer exporteren als ZIP-bestand met alle hoofdstukken. Deze standaard formaten blijven decennia lang toegankelijk, ongeacht of BewaardVoorJou.nl blijft bestaan.",
        },
        {
          question: "Werkt de AI ook offline?",
          answer:
            "Nee, de AI-interviewer vereist een internetverbinding omdat de analyse en transcriptie in de cloud gebeurt. Je kunt wel offline opnemen (de opname blijft lokaal opgeslagen) en later uploaden wanneer je weer online bent. Een volledige offline modus staat op onze roadmap voor de toekomst.",
        },
        {
          question: "Hoeveel data verbruikt het opnemen?",
          answer:
            "Het opnemen zelf verbruikt geen data - alles gebeurt lokaal op je apparaat. Pas bij het uploaden na de opname wordt data gebruikt. Een video-opname van 15 minuten verbruikt ongeveer 300-500MB upload. Een audio-only opname is veel lichter: ongeveer 15-30MB. We raden aan om op WiFi te uploaden tenzij je een ruim databundel hebt.",
        },
      ],
    },
    {
      title: "Kosten & Abonnementen",
      icon: <Sparkles className="w-6 h-6 text-orange" />,
      questions: [
        {
          question: "Is BewaardVoorJou.nl gratis?",
          answer:
            "Op dit moment is BewaardVoorJou.nl volledig gratis tijdens de lanceeringsfase. Je kunt alle 30 hoofdstukken opnemen, transcripties krijgen, delen met familie, en je verhalen veilig bewaren zonder te betalen. In de toekomst introduceren we mogelijk premium functies zoals onbeperkte opslag, fysieke boeken, of familie-abonnementen, maar de kernfunctionaliteit blijft altijd gratis toegankelijk.",
        },
        {
          question: "Welke betaalopties komen er in de toekomst?",
          answer:
            "We werken aan verschillende opties: (1) Gratis Tier: 30 hoofdstukken, standaard opslag, basis delen (altijd beschikbaar), (2) Familie Tier: Meerdere familieleden, meer opslag, samenwerkingsfuncties, (3) Legacy Tier: Gegarandeerde permanente opslag, fysiek boek, tijdcapsules, (4) Eeuwig Tier: Eenmalige betaling voor levenslange opslag voor toekomstige generaties. Prijzen en details worden later aangekondigd. Gebruikers die nu gratis starten krijgen een speciale korting wanneer premium functies beschikbaar komen.",
        },
        {
          question: "Kan ik een fysiek boek laten maken van mijn verhaal?",
          answer:
            "Dit is een van onze meest gevraagde functies en komt eraan! Je zult straks je hele levensverhaal kunnen laten omzetten naar een prachtig gedrukt boek met transcripties, foto's, en QR-codes die linken naar video-fragmenten. Print-on-demand betekent dat we per stuk drukken - jij bepaalt hoeveel exemplaren je wilt voor familie. Verwacht deze functie eind 2025.",
        },
        {
          question: "Zijn er extra kosten voor delen met familie?",
          answer:
            "Nee, delen via deellinks is en blijft gratis ongeacht hoeveel mensen je uitnodigt. Ook reacties van familieleden kosten niets extra. Alleen als we in de toekomst geavanceerde samenwerkingsfuncties introduceren (zoals familie-pods met meerdere vertellers) kunnen daar kosten aan verbonden zijn, maar basis delen blijft altijd gratis.",
        },
        {
          question: "Wat gebeurt er met mijn verhalen als ik stop met betalen?",
          answer:
            "Als we in de toekomst betaalde functies introduceren: je verhalen blijven altijd toegankelijk, ook als je terugvalt naar het gratis plan. Je verliest alleen de premium functies (bijv. extra opslag, geavanceerde tools), maar je bestaande opnames blijven behouden. Je kunt ook altijd eerst alles exporteren voordat je downgradet. We geloven niet in 'gijzelen' van je herinneringen.",
        },
      ],
    },
    {
      title: "Account & Ondersteuning",
      icon: <Mail className="w-6 h-6 text-orange" />,
      questions: [
        {
          question: "Hoe maak ik een account aan?",
          answer:
            "Klik op 'Start gratis' op de homepage. Je hebt alleen een e-mailadres en wachtwoord nodig. We vragen ook je naam (of bijnaam die je wilt gebruiken), geboortejaar (optioneel, helpt de AI-context begrijpen), en land. Geen creditcard, geen verplichtingen. Je kunt direct beginnen met je eerste hoofdstuk na registratie.",
        },
        {
          question: "Ik ben niet zo technisch - is dit moeilijk?",
          answer:
            "BewaardVoorJou.nl is ontworpen voor iedereen, ongeacht technische ervaring. Als je dit bericht kunt lezen en een e-mail kunt versturen, kun je onze dienst gebruiken. De interface is zo eenvoudig mogelijk gehouden: grote knoppen, duidelijke instructies, geen technisch jargon. Veel 70+ gebruikers gebruiken het zonder problemen. En je kunt altijd een kind of kleinkind vragen om te helpen bij de eerste opname - daarna gaat het vanzelf.",
        },
        {
          question: "Wat als ik hulp nodig heb of een vraag heb?",
          answer:
            "Je kunt ons altijd bereiken via info@bewaardvoorjou.nl. We reageren meestal binnen 24 uur (op werkdagen). Voor veel vragen hebben we ook een uitgebreide handleiding in je account onder 'Hulp'. In de toekomst komt er live chat-ondersteuning. We helpen graag - van technische problemen tot advies over welke verhalen het meest waardevol zijn om vast te leggen.",
        },
        {
          question: "Kan ik mijn wachtwoord wijzigen of account herstellen?",
          answer:
            "Ja, via 'Instellingen' in je account kun je je wachtwoord wijzigen. Als je je wachtwoord vergeten bent, kun je via de inlogpagina een herstellink aanvragen die naar je e-mail gestuurd wordt. Zorg dat je altijd een e-mailadres gebruikt dat je regelmatig controleert en niet verliest - dit is je toegang tot je verhalen.",
        },
        {
          question: "Mijn vraag staat er niet tussen - wat nu?",
          answer:
            "Stuur ons een e-mail op info@bewaardvoorjou.nl met je vraag. We helpen graag! En je helpt ons ook: elke vraag die we krijgen voegen we toe aan deze FAQ zodat anderen er ook baat bij hebben. Geen vraag is te simpel of te ingewikkeld - we zijn er om je te helpen je verhaal vast te leggen.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-neutral-sand shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/Logo_Bewaardvoorjou.png"
              alt="BewaardVoorJou.nl Logo"
              width={40}
              height={40}
              className="w-10 h-10"
              priority
            />
            <div className="flex flex-col">
              <span className="text-xl font-serif font-semibold text-slate-900 leading-tight">
                BewaardVoorJou.nl
              </span>
              <span className="text-xs text-slate-600 hidden sm:block">
                Vertel het vandaag, bewaar het voor altijd
              </span>
            </div>
          </Link>
          <Link
            href="/register"
            className="bg-orange hover:bg-orange/90 text-white px-6 py-2.5 rounded-full font-medium transition-colors"
          >
            Start gratis
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange/10 via-warm-amber/5 to-cream py-16 md:py-20">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-6">
            Veelgestelde vragen
          </h1>
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed">
            Alles wat je wilt weten over BewaardVoorJou.nl - van privacy tot
            techniek, van delen tot nalatenschap. Staat je vraag er niet tussen?
            <br />
            <a
              href="mailto:info@bewaardvoorjou.nl"
              className="text-orange hover:text-orange/80 font-medium underline"
            >
              Stuur ons een e-mail
            </a>
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          {faqCategories.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="mb-16 last:mb-0"
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-8">
                {category.icon}
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">
                  {category.title}
                </h2>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {category.questions.map((item, questionIndex) => {
                  const itemId = `${categoryIndex}-${questionIndex}`;
                  const isOpen = openItems.includes(itemId);

                  return (
                    <div
                      key={itemId}
                      className="bg-white rounded-2xl border border-neutral-sand overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-warm-amber/5 transition-colors"
                      >
                        <span className="text-lg font-semibold text-slate-900 pr-4">
                          {item.question}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-orange flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="px-6 pb-5 text-slate-700 leading-relaxed">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-orange via-warm-amber to-orange/90">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
            Klaar om je verhaal vast te leggen?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
            Je eerste hoofdstuk duurt maar 10 minuten. Begin vandaag en maak
            iets onvervangbaars voor toekomstige generaties.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white hover:bg-cream text-orange px-8 py-4 rounded-full font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Start gratis - Geen creditcard nodig
            </Link>
            <a
              href="mailto:info@bewaardvoorjou.nl"
              className="bg-orange/20 hover:bg-orange/30 text-white border-2 border-white px-8 py-4 rounded-full font-semibold text-lg transition-colors"
            >
              Stel een vraag
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo & Tagline */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/Logo_Bewaardvoorjou.png"
                  alt="BewaardVoorJou.nl"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <div className="flex flex-col">
                  <span className="font-serif font-semibold text-white">
                    BewaardVoorJou.nl
                  </span>
                  <span className="text-xs text-slate-400">
                    Vertel het vandaag,
                    <br />
                    bewaar het voor altijd
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Leg je levensverhaal vast met een empathische AI-interviewer.
                Veilig, privé, en voor altijd bewaard.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    Veelgestelde vragen
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Start gratis
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Inloggen
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">Contact & Ondersteuning</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a
                    href="mailto:info@bewaardvoorjou.nl"
                    className="hover:text-white transition-colors"
                  >
                    info@bewaardvoorjou.nl
                  </a>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacybeleid
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Algemene voorwaarden
                  </Link>
                </li>
                <li className="pt-2 text-xs">
                  Made with ❤️ in the Netherlands
                </li>
              </ul>
            </div>
          </div>

          <div className="max-w-5xl mx-auto mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} BewaardVoorJou.nl. Alle rechten voorbehouden.
          </div>
        </div>
      </footer>
    </div>
  );
}
