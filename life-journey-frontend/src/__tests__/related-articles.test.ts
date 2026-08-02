import { describe, it, expect } from "vitest";
import { pickRelatedArticles } from "@/lib/related-articles";

const make = (n: number, tags: (string | null)[] = []) =>
  Array.from({ length: n }, (_, i) => ({
    slug: `artikel-${i}`,
    tags: tags[i] ?? null,
  }));

describe("pickRelatedArticles", () => {
  it("sluit het huidige artikel uit", () => {
    const all = make(10);
    const picked = pickRelatedArticles(all, "artikel-3");
    expect(picked.map((a) => a.slug)).not.toContain("artikel-3");
  });

  it("geeft ELK artikel minstens twee inkomende links", () => {
    // Dit is de kern: de oude implementatie liet 53 van de 56 artikelen op nul
    // staan. Deze test faalt zodra die regressie terugkomt.
    const all = make(56);
    const inbound = new Map(all.map((a) => [a.slug, 0]));
    for (const article of all) {
      for (const rel of pickRelatedArticles(all, article.slug, 3)) {
        inbound.set(rel.slug, (inbound.get(rel.slug) ?? 0) + 1);
      }
    }
    const laagste = Math.min(...inbound.values());
    expect(laagste).toBeGreaterThanOrEqual(2);
  });

  it("verdeelt de links gelijkmatig in plaats van ze op te hopen", () => {
    const all = make(56);
    const inbound = new Map(all.map((a) => [a.slug, 0]));
    for (const article of all) {
      for (const rel of pickRelatedArticles(all, article.slug, 3)) {
        inbound.set(rel.slug, (inbound.get(rel.slug) ?? 0) + 1);
      }
    }
    // Zonder tags is het puur rotatie: iedereen exact 3.
    expect(Math.max(...inbound.values())).toBe(3);
  });

  it("zet een artikel met overlappende tags vooraan", () => {
    const all = make(10);
    all[0].tags = "erfgoed, familie";
    all[7].tags = "erfgoed, familie";
    const picked = pickRelatedArticles(all, "artikel-0", 3);
    expect(picked[0].slug).toBe("artikel-7");
  });

  it("werkt zonder tags", () => {
    const all = make(10);
    const picked = pickRelatedArticles(all, "artikel-0", 3);
    expect(picked).toHaveLength(3);
    expect(picked.map((a) => a.slug)).toEqual([
      "artikel-1",
      "artikel-2",
      "artikel-3",
    ]);
  });

  it("loopt rond aan het einde van de lijst", () => {
    const all = make(5);
    const picked = pickRelatedArticles(all, "artikel-4", 3);
    expect(picked.map((a) => a.slug)).toEqual([
      "artikel-0",
      "artikel-1",
      "artikel-2",
    ]);
  });

  it("levert geen duplicaten", () => {
    const all = make(4);
    all[0].tags = "x";
    all[2].tags = "x";
    const picked = pickRelatedArticles(all, "artikel-0", 3);
    expect(new Set(picked.map((a) => a.slug)).size).toBe(picked.length);
  });

  it("gaat om met randgevallen", () => {
    expect(pickRelatedArticles(make(1), "artikel-0")).toEqual([]);
    expect(pickRelatedArticles([], "wat-dan-ook")).toEqual([]);
    expect(pickRelatedArticles(make(10), "artikel-0", 0)).toEqual([]);
    // Onbekende slug: geen rotatiepositie, dus gewoon de eerste paar.
    expect(pickRelatedArticles(make(10), "bestaat-niet", 2)).toHaveLength(2);
  });

  it("geeft minder terug dan gevraagd als de lijst te kort is", () => {
    expect(pickRelatedArticles(make(3), "artikel-0", 5)).toHaveLength(2);
  });

  it("is deterministisch", () => {
    const all = make(20, ["a,b", null, "b,c"]);
    const eerste = pickRelatedArticles(all, "artikel-0", 3).map((a) => a.slug);
    const tweede = pickRelatedArticles(all, "artikel-0", 3).map((a) => a.slug);
    expect(eerste).toEqual(tweede);
  });
});
