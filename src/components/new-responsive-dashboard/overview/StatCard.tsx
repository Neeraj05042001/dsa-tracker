"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;        // platform color — defaults to var(--accent) teal
  suffix?: string;
  sublabel?: string;
  delay?: number;
  dimWhenZero?: boolean;
}

function useCountUp(target: number, duration = 700, delay = 0) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (target === 0) { setValue(0); return; }
      const start = performance.now();
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) raf.current = requestAnimationFrame(animate);
      };
      raf.current = requestAnimationFrame(animate);
    }, delay);
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf.current); };
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
  dimWhenZero = false,
}: StatCardProps) {
  const displayed = useCountUp(value, 700, delay);
  const isEmpty = dimWhenZero && value === 0;
  const color = isEmpty ? "var(--text-muted)" : (accent ?? "var(--accent)");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      whileHover={isEmpty ? {} : {
        y: -3,
        boxShadow: `0 8px 32px color-mix(in srgb, ${color} 18%, transparent), 0 0 0 1px color-mix(in srgb, ${color} 28%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
      }}
      className="card"
      style={{
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        border: "1px solid var(--border-subtle)",
        transition: "border-color 0.25s",
      }}
    >
      {/* Glow blob top-right — color matches accent */}
      <div style={{
        position: "absolute",
        top: -28,
        right: -28,
        width: 100,
        height: 100,
        borderRadius: "50%",
        background: color,
        opacity: isEmpty ? 0.03 : 0.08,
        filter: "blur(28px)",
        pointerEvents: "none",
        transition: "opacity 0.3s",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontFamily: "var(--font-sans)",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}>
          {label}
        </span>

        {/* Icon box — accent-colored */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 6 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-md)",
            background: `color-mix(in srgb, ${color} 14%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color} 24%, transparent)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: color,
            flexShrink: 0,
            transition: "background 0.3s, border-color 0.3s, color 0.3s",
          }}
        >
          {icon}
        </motion.div>
      </div>

      {/* Value — accent-colored number */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span style={{
          fontSize: 34,
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
          color: color,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          opacity: isEmpty ? 0.35 : 1,
          transition: "color 0.3s, opacity 0.3s",
        }}>
          {displayed}
        </span>
        {suffix && (
          <span style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            fontWeight: 500,
            fontFamily: "var(--font-sans)",
          }}>
            {suffix}
          </span>
        )}
      </div>

      {/* Sublabel */}
      {sublabel && (
        <span style={{
          fontSize: 11,
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
          marginTop: -6,
          letterSpacing: "0.01em",
        }}>
          {sublabel}
        </span>
      )}

      {/* Bottom accent line — animates in from left, uses platform color */}
      {!isEmpty && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.65, delay: delay / 1000 + 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg, ${color}, transparent)`,
            transformOrigin: "left",
            opacity: 0.5,
          }}
        />
      )}
    </motion.div>
  );
}