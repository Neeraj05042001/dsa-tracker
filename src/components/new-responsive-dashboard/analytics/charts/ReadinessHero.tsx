"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { ProblemStats } from "@/types";

// ─── Readiness computation ────────────────────────────────────────────────────

interface ReadinessResult {
  total: number;
  consistency: number;
  difficulty_spread: number;
  confidence_avg: number;
  revision_discipline: number;
  verdict: "Excellent" | "On Track" | "Needs Work" | "Getting Started";
  verdict_detail: string;
  verdict_color: string;
}

function computeReadiness(stats: ProblemStats): ReadinessResult {
  const total = stats.total;
  const last14 = stats.daily_activity.slice(-14);
  const activeDays = last14.filter(d => d.count > 0).length;
  const consistency = Math.min(100, Math.round((activeDays / 14) * 100));
  const medHard = stats.by_difficulty.medium + stats.by_difficulty.hard;
  const diffSpread = total === 0 ? 0 : Math.min(100, Math.round((medHard / total) * 100 * 1.43));
  const confScore = Math.round(stats.avg_confidence * 100);
  const revDiscipline = total === 0 ? 0
    : Math.min(100, Math.round((1 - stats.needs_revision_count / Math.max(total, 1)) * 100));
  const weighted = Math.round(consistency * 0.25 + diffSpread * 0.25 + confScore * 0.25 + revDiscipline * 0.25);

  const verdict = weighted >= 80 ? "Excellent" : weighted >= 60 ? "On Track" : weighted >= 30 ? "Needs Work" : "Getting Started";
  const verdictDetail =
    weighted >= 80 ? "You're consistently solving and retaining well."
    : weighted >= 60 ? "Good momentum — push harder on medium/hard problems."
    : weighted >= 30
      ? consistency < 40 ? "Practice more consistently — even 1 problem a day compounds."
        : diffSpread < 40 ? "Too many easy problems — start targeting medium difficulty."
        : "Keep reviewing flagged problems to strengthen retention."
    : "Just getting started — build a daily habit first.";
  const verdictColor = weighted >= 80 ? "var(--easy)" : weighted >= 60 ? "var(--accent)" : weighted >= 30 ? "var(--medium)" : "var(--hard)";

  return { total: weighted, consistency, difficulty_spread: diffSpread, confidence_avg: confScore, revision_discipline: revDiscipline, verdict, verdict_detail: verdictDetail, verdict_color: verdictColor };
}

// ─── Animated SVG ring (Framer spring with overshoot) ─────────────────────────

const RING_SIZE = 148;
const RING_STROKE = 10;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_R;

function ScoreRing({ score, color, delay }: { score: number; color: string; delay: number }) {
  const [displayed, setDisplayed] = useState(0);
  const [dashLen, setDashLen] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const t = setTimeout(() => {
      // Overshoot: go to score+6 then settle at score
      const overshoot = Math.min(score + 6, 100);
      let phase = 0; // 0 = rise to overshoot, 1 = settle

      const start = performance.now();
      const duration1 = 950;
      const duration2 = 280;

      const tick = (now: number) => {
        if (phase === 0) {
          const p = Math.min((now - start) / duration1, 1);
          const e = 1 - Math.pow(1 - p, 3);
          const v = Math.round(e * overshoot);
          setDisplayed(v);
          setDashLen(RING_CIRC * (e * overshoot / 100));
          if (p < 1) { raf.current = requestAnimationFrame(tick); return; }
          phase = 1;
          const start2 = performance.now();
          const settle = (now2: number) => {
            const p2 = Math.min((now2 - start2) / duration2, 1);
            const e2 = 1 - Math.pow(1 - p2, 2);
            const v2 = Math.round(overshoot + (score - overshoot) * e2);
            setDisplayed(v2);
            setDashLen(RING_CIRC * (v2 / 100));
            if (p2 < 1) raf.current = requestAnimationFrame(settle);
          };
          raf.current = requestAnimationFrame(settle);
        }
      };
      raf.current = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(t); cancelAnimationFrame(raf.current); };
  }, [score, delay]);

  return (
    <div style={{ position: "relative", width: RING_SIZE, height: RING_SIZE, flexShrink: 0 }}>
      <svg width={RING_SIZE} height={RING_SIZE} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R} fill="none" stroke="var(--bg-elevated)" strokeWidth={RING_STROKE} />
        {/* Glow layer (blur) */}
        <circle
          cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R}
          fill="none" stroke={color} strokeWidth={RING_STROKE + 4}
          strokeLinecap="round"
          strokeDasharray={`${dashLen} ${RING_CIRC}`}
          style={{ filter: `blur(6px)`, opacity: 0.35 }}
        />
        {/* Score arc */}
        <circle
          cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R}
          fill="none" stroke={color} strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={`${dashLen} ${RING_CIRC}`}
          style={{ filter: `drop-shadow(0 0 3px color-mix(in srgb, ${color} 80%, transparent))` }}
        />
      </svg>
      {/* Center label */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 34, fontWeight: 700, color, lineHeight: 1, letterSpacing: "-0.02em" }}>
          {displayed}
        </span>
        <span style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>/ 100</span>
      </div>
    </div>
  );
}

// ─── Sub-score bar (Framer animated) ─────────────────────────────────────────

function SubScore({ label, value, description, delay }: { label: string; value: number; description: string; delay: number }) {
  const [width, setWidth] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  const color = value >= 75 ? "var(--easy)" : value >= 50 ? "var(--accent)" : value >= 25 ? "var(--medium)" : "var(--hard)";

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{ display: "flex", flexDirection: "column", gap: 5 }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>{label}</span>
        <motion.span
          animate={{ scale: hovered ? 1.08 : 1, color: hovered ? color : color }}
          style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color }}
        >
          {value}
        </motion.span>
      </div>
      <div style={{ height: 5, background: "var(--bg-base)", border: "1px solid var(--border-subtle)", borderRadius: 3, overflow: "hidden", position: "relative" }}>
        {/* Bar */}
        <div style={{
          height: "100%", width: `${width}%`, background: color, borderRadius: 3,
          transition: "width 0.85s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: `0 0 8px color-mix(in srgb, ${color} 60%, transparent)`,
        }} />
        {/* Shimmer sweep on mount */}
        {hovered && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${color} 60%, transparent), transparent)`,
              pointerEvents: "none",
            }}
          />
        )}
      </div>
      <motion.span
        animate={{ opacity: hovered ? 1 : 0.6 }}
        style={{ fontSize: 10, color: "var(--text-muted)" }}
      >
        {description}
      </motion.span>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ReadinessHeroProps {
  stats: ProblemStats;
  delay?: number;
}

export function ReadinessHero({ stats, delay = 0 }: ReadinessHeroProps) {
  const r = computeReadiness(stats);

  const subScores = [
    { label: "Consistency", value: r.consistency, description: `Active ${stats.daily_activity.slice(-14).filter(d => d.count > 0).length} of last 14 days` },
    { label: "Difficulty Spread", value: r.difficulty_spread, description: `${stats.by_difficulty.medium + stats.by_difficulty.hard} medium/hard of ${stats.total} total` },
    { label: "Avg Confidence", value: r.confidence_avg, description: `${Math.round(stats.avg_confidence * 100)}% across all solved problems` },
    { label: "Revision Discipline", value: r.revision_discipline, description: `${stats.needs_revision_count} problem${stats.needs_revision_count !== 1 ? "s" : ""} flagged for review` },
  ];

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      style={{
        padding: "28px 32px",
        position: "relative",
        overflow: "hidden",
        background: `color-mix(in srgb, ${r.verdict_color} 3%, var(--bg-surface))`,
        borderColor: `color-mix(in srgb, ${r.verdict_color} 18%, var(--border-subtle))`,
      }}
    >
      {/* Ambient glow */}
      <motion.div
        animate={{ opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: -60, right: -60,
          width: 260, height: 260, borderRadius: "50%",
          background: r.verdict_color, filter: "blur(55px)", pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap", position: "relative" }}>
        {/* Ring + verdict */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, flexShrink: 0 }}>
          <ScoreRing score={r.total} color={r.verdict_color} delay={delay + 150} />
          <div style={{ textAlign: "center" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (delay + 900) / 1000, type: "spring", stiffness: 300 }}
              style={{
                fontSize: 13, fontWeight: 700, color: r.verdict_color,
                background: `color-mix(in srgb, ${r.verdict_color} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${r.verdict_color} 28%, transparent)`,
                borderRadius: "var(--radius-pill)", padding: "4px 12px", display: "inline-block",
              }}
            >
              {r.verdict}
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (delay + 1000) / 1000 }}
              style={{ fontSize: 12, color: "var(--text-muted)", margin: "6px 0 0", maxWidth: 140, textAlign: "center", lineHeight: 1.4 }}
            >
              {r.verdict_detail}
            </motion.p>
          </div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: (delay + 400) / 1000, duration: 0.4 }}
          style={{ width: 1, alignSelf: "stretch", background: "var(--border-subtle)", flexShrink: 0, transformOrigin: "top" }}
        />

        {/* Sub-scores */}
        <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 14 }}>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (delay + 300) / 1000 }}
          >
            <div className="text-section-header-hero">Readiness Score</div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
              Four weighted signals, each worth 25 points
            </p>
          </motion.div>
          {subScores.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (delay + 450 + i * 80) / 1000, ease: [0.22, 1, 0.36, 1] }}
            >
              <SubScore label={s.label} value={s.value} description={s.description} delay={delay + 500 + i * 80} />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}