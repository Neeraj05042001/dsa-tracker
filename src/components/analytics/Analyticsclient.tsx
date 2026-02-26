"use client";

import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { ProblemStats } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsClientProps {
  stats: ProblemStats;
}

type TimeRange = "30" | "60" | "90";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPattern(p: string): string {
  return p.split(/[_\s]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function confidenceColor(score: number): string {
  if (score >= 0.7) return "var(--easy)";
  if (score >= 0.4) return "var(--medium)";
  return "var(--hard)";
}

function confidenceLabel(score: number): string {
  if (score >= 0.7) return "High";
  if (score >= 0.4) return "Medium";
  if (score > 0) return "Low";
  return "None";
}

// ─── Readiness Score ─────────────────────────────────────────────────────────

function computeReadinessScore(stats: ProblemStats): {
  score: number;
  independence: number;
  retention: number;
  consistency: number;
  followThrough: number;
} {
  const total = stats.total || 1;

  // Independence (40pts): % solved without help
  const independence = stats.by_solve_help.no_help / total;
  const independenceScore = Math.round(independence * 40);

  // Retention (30pts): avg confidence
  const retention = stats.avg_confidence; // 0–1
  const retentionScore = Math.round(retention * 30);

  // Consistency (20pts): streak factor (current/longest capped at 1)
  const streakFactor = stats.longest_streak > 0
    ? Math.min(stats.current_streak / Math.max(stats.longest_streak, 7), 1)
    : 0;
  const consistencyScore = Math.round(streakFactor * 20);

  // Follow-through (10pts): revision compliance (% revision not overdue)
  const revisionComplianceScore = stats.needs_revision_count === 0
    ? 10
    : Math.max(0, Math.round(10 - (stats.needs_revision_count / total) * 10));

  const score = independenceScore + retentionScore + consistencyScore + revisionComplianceScore;

  return {
    score: Math.min(score, 100),
    independence: independenceScore,
    retention: retentionScore,
    consistency: consistencyScore,
    followThrough: revisionComplianceScore,
  };
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-mid)",
      borderRadius: "var(--radius-md)",
      padding: "8px 12px",
      fontSize: 12,
      fontFamily: "var(--font-mono)",
      color: "var(--text-primary)",
      boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
    }}>
      {label && <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color ?? "var(--accent)" }}>
          {p.name ? `${p.name}: ` : ""}{p.value}
        </div>
      ))}
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ title, children, action }: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="card" style={{ padding: "20px 24px" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
      }}>
        <span className="text-section-header">{title}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── Readiness Score Ring ─────────────────────────────────────────────────────

function ReadinessRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 75 ? "var(--easy)"
    : score >= 50 ? "var(--accent)"
    : score >= 25 ? "var(--medium)"
    : "var(--hard)";

  const label = score >= 75 ? "Interview Ready"
    : score >= 50 ? "On Track"
    : score >= 25 ? "Building Up"
    : "Just Getting Started";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
      {/* Ring */}
      <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
        <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease, stroke 0.3s" }}
          />
        </svg>
        {/* Score text */}
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <span style={{
            fontSize: 28,
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            color: color,
            lineHeight: 1,
          }}>
            {score}
          </span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>/ 100</span>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: color }}>{label}</span>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
            Based on independence, retention, consistency, and revision follow-through.
          </p>
        </div>
      </div>
    </div>
  );
}

// Score breakdown bar
function ScoreBar({ label, value, max, color }: {
  label: string; value: number; max: number; color: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label}</span>
        <span style={{
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          color: color,
          fontWeight: 600,
        }}>
          {value}/{max}
        </span>
      </div>
      <div style={{
        height: 6,
        background: "var(--border-subtle)",
        borderRadius: "var(--radius-pill)",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${(value / max) * 100}%`,
          background: color,
          borderRadius: "var(--radius-pill)",
          transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AnalyticsClient({ stats }: AnalyticsClientProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30");
  const readiness = useMemo(() => computeReadinessScore(stats), [stats]);

  // ── Solved over time data ──
  const solvedOverTime = useMemo(() => {
    const days = parseInt(timeRange);
    const slice = stats.daily_activity.slice(-days);

    // Group into weeks for cleaner chart
    const grouped: { label: string; count: number }[] = [];
    for (let i = 0; i < slice.length; i += 7) {
      const week = slice.slice(i, i + 7);
      const total = week.reduce((s, d) => s + d.count, 0);
      const label = week[0]?.date
        ? new Date(week[0].date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "";
      grouped.push({ label, count: total });
    }
    return grouped;
  }, [stats.daily_activity, timeRange]);

  // ── Difficulty donut data ──
  const difficultyData = [
    { name: "Easy", value: stats.by_difficulty.easy, color: "var(--easy)" },
    { name: "Medium", value: stats.by_difficulty.medium, color: "var(--medium)" },
    { name: "Hard", value: stats.by_difficulty.hard, color: "var(--hard)" },
  ].filter(d => d.value > 0);

  // ── Solve help donut data ──
  const solveHelpData = [
    { name: "No Help", value: stats.by_solve_help.no_help, color: "var(--easy)" },
    { name: "Used Hints", value: stats.by_solve_help.hints, color: "var(--medium)" },
    { name: "Saw Solution", value: stats.by_solve_help.saw_solution, color: "var(--hard)" },
  ].filter(d => d.value > 0);

  // ── Tag weakness data (sorted worst first) ──
  const tagWeaknessData = useMemo(() => {
    return [...stats.by_tag]
      .filter(t => t.count >= 1)
      .sort((a, b) => a.avg_confidence - b.avg_confidence)
      .slice(0, 10)
      .map(t => ({
        tag: t.tag,
        score: Math.round(t.avg_confidence * 100),
        count: t.count,
        color: confidenceColor(t.avg_confidence),
        label: confidenceLabel(t.avg_confidence),
      }));
  }, [stats.by_tag]);

  // ── Pattern performance ──
  const patternData = useMemo(() => {
    return [...stats.by_pattern]
      .sort((a, b) => a.avg_confidence - b.avg_confidence)
      .map(p => ({
        ...p,
        displayName: formatPattern(p.pattern),
        color: confidenceColor(p.avg_confidence),
        label: confidenceLabel(p.avg_confidence),
        scorePercent: Math.round(p.avg_confidence * 100),
      }));
  }, [stats.by_pattern]);

  const isEmpty = stats.total === 0;

  if (isEmpty) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        gap: 16,
        color: "var(--text-muted)",
        textAlign: "center",
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-mid)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-secondary)" }}>
          No data yet
        </span>
        <span style={{ fontSize: 13 }}>
          Solve some problems and track them via the extension to see your analytics.
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── 1. Interview Readiness Score ── */}
      <Section title="Interview Readiness Score">
        <ReadinessRing score={readiness.score} />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
          marginTop: 24,
          paddingTop: 20,
          borderTop: "1px solid var(--border-subtle)",
        }}>
          <ScoreBar
            label="Independence"
            value={readiness.independence}
            max={40}
            color={readiness.independence >= 28 ? "var(--easy)" : readiness.independence >= 16 ? "var(--medium)" : "var(--hard)"}
          />
          <ScoreBar
            label="Retention"
            value={readiness.retention}
            max={30}
            color={readiness.retention >= 21 ? "var(--easy)" : readiness.retention >= 12 ? "var(--medium)" : "var(--hard)"}
          />
          <ScoreBar
            label="Consistency"
            value={readiness.consistency}
            max={20}
            color={readiness.consistency >= 14 ? "var(--easy)" : readiness.consistency >= 8 ? "var(--medium)" : "var(--hard)"}
          />
          <ScoreBar
            label="Follow-through"
            value={readiness.followThrough}
            max={10}
            color={readiness.followThrough >= 7 ? "var(--easy)" : readiness.followThrough >= 4 ? "var(--medium)" : "var(--hard)"}
          />
        </div>
      </Section>

      {/* ── 2. Two donuts row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Difficulty donut */}
        <Section title="Difficulty Breakdown">
          {difficultyData.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No difficulty data.</p>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {difficultyData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                {difficultyData.map((d) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{d.name}</span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-primary)", fontWeight: 600 }}>
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Solve help donut */}
        <Section title="Independence Rate">
          {solveHelpData.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No help data.</p>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie
                    data={solveHelpData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {solveHelpData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                {solveHelpData.map((d) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{d.name}</span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-primary)", fontWeight: 600 }}>
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      </div>

      {/* ── 3. Solved over time ── */}
      <Section
        title="Solved Over Time"
        action={
          <div style={{ display: "flex", gap: 4 }}>
            {(["30", "60", "90"] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                style={{
                  padding: "3px 10px",
                  borderRadius: "var(--radius-pill)",
                  border: `1px solid ${timeRange === r ? "var(--accent)" : "var(--border-subtle)"}`,
                  background: timeRange === r ? "var(--accent-muted)" : "transparent",
                  color: timeRange === r ? "var(--accent)" : "var(--text-muted)",
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.12s",
                }}
              >
                {r}d
              </button>
            ))}
          </div>
        }
      >
        {solvedOverTime.every(d => d.count === 0) ? (
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No activity in this period.</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={solvedOverTime} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border-subtle)" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="solved"
                stroke="var(--accent)"
                strokeWidth={2}
                fill="url(#accentGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "var(--accent)", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* ── 4. Weak Areas by Tag ── */}
      {tagWeaknessData.length > 0 && (
        <Section title="Weak Areas by Tag">
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 16px" }}>
            Sorted by lowest confidence first — these are your priority study areas.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tagWeaknessData.map((t) => (
              <div key={t.tag}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{t.tag}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.count} problem{t.count !== 1 ? "s" : ""}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: t.color }}>{t.label}</span>
                </div>
                <div style={{
                  height: 6,
                  background: "var(--border-subtle)",
                  borderRadius: "var(--radius-pill)",
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.max(t.score, 4)}%`,
                    background: t.color,
                    borderRadius: "var(--radius-pill)",
                    transition: "width 0.6s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── 5. Pattern Performance ── */}
      {patternData.length > 0 && (
        <Section title="Pattern Performance">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Pattern", "Problems", "Avg Confidence", "Status"].map((h) => (
                    <th key={h} style={{
                      padding: "6px 12px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--text-muted)",
                      borderBottom: "1px solid var(--border-subtle)",
                      whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patternData.map((p, i) => (
                  <tr
                    key={p.pattern}
                    style={{
                      borderBottom: i < patternData.length - 1 ? "1px solid var(--border-subtle)" : "none",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                      {p.displayName}
                    </td>
                    <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>
                      {p.count}
                    </td>
                    <td style={{ padding: "10px 12px", width: 180 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, height: 6, background: "var(--border-subtle)", borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
                          <div style={{
                            height: "100%",
                            width: `${Math.max(p.scorePercent, 4)}%`,
                            background: p.color,
                            borderRadius: "var(--radius-pill)",
                          }} />
                        </div>
                        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: p.color, minWidth: 28 }}>
                          {p.scorePercent}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: p.color,
                        background: `color-mix(in srgb, ${p.color} 12%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${p.color} 25%, transparent)`,
                        borderRadius: "var(--radius-pill)",
                        padding: "2px 8px",
                      }}>
                        {p.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

    </div>
  );
}