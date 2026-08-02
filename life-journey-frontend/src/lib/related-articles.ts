/**
 * Kiest "gerelateerde artikelen" onder aan een blog- of kennisbankartikel.
 *
 * Waarom dit bestaat: de oude aanpak haalde de N nieuwste artikelen op en nam
 * daar de eerste 3 van. Omdat die lijst voor iedereen gelijk is, linkten álle
 * 56 kennisbankartikelen naar dezelfde 3 pagina's — de overige 53 kregen nul
 * inkomende links. Google kende ze via de sitemap, maar indexeerde ze niet.
 *
 * De oplossing combineert twee dingen:
 *
 *  1. ROTATIE (de garantie). We pakken de directe buren in de publicatie-
 *     volgorde: index+1, index+2, … modulo de lijstlengte. Daardoor krijgt
 *     elk artikel gegarandeerd inkomende links van zijn twee voorgangers,
 *     ongeacht tags of publicatiedatum. Deterministisch, dus stabiel tussen
 *     builds en geen cache-thrash.
 *
 *  2. TAGS (de relevantie). Eén van de drie plekken gaat naar het artikel met
 *     de meeste overlappende tags. Bewust maar één: de tags zijn sterk
 *     versnipperd (115 van de 157 kennisbank-tags komen precies één keer
 *     voor) en 6 blogartikelen hebben er helemaal geen, dus tags alleen zijn
 *     een te wankele basis om de interne linkstructuur op te bouwen.
 */

export interface RelatedArticle {
  slug: string;
  tags?: string | null;
}

function parseTags(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * @param all         Alle gepubliceerde artikelen van deze sectie, in een
 *                    stabiele volgorde (de API sorteert op published_at desc).
 * @param currentSlug Het artikel waar de lezer nu is.
 * @param count       Hoeveel suggesties we tonen.
 */
export function pickRelatedArticles<T extends RelatedArticle>(
  all: T[],
  currentSlug: string,
  count = 3
): T[] {
  if (count <= 0) return [];

  const others = all.filter((a) => a.slug !== currentSlug);
  if (others.length === 0) return [];

  const index = all.findIndex((a) => a.slug === currentSlug);
  // Staat het huidige artikel niet in de lijst, dan is er geen zinnige
  // rotatiepositie — val terug op de eerste paar.
  if (index === -1) return others.slice(0, count);

  const total = all.length;
  const rotation: T[] = [];
  for (let step = 1; step < total && rotation.length < count; step++) {
    const candidate = all[(index + step) % total];
    if (candidate.slug !== currentSlug) rotation.push(candidate);
  }

  const currentTags = new Set(parseTags(all[index].tags));
  let best: T | null = null;
  let bestScore = 0;
  if (currentTags.size > 0) {
    for (const candidate of others) {
      const score = parseTags(candidate.tags).filter((t) =>
        currentTags.has(t)
      ).length;
      // Strikt groter: bij gelijke score wint de eerste in lijstvolgorde,
      // zodat de uitkomst deterministisch blijft.
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }
  }

  // Geen tag-match, of de match zit al in de rotatie? Dan gewoon de rotatie.
  if (!best || rotation.some((a) => a.slug === best!.slug)) {
    return rotation.slice(0, count);
  }

  // Tag-match voorop. De laatste rotatiekandidaat valt af, maar step 1 en 2
  // blijven staan — en dáár zit de garantie van twee inkomende links in.
  return [best, ...rotation].slice(0, count);
}
