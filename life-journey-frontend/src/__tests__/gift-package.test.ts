import { describe, expect, it } from "vitest";
import { PACKAGES, giftCheckoutPath, giftPackage } from "@/lib/pricing";

describe("giftPackage", () => {
  it("kiest nooit een uitverkocht pakket", () => {
    // Regressie sep 2026: cadeaupagina's linkten hard naar ERFGOED terwijl de
    // doos uitverkocht was; de checkout stuurde die bezoekers stil naar /pricing.
    expect(PACKAGES[giftPackage()].soldOut).toBe(false);
  });

  it("bouwt een cadeau-checkoutpad", () => {
    expect(giftCheckoutPath("VERHAAL")).toBe("/checkout?package=VERHAAL&gift=true");
  });
});
