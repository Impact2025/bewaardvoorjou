import { describe, expect, it } from "vitest";
import { nextVaderdag } from "@/lib/vaderdag";

const ymd = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

describe("nextVaderdag", () => {
  it("kiest de derde zondag van juni", () => {
    expect(ymd(nextVaderdag(new Date(2026, 0, 10)))).toBe("2026-6-21");
    expect(ymd(nextVaderdag(new Date(2025, 0, 10)))).toBe("2025-6-15");
  });

  it("geeft op Vaderdag zelf nog die dag terug", () => {
    expect(ymd(nextVaderdag(new Date(2026, 5, 21, 23, 0)))).toBe("2026-6-21");
  });

  it("schuift na Vaderdag door naar volgend jaar", () => {
    expect(ymd(nextVaderdag(new Date(2026, 8, 28)))).toBe("2027-6-20");
  });
});
