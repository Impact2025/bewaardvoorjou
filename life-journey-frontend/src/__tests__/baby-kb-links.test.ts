import { describe, it, expect } from "vitest";
import { BABY_KB_GROUPS, BABY_KB_SLUGS } from "@/lib/baby-kb-links";

describe("baby-kb-links", () => {
  it("bevat geen dubbele slugs", () => {
    // Een dubbele slug betekent dat dezelfde kaart twee keer op de hub staat —
    // makkelijk te maken bij kopieerwerk, lastig te zien in de browser.
    expect(new Set(BABY_KB_SLUGS).size).toBe(BABY_KB_SLUGS.length);
  });

  it("gebruikt alleen geldige kennisbank-slugs", () => {
    for (const slug of BABY_KB_SLUGS) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("geeft elke groep een kop en minstens twee links", () => {
    expect(BABY_KB_GROUPS.length).toBeGreaterThan(0);
    for (const group of BABY_KB_GROUPS) {
      expect(group.heading.trim()).not.toBe("");
      expect(group.links.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("geeft elke link een titel en een omschrijving", () => {
    for (const group of BABY_KB_GROUPS) {
      for (const link of group.links) {
        expect(link.title.trim()).not.toBe("");
        expect(link.blurb.trim()).not.toBe("");
      }
    }
  });
});
