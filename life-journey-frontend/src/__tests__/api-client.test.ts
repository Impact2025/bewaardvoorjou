import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiFetch, isApiError, type ApiError } from "@/lib/api-client";

vi.mock("@/lib/config", () => ({ API_BASE_URL: "http://test.local/api/v1" }));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

/** Bouwt een minimale fetch-Response zoals apiFetch die gebruikt (ok/status/text). */
function response(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  };
}

beforeEach(() => {
  mockFetch.mockReset();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("apiFetch — succesvolle responses", () => {
  it("parseert een JSON-body", async () => {
    mockFetch.mockResolvedValueOnce(response(200, { id: "a-1", naam: "Test" }));
    await expect(apiFetch<{ id: string }>("/items/a-1")).resolves.toEqual({
      id: "a-1",
      naam: "Test",
    });
  });

  it("geeft undefined terug bij een lege body (204-achtig)", async () => {
    mockFetch.mockResolvedValueOnce(response(200, ""));
    await expect(apiFetch("/leeg")).resolves.toBeUndefined();
  });

  it("geeft de ruwe tekst terug als de body geen JSON is", async () => {
    mockFetch.mockResolvedValueOnce(response(200, "gewoon tekst"));
    await expect(apiFetch<string>("/tekst")).resolves.toBe("gewoon tekst");
  });
});

describe("apiFetch — request-opbouw", () => {
  it("bouwt de URL op met API_BASE_URL en stuurt Authorization + JSON Content-Type", async () => {
    mockFetch.mockResolvedValueOnce(response(200, {}));
    await apiFetch("/pad", { method: "POST", body: "{}" }, { token: "tok-1" });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("http://test.local/api/v1/pad");
    const headers = init.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer tok-1");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("zet géén Content-Type bij een FormData-body (browser bepaalt de boundary)", async () => {
    mockFetch.mockResolvedValueOnce(response(200, {}));
    await apiFetch("/upload", { method: "POST", body: new FormData() });

    const headers = mockFetch.mock.calls[0][1].headers as Headers;
    expect(headers.has("Content-Type")).toBe(false);
  });
});

describe("apiFetch — Nederlandse foutmeldingen per statuscode", () => {
  // De server-boodschap bevat "error", dus de statuscode-mapping moet in werking treden.
  it.each([
    [400, "Ongeldige aanvraag. Controleer je invoer en probeer opnieuw."],
    [401, "Je bent niet ingelogd. Log opnieuw in om door te gaan."],
    [403, "Je hebt geen toegang tot deze resource."],
    [404, "De gevraagde resource is niet gevonden."],
    [409, "Er is een conflict opgetreden. Deze actie kan niet worden uitgevoerd."],
    [422, "De ingevoerde gegevens zijn ongeldig. Controleer je invoer."],
    [429, "Te veel verzoeken. Wacht even en probeer opnieuw."],
    [500, "Er is een serverfout opgetreden. Probeer het later opnieuw."],
    [502, "De server is tijdelijk niet bereikbaar. Probeer het later opnieuw."],
    [503, "De service is tijdelijk niet beschikbaar. Probeer het later opnieuw."],
  ])("vertaalt status %i naar een Nederlandse melding", async (status, expected) => {
    mockFetch.mockResolvedValueOnce(
      response(status, { detail: "An internal error occurred while processing" }),
    );
    await expect(apiFetch("/x")).rejects.toMatchObject({ status, message: expected });
  });

  it("behoudt een korte, al gebruiksvriendelijke server-melding", async () => {
    mockFetch.mockResolvedValueOnce(response(400, { detail: "E-mailadres is al in gebruik" }));
    await expect(apiFetch("/auth/register")).rejects.toMatchObject({
      status: 400,
      message: "E-mailadres is al in gebruik",
    });
  });

  it("valt terug op het message-veld als detail ontbreekt", async () => {
    mockFetch.mockResolvedValueOnce(response(400, { message: "Er ging iets mis met je invoer" }));
    await expect(apiFetch("/x")).rejects.toMatchObject({
      message: "Er ging iets mis met je invoer",
    });
  });

  it("gebruikt de ruwe body als de foutrespons geen JSON is", async () => {
    mockFetch.mockResolvedValueOnce(response(404, "Niet gevonden"));
    await expect(apiFetch("/x")).rejects.toMatchObject({
      status: 404,
      message: "Niet gevonden",
    });
  });
});

describe("apiFetch — FastAPI-validatiefouten", () => {
  it("voegt msg-velden uit de detail-array samen en zet VALIDATION_ERROR", async () => {
    const detail = [
      { msg: "veld verplicht", type: "missing" },
      { msg: "ongeldig e-mailadres", type: "value_error" },
    ];
    mockFetch.mockResolvedValueOnce(response(422, { detail }));

    const err = (await apiFetch("/x").catch((e) => e)) as ApiError;
    expect(err.status).toBe(422);
    expect(err.message).toBe("veld verplicht, ongeldig e-mailadres");
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.details).toEqual({ validation_errors: detail });
  });
});

describe("apiFetch — auto-logout bij 401", () => {
  it("wist localStorage-sessie en ljauth-cookie", async () => {
    localStorage.setItem("life-journey.auth", JSON.stringify({ token: "tok-1" }));
    document.cookie = "ljauth=abc; path=/";
    mockFetch.mockResolvedValueOnce(response(401, { detail: "Niet geautoriseerd" }));

    await expect(apiFetch("/beveiligd")).rejects.toMatchObject({ status: 401 });
    expect(localStorage.getItem("life-journey.auth")).toBeNull();
    expect(document.cookie).not.toContain("ljauth");
  });

  it("laat sessie intact bij andere foutcodes", async () => {
    localStorage.setItem("life-journey.auth", JSON.stringify({ token: "tok-1" }));
    mockFetch.mockResolvedValueOnce(response(403, { detail: "Verboden" }));

    await expect(apiFetch("/beveiligd")).rejects.toMatchObject({ status: 403 });
    expect(localStorage.getItem("life-journey.auth")).not.toBeNull();
  });
});

describe("apiFetch — retry met backoff", () => {
  it("herhaalt bij 5xx en slaagt bij de tweede poging", async () => {
    vi.useFakeTimers();
    mockFetch
      .mockResolvedValueOnce(response(500, { detail: "server error" }))
      .mockResolvedValueOnce(response(200, { ok: true }));

    const promise = apiFetch<{ ok: boolean }>("/retry", undefined, {
      retries: 2,
      retryDelay: 500,
    });
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("gebruikt oplopende backoff (retryDelay × pogingnummer)", async () => {
    vi.useFakeTimers();
    mockFetch
      .mockResolvedValueOnce(response(500, "server error"))
      .mockResolvedValueOnce(response(503, "server error"))
      .mockResolvedValueOnce(response(200, { ok: true }));

    const promise = apiFetch("/backoff", undefined, { retries: 2, retryDelay: 1000 });

    // Eerste poging gebeurt direct.
    await vi.advanceTimersByTimeAsync(0);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Retry 1 pas na 1000 ms (1 × retryDelay).
    await vi.advanceTimersByTimeAsync(999);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Retry 2 pas na nog eens 2000 ms (2 × retryDelay).
    await vi.advanceTimersByTimeAsync(1999);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(mockFetch).toHaveBeenCalledTimes(3);

    await expect(promise).resolves.toEqual({ ok: true });
  });

  it("gooit de laatste fout na uitgeputte retries op 5xx", async () => {
    vi.useFakeTimers();
    mockFetch.mockResolvedValue(response(500, { detail: "server error" }));

    const promise = apiFetch("/kapot", undefined, { retries: 2, retryDelay: 100 });
    const assertion = expect(promise).rejects.toMatchObject({
      status: 500,
      message: "Er is een serverfout opgetreden. Probeer het later opnieuw.",
    });
    await vi.runAllTimersAsync();
    await assertion;
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("herhaalt NIET bij 4xx, ook al zijn retries geconfigureerd", async () => {
    mockFetch.mockResolvedValueOnce(response(400, { detail: "Foute invoer" }));

    await expect(
      apiFetch("/geen-retry", undefined, { retries: 3, retryDelay: 10 }),
    ).rejects.toMatchObject({ status: 400 });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("herhaalt bij netwerkfouten en geeft daarna NETWORK_ERROR met Nederlandse melding", async () => {
    vi.useFakeTimers();
    mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));

    const promise = apiFetch("/offline", undefined, { retries: 2, retryDelay: 100 });
    const assertion = expect(promise).rejects.toMatchObject({
      status: 0,
      code: "NETWORK_ERROR",
      message: "Geen verbinding met de server. Controleer je internetverbinding.",
    });
    await vi.runAllTimersAsync();
    await assertion;
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("gooit niet-netwerk-exceptions direct door zonder retry", async () => {
    mockFetch.mockRejectedValueOnce(new Error("iets heel anders"));

    await expect(
      apiFetch("/x", undefined, { retries: 3, retryDelay: 10 }),
    ).rejects.toThrow("iets heel anders");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe("isApiError", () => {
  it("herkent een ApiError-object", () => {
    expect(isApiError({ message: "fout", status: 404 })).toBe(true);
  });

  it("wijst gewone Errors, null en primitieven af", () => {
    expect(isApiError(new Error("fout"))).toBe(false);
    expect(isApiError(null)).toBe(false);
    expect(isApiError("fout")).toBe(false);
    expect(isApiError({ message: "fout", status: "404" })).toBe(false);
  });
});
