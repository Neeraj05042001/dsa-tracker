"use client";

import { useState } from "react";
import { SM2Rating, RATING_META } from "@/lib/sm2";

interface RatingButtonsProps {
  onRate: (rating: SM2Rating) => void;
  disabled?: boolean;
}

function RatingButton({
  rating,
  onRate,
  disabled,
}: {
  rating: SM2Rating;
  onRate: (r: SM2Rating) => void;
  disabled?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const meta = RATING_META[rating];

  const handleClick = () => {
    if (disabled) return;
    setPressed(true);
    setTimeout(() => {
      setPressed(false);
      onRate(rating);
    }, 180);
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      disabled={disabled}
      title={`${meta.label} — ${meta.sublabel} (press ${meta.key})`}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        padding: "14px 8px",
        background: hovered || pressed
          ? `color-mix(in srgb, ${meta.color} ${pressed ? "22%" : "14%"}, var(--bg-elevated))`
          : "var(--bg-elevated)",
        border: `1px solid ${hovered || pressed
          ? `color-mix(in srgb, ${meta.color} ${pressed ? "50%" : "35%"}, var(--border-subtle))`
          : "var(--border-subtle)"}`,
        borderRadius: "var(--radius-md)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transform: pressed
          ? "scale(0.94) translateY(1px)"
          : hovered
          ? "scale(1.02) translateY(-1px)"
          : "scale(1) translateY(0)",
        boxShadow: pressed
          ? "none"
          : hovered
          ? `0 6px 20px rgba(0,0,0,0.3), 0 0 12px color-mix(in srgb, ${meta.color} 20%, transparent)`
          : "none",
        transition: pressed
          ? "all 0.1s ease"
          : "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Bottom fill — animates up on hover */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: hovered || pressed ? "100%" : "0%",
        background: `color-mix(in srgb, ${meta.color} 8%, transparent)`,
        transition: "height 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: "none",
      }} />

      {/* Keyboard hint */}
      <span style={{
        position: "absolute",
        top: 6, right: 7,
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        color: hovered ? meta.color : "var(--text-muted)",
        opacity: 0.7,
        transition: "color 0.15s",
      }}>
        {meta.key}
      </span>

      {/* Content */}
      <span style={{
        fontSize: 13,
        fontWeight: 700,
        color: hovered || pressed ? meta.color : "var(--text-secondary)",
        transition: "color 0.15s",
        position: "relative",
        zIndex: 1,
      }}>
        {meta.label}
      </span>
      <span style={{
        fontSize: 10,
        color: hovered || pressed
          ? `color-mix(in srgb, ${meta.color} 70%, var(--text-muted))`
          : "var(--text-muted)",
        transition: "color 0.15s",
        position: "relative",
        zIndex: 1,
        textAlign: "center",
        lineHeight: 1.3,
      }}>
        {meta.sublabel}
      </span>
    </button>
  );
}

export function RatingButtons({ onRate, disabled }: RatingButtonsProps) {
  return (
    <div style={{ width: "100%", maxWidth: 640, margin: "0 auto" }}>
      {/* Label */}
      <div style={{
        textAlign: "center",
        marginBottom: 12,
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        color: "var(--text-muted)",
      }}>
        How well did you recall this?
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        {([1, 2, 3, 4] as SM2Rating[]).map(r => (
          <RatingButton key={r} rating={r} onRate={onRate} disabled={disabled} />
        ))}
      </div>

      {/* Keyboard hint */}
      <div style={{
        textAlign: "center",
        marginTop: 8,
        fontSize: 10,
        color: "var(--text-muted)",
      }}>
        Press <kbd style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 3, padding: "1px 5px",
        }}>1</kbd>–<kbd style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 3, padding: "1px 5px",
        }}>4</kbd> to rate quickly
      </div>
    </div>
  );
}