import { describe, it, expect, vi, beforeEach } from "vitest";
import { validatePromoCode, redeemPromoCode } from "@/lib/api/promo-codes";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

beforeEach(() => {
  mockFetch.mockReset();
  localStorage.clear();
});

describe("validatePromoCode", () => {
  it("stuurt code en package_type naar /promo-codes/validate", async () => {
    const body = {
      valid: true,
      discount_cents: 1000,
      discount_type: "FIXED",
      discount_value: 10,
      error: null,
    };
    mockFetch.mockResolvedValueOnce(jsonResponse(200, body));

    const result = await validatePromoCode("WELKOM10", "VERHAAL");

    expect(result).toEqual(body);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain("/promo-codes/validate");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ code: "WELKOM10", package_type: "VERHAAL" });
  });

  it("geeft een ongeldige respons terug (zonder throw) als de server faalt", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(500, {}));

    const result = await validatePromoCode("KAPOT", "BABY_GIFT");

    expect(result.valid).toBe(false);
    expect(result.discount_cents).toBe(0);
    expect(result.error).toBe("Validatie mislukt");
  });

  it("geeft de backend-afwijzing door (valid=false met reden)", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse(200, {
        valid: false,
        discount_cents: 0,
        discount_type: null,
        discount_value: null,
        error: "Deze code is verlopen",
      }),
    );

    const result = await validatePromoCode("OUD2024", "VERHAAL");

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Deze code is verlopen");
  });
});

describe("redeemPromoCode", () => {
  it("weigert zonder ingelogde sessie en doet géén request", async () => {
    await expect(redeemPromoCode("GRATIS100")).rejects.toThrow("Niet ingelogd");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("wisselt de code in met Bearer-token", async () => {
    localStorage.setItem("life-journey.auth", JSON.stringify({ token: "tok-9" }));
    const body = { success: true, message: "Pakket geactiveerd", grants_package: "VERHAAL" };
    mockFetch.mockResolvedValueOnce(jsonResponse(200, body));

    const result = await redeemPromoCode("GRATIS100");

    expect(result).toEqual(body);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain("/promo-codes/redeem");
    expect(init.headers["Authorization"]).toBe("Bearer tok-9");
    expect(JSON.parse(init.body)).toEqual({ code: "GRATIS100" });
  });

  it("gooit de detail-boodschap van de backend door bij een fout", async () => {
    localStorage.setItem("life-journey.auth", JSON.stringify({ token: "tok-9" }));
    mockFetch.mockResolvedValueOnce(jsonResponse(409, { detail: "Code is al gebruikt" }));

    await expect(redeemPromoCode("DUBBEL")).rejects.toThrow("Code is al gebruikt");
  });

  it("valt terug op de Nederlandse standaardmelding bij een lege foutbody", async () => {
    localStorage.setItem("life-journey.auth", JSON.stringify({ token: "tok-9" }));
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("geen json");
      },
    });

    await expect(redeemPromoCode("KAPOT")).rejects.toThrow("Inwisselen mislukt");
  });
});
