"use client";

import { DailyActivity } from "@/types";

interface ActivityHeatmapProps {
  data: DailyActivity[];
  totalThisYear: number;
}

// Returns opacity level 0–4 based on count
function getLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

const LEVEL_OPACITY = {
  0: 0.06,
  1: 0.25,
  2: 0.45,
  3: 0.70,
  4: 1.00,
};

const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ActivityHeatmap({ data, totalThisYear }: ActivityHeatmapProps) {
  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span className="text-section-header">Activity</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            0 problems this year
          </span>
        </div>
        <div className="skeleton" style={{ height: 96 }} />
      </div>
    );
  }

  // Build weeks: group 365 days into columns of 7
  const weeks: DailyActivity[][] = [];
  let currentWeek: DailyActivity[] = [];

  // Pad beginning so first day aligns to correct weekday
  const firstDay = new Date(data[0].date);
  const startPad = firstDay.getDay(); // 0=Sun
  for (let i = 0; i < startPad; i++) {
    currentWeek.push({ date: "", count: -1 }); // -1 = padding cell
  }

  for (const day of data) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push({ date: "", count: -1 });
    weeks.push(currentWeek);
  }

  // Month labels: find first week of each month
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    for (const day of week) {
      if (!day.date) continue;
      const m = new Date(day.date).getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ label: MONTHS[m], weekIndex: wi });
        lastMonth = m;
      }
      break;
    }
  });

  const CELL = 13;
  const GAP = 3;

  return (
    <div className="card" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span className="text-section-header">Activity</span>
        <span style={{
          fontSize: 12,
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
        }}>
          {totalThisYear} problem{totalThisYear !== 1 ? "s" : ""} this year
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "inline-flex", flexDirection: "column", gap: 0 }}>

          {/* Month labels */}
          <div style={{ display: "flex", marginLeft: 24, marginBottom: 4, gap: GAP }}>
            {weeks.map((_, wi) => {
              const label = monthLabels.find(m => m.weekIndex === wi);
              return (
                <div key={wi} style={{ width: CELL, fontSize: 9, color: "var(--text-muted)", flexShrink: 0 }}>
                  {label?.label ?? ""}
                </div>
              );
            })}
          </div>

          {/* Grid */}
          <div style={{ display: "flex", gap: 0 }}>
            {/* Day labels */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: GAP,
              marginRight: 6,
              paddingTop: 1,
            }}>
              {DAYS.map((d, i) => (
                <div key={i} style={{
                  height: CELL,
                  fontSize: 9,
                  color: "var(--text-muted)",
                  lineHeight: `${CELL}px`,
                  textAlign: "right",
                  width: 18,
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div style={{ display: "flex", gap: GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                  {week.map((day, di) => {
                    if (day.count === -1) {
                      return <div key={di} style={{ width: CELL, height: CELL }} />;
                    }
                    const level = getLevel(day.count);
                    const opacity = LEVEL_OPACITY[level];
                    return (
                      <div
                        key={di}
                        className="tooltip"
                        data-tip={day.date ? `${day.count} solved · ${formatDate(day.date)}` : ""}
                        style={{
                          width: CELL,
                          height: CELL,
                          borderRadius: 3,
                          background: `rgba(0, 212, 170, ${opacity})`,
                          border: day.count > 0
                            ? "1px solid rgba(0, 212, 170, 0.3)"
                            : "1px solid var(--border-subtle)",
                          cursor: day.count > 0 ? "pointer" : "default",
                          transition: "transform 80ms, opacity 80ms",
                          flexShrink: 0,
                        }}
                        onMouseEnter={e => {
                          if (day.count > 0) {
                            (e.currentTarget as HTMLDivElement).style.transform = "scale(1.3)";
                          }
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 10,
            justifyContent: "flex-end",
          }}>
            <span style={{ fontSize: 10, color: "var(--text-muted)", marginRight: 4 }}>Less</span>
            {([0, 1, 2, 3, 4] as const).map(level => (
              <div key={level} style={{
                width: CELL,
                height: CELL,
                borderRadius: 3,
                background: `rgba(0, 212, 170, ${LEVEL_OPACITY[level]})`,
                border: level === 0 ? "1px solid var(--border-subtle)" : "1px solid rgba(0,212,170,0.3)",
              }} />
            ))}
            <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 4 }}>More</span>
          </div>

        </div>
      </div>
    </div>
  );
}