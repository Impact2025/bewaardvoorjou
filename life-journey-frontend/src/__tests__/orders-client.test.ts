import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createPaymentIntent,
  getOrderStatus,
  uploadGiftMessage,
  type CreatePaymentIntentPayload,
} from "@/lib/api/orders";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

const basePayload: CreatePaymentIntentPayload = {
  package_type: "VERHAAL",
  addons: ["PHOTO_BOOK"],
  for_self: false,
  recipient_name: "Oma Riek",
  recipient_email: "oma@example.nl",
  recipient_relation: "oma",
  personal_message: "Voor jou",
  gift_reveal: "SURPRISE",
  promo_code: "WELKOM10",
};

beforeEach(() => {
  mockFetch.mockReset();
  localStorage.clear();
});

describe("createPaymentIntent", () => {
  const successBody = {
    client_secret: "cs_123",
    payment_intent_id: "pi_123",
    order_id: "order-1",
    amount_cents: 7900,
    publishable_key: "pk_test",
  };

  it("POST naar /orders/create-payment-intent met de volledige payload als JSON", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, successBody));

    const result = await createPaymentIntent(basePayload);

    expect(result).toEqual(successBody);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain("/orders/create-payment-intent");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual(basePayload);
  });

  it("stuurt een Bearer-token mee als de gebruiker is ingelogd", async () => {
    localStorage.setItem("life-journey.auth", JSON.stringify({ token: "tok-42" }));
    mockFetch.mockResolvedValueOnce(jsonResponse(200, successBody));

    await createPaymentIntent(basePayload);

    const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer tok-42");
  });

  it("stuurt géén Authorization-header voor gast-checkout", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(200, successBody));

    await createPaymentIntent(basePayload);

    const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
    expect(headers["Authorization"]).toBeUndefined();
  });

  it("gooit de detail-boodschap van de backend door bij een fout", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(400, { detail: "Pakket is uitverkocht" }));

    await expect(createPaymentIntent(basePayload)).rejects.toThrow("Pakket is uitverkocht");
  });

  it("normaliseert een FastAPI-validatiefout (detail-array) naar één boodschap", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse(422, {
        detail: [
          { loc: ["body", "recipient_email"], msg: "ongeldig e-mailadres", type: "value_error" },
        ],
      }),
    );

    await expect(createPaymentIntent(basePayload)).rejects.toThrow("ongeldig e-mailadres");
  });

  it("valt terug op de Nederlandse standaardmelding als de foutbody geen JSON is", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("geen json");
      },
    });

    await expect(createPaymentIntent(basePayload)).rejects.toThrow(
      "Betaling kon niet worden gestart",
    );
  });
});

describe("getOrderStatus", () => {
  it("haalt de status op via GET met een URL-veilig order-id", async () => {
    const body = {
      order_id: "order-1",
      status: "paid",
      package_type: "VERHAAL",
      recipient_name: null,
      recipient_email: null,
      has_shipping: false,
      shipping_city: null,
      redemption_token: null,
      gift_reveal: null,
      delivery_date: null,
    };
    mockFetch.mockResolvedValueOnce(jsonResponse(200, body));

    const result = await getOrderStatus("order/../1");

    expect(result.status).toBe("paid");
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain(`/orders/${encodeURIComponent("order/../1")}/status`);
    expect(url).not.toContain("/orders/order/../1");
    expect(init.method).toBe("GET");
  });

  it("gooit de Nederlandse fallback bij een fout zonder detail", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(404, {}));

    await expect(getOrderStatus("onbekend")).rejects.toThrow(
      "Kon de betaalstatus niet ophalen",
    );
  });
});

describe("uploadGiftMessage", () => {
  const presignBody = {
    upload_url: "https://uploads.example/put-hier",
    object_key: "gift/abc.webm",
    upload_method: "PUT",
  };

  it("presigned eerst en uploadt daarna de blob naar de upload_url", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(200, presignBody))
      .mockResolvedValueOnce({ ok: true, status: 200 });

    const blob = new Blob([new Uint8Array(1234)], { type: "audio/webm" });
    const objectKey = await uploadGiftMessage(blob, "bericht.webm", "audio");

    expect(objectKey).toBe("gift/abc.webm");

    // Presign-call: filename, modality en size_bytes in de body
    const [presignUrl, presignInit] = mockFetch.mock.calls[0];
    expect(presignUrl).toContain("/orders/gift-message/presign");
    expect(JSON.parse(presignInit.body)).toEqual({
      filename: "bericht.webm",
      modality: "audio",
      size_bytes: 1234,
    });

    // Upload-call: PUT met de blob en het juiste content-type
    const [uploadUrl, uploadInit] = mockFetch.mock.calls[1];
    expect(uploadUrl).toBe("https://uploads.example/put-hier");
    expect(uploadInit.method).toBe("PUT");
    expect(uploadInit.body).toBe(blob);
    expect(uploadInit.headers["Content-Type"]).toBe("audio/webm");
  });

  it("valt terug op PUT als upload_method leeg is en op octet-stream zonder blob-type", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(200, { ...presignBody, upload_method: "" }))
      .mockResolvedValueOnce({ ok: true, status: 200 });

    await uploadGiftMessage(new Blob([new Uint8Array(10)]), "x.bin", "video");

    const [, uploadInit] = mockFetch.mock.calls[1];
    expect(uploadInit.method).toBe("PUT");
    expect(uploadInit.headers["Content-Type"]).toBe("application/octet-stream");
  });

  it("gooit een Nederlandse fout als het presignen mislukt", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(413, { detail: "Bestand te groot" }));

    await expect(
      uploadGiftMessage(new Blob(["x"]), "groot.webm", "video"),
    ).rejects.toThrow("Bestand te groot");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("gooit een Nederlandse fout als de upload zelf mislukt", async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(200, presignBody))
      .mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(
      uploadGiftMessage(new Blob(["x"]), "bericht.webm", "audio"),
    ).rejects.toThrow("Het uploaden van het bericht is mislukt");
  });
});
