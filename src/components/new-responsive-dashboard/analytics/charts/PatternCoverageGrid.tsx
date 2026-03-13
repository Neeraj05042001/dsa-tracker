"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PatternStat } from "@/types";

// ─── Pattern registry ─────────────────────────────────────────────────────────

const FOUNDATIONS: string[] = ["sliding_window", "two_pointers", "binary_search", "bfs", "dfs", "dp", "backtracking"];
const ADVANCED: string[] = ["greedy", "top_k", "merge_intervals", "monotonic_stack", "prefix_sum", "fast_slow_pointers", "bit_manip", "math", "union_find"];

const DISPLAY_NAMES: Record<string, string> = {
  sliding_window: "Sliding Window", two_pointers: "Two Pointers", binary_search: "Binary Search",
  bfs: "BFS", dfs: "DFS", dp: "Dynamic Programming", backtracking: "Backtracking",
  greedy: "Greedy", top_k: "Top K / Heap", merge_intervals: "Merge Intervals",
  monotonic_stack: "Monotonic Stack", prefix_sum: "Prefix Sum",
  fast_slow_pointers: "Fast & Slow Pointers", bit_manip: "Bit Manipulation",
  math: "Math", union_find: "Union Find",
};

const ALL_KNOWN = new Set([...FOUNDATIONS, ...ADVANCED, "other"]);

function displayName(key: string): string {
  return DISPLAY_NAMES[key] ?? key.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
function confidenceColor(avg: number): string {
  if (avg >= 0.75) return "var(--easy)";
  if (avg >= 0.4) return "var(--accent)";
  return "var(--hard)";
}
function confidenceLabel(avg: number): string {
  if (avg >= 0.75) return "High";
  if (avg >= 0.4) return "Med";
  return "Low";
}

// ─── Progress ring (replaces linear bar) ─────────────────────────────────────

const PR_SIZE = 52;
const PR_STROKE = 5;
const PR_R = (PR_SIZE - PR_STROKE) / 2;
const PR_CIRC = 2 * Math.PI * PR_R;

function ProgressRing({ attempted, total, delay }: { attempted: number; total: number; delay: number }) {
  const [drawn, setDrawn] = useState(false);
  const pct = total > 0 ? attempted / total : 0;
  const color = pct === 1 ? "var(--easy)" : "var(--accent)";

  // Trigger after mount delay
  useState(() => {
    const t = setTimeout(() => setDrawn(true), delay + 300);
    return () => clearTimeout(t);
  });

  const dash = PR_CIRC * (drawn ? pct : 0);

  return (
    <div style={{ position: "relative", width: PR_SIZE, height: PR_SIZE, flexShrink: 0 }}>
      <svg width={PR_SIZE} height={PR_SIZE} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={PR_SIZE / 2} cy={PR_SIZE / 2} r={PR_R} fill="none" stroke="var(--bg-elevated)" strokeWidth={PR_STROKE} />
        <circle
          cx={PR_SIZE / 2} cy={PR_SIZE / 2} r={PR_R}
          fill="none" stroke={color} strokeWidth={PR_STROKE}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${PR_CIRC}`}
          style={{
            transition: "stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1)",
            filter: `drop-shadow(0 0 3px color-mix(in srgb, ${color} 70%, transparent))`,
          }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color, lineHeight: 1 }}>{attempted}</span>
        <span style={{ fontSize: 8, color: "var(--text-muted)", lineHeight: 1, marginTop: 1 }}>/{total}</span>
      </div>
    </div>
  );
}

// ─── Single tile ──────────────────────────────────────────────────────────────

function PatternTile({ pattern, stat, index, delay, dimmed = false }: {
  pattern: string; stat: PatternStat | undefined; index: number; delay: number; dimmed?: boolean;
}) {
  const attempted = !!stat;
  const isOther = pattern === "other";
  const color = attempted && !isOther ? confidenceColor(stat!.avg_confidence) : null;
  const name = displayName(pattern);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: dimmed ? 0.55 : 1, scale: 1 }}
      transition={{ delay: (delay + index * 35) / 1000, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.04, y: -2, transition: { type: "spring", stiffness: 380, damping: 20 } }}
      whileTap={{ scale: 0.97 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      title={
        isOther ? `${stat?.count ?? 0} problems tagged Other — consider re-tagging`
        : !attempted ? `${name} — not yet attempted`
        : `${name} · ${stat!.count} problem${stat!.count !== 1 ? "s" : ""} · ${confidenceLabel(stat!.avg_confidence)} confidence`
      }
      style={{
        padding: "10px 10px 8px",
        borderRadius: "var(--radius-md)",
        border: `1px solid ${
          color
            ? `color-mix(in srgb, ${color} ${hovered ? "45%" : "22%"}, var(--border-subtle))`
            : hovered ? "var(--border-mid)" : "var(--border-subtle)"
        }`,
        background: color
          ? `color-mix(in srgb, ${color} ${hovered ? "14%" : "7%"}, var(--bg-elevated))`
          : hovered ? "var(--bg-hover)" : "var(--bg-elevated)",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
        boxShadow: hovered && color ? `0 4px 16px color-mix(in srgb, ${color} 18%, transparent)` : "none",
        transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Shimmer on hover */}
      {hovered && color && (
        <motion.div
          initial={{ x: "-110%", skewX: -12 }}
          animate={{ x: "220%" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${color} 30%, transparent), transparent)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Ambient glow */}
      {color && (
        <motion.div
          animate={{ opacity: hovered ? 0.2 : 0.1 }}
          style={{
            position: "absolute", top: -12, right: -12,
            width: 40, height: 40, borderRadius: "50%",
            background: color, opacity: 0.12, filter: "blur(10px)", pointerEvents: "none",
          }}
        />
      )}

      {/* Name */}
      <div style={{
        fontSize: 11, fontWeight: 600,
        color: color ?? "var(--text-muted)",
        lineHeight: 1.3, marginBottom: 6, minHeight: 28,
        display: "flex", alignItems: "flex-start",
      }}>
        {name}
      </div>

      {/* Bottom row */}
      {color ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color, lineHeight: 1 }}>
            {stat!.count}
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)",
            color, background: `color-mix(in srgb, ${color} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
            borderRadius: "var(--radius-pill)", padding: "1px 5px",
          }}>
            {confidenceLabel(stat!.avg_confidence)}
          </span>
        </div>
      ) : isOther && attempted ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "var(--text-muted)", lineHeight: 1 }}>
            {stat!.count}
          </span>
          <span style={{
            fontSize: 9, color: "var(--medium)",
            background: "color-mix(in srgb, var(--medium) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--medium) 22%, transparent)",
            borderRadius: "var(--radius-pill)", padding: "1px 5px", fontWeight: 600,
          }}>
            re-tag
          </span>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--border-mid)" }} />
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontStyle: "italic" }}>not yet</span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Tier section ─────────────────────────────────────────────────────────────

function TierSection({ label, sublabel, badge, patterns, statMap, delay, collapsible = false, defaultCollapsed = false, dimmed = false }: {
  label: string; sublabel?: string; badge?: string; patterns: string[];
  statMap: Map<string, PatternStat>; delay: number; collapsible?: boolean;
  defaultCollapsed?: boolean; dimmed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const attempted = patterns.filter(p => statMap.has(p)).length;
  const complete = attempted === patterns.length;

  return (
    <div>
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: collapsed ? 0 : 10, cursor: collapsible ? "pointer" : "default",
          userSelect: "none", paddingBottom: 6,
          borderBottom: "1px solid var(--border-subtle)",
        }}
        onClick={() => collapsible && setCollapsed(c => !c)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: dimmed ? "var(--text-muted)" : "var(--text-secondary)" }}>
            {label}
          </span>
          {sublabel && <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{sublabel}</span>}
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
            color: complete ? "var(--easy)" : "var(--text-muted)",
            background: complete ? "color-mix(in srgb, var(--easy) 10%, transparent)" : "var(--bg-elevated)",
            border: `1px solid ${complete ? "color-mix(in srgb, var(--easy) 25%, transparent)" : "var(--border-subtle)"}`,
            borderRadius: "var(--radius-pill)", padding: "1px 6px",
          }}>
            {attempted}/{patterns.length}
          </span>
          {badge && (
            <span style={{
              fontSize: 9, color: "var(--accent)", background: "var(--accent-muted)",
              border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
              borderRadius: "var(--radius-pill)", padding: "1px 6px", fontWeight: 600,
            }}>
              {badge}
            </span>
          )}
        </div>
        {collapsible && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)" }}>
            <span style={{ fontSize: 10 }}>{collapsed ? "Show" : "Hide"}</span>
            <motion.svg
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.25 }}
              width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(95px, 1fr))", gap: 7, paddingTop: 4 }}>
              {patterns.map((p, i) => (
                <PatternTile key={p} pattern={p} stat={statMap.get(p)} index={i} delay={delay} dimmed={dimmed} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface PatternCoverageGridProps {
  patterns: PatternStat[];
  delay?: number;
}

export function PatternCoverageGrid({ patterns, delay = 0 }: PatternCoverageGridProps) {
  const statMap = new Map<string, PatternStat>();
  for (const p of patterns) statMap.set(p.pattern, p);

  const otherStat = statMap.get("other");
  const unrecognised = patterns.filter(p => !ALL_KNOWN.has(p.pattern));
  const totalKnown = FOUNDATIONS.length + ADVANCED.length;
  const totalAttempted = [...FOUNDATIONS, ...ADVANCED].filter(p => statMap.has(p)).length;
  const foundationsAttempted = FOUNDATIONS.filter(p => statMap.has(p)).length;
  const advancedDefaultCollapsed = foundationsAttempted < 5;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Overall progress row — ring + label ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay / 1000 + 0.1 }}
        style={{ display: "flex", alignItems: "center", gap: 14 }}
      >
        <ProgressRing attempted={totalAttempted} total={totalKnown} delay={delay} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>
            {totalAttempted} of {totalKnown} patterns attempted
          </div>
          {/* Legend */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {[
              { color: "var(--easy)", label: "High" },
              { color: "var(--accent)", label: "Med" },
              { color: "var(--hard)", label: "Low" },
              { color: "var(--bg-elevated)", label: "None", border: true },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: 2,
                  background: l.color,
                  border: l.border ? "1px solid var(--border-mid)" : "none",
                  boxShadow: !l.border ? `0 0 3px color-mix(in srgb, ${l.color} 50%, transparent)` : "none",
                }} />
                <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <TierSection label="Foundations" sublabel="— master these first" patterns={FOUNDATIONS} statMap={statMap} delay={delay} collapsible={false} />
      <TierSection label="Advanced" sublabel="— expand your coverage" patterns={ADVANCED} statMap={statMap} delay={delay + 80} collapsible={true} defaultCollapsed={advancedDefaultCollapsed} />

      {unrecognised.length > 0 && (
        <TierSection label="Newly Detected" sublabel="— from extension update" badge="new" patterns={unrecognised.map(p => p.pattern)} statMap={statMap} delay={delay + 160} collapsible={true} defaultCollapsed={false} />
      )}

      {otherStat && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 6, borderBottom: "1px solid var(--border-subtle)", marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)" }}>
              Untagged / Other
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <PatternTile pattern="other" stat={otherStat} index={0} delay={delay} dimmed={true} />
            <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
              {otherStat.count} problem{otherStat.count !== 1 ? "s" : ""} tagged as "Other". Visit each one and assign a real pattern to improve your coverage.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}