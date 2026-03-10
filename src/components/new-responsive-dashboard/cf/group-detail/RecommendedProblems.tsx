"use client";

/**
 * RecommendedProblems
 * ───────────────────
 * Displays all problems from peerData.recommended_problems, ranked by
 * solvedCount (how many group peers solved it). Hotter = more peers = do it first.
 *
 * Place at:  src/components/new-responsive-dashboard/cf/group-detail/RecommendedProblems.tsx
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RecommendedProblem = {
  name:        string;
  link:        string;
  solvedCount: number;
  status:      string; // "todo" | "solved" | "attempted"
};

interface Props {
  problems: RecommendedProblem[];
  isLoading?: boolean;
}

type SortKey    = "peers"  | "name" | "status";
type StatusFilter = "all"  | "todo" | "solved";

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
  orange:   "#fb923c",
  mono:     "var(--font-mono, 'JetBrains Mono', monospace)",
  sans:     "var(--font-sans, system-ui, sans-serif)",
} as const;

// ─── Heat colour — amber→orange→red as rank climbs ───────────────────────────

function heatColor(rank: number, total: number): string {
  const t = total <= 1 ? 0 : 1 - rank / (total - 1); // 1 = hottest (rank 0)
  if (t > 0.75) return D.amber;
  if (t > 0.45) return D.orange;
  if (t > 0.2)  return D.teal;
  return "rgba(255,255,255,0.2)";
}

function statusColor(s: string) {
  if (s === "solved")    return { text: D.green,  bg: "rgba(74,222,128,0.09)",   border: "rgba(74,222,128,0.22)",   label: "Solved"    };
  if (s === "attempted") return { text: D.amber,  bg: "rgba(251,191,36,0.09)",   border: "rgba(251,191,36,0.22)",   label: "Attempted" };
  return                        { text: D.muted,  bg: "rgba(255,255,255,0.04)",  border: "rgba(255,255,255,0.1)",   label: "Todo"      };
}

// ─── Rank Badge ───────────────────────────────────────────────────────────────

function RankBadge({ rank, total }: { rank: number; total: number }) {
  const color = heatColor(rank, total);
  const isTop3 = rank < 3;

  return (
    <div style={{
      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: isTop3 ? `${color}18` : "rgba(255,255,255,0.03)",
      border: `1px solid ${isTop3 ? `${color}40` : "rgba(255,255,255,0.07)"}`,
      boxShadow: isTop3 ? `0 0 10px ${color}25` : "none",
    }}>
      <span style={{
        fontSize: 10, fontFamily: D.mono, fontWeight: 800,
        color: isTop3 ? color : D.muted,
      }}>
        {rank + 1}
      </span>
    </div>
  );
}

// ─── Solve Heat Bar ───────────────────────────────────────────────────────────

function HeatBar({
  count, max, rank, total, inView, delay,
}: {
  count: number; max: number; rank: number; total: number;
  inView: boolean; delay: number;
}) {
  const pct   = max > 0 ? (count / max) * 100 : 0;
  const color = heatColor(rank, total);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
      {/* Bar track */}
      <div style={{
        flex: 1, height: 4, borderRadius: 4,
        background: "rgba(255,255,255,0.05)",
        overflow: "hidden",
        minWidth: 40,
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : { width: 0 }}
          transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "100%", borderRadius: 4,
            background: color,
            boxShadow: pct > 60 ? `0 0 6px ${color}80` : "none",
          }}
        />
      </div>
      {/* Count label */}
      <span style={{
        fontSize: 10, fontFamily: D.mono, fontWeight: 700,
        color: count > 0 ? color : D.muted,
        flexShrink: 0, minWidth: 22, textAlign: "right",
      }}>
        {count}
      </span>
    </div>
  );
}

// ─── Problem Row ──────────────────────────────────────────────────────────────

function ProblemRow({
  problem, rank, total, maxSolves, rowIndex, inView,
}: {
  problem:   RecommendedProblem;
  rank:      number;
  total:     number;
  maxSolves: number;
  rowIndex:  number;
  inView:    boolean;
}) {
  const [hov, setHov] = useState(false);
  const sc    = statusColor(problem.status);
  const color = heatColor(rank, total);
  const isSolved = problem.status === "solved";

  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.32,
        delay: Math.min(rowIndex * 0.038, 0.5),
        ease: [0.22, 1, 0.36, 1],
      }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "34px 1fr 90px 80px",
        alignItems: "center",
        gap: 10,
        padding: "9px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        background: hov
          ? isSolved ? "rgba(74,222,128,0.025)" : "rgba(251,191,36,0.02)"
          : "transparent",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.13s",
        opacity: isSolved ? 0.55 : 1,
      }}
    >
      {/* Left glow line on hover */}
      <motion.div
        animate={{ scaleY: hov ? 1 : 0, opacity: hov ? 1 : 0 }}
        transition={{ duration: 0.14 }}
        style={{
          position: "absolute", left: 0, top: 4, bottom: 4,
          width: 2.5, background: color,
          borderRadius: "0 3px 3px 0", transformOrigin: "center",
        }}
      />

      {/* Rank badge */}
      <RankBadge rank={rank} total={total} />

      {/* Problem name + heat bar */}
      <div style={{ minWidth: 0 }}>
        <a
          href={problem.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          style={{
            fontSize: 12.5, fontWeight: 600,
            color: hov ? color : D.primary,
            textDecoration: "none",
            display: "block",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            transition: "color 0.13s",
            marginBottom: 4,
          }}
        >
          {problem.name}
        </a>
        <HeatBar
          count={problem.solvedCount}
          max={maxSolves}
          rank={rank}
          total={total}
          inView={inView}
          delay={Math.min(rowIndex * 0.038 + 0.2, 0.65)}
        />
      </div>

      {/* Peers label */}
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: 12, fontWeight: 800, fontFamily: D.mono,
          color: problem.solvedCount > 0 ? color : D.muted,
        }}>
          {problem.solvedCount}
        </div>
        <div style={{ fontSize: 9, color: D.muted, marginTop: 1 }}>peers</div>
      </div>

      {/* Status badge */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 5,
          color: sc.text, background: sc.bg,
          border: `1px solid ${sc.border}`,
          whiteSpace: "nowrap",
        }}>
          {isSolved ? (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Done
            </span>
          ) : sc.label}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ isLoading }: { isLoading: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        padding: "48px 24px",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 12, textAlign: "center",
      }}
    >
      {isLoading ? (
        <>
          {/* Pulsing skeleton rows */}
          {[1, 0.7, 0.5].map((op, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [op * 0.4, op, op * 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
              style={{
                width: `${85 - i * 12}%`, height: 10, borderRadius: 6,
                background: "rgba(255,255,255,0.06)",
              }}
            />
          ))}
          <span style={{ fontSize: 11, color: D.muted, marginTop: 8 }}>
            Fetching recommendations…
          </span>
        </>
      ) : (
        <>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "rgba(0,212,170,0.07)",
            border: "1px solid rgba(0,212,170,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={D.teal} strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: D.secondary, marginBottom: 4 }}>
              No recommendations yet
            </div>
            <div style={{ fontSize: 11, color: D.muted, lineHeight: 1.6 }}>
              Recommendations appear once peers in your group start solving problems
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function RecommendedProblems({ problems, isLoading = false }: Props) {
  const [sort, setSort]     = useState<SortKey>("peers");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  // Filter
  const afterFilter = problems.filter(p => {
    if (filter === "todo"   && p.status !== "todo")   return false;
    if (filter === "solved" && p.status !== "solved") return false;
    if (search.trim()) {
      if (!p.name.toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  });

  // Sort
  const sorted = [...afterFilter].sort((a, b) => {
    if (sort === "peers")  return b.solvedCount - a.solvedCount;
    if (sort === "name")   return a.name.localeCompare(b.name);
    if (sort === "status") {
      const order = { todo: 0, attempted: 1, solved: 2 };
      return (order[a.status as keyof typeof order] ?? 0) -
             (order[b.status as keyof typeof order] ?? 0);
    }
    return 0;
  });

  const maxSolves  = Math.max(...problems.map(p => p.solvedCount), 1);
  const todoCount  = problems.filter(p => p.status === "todo").length;
  const doneCount  = problems.filter(p => p.status === "solved").length;

  const FILTERS: [StatusFilter, string, number][] = [
    ["all",    "All",    problems.length],
    ["todo",   "Todo",   todoCount],
    ["solved", "Solved", doneCount],
  ];

  const SORTS: [SortKey, string][] = [
    ["peers",  "Peers ↓"],
    ["name",   "A–Z"],
    ["status", "Status"],
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: D.surface,
        border: `1px solid ${D.border}`,
        borderRadius: 14,
        overflow: "hidden",
        position: "relative",
        fontFamily: D.sans,
      }}
    >
      {/* Ambient amber glow — top right */}
      <div aria-hidden style={{
        position: "absolute", top: -50, right: -50,
        width: 200, height: 200, borderRadius: "50%",
        background: D.amber, filter: "blur(80px)",
        opacity: 0.03, pointerEvents: "none",
      }} />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{
        padding: "12px 16px",
        borderBottom: `1px solid ${D.border}`,
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Title */}
          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.3em" }}
            animate={inView ? { opacity: 1, letterSpacing: "0.1em" } : {}}
            transition={{ duration: 0.45, delay: 0.1 }}
            style={{
              fontSize: 9.5, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: D.muted,
            }}
          >
            Recommended Problems
          </motion.span>

          {/* Count badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.75 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.22, type: "spring", stiffness: 400, damping: 20 }}
            style={{
              fontSize: 9.5, fontFamily: D.mono, color: D.muted,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${D.border}`,
              borderRadius: 5, padding: "1px 7px",
            }}
          >
            {problems.length} problems
          </motion.span>

          {/* Live indicator */}
          {problems.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: D.teal,
                  boxShadow: `0 0 6px ${D.teal}`,
                }}
              />
              <span style={{ fontSize: 9, color: D.muted }}>live from peers</span>
            </div>
          )}
        </div>

        {/* Controls: search + filter + sort */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <svg
              style={{ position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)" }}
              width="10" height="10" viewBox="0 0 24 24" fill="none"
              stroke={D.secondary} strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                paddingLeft: 22, paddingRight: 8, paddingTop: 4, paddingBottom: 4,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${D.border}`,
                borderRadius: 6, color: D.primary,
                fontSize: 11, outline: "none",
                width: 120, transition: "border-color 0.15s",
                fontFamily: D.sans,
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(0,212,170,0.35)")}
              onBlur={e  => (e.target.style.borderColor = D.border)}
            />
          </div>

          {/* Status filters */}
          {FILTERS.map(([val, label, count]) => {
            const active = filter === val;
            return (
              <motion.button
                key={val}
                onClick={() => setFilter(val)}
                whileTap={{ scale: 0.92 }}
                style={{
                  fontSize: 9.5, fontWeight: 600, padding: "3px 9px", borderRadius: 5,
                  border: `1px solid ${active ? "rgba(0,212,170,0.3)" : D.border}`,
                  background: active ? "rgba(0,212,170,0.1)" : "transparent",
                  color: active ? D.teal : D.muted,
                  cursor: "pointer", transition: "all 0.13s",
                  fontFamily: D.sans,
                }}
              >
                {label} {count > 0 && <span style={{ opacity: 0.7 }}>({count})</span>}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Column headers ───────────────────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "34px 1fr 90px 80px",
        gap: 10, padding: "6px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        background: "rgba(0,0,0,0.18)",
        alignItems: "center",
      }}>
        {/* Rank */}
        <span style={{ fontSize: 9, fontWeight: 700, color: D.muted, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>
          #
        </span>
        {/* Problem + sort */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: D.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Problem
          </span>
          {/* Sort buttons */}
          <div style={{ display: "flex", gap: 3 }}>
            {SORTS.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                style={{
                  fontSize: 8.5, fontWeight: 600, padding: "1px 6px", borderRadius: 4,
                  border: `1px solid ${sort === key ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.06)"}`,
                  background: sort === key ? "rgba(251,191,36,0.09)" : "transparent",
                  color: sort === key ? D.amber : D.muted,
                  cursor: "pointer", transition: "all 0.13s",
                  fontFamily: D.sans,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, color: D.muted, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>
          Peers
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, color: D.muted, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>
          Status
        </span>
      </div>

      {/* ── Rows ─────────────────────────────────────────────────────────────── */}
      <div style={{ maxHeight: 480, overflowY: "auto" }}>
        {isLoading || problems.length === 0 || sorted.length === 0 ? (
          <EmptyState isLoading={isLoading} />
        ) : (
          <AnimatePresence mode="popLayout">
            {sorted.map((p, i) => {
              // Rank in the ORIGINAL sorted-by-peers list
              const originalRank = [...problems]
                .sort((a, b) => b.solvedCount - a.solvedCount)
                .findIndex(x => x.link === p.link);

              return (
                <ProblemRow
                  key={p.link}
                  problem={p}
                  rank={originalRank}
                  total={problems.length}
                  maxSolves={maxSolves}
                  rowIndex={i}
                  inView={inView}
                />
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      {sorted.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 16px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            background: "rgba(0,0,0,0.1)",
            flexWrap: "wrap", gap: 8,
          }}
        >
          <div style={{ display: "flex", gap: 16 }}>
            {[
              [D.amber, todoCount, "to solve"],
              [D.green, doneCount, "solved"],
            ].map(([color, count, label]) => (
              <div key={label as string} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: 2, background: color as string, opacity: 0.8 }} />
                <span style={{ fontSize: 10.5, fontFamily: D.mono, color: D.muted }}>
                  <span style={{ color: D.secondary, fontWeight: 600 }}>{count as number}</span>{" "}{label as string}
                </span>
              </div>
            ))}
          </div>
          <span style={{ fontSize: 9.5, color: D.muted, fontFamily: D.mono }}>
            Ranked by peer solve count
          </span>
        </motion.div>
      )}

      {/* ── Bottom accent ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{
          height: 2,
          background: `linear-gradient(90deg, ${D.amber}, rgba(251,191,36,0.3), transparent)`,
          transformOrigin: "left", opacity: 0.5,
        }}
      />
    </motion.div>
  );
}