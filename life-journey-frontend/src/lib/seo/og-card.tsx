import { ImageResponse } from "next/og";

/**
 * Gedeelde deelafbeelding (Open Graph / Twitter) voor landingspagina's.
 *
 * Waarom: een pagina die zelf `openGraph` in zijn metadata zet, overschrijft
 * die van de root-layout in zijn geheel, inclusief de afbeelding. Zonder eigen
 * `opengraph-image.tsx` toont een gedeelde link in WhatsApp of Facebook dan
 * geen plaatje. Dit bestand houdt de huisstijl van die kaarten op één plek.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export interface OgCardProps {
  title: string;
  subtitle: string;
  description: string;
  /** Maximaal drie korte punten voor de onderbalk. */
  bullets: string[];
}

export function renderOgCard({ title, subtitle, description, bullets }: OgCardProps): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 60%, #1e1a0e 100%)",
          fontFamily: "Georgia, serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(234,111,42,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", padding: "64px", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(234,111,42,0.2)",
              border: "1px solid rgba(234,111,42,0.4)",
              borderRadius: "50px",
              padding: "8px 20px",
              alignSelf: "flex-start",
            }}
          >
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ea6f2a" }} />
            <span style={{ color: "#f5c49a", fontSize: "18px", fontFamily: "sans-serif" }}>
              BewaardVoorJou.nl
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "64px", fontWeight: "bold", color: "#ffffff", lineHeight: "1.1" }}>
              {title}
            </div>
            <div style={{ fontSize: "42px", color: "#ea6f2a", lineHeight: "1.2" }}>{subtitle}</div>
          </div>

          <div
            style={{
              fontSize: "26px",
              color: "rgba(255,255,255,0.80)",
              lineHeight: "1.4",
              fontFamily: "sans-serif",
              maxWidth: "760px",
            }}
          >
            {description}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "32px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {bullets.map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "rgba(255,255,255,0.75)",
                  fontSize: "18px",
                  fontFamily: "sans-serif",
                }}
              >
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#4ade80" }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
