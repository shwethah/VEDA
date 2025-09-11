import { useState } from "react";
import type { CSSProperties } from "react";
import "../styles/zoomcontrols.css";

export type ZoomControlPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

type ZoomControlProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  disabledIn?: boolean;
  disabledOut?: boolean;
  position?: ZoomControlPosition;
  zIndex?: number; 
};

export default function ZoomControls({
  onZoomIn,
  onZoomOut,
  disabledIn,
  disabledOut,
  position = "top-right",
  zIndex = 1000, // keep over the map
}: ZoomControlProps & { zIndex?: number }) {
  const pad = 12;
  const base: CSSProperties = { position: "absolute", zIndex, pointerEvents: "auto" };
  const posStyle: CSSProperties =
    position === "top-left"
      ? { ...base, top: pad, left: pad }
      : position === "top-right"
      ? { ...base, top: pad, right: pad }
      : position === "bottom-left"
      ? { ...base, bottom: pad, left: pad }
      : { ...base, bottom: pad, right: pad };

  const box: CSSProperties = {
    width: 44,
    borderRadius: 14,
    background: "#ffffff",
    border: "1px solid #E5E7EB",
    boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  const btn: CSSProperties = {
    width: "100%",
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
    border: "none",
    cursor: "pointer",
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    padding: 0,
    userSelect: "none",
    outline: "none",                 // ⬅️ inline fallback
    WebkitTapHighlightColor: "transparent", // ⬅️ iOS/Safari
    boxShadow: "none",               // ⬅️ inline fallback
  };

  const btnHover: CSSProperties = { background: "#F9FAFB" };
  const btnDisabled: CSSProperties = { color: "#9CA3AF", cursor: "not-allowed" };

  const [hoverTop, setHoverTop] = useState(false);
  const [hoverBottom, setHoverBottom] = useState(false);

  return (
    <div style={posStyle} aria-label="Zoom controls">
      <div style={box}>
        <button
          className="zoom-btn"   // ⬅️ use the CSS class
          aria-label="Zoom in"
          title="Zoom in"
          disabled={disabledIn}
          onClick={onZoomIn}
          onMouseEnter={() => setHoverTop(true)}
          onMouseLeave={() => setHoverTop(false)}
          style={{
            ...btn,
            ...(hoverTop && !disabledIn ? btnHover : null),
            ...(disabledIn ? btnDisabled : null),
          }}
        >
          +
        </button>
        <div style={{ height: 1, background: "#E5E7EB" }} />
        <button
          className="zoom-btn"   // ⬅️ use the CSS class
          aria-label="Zoom out"
          title="Zoom out"
          disabled={disabledOut}
          onClick={onZoomOut}
          onMouseEnter={() => setHoverBottom(true)}
          onMouseLeave={() => setHoverBottom(false)}
          style={{
            ...btn,
            ...(hoverBottom && !disabledOut ? btnHover : null),
            ...(disabledOut ? btnDisabled : null),
          }}
        >
          −
        </button>
      </div>
    </div>
  );
}