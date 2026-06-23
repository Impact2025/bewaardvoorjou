"use client";

import { QRCodeSVG } from "qrcode.react";

export interface CertificateProps {
  recipientName: string;
  gifterName: string;
  subtitle: string | null;
  packageType: string;
  packageName: string;
  packageTagline: string;
  packageFeatures: readonly string[];
  personalMessage: string | null;
  activationUrl: string;
  themeHex?: string;
}

const BOX_PACKAGES = new Set(["ERFGOED", "NALATENSCHAP"]);
const GOLD = "#d4af37";

function Divider({ tight = false, accent = GOLD }: { tight?: boolean; accent?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4mm",
        margin: tight ? "4mm 0" : "6mm 0",
      }}
    >
      <div style={{ flex: 1, height: "0.5px", background: `linear-gradient(to right, transparent, ${accent})` }} />
      <div style={{ width: "5px", height: "5px", background: accent, transform: "rotate(45deg)", flexShrink: 0 }} />
      <div style={{ flex: 1, height: "0.5px", background: `linear-gradient(to left, transparent, ${accent})` }} />
    </div>
  );
}

function BoxDeliveryAnnouncement({ accent = GOLD }: { accent?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: "4mm",
        background: "#f3efe8",
        border: "1px solid #e5ddd0",
        borderRadius: "2mm",
        padding: "4mm 5mm",
        marginTop: "5mm",
      }}
    >
      <div style={{ width: "2px", background: accent, borderRadius: "1px", flexShrink: 0 }} />
      <div>
        <p
          style={{
            color: "#1a1a1a",
            fontSize: "8.5pt",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 700,
            margin: "0 0 1mm",
          }}
        >
          De herinneringsdoos is onderweg
        </p>
        <p style={{ color: "#777", fontSize: "7.5pt", lineHeight: 1.5, margin: 0 }}>
          Verwacht binnen 2 weken na bestelling. Gebruik de QR-code hieronder om alvast digitaal te beginnen.
        </p>
      </div>
    </div>
  );
}

export function CertificateLayout({
  recipientName,
  gifterName,
  subtitle,
  packageType,
  packageName,
  packageTagline,
  packageFeatures,
  personalMessage,
  activationUrl,
  themeHex,
}: CertificateProps) {
  const isBoxPackage = BOX_PACKAGES.has(packageType);
  const isBaby = packageType === "BABY_GIFT";
  const accent = themeHex ?? GOLD;
  // For baby: light QR background with theme-colored dots; classic: dark bg with gold dots
  const qrBg = isBaby ? "#ffffff" : "#1a1a1a";
  const qrFg = isBaby ? accent : GOLD;
  const outerBorder = isBaby ? accent : "#1a1a1a";

  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        maxWidth: "100%",
        background: "#faf7f2",
        boxSizing: "border-box",
        padding: "7mm",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Buitenste rand */}
      <div style={{ flex: 1, border: `2px solid ${outerBorder}`, display: "flex", flexDirection: "column" }}>
        {/* Accent binnenrand */}
        <div style={{ flex: 1, margin: "3.5mm", border: `1px solid ${accent}`, display: "flex", flexDirection: "column" }}>
          {/* Inhoud */}
          <div style={{ flex: 1, padding: "9mm 11mm", display: "flex", flexDirection: "column" }}>

            {/* ── Logo + merk ── */}
            <div style={{ textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-bewaardvoorjou.png"
                alt="Bewaardvoorjou"
                style={{ width: "22mm", height: "22mm", objectFit: "contain", display: "block", margin: "0 auto 3.5mm" }}
              />
              <p style={{ color: "#1a1a1a", fontSize: "7pt", letterSpacing: "5px", textTransform: "uppercase", fontWeight: 700, margin: 0 }}>
                Bewaardvoorjou
              </p>
              <p style={{ color: "#999", fontSize: "7pt", letterSpacing: "0.5px", fontStyle: "italic", margin: "1.5mm 0 0" }}>
                Vertel het vandaag, bewaar het voor altijd
              </p>
            </div>

            <Divider accent={accent} />

            {/* ── Cadeaubon — naam — ondertitel — van ── */}
            <div style={{ textAlign: "center" }}>
              <p style={{ color: accent, fontSize: "6.5pt", letterSpacing: "8px", textTransform: "uppercase", fontWeight: 700, margin: "0 0 4mm" }}>
                Cadeaubon
              </p>
              <h1
                style={{
                  color: "#1a1a1a",
                  fontSize: "34pt",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontWeight: 700,
                  lineHeight: 1.05,
                  margin: "0 0 3.5mm",
                  letterSpacing: "-0.5px",
                }}
              >
                Voor {recipientName}
              </h1>
              {subtitle && (
                <p style={{ color: "#777", fontSize: "9.5pt", fontStyle: "italic", margin: "0 0 3mm", fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  {subtitle}
                </p>
              )}
              <p style={{ color: accent, fontSize: "7pt", letterSpacing: "4px", textTransform: "uppercase", margin: 0, fontWeight: 600 }}>
                Van {gifterName}
              </p>
            </div>

            <Divider accent={accent} />

            {/* ── Pakket ── */}
            <div>
              <p style={{ color: "#1a1a1a", fontSize: "12pt", fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, margin: "0 0 1.5mm" }}>
                {packageName}
              </p>
              <p style={{ color: "#777", fontSize: "8pt", fontStyle: "italic", margin: "0 0 4mm" }}>
                {packageTagline}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "3mm" }}>
                {packageFeatures.map((f) => {
                  const colonIdx = f.indexOf(": ");
                  const title = colonIdx > -1 ? f.slice(0, colonIdx) : null;
                  const desc = colonIdx > -1 ? f.slice(colonIdx + 2) : f;
                  return (
                    <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "3mm" }}>
                      <div style={{ width: "4px", height: "4px", background: accent, transform: "rotate(45deg)", flexShrink: 0, marginTop: "5px" }} />
                      <span style={{ color: "#444", fontSize: "8pt", lineHeight: 1.55 }}>
                        {title && (
                          <span style={{ color: "#1a1a1a", fontWeight: 700, fontFamily: "Georgia, 'Times New Roman', serif" }}>
                            {title}:{" "}
                          </span>
                        )}
                        {desc}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Aankondiging doos — alleen voor box-pakketten */}
              {isBoxPackage && <BoxDeliveryAnnouncement accent={accent} />}
            </div>

            {/* ── Persoonlijk bericht ── */}
            {personalMessage && (
              <>
                <Divider accent={accent} />
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "#bbb", fontSize: "6pt", letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 4mm" }}>
                    Persoonlijk bericht
                  </p>
                  <p
                    style={{
                      color: "#1a1a1a",
                      fontSize: "14pt",
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontStyle: "italic",
                      lineHeight: 1.65,
                      margin: "0 0 3.5mm",
                    }}
                  >
                    &ldquo;{personalMessage}&rdquo;
                  </p>
                  <p style={{ color: "#999", fontSize: "8pt", letterSpacing: "1px", margin: 0 }}>
                    &mdash;&ensp;{gifterName}
                  </p>
                </div>
              </>
            )}

            <Divider accent={accent} />

            {/* ── QR + activatie ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6mm",
                background: qrBg,
                border: isBaby ? `1px solid ${accent}` : undefined,
                borderRadius: "2.5mm",
                padding: "5mm 6mm",
              }}
            >
              <div style={{ flexShrink: 0, lineHeight: 0 }}>
                {activationUrl && (
                  <QRCodeSVG value={activationUrl} size={76} level="M" bgColor={qrBg} fgColor={qrFg} />
                )}
              </div>
              <div>
                <p
                  style={{
                    color: accent,
                    fontSize: "9.5pt",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontWeight: 700,
                    margin: "0 0 2mm",
                  }}
                >
                  {isBoxPackage ? "Begin alvast digitaal" : "Scan om te starten"}
                </p>
                <p style={{ color: isBaby ? "#555" : "#aaa", fontSize: "7.5pt", lineHeight: 1.55, margin: "0 0 2.5mm" }}>
                  {isBoxPackage
                    ? "De herinneringsdoos arriveert binnenkort. Scan de QR-code om alvast digitaal te beginnen — geen wachtwoord nodig."
                    : "Scan de QR-code met je telefoon of ga naar het onderstaand adres om het cadeau te activeren. Geen wachtwoord nodig."}
                </p>
                <p style={{ color: accent, fontSize: "6.5pt", fontFamily: "monospace", wordBreak: "break-all", opacity: 0.75, margin: 0 }}>
                  {activationUrl}
                </p>
              </div>
            </div>

            {/* Duwer zodat footer altijd onderaan staat */}
            <div style={{ flex: 1, minHeight: "5mm" }} />

            {/* ── Footer ── */}
            <Divider tight accent={accent} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2.5mm" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-bewaardvoorjou.png" alt="" style={{ width: "5mm", height: "5mm", objectFit: "contain", opacity: 0.35 }} />
              <p style={{ color: "#bbb", fontSize: "6.5pt", letterSpacing: "1.5px", margin: 0 }}>
                {isBoxPackage
                  ? "Doos verwacht binnen 2 weken · bewaardvoorjou.nl · Wij bewaren wat telt"
                  : "Geldig voor altijd · bewaardvoorjou.nl · Wij bewaren wat telt"}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
