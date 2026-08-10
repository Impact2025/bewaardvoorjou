/**
 * Haalt een "Veelgestelde vragen"-sectie uit artikel-HTML en bouwt daar
 * FAQPage-structured-data van. Zo komen blog- en kennisbankartikelen in
 * aanmerking voor FAQ-rich-results en AI-antwoorden.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * De redactie schrijft FAQ-koppen met een onderwerp erachter ("Veelgestelde
 * vragen over levensverhaal vastleggen"). Een exacte match op "Veelgestelde
 * vragen" liet daardoor 9 van de 12 recente artikelen zonder schema staan,
 * dus matchen we op de aanhef en negeren we wat erachter komt.
 */
const FAQ_HEADING_RE = /<h2[^>]*>\s*Veelgestelde vragen\b[^<]*<\/h2>/i;

/**
 * Drie markup-patronen komen in de praktijk voor: de TipTap-editor levert
 * koppen (h3), en de contentscripts leveren een vetgedrukte vraag die ofwel
 * met een <br> ofwel met een nieuwe alinea van het antwoord wordt gescheiden.
 * Alle drie moeten schema opleveren.
 */
const QA_PATTERNS: RegExp[] = [
  /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi,
  /<p[^>]*>\s*<strong>([\s\S]*?)<\/strong>\s*<br\s*\/?>([\s\S]*?)<\/p>/gi,
  /<p[^>]*>\s*<strong>([\s\S]*?)<\/strong>\s*<\/p>\s*<p[^>]*>([\s\S]*?)<\/p>/gi,
];

/**
 * Zoekt de kop "Veelgestelde vragen" en pakt de daaropvolgende
 * vraag/antwoord-paren tot de volgende h2.
 */
export function extractFaqFromHtml(html: string): FaqItem[] {
  if (!html) return [];
  const headingMatch = html.match(FAQ_HEADING_RE);
  if (!headingMatch || headingMatch.index === undefined) return [];

  const afterHeading = html.slice(headingMatch.index + headingMatch[0].length);
  const nextH2 = afterHeading.search(/<h2[^>]*>/i);
  const block = nextH2 === -1 ? afterHeading : afterHeading.slice(0, nextH2);

  // Op positie sorteren zodat een artikel dat beide patronen mengt de
  // volgorde van de pagina behoudt.
  const found: { at: number; item: FaqItem }[] = [];
  for (const pattern of QA_PATTERNS) {
    pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(block)) !== null) {
      const question = stripTags(m[1]);
      const answer = stripTags(m[2]);
      // Zonder vraagteken is het een tussenkopje ("Extra opties:") en geen
      // vraag — die hoort niet als Question in de structured data.
      if (!question.includes("?") || !answer) continue;
      found.push({ at: m.index, item: { question, answer } });
    }
  }

  found.sort((a, b) => a.at - b.at);

  // Patronen kunnen elkaar overlappen; dezelfde vraag mag maar één keer in
  // de structured data staan, anders keurt Google het geheel af.
  const seen = new Set<string>();
  return found
    .filter(({ item }) => {
      const key = item.question.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((f) => f.item);
}

export function buildFaqPageJsonLd(faqs: FaqItem[]): object | null {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
