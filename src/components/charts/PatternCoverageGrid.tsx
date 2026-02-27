"use client";

import { useState } from "react";
import { PatternStat } from "@/types";

// ─── Pattern registry ─────────────────────────────────────────────────────────
// Source of truth for the grid. When the extension adds new patterns,
// they auto-appear in "Newly Detected" — no code change needed here.

const FOUNDATIONS: string[] = [
  "sliding_window",
  "two_pointers",
  "binary_search",
  "bfs",
  "dfs",
  "dp",
  "backtracking",
];

const ADVANCED: string[] = [
  "greedy",
  "top_k",
  "merge_intervals",
  "monotonic_stack",
  "prefix_sum",
  "fast_slow_pointers",
  "bit_manip",
  "math",
  "union_find",
];

const DISPLAY_NAMES: Record<string, string> = {
  sliding_window:      "Sliding Window",
  two_pointers:        "Two Pointers",
  binary_search:       "Binary Search",
  bfs:                 "BFS",
  dfs:                 "DFS",
  dp:                  "Dynamic Programming",
  backtracking:        "Backtracking",
  greedy:              "Greedy",
  top_k:               "Top K / Heap",
  merge_intervals:     "Merge Intervals",
  monotonic_stack:     "Monotonic Stack",
  prefix_sum:          "Prefix Sum",
  fast_slow_pointers:  "Fast & Slow Pointers",
  bit_manip:           "Bit Manipulation",
  math:                "Math",
  union_find:          "Union Find",
};

const ALL_KNOWN = new Set([...FOUNDATIONS, ...ADVANCED, "other"]);

function displayName(key: string): string {
  return DISPLAY_NAMES[key]
    ?? key.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function confidenceColor(avg: number): string {
  if (avg >= 0.75) return "var(--easy)";
  if (avg >= 0.4)  return "var(--accent)";
  return "var(--hard)";
}

function confidenceLabel(avg: number): string {
  if (avg >= 0.75) return "High";
  if (avg >= 0.4)  return "Med";
  return "Low";
}

// ─── Single tile ──────────────────────────────────────────────────────────────

function PatternTile({
  pattern,
  stat,
  index,
  delay,
  dimmed = false,
}: {
  pattern: string;
  stat: PatternStat | undefined;
  index: number;
  delay: number;
  dimmed?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const attempted = !!stat;
  const isOther = pattern === "other";
  const color = attempted && !isOther ? confidenceColor(stat.avg_confidence) : null;
  const name = displayName(pattern);

  return (
    <div
      className="animate-fade-in"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={
        isOther
          ? `${stat?.count ?? 0} problems tagged Other — consider re-tagging`
          : !attempted
          ? `${name} — not yet attempted`
          : `${name} · ${stat.count} problem${stat.count !== 1 ? "s" : ""} · ${confidenceLabel(stat.avg_confidence)} confidence`
      }
      style={{
        animationDelay: `${delay + index * 30}ms`,
        padding: "10px 10px 8px",
        borderRadius: "var(--radius-md)",
        border: `1px solid ${
          color
            ? `color-mix(in srgb, ${color} ${hovered ? "40%" : "22%"}, var(--border-subtle))`
            : hovered ? "var(--border-mid)" : "var(--border-subtle)"
        }`,
        background: color
          ? `color-mix(in srgb, ${color} ${hovered ? "12%" : "7%"}, var(--bg-elevated))`
          : hovered ? "var(--bg-hover)" : "var(--bg-elevated)",
        cursor: "default",
        transition: "all 0.15s ease",
        position: "relative",
        overflow: "hidden",
        opacity: dimmed ? 0.55 : 1,
      }}
    >
      {/* Ambient glow for attempted patterns */}
      {color && (
        <div style={{
          position: "absolute", top: -12, right: -12,
          width: 40, height: 40, borderRadius: "50%",
          background: color, opacity: 0.12,
          filter: "blur(10px)", pointerEvents: "none",
        }} />
      )}

      {/* Name */}
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        color: color ?? "var(--text-muted)",
        lineHeight: 1.3,
        marginBottom: 6,
        minHeight: 28,
        display: "flex",
        alignItems: "flex-start",
      }}>
        {name}
      </div>

      {/* Bottom row */}
      {color ? (
        // Normal attempted pattern
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color, lineHeight: 1 }}>
            {stat!.count}
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)",
            color,
            background: `color-mix(in srgb, ${color} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
            borderRadius: "var(--radius-pill)", padding: "1px 5px",
          }}>
            {confidenceLabel(stat!.avg_confidence)}
          </span>
        </div>
      ) : isOther && attempted ? (
        // Other — count + retag nudge
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
        // Not attempted
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--border-mid)" }} />
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontStyle: "italic" }}>not yet</span>
        </div>
      )}
    </div>
  );
}

// ─── Tier section ─────────────────────────────────────────────────────────────

function TierSection({
  label,
  sublabel,
  badge,
  patterns,
  statMap,
  delay,
  collapsible = false,
  defaultCollapsed = false,
  dimmed = false,
}: {
  label: string;
  sublabel?: string;
  badge?: string;
  patterns: string[];
  statMap: Map<string, PatternStat>;
  delay: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  dimmed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const attempted = patterns.filter(p => statMap.has(p)).length;
  const complete = attempted === patterns.length;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: collapsed ? 0 : 10,
          cursor: collapsible ? "pointer" : "default",
          userSelect: "none",
          paddingBottom: 6,
          borderBottom: "1px solid var(--border-subtle)",
        }}
        onClick={() => collapsible && setCollapsed(c => !c)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.07em",
            color: dimmed ? "var(--text-muted)" : "var(--text-secondary)",
          }}>
            {label}
          </span>
          {sublabel && (
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{sublabel}</span>
          )}
          {/* Attempted badge */}
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
            color: complete ? "var(--easy)" : "var(--text-muted)",
            background: complete
              ? "color-mix(in srgb, var(--easy) 10%, transparent)"
              : "var(--bg-elevated)",
            border: `1px solid ${complete
              ? "color-mix(in srgb, var(--easy) 25%, transparent)"
              : "var(--border-subtle)"}`,
            borderRadius: "var(--radius-pill)", padding: "1px 6px",
          }}>
            {attempted}/{patterns.length}
          </span>
          {badge && (
            <span style={{
              fontSize: 9, color: "var(--accent)",
              background: "var(--accent-muted)",
              border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
              borderRadius: "var(--radius-pill)", padding: "1px 6px", fontWeight: 600,
            }}>
              {badge}
            </span>
          )}
        </div>

        {/* Collapse toggle */}
        {collapsible && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)" }}>
            <span style={{ fontSize: 10 }}>{collapsed ? "Show" : "Hide"}</span>
            <svg
              width="10" height="10" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              style={{ transition: "transform 0.2s ease", transform: collapsed ? "rotate(0deg)" : "rotate(180deg)" }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        )}
      </div>

      {/* Tiles */}
      {!collapsed && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(95px, 1fr))",
          gap: 7,
          paddingTop: 4,
        }}>
          {patterns.map((p, i) => (
            <PatternTile
              key={p}
              pattern={p}
              stat={statMap.get(p)}
              index={i}
              delay={delay}
              dimmed={dimmed}
            />
          ))}
        </div>
      )}
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

  // Any pattern in DB not in our known lists — shows automatically when extension updates
  const unrecognised = patterns.filter(p => !ALL_KNOWN.has(p.pattern));

  const totalKnown = FOUNDATIONS.length + ADVANCED.length;
  const totalAttempted = [...FOUNDATIONS, ...ADVANCED].filter(p => statMap.has(p)).length;
  const foundationsAttempted = FOUNDATIONS.filter(p => statMap.has(p)).length;

  // Auto-open Advanced if user has done most of Foundations (≥5 of 7)
  const advancedDefaultCollapsed = foundationsAttempted < 5;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Overall progress ── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {totalAttempted} of {totalKnown} patterns attempted
          </span>
          {/* Legend */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {[
              { color: "var(--easy)",        label: "High" },
              { color: "var(--accent)",       label: "Med"  },
              { color: "var(--hard)",         label: "Low"  },
              { color: "var(--bg-elevated)",  label: "None", border: true },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: 2,
                  background: l.color,
                  border: l.border ? "1px solid var(--border-mid)" : "none",
                  boxShadow: !l.border ? `0 0 3px color-mix(in srgb, ${l.color} 50%, transparent)` : "none",
                }} />
                <span style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          height: 4, background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)", borderRadius: 2, overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${totalKnown > 0 ? (totalAttempted / totalKnown) * 100 : 0}%`,
            background: totalAttempted === totalKnown ? "var(--easy)" : "var(--accent)",
            borderRadius: 2,
            boxShadow: "0 0 6px color-mix(in srgb, var(--accent) 50%, transparent)",
            transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          }} />
        </div>
      </div>

      {/* ── Foundations — always open ── */}
      <TierSection
        label="Foundations"
        sublabel="— master these first"
        patterns={FOUNDATIONS}
        statMap={statMap}
        delay={delay}
        collapsible={false}
      />

      {/* ── Advanced — collapses until foundations are solid ── */}
      <TierSection
        label="Advanced"
        sublabel="— expand your coverage"
        patterns={ADVANCED}
        statMap={statMap}
        delay={delay + 80}
        collapsible={true}
        defaultCollapsed={advancedDefaultCollapsed}
      />

      {/* ── Auto-detected: new patterns from extension updates ── */}
      {unrecognised.length > 0 && (
        <TierSection
          label="Newly Detected"
          sublabel="— from extension update"
          badge="new"
          patterns={unrecognised.map(p => p.pattern)}
          statMap={statMap}
          delay={delay + 160}
          collapsible={true}
          defaultCollapsed={false}
        />
      )}

      {/* ── Other — demoted, last ── */}
      {otherStat && (
        <div>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            paddingBottom: 6, borderBottom: "1px solid var(--border-subtle)", marginBottom: 10,
          }}>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.07em", color: "var(--text-muted)",
            }}>
              Untagged / Other
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <PatternTile
              pattern="other"
              stat={otherStat}
              index={0}
              delay={delay}
              dimmed={true}
            />
            <p style={{
              fontSize: 11, color: "var(--text-muted)",
              lineHeight: 1.6, margin: 0, fontStyle: "italic",
            }}>
              {otherStat.count} problem{otherStat.count !== 1 ? "s" : ""} tagged as "Other". Visit
              each one and assign a real pattern to improve your coverage.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}