"use client";

import { useEffect, useRef, useState } from "react";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;        // CSS color string, defaults to var(--accent)
  suffix?: string;        // e.g. " days"
  sublabel?: string;      // small text below value
  delay?: number;         // animation delay in ms
}

// Animates a number from 0 to target over ~600ms
function useCountUp(target: number, duration = 600, delay = 0) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) raf.current = requestAnimationFrame(animate);
      };
      raf.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf.current);
    };
  }, [target, duration, delay]);

  return value;
}

export function StatCard({
  label,
  value,
  icon,
  accent,
  suffix = "",
  sublabel,
  delay = 0,
}: StatCardProps) {
  const displayed = useCountUp(value, 700, delay);
  const color = accent ?? "var(--accent)";

  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        animationDelay: `${delay}ms`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle accent glow top-right */}
      <div style={{
        position: "absolute",
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: color,
        opacity: 0.06,
        filter: "blur(20px)",
        pointerEvents: "none",
      }} />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="text-section-header">{label}</span>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: "var(--radius-md)",
          background: `color-mix(in srgb, ${color} 12%, transparent)`,
          border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{
          fontSize: 32,
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
          color: color,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}>
          {displayed}
        </span>
        {suffix && (
          <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
            {suffix}
          </span>
        )}
      </div>

      {/* Sublabel */}
      {sublabel && (
        <span style={{ fontSize: 12, color: "var(--text-muted)", marginTop: -4 }}>
          {sublabel}
        </span>
      )}
    </div>
  );
}