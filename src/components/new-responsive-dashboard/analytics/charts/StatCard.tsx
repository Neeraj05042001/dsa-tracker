"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
  suffix?: string;
  sublabel?: string;
  delay?: number;
  dimWhenZero?: boolean;
  sparkline?: number[];
}

function useCountUp(target: number, duration = 700, delay = 0) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
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
  dimWhenZero = false,
  sparkline,
}: StatCardProps) {
  const displayed = useCountUp(value, 700, delay);
  const baseColor = accent ?? "var(--accent)";
  const isEmpty = dimWhenZero && value === 0;
  const color = isEmpty ? "var(--text-muted)" : baseColor;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: delay / 1000,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -4,
        scale: 1.025,
        transition: { type: "spring", stiffness: 400, damping: 22 },
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        boxShadow: hovered
          ? `0 12px 36px -4px color-mix(in srgb, ${color} 22%, transparent), 0 0 0 1px color-mix(in srgb, ${color} 18%, transparent)`
          : "none",
        transition: "box-shadow 0.3s ease",
      }}
    >
      {/* Ambient glow */}
      <motion.div
        animate={{ opacity: hovered ? 0.14 : 0.06, scale: hovered ? 1.4 : 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{
          position: "absolute",
          top: -24,
          right: -24,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: color,
          filter: "blur(22px)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span className="text-section-header">{label}</span>
        <motion.div
          animate={hovered ? { rotate: [0, -10, 10, -5, 0] } : { rotate: 0 }}
          transition={{ duration: 0.45 }}
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-md)",
            background: `color-mix(in srgb, ${color} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color} 22%, transparent)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </motion.div>
      </div>

      {/* Value */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span
          style={{
            fontSize: 32,
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            color,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            opacity: isEmpty ? 0.5 : 1,
            transition: "opacity 0.3s",
          }}
        >
          {displayed}
        </span>
        {suffix && (
          <span
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              fontWeight: 500,
            }}
          >
            {suffix}
          </span>
        )}
      </div>

      {sublabel && (
        <span
          style={{ fontSize: 12, color: "var(--text-muted)", marginTop: -4 }}
        >
          {sublabel}
        </span>
      )}

      {/* Sparkline */}
      {sparkline && sparkline.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <div style={{ height: 26 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sparkline.map((v, i) => ({ v, i }))}
                barSize={5}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <Bar dataKey="v" radius={[2, 2, 0, 0]}>
                  {sparkline.map((v, i) => (
                    <Cell
                      key={i}
                      fill={
                        v > 0
                          ? `color-mix(in srgb, ${color} ${hovered ? 85 : 55}%, transparent)`
                          : "var(--bg-elevated)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 9,
              color: "var(--text-muted)",
              marginTop: 2,
              fontFamily: "var(--font-mono)",
            }}
          >
            <span>7d ago</span>
            <span>today</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
