export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

export const FAQ_ITEMS: FaqItem[] = [
  // Over BewaardVoorJou
  {
    id: "wat-is-bvj",
    question: "Wat is BewaardVoorJou.nl precies?",
    answer: "BewaardVoorJou.nl is een digitaal platform waarmee je jouw levensverhaal op een gestructureerde, empathische manier kunt vastleggen voor toekomstige generaties. Onze AI-interviewer begeleidt je door hoofdstukken die samen jouw unieke leven vertellen.",
    category: "Over het platform",
    keywords: ["wat is", "platform", "werkt", "uitleg", "informatie"],
  },
  {
    id: "voor-wie",
    question: "Voor wie is deze dienst bedoeld?",
    answer: "BewaardVoorJou.nl is voor iedereen die zijn of haar levensverhaal wil bewaren — van 35 tot 85 jaar. Ideaal voor senioren die hun levenswijsheid willen doorgeven aan kinderen of kleinkinderen.",
    category: "Over het platform",
    keywords: ["doelgroep", "leeftijd", "voor wie", "senioren", "ouderen"],
  },
  {
    id: "kosten",
    question: "Is BewaardVoorJou.nl gratis?",
    answer: "Je kunt gratis starten en alle basisfuncties gebruiken. Premium pakketten zijn beschikbaar voor uitgebreide opslag en extra functies zoals familie-toegang en exportopties.",
    category: "Abonnement & betaling",
    keywords: ["gratis", "kosten", "prijs", "betalen", "abonnement", "premium"],
  },
  {
    id: "veiligheid",
    question: "Hoe veilig zijn mijn opnames en persoonlijke verhalen?",
    answer: "Jouw privacy is onze hoogste prioriteit. Alle data wordt versleuteld opgeslagen met bank-level encryptie (AES-256), zowel tijdens verzending als opslag. Alleen jij hebt toegang tot je verhalen. Onze servers staan in Europa en voldoen aan GDPR.",
    category: "Privacy & veiligheid",
    keywords: ["veilig", "veiligheid", "privacy", "encryptie", "beveiligd", "GDPR", "beveiliging"],
  },
  {
    id: "wie-ziet",
    question: "Wie kan mijn verhalen zien?",
    answer: "Standaard ben alleen jij de eigenaar. Je kunt specifieke hoofdstukken of je hele verhaal delen met familieleden via een veilige deellink. Je hebt volledige controle en kunt toegang op elk moment intrekken.",
    category: "Privacy & veiligheid",
    keywords: ["delen", "toegang", "zien", "familie", "prive", "privé"],
  },
  {
    id: "data-verwijderen",
    question: "Kan ik mijn data verwijderen?",
    answer: "Ja, je kunt op elk moment alle opnames en je account permanent verwijderen vanuit de instellingen. Dit is volledig gratis en voldoet aan je rechten onder de GDPR (recht op vergetelheid).",
    category: "Privacy & veiligheid",
    keywords: ["verwijderen", "wissen", "account verwijderen", "data wissen", "opnames verwijderen"],
  },
  {
    id: "wachtwoord",
    question: "Ik ben mijn wachtwoord vergeten, wat nu?",
    answer: "Ga naar de inlogpagina en klik op 'Wachtwoord vergeten'. Je ontvangt dan een e-mail met een link om een nieuw wachtwoord in te stellen. Controleer ook je spammap als de e-mail niet aankomt.",
    category: "Account",
    keywords: ["wachtwoord", "vergeten", "inloggen", "login", "wachtwoord reset", "toegang"],
  },
  {
    id: "inloggen-probleem",
    question: "Ik kan niet inloggen, wat moet ik doen?",
    answer: "Controleer of je het juiste e-mailadres gebruikt. Probeer 'Wachtwoord vergeten' als je het wachtwoord niet meer weet. Als het probleem aanhoudt, neem dan contact met ons op — we helpen je snel verder.",
    category: "Account",
    keywords: ["inloggen", "login probleem", "kan niet inloggen", "inlogprobleem", "wachtwoord"],
  },
  {
    id: "opname-starten",
    question: "Hoe start ik een opname?",
    answer: "Ga naar 'Hoofdstukken' in je dashboard, kies een hoofdstuk en klik op 'Start opname'. De AI-interviewer stelt je vragen en je beantwoordt die via je microfoon. Je browser vraagt eenmalig om microfoontoestemming.",
    category: "Gebruik",
    keywords: ["opname", "starten", "opnemen", "hoe", "microfoon", "beginnen", "interview"],
  },
  {
    id: "microfoon",
    question: "Mijn microfoon werkt niet, wat kan ik doen?",
    answer: "Zorg dat je browser toestemming heeft voor de microfoon: klik op het slotje naast de URL-balk en zet microfoon op 'Toestaan'. Ververs daarna de pagina. Werkt het dan nog niet? Probeer Chrome of Firefox.",
    category: "Technisch",
    keywords: ["microfoon", "geluid", "opname werkt niet", "browser", "toestemming", "technisch"],
  },
  {
    id: "tablet-telefoon",
    question: "Werkt het op mijn tablet of telefoon?",
    answer: "BewaardVoorJou.nl werkt op elke moderne browser — Chrome, Safari, Firefox, Edge. Geen app-installatie nodig. Zowel op tablet, telefoon als computer.",
    category: "Technisch",
    keywords: ["tablet", "telefoon", "mobiel", "ipad", "iphone", "android", "app", "browser"],
  },
  {
    id: "opname-kwijt",
    question: "Mijn opname is niet opgeslagen, wat nu?",
    answer: "Controleer je internetverbinding tijdens het opnemen — een onderbroken verbinding kan opslaan voorkomen. Ga naar 'Mijn Opnames' om te kijken of de opname daar staat. Als de opname echt weg is, neem dan contact op — we kijken mee.",
    category: "Technisch",
    keywords: ["opname kwijt", "verloren", "niet opgeslagen", "weg", "opname verdwenen"],
  },
  {
    id: "abonnement-opzeggen",
    question: "Hoe zeg ik mijn abonnement op?",
    answer: "Ga naar 'Instellingen' en klik op 'Abonnement beheren'. Daar kun je je abonnement per direct of aan het einde van de betaalperiode opzeggen. Je behoudt altijd toegang tot al je opgeslagen verhalen.",
    category: "Abonnement & betaling",
    keywords: ["opzeggen", "abonnement", "annuleren", "stoppen", "opzegging"],
  },
  {
    id: "email-niet-ontvangen",
    question: "Ik heb geen bevestigingsmail ontvangen",
    answer: "Controleer je spammap of ongewenste e-mail. Als de mail er niet is, kun je vanuit de inlogpagina een nieuwe verificatiemail aanvragen. Voeg info@bewaardvoorjou.nl toe aan je contacten om e-mails zeker te ontvangen.",
    category: "Account",
    keywords: ["email", "mail", "bevestiging", "verificatie", "niet ontvangen", "spam"],
  },
  {
    id: "family-toevoegen",
    question: "Hoe voeg ik familieleden toe?",
    answer: "Ga naar 'Familie' in je dashboard. Klik op 'Familielid uitnodigen', voer hun e-mailadres in en stel in welke verhalen ze mogen zien. Ze ontvangen een uitnodigingsmail om toegang te krijgen.",
    category: "Familie & delen",
    keywords: ["familie", "familielid", "uitnodigen", "delen", "toegang geven", "kinderen", "kleinkinderen"],
  },
  {
    id: "export",
    question: "Kan ik mijn verhalen exporteren?",
    answer: "Ja, via 'Instellingen' kun je een volledige export aanvragen van al je data (opnames, transcripties, notities). Je ontvangt een downloadlink per e-mail. Dit voldoet aan je recht op dataportabiliteit onder de GDPR.",
    category: "Gebruik",
    keywords: ["exporteren", "download", "backup", "data exporteren", "kopie"],
  },
];

export function searchFaq(query: string, maxResults = 3): FaqItem[] {
  if (!query || query.trim().length < 3) return [];

  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter((w) => w.length > 2);

  const scored = FAQ_ITEMS.map((item) => {
    let score = 0;
    const haystack = `${item.question} ${item.answer} ${item.keywords.join(" ")}`.toLowerCase();

    // Exacte zin match
    if (haystack.includes(q)) score += 10;

    // Woord matches
    for (const word of words) {
      if (item.question.toLowerCase().includes(word)) score += 4;
      if (item.keywords.some((k) => k.toLowerCase().includes(word))) score += 3;
      if (item.answer.toLowerCase().includes(word)) score += 1;
    }

    return { item, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(({ item }) => item);
}
