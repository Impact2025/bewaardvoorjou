import { describe, expect, it } from "vitest";
import {
  DEFAULT_PILLAR_HREF,
  PILLARS,
  pickPillarLinks,
} from "@/lib/pillar-links";

describe("pickPillarLinks", () => {
  it("linkt altijd naar de hoofdpijler, ook zonder enige match", () => {
    const picked = pickPillarLinks({ slug: "iets-volstrekt-ongerelateerds" });
    expect(picked.map((p) => p.href)).toEqual([DEFAULT_PILLAR_HREF]);
  });

  it("kiest de thematisch passende pijler op basis van de slug", () => {
    const picked = pickPillarLinks({
      slug: "cadeau-40-jaar-getrouwd-huwelijksjubileum",
    });
    expect(picked.map((p) => p.href)).toContain("/mijlpaal-cadeau");
  });

  it("neemt de hoofdpijler mee naast een thematische match", () => {
    const picked = pickPillarLinks({
      slug: "cadeau-40-jaar-getrouwd-huwelijksjubileum",
    });
    expect(picked.map((p) => p.href)).toContain(DEFAULT_PILLAR_HREF);
  });

  it("dupliceert de hoofdpijler niet als die zelf de beste match is", () => {
    const picked = pickPillarLinks({
      slug: "levensverhaal-vastleggen-bij-dementie-gids-mantelzorgers",
    });
    const hrefs = picked.map((p) => p.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs).toContain(DEFAULT_PILLAR_HREF);
  });

  it("weegt tags en keywords mee, niet alleen de slug", () => {
    const picked = pickPillarLinks({
      slug: "een-artikel-zonder-signaal",
      tags: "privacy, beveiliging",
      keywords: "waar staat mijn archief",
    });
    expect(picked.map((p) => p.href)).toContain(
      "/veilig-digitaal-familiearchief"
    );
  });

  it("respecteert het maximum aantal links", () => {
    const picked = pickPillarLinks(
      { slug: "levensverhaal-opschrijven-autobiografie-cadeau-opa-usb" },
      2
    );
    expect(picked.length).toBeLessThanOrEqual(2);
  });

  it("geeft niets terug bij count 0", () => {
    expect(pickPillarLinks({ slug: "wat-dan-ook" }, 0)).toEqual([]);
  });

  it("is deterministisch bij herhaalde aanroepen", () => {
    const input = { slug: "met-pensioen-je-volgende-hoofdstuk", tags: "pensioen" };
    expect(pickPillarLinks(input)).toEqual(pickPillarLinks(input));
  });

  it("bevat de hoofdpijler in de PILLARS-lijst", () => {
    expect(PILLARS.some((p) => p.href === DEFAULT_PILLAR_HREF)).toBe(true);
  });
});
