"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DiffPoint = {
  index:  string;  // "A", "B", …
  total:  number;
  solved: number;
  pct:    number;  // 0–100
};

interface Props {
  points: DiffPoint[];
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const D = {
  surface:   "var(--bg-surface,  #111114)",
  elevated:  "var(--bg-elevated, #16161a)",
  border:    "rgba(255,255,255,0.07)",
  muted:     "var(--text-muted,     #52525b)",
  secondary: "var(--text-secondary, #a1a1aa)",
  primary:   "var(--text-primary,   #f4f4f5)",
  teal:      "#00d4aa",
  amber:     "#fbbf24",
  red:       "#f87171",
  green:     "#4ade80",
  mono:      "var(--font-mono, 'JetBrains Mono', monospace)",
  sans:      "var(--font-sans, system-ui, sans-serif)",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pColor(p: number): string {
  if (p === 100) return D.green;
  if (p >= 70)   return D.teal;
  if (p >= 40)   return D.amber;
  if (p > 0)     return D.red;
  return "rgba(255,255,255,0.15)";
}

/** First index where drop from previous > 20 percentage points */
function findDropIdx(pts: DiffPoint[]): number {
  for (let i = 1; i < pts.length; i++) {
    if (pts[i - 1].pct - pts[i].pct > 20) return i;
  }
  return -1;
}

/** Catmull-Rom spline */
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

/**
 * Decide which dots get a % label.
 * Rules: first, last, min, drop-off point, and any point that deviates
 * from both its neighbors by more than 8pp (local extrema).
 * This prevents the "100%100%100%" collision.
 */
function computeLabelSet(points: DiffPoint[], dropIdx: number): Set<number> {
  const set = new Set<number>();
  if (points.length === 0) return set;
  set.add(0);
  set.add(points.length - 1);

  // min point
  let minI = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].pct < points[minI].pct) minI = i;
  }
  set.add(minI);

  // drop-off
  if (dropIdx > 0) {
    set.add(dropIdx - 1);
    set.add(dropIdx);
  }

  // local extrema (deviation from both neighbors > 8pp)
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1].pct;
    const curr = points[i].pct;
    const next = points[i + 1].pct;
    if (Math.abs(curr - prev) > 8 && Math.abs(curr - next) > 8) set.add(i);
  }

  return set;
}

// ─── Stat chips ───────────────────────────────────────────────────────────────

function StatChips({
  points, dropIdx, visible,
}: { points: DiffPoint[]; dropIdx: number; visible: boolean }) {
  if (points.length === 0) return null;

  const avgRate = Math.round(
    points.reduce((s, p) => s + p.pct, 0) / points.length
  );
  const perfectCount = points.filter((p) => p.pct === 100).length;
  const wallPos      = dropIdx > 0 ? points[dropIdx].index : null;
  const lastSolved   = [...points].reverse().find((p) => p.pct > 0);

  const chips: { label: string; value: string; color: string; sub?: string }[] = [
    {
      label: "Avg Rate",
      value: `${avgRate}%`,
      color: pColor(avgRate),
      sub: "across all positions",
    },
    {
      label: "Perfect",
      value: `${perfectCount}`,
      color: D.green,
      sub: `position${perfectCount !== 1 ? "s" : ""} at 100%`,
    },
    {
      label: wallPos ? "Wall at" : "No Wall",
      value: wallPos ?? "—",
      color: wallPos ? D.red : D.teal,
      sub: wallPos
        ? `${Math.round(points[dropIdx - 1].pct - points[dropIdx].pct)}% drop`
        : "steady across all",
    },
    {
      label: "Hardest",
      value: lastSolved?.index ?? "—",
      color: D.amber,
      sub: lastSolved ? `${Math.round(lastSolved.pct)}% solve rate` : "",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 1,
        borderBottom: `1px solid ${D.border}`,
        background: "rgba(0,0,0,0.12)",
      }}
    >
      {chips.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 6 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.12 + i * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{
            padding: "10px 14px",
            borderRight: i < 3 ? `1px solid ${D.border}` : "none",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 700, color: D.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: D.mono }}>
            {c.label}
          </span>
          <span style={{ fontSize: 18, fontWeight: 800, color: c.color, fontFamily: D.mono, letterSpacing: "-0.03em", lineHeight: 1 }}>
            {c.value}
          </span>
          {c.sub && (
            <span style={{ fontSize: 9.5, color: D.muted, fontFamily: D.sans, lineHeight: 1.3 }}>
              {c.sub}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Zone map ─────────────────────────────────────────────────────────────────

function ZoneMap({ points, dropIdx, visible }: { points: DiffPoint[]; dropIdx: number; visible: boolean }) {
  if (points.length === 0) return null;

  // Build zones
  type Zone = { label: string; pct: number; count: number; color: string; isWall?: boolean };
  const zones: Zone[] = [];

  if (dropIdx <= 0) {
    // no wall — single zone
    const avg = Math.round(points.reduce((s, p) => s + p.pct, 0) / points.length);
    zones.push({
      label: `${points[0].index}–${points[points.length - 1].index}`,
      pct: avg,
      count: points.length,
      color: pColor(avg),
    });
  } else {
    // before wall
    const before = points.slice(0, dropIdx);
    const avgB   = Math.round(before.reduce((s, p) => s + p.pct, 0) / before.length);
    zones.push({
      label: `${before[0].index}–${before[before.length - 1].index}`,
      pct: avgB,
      count: before.length,
      color: pColor(avgB),
    });

    // wall point
    zones.push({
      label: points[dropIdx].index,
      pct: Math.round(points[dropIdx].pct),
      count: 1,
      color: D.red,
      isWall: true,
    });

    // after wall
    if (dropIdx + 1 < points.length) {
      const after = points.slice(dropIdx + 1);
      const avgA  = Math.round(after.reduce((s, p) => s + p.pct, 0) / after.length);
      zones.push({
        label: `${after[0].index}–${after[after.length - 1].index}`,
        pct: avgA,
        count: after.length,
        color: pColor(avgA),
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={visible ? { opacity: 1 } : {}}
      transition={{ delay: 1.6, duration: 0.5 }}
      style={{
        margin: "0 16px",
        padding: "8px 12px",
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${D.border}`,
        borderRadius: 8,
        display: "flex",
        alignItems: "stretch",
        gap: 0,
        overflow: "hidden",
        marginBottom: 10,
      }}
    >
      {zones.map((z, i) => (
        <div
          key={i}
          style={{
            flex: z.isWall ? "0 0 auto" : z.count,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            padding: "4px 8px",
            borderRight: i < zones.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
            background: z.isWall ? "rgba(248,113,113,0.06)" : "transparent",
            minWidth: z.isWall ? 48 : 0,
          }}
        >
          <span style={{ fontSize: 9, fontFamily: D.mono, color: D.muted, letterSpacing: "0.05em" }}>
            {z.label}
          </span>
          <span style={{ fontSize: 13, fontWeight: 800, color: z.color, fontFamily: D.mono, letterSpacing: "-0.02em" }}>
            {z.isWall ? "↓ WALL" : `${z.pct}%`}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

// ─── Multi-insight panel ──────────────────────────────────────────────────────

function InsightPanel({ points, dropIdx, visible }: { points: DiffPoint[]; dropIdx: number; visible: boolean }) {
  const [active, setActive] = useState(0);
  if (points.length === 0) return null;

  const weakest  = [...points].sort((a, b) => a.pct - b.pct)[0];
  const strongest = points.filter(p => p.pct === 100);
  const hasDrop   = dropIdx > 0;
  const recovered = hasDrop && points.slice(dropIdx + 1).some(p => p.pct >= 80);

  type Insight = { accent: string; label: string; text: React.ReactNode };
  const insights: Insight[] = [];

  // Insight 1: Wall / weakest
  if (hasDrop) {
    insights.push({
      accent: D.red,
      label: "Wall Detected",
      text: (
        <>
          Solve rate drops sharply at position{" "}
          <span style={{ color: D.red, fontWeight: 700 }}>{points[dropIdx].index}</span>
          {" "}({Math.round(points[dropIdx].pct)}% vs {Math.round(points[dropIdx - 1].pct)}% before).{" "}
          <span style={{ color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>
            Target {points[dropIdx].index}-level problems to break through.
          </span>
        </>
      ),
    });
  } else {
    insights.push({
      accent: D.teal,
      label: "Weakest Point",
      text: (
        <>
          Weakest position:{" "}
          <span style={{ color: D.teal, fontWeight: 700 }}>{weakest.index}</span>
          {" "}at {Math.round(weakest.pct)}% solve rate.{" "}
          <span style={{ color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>
            Prioritise {weakest.index}-level problems to level up.
          </span>
        </>
      ),
    });
  }

  // Insight 2: Strongest zone
  if (strongest.length > 0) {
    const run = strongest.map(p => p.index).join(", ");
    insights.push({
      accent: D.green,
      label: "Strongest Zone",
      text: (
        <>
          You're solving{" "}
          <span style={{ color: D.green, fontWeight: 700 }}>100%</span>
          {" "}at {strongest.length > 3
            ? `positions ${strongest[0].index}–${strongest[strongest.length - 1].index}`
            : `position${strongest.length > 1 ? "s" : ""} ${run}`}.{" "}
          <span style={{ color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>
            That's your comfort zone — push one tier harder.
          </span>
        </>
      ),
    });
  }

  // Insight 3: Recovery / next focus
  if (hasDrop) {
    if (recovered) {
      insights.push({
        accent: D.amber,
        label: "Recovery Detected",
        text: (
          <>
            Your rate recovers after the wall at{" "}
            <span style={{ color: D.amber, fontWeight: 700 }}>{points[dropIdx].index}</span>.{" "}
            <span style={{ color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>
              This suggests a specific gap — targeted practice at this position should close it quickly.
            </span>
          </>
        ),
      });
    } else {
      const avgAfter = Math.round(
        points.slice(dropIdx).reduce((s, p) => s + p.pct, 0) / points.slice(dropIdx).length
      );
      insights.push({
        accent: D.amber,
        label: "Next Focus",
        text: (
          <>
            Avg solve rate after the wall is{" "}
            <span style={{ color: D.amber, fontWeight: 700 }}>{avgAfter}%</span>.{" "}
            <span style={{ color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>
              Consistent exposure to {points[dropIdx].index}–{points[points.length - 1].index} problems will compound your rating gain.
            </span>
          </>
        ),
      });
    }
  } else {
    // No wall, third insight: consistency note
    const avgRate = Math.round(points.reduce((s, p) => s + p.pct, 0) / points.length);
    insights.push({
      accent: D.amber,
      label: "Consistency",
      text: (
        <>
          Overall avg of{" "}
          <span style={{ color: D.amber, fontWeight: 700 }}>{avgRate}%</span>
          {" "}with no major drop-off.{" "}
          <span style={{ color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>
            You're ready to attempt harder contests — push for {points[points.length - 1].index}+ problems.
          </span>
        </>
      ),
    });
  }

  const cur = insights[active] ?? insights[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 1.9, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        margin: "0 16px 16px",
        borderRadius: 10,
        overflow: "hidden",
        border: `1px solid ${cur.accent}28`,
        background: `${cur.accent}07`,
        position: "relative",
        transition: "border-color 0.3s, background 0.3s",
      }}
    >
      {/* Glow */}
      <div
        aria-hidden
        style={{
          position: "absolute", top: -16, right: -16,
          width: 60, height: 60, borderRadius: "50%",
          background: cur.accent, filter: "blur(20px)", opacity: 0.1,
          pointerEvents: "none",
        }}
      />

      {/* Tab row */}
      <div
        style={{
          display: "flex",
          borderBottom: `1px solid rgba(255,255,255,0.05)`,
        }}
      >
        {insights.map((ins, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              flex: 1,
              padding: "6px 4px",
              background: "none",
              border: "none",
              borderBottom: active === i ? `2px solid ${ins.accent}` : "2px solid transparent",
              color: active === i ? ins.accent : D.muted,
              fontSize: 9,
              fontWeight: 700,
              fontFamily: D.mono,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "color 0.15s, border-color 0.15s",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {i === 0 ? "✦" : i === 1 ? "◆" : "▲"} {ins.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          style={{ padding: "10px 13px" }}
        >
          <p style={{ margin: 0, fontSize: 11.5, color: "rgba(255,255,255,0.46)", lineHeight: 1.65 }}>
            {cur.text}
          </p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// ─── SVG chart ────────────────────────────────────────────────────────────────

function AreaChart({ points, inView }: { points: DiffPoint[]; inView: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovIdx, setHovIdx] = useState<number | null>(null);

  const W = 440, H = 155, PX = 20, PY = 24, PB = 22;

  if (points.length === 0) {
    return (
      <div style={{ padding: "48px 0", textAlign: "center", color: D.muted, fontSize: 12, fontFamily: D.sans }}>
        No position data yet
      </div>
    );
  }

  const pts = points.map((p, i) => ({
    x: PX + (i / Math.max(points.length - 1, 1)) * (W - PX * 2),
    y: PY + (1 - p.pct / 100) * (H - PY - PB),
    ...p,
  }));

  const linePath = catmullRom(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${H - PB} L ${pts[0].x} ${H - PB} Z`;

  const dropIdx = findDropIdx(points);
  const midX    = dropIdx > 0 ? (pts[dropIdx - 1].x + pts[dropIdx].x) / 2 : -9999;
  const dropAmt = dropIdx > 0 ? Math.round(points[dropIdx - 1].pct - points[dropIdx].pct) : 0;

  // Smart label set — prevents collision
  const labelSet = computeLabelSet(points, dropIdx);

  // Dot radius scaled by total (confidence encoding)
  const maxTotal = Math.max(...points.map(p => p.total), 1);
  function dotRadius(total: number, hov: boolean): number {
    const base = 3.5 + (total / maxTotal) * 2.5; // 3.5–6
    return hov ? base + 1.5 : base;
  }

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
        <linearGradient id="ps-teal-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#00d4aa" stopOpacity="0.22" />
          <stop offset="55%"  stopColor="#00d4aa" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#00d4aa" stopOpacity="0"    />
        </linearGradient>
        <linearGradient id="ps-red-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#f87171" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#f87171" stopOpacity="0.11" />
        </linearGradient>
        <filter id="ps-dot-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="ps-line-glow" x="-5%" y="-40%" width="110%" height="180%">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Volume bar gradient */}
        <linearGradient id="ps-vol-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines */}
      {[0, 25, 50, 75, 100].map(g => {
        const gy = PY + (1 - g / 100) * (H - PY - PB);
        return (
          <g key={g}>
            <line
              x1={PX} x2={W - PX} y1={gy} y2={gy}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3,6"
            />
            <text x={PX - 5} y={gy + 3.5} fontSize="7.5" fill="rgba(255,255,255,0.2)"
              fontFamily={D.mono} textAnchor="end">
              {g}%
            </text>
          </g>
        );
      })}

      {/* Volume bars — faint, behind the line, show total problems per position */}
      {pts.map((p, i) => {
        const barH  = ((p.total / maxTotal) * (H - PY - PB)) * 0.35;
        const barW  = Math.max(6, (W - PX * 2) / points.length - 2);
        return (
          <rect
            key={`vol-${i}`}
            x={p.x - barW / 2}
            y={H - PB - barH}
            width={barW}
            height={barH}
            rx="2"
            fill="url(#ps-vol-grad)"
          />
        );
      })}

      {/* Red wash */}
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

      {/* Area fill */}
      <motion.path
        d={areaPath}
        fill="url(#ps-teal-grad)"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.75, duration: 0.9 }}
      />

      {/* Line */}
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

      {/* Dots */}
      {pts.map((p, i) => {
        const isHov   = hovIdx === i;
        const isDrop  = dropIdx > 0 && i >= dropIdx;
        const dotC    = isDrop ? D.red : D.teal;
        const r       = dotRadius(p.total, isHov);
        const showLbl = labelSet.has(i) || isHov;

        return (
          <g key={p.index}>
            {isHov && (
              <motion.circle
                cx={p.x} cy={p.y} r={14}
                fill={`${dotC}10`}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              />
            )}

            {/* Confidence ring — larger = more problems = more reliable */}
            {p.total > 1 && (
              <circle
                cx={p.x} cy={p.y}
                r={r + 2.5}
                fill="none"
                stroke={`${dotC}18`}
                strokeWidth="1"
              />
            )}

            <motion.circle
              cx={p.x} cy={p.y}
              r={r}
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

            {/* SMART label — only on notable points or hovered */}
            {showLbl && (
              <motion.text
                x={p.x}
                y={p.y - r - 5}
                textAnchor="middle"
                fontSize={isHov ? 9.5 : 8}
                fontFamily={D.mono}
                fontWeight="700"
                fill={
                  isHov
                    ? dotC
                    : isDrop
                      ? "rgba(248,113,113,0.72)"
                      : "rgba(0,212,170,0.72)"
                }
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.76 + i * 0.075 }}
              >
                {p.pct > 0 ? `${Math.round(p.pct)}%` : "—"}
              </motion.text>
            )}

            {/* Position letter at baseline */}
            <motion.text
              x={p.x} y={H - 5}
              textAnchor="middle"
              fontSize="10"
              fontFamily={D.mono}
              fontWeight="700"
              fill={isDrop ? "rgba(248,113,113,0.55)" : "rgba(0,212,170,0.55)"}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.45 + i * 0.062 }}
            >
              {p.index}
            </motion.text>
          </g>
        );
      })}

      {/* Drop-off badge — repositioned to avoid label cloud */}
      {dropIdx > 0 && (
        <motion.g
          initial={{ opacity: 0, y: -10, scale: 0.82 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ delay: 1.5, type: "spring", stiffness: 320, damping: 22 }}
        >
          <rect
            x={midX - 42} y={H - PB - 30}
            width={84} height={17}
            rx="5"
            fill="rgba(248,113,113,0.12)"
            stroke="rgba(248,113,113,0.35)"
            strokeWidth="1"
          />
          <text
            x={midX} y={H - PB - 17.5}
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
          const tx = Math.max(Math.min(p.x, W - 54), 54);
          const ty = p.y > H / 2 ? p.y - 58 : p.y + 16;
          return (
            <motion.g
              key="tooltip"
              initial={{ opacity: 0, scale: 0.84 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.84 }}
              transition={{ duration: 0.13 }}
            >
              <rect
                x={tx - 48} y={ty} width={96} height={44}
                rx="7"
                fill={D.elevated}
                stroke={`${dc}48`}
                strokeWidth="1"
                style={{ filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.7))" }}
              />
              <text x={tx} y={ty + 15} textAnchor="middle" fontSize="10.5"
                fontFamily={D.mono} fontWeight="700" fill={dc}>
                Pos {p.index} · {Math.round(p.pct)}%
              </text>
              <text x={tx} y={ty + 29} textAnchor="middle" fontSize="9"
                fontFamily={D.mono} fill={D.muted}>
                {p.solved}/{p.total} solved
              </text>
              <text x={tx} y={ty + 41} textAnchor="middle" fontSize="8"
                fontFamily={D.mono} fill="rgba(255,255,255,0.18)">
                {p.total === 1 ? "1 problem — low confidence" : `${p.total} problems`}
              </text>
            </motion.g>
          );
        })()}
      </AnimatePresence>
    </svg>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function PerformanceSection({ points }: Props) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const lastPos  = points[points.length - 1]?.index ?? "?";
  const dropIdx  = findDropIdx(points);

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
      {/* Ambient glow */}
      <div
        aria-hidden
        style={{
          position: "absolute", top: -40, right: -40,
          width: 160, height: 160, borderRadius: "50%",
          background: "#f59e0b", filter: "blur(65px)",
          opacity: 0.035, pointerEvents: "none",
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
          style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: D.muted }}
        >
          Performance by Position
        </motion.span>
        <span style={{ fontSize: 9.5, fontFamily: D.mono, color: D.muted }}>
          A → {lastPos} · hardest
        </span>
      </div>

      {/* ── Stat chips ─────────────────────────────────────────────────────── */}
      <StatChips points={points} dropIdx={dropIdx} visible={inView} />

      {/* ── Chart ──────────────────────────────────────────────────────────── */}
      <div style={{ padding: "18px 16px 8px", flex: 1 }}>
        <AreaChart points={points} inView={inView} />
      </div>

      {/* ── Zone map ───────────────────────────────────────────────────────── */}
      <ZoneMap points={points} dropIdx={dropIdx} visible={inView} />

      {/* ── 3-tab insight panel ────────────────────────────────────────────── */}
      <InsightPanel points={points} dropIdx={dropIdx} visible={inView} />

      {/* ── Bottom accent ──────────────────────────────────────────────────── */}
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