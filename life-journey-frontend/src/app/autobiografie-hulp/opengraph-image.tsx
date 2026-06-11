import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Autobiografie schrijven — Hulp & AI-begeleiding in het Nederlands | BewaardVoorJou.nl";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
        {/* Decorative warm glow */}
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

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", padding: "64px", gap: "24px" }}>
          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(234,111,42,0.2)",
              border: "1px solid rgba(234,111,42,0.4)",
              borderRadius: "50px",
              padding: "8px 20px",
              width: "fit-content",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#ea6f2a",
              }}
            />
            <span style={{ color: "#f5c49a", fontSize: "18px", fontFamily: "sans-serif" }}>
              BewaardVoorJou.nl
            </span>
          </div>

          {/* Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h1
              style={{
                fontSize: "64px",
                fontWeight: "bold",
                color: "#ffffff",
                lineHeight: "1.1",
                margin: "0",
              }}
            >
              Hulp bij je autobiografie
            </h1>
            <h2
              style={{
                fontSize: "42px",
                fontWeight: "normal",
                color: "#ea6f2a",
                lineHeight: "1.2",
                margin: "0",
              }}
            >
              AI-begeleiding in het Nederlands
            </h2>
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: "26px",
              color: "rgba(255,255,255,0.80)",
              lineHeight: "1.4",
              margin: "0",
              fontFamily: "sans-serif",
              fontWeight: "normal",
              maxWidth: "700px",
            }}
          >
            Geen schrijfervaring nodig. Jij vertelt — wij structureren.
          </p>

          {/* Bottom bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "32px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {["Gratis starten", "58 hoofdstukken", "100% AVG-veilig"].map((item) => (
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
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "#4ade80",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ color: "#fff", fontSize: "12px", fontWeight: "bold" }}>✓</div>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
