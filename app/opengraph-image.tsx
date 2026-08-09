import { ImageResponse } from "next/og";

// Dynamic 1200x630 social card, generated at the edge. No bitmap to maintain,
// and it stays on brand automatically. Used by Facebook, LinkedIn, WhatsApp,
// Slack, X and iMessage link previews.
export const runtime = "edge";
export const alt = "Lintel Squared, tax, compliance and rent for UK landlords";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FAF8F3",
          padding: "72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 13,
              background: "#16233A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#F6F8FB",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            L
          </div>
          <div style={{ fontSize: 34, fontWeight: 600, color: "#14130F" }}>
            Lintel Squared
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 68, lineHeight: 1.05, color: "#14130F", letterSpacing: "-0.02em" }}>
            One platform.
          </div>
          <div style={{ fontSize: 68, lineHeight: 1.05, color: "#8A3324", letterSpacing: "-0.02em" }}>
            Everything handled.
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#4A4842", fontFamily: "sans-serif" }}>
            Tax, compliance, rent and agreements for UK landlords.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 24, color: "#4A4842", fontFamily: "sans-serif" }}>
          <div>lintelsquared.com</div>
          <div>Free until 31 August 2026</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
