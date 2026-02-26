"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { DailyActivity } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SolvedOverTimeProps {
  data: DailyActivity[];
  delay?: number;
}

type Period = "week" | "month" | "year" | "all";

interface PeriodConfig {
  label: string;
  days: number | null;
  groupBy: "day" | "week" | "month";
  xTickFormat: Intl.DateTimeFormatOptions;
  xTickCount: number;
}

const PERIODS: Record<Period, PeriodConfig> = {
  week:  { label: "This Week",  days: 7,    groupBy: "day",   xTickFormat: { weekday: "short" },               xTickCount: 7  },
  month: { label: "This Month", days: 30,   groupBy: "day",   xTickFormat: { month: "short", day: "numeric" }, xTickCount: 6  },
  year:  { label: "This Year",  days: 365,  groupBy: "week",  xTickFormat: { month: "short" },                 xTickCount: 12 },
  all:   { label: "All Time",   days: null, groupBy: "month", xTickFormat: { month: "short", year: "2-digit" }, xTickCount: 8  },
};

interface ChartPoint {
  label: string;
  value: number;
  fullLabel: string;
}

interface PeriodStats {
  total: number;
  avgPerDay: number;
  best: number;
  bestLabel: string;
  activeDays: number;
  delta: number | null;
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

function fmt(dateStr: string, opts: Intl.DateTimeFormatOptions): string {
  try { return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", opts); }
  catch { return ""; }
}

function buildChartData(data: DailyActivity[], config: PeriodConfig): ChartPoint[] {
  const slice = config.days ? data.slice(-config.days) : data;

  if (config.groupBy === "day") {
    return slice.map(d => ({
      label:     fmt(d.date, config.xTickFormat),
      fullLabel: fmt(d.date, { weekday: "short", month: "short", day: "numeric" }),
      value:     d.count,
    }));
  }

  if (config.groupBy === "week") {
    const weeks: ChartPoint[] = [];
    for (let i = 0; i < slice.length; i += 7) {
      const chunk = slice.slice(i, i + 7);
      const total = chunk.reduce((s, d) => s + d.count, 0);
      const start = chunk[0]?.date ?? "";
      const end   = chunk[chunk.length - 1]?.date ?? "";
      weeks.push({
        label:     start ? fmt(start, config.xTickFormat) : "",
        fullLabel: start && end
          ? `${fmt(start, { month: "short", day: "numeric" })} – ${fmt(end, { month: "short", day: "numeric" })}`
          : "",
        value: total,
      });
    }
    return weeks;
  }

  // month
  const map = new Map<string, { sum: number; first: string }>();
  for (const d of slice) {
    const key = d.date.slice(0, 7);
    const ex  = map.get(key) ?? { sum: 0, first: d.date };
    ex.sum += d.count;
    map.set(key, ex);
  }
  return Array.from(map.values()).map(({ sum, first }) => ({
    label:     fmt(first, config.xTickFormat),
    fullLabel: fmt(first, { month: "long", year: "numeric" }),
    value:     sum,
  }));
}

function computeStats(data: DailyActivity[], config: PeriodConfig): PeriodStats {
  const slice    = config.days ? data.slice(-config.days) : data;
  const prev     = config.days ? data.slice(-(config.days * 2), -config.days) : [];
  const total    = slice.reduce((s, d) => s + d.count, 0);
  const days     = slice.length || 1;
  const avgPerDay = total / days;
  const best     = Math.max(...slice.map(d => d.count), 0);
  const bestDay  = slice.find(d => d.count === best);
  const bestLabel = bestDay ? fmt(bestDay.date, { month: "short", day: "numeric" }) : "—";
  const activeDays = slice.filter(d => d.count > 0).length;

  let delta: number | null = null;
  if (prev.length > 0) {
    const prevTotal = prev.reduce((s, d) => s + d.count, 0);
    if (prevTotal > 0) delta = Math.round(((total - prevTotal) / prevTotal) * 100);
    else if (total > 0) delta = 100;
  }

  return { total, avgPerDay, best, bestLabel, activeDays, delta };
}

// ─── Custom tooltip for chart ─────────────────────────────────────────────────

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as ChartPoint;
  if (!d || d.value === 0) return null;
  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-mid)",
      borderRadius: "var(--radius-md)",
      padding: "8px 12px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      pointerEvents: "none",
    }}>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 14,
        fontWeight: 700,
        color: "var(--accent)",
        lineHeight: 1,
      }}>
        {d.value} solved
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
        {d.fullLabel}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SolvedOverTime({ data, delay = 0 }: SolvedOverTimeProps) {
  const [period, setPeriod]       = useState<Period>("week");
  const [dropdownOpen, setDropdown] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [animKey, setAnimKey]     = useState(0); // force recharts re-animation
  const dropRef  = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const config = PERIODS[period];
  const stats  = computeStats(data, config);
  const deltaPos   = (stats.delta ?? 0) >= 0;
  const deltaColor = deltaPos ? "var(--easy)" : "var(--hard)";

  // Init
  useEffect(() => {
    const t = setTimeout(() => {
      setChartData(buildChartData(data, PERIODS["week"]));
    }, delay + 100);
    return () => clearTimeout(t);
  }, []);

  // Period change
  const changePeriod = useCallback((p: Period) => {
    if (p === period) { setDropdown(false); return; }
    setDropdown(false);
    setStatsOpen(false);
    // Reset chart first so animation replays
    setChartData([]);
    setTimeout(() => {
      setPeriod(p);
      setChartData(buildChartData(data, PERIODS[p]));
      setAnimKey(k => k + 1);
    }, 120);
  }, [period, data]);

  // Outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropdown(false);
      if (statsRef.current && !statsRef.current.contains(e.target as Node)) setStatsOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const hasData = chartData.some(d => d.value > 0);

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        @keyframes dropIn {
          from { opacity:0; transform: translateY(-8px) scale(0.96); }
          to   { opacity:1; transform: translateY(0)    scale(1);    }
        }
        @keyframes fadeUp {
          from { opacity:0; transform: translateY(6px); }
          to   { opacity:1; transform: translateY(0);   }
        }
        @keyframes statsPop {
          from { opacity:0; transform: translateY(-6px) scale(0.95); }
          to   { opacity:1; transform: translateY(0)    scale(1);    }
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "",
        marginBottom: 16,
      }}>
        {/* Period dropdown */}
        <div ref={dropRef} style={{ position: "relative" }}>
          <button
            onClick={() => setDropdown(o => !o)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 30,
              padding: "0 12px",
              background: dropdownOpen
                ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                : "var(--bg-elevated)",
              border: `1px solid ${dropdownOpen ? "var(--accent)" : "var(--border-mid)"}`,
              borderRadius: "var(--radius-pill)",
              color: dropdownOpen ? "var(--accent)" : "var(--text-primary)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
              outline: "none",
            }}
          >
            {config.label}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              style={{
                transition: "transform 0.2s ease",
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              gap:"400px",
              left: 0,
              zIndex: 60,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-mid)",
              borderRadius: "var(--radius-md)",
              padding: 5,
              minWidth: 148,
              boxShadow: "0 10px 36px rgba(0,0,0,0.55)",
              animation: "dropIn 0.18s cubic-bezier(0.16,1,0.3,1)",
            }}>
              {(Object.entries(PERIODS) as [Period, PeriodConfig][]).map(([key, cfg], i) => {
                const isActive = period === key;
                return (
                  <button
                    key={key}
                    onClick={() => changePeriod(key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "8px 10px",
                      background: isActive
                        ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                        : "transparent",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      color: isActive ? "var(--accent)" : "var(--text-secondary)",
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.1s, color 0.1s",
                      animation: `fadeUp 0.2s ease ${i * 35}ms both`,
                      outline: "none",
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--bg-hover)"; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    {cfg.label}
                    {isActive && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats button — right side */}
        <div ref={statsRef} style={{ position: "relative", marginLeft:"40px"  }}>
          <button
            onClick={() => setStatsOpen(o => !o)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              height: 30,
              padding: "0 12px",
              background: statsOpen
                ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                : "transparent",
              border: `1px solid ${statsOpen ? "var(--accent)" : "var(--border-subtle)"}`,
              borderRadius: "var(--radius-pill)",
              color: statsOpen ? "var(--accent)" : "var(--text-muted)",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
              outline: "none",
            }}
            onMouseEnter={e => {
              if (!statsOpen) {
                e.currentTarget.style.borderColor = "var(--border-mid)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }
            }}
            onMouseLeave={e => {
              if (!statsOpen) {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.color = "var(--text-muted)";
              }
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6"  y1="20" x2="6"  y2="14" />
            </svg>
            Stats
          </button>

          {/* Floating stats panel — anchored right, opens upward if needed */}
          {statsOpen && (
            <div style={{
              position: "absolute",
              top: "calc(100% - 48px)",
              right: -250,
              zIndex: 60,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-mid)",
              borderRadius: "var(--radius-md)",
              padding: "18px 20px",
              width: 240,
              boxShadow: "0 12px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
              animation: "statsPop 0.2s cubic-bezier(0.16,1,0.3,1)",
            }}>

              {/* Period label */}
              <div style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                marginBottom: 12,
              }}>
                {config.label}
              </div>

              {/* Big number */}
              <div style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                marginBottom: 12,
                animation: "fadeUp 0.22s ease",
              }}>
                <span style={{
                  fontSize: 40,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-primary)",
                  lineHeight: 1,
                }}>
                  {stats.total}
                </span>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>
                    problems solved
                  </div>
                  {stats.delta !== null && (
                    <div style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                      color: deltaColor,
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      marginTop: 2,
                    }}>
                      <svg width="8" height="8" viewBox="0 0 10 10" fill={deltaColor}>
                        {deltaPos
                          ? <polygon points="5,1 9,9 1,9" />
                          : <polygon points="5,9 9,1 1,1" />
                        }
                      </svg>
                      {deltaPos ? "+" : ""}{Math.abs(stats.delta!)}% vs prev
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "var(--border-subtle)", marginBottom: 14 }} />

              {/* 2×2 stat grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 12px" }}>
                {[
                  { label: "Avg / day",    value: stats.avgPerDay.toFixed(1), accent: true,  delay: 60  },
                  { label: "Best day",     value: String(stats.best),          accent: false, delay: 100 },
                  { label: "Active days",  value: String(stats.activeDays),    accent: false, delay: 140 },
                  { label: "Best date",    value: stats.bestLabel,             accent: false, delay: 180 },
                ].map(({ label, value, accent, delay: d }) => (
                  <div key={label} style={{ animation: `fadeUp 0.25s ease ${d}ms both` }}>
                    <div style={{
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                      marginBottom: 4,
                    }}>
                      {label}
                    </div>
                    <div style={{
                      fontSize: 18,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      color: accent ? "var(--accent)" : "var(--text-primary)",
                      lineHeight: 1,
                    }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* ── Area chart ── */}
      {chartData.length === 0 ? (
        <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Loading…</span>
        </div>
      ) : (
        <ResponsiveContainer key={animKey} width="100%" height={160}>
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 4, left: -24, bottom: 0 }}
          >
            <defs>
              <linearGradient id="solvedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="var(--accent)" stopOpacity={0.35} />
                <stop offset="60%"  stopColor="var(--accent)" stopOpacity={0.08} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0}    />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="var(--border-subtle)"
              strokeDasharray="3 3"
              strokeOpacity={0.6}
            />

            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />

            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />

            <Tooltip
              content={<ChartTooltip />}
              cursor={{
                stroke: "var(--accent)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
                strokeOpacity: 0.5,
              }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#solvedGrad)"
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (!payload.value) return <g key={`dot-${cx}`} />;
                return (
                  <circle
                    key={`dot-${cx}`}
                    cx={cx} cy={cy} r={3}
                    fill="var(--accent)"
                    stroke="var(--bg-base)"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{
                r: 5,
                fill: "var(--accent)",
                stroke: "var(--bg-base)",
                strokeWidth: 2,
              }}
              animationDuration={600}
              animationEasing="ease-out"
            />

          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Empty state */}
      {chartData.length > 0 && !hasData && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          marginTop: 48,
        }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
            No activity in this period
          </span>
        </div>
      )}

    </div>
  );
}