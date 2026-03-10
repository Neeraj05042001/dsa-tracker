"use client";



import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DiffPoint = {
  index:  string;   // "A", "B", …
  total:  number;
  solved: number;
  pct:    number;   // 0-100
};

interface Props {
  points: DiffPoint[];
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const D = {
  surface:  "var(--bg-surface,  #111114)",
  elevated: "var(--bg-elevated, #16161a)",
  border:   "rgba(255,255,255,0.07)",
  muted:    "var(--text-muted,     #52525b)",
  secondary:"var(--text-secondary, #a1a1aa)",
  primary:  "var(--text-primary,   #f4f4f5)",
  teal:     "#00d4aa",
  amber:    "#fbbf24",
  red:      "#f87171",
  green:    "#4ade80",
  mono:     "var(--font-mono, 'JetBrains Mono', monospace)",
  sans:     "var(--font-sans, system-ui, sans-serif)",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pColor(p: number): string {
  if (p === 100) return D.green;
  if (p >= 70)   return D.teal;
  if (p >= 40)   return D.amber;
  if (p > 0)     return D.red;
  return "rgba(255,255,255,0.15)";
}

/** First index where drop from previous is > 20 percentage points */
function findDropIdx(pts: DiffPoint[]): number {
  for (let i = 1; i < pts.length; i++) {
    if (pts[i - 1].pct - pts[i].pct > 20) return i;
  }
  return -1;
}

/** Catmull-Rom spline through an array of {x,y} points */
function catmullRom(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

// ─── SVG chart ────────────────────────────────────────────────────────────────

function AreaChart({ points }: { points: DiffPoint[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const inView = useInView(svgRef as React.RefObject<Element>, {
    once: true,
    margin: "-40px",
  });
  const [hovIdx, setHovIdx] = useState<number | null>(null);

  // Viewport
  const W = 440, H = 155, PX = 20, PY = 24, PB = 22;

  if (points.length === 0) {
    return (
      <div
        style={{
          padding: "48px 0",
          textAlign: "center",
          color: D.muted,
          fontSize: 12,
          fontFamily: D.sans,
        }}
      >
        No position data yet
      </div>
    );
  }

  // Map data → SVG coords
  const pts = points.map((p, i) => ({
    x: PX + (i / Math.max(points.length - 1, 1)) * (W - PX * 2),
    y: PY + (1 - p.pct / 100) * (H - PY - PB),
    ...p,
  }));

  const linePath = catmullRom(pts);
  const areaPath =
    `${linePath} L ${pts[pts.length - 1].x} ${H - PB} L ${pts[0].x} ${H - PB} Z`;

  const dropIdx = findDropIdx(points);
  const midX    = dropIdx > 0 ? (pts[dropIdx - 1].x + pts[dropIdx].x) / 2 : -9999;
  const dropAmt = dropIdx > 0 ? Math.round(points[dropIdx - 1].pct - points[dropIdx].pct) : 0;

  return (
    <svg
      ref={svgRef}
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      style={{ overflow: "visible", display: "block" }}
      role="img"
      aria-label="Performance by position chart"
    >
      <defs>
        {/* Teal area gradient */}
        <linearGradient id="ps-teal-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#00d4aa" stopOpacity="0.2" />
          <stop offset="55%"  stopColor="#00d4aa" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#00d4aa" stopOpacity="0" />
        </linearGradient>
        {/* Red zone wash */}
        <linearGradient id="ps-red-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#f87171" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#f87171" stopOpacity="0.1" />
        </linearGradient>
        {/* Glow filter for dots */}
        <filter id="ps-dot-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Subtle glow for line */}
        <filter id="ps-line-glow" x="-5%" y="-40%" width="110%" height="180%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Horizontal grid lines + % labels */}
      {[0, 25, 50, 75, 100].map(g => {
        const gy = PY + (1 - g / 100) * (H - PY - PB);
        return (
          <g key={g}>
            <line
              x1={PX} x2={W - PX} y1={gy} y2={gy}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
              strokeDasharray="3,6"
            />
            <text
              x={PX - 5} y={gy + 3.5}
              fontSize="7.5"
              fill="rgba(255,255,255,0.2)"
              fontFamily={D.mono}
              textAnchor="end"
            >
              {g}%
            </text>
          </g>
        );
      })}

      {/* Red wash — right of drop-off */}
      {dropIdx > 0 && (
        <motion.rect
          x={midX - 1} y={PY - 6}
          width={W - midX - PX + 6}
          height={H - PY - PB + 12}
          fill="url(#ps-red-grad)"
          rx="5"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.3, duration: 0.7 }}
        />
      )}

      {/* Area fill — fades in after line draws */}
      <motion.path
        d={areaPath}
        fill="url(#ps-teal-grad)"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.75, duration: 0.9 }}
      />

      {/* The line — draws itself via pathLength */}
      <motion.path
        d={linePath}
        fill="none"
        stroke="#00d4aa"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "url(#ps-line-glow)" }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={inView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ delay: 0.1, duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Drop-off dashed vertical */}
      {dropIdx > 0 && (
        <motion.line
          x1={midX} y1={PY - 6} x2={midX} y2={H - PB + 2}
          stroke="rgba(248,113,113,0.5)"
          strokeWidth="1.5"
          strokeDasharray="4,4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ delay: 1.22, duration: 0.4 }}
        />
      )}

      {/* Dots — spring in one by one */}
      {pts.map((p, i) => {
        const isHov  = hovIdx === i;
        const isDrop = dropIdx > 0 && i >= dropIdx;
        const dotC   = isDrop ? D.red : D.teal;

        return (
          <g key={p.index}>
            {/* Hover ripple */}
            {isHov && (
              <motion.circle
                cx={p.x} cy={p.y} r={12}
                fill={`${dotC}12`}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              />
            )}

            {/* Dot */}
            <motion.circle
              cx={p.x} cy={p.y}
              r={isHov ? 6 : 4.5}
              fill={D.elevated}
              stroke={dotC}
              strokeWidth={isHov ? 2.5 : 2}
              style={{
                cursor: "pointer",
                filter: isHov ? "url(#ps-dot-glow)" : "none",
                transition: "r 0.13s, stroke-width 0.13s",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : {}}
              transition={{
                delay: 0.55 + i * 0.075,
                type: "spring",
                stiffness: 450,
                damping: 20,
              }}
              onHoverStart={() => setHovIdx(i)}
              onHoverEnd={() => setHovIdx(null)}
            />

            {/* % label above dot */}
            <motion.text
              x={p.x} y={p.y - 10}
              textAnchor="middle"
              fontSize="8.5"
              fontFamily={D.mono}
              fontWeight="700"
              fill={
                isHov
                  ? dotC
                  : isDrop
                    ? "rgba(248,113,113,0.62)"
                    : "rgba(0,212,170,0.62)"
              }
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.76 + i * 0.075 }}
            >
              {p.pct > 0 ? `${Math.round(p.pct)}%` : "—"}
            </motion.text>

            {/* Position letter at baseline */}
            <motion.text
              x={p.x} y={H - 5}
              textAnchor="middle"
              fontSize="10"
              fontFamily={D.mono}
              fontWeight="700"
              fill={
                isDrop
                  ? "rgba(248,113,113,0.55)"
                  : "rgba(0,212,170,0.55)"
              }
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.45 + i * 0.062 }}
            >
              {p.index}
            </motion.text>
          </g>
        );
      })}

      {/* Drop-off annotation badge */}
      {dropIdx > 0 && (
        <motion.g
          initial={{ opacity: 0, y: -10, scale: 0.82 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{
            delay: 1.5,
            type: "spring",
            stiffness: 320,
            damping: 22,
          }}
        >
          <rect
            x={midX - 42} y={PY - 21}
            width={84} height={17}
            rx="5"
            fill="rgba(248,113,113,0.12)"
            stroke="rgba(248,113,113,0.35)"
            strokeWidth="1"
          />
          <text
            x={midX} y={PY - 8.5}
            textAnchor="middle"
            fontSize="8.5"
            fontFamily={D.mono}
            fontWeight="700"
            fill={D.red}
          >
            ↓ {dropAmt}% drop-off
          </text>
        </motion.g>
      )}

      {/* Hover tooltip */}
      <AnimatePresence>
        {hovIdx !== null && (() => {
          const p  = pts[hovIdx];
          const dc = dropIdx > 0 && hovIdx >= dropIdx ? D.red : D.teal;
          // Clamp horizontally so tooltip stays inside SVG
          const tx = Math.max(Math.min(p.x, W - 54), 54);
          const ty = p.y > H / 2 ? p.y - 54 : p.y + 14;
          return (
            <motion.g
              key="tooltip"
              initial={{ opacity: 0, scale: 0.84 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.84 }}
              transition={{ duration: 0.13 }}
            >
              <rect
                x={tx - 48} y={ty} width={96} height={40}
                rx="7"
                fill={D.elevated}
                stroke={`${dc}48`}
                strokeWidth="1"
                style={{ filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.7))" }}
              />
              <text
                x={tx} y={ty + 15}
                textAnchor="middle"
                fontSize="10.5"
                fontFamily={D.mono}
                fontWeight="700"
                fill={dc}
              >
                Pos {p.index} · {Math.round(p.pct)}%
              </text>
              <text
                x={tx} y={ty + 30}
                textAnchor="middle"
                fontSize="9"
                fontFamily={D.mono}
                fill={D.muted}
              >
                {p.solved}/{p.total} solved
              </text>
            </motion.g>
          );
        })()}
      </AnimatePresence>
    </svg>
  );
}

// ─── Insight card ─────────────────────────────────────────────────────────────

function InsightCard({
  points,
  visible,
}: {
  points: DiffPoint[];
  visible: boolean;
}) {
  if (points.length === 0) return null;

  const dropIdx = findDropIdx(points);
  const weakest = [...points].sort((a, b) => a.pct - b.pct)[0];
  const hasDrop = dropIdx > 0;
  const accent  = hasDrop ? D.red : D.teal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 1.85, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        margin: "0 16px 16px",
        padding: "10px 13px",
        background: hasDrop
          ? "rgba(248,113,113,0.05)"
          : "rgba(0,212,170,0.05)",
        border: `1px solid ${hasDrop ? "rgba(248,113,113,0.16)" : "rgba(0,212,170,0.14)"}`,
        borderRadius: 10,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow blob */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -16, right: -16,
          width: 60, height: 60,
          borderRadius: "50%",
          background: accent,
          filter: "blur(20px)",
          opacity: 0.09,
        }}
      />

      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: accent,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 5,
          fontFamily: D.mono,
        }}
      >
        ✦ Insight
      </div>

      {hasDrop ? (
        <p
          style={{
            margin: 0,
            fontSize: 11.5,
            color: "rgba(255,255,255,0.46)",
            lineHeight: 1.65,
          }}
        >
          Solve rate drops sharply at position{" "}
          <span style={{ color: D.red, fontWeight: 700 }}>
            {points[dropIdx].index}
          </span>
          {" "}({Math.round(points[dropIdx].pct)}% vs{" "}
          {Math.round(points[dropIdx - 1].pct)}% before).{" "}
          <span style={{ color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>
            Target {points[dropIdx].index}-level problems to break through.
          </span>
        </p>
      ) : (
        <p
          style={{
            margin: 0,
            fontSize: 11.5,
            color: "rgba(255,255,255,0.46)",
            lineHeight: 1.65,
          }}
        >
          Weakest position:{" "}
          <span style={{ color: D.teal, fontWeight: 700 }}>
            {weakest.index}
          </span>
          {" "}at {Math.round(weakest.pct)}% solve rate.{" "}
          <span style={{ color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>
            Prioritise those problems to level up.
          </span>
        </p>
      )}
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function PerformanceSection({ points }: Props) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const lastPos = points[points.length - 1]?.index ?? "?";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: D.surface,
        border: `1px solid ${D.border}`,
        borderRadius: 14,
        overflow: "hidden",
        position: "relative",
        fontFamily: D.sans,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Amber ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -40, right: -40,
          width: 160, height: 160,
          borderRadius: "50%",
          background: "#f59e0b",
          filter: "blur(65px)",
          opacity: 0.035,
          pointerEvents: "none",
        }}
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: `1px solid ${D.border}`,
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        <motion.span
          initial={{ opacity: 0, letterSpacing: "0.3em" }}
          animate={inView ? { opacity: 1, letterSpacing: "0.1em" } : {}}
          transition={{ duration: 0.45, delay: 0.1 }}
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: D.muted,
          }}
        >
          Performance by Position
        </motion.span>
        <span
          style={{
            fontSize: 9.5,
            fontFamily: D.mono,
            color: D.muted,
          }}
        >
          A → {lastPos} · hardest
        </span>
      </div>

      {/* ── Chart ──────────────────────────────────────────────────────────── */}
      <div style={{ padding: "18px 16px 8px", flex: 1 }}>
        <AreaChart points={points} />
      </div>

      {/* ── Insight ────────────────────────────────────────────────────────── */}
      <InsightCard points={points} visible={inView} />

      {/* ── Bottom accent (red — drop-off narrative) ────────────────────────── */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          height: 2,
          background: `linear-gradient(90deg, ${D.red}, rgba(248,113,113,0.3), transparent)`,
          transformOrigin: "left",
          opacity: 0.45,
        }}
      />
    </motion.div>
  );
}