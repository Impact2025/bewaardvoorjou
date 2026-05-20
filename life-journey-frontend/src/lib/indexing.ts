/**
 * Client-side SEO indexing utilities.
 * Gebruikt door de /api/test-indexing route en eventuele directe pings vanuit Next.js.
 *
 * Voor productie-publicaties doet de FastAPI backend de indexering server-to-server.
 */

export async function pingIndexNow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    console.debug("[indexing] INDEXNOW_KEY not set, skipping IndexNow");
    return;
  }

  if (urls.length === 0) return;

  const host = new URL(urls[0]).hostname;

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${process.env.NEXT_PUBLIC_SITE_URL}/${key}.txt`,
        urlList: urls,
      }),
    });

    if (res.ok || res.status === 202) {
      console.log(`[indexing] IndexNow OK — ${urls.length} URL(s) submitted`);
    } else {
      console.warn(`[indexing] IndexNow HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn("[indexing] IndexNow error (non-critical):", err);
  }
}

export async function pingGoogleIndexingAPI(url: string): Promise<void> {
  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!saJson) {
    console.debug("[indexing] GOOGLE_SERVICE_ACCOUNT_JSON not set, skipping Google Indexing");
    return;
  }

  try {
    const token = await getGoogleAccessToken(saJson);
    if (!token) return;

    const res = await fetch(
      "https://indexing.googleapis.com/v3/urlNotifications:publish",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, type: "URL_UPDATED" }),
      }
    );

    if (res.ok) {
      console.log(`[indexing] Google Indexing OK — ${url}`);
    } else {
      console.warn(`[indexing] Google Indexing HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn("[indexing] Google Indexing error (non-critical):", err);
  }
}

async function getGoogleAccessToken(saJson: string): Promise<string | null> {
  try {
    const sa = JSON.parse(saJson);
    const now = Math.floor(Date.now() / 1000);

    const header = { alg: "RS256", typ: "JWT" };
    const claim = {
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/indexing",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };

    const encode = (obj: object) =>
      Buffer.from(JSON.stringify(obj))
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    const headerB64 = encode(header);
    const claimB64 = encode(claim);
    const signingInput = `${headerB64}.${claimB64}`;

    // Node.js crypto for RSA signing (server-side only)
    const { createSign } = await import("crypto");
    const sign = createSign("RSA-SHA256");
    sign.update(signingInput);
    const signature = sign
      .sign(sa.private_key)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const jwt = `${signingInput}.${signature}`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    const data = await tokenRes.json();
    return data.access_token ?? null;
  } catch (err) {
    console.warn("[indexing] Google token error:", err);
    return null;
  }
}
