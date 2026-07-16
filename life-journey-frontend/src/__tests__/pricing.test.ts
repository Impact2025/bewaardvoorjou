import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  PACKAGES,
  availabilityFor,
  buildOffer,
  buildProductJsonLd,
  priceValidUntil,
  schemaPrice,
} from "@/lib/pricing";

const BACKEND_ORDERS_SCHEMA = resolve(
  __dirname,
  "../../../life-journey-backend/app/schemas/orders.py",
);

/**
 * Leest PACKAGE_PRICES (eurocenten) uit de Python-bron. Zo bewaakt deze test
 * het contract met de backend in plaats van een gekopieerde lijst getallen.
 */
function readBackendPrices(): Record<string, number> {
  const source = readFileSync(BACKEND_ORDERS_SCHEMA, "utf-8");
  const block = source.match(/PACKAGE_PRICES:\s*dict\[str,\s*int\]\s*=\s*\{([\s\S]*?)\}/);
  if (!block) throw new Error("PACKAGE_PRICES niet gevonden in orders.py");

  const prices: Record<string, number> = {};
  const entry = /"([A-Z_]+)"\s*:\s*(\d+)/g;
  let match: RegExpExecArray | null;
  while ((match = entry.exec(block[1])) !== null) {
    prices[match[1]] = Number(match[2]);
  }
  return prices;
}

describe("pricing — contract met de backend", () => {
  // Draait alleen in de monorepo-checkout; sla over als de backend ontbreekt.
  const hasBackend = existsSync(BACKEND_ORDERS_SCHEMA);

  it.runIf(hasBackend)("elke prijs komt overeen met PACKAGE_PRICES in eurocenten", () => {
    const backend = readBackendPrices();
    for (const pkg of Object.values(PACKAGES)) {
      expect(backend[pkg.code], `${pkg.code} ontbreekt in de backend`).toBeDefined();
      expect(pkg.priceEur * 100, `prijs van ${pkg.code} wijkt af van de backend`).toBe(
        backend[pkg.code],
      );
    }
  });

  it.runIf(hasBackend)("gebruikt geen legacy-pakketten die de backend uitgefaseerd heeft", () => {
    const legacy = ["BEGIN", "VOOR_ALTIJD", "DIGITAAL"];
    for (const code of legacy) {
      expect(Object.keys(PACKAGES)).not.toContain(code);
    }
  });
});

describe("pricing — structured data", () => {
  it("schrijft prijzen als schema.org-strings zonder valutateken", () => {
    expect(schemaPrice("VERHAAL")).toBe("79.00");
    expect(schemaPrice("NALATENSCHAP")).toBe("229.00");
  });

  it("spiegelt de voorraadstatus die de bezoeker op de pagina ziet", () => {
    // Uitverkocht wint van pre-order: er staat dan geen koopknop op de kaart.
    for (const pkg of Object.values(PACKAGES)) {
      const expected = pkg.soldOut
        ? "https://schema.org/SoldOut"
        : pkg.preorder
          ? "https://schema.org/PreOrder"
          : "https://schema.org/InStock";
      expect(availabilityFor(pkg.code)).toBe(expected);
    }
  });

  it("zet priceValidUntil een jaar vooruit in plaats van op een vaste datum", () => {
    expect(priceValidUntil(new Date("2026-07-16T08:00:00Z"))).toBe("2027-07-16");
  });

  it("bouwt een offer met een checkout-URL, ook in de cadeau-variant", () => {
    const offer = buildOffer({ code: "ERFGOED", gift: true }, new Date("2026-07-16T08:00:00Z"));
    expect(offer).toMatchObject({
      "@type": "Offer",
      name: "Erfgoed",
      price: "149.00",
      priceCurrency: "EUR",
      priceValidUntil: "2027-07-16",
      url: "https://bewaardvoorjou.nl/checkout?package=ERFGOED&gift=true",
    });
  });

  it("levert een Product met brand en één offer-object bij één pakket", () => {
    const product = buildProductJsonLd({
      name: "Verhaal",
      description: "Test",
      url: "https://bewaardvoorjou.nl/pricing",
      offers: [{ code: "VERHAAL" }],
    });
    expect(product["@type"]).toBe("Product");
    expect(product.brand).toEqual({ "@type": "Brand", name: "BewaardVoorJou.nl" });
    expect(Array.isArray(product.offers)).toBe(false);
  });

  it("levert een array van offers bij meerdere pakketten en erft de productafbeelding", () => {
    const product = buildProductJsonLd({
      name: "Erfgoed Box",
      description: "Test",
      offers: [{ code: "ERFGOED" }, { code: "NALATENSCHAP" }],
    });
    expect(product.offers).toHaveLength(2);
    expect(product.image).toBe("https://bewaardvoorjou.nl/erfgoed-box.jpg");
  });

  it("voegt nooit aggregateRating of review toe zolang er geen echte reviews zijn", () => {
    const product = buildProductJsonLd({
      name: "Verhaal",
      description: "Test",
      offers: [{ code: "VERHAAL" }],
    });
    expect(product).not.toHaveProperty("aggregateRating");
    expect(product).not.toHaveProperty("review");
  });
});
