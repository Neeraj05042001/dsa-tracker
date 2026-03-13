"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import type { CfGroupProblem } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContestSummary = {
  id:        string;
  name:      string;
  problems:  CfGroupProblem[];
  solved:    number;
  attempted: number;
  todo:      number;
  total:     number;
  pct:       number;
};

interface ContestsSectionProps {
  contests:        ContestSummary[];
  selectedContest: string | null;
  onSelectContest: (id: string | null) => void;
}

type FilterKey = "all" | "active" | "done" | "pending";

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
  blue:      "#60a5fa",  // ③ "New" badge
  mono:      "var(--font-mono, 'JetBrains Mono', monospace)",
  sans:      "var(--font-sans, system-ui, sans-serif)",
} as const;

// ─── Colour helpers ────────────────────────────────────────────────────────────

function pColor(p: number) {
  if (p === 100) return D.green;
  if (p >= 70)   return D.teal;
  if (p >= 40)   return D.amber;
  if (p > 0)     return D.red;
  return "rgba(255,255,255,0.15)";
}
function pBg(p: number) {
  if (p === 100) return "rgba(74,222,128,0.07)";
  if (p >= 70)   return "rgba(0,212,170,0.07)";
  if (p >= 40)   return "rgba(251,191,36,0.06)";
  if (p > 0)     return "rgba(248,113,113,0.06)";
  return "rgba(255,255,255,0.02)";
}
function pBorder(p: number) {
  if (p === 100) return "rgba(74,222,128,0.32)";
  if (p >= 70)   return "rgba(0,212,170,0.28)";
  if (p >= 40)   return "rgba(251,191,36,0.26)";
  if (p > 0)     return "rgba(248,113,113,0.26)";
  return D.border;
}

// ─── FIX ①: Filter pills — per-tab accent + sliding layoutId pill + hover ─────

const FILTER_ACCENT: Record<FilterKey, { color: string; glow: string; bg: string }> = {
  all:     { color: D.teal,                   glow: "rgba(0,212,170,0.28)",   bg: "rgba(0,212,170,0.1)"    },
  active:  { color: D.amber,                  glow: "rgba(251,191,36,0.28)",  bg: "rgba(251,191,36,0.08)"  },
  done:    { color: D.green,                  glow: "rgba(74,222,128,0.28)",  bg: "rgba(74,222,128,0.08)"  },
  pending: { color: "rgba(255,255,255,0.55)", glow: "rgba(255,255,255,0.12)", bg: "rgba(255,255,255,0.05)" },
};

function FilterPills({
  filter,
  filters,
  onChange,
}: {
  filter:   FilterKey;
  filters:  [FilterKey, string][];
  onChange: (f: FilterKey) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
      {filters.map(([val, label]) => {
        const active = filter === val;
        const acc    = FILTER_ACCENT[val];
        return (
          <motion.button
            key={val}
            onClick={() => onChange(val)}
            whileTap={{ scale: 0.91 }}
            // FIX ①: hover border brightens even when inactive
            whileHover={{ borderColor: active ? acc.glow : "rgba(255,255,255,0.16)" }}
            style={{
              position: "relative",
              fontSize: 9.5,
              fontWeight: 600,
              padding: "3px 9px",
              borderRadius: 5,
              border: `1px solid ${active ? acc.glow : D.border}`,
              background: "transparent",
              color: active ? acc.color : D.muted,
              cursor: "pointer",
              transition: "color 0.15s, border-color 0.15s",
              fontFamily: D.sans,
              overflow: "hidden",
            }}
          >
            {/* Shared sliding pill — morphs between buttons via layoutId */}
            {active && (
              <motion.span
                layoutId="cs-filter-pill"
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 4,
                  background: acc.bg,
                  zIndex: 0,
                }}
              />
            )}
            <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Mini arc ring (used if needed) ───────────────────────────────────────────

function MiniRing({
  pct, size = 30, glowing = false,
}: { pct: number; size?: number; glowing?: boolean }) {
  const sw   = 2.8;
  const r    = size / 2 - sw;
  const circ = 2 * Math.PI * r;
  const col  = pColor(pct);

  return (
    <svg width={size} height={size} aria-hidden="true" style={{ flexShrink: 0, display: "block" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={sw} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={col} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - (pct / 100) * circ}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "filter 0.2s", filter: glowing ? `drop-shadow(0 0 4px ${col}cc)` : "none" }}
      />
      <text
        x={size/2} y={size/2 + 3.5} textAnchor="middle"
        fontSize={pct === 100 ? 8 : 7} fontFamily={D.mono} fontWeight="800" fill={col}
      >
        {pct === 100 ? "✓" : pct === 0 ? "—" : String(Math.round(pct))}
      </text>
    </svg>
  );
}

// ─── Progress dots ─────────────────────────────────────────────────────────────

function ProgressDots({
  contest, active, hovered,
}: { contest: ContestSummary; active: boolean; hovered: boolean }) {
  const { solved, attempted, total, pct } = contest;
  const col  = pColor(pct);
  const MAX  = 8;
  const dots = Math.min(total, MAX);

  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center", flexWrap: "nowrap", overflow: "hidden" }}>
      {Array.from({ length: dots }, (_, i) => {
        const ratio    = dots / total;
        const isSolved = i < Math.round(solved * ratio);
        const isTried  = !isSolved && i < Math.round((solved + attempted) * ratio);
        const bg       = isSolved ? col : isTried ? D.amber : "rgba(255,255,255,0.08)";
        return (
          <motion.div
            key={i}
            animate={{
              background: bg,
              boxShadow: isSolved && (active || hovered) ? `0 0 5px ${col}90` : "none",
              scale: active && isSolved ? 1.15 : 1,
            }}
            transition={{ duration: 0.18, delay: i * 0.012 }}
            style={{ width: 8, height: 8, borderRadius: 2.5, flexShrink: 0 }}
          />
        );
      })}
    </div>
  );
}

// ─── Single contest row ────────────────────────────────────────────────────────

function ContestRow({
  contest, rowIndex, active, onClick,
}: {
  contest:  ContestSummary;
  rowIndex: number;
  active:   boolean;
  onClick:  () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const col    = pColor(contest.pct);
  const pct    = Math.round(contest.pct);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -18 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      // FIX ⑥: 0.05s per row, cap 0.45s — visible stagger without bunching
      transition={{
        duration: 0.36,
        delay: Math.min(rowIndex * 0.05, 0.45),
        ease: [0.22, 1, 0.36, 1],
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      whileTap={{ scale: 0.997 }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-pressed={active}
      style={{
        display: "grid",
        gridTemplateColumns: "28px 1fr 94px 94px",
        alignItems: "center",
        gap: 20,
        padding: "13px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        background: active
          ? pBg(contest.pct)
          : hovered
            ? "rgba(255,255,255,0.022)"
            : "transparent",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.14s",
        userSelect: "none",
        outline: "none",
      }}
    >
      {/* Left accent bar */}
      <motion.div
        animate={{
          scaleY:     active ? 1 : hovered ? 0.6 : 0,
          opacity:    active ? 1 : 0.55,
          background: col,
        }}
        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          left: 0, top: 6, bottom: 6,
          width: 2.5,
          borderRadius: "0 3px 3px 0",
          transformOrigin: "center",
        }}
      />

      {/* FIX ⑧: # number reacts to row hover */}
      <motion.span
        animate={{
          color: hovered || active ? D.secondary : D.muted,
        }}
        transition={{ duration: 0.13 }}
        style={{
          fontSize: 10,
          fontFamily: D.mono,
          textAlign: "right",
          fontWeight: 600,
          display: "block",
        }}
      >
        {rowIndex + 1}
      </motion.span>

      {/* Name + FIX ②: amber "N left" pill */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <motion.span
          animate={{ color: active || hovered ? D.primary : D.secondary }}
          transition={{ duration: 0.13 }}
          title={contest.name}
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontFamily: D.sans,
            minWidth: 0,
          }}
        >
          {contest.name}
        </motion.span>

        {/* FIX ②: amber chip — signals pending work clearly */}
        {contest.todo > 0 && pct < 100 && (
          <span
            style={{
              fontSize: 9.5,
              fontFamily: D.mono,
              fontWeight: 600,
              color: D.amber,
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.2)",
              borderRadius: 4,
              padding: "1px 5px",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {contest.todo} left
          </span>
        )}
      </div>

      {/* Solved / Total — FIX: slightly more visible denominator */}
      <span
        style={{
          fontSize: 11,
          fontFamily: D.mono,
          color: D.muted,
          textAlign: "right",
          whiteSpace: "nowrap",
          paddingRight: 12,
        }}
      >
        {contest.solved}
        <span style={{ color: "rgba(255,255,255,0.22)" }}>/{contest.total}</span>
      </span>

      {/* Progress badge — FIX ③④ */}
      <div style={{ display: "flex", justifyContent: "flex-end", minWidth: 48 }}>
        {pct === 0 ? (
          // FIX ③: "New" — blue tint, clearly readable, signals "unstarted"
          <span
            style={{
              fontSize: 11,
              fontFamily: D.mono,
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: 6,
              background: "rgba(96,165,250,0.08)",
              color: D.blue,
              border: "1px solid rgba(96,165,250,0.24)",
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
            }}
          >
            New
          </span>
        ) : (
          // FIX ④: green glow on completed ✓, proper border hierarchy
          <span
            style={{
              fontSize: 11,
              fontFamily: D.mono,
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 6,
              background:
                pct === 100 ? "rgba(74,222,128,0.1)"
                : pct >= 70  ? "rgba(0,212,170,0.1)"
                : pct >= 40  ? "rgba(251,191,36,0.08)"
                :               "rgba(248,113,113,0.08)",
              color: pColor(pct),
              border: `1px solid ${pBorder(pct)}`,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              boxShadow: pct === 100 ? "0 0 8px rgba(74,222,128,0.22)" : "none",
            }}
          >
            {pct === 100 ? "✓" : `${pct}%`}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── FIX ⑩: terminal-style empty state ────────────────────────────────────────

function EmptyState({ filter }: { filter: FilterKey }) {
  const [tick, setTick] = useState(true);
  // cursor blink
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  if (typeof window !== "undefined" && !ref.current) {
    ref.current = setInterval(() => setTick((t) => !t), 540);
  }

  const msgMap: Record<FilterKey, string> = {
    all:     "no contests found",
    active:  "no active contests",
    done:    "none completed yet",
    pending: "no pending contests",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: "36px 16px", textAlign: "center" }}
    >
      <span
        style={{
          fontSize: 11,
          fontFamily: D.mono,
          color: D.muted,
        }}
      >
        <span style={{ color: "rgba(0,212,170,0.5)" }}>$</span>{" "}
        {msgMap[filter]}
        <span
          style={{
            color: D.teal,
            marginLeft: 2,
            fontWeight: 700,
            opacity: tick ? 1 : 0,
            transition: "opacity 0s",
          }}
        >
          ▌
        </span>
      </span>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ContestsSection({
  contests,
  selectedContest,
  onSelectContest,
}: ContestsSectionProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const doneCount  = contests.filter((c) => Math.round(c.pct) === 100).length;
  const allDone    = doneCount === contests.length && contests.length > 0;
  const sorted     = [...contests].sort((a, b) => Number(b.id) - Number(a.id));

  const filtered = sorted.filter((c) => {
    const pct = Math.round(c.pct);
    if (filter === "done")    return pct === 100;
    if (filter === "active")  return pct > 0 && pct < 100;
    if (filter === "pending") return pct === 0;
    return true;
  });

  const activeContest = contests.find((c) => c.id === selectedContest);

  const totals = {
    solved:    contests.reduce((s, c) => s + c.solved,    0),
    attempted: contests.reduce((s, c) => s + c.attempted, 0),
    todo:      contests.reduce((s, c) => s + c.todo,      0),
  };

  const FILTERS: [FilterKey, string][] = [
    ["all",     "All"    ],
    ["active",  "Active" ],
    ["done",    "Done"   ],
    ["pending", "Pending"],
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
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Ambient glow — top-right */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -50, right: -50,
          width: 200, height: 200,
          borderRadius: "50%",
          background: D.teal,
          filter: "blur(80px)",
          opacity: 0.025,
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
          gap: 8,
        }}
      >
        {/* Left: title + FIX ⑨ count badge + active chip */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
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
            Contests
          </motion.span>

          {/* FIX ⑨: complete badge turns teal when everything is done */}
          <motion.span
            initial={{ opacity: 0, scale: 0.75 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.22, type: "spring", stiffness: 400, damping: 20 }}
            style={{
              fontSize: 9.5,
              fontFamily: D.mono,
              color: allDone ? D.teal : D.muted,
              background: allDone ? "rgba(0,212,170,0.08)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${allDone ? "rgba(0,212,170,0.22)" : D.border}`,
              borderRadius: 5,
              padding: "1px 7px",
              transition: "color 0.3s, background 0.3s, border-color 0.3s",
              // subtle glow when all done
              boxShadow: allDone ? "0 0 8px rgba(0,212,170,0.12)" : "none",
            }}
          >
            {/* small dot when all done */}
            {allDone && (
              <span
                style={{
                  display: "inline-block",
                  width: 5, height: 5,
                  borderRadius: "50%",
                  background: D.teal,
                  marginRight: 5,
                  verticalAlign: "middle",
                  boxShadow: "0 0 5px rgba(0,212,170,0.8)",
                  position: "relative",
                  top: -1,
                }}
              />
            )}
            {doneCount}/{contests.length} complete
          </motion.span>

          {/* Active-contest dismissible chip */}
          <AnimatePresence>
            {selectedContest && activeContest && (
              <motion.div
                key="chip"
                initial={{ opacity: 0, scale: 0.8, x: -6 }}
                animate={{ opacity: 1, scale: 1,   x: 0  }}
                exit={{   opacity: 0, scale: 0.8, x: -6  }}
                transition={{ type: "spring", stiffness: 440, damping: 24 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "2px 8px",
                  background: "rgba(0,212,170,0.08)",
                  border: "1px solid rgba(0,212,170,0.25)",
                  borderRadius: 5,
                }}
              >
                <span
                  style={{
                    fontSize: 9.5,
                    color: D.teal,
                    fontWeight: 600,
                    maxWidth: 130,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {activeContest.name}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectContest(null); }}
                  aria-label="Clear contest filter"
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(0,212,170,0.5)",
                    cursor: "pointer",
                    fontSize: 14,
                    lineHeight: 1,
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: FIX ① filter pills with sliding pill + per-tab colour */}
        <FilterPills filter={filter} filters={FILTERS} onChange={setFilter} />
      </div>

      {/* ── Column headers ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.18 }}
        style={{
          display: "grid",
          gridTemplateColumns: "28px 1fr 94px 94px",
          gap: 20,
          padding: "6px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          background: "rgba(0,0,0,0.18)",
        }}
      >
        {(["#", "Contest", "Done", "Progress"] as const).map((h, i) => (
          <span
            key={i}
            style={{
              fontSize: 9,
              fontWeight: 700,
              // FIX ⑦: consistent with ProblemsTable header
              color: "rgba(255,255,255,0.25)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              textAlign: i === 0 ? "right" : i >= 2 ? "right" : "left",
              paddingRight: i === 2 ? 12 : 0,
            }}
          >
            {h}
          </span>
        ))}
      </motion.div>

      {/* ── Rows ────────────────────────────────────────────────────────────── */}
      <div style={{ overflowY: "auto", maxHeight: 420, flex: 1 }}>
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            // FIX ⑩: terminal-style empty state
            <EmptyState key="empty" filter={filter} />
          ) : (
            filtered.map((c, i) => (
              <ContestRow
                key={c.id}
                contest={c}
                rowIndex={i}
                active={selectedContest === c.id}
                onClick={() => onSelectContest(selectedContest === c.id ? null : c.id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer totals ────────────────────────────────────────────────────── */}
      {contests.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          style={{
            display: "flex",
            gap: 16,
            padding: "8px 16px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            background: "rgba(0,0,0,0.1)",
            flexWrap: "wrap",
          }}
        >
          {(
            [
              [D.teal,                   totals.solved,    "solved"],
              [D.amber,                  totals.attempted, "tried" ],
              ["rgba(255,255,255,0.3)",   totals.todo,      "todo"  ],
            ] as [string, number, string][]
          ).map(([col, val, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {/* FIX ⑤: circles not squares — consistent with ProblemsTable */}
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: col,
                  opacity: 0.8,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 10.5, fontFamily: D.mono, color: D.muted }}>
                <span style={{ color: D.secondary, fontWeight: 600 }}>{val}</span>{" "}{label}
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Bottom accent ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          height: 2,
          background: `linear-gradient(90deg, ${D.teal}, rgba(0,212,170,0.3), transparent)`,
          transformOrigin: "left",
          opacity: 0.45,
        }}
      />
    </motion.div>
  );
}