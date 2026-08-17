import { describe, expect, it } from "vitest";
import {
  scoreIndexability,
  INDEXABILITY_THRESHOLD,
  IndexabilityInput,
} from "@/lib/seo/indexability";

const base: IndexabilityInput = {
  slug: "x",
  section: "blog",
  wordCount: 1000,
  hasMetaDescription: true,
  metaDescriptionLength: 155,
  inboundLinks: 3,
  hasTags: true,
  views: 30,
};

describe("scoreIndexability", () => {
  it("geeft een A aan een complete post", () => {
    const s = scoreIndexability(base);
    expect(s.score).toBeGreaterThanOrEqual(85);
    expect(s.grade).toBe("A");
    expect(s.flags).toHaveLength(0);
  });

  it("straft dunne content zwaar (45 punten weg)", () => {
    const s = scoreIndexability({ ...base, wordCount: 300 });
    expect(s.score).toBeLessThan(70);
    expect(s.flags.some((f) => f.includes("kritiek dunne"))).toBe(true);
  });

  it("straft een ontbrekende meta_description", () => {
    const full = scoreIndexability(base);
    const s = scoreIndexability({ ...base, hasMetaDescription: false, metaDescriptionLength: 0 });
    expect(s.flags).toContain("geen meta_description");
    // 15 punten verlies t.o.v. een complete post
    expect(full.score - s.score).toBe(15);
  });

  it("signaleert 0 inbound links als regressie", () => {
    const s = scoreIndexability({ ...base, inboundLinks: 0 });
    expect(s.flags).toContain("0 inkomende links");
  });

  it("onder de drempel bij combinatie van tekortkomingen", () => {
    const s = scoreIndexability({
      ...base,
      wordCount: 450,
      hasMetaDescription: false,
      inboundLinks: 1,
      hasTags: false,
      views: 0,
    });
    expect(s.score).toBeLessThan(INDEXABILITY_THRESHOLD);
    expect(s.grade).toBe("F");
  });

  it("een post van precies 900 woorden krijgt volle content-score", () => {
    const s = scoreIndexability({ ...base, wordCount: 900 });
    expect(s.score).toBeGreaterThanOrEqual(85);
  });
});
