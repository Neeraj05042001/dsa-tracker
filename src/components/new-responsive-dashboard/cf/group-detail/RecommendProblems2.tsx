"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
} from "framer-motion";
import type { CfGroupProblem } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ContestSummary = {
  id: string;
  name: string;
  problems: CfGroupProblem[];
  solved: number;
  attempted: number;
  todo: number;
  total: number;
  pct: number;
};

type ReasonType = "stuck" | "almost_done" | "next_up" | "fresh_start";

type Rec = {
  problem: CfGroupProblem;
  contestName: string;
  contestPct: number;
  contestSolved: number;
  contestTotal: number;
  reason: ReasonType;
  reasonLabel: string;
};

export interface RecommendedProblemsProps {
  problems: CfGroupProblem[];
  contests: ContestSummary[];
}

// ─────────────────────────────────────────────────────────────────────────────
// TOKENS
// ─────────────────────────────────────────────────────────────────────────────

const D = {
  surface: "var(--bg-surface,  #111114)",
  elevated: "var(--bg-elevated, #16161a)",
  border: "rgba(255,255,255,0.07)",
  muted: "var(--text-muted,     #52525b)",
  secondary: "var(--text-secondary, #a1a1aa)",
  primary: "var(--text-primary,   #f4f4f5)",
  teal: "#00d4aa",
  amber: "#fbbf24",
  red: "#f87171",
  green: "#4ade80",
  blue: "#60a5fa",
  purple: "#9d8fff",
  mono: "var(--font-mono, 'JetBrains Mono', monospace)",
  sans: "var(--font-sans, system-ui, sans-serif)",
} as const;

const REASON: Record<
  ReasonType,
  {
    color: string;
    bg: string;
    border: string;
    label: string;
    icon: string;
  }
> = {
  stuck: {
    color: D.amber,
    bg: "rgba(251,191,36,0.09)",
    border: "rgba(251,191,36,0.26)",
    label: "Stuck",
    icon: "⚡",
  },
  almost_done: {
    color: D.teal,
    bg: "rgba(0,212,170,0.09)",
    border: "rgba(0,212,170,0.26)",
    label: "Almost Done",
    icon: "🏁",
  },
  next_up: {
    color: D.blue,
    bg: "rgba(96,165,250,0.09)",
    border: "rgba(96,165,250,0.22)",
    label: "Next Up",
    icon: "→",
  },
  fresh_start: {
    color: D.purple,
    bg: "rgba(157,143,255,0.09)",
    border: "rgba(157,143,255,0.22)",
    label: "New",
    icon: "✦",
  },
};

const EASE = [0.22, 1, 0.36, 1] as const;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function ord(idx: string): number {
  if (!idx) return 999;
  return (
    idx.charCodeAt(0) -
    65 +
    (idx.length > 1 ? (parseInt(idx.slice(1), 10) || 0) * 26 : 0)
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RECOMMENDATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function buildRecs(
  problems: CfGroupProblem[],
  contests: ContestSummary[],
): Rec[] {
  const recs: Rec[] = [];
  const seen = new Set<string>();

  const add = (r: Rec) => {
    if (seen.has(r.problem.id)) return;
    seen.add(r.problem.id);
    recs.push(r);
  };

  // ── 1. Attempted (stuck) — highest priority ────────────────────────────
  const attempted = problems
    .filter((p) => p.cf_status === "attempted")
    .sort((a, b) =>
      a.contest_id !== b.contest_id
        ? a.contest_id.localeCompare(b.contest_id)
        : ord(a.problem_index) - ord(b.problem_index),
    );

  for (const p of attempted) {
    const c = contests.find((c) => c.id === p.contest_id);
    if (!c) continue;
    add({
      problem: p,
      contestName: c.name,
      contestPct: c.pct,
      contestSolved: c.solved,
      contestTotal: c.total,
      reason: "stuck",
      reasonLabel: "You attempted this — one push away from solving it",
    });
  }

  // ── 2. Almost-done contests (≥60%, <100%) ─────────────────────────────
  for (const c of [...contests]
    .filter((c) => c.pct >= 60 && c.pct < 100)
    .sort((a, b) => b.pct - a.pct)) {
    const next = [...c.problems]
      .sort((a, b) => ord(a.problem_index) - ord(b.problem_index))
      .find((p) => p.cf_status === "todo");
    if (!next) continue;
    add({
      problem: next,
      contestName: c.name,
      contestPct: c.pct,
      contestSolved: c.solved,
      contestTotal: c.total,
      reason: "almost_done",
      reasonLabel: `${Math.round(c.pct)}% done — just ${c.total - c.solved} left to finish`,
    });
  }

  // ── 3. In-progress contests (>0%, <60%) ───────────────────────────────
  for (const c of [...contests]
    .filter((c) => c.pct > 0 && c.pct < 60)
    .sort((a, b) => b.pct - a.pct)) {
    const next = [...c.problems]
      .sort((a, b) => ord(a.problem_index) - ord(b.problem_index))
      .find((p) => p.cf_status === "todo");
    if (!next) continue;
    add({
      problem: next,
      contestName: c.name,
      contestPct: c.pct,
      contestSolved: c.solved,
      contestTotal: c.total,
      reason: "next_up",
      reasonLabel: `${c.solved}/${c.total} solved — keep the streak`,
    });
  }

  // ── 4. Fresh contests (0% done), chronological ───────────────────────
  for (const c of [...contests]
    .filter((c) => c.pct === 0 && c.todo > 0)
    .sort((a, b) => a.id.localeCompare(b.id))) {
    const first = [...c.problems].sort(
      (a, b) => ord(a.problem_index) - ord(b.problem_index),
    )[0];
    if (!first) continue;
    add({
      problem: first,
      contestName: c.name,
      contestPct: 0,
      contestSolved: 0,
      contestTotal: c.total,
      reason: "fresh_start",
      reasonLabel: `${c.total} problems ready — start with problem ${first.problem_index}`,
    });
  }

  return recs.slice(0, 6);
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS RING
// ─────────────────────────────────────────────────────────────────────────────

function Ring({
  pct,
  color,
  size = 38,
}: {
  pct: number;
  color: string;
  size?: number;
}) {
  const reduced = useReducedMotion();
  const R = (size - 5) / 2;
  const circ = 2 * Math.PI * R;
  const cx = size / 2,
    cy = size / 2;

  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="2.5"
      />
      <motion.circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
        transition={
          reduced
            ? { duration: 0 }
            : { duration: 0.85, delay: 0.35, ease: EASE }
        }
        style={{
          transform: `rotate(-90deg)`,
          transformOrigin: `${cx}px ${cy}px`,
        }}
      />
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fontSize="8.5"
        fontFamily={D.mono}
        fontWeight="700"
        fill={color}
      >
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD
// ─────────────────────────────────────────────────────────────────────────────

function Card({
  rec,
  rank,
  delay,
  active,
  onClick,
}: {
  rec: Rec;
  rank: number;
  delay: number;
  active: boolean;
  onClick: () => void;
}) {
  const reduced = useReducedMotion();
  const cfg = REASON[rec.reason];
  const [hov, setHov] = useState(false);

  const rankColor =
    rank === 1 ? D.amber : rank === 2 ? D.teal : rank === 3 ? D.blue : D.muted;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={
        reduced ? { duration: 0 } : { duration: 0.38, delay, ease: EASE }
      }
      whileHover={
        reduced ? {} : { y: -4, transition: { duration: 0.2, ease: EASE } }
      }
      whileTap={reduced ? {} : { scale: 0.97 }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      onClick={onClick}
      style={{
        width: 252,
        flexShrink: 0,
        borderRadius: 13,
        background: active
          ? `linear-gradient(140deg, ${cfg.bg} 0%, rgba(255,255,255,0.015) 100%)`
          : "rgba(255,255,255,0.02)",
        border: `1px solid ${active ? cfg.border : "rgba(255,255,255,0.07)"}`,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.2s, background 0.2s",
        boxShadow:
          active || hov
            ? `0 10px 38px -8px ${cfg.color}26, 0 0 0 1px ${cfg.color}14`
            : "0 2px 8px rgba(0,0,0,0.35)",
        scrollSnapAlign: "start",
      }}
    >
      {/* Left accent stripe */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: `linear-gradient(to bottom, ${cfg.color}, ${cfg.color}38)`,
          borderRadius: "0 2px 2px 0",
          opacity: active || hov ? 1 : 0.45,
          transition: "opacity 0.18s",
        }}
      />

      {/* Ambient glow */}
      <motion.div
        animate={{ opacity: hov ? 0.15 : 0.04, scale: hov ? 1.5 : 1 }}
        transition={{ duration: 0.38 }}
        style={{
          position: "absolute",
          top: -24,
          right: -24,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: cfg.color,
          filter: "blur(28px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ padding: "13px 12px 13px 16px" }}>
        {/* Row 1: rank + type + ring */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontSize: 8.5,
                fontFamily: D.mono,
                fontWeight: 800,
                color: rankColor,
                background: `${rankColor}18`,
                border: `1px solid ${rankColor}2e`,
                borderRadius: 5,
                padding: "1px 6px",
              }}
            >
              #{rank}
            </span>
            <span
              style={{
                fontSize: 8.5,
                fontFamily: D.mono,
                fontWeight: 700,
                color: cfg.color,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <span style={{ fontSize: 9 }}>{cfg.icon}</span>
              {cfg.label}
            </span>
          </div>
          <Ring pct={rec.contestPct} color={cfg.color} size={38} />
        </div>

        {/* Row 2: index + name + contest */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 7,
              flexShrink: 0,
              background: `${cfg.color}14`,
              border: `1px solid ${cfg.color}2c`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 1,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontFamily: D.mono,
                fontWeight: 800,
                color: cfg.color,
              }}
            >
              {rec.problem.problem_index}
            </span>
          </div>
          <div style={{ overflow: "hidden", minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: hov || active ? cfg.color : D.primary,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                transition: "color 0.14s",
              }}
            >
              {rec.problem.problem_name}
            </div>
            <div
              style={{
                fontSize: 10,
                color: D.muted,
                marginTop: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {rec.contestName}
            </div>
          </div>
        </div>

        {/* Reason pill */}
        <div
          style={{
            padding: "5px 8px",
            background: `${cfg.color}0a`,
            border: `1px solid ${cfg.color}16`,
            borderRadius: 7,
            marginBottom: 11,
          }}
        >
          <span style={{ fontSize: 10.5, color: D.secondary, lineHeight: 1.4 }}>
            {rec.reasonLabel}
          </span>
        </div>

        {/* Progress bar + link */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 8.5,
                color: D.muted,
                fontFamily: D.mono,
                marginBottom: 3,
              }}
            >
              {rec.contestSolved}/{rec.contestTotal} solved
            </div>
            <div
              style={{
                height: 3,
                borderRadius: 2,
                background: "rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${rec.contestPct}%` }}
                transition={{ duration: 0.75, delay: delay + 0.28, ease: EASE }}
                style={{
                  height: "100%",
                  borderRadius: 2,
                  background: cfg.color,
                  boxShadow: `0 0 6px ${cfg.color}55`,
                }}
              />
            </div>
          </div>

          <motion.a
            href={rec.problem.problem_url ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            whileHover={
              reduced ? {} : { scale: 1.12, backgroundColor: `${cfg.color}26` }
            }
            whileTap={reduced ? {} : { scale: 0.9 }}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              flexShrink: 0,
              background: `${cfg.color}14`,
              border: `1px solid ${cfg.color}28`,
              color: cfg.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
            }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            >
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export function RecommendedProblems2({
  problems,
  contests,
}: RecommendedProblemsProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [active, setActive] = useState(0);
  const [scrollX, setScrollX] = useState(0);

  const recs = useMemo(
    () => buildRecs(problems, contests),
    [problems, contests],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const fn = () => setScrollX(el.scrollLeft);
    el.addEventListener("scroll", fn, { passive: true });
    return () => el.removeEventListener("scroll", fn);
  }, []);

  const canLeft = scrollX > 8;
  const canRight = scrollRef.current
    ? scrollX <
      scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 8
    : recs.length > 3;

  const scroll = (dir: "l" | "r") =>
    scrollRef.current?.scrollBy({
      left: dir === "r" ? 268 : -268,
      behavior: "smooth",
    });

  const stuckCount = recs.filter((r) => r.reason === "stuck").length;
  const almostCount = recs.filter((r) => r.reason === "almost_done").length;
  const activeRec = recs[active];
  const activeCfg = activeRec ? REASON[activeRec.reason] : null;

  if (recs.length === 0) return null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={reduced ? { duration: 0 } : { duration: 0.45, ease: EASE }}
      style={{
        background: D.surface,
        border: `1px solid ${D.border}`,
        borderRadius: 14,
        overflow: "hidden",
        position: "relative",
        fontFamily: D.sans,
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: D.teal,
          filter: "blur(90px)",
          opacity: 0.02,
          pointerEvents: "none",
        }}
      />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: `1px solid ${D.border}`,
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.3em" }}
            animate={inView ? { opacity: 1, letterSpacing: "0.1em" } : {}}
            transition={
              reduced ? { duration: 0 } : { duration: 0.45, delay: 0.1 }
            }
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: D.muted,
              fontFamily: D.mono,
            }}
          >
            Up Next
          </motion.span>

          <motion.span
            initial={{ opacity: 0, scale: 0.7 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={
              reduced
                ? { duration: 0 }
                : { delay: 0.18, type: "spring", stiffness: 380, damping: 20 }
            }
            style={{
              fontSize: 9.5,
              fontFamily: D.mono,
              fontWeight: 700,
              color: D.teal,
              background: "rgba(0,212,170,0.09)",
              border: "1px solid rgba(0,212,170,0.22)",
              borderRadius: 5,
              padding: "1px 7px",
            }}
          >
            {recs.length} picks
          </motion.span>

          {stuckCount > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={
                reduced
                  ? { duration: 0 }
                  : { delay: 0.26, type: "spring", stiffness: 380, damping: 20 }
              }
              style={{
                fontSize: 9.5,
                fontFamily: D.mono,
                fontWeight: 700,
                color: D.amber,
                background: "rgba(251,191,36,0.09)",
                border: "1px solid rgba(251,191,36,0.22)",
                borderRadius: 5,
                padding: "1px 7px",
              }}
            >
              ⚡ {stuckCount} stuck
            </motion.span>
          )}
        </div>

        {/* Scroll arrows */}
        <div style={{ display: "flex", gap: 6 }}>
          {(["l", "r"] as const).map((dir) => {
            const on = dir === "l" ? canLeft : canRight;
            return (
              <motion.button
                key={dir}
                onClick={() => scroll(dir)}
                whileTap={reduced ? {} : { scale: 0.88 }}
                disabled={!on}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  border: `1px solid ${on ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}`,
                  background: "transparent",
                  color: on ? D.secondary : "rgba(255,255,255,0.14)",
                  cursor: on ? "pointer" : "default",
                  fontSize: 13,
                  transition: "all 0.14s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {dir === "l" ? "←" : "→"}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Subtitle ────────────────────────────────────────────────────── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={reduced ? { duration: 0 } : { delay: 0.22 }}
        style={{
          margin: 0,
          padding: "9px 16px 0 16px",
          fontSize: 11,
          color: D.muted,
          lineHeight: 1.55,
        }}
      >
        {stuckCount > 0 ? (
          <>
            ⚡{" "}
            <span style={{ color: D.amber }}>
              {stuckCount} problem{stuckCount > 1 ? "s" : ""} you've attempted
              before
            </span>{" "}
            — highest priority, start here.
            {almostCount > 0 && (
              <>
                {" "}
                ·{" "}
                <span style={{ color: D.teal }}>
                  {almostCount} contest{almostCount > 1 ? "s" : ""} almost
                  finished.
                </span>
              </>
            )}
          </>
        ) : almostCount > 0 ? (
          <>
            <span style={{ color: D.teal }}>
              {almostCount} contest{almostCount > 1 ? "s" : ""} over 60% done
            </span>{" "}
            — a few more solves and you're complete.
          </>
        ) : (
          <>
            Smart picks based on your progress. Click a card to focus it, then
            open on Codeforces.
          </>
        )}
      </motion.p>

      {/* ── Card scroll ─────────────────────────────────────────────────── */}
      <div style={{ position: "relative" }}>
        {/* Fade masks */}
        <AnimatePresence>
          {canLeft && (
            <motion.div
              key="fl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 12,
                width: 52,
                pointerEvents: "none",
                zIndex: 4,
                background: `linear-gradient(to right, ${D.surface} 40%, transparent)`,
              }}
            />
          )}
          {canRight && (
            <motion.div
              key="fr"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 12,
                width: 68,
                pointerEvents: "none",
                zIndex: 4,
                background: `linear-gradient(to left, ${D.surface} 40%, transparent)`,
              }}
            />
          )}
        </AnimatePresence>

        <div
          ref={scrollRef}
          style={{
            display: "flex",
            gap: 12,
            padding: "12px 16px 16px",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            // hide scrollbar cross-browser
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          <AnimatePresence mode="popLayout">
            {recs.map((rec, i) => (
              <Card
                key={rec.problem.id}
                rec={rec}
                rank={i + 1}
                delay={i * 0.065}
                active={active === i}
                onClick={() => setActive(i)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Focus panel ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeRec && activeCfg && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={
              reduced ? { duration: 0 } : { duration: 0.22, ease: EASE }
            }
            style={{
              borderTop: `1px solid ${D.border}`,
              padding: "11px 16px",
              background: `linear-gradient(90deg, ${activeCfg.bg} 0%, transparent 55%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {/* Left: pulsing dot + problem info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                minWidth: 0,
                flex: 1,
              }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                <motion.div
                  animate={{ scale: [1, 1.9, 1], opacity: [0.45, 0, 0.45] }}
                  transition={{
                    duration: 2.1,
                    repeat: Infinity,
                    repeatDelay: 1.4,
                  }}
                  style={{
                    position: "absolute",
                    inset: -4,
                    borderRadius: "50%",
                    background: activeCfg.color,
                  }}
                />
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: activeCfg.color,
                    boxShadow: `0 0 10px ${activeCfg.color}`,
                  }}
                />
              </div>
              <div style={{ overflow: "hidden", minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: D.primary,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {activeRec.problem.problem_name}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      fontFamily: D.mono,
                      fontWeight: 700,
                      color: activeCfg.color,
                      background: activeCfg.bg,
                      border: `1px solid ${activeCfg.border}`,
                      borderRadius: 4,
                      padding: "1px 5px",
                      flexShrink: 0,
                    }}
                  >
                    {activeCfg.icon} {activeCfg.label}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: D.muted }}>
                  {activeRec.contestName} · {activeRec.reasonLabel}
                </span>
              </div>
            </div>

            {/* CTA */}
            <motion.a
              href={activeRec.problem.problem_url ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={
                reduced
                  ? {}
                  : { scale: 1.04, backgroundColor: `${activeCfg.color}20` }
              }
              whileTap={reduced ? {} : { scale: 0.96 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "7px 16px",
                borderRadius: 9,
                background: `${activeCfg.color}14`,
                border: `1px solid ${activeCfg.color}30`,
                color: activeCfg.color,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
                flexShrink: 0,
                letterSpacing: "0.01em",
              }}
            >
              Solve now
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Legend + footer ──────────────────────────────────────────────── */}
      <div
        style={{
          padding: "7px 16px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          background: "rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", gap: 14 }}>
          {(
            Object.entries(REASON) as [
              ReasonType,
              (typeof REASON)[ReasonType],
            ][]
          ).map(([key, cfg]) => (
            <div
              key={key}
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: cfg.color,
                }}
              />
              <span style={{ fontSize: 9, color: D.muted, fontFamily: D.mono }}>
                {cfg.label}
              </span>
            </div>
          ))}
        </div>
        <span
          style={{
            fontSize: 9,
            color: D.muted,
            fontFamily: D.mono,
            opacity: 0.65,
          }}
        >
          click to focus · ↗ opens on codeforces
        </span>
      </div>

      {/* Bottom accent */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={
          reduced ? { duration: 0 } : { duration: 1.3, delay: 0.5, ease: EASE }
        }
        style={{
          height: 2,
          background: `linear-gradient(90deg, ${D.amber}, ${D.teal}, transparent)`,
          transformOrigin: "left",
          opacity: 0.42,
        }}
      />
    </motion.div>
  );
}
