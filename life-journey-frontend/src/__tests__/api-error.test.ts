import { describe, it, expect } from "vitest";
import { extractDetail } from "@/lib/api/api-error";

describe("extractDetail — FastAPI detail-normalisatie", () => {
  it("geeft een string-detail ongewijzigd terug", () => {
    expect(extractDetail("Pakket is uitverkocht", "fallback")).toBe("Pakket is uitverkocht");
  });

  it("voegt msg-velden uit een validatie-array samen", () => {
    const detail = [
      { loc: ["body", "email"], msg: "ongeldig e-mailadres", type: "value_error" },
      { loc: ["body", "name"], msg: "veld verplicht", type: "missing" },
    ];
    expect(extractDetail(detail, "fallback")).toBe("ongeldig e-mailadres, veld verplicht");
  });

  it("stringificeert array-items zonder msg-veld", () => {
    expect(extractDetail(["eerste", "tweede"], "fallback")).toBe("eerste, tweede");
  });

  it("valt terug op de fallback bij null, undefined of lege array", () => {
    expect(extractDetail(null, "fallback")).toBe("fallback");
    expect(extractDetail(undefined, "fallback")).toBe("fallback");
    expect(extractDetail([], "fallback")).toBe("fallback");
  });

  it("valt terug op de fallback bij een onbekend object-formaat", () => {
    expect(extractDetail({ onverwacht: true }, "fallback")).toBe("fallback");
  });
});
