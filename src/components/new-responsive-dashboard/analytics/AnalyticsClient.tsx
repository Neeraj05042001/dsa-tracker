"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { Problem } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  problems: Problem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DSA_PATTERNS = [
  "arrays",
  "strings",
  "hash_map",
  "two_pointers",
  "sliding_window",
  "binary_search",
  "stack",
  "linked_list",
  "trees",
  "graphs",
  "dynamic_programming",
  "backtracking",
  "greedy",
  "heap",
  "trie",
  "intervals",
];

const PATTERN_LABELS: Record<string, string> = {
  arrays: "Arrays",
  strings: "Strings",
  hash_map: "Hash Map",
  two_pointers: "Two Pointers",
  sliding_window: "Sliding Window",
  binary_search: "Binary Search",
  stack: "Stack / Queue",
  linked_list: "Linked List",
  trees: "Trees",
  graphs: "Graphs",
  dynamic_programming: "Dynamic Programming",
  backtracking: "Backtracking",
  greedy: "Greedy",
  heap: "Heap / PQ",
  trie: "Trie",
  intervals: "Intervals",
};

const DIFF_COLORS = {
  easy: "var(--easy)",
  medium: "var(--medium)",
  hard: "var(--hard)",
};

const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.07,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function effectiveDiff(p: Problem): "easy" | "medium" | "hard" | null {
  const d = (p.difficulty ?? p.user_difficulty ?? "").toLowerCase();
  if (d === "easy") return "easy";
  if (d === "medium") return "medium";
  if (d === "hard") return "hard";
  return null;
}

function weekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday
  return d.toISOString().split("T")[0];
}

function monthAbbr(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ─── Readiness Score Gauge ────────────────────────────────────────────────────

function ReadinessGauge({
  score,
  signals,
}: {
  score: number;
  signals: { label: string; value: number; color: string }[];
}) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ * 0.75; // 270deg arc
  const scoreColor =
    score >= 75 ? "var(--easy)" : score >= 50 ? "var(--medium)" : "var(--hard)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Gauge */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div
          style={{
            position: "relative",
            width: 140,
            height: 140,
            flexShrink: 0,
          }}
        >
          <svg
            width="140"
            height="140"
            viewBox="0 0 140 140"
            style={{ transform: "rotate(-225deg)" }}
          >
            {/* Track */}
            <circle
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke="var(--border-mid)"
              strokeWidth="10"
              strokeDasharray={`${circ * 0.75} ${circ}`}
              strokeLinecap="round"
            />
            {/* Fill */}
            <motion.circle
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={scoreColor}
              strokeWidth="10"
              strokeDasharray={`${filled} ${circ}`}
              strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${circ}` }}
              animate={{ strokeDasharray: `${filled} ${circ}` }}
              transition={{
                duration: 1.2,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ filter: `drop-shadow(0 0 6px ${scoreColor})` }}
            />
          </svg>
          {/* Number in center */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 10,
            }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.6,
                type: "spring",
                stiffness: 200,
              }}
              style={{
                fontSize: 32,
                fontWeight: 800,
                fontFamily: "var(--font-mono)",
                color: scoreColor,
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              {score}
            </motion.span>
            <span
              style={{
                fontSize: 10,
                color: "var(--text-muted)",
                fontWeight: 600,
                letterSpacing: "0.06em",
                marginTop: 2,
              }}
            >
              / 100
            </span>
          </div>
        </div>

        {/* Label */}
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 4,
              letterSpacing: "-0.01em",
            }}
          >
            {score >= 80
              ? "Interview Ready"
              : score >= 60
                ? "On Track"
                : score >= 40
                  ? "Needs Work"
                  : "Just Starting"}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              lineHeight: 1.6,
            }}
          >
            Composite score across
            <br />
            consistency, difficulty & recall
          </div>
        </div>
      </div>

      {/* Signal breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {signals.map((s, i) => (
          <div key={s.label}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                }}
              >
                {s.label}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: s.color,
                  fontWeight: 700,
                }}
              >
                {s.value}%
              </span>
            </div>
            <div
              style={{
                height: 4,
                background: "var(--border-mid)",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.value}%` }}
                transition={{
                  duration: 0.8,
                  delay: 0.4 + i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  height: "100%",
                  background: s.color,
                  borderRadius: 2,
                  boxShadow: `0 0 6px ${s.color}`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name?: string; color?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-mid)",
        borderRadius: "var(--radius-md)",
        padding: "8px 12px",
        fontSize: 11,
        fontFamily: "var(--font-mono)",
      }}
    >
      {label && (
        <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>
          {label}
        </div>
      )}
      {payload.map((p, i) => (
        <div
          key={i}
          style={{ color: p.color ?? "var(--accent)", fontWeight: 700 }}
        >
          {p.name ? `${p.name}: ` : ""}
          {p.value}
        </div>
      ))}
    </div>
  );
}

// ─── Pattern Coverage ─────────────────────────────────────────────────────────

function PatternCoverage({
  patternCounts,
  totalProblems,
}: {
  patternCounts: Record<string, number>;
  totalProblems: number;
}) {
  const max = Math.max(...Object.values(patternCounts), 1);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: 8,
      }}
    >
      {DSA_PATTERNS.map((p, i) => {
        const count = patternCounts[p] ?? 0;
        const pct = count / max;
        const isMastered = count >= 3;
        const isTouched = count > 0;

        return (
          <motion.div
            key={p}
            custom={i}
            variants={FADE_UP}
            initial="hidden"
            animate="visible"
            style={{
              background: isTouched
                ? `color-mix(in srgb, var(--accent) ${Math.round(pct * 12 + 4)}%, var(--bg-elevated))`
                : "var(--bg-elevated)",
              border: `1px solid ${
                isMastered
                  ? "color-mix(in srgb, var(--accent) 35%, transparent)"
                  : isTouched
                    ? "color-mix(in srgb, var(--accent) 18%, transparent)"
                    : "var(--border-subtle)"
              }`,
              borderRadius: "var(--radius-md)",
              padding: "10px 12px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Fill bar */}
            {isTouched && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct * 100}%` }}
                transition={{
                  duration: 0.7,
                  delay: 0.3 + i * 0.03,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  height: 2,
                  background: isMastered
                    ? "var(--accent)"
                    : "color-mix(in srgb, var(--accent) 55%, transparent)",
                }}
              />
            )}

            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: isTouched ? "var(--text-primary)" : "var(--text-muted)",
                marginBottom: 6,
                lineHeight: 1.3,
              }}
            >
              {PATTERN_LABELS[p]}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                  color: isMastered
                    ? "var(--accent)"
                    : isTouched
                      ? "var(--text-secondary)"
                      : "var(--text-muted)",
                  lineHeight: 1,
                }}
              >
                {count}
              </span>
              {isMastered && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {!isTouched && (
                <span
                  style={{
                    fontSize: 9,
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                  }}
                >
                  UNTOUCHED
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AnalyticsClient({ problems }: Props) {
  const stats = useMemo(() => {
    const total = problems.length;
    if (total === 0) return null;

    // ── Difficulty counts ──
    const diffCounts = { easy: 0, medium: 0, hard: 0, unknown: 0 };
    for (const p of problems) {
      const d = effectiveDiff(p);
      if (d) diffCounts[d]++;
      else diffCounts.unknown++;
    }

    // ── Platform counts ──
    const lcCount = problems.filter((p) => p.platform === "leetcode").length;
    const cfCount = problems.filter((p) => p.platform === "codeforces").length;

    // ── Pattern counts ──
    const patternCounts: Record<string, number> = {};
    for (const p of problems) {
      if (p.pattern) {
        const k = p.pattern.toLowerCase().replace(/[\s\/]/g, "_");
        patternCounts[k] = (patternCounts[k] ?? 0) + 1;
      }
      // also count from tags
      for (const tag of p.tags ?? []) {
        const k = tag.toLowerCase().replace(/[\s\/]/g, "_");
        patternCounts[k] = (patternCounts[k] ?? 0) + 1;
      }
    }

    // ── Weekly solve trend (last 12 weeks) ──
    const now = new Date();
    const twelveWeeksAgo = new Date(now);
    twelveWeeksAgo.setDate(now.getDate() - 84);

    const weeklyMap: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - (11 - i) * 7);
      weeklyMap[weekKey(d)] = 0;
    }

    for (const p of problems) {
      if (!p.created_at) continue;
      const d = new Date(p.created_at);
      if (d < twelveWeeksAgo) continue;
      const k = weekKey(d);
      if (k in weeklyMap) weeklyMap[k] = (weeklyMap[k] ?? 0) + 1;
    }

    const weeklyData = Object.entries(weeklyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, label: monthAbbr(date), count }));

    // ── Difficulty per week (stacked) ──
    const weeklyDiffMap: Record<
      string,
      { easy: number; medium: number; hard: number }
    > = {};
    for (const wk of weeklyData)
      weeklyDiffMap[wk.date] = { easy: 0, medium: 0, hard: 0 };

    for (const p of problems) {
      if (!p.created_at) continue;
      const d = new Date(p.created_at);
      if (d < twelveWeeksAgo) continue;
      const k = weekKey(d);
      const diff = effectiveDiff(p);
      if (k in weeklyDiffMap && diff && diff !== ("unknown" as never)) {
        weeklyDiffMap[k][diff]++;
      }
    }

    const weeklyDiffData = weeklyData.map((w) => ({
      label: w.label,
      ...weeklyDiffMap[w.date],
    }));

    // ── Readiness signals ──
    // 1. Consistency: distinct days with a solve in last 14 days
    const fourteenAgo = new Date(now);
    fourteenAgo.setDate(now.getDate() - 14);
    const activeDays = new Set(
      problems
        .filter((p) => p.created_at && new Date(p.created_at) >= fourteenAgo)
        .map((p) => new Date(p.created_at!).toISOString().split("T")[0]),
    ).size;
    const consistency = Math.round((activeDays / 14) * 100);

    // 2. Difficulty spread: % medium + hard
    const diffSpread =
      total > 0
        ? Math.round(((diffCounts.medium + diffCounts.hard) / total) * 100)
        : 0;

    // 3. Avg confidence
    const withConf = problems.filter((p) => p.confidence != null);
    const avgConf =
      withConf.length > 0
        ? withConf.reduce((s, p) => s + Number(p.confidence ?? 0), 0) /
          withConf.length
        : 0;
    const avgConfPct = Math.round((avgConf / 5) * 100);

    // 4. Revision discipline: problems with reps > 0 that aren't overdue by >3d
    const reviewed = problems.filter((p) => (p.sm2_repetitions ?? 0) > 0);
    const onTime = reviewed.filter((p) => {
      if (!p.sm2_next_review) return true;
      const overdue =
        (Date.now() - new Date(p.sm2_next_review).getTime()) / 86400000;
      return overdue <= 3;
    });
    const revDiscipline =
      reviewed.length > 0
        ? Math.round((onTime.length / reviewed.length) * 100)
        : 50;

    const readiness = Math.round(
      consistency * 0.25 +
        diffSpread * 0.25 +
        avgConfPct * 0.25 +
        revDiscipline * 0.25,
    );

    const signals = [
      {
        label: "Consistency (last 14d)",
        value: consistency,
        color: "var(--accent)",
      },
      { label: "Difficulty Spread", value: diffSpread, color: "var(--medium)" },
      { label: "Avg Confidence", value: avgConfPct, color: "var(--easy)" },
      {
        label: "Revision Discipline",
        value: revDiscipline,
        color: "var(--lc-color)",
      },
    ];

    // ── Focus recommendation ──
    const touchedPatterns = DSA_PATTERNS.filter(
      (p) => (patternCounts[p] ?? 0) > 0,
    );
    const untouched = DSA_PATTERNS.filter((p) => (patternCounts[p] ?? 0) === 0);
    const weakest = touchedPatterns.sort(
      (a, b) => (patternCounts[a] ?? 0) - (patternCounts[b] ?? 0),
    )[0];

    // ── Platform donut data ──
    const platformData = [
      { name: "LeetCode", value: lcCount, color: "var(--lc-color)" },
      { name: "Codeforces", value: cfCount, color: "var(--cf-color)" },
    ].filter((d) => d.value > 0);

    // ── Difficulty donut ──
    const diffData = [
      { name: "Easy", value: diffCounts.easy, color: "var(--easy)" },
      { name: "Medium", value: diffCounts.medium, color: "var(--medium)" },
      { name: "Hard", value: diffCounts.hard, color: "var(--hard)" },
    ].filter((d) => d.value > 0);

    return {
      total,
      diffCounts,
      lcCount,
      cfCount,
      patternCounts,
      weeklyData,
      weeklyDiffData,
      readiness,
      signals,
      weakestPattern: weakest,
      untouchedCount: untouched.length,
      platformData,
      diffData,
      avgConf: parseFloat(avgConf.toFixed(1)),
      activeDays,
    };
  }, [problems]);

  if (!stats || stats.total === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          gap: 12,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40 }}>📊</div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          No data yet
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Solve some problems to see analytics
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── Row 1: Readiness + mini stats ── */}
      <motion.div
        custom={0}
        variants={FADE_UP}
        initial="hidden"
        animate="visible"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 16,
        }}
      >
        {/* Readiness Score — spans 2 cols */}
        <div
          className="card"
          style={{ gridColumn: "span 2", padding: "24px 28px" }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--text-muted)",
              marginBottom: 20,
            }}
          >
            Readiness Score
          </div>
          <ReadinessGauge score={stats.readiness} signals={stats.signals} />
        </div>

        {/* Mini stat: Total */}
        <MiniStat
          label="Total Solved"
          value={stats.total}
          color="var(--accent)"
          icon="⚡"
          delay={0.1}
        />

        {/* Mini stat: Active days */}
        <MiniStat
          label="Active (14d)"
          value={stats.activeDays}
          suffix=" days"
          color="var(--easy)"
          icon="🔥"
          delay={0.15}
        />

        {/* Mini stat: LC */}
        <MiniStat
          label="LeetCode"
          value={stats.lcCount}
          color="var(--lc-color)"
          icon="LC"
          mono
          delay={0.2}
        />

        {/* Mini stat: CF */}
        <MiniStat
          label="Codeforces"
          value={stats.cfCount}
          color="var(--cf-color)"
          icon="CF"
          mono
          delay={0.25}
        />
      </motion.div>

      {/* ── Row 2: Solve trend + Difficulty donut ── */}
      <motion.div
        custom={1}
        variants={FADE_UP}
        initial="hidden"
        animate="visible"
        style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}
      >
        {/* Stacked bar: difficulty per week */}
        <div className="card" style={{ padding: "20px 24px" }}>
          <SectionHeader
            label="Solves by Week"
            sublabel="last 12 weeks, by difficulty"
          />
          <div style={{ height: 180, marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyDiffData} barSize={14} barGap={2}>
                <XAxis
                  dataKey="label"
                  tick={{
                    fontSize: 9,
                    fill: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide allowDecimals={false} />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar
                  dataKey="easy"
                  stackId="a"
                  fill="var(--easy)"
                  radius={[0, 0, 0, 0]}
                  name="Easy"
                />
                <Bar
                  dataKey="medium"
                  stackId="a"
                  fill="var(--medium)"
                  radius={[0, 0, 0, 0]}
                  name="Medium"
                />
                <Bar
                  dataKey="hard"
                  stackId="a"
                  fill="var(--hard)"
                  radius={[2, 2, 0, 0]}
                  name="Hard"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Difficulty + Platform donuts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <DonutCard
            label="Difficulty Split"
            data={stats.diffData}
            total={
              stats.diffCounts.easy +
              stats.diffCounts.medium +
              stats.diffCounts.hard
            }
          />
          <DonutCard
            label="Platform Split"
            data={stats.platformData}
            total={stats.lcCount + stats.cfCount}
          />
        </div>
      </motion.div>

      {/* ── Row 3: Solve rate trend ── */}
      <motion.div
        custom={2}
        variants={FADE_UP}
        initial="hidden"
        animate="visible"
        className="card"
        style={{ padding: "20px 24px" }}
      >
        <SectionHeader
          label="Solve Velocity"
          sublabel="cumulative solves per week"
        />
        <div style={{ height: 160, marginTop: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.weeklyData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--accent)"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--accent)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{
                  fontSize: 9,
                  fill: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide allowDecimals={false} />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "var(--border-mid)", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="Solves"
                stroke="var(--accent)"
                strokeWidth={2}
                fill="url(#areaGrad)"
                dot={{ fill: "var(--accent)", r: 3, strokeWidth: 0 }}
                activeDot={{ fill: "var(--accent)", r: 5, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Row 4: Pattern Coverage ── */}
      <motion.div
        custom={3}
        variants={FADE_UP}
        initial="hidden"
        animate="visible"
        className="card"
        style={{ padding: "20px 24px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <SectionHeader
            label="Pattern Coverage"
            sublabel={`${DSA_PATTERNS.length - stats.untouchedCount} / ${DSA_PATTERNS.length} patterns touched`}
          />
          {stats.weakestPattern && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                background:
                  "color-mix(in srgb, var(--medium) 10%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--medium) 25%, transparent)",
                borderRadius: "var(--radius-pill)",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 11 }}>⚠️</span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--medium)",
                  fontWeight: 600,
                }}
              >
                Focus: {PATTERN_LABELS[stats.weakestPattern]}
              </span>
            </div>
          )}
        </div>
        <PatternCoverage
          patternCounts={stats.patternCounts}
          totalProblems={stats.total}
        />
      </motion.div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  label,
  sublabel,
}: {
  label: string;
  sublabel?: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text-muted)",
        }}
      >
        {label}
      </div>
      {sublabel && (
        <div
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            marginTop: 2,
            fontFamily: "var(--font-mono)",
          }}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
  icon,
  suffix = "",
  mono = false,
  delay = 0,
}: {
  label: string;
  value: number;
  color: string;
  icon: string;
  suffix?: string;
  mono?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      className="card"
      custom={delay}
      variants={FADE_UP}
      initial="hidden"
      animate="visible"
      style={{
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: mono ? 10 : 14,
            fontFamily: mono ? "var(--font-mono)" : undefined,
            fontWeight: 700,
            color,
            background: `color-mix(in srgb, ${color} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color} 22%, transparent)`,
            borderRadius: "var(--radius-sm)",
            padding: mono ? "3px 7px" : "4px 8px",
          }}
        >
          {icon}
        </span>
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 800,
          fontFamily: "var(--font-mono)",
          color,
          lineHeight: 1,
          letterSpacing: "-0.03em",
        }}
      >
        {value}
        <span
          style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}
        >
          {suffix}
        </span>
      </div>
    </motion.div>
  );
}

function DonutCard({
  label,
  data,
  total,
}: {
  label: string;
  data: { name: string; value: number; color: string }[];
  total: number;
}) {
  return (
    <div className="card" style={{ padding: "16px 18px", flex: 1 }}>
      <SectionHeader label={label} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 12,
        }}
      >
        <div style={{ width: 72, height: 72, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={22}
                outerRadius={34}
                dataKey="value"
                strokeWidth={2}
                stroke="var(--bg-surface)"
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}
        >
          {data.map((d) => (
            <div
              key={d.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: d.color,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                  {d.name}
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  color: d.color,
                }}
              >
                {total > 0 ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
