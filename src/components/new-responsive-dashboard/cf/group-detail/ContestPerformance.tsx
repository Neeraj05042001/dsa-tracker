"use client";

import { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ContestSummary {
  id: string;
  name: string;
  solved: number;
  attempted: number;
  todo: number;
  total: number;
  pct: number;
}

export interface DiffPoint {
  index: string;  // "A", "B", "C" …
  total: number;
  solved: number;
  pct: number;
}

interface ContestsAndPerformanceProps {
  contests: ContestSummary[];
  diffPoints: DiffPoint[];
  selectedContest: string | null;
  onContestSelect: (id: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function barColor(pct: number): string {
  if (pct >= 90) return "#22c55e";
  if (pct >= 70) return "#00d4aa";
  if (pct >= 40) return "#f59e0b";
  if (pct > 0)   return "#f87171";
  return "rgba(255,255,255,0.18)";
}

// Generate an insight string from diffPoints
function generateInsight(points: DiffPoint[]): string | null {
  if (points.length < 2) return null;

  // Find the biggest drop-off
  let maxDrop = 0;
  let dropAt = "";
  for (let i = 1; i < points.length; i++) {
    const drop = points[i - 1].pct - points[i].pct;
    if (drop > maxDrop) {
      maxDrop = drop;
      dropAt = points[i].index;
    }
  }

  const avgPct = Math.round(points.reduce((s, p) => s + p.pct, 0) / points.length);
  const lastPct = Math.round(points[points.length - 1].pct);

  if (maxDrop > 30 && dropAt) {
    return `Solve rate drops ${Math.round(maxDrop)}% at problem ${dropAt}. Focus here to unlock more contest completions.`;
  }
  if (avgPct > 75) {
    return `Strong solve rate across positions (avg ${avgPct}%). Consistent performance — consider tackling harder contests.`;
  }
  if (lastPct < 20 && points.length >= 4) {
    return `Late problems (${points[points.length - 1].index}+) remain largely unsolved. Prioritise them in revision.`;
  }
  return `Average solve rate ${avgPct}% across ${points.length} problem positions.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEST ROW
// Status icon · Name · solved/total · animated bar · pct
// Selected: teal left stripe + glow border
// Hover: y:-1 lift + soft teal border
// ─────────────────────────────────────────────────────────────────────────────

function ContestRow({
  contest,
  isSelected,
  onSelect,
  delay,
}: {
  contest: ContestSummary;
  isSelected: boolean;
  onSelect: () => void;
  delay: number;
}) {
  const shouldReduce = useReducedMotion() ?? false;
  const barRef = useRef<HTMLDivElement>(null);
  const inView = useInView(barRef, { once: true });
  const [hovered, setHovered] = useState(false);

  const isComplete   = contest.pct === 100;
  const isNotStarted = contest.pct === 0;
  const color = barColor(contest.pct);

  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.38, delay, ease: [0.25, 0.4, 0.25, 1] }}
      onClick={onSelect}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={shouldReduce ? {} : { y: -1 }}
      style={{
        padding: "11px 14px",
        borderRadius: 10,
        border: isSelected
          ? "1px solid rgba(0,212,170,0.35)"
          : hovered
            ? "1px solid rgba(0,212,170,0.15)"
            : "1px solid rgba(255,255,255,0.055)",
        background: isSelected
          ? "rgba(0,212,170,0.055)"
          : hovered
            ? "rgba(255,255,255,0.025)"
            : "rgba(255,255,255,0.018)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.18s, background 0.18s",
        boxShadow: isSelected ? "0 0 0 1px rgba(0,212,170,0.12)" : "none",
      }}
    >
      {/* Selected left stripe — scaleY in from top */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.4, 0.25, 1] }}
            style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: 3,
              background: "linear-gradient(180deg, #00d4aa, rgba(0,212,170,0.4))",
              borderRadius: "10px 0 0 10px",
              transformOrigin: "top",
            }}
          />
        )}
      </AnimatePresence>

      {/* Top row: icon · name · fraction · pct */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>

        {/* Status icon */}
        <div style={{
          width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
          background: isComplete
            ? "rgba(34,197,94,0.14)"
            : isNotStarted
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,212,170,0.1)",
          border: `1.5px solid ${
            isComplete   ? "rgba(34,197,94,0.4)"
            : isNotStarted ? "rgba(255,255,255,0.1)"
            : "rgba(0,212,170,0.25)"
          }`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {isComplete ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : isNotStarted ? (
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
          ) : (
            <motion.div
              animate={!shouldReduce ? { scale: [1, 1.25, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              style={{ width: 5, height: 5, borderRadius: "50%", background: "#00d4aa" }}
            />
          )}
        </div>

        {/* Name */}
        <span style={{
          flex: 1, fontSize: 12.5, fontWeight: isSelected ? 600 : 500,
          color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          transition: "color 0.15s, font-weight 0.15s",
        }}>
          {contest.name}
        </span>

        {/* Right stats */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
            {contest.solved}/{contest.total}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, color,
            minWidth: 32, textAlign: "right",
            fontFamily: "var(--font-mono)",
          }}>
            {isComplete ? "✓" : isNotStarted ? "—" : `${Math.round(contest.pct)}%`}
          </span>
        </div>
      </div>

      {/* Animated progress bar */}
      <div
        ref={barRef}
        style={{ height: 4, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: inView ? `${contest.pct}%` : 0 }}
          transition={{
            duration: 0.9,
            delay: delay + 0.06,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            height: "100%", borderRadius: 3,
            background: isComplete
              ? "linear-gradient(90deg, #22c55e, #00d4aa)"
              : `linear-gradient(90deg, ${color}70, ${color})`,
            boxShadow: isSelected ? `0 0 6px ${color}60` : "none",
          }}
        />
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTESTS PANEL
// ─────────────────────────────────────────────────────────────────────────────

function ContestsPanel({
  contests,
  selectedContest,
  onContestSelect,
}: {
  contests: ContestSummary[];
  selectedContest: string | null;
  onContestSelect: (id: string) => void;
}) {
  const shouldReduce = useReducedMotion() ?? false;
  const inProgress = contests.filter(c => c.pct > 0 && c.pct < 100).length;
  const completed  = contests.filter(c => c.pct === 100).length;

  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.4, 0.25, 1] }}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid rgba(255,255,255,0.065)",
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "18px 20px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.045)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 8,
      }}>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            Contests
          </div>
          <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 2 }}>
            {contests.length} total · {completed} complete · {inProgress} in progress
          </div>
        </div>

        {/* Clear filter chip */}
        <AnimatePresence>
          {selectedContest && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.16 }}
              onClick={() => onContestSelect(selectedContest)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "3px 10px 3px 8px",
                background: "rgba(0,212,170,0.08)",
                border: "1px solid rgba(0,212,170,0.22)",
                borderRadius: 20, cursor: "pointer", outline: "none",
                color: "#00d4aa", fontSize: 10.5, fontWeight: 600,
              }}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Clear filter
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Scrollable contest list */}
      <div style={{
        padding: "12px 14px",
        overflowY: "auto",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 7,
        maxHeight: 420,
        // Custom scrollbar
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.08) transparent",
      }}>
        {contests.map((c, i) => (
          <ContestRow
            key={c.id}
            contest={c}
            isSelected={selectedContest === c.id}
            onSelect={() => onContestSelect(c.id)}
            delay={i * 0.04}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE BAR ROW — single position row in the chart
// ─────────────────────────────────────────────────────────────────────────────

function PerfBar({
  point,
  index,
  isDropOff,
  inView,
  shouldReduce,
}: {
  point: DiffPoint;
  index: number;
  isDropOff: boolean;
  inView: boolean;
  shouldReduce: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const color = barColor(point.pct);

  return (
    <div>
      {/* Drop-off divider */}
      {isDropOff && (
        <motion.div
          initial={shouldReduce ? false : { opacity: 0, scaleX: 0 }}
          animate={inView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.4, delay: index * 0.055 }}
          style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(248,113,113,0.4), transparent)",
            margin: "4px 0",
            position: "relative",
            transformOrigin: "left",
          }}
        >
          <span style={{
            position: "absolute", right: 0, top: -8,
            fontSize: 8.5, color: "#f87171", fontWeight: 700,
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>
            drop-off
          </span>
        </motion.div>
      )}

      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "3px 0",
          borderRadius: 6,
          transition: "background 0.12s",
          background: hovered ? "rgba(255,255,255,0.02)" : "transparent",
        }}
      >
        {/* Position label */}
        <span style={{
          width: 20, textAlign: "center", flexShrink: 0,
          fontSize: 11.5, fontWeight: 800,
          fontFamily: "var(--font-mono)",
          color: hovered ? color : "var(--text-secondary)",
          transition: "color 0.15s",
        }}>
          {point.index}
        </span>

        {/* Bar track */}
        <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.055)", overflow: "hidden", position: "relative" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: inView ? `${point.pct}%` : 0 }}
            transition={{ duration: 0.75, delay: index * 0.055, ease: [0.16, 1, 0.3, 1] }}
            style={{
              height: "100%", borderRadius: 4,
              background: `linear-gradient(90deg, ${color}70, ${color})`,
              boxShadow: hovered ? `0 0 8px ${color}60` : "none",
              transition: "box-shadow 0.15s",
            }}
          />
        </div>

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, minWidth: 80 }}>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
            {point.solved}/{point.total}
          </span>
          <span style={{
            fontSize: 10.5, fontWeight: 700, color,
            minWidth: 32, textAlign: "right",
            fontFamily: "var(--font-mono)",
          }}>
            {Math.round(point.pct)}%
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INSIGHT CARD — terminal-style, appears below chart
// ─────────────────────────────────────────────────────────────────────────────

function InsightCard({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.6 }}
      style={{
        padding: "12px 14px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderLeft: "3px solid rgba(0,212,170,0.45)",
        borderRadius: "0 8px 8px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Terminal header */}
      <div style={{
        fontSize: 9, fontWeight: 700,
        color: "rgba(0,212,170,0.55)",
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: 5,
      }}>
        // insight
      </div>
      <p style={{
        fontSize: 11.5, color: "var(--text-secondary)",
        lineHeight: 1.6, margin: 0, fontWeight: 400,
      }}>
        {text}
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE PANEL
// ─────────────────────────────────────────────────────────────────────────────

function PerformancePanel({ diffPoints }: { diffPoints: DiffPoint[] }) {
  const shouldReduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });
  const insight = useMemo(() => generateInsight(diffPoints), [diffPoints]);

  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.08, ease: [0.25, 0.4, 0.25, 1] }}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid rgba(255,255,255,0.065)",
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "18px 20px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.045)",
      }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Performance by Position
        </div>
        <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 2 }}>
          Solve rate per problem slot across all contests
        </div>
      </div>

      {/* Chart */}
      <div ref={ref} style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
        {diffPoints.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--text-muted)", padding: "20px 0", textAlign: "center" }}>
            No performance data yet
          </div>
        ) : (
          <>
            {diffPoints.map((pt, i) => {
              const prevPct = i > 0 ? diffPoints[i - 1].pct : null;
              const isDropOff = prevPct !== null && prevPct - pt.pct > 20;
              return (
                <PerfBar
                  key={pt.index}
                  point={pt}
                  index={i}
                  isDropOff={isDropOff}
                  inView={inView}
                  shouldReduce={shouldReduce}
                />
              );
            })}

            {/* Insight card */}
            {insight && (
              <div style={{ marginTop: 16 }}>
                <InsightCard text={insight} />
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT — two-column layout
// 55% contests · 45% performance
// ─────────────────────────────────────────────────────────────────────────────

export function ContestsAndPerformance({
  contests,
  diffPoints,
  selectedContest,
  onContestSelect,
}: ContestsAndPerformanceProps) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "55fr 45fr",
      gap: 16,
      alignItems: "start",
    }}>
      <ContestsPanel
        contests={contests}
        selectedContest={selectedContest}
        onContestSelect={onContestSelect}
      />
      <PerformancePanel diffPoints={diffPoints} />
    </div>
  );
}