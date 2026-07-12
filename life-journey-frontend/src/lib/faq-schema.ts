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
 * Zoekt de kop "Veelgestelde vragen" en pakt de daaropvolgende
 * vraag/antwoord-paren (h3 gevolgd door de eerste alinea) tot de volgende h2.
 */
export function extractFaqFromHtml(html: string): FaqItem[] {
  if (!html) return [];
  const headingMatch = html.match(/<h2[^>]*>\s*Veelgestelde vragen\s*<\/h2>/i);
  if (!headingMatch || headingMatch.index === undefined) return [];

  const afterHeading = html.slice(headingMatch.index + headingMatch[0].length);
  const nextH2 = afterHeading.search(/<h2[^>]*>/i);
  const block = nextH2 === -1 ? afterHeading : afterHeading.slice(0, nextH2);

  const re = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  const items: FaqItem[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) {
    const question = stripTags(m[1]);
    const answer = stripTags(m[2]);
    if (question && answer) items.push({ question, answer });
  }
  return items;
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
