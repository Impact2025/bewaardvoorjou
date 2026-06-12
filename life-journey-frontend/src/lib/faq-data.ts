export type FaqCategoryId =
  | "platform"
  | "werkt"
  | "privacy"
  | "delen"
  | "kosten"
  | "technisch"
  | "account";

export interface FaqCategory {
  id: FaqCategoryId;
  /** Lucide-icoonnaam — gemapt naar component in de UI */
  icon: string;
  title: string;
  /** Korte omschrijving voor de helpcentrum-tegels */
  blurb: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: FaqCategoryId;
  keywords: string[];
  /** Tonen in het "Veelgestelde vragen"-blok van het helpcentrum */
  popular?: boolean;
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "platform",
    icon: "BookOpen",
    title: "Over het platform",
    blurb: "Wat het is, voor wie en waarom",
  },
  {
    id: "werkt",
    icon: "PlayCircle",
    title: "Hoe het werkt",
    blurb: "Opnemen, de AI-interviewer en transcriptie",
  },
  {
    id: "privacy",
    icon: "Shield",
    title: "Privacy & veiligheid",
    blurb: "Beveiliging, GDPR en wie je verhalen ziet",
  },
  {
    id: "delen",
    icon: "Users",
    title: "Delen & familie",
    blurb: "Familieleden uitnodigen en samen bewaren",
  },
  {
    id: "kosten",
    icon: "CreditCard",
    title: "Kosten & abonnement",
    blurb: "Pakketten, prijzen en opzeggen",
  },
  {
    id: "technisch",
    icon: "Smartphone",
    title: "Techniek & apparaten",
    blurb: "Microfoon, opslag en opnameproblemen",
  },
  {
    id: "account",
    icon: "User",
    title: "Account & inloggen",
    blurb: "Aanmelden, wachtwoord en e-mail",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  /* ── Over het platform ── */
  {
    id: "wat-is-bvj",
    question: "Wat is BewaardVoorJou.nl precies?",
    answer:
      "BewaardVoorJou.nl is een digitaal platform waarmee je jouw levensverhaal op een gestructureerde, empathische manier vastlegt voor toekomstige generaties. Onze AI-interviewer begeleidt je door 58 hoofdstukken die samen jouw unieke leven vertellen — van je kinderjaren tot je grootste levenslessen. Het resultaat is een veilig bewaard digitaal erfgoed dat je kunt delen met familie of later kunt doorgeven als nalatenschap.",
    category: "platform",
    keywords: ["wat is", "platform", "uitleg", "informatie", "levensverhaal", "wat doet"],
    popular: true,
  },
  {
    id: "voor-wie",
    question: "Voor wie is deze dienst bedoeld?",
    answer:
      "BewaardVoorJou.nl is voor iedereen die zijn of haar levensverhaal wil bewaren — of je nu 35 bent of 85. Veel gebruikers zijn senioren die hun levenswijsheid willen doorgeven aan kinderen en kleinkinderen, maar ook jongere mensen die hun verhaal willen documenteren voordat details vervagen.",
    category: "platform",
    keywords: ["doelgroep", "leeftijd", "voor wie", "senioren", "ouderen", "kinderen"],
  },
  {
    id: "waarom-vs-filmpjes",
    question: "Waarom dit gebruiken in plaats van zelf filmpjes opnemen?",
    answer:
      "Zelf opnemen kan natuurlijk, maar de meeste mensen weten niet waar ze moeten beginnen of hoe ze alles gestructureerd bewaren. BewaardVoorJou.nl biedt een empathische AI-interviewer die de juiste vragen stelt, een gestructureerde aanpak via zorgvuldig samengestelde hoofdstukken, automatische transcriptie, veilige opslag met back-up, en de mogelijkheid om later te delen of door te geven als nalatenschap. Het verschil tussen losse fragmenten en een compleet, georganiseerd levensverhaal.",
    category: "platform",
    keywords: ["waarom", "verschil", "zelf opnemen", "filmpjes", "voordeel"],
  },
  {
    id: "tijdsduur",
    question: "Hoeveel tijd kost het om mijn verhaal vast te leggen?",
    answer:
      "Dat bepaal je helemaal zelf. Elk hoofdstuk duurt ongeveer 10–20 minuten, maar je kunt zo lang of kort antwoorden als je wilt. Sommige gebruikers doen een paar hoofdstukken per week, anderen nemen er rustig maanden voor. Je kunt altijd pauzeren en later verdergaan. Een volledig verhaal (alle 58 hoofdstukken) neemt gemiddeld 6–10 uur opnametijd, verspreid over weken of maanden.",
    category: "platform",
    keywords: ["tijd", "duur", "hoelang", "hoeveel tijd", "snel"],
  },
  {
    id: "nederlandse-dienst",
    question: "Is BewaardVoorJou.nl een Nederlandse dienst?",
    answer:
      "Ja, BewaardVoorJou.nl is volledig ontwikkeld in Nederland. Onze servers staan in Europa, we voldoen aan de Europese privacywetgeving (GDPR), en onze AI-interviewer spreekt natuurlijk Nederlands met begrip voor de Nederlandse cultuur en geschiedenis.",
    category: "platform",
    keywords: ["nederlands", "nederland", "europa", "taal", "servers"],
  },

  /* ── Hoe het werkt ── */
  {
    id: "ai-interviewer",
    question: "Hoe werkt de AI-interviewer precies?",
    answer:
      "Onze AI-interviewer is getraind om empathisch en respectvol door te vragen, net als een goede gesprekspartner. Het systeem stelt een open vraag over een hoofdstuk, luistert naar je antwoord via opname, analyseert wat je zegt en stelt relevante vervolgvragen. De AI past zich aan jouw tempo en stijl aan, oordeelt nooit, haast nooit en respecteert stiltes. Het voelt als een waardig gesprek, niet als een vragenlijst.",
    category: "werkt",
    keywords: ["ai", "interviewer", "vragen", "gesprek", "hoe werkt"],
    popular: true,
  },
  {
    id: "opname-starten",
    question: "Hoe start ik een opname?",
    answer:
      "Ga naar 'Hoofdstukken' in je dashboard, kies een hoofdstuk en klik op 'Start opname'. De AI-interviewer stelt je vragen en je beantwoordt die via je microfoon of camera. Je browser vraagt eenmalig om toestemming voor microfoon (en camera bij video).",
    category: "werkt",
    keywords: ["opname", "starten", "opnemen", "beginnen", "interview", "hoe start"],
  },
  {
    id: "alle-hoofdstukken",
    question: "Moet ik alle 58 hoofdstukken doen?",
    answer:
      "Nee, je bepaalt zelf. De 58 hoofdstukken bieden een complete structuur — van je kinderjaren tot je levensfilosofie — maar je kiest welke voor jou belangrijk zijn. Je kunt hoofdstukken overslaan die niet relevant zijn, of alleen de hoofdstukken doen die je graag wilt delen. Ook de volgorde is vrij; er is geen dwang.",
    category: "werkt",
    keywords: ["hoofdstukken", "alle", "58", "verplicht", "overslaan", "volgorde"],
  },
  {
    id: "onderwerpen-hoofdstukken",
    question: "Welke onderwerpen komen aan bod in de hoofdstukken?",
    answer:
      "De hoofdstukken dekken je hele leven: jeugd en kindertijd, school en eerste vriendschappen, carrière, relaties en ouderschap, geloof en cultuur, moeilijke keuzes, en nalatenschap zoals levenswijsheid en berichten voor naasten. Daarnaast zijn er verdiepende bonusvragen over onverwachte herinneringen, dromen en ambities. Elk hoofdstuk is ontworpen om authentieke, betekenisvolle verhalen naar boven te halen.",
    category: "werkt",
    keywords: ["onderwerpen", "thema", "hoofdstukken", "vragen", "inhoud", "fases"],
  },
  {
    id: "opnieuw-opnemen",
    question: "Kan ik opnames opnieuw doen als ik niet tevreden ben?",
    answer:
      "Ja, absoluut. Je kunt elk hoofdstuk opnieuw opnemen zo vaak als je wilt. De vorige opname wordt vervangen (tenzij je hem eerst downloadt). Zo kun je vrij experimenteren — denk je halverwege 'dit kan beter', begin dan gewoon opnieuw. Er is geen limiet aan het aantal pogingen.",
    category: "werkt",
    keywords: ["opnieuw", "overdoen", "opnieuw opnemen", "fout", "ontevreden"],
  },
  {
    id: "bewerken",
    question: "Kan ik opnames bewerken na het opnemen?",
    answer:
      "Op dit moment kun je hele hoofdstukken opnieuw opnemen, maar opnames niet knippen of monteren. Dat is een bewuste keuze: we willen de authenticiteit en spontaniteit behouden. Juist de ongepolijste momenten maken een levensverhaal echt. We overwegen basisbewerkingstools voor de toekomst als daar vraag naar is.",
    category: "werkt",
    keywords: ["bewerken", "monteren", "knippen", "aanpassen", "editen"],
  },
  {
    id: "transcriptie",
    question: "Hoe werkt de transcriptie?",
    answer:
      "Na elke opname zetten we je audio automatisch om naar tekst met geavanceerde spraakherkenning (Whisper AI). Dat gebeurt binnen enkele minuten. De transcriptie verschijnt onder je opname en is doorzoekbaar, zodat familie later specifieke verhalen kan terugvinden zonder alles te bekijken. Transcripties zijn niet 100% perfect bij dialect of achtergrondgeluid, maar meestal zeer accuraat.",
    category: "werkt",
    keywords: ["transcriptie", "tekst", "uitgeschreven", "whisper", "ondertiteling"],
  },
  {
    id: "highlights",
    question: "Wat zijn 'emotionele highlights'?",
    answer:
      "Onze AI detecteert automatisch bijzondere momenten in je verhalen: humor (lachen), inzicht (aha-momenten), liefde (warmte en verbondenheid) en wijsheid (levenslessen). Deze highlights krijgen een label en zijn makkelijk terug te vinden, zodat familie snel de meest betekenisvolle fragmenten ontdekt.",
    category: "werkt",
    keywords: ["highlights", "emotie", "momenten", "fragmenten", "hoogtepunten"],
  },
  {
    id: "alleen-audio",
    question: "Kan ik ook alleen audio opnemen, zonder video?",
    answer:
      "Ja. Je kunt kiezen tussen video, alleen audio, of zelfs getypte tekst. Sommigen voelen zich comfortabeler zonder camera, anderen willen juist gezichtsuitdrukkingen vastleggen. Je kunt ook per hoofdstuk wisselen — bijvoorbeeld video voor persoonlijke verhalen en audio voor gevoelige onderwerpen.",
    category: "werkt",
    keywords: ["audio", "geen video", "zonder camera", "alleen geluid", "typen"],
  },
  {
    id: "export",
    question: "Kan ik mijn verhalen exporteren of downloaden?",
    answer:
      "Ja. Via 'Instellingen' vraag je een volledige export aan van al je data (opnames, transcripties, notities) — je ontvangt een downloadlink per e-mail. Opnames krijg je als MP4 (video) of MP3 (audio), transcripties als PDF of TXT. Dit voldoet aan je recht op dataportabiliteit onder de GDPR.",
    category: "werkt",
    keywords: ["exporteren", "download", "backup", "kopie", "opslaan", "downloaden"],
  },

  /* ── Privacy & veiligheid ── */
  {
    id: "veiligheid",
    question: "Hoe veilig zijn mijn opnames en persoonlijke verhalen?",
    answer:
      "Jouw privacy is onze hoogste prioriteit. Alle data wordt versleuteld opgeslagen met bank-level encryptie (AES-256), zowel tijdens verzending als opslag. Alleen jij hebt toegang tot je verhalen, tenzij je expliciet kiest om ze te delen. We maken regelmatig back-ups, onze servers staan in Europa en voldoen aan de strenge GDPR-wetgeving.",
    category: "privacy",
    keywords: ["veilig", "veiligheid", "privacy", "encryptie", "beveiligd", "gdpr", "beveiliging"],
    popular: true,
  },
  {
    id: "wie-ziet",
    question: "Wie kan mijn verhalen zien?",
    answer:
      "Standaard ben alleen jij de eigenaar en kan alleen jij je opnames bekijken. Je kunt ervoor kiezen specifieke hoofdstukken of je hele verhaal te delen met familie via een veilige deellink. Je hebt volledige controle: toegang kun je op elk moment intrekken, je kunt verloopdata instellen en kiezen wie wat ziet. We verkopen je data nooit aan derden.",
    category: "privacy",
    keywords: ["wie ziet", "toegang", "zichtbaar", "privé", "prive", "eigenaar"],
  },
  {
    id: "overlijden",
    question: "Wat gebeurt er met mijn data als ik overlijd?",
    answer:
      "BewaardVoorJou.nl heeft een speciale Legacy Planning-functie. Je kunt vertrouwde contactpersonen aanwijzen die na je overlijden toegang krijgen, een 'dead man's switch' instellen die automatisch toegang geeft na een periode van inactiviteit, en tijdcapsules maken die pas na een bepaalde datum geopend worden (bijvoorbeeld voor kleinkinderen die dan 18 zijn). Jij bepaalt wat er met je verhalen gebeurt.",
    category: "privacy",
    keywords: ["overlijden", "dood", "nalatenschap", "legacy", "erfgenaam", "tijdcapsule"],
  },
  {
    id: "ai-training",
    question: "Worden mijn opnames gebruikt om AI te trainen?",
    answer:
      "Nee, absoluut niet. Jouw persoonlijke verhalen worden uitsluitend gebruikt voor de diensten die wij je bieden (transcriptie, highlights, zoekfunctie). We gebruiken je opnames niet om AI-modellen te trainen en delen ze daarvoor niet met AI-leveranciers. De AI-interviewer die je begeleidt heeft geen toegang tot verhalen van andere gebruikers.",
    category: "privacy",
    keywords: ["ai training", "trainen", "model", "data gebruik", "ai", "delen met derden"],
  },
  {
    id: "data-verwijderen",
    question: "Kan ik mijn data verwijderen?",
    answer:
      "Ja, je hebt volledige controle. Je kunt op elk moment individuele opnames verwijderen, je hele account met alle data permanent verwijderen, of al je data eerst exporteren. Dit is gratis en voldoet aan je recht op vergetelheid onder de GDPR.",
    category: "privacy",
    keywords: ["verwijderen", "wissen", "account verwijderen", "data wissen", "vergetelheid"],
    popular: true,
  },
  {
    id: "bewaartermijn",
    question: "Hoe lang blijven mijn verhalen bewaard?",
    answer:
      "Je verhalen blijven bewaard zolang je account actief is. Voor gratis accounts betekent dit zolang je minimaal eens per jaar inlogt; bij betaalde pakketten garanderen we langdurige tot levenslange opslag. We waarschuwen je ruim van tevoren als een account dreigt te worden verwijderd wegens inactiviteit, en je kunt altijd eerst je data exporteren.",
    category: "privacy",
    keywords: ["bewaren", "bewaartermijn", "hoe lang", "opslag duur", "verlopen"],
  },

  /* ── Delen & familie ── */
  {
    id: "delen-familie",
    question: "Hoe kan ik mijn verhalen delen met familie?",
    answer:
      "Je genereert per hoofdstuk of voor je hele verhaal een veilige deellink, die je via e-mail of WhatsApp verstuurt. Je bepaalt wie toegang heeft (alleen met link of specifieke e-mailadressen), hoe lang de link geldig is, en of mensen mogen reageren. Toegang kun je op elk moment intrekken.",
    category: "delen",
    keywords: ["delen", "familie", "deellink", "link", "versturen", "tonen"],
  },
  {
    id: "family-toevoegen",
    question: "Hoe voeg ik familieleden toe?",
    answer:
      "Ga naar 'Familie' in je dashboard, klik op 'Familielid uitnodigen', voer hun e-mailadres in en stel in welke verhalen ze mogen zien. Ze ontvangen een uitnodigingsmail om toegang te krijgen.",
    category: "delen",
    keywords: ["familie toevoegen", "uitnodigen", "familielid", "toegang geven", "kinderen", "kleinkinderen"],
  },
  {
    id: "reageren",
    question: "Kunnen familieleden reageren op mijn verhalen?",
    answer:
      "Ja, als je dat toestaat kunnen familieleden met toegang reacties en eigen herinneringen toevoegen. Zo ontstaat een dialoog — een kleinzoon die reageert op opa's oorlogsverhaal, of een zus die een vergeten detail aanvult. Het wordt een levend familiearchief. Je kunt deze functie ook uitschakelen.",
    category: "delen",
    keywords: ["reageren", "reacties", "commentaar", "aanvullen", "familie"],
  },
  {
    id: "prive-houden",
    question: "Wat als ik sommige verhalen privé wil houden?",
    answer:
      "Elk hoofdstuk heeft individuele privacy-instellingen. Je kunt bijvoorbeeld veel hoofdstukken met de hele familie delen, een paar gevoelige hoofdstukken alleen voor jezelf houden, en enkele specifieke hoofdstukken alleen met je partner delen. Je hebt volledige granulaire controle — niet alles of niets.",
    category: "delen",
    keywords: ["privé", "prive", "geheim", "afschermen", "niet delen", "verbergen"],
  },
  {
    id: "samen-opnemen",
    question: "Kunnen familieleden mij helpen met opnemen?",
    answer:
      "Absoluut. Veel gebruikers nemen samen op met een kind, kleinkind of partner die helpt met de techniek of aanmoedigt. Je kunt iemand naast je hebben tijdens het interview — de AI merkt niet wie praat, dus jullie voeren het gesprek samen. Sommige families maken er een gezellig ritueel van: elke zondag een hoofdstuk met koffie en gebak.",
    category: "delen",
    keywords: ["samen", "helpen", "samen opnemen", "kleinkind", "partner", "begeleiden"],
  },

  /* ── Kosten & abonnement ── */
  {
    id: "kosten",
    question: "Is BewaardVoorJou.nl gratis?",
    answer:
      "Je start gratis: maak een account zonder creditcard en leg je eerste 3 hoofdstukken vast, 30 dagen lang. Daarna blijven je verhalen altijd leesbaar en deelbaar. Wil je je hele levensverhaal (alle 58 hoofdstukken) opnemen, dan kies je een pakket: Verhaal (€79), Erfgoed (€149, inclusief de fysieke herinneringsdoos) of Nalatenschap (€229 eenmalig, met levenslange toegang).",
    category: "kosten",
    keywords: ["gratis", "kosten", "prijs", "betalen", "abonnement", "premium", "wat kost"],
    popular: true,
  },
  {
    id: "pakketten",
    question: "Welke pakketten zijn er?",
    answer:
      "Naast gratis starten zijn er drie pakketten. Verhaal (€79): alle 58 hoofdstukken, digitaal archief en deellinks, 5 jaar toegang. Erfgoed (€149): alles van Verhaal plus de fysieke Erfgoed Box en meelezen voor maximaal 5 familieleden. Nalatenschap (€229 eenmalig): levenslange toegang, jaarlijkse USB-back-up en boek-credits. De eerste 100 betalende klanten krijgen Founding Member-status.",
    category: "kosten",
    keywords: ["pakketten", "prijzen", "verhaal", "erfgoed", "nalatenschap", "tarieven"],
  },
  {
    id: "fysiek-boek",
    question: "Kan ik een fysiek boek laten maken van mijn verhaal?",
    answer:
      "Dit is een van onze meest gevraagde functies en komt eraan. Je zult je hele levensverhaal kunnen laten omzetten naar een gedrukt boek met transcripties, foto's en QR-codes die linken naar video-fragmenten. Print-on-demand betekent dat we per stuk drukken. Het Nalatenschap-pakket bevat alvast 2 boek-credits, in te wisselen zodra de printfunctie live is.",
    category: "kosten",
    keywords: ["boek", "fysiek", "gedrukt", "print", "papier", "drukken"],
  },
  {
    id: "kosten-delen",
    question: "Zijn er extra kosten voor delen met familie?",
    answer:
      "Nee, delen via deellinks is en blijft gratis, ongeacht hoeveel mensen je uitnodigt. Ook reacties van familieleden kosten niets extra. Alleen toekomstige geavanceerde samenwerkingsfuncties (zoals familie-pods met meerdere vertellers) kunnen kosten met zich meebrengen, maar basis delen blijft altijd gratis.",
    category: "kosten",
    keywords: ["kosten delen", "gratis delen", "familie kosten", "extra kosten"],
  },
  {
    id: "stoppen-betalen",
    question: "Wat gebeurt er met mijn verhalen als ik stop met betalen?",
    answer:
      "Je verhalen blijven altijd leesbaar en deelbaar, ook na afloop van een pakket. Bij Verhaal en Erfgoed kun je geen nieuwe opnames toevoegen of bewerken tot je verlengt; we sturen 30 dagen van tevoren een herinnering. Bij Nalatenschap betaal je eenmalig en houd je levenslang toegang. Je kunt bovendien altijd alles exporteren — we geloven niet in het 'gijzelen' van herinneringen.",
    category: "kosten",
    keywords: ["stoppen", "stoppen met betalen", "verlopen", "niet verlengen", "afloop"],
  },
  {
    id: "abonnement-opzeggen",
    question: "Hoe zeg ik mijn abonnement op?",
    answer:
      "Ga naar 'Instellingen' en klik op 'Abonnement beheren'. Daar kun je per direct of aan het einde van de betaalperiode opzeggen. Je behoudt altijd toegang tot al je opgeslagen verhalen.",
    category: "kosten",
    keywords: ["opzeggen", "annuleren", "stoppen", "opzegging", "abonnement beheren"],
  },

  /* ── Techniek & apparaten ── */
  {
    id: "apparaten",
    question: "Welke apparaten kan ik gebruiken?",
    answer:
      "BewaardVoorJou.nl werkt op elke moderne browser: Chrome, Safari, Firefox, Edge. Je kunt het gebruiken op computer (Windows, Mac, Linux), tablet (iPad, Android) en smartphone (iPhone, Android). We raden een tablet of computer aan voor comfort bij langere opnames, maar alles werkt ook op je telefoon. Geen app-installatie nodig.",
    category: "technisch",
    keywords: ["apparaten", "computer", "laptop", "browser", "welke apparaten"],
  },
  {
    id: "tablet-telefoon",
    question: "Werkt het op mijn tablet of telefoon?",
    answer:
      "Ja. BewaardVoorJou.nl werkt op elke moderne browser — Chrome, Safari, Firefox, Edge — op tablet, telefoon én computer. Er is geen app-installatie nodig.",
    category: "technisch",
    keywords: ["tablet", "telefoon", "mobiel", "ipad", "iphone", "android", "app"],
    popular: true,
  },
  {
    id: "microfoon",
    question: "Mijn microfoon werkt niet, wat kan ik doen?",
    answer:
      "Zorg dat je browser toestemming heeft voor de microfoon: klik op het slotje naast de URL-balk en zet microfoon op 'Toestaan'. Ververs daarna de pagina. Werkt het dan nog niet, probeer dan Chrome of Firefox, of een ander apparaat. Komt het probleem terug, neem dan contact op.",
    category: "technisch",
    keywords: ["microfoon", "geluid", "mic", "opname werkt niet", "toestemming", "geen geluid"],
  },
  {
    id: "camera-microfoon-nodig",
    question: "Heb ik een goede camera of microfoon nodig?",
    answer:
      "Nee, de ingebouwde camera en microfoon van je apparaat zijn prima — moderne telefoons en laptops hebben verrassend goede kwaliteit. Tips: zit in een rustige ruimte, zorg voor licht vóór je (niet achter je) en zit dichtbij genoeg om goed verstaanbaar te zijn. Je stem en verhaal zijn belangrijker dan perfecte productiekwaliteit.",
    category: "technisch",
    keywords: ["camera", "microfoon nodig", "apparatuur", "kwaliteit", "webcam"],
  },
  {
    id: "opslag",
    question: "Hoeveel opslagruimte krijg ik?",
    answer:
      "Zowel tijdens je gratis proefperiode als met elk betaald pakket krijg je ruim voldoende opslag voor al je hoofdstukken in standaard kwaliteit. Een video-opname van 15 minuten neemt ongeveer 300–500 MB in beslag; een audio-opname is veel lichter (15–30 MB). We waarschuwen je ruim op tijd als je tegen een limiet aanloopt.",
    category: "technisch",
    keywords: ["opslag", "opslagruimte", "ruimte", "geheugen", "limiet", "gb"],
  },
  {
    id: "internet-wegvalt",
    question: "Wat als mijn internetverbinding wegvalt tijdens opnemen?",
    answer:
      "Je opname wordt lokaal op je apparaat opgeslagen terwijl je opneemt. Valt je internet weg, dan kun je de opname gewoon afmaken en uploaden zodra je weer verbinding hebt. We raden aan op te nemen met WiFi in plaats van mobiele data, vooral voor video.",
    category: "technisch",
    keywords: ["internet", "verbinding", "wifi", "wegvallen", "offline opnemen", "uploaden"],
  },
  {
    id: "opname-kwijt",
    question: "Mijn opname is niet opgeslagen, wat nu?",
    answer:
      "Controleer je internetverbinding tijdens het opnemen — een onderbroken verbinding kan opslaan voorkomen. Kijk in 'Mijn Opnames' of de opname daar staat. Als de opname echt weg is, neem dan contact op; we kijken graag met je mee.",
    category: "technisch",
    keywords: ["opname kwijt", "verloren", "niet opgeslagen", "weg", "verdwenen"],
  },
  {
    id: "formaten",
    question: "In welke formaten kan ik mijn verhalen downloaden?",
    answer:
      "Je downloadt opnames als MP4 (video, universeel afspeelbaar) of MP3 (audio), en transcripties als PDF of TXT. Je kunt ook je hele verhaal in één keer exporteren als ZIP. Deze standaardformaten blijven decennialang toegankelijk, ongeacht of BewaardVoorJou.nl blijft bestaan.",
    category: "technisch",
    keywords: ["formaten", "mp4", "mp3", "pdf", "bestandstype", "download formaat"],
  },
  {
    id: "ai-offline",
    question: "Werkt de AI ook offline?",
    answer:
      "Nee, de AI-interviewer vereist internet omdat de analyse en transcriptie in de cloud gebeuren. Je kunt wel offline opnemen — de opname blijft lokaal opgeslagen — en later uploaden zodra je online bent. Een volledige offline modus staat op onze roadmap.",
    category: "technisch",
    keywords: ["offline", "zonder internet", "ai offline", "internet nodig"],
  },

  /* ── Account & inloggen ── */
  {
    id: "account-aanmaken",
    question: "Hoe maak ik een account aan?",
    answer:
      "Klik op 'Start gratis' op de homepage. Je hebt alleen een e-mailadres en wachtwoord nodig. We vragen ook je naam (of bijnaam) en optioneel je geboortejaar en land, zodat de AI context begrijpt. Geen creditcard, geen verplichtingen — je kunt direct beginnen met je eerste hoofdstuk.",
    category: "account",
    keywords: ["account aanmaken", "registreren", "aanmelden", "starten", "inschrijven"],
  },
  {
    id: "wachtwoord",
    question: "Ik ben mijn wachtwoord vergeten, wat nu?",
    answer:
      "Ga naar de inlogpagina en klik op 'Wachtwoord vergeten'. Je ontvangt een e-mail met een link om een nieuw wachtwoord in te stellen. Controleer ook je spammap als de e-mail niet aankomt.",
    category: "account",
    keywords: ["wachtwoord", "vergeten", "wachtwoord reset", "herstellen", "nieuw wachtwoord"],
    popular: true,
  },
  {
    id: "inloggen-probleem",
    question: "Ik kan niet inloggen, wat moet ik doen?",
    answer:
      "Controleer of je het juiste e-mailadres gebruikt en probeer 'Wachtwoord vergeten' als je het wachtwoord niet meer weet. Houdt het probleem aan, neem dan contact met ons op — we helpen je snel verder.",
    category: "account",
    keywords: ["inloggen", "login probleem", "kan niet inloggen", "inlogprobleem", "aanmelden"],
  },
  {
    id: "wachtwoord-wijzigen",
    question: "Kan ik mijn wachtwoord wijzigen?",
    answer:
      "Ja, via 'Instellingen' in je account kun je je wachtwoord wijzigen. Gebruik altijd een e-mailadres dat je regelmatig controleert en niet kwijtraakt — dat is je toegang tot je verhalen.",
    category: "account",
    keywords: ["wachtwoord wijzigen", "veranderen", "aanpassen", "nieuw wachtwoord instellen"],
  },
  {
    id: "email-niet-ontvangen",
    question: "Ik heb geen bevestigingsmail ontvangen",
    answer:
      "Controleer je spammap of map met ongewenste e-mail. Is de mail er niet, vraag dan vanaf de inlogpagina een nieuwe verificatiemail aan. Voeg info@bewaardvoorjou.nl toe aan je contacten om e-mails zeker te ontvangen.",
    category: "account",
    keywords: ["email", "mail", "bevestiging", "verificatie", "niet ontvangen", "spam"],
  },
  {
    id: "niet-technisch",
    question: "Ik ben niet zo technisch — is dit moeilijk?",
    answer:
      "BewaardVoorJou.nl is ontworpen voor iedereen, ongeacht technische ervaring. Kun je dit lezen en een e-mail versturen, dan kun je onze dienst gebruiken. De interface is bewust eenvoudig: grote knoppen, duidelijke instructies, geen jargon. Veel 70-plussers gebruiken het zonder problemen, en je kunt altijd een kind of kleinkind vragen om te helpen bij de eerste opname.",
    category: "account",
    keywords: ["moeilijk", "technisch", "ingewikkeld", "ouderen", "eenvoudig", "lastig"],
  },
];

const NORMALIZE_MAP: Record<string, string> = { é: "e", ë: "e", ï: "i", ö: "o", ü: "u" };

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[éëïöü]/g, (c) => NORMALIZE_MAP[c] ?? c);
}

export function searchFaq(query: string, maxResults = 6): FaqItem[] {
  if (!query || query.trim().length < 2) return [];

  const q = normalize(query.trim());
  const words = q.split(/\s+/).filter((w) => w.length > 1);

  const scored = FAQ_ITEMS.map((item) => {
    let score = 0;
    const question = normalize(item.question);
    const answer = normalize(item.answer);
    const keywords = item.keywords.map(normalize);
    const haystack = `${question} ${answer} ${keywords.join(" ")}`;

    // Exacte zin-match weegt het zwaarst
    if (haystack.includes(q)) score += 10;
    if (question.includes(q)) score += 6;

    // Losse woorden
    for (const word of words) {
      if (question.includes(word)) score += 4;
      if (keywords.some((k) => k.includes(word))) score += 3;
      if (answer.includes(word)) score += 1;
    }

    return { item, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(({ item }) => item);
}

export function getPopularFaq(max = 6): FaqItem[] {
  return FAQ_ITEMS.filter((i) => i.popular).slice(0, max);
}

export function getFaqByCategory(categoryId: FaqCategoryId): FaqItem[] {
  return FAQ_ITEMS.filter((i) => i.category === categoryId);
}

export function getCategory(id: FaqCategoryId): FaqCategory | undefined {
  return FAQ_CATEGORIES.find((c) => c.id === id);
}
