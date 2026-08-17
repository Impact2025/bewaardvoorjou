/**
 * Indexeerbaarheid-score voor een gepubliceerd artikel.
 *
 * Wereldklasse-SEO-monitoring zonder black-box: elke post krijgt een score
 * 0-100 op basis van de factoren die Google gebruikt bij "crawled / found but
 * not indexed". De drempels zijn expliciet en testbaar (zie
 * __tests__/indexability.test.ts).
 *
 * Factoren (gewichten sommeren naar 100):
 *  - contentdichtheid (45): >= 900 woorden = vol; < 400 = kritiek dun.
 *  - meta_description (15): aanwezig + >= 70 chars.
 *  - interne inbound links (25): de rotatie-graaf (related-articles.ts)
 *    garandeert >= 2; 0-1 is een regressie die we willen signaleren.
 *  - tags (10): minstens 1 tag → betere taxonomie/clustering.
 *  - views / autoriteitssignaal (5): proxy voor "wördt gelezen"; niet
 *    doorslaggevend maar telt mee.
 *
 * Een post scoort < 60 → "dun / niet-indexeerbaar-risico" en hoort op het
 * verbeterlijstje in /admin/seo.
 */

export interface IndexabilityInput {
  slug: string;
  section: "blog" | "knowledge";
  wordCount: number;
  hasMetaDescription: boolean;
  metaDescriptionLength: number;
  inboundLinks: number;
  hasTags: boolean;
  views: number;
}

export interface IndexabilityScore {
  slug: string;
  section: "blog" | "knowledge";
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  wordCount: number;
  flags: string[];
}

function grade(score: number): IndexabilityScore["grade"] {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}

export function scoreIndexability(input: IndexabilityInput): IndexabilityScore {
  const flags: string[] = [];
  let score = 0;

  // Contentdichtheid (45)
  if (input.wordCount >= 900) score += 45;
  else if (input.wordCount >= 600) {
    score += 30;
    flags.push(`dunne content (${input.wordCount} woorden, <900)`);
  } else if (input.wordCount >= 400) {
    score += 18;
    flags.push(`te dunne content (${input.wordCount} woorden)`);
  } else {
    score += 5;
    flags.push(`kritiek dunne content (${input.wordCount} woorden)`);
  }

  // meta_description (15)
  if (input.hasMetaDescription && input.metaDescriptionLength >= 70) score += 15;
  else if (input.hasMetaDescription) {
    score += 8;
    flags.push("meta_description te kort (<70 chars)");
  } else {
    flags.push("geen meta_description");
  }

  // Inbound links (25)
  if (input.inboundLinks >= 3) score += 25;
  else if (input.inboundLinks >= 2) score += 20;
  else if (input.inboundLinks === 1) {
    score += 8;
    flags.push("slechts 1 inkomende link (rotatie-regressie?)");
  } else {
    score += 0;
    flags.push("0 inkomende links");
  }

  // Tags (10)
  if (input.hasTags) score += 10;
  else flags.push("geen tags");

  // Views / autoriteit (5)
  if (input.views >= 20) score += 5;
  else if (input.views >= 5) score += 3;
  else score += 1;

  return {
    slug: input.slug,
    section: input.section,
    score,
    grade: grade(score),
    wordCount: input.wordCount,
    flags,
  };
}

export const INDEXABILITY_THRESHOLD = 60;
