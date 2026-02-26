"use client";

import { useEffect, useState, useRef } from "react";
import { ProblemStats } from "@/types";

// ─── Readiness computation ────────────────────────────────────────────────────

interface ReadinessResult {
  total: number;
  consistency: number;       // solved in last 14 days
  difficulty_spread: number; // medium+hard % of total
  confidence_avg: number;    // normalized avg confidence
  revision_discipline: number; // placeholder — full data on revision page
  verdict: "Excellent" | "On Track" | "Needs Work" | "Getting Started";
  verdict_detail: string;
  verdict_color: string;
}

function computeReadiness(stats: ProblemStats): ReadinessResult {
  const total = stats.total;

  // ── 1. Consistency (25pts) — active days in last 14 ──
  const last14 = stats.daily_activity.slice(-14);
  const activeDays = last14.filter(d => d.count > 0).length;
  const consistency = Math.min(100, Math.round((activeDays / 14) * 100));

  // ── 2. Difficulty spread (25pts) — med+hard as % of total ──
  const medHard = stats.by_difficulty.medium + stats.by_difficulty.hard;
  const diffSpread = total === 0 ? 0 : Math.min(100, Math.round((medHard / total) * 100 * 1.43)); // 70% target = 100pts

  // ── 3. Confidence avg (25pts) ──
  const confScore = Math.round(stats.avg_confidence * 100);

  // ── 4. Revision discipline (25pts) — estimate from needs_revision ratio ──
  const revDiscipline = total === 0 ? 0
    : Math.min(100, Math.round((1 - stats.needs_revision_count / Math.max(total, 1)) * 100));

  const weighted = Math.round(
    consistency * 0.25 +
    diffSpread  * 0.25 +
    confScore   * 0.25 +
    revDiscipline * 0.25
  );

  const verdict =
    weighted >= 80 ? "Excellent"
    : weighted >= 60 ? "On Track"
    : weighted >= 30 ? "Needs Work"
    : "Getting Started";

  const verdictDetail =
    weighted >= 80 ? "You're consistently solving and retaining well."
    : weighted >= 60 ? "Good momentum — push harder on medium/hard problems."
    : weighted >= 30
      ? consistency < 40 ? "Practice more consistently — even 1 problem a day compounds."
        : diffSpread < 40 ? "Too many easy problems — start targeting medium difficulty."
        : "Keep reviewing flagged problems to strengthen retention."
    : "Just getting started — build a daily habit first.";

  const verdictColor =
    weighted >= 80 ? "var(--easy)"
    : weighted >= 60 ? "var(--accent)"
    : weighted >= 30 ? "var(--medium)"
    : "var(--hard)";

  return {
    total: weighted,
    consistency,
    difficulty_spread: diffSpread,
    confidence_avg: confScore,
    revision_discipline: revDiscipline,
    verdict,
    verdict_detail: verdictDetail,
    verdict_color: verdictColor,
  };
}

// ─── Animated ring ────────────────────────────────────────────────────────────

const RING_SIZE = 140;
const RING_STROKE = 10;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_R;

function ScoreRing({ score, color, delay }: { score: number; color: string; delay: number }) {
  const [drawn, setDrawn] = useState(false);
  const [displayed, setDisplayed] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setDrawn(true);
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / 900, 1);
        const e = 1 - Math.pow(1 - p, 3);
        setDisplayed(Math.round(e * score));
        if (p < 1) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(t); cancelAnimationFrame(raf.current); };
  }, [score, delay]);

  const dashArray = RING_CIRC * (drawn ? score / 100 : 0);

  return (
    <div style={{ position: "relative", width: RING_SIZE, height: RING_SIZE, flexShrink: 0 }}>
      <svg width={RING_SIZE} height={RING_SIZE} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R}
          fill="none" stroke="var(--bg-elevated)" strokeWidth={RING_STROKE}
        />
        {/* Score arc */}
        <circle
          cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_R}
          fill="none"
          stroke={color}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={`${dashArray} ${RING_CIRC}`}
          style={{
            transition: "stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1)",
            filter: `drop-shadow(0 0 6px color-mix(in srgb, ${color} 70%, transparent))`,
          }}
        />
      </svg>
      {/* Center */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 700,
          color, lineHeight: 1, letterSpacing: "-0.02em",
        }}>
          {displayed}
        </span>
        <span style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          / 100
        </span>
      </div>
    </div>
  );
}

// ─── Sub-score bar ────────────────────────────────────────────────────────────

function SubScore({
  label, value, description, delay,
}: {
  label: string; value: number; description: string; delay: number;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  const color = value >= 75 ? "var(--easy)" : value >= 50 ? "var(--accent)" : value >= 25 ? "var(--medium)" : "var(--hard)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{
        height: 4, background: "var(--bg-base)",
        border: "1px solid var(--border-subtle)", borderRadius: 2, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${width}%`,
          background: color, borderRadius: 2,
          transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: `0 0 6px color-mix(in srgb, ${color} 50%, transparent)`,
        }} />
      </div>
      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{description}</span>
    </div>
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
    {
      label: "Consistency",
      value: r.consistency,
      description: `Active ${stats.daily_activity.slice(-14).filter(d => d.count > 0).length} of last 14 days`,
    },
    {
      label: "Difficulty Spread",
      value: r.difficulty_spread,
      description: `${stats.by_difficulty.medium + stats.by_difficulty.hard} medium/hard of ${stats.total} total`,
    },
    {
      label: "Avg Confidence",
      value: r.confidence_avg,
      description: `${Math.round(stats.avg_confidence * 100)}% across all solved problems`,
    },
    {
      label: "Revision Discipline",
      value: r.revision_discipline,
      description: `${stats.needs_revision_count} problem${stats.needs_revision_count !== 1 ? "s" : ""} flagged for review`,
    },
  ];

  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: "28px 32px",
        animationDelay: `${delay}ms`,
        position: "relative",
        overflow: "hidden",
        background: `color-mix(in srgb, ${r.verdict_color} 3%, var(--bg-surface))`,
        borderColor: `color-mix(in srgb, ${r.verdict_color} 18%, var(--border-subtle))`,
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: -60, right: -60,
        width: 240, height: 240, borderRadius: "50%",
        background: r.verdict_color, opacity: 0.05,
        filter: "blur(50px)", pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
        {/* Ring + verdict */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <ScoreRing score={r.total} color={r.verdict_color} delay={delay + 100} />
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: 13, fontWeight: 700,
              color: r.verdict_color,
              background: `color-mix(in srgb, ${r.verdict_color} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${r.verdict_color} 28%, transparent)`,
              borderRadius: "var(--radius-pill)",
              padding: "4px 12px",
              display: "inline-block",
            }}>
              {r.verdict}
            </div>
            <p style={{
              fontSize: 12, color: "var(--text-muted)", margin: "6px 0 0",
              maxWidth: 140, textAlign: "center", lineHeight: 1.4,
            }}>
              {r.verdict_detail}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, alignSelf: "stretch", background: "var(--border-subtle)", flexShrink: 0 }} />

        {/* Sub-scores */}
        <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div className="text-section-header">Readiness Score</div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
              Four weighted signals, each worth 25 points
            </p>
          </div>
          {subScores.map((s, i) => (
            <SubScore
              key={s.label}
              label={s.label}
              value={s.value}
              description={s.description}
              delay={delay + 300 + i * 80}
            />
          ))}
        </div>
      </div>
    </div>
  );
}