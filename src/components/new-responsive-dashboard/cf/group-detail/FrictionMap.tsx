"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import type { CfGroupProblem } from "@/types";

// ── PeerData type — same as GroupDetailClientV2 ────────────────────────────────
type PeerData = {
  recommended_problems: Array<{
    name:       string;
    link:       string;
    solvedCount: number;
    status:     string;
  }>;
  submissionTimestamps: number[];
};

// ── Design tokens ──────────────────────────────────────────────────────────────

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
  orange:    "#fb923c",
  mono:      "var(--font-mono, 'JetBrains Mono', monospace)",
  sans:      "var(--font-sans, system-ui, sans-serif)",
} as const;

// ── Props ──────────────────────────────────────────────────────────────────────

interface FrictionMapProps {
  problems:       CfGroupProblem[];
  contestNameMap: Map<string, string>;
  peerData:       PeerData | null;
}

// ── Heat bar — visual signal of how many peers solved this ─────────────────────

function HeatBar({ count, max }: { count: number; max: number }) {
  if (max === 0 || count === 0) return null;
  const pct = Math.max(count / max, 0.08) * 100;
  const col = count / max > 0.7
    ? D.orange
    : count / max > 0.35
      ? D.amber
      : D.teal;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 56, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: "100%", borderRadius: 2, background: col }}
        />
      </div>
      <span style={{ fontSize: 9.5, fontFamily: D.mono, color: col, fontWeight: 700 }}>
        {count}
      </span>
    </div>
  );
}

// ── Single friction row ────────────────────────────────────────────────────────

function FrictionRow({
  problem,
  contestName,
  peerCount,
  maxPeerCount,
  rowIndex,
  rank,
}: {
  problem:      CfGroupProblem;
  contestName:  string;
  peerCount:    number;
  maxPeerCount: number;
  rowIndex:     number;
  rank:         number;
}) {
  const [hovered, setHovered] = useState(false);
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-16px" });

  // Priority color — higher peer count = warmer
  const priorityColor = peerCount === 0
    ? D.secondary
    : peerCount / maxPeerCount > 0.7
      ? D.orange
      : peerCount / maxPeerCount > 0.35
        ? D.amber
        : D.teal;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -14 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.32,
        delay: Math.min(rowIndex * 0.045, 0.4),
        ease: [0.22, 1, 0.36, 1],
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "20px 26px 1fr 80px 24px",
        alignItems: "center",
        gap: 12,
        padding: "11px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        background: hovered ? "rgba(251,191,36,0.025)" : "transparent",
        position: "relative",
        transition: "background 0.13s",
        userSelect: "none",
      }}
    >
      {/* Left accent bar */}
      <motion.div
        animate={{ scaleY: hovered ? 1 : 0, opacity: hovered ? 0.9 : 0, background: priorityColor }}
        transition={{ duration: 0.14 }}
        style={{
          position: "absolute", left: 0, top: 4, bottom: 4,
          width: 2.5, borderRadius: "0 3px 3px 0", transformOrigin: "center",
        }}
      />

      {/* Rank # */}
      <span style={{ fontSize: 9.5, fontFamily: D.mono, color: D.muted, textAlign: "right", fontWeight: 600 }}>
        {rank}
      </span>

      {/* Problem index badge */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 26, height: 26, borderRadius: 7,
        background: `${priorityColor}14`,
        border: `1px solid ${priorityColor}30`,
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 10.5, fontFamily: D.mono, fontWeight: 800,
          color: priorityColor, letterSpacing: "-0.02em",
        }}>
          {problem.problem_index}
        </span>
      </div>

      {/* Name + contest */}
      <div style={{ overflow: "hidden", minWidth: 0 }}>
        <a
          href={problem.problem_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            fontSize: 12.5,
            fontWeight: 600,
            color: hovered ? D.amber : D.primary,
            textDecoration: "none",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            transition: "color 0.12s",
          }}
        >
          {problem.problem_name}
        </a>
        <span style={{
          fontSize: 10, color: D.muted,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          display: "block",
        }}>
          {contestName}
        </span>
      </div>

      {/* Peer count heat bar */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {peerCount > 0 ? (
          <HeatBar count={peerCount} max={maxPeerCount} />
        ) : (
          <span style={{ fontSize: 9, color: D.muted, fontFamily: D.mono }}>no data</span>
        )}
      </div>

      {/* External link icon */}
      <a
        href={problem.problem_url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          color: hovered ? D.amber : "rgba(255,255,255,0.18)",
          transition: "color 0.12s",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
    </motion.div>
  );
}

// ── Priority legend ────────────────────────────────────────────────────────────

function PriorityLegend({ hasPeerData }: { hasPeerData: boolean }) {
  if (!hasPeerData) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <span style={{ fontSize: 9, color: D.muted, fontFamily: D.mono }}>peer solves:</span>
      {[
        { label: "most", color: D.orange },
        { label: "some", color: D.amber  },
        { label: "few",  color: D.teal   },
      ].map(l => (
        <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 20, height: 3, borderRadius: 2, background: l.color }} />
          <span style={{ fontSize: 8.5, color: D.muted, fontFamily: D.mono }}>{l.label}</span>
        </div>
      ))}
      <span style={{ fontSize: 8.5, color: D.muted, fontFamily: D.mono, marginLeft: 4 }}>
        · sorted by peer count (highest priority first)
      </span>
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyAttempted() {
  return (
    <div style={{ padding: "32px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>🎯</div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: D.secondary, fontFamily: D.sans, marginBottom: 4 }}>
        No stuck problems
      </div>
      <div style={{ fontSize: 11, color: D.muted, fontFamily: D.sans }}>
        Problems you attempt but don't solve will show up here as your growth targets.
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────

export function FrictionMap({ problems, contestNameMap, peerData }: FrictionMapProps) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  // Build peer solve count lookup
  const peerMap = useMemo(() => {
    const m = new Map<string, number>();
    if (!peerData) return m;
    for (const rp of peerData.recommended_problems) {
      m.set(rp.link, rp.solvedCount);
    }
    return m;
  }, [peerData]);

  // Attempted problems, enriched with peer count, sorted by priority
  const attempted = useMemo(() => {
    const filtered = problems
      .filter(p => p.cf_status === "attempted")
      .map(p => ({ ...p, peerCount: peerMap.get(p.problem_url) ?? 0 }));

    return filtered.sort((a, b) => {
      // Primary: peer count desc (most-solved by peers = highest growth opportunity)
      if (b.peerCount !== a.peerCount) return b.peerCount - a.peerCount;
      // Secondary: contest order asc
      return a.contest_id.localeCompare(b.contest_id) ||
             a.problem_index.localeCompare(b.problem_index);
    });
  }, [problems, peerMap]);

  const maxPeerCount = Math.max(...attempted.map(p => p.peerCount), 1);
  const hasPeerData  = peerData !== null && attempted.some(p => p.peerCount > 0);

  // Don't render at all if nothing is attempted
  if (attempted.length === 0) return null;

  // Group by contest for the stats strip
  const byContest = new Map<string, number>();
  for (const p of attempted) {
    byContest.set(p.contest_id, (byContest.get(p.contest_id) ?? 0) + 1);
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: D.surface,
        border: "1px solid rgba(251,191,36,0.12)",  // amber border — this is important
        borderRadius: 14,
        overflow: "hidden",
        position: "relative",
        fontFamily: D.sans,
      }}
    >
      {/* Amber ambient glow — top left */}
      <div aria-hidden style={{
        position: "absolute", top: -40, left: -40,
        width: 160, height: 160, borderRadius: "50%",
        background: D.amber, filter: "blur(70px)",
        opacity: 0.055, pointerEvents: "none",
      }} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        padding: "12px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 8,
      }}>
        <div>
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <motion.span
              initial={{ opacity: 0, letterSpacing: "0.3em" }}
              animate={inView ? { opacity: 1, letterSpacing: "0.1em" } : {}}
              transition={{ duration: 0.45, delay: 0.1 }}
              style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: D.muted,
              }}
            >
              Friction Map
            </motion.span>

            {/* Count badge */}
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.22, type: "spring", stiffness: 400, damping: 20 }}
              style={{
                fontSize: 9.5, fontFamily: D.mono, fontWeight: 700,
                color: D.amber,
                background: "rgba(251,191,36,0.1)",
                border: "1px solid rgba(251,191,36,0.22)",
                borderRadius: 5, padding: "1px 7px",
              }}
            >
              {attempted.length} stuck
            </motion.span>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.28 }}
            style={{
              margin: 0, fontSize: 11,
              color: D.muted, fontFamily: D.sans, lineHeight: 1.4,
            }}
          >
            Problems you attempted but didn't solve.{" "}
            <span style={{ color: D.secondary }}>These are your growth opportunities — push through one at a time.</span>
          </motion.p>
        </div>

        {/* Stats chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
          style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}
        >
          <div style={{
            fontSize: 9.5, fontFamily: D.mono, color: D.muted,
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${D.border}`, borderRadius: 5, padding: "2px 8px",
          }}>
            {byContest.size} contest{byContest.size !== 1 ? "s" : ""}
          </div>
        </motion.div>
      </div>

      {/* ── Column headers ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.18 }}
        style={{
          display: "grid",
          gridTemplateColumns: "20px 26px 1fr 80px 24px",
          gap: 12,
          padding: "5px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          background: "rgba(0,0,0,0.18)",
        }}
      >
        {["#", "Pos", "Problem", hasPeerData ? "Peers" : "", ""].map((h, i) => (
          <span
            key={i}
            style={{
              fontSize: 9, fontWeight: 700,
              color: "rgba(255,255,255,0.25)",
              textTransform: "uppercase", letterSpacing: "0.08em",
              textAlign: i === 3 ? "right" : i === 0 ? "right" : "left",
            }}
          >
            {h}
          </span>
        ))}
      </motion.div>

      {/* ── Rows ────────────────────────────────────────────────────────────── */}
      <div style={{ maxHeight: 380, overflowY: "auto" }}>
        {attempted.map((p, i) => (
          <FrictionRow
            key={p.id}
            problem={p}
            contestName={contestNameMap.get(p.contest_id) ?? p.contest_name ?? `Contest ${p.contest_id}`}
            peerCount={p.peerCount}
            maxPeerCount={maxPeerCount}
            rowIndex={i}
            rank={i + 1}
          />
        ))}
      </div>

      {/* ── Footer: legend + insight ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.65 }}
        style={{
          padding: "8px 16px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          background: "rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <PriorityLegend hasPeerData={hasPeerData} />

        {/* Actionable tip */}
        {attempted.length > 0 && (
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 7,
            padding: "7px 10px",
            background: "rgba(251,191,36,0.04)",
            border: "1px solid rgba(251,191,36,0.1)",
            borderRadius: 7,
          }}>
            <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>💡</span>
            <p style={{ margin: 0, fontSize: 10.5, color: D.muted, fontFamily: D.sans, lineHeight: 1.55 }}>
              <span style={{ color: D.amber, fontWeight: 600 }}>
                {attempted[0].problem_name}
              </span>
              {" "}is your highest-priority problem
              {hasPeerData && attempted[0].peerCount > 0
                ? ` — ${attempted[0].peerCount} peers solved it.`
                : "."}
              {" "}
              <span style={{ color: D.secondary }}>
                Solving this unlocks the most group-level progress.
              </span>
            </p>
          </div>
        )}
      </motion.div>

      {/* ── Bottom accent — amber ────────────────────────────────────────────── */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          height: 2,
          background: `linear-gradient(90deg, ${D.amber}, rgba(251,191,36,0.3), transparent)`,
          transformOrigin: "left",
          opacity: 0.5,
        }}
      />
    </motion.div>
  );
}