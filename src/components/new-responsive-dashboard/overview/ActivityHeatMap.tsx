"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DailyActivity } from "@/types";

interface ActivityHeatmapProps {
  data: DailyActivity[];
  totalThisYear: number;
}

function getLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

const LEVEL_OPACITY = { 0: 0.06, 1: 0.28, 2: 0.48, 3: 0.72, 4: 1.0 };
const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CELL = 13;
const GAP = 3;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// Framer tooltip
function HeatmapTooltip({ count, date }: { count: number; date: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.92 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      style={{
        position: "absolute",
        bottom: "calc(100% + 8px)",
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-mid)",
        borderRadius: "var(--radius-sm)",
        padding: "5px 9px",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        zIndex: 50,
        boxShadow: "0 4px 16px rgba(0,0,0,0.45)",
      }}
    >
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "var(--accent)",
        fontWeight: 600,
      }}>
        {count}
      </span>
      <span style={{
        fontFamily: "var(--font-sans)",
        fontSize: 11,
        color: "var(--text-muted)",
        marginLeft: 4,
      }}>
        solved · {formatDate(date)}
      </span>
      {/* Arrow */}
      <div style={{
        position: "absolute",
        top: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        width: 0,
        height: 0,
        borderLeft: "5px solid transparent",
        borderRight: "5px solid transparent",
        borderTop: "5px solid var(--border-mid)",
      }} />
    </motion.div>
  );
}

export function ActivityHeatmap({ data, totalThisYear }: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number; key: string } | null>(null);

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="card"
        style={{ padding: 24 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            Activity
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            0 problems this year
          </span>
        </div>
        <div className="skeleton" style={{ height: 96, borderRadius: "var(--radius-md)" }} />
      </motion.div>
    );
  }

  // Build weeks
  const weeks: DailyActivity[][] = [];
  let currentWeek: DailyActivity[] = [];
  const firstDay = new Date(data[0].date);
  const startPad = firstDay.getDay();
  for (let i = 0; i < startPad; i++) currentWeek.push({ date: "", count: -1 });
  for (const day of data) {
    currentWeek.push(day);
    if (currentWeek.length === 7) { weeks.push(currentWeek); currentWeek = []; }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push({ date: "", count: -1 });
    weeks.push(currentWeek);
  }

  // Month labels
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    for (const day of week) {
      if (!day.date) continue;
      const m = new Date(day.date).getMonth();
      if (m !== lastMonth) { monthLabels.push({ label: MONTHS[m], weekIndex: wi }); lastMonth = m; }
      break;
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="card"
      style={{ padding: 24 }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{
          fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 600,
          letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)",
        }}>
          Activity
        </span>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>{totalThisYear}</span>
          {" "}problem{totalThisYear !== 1 ? "s" : ""} this year
        </span>
      </div>

      {/* Scrollable heatmap with edge fade */}
      <div style={{ position: "relative" }}>
        {/* Right fade mask */}
        <div style={{
          position: "absolute", top: 0, right: 0, bottom: 0, width: 32, zIndex: 1,
          background: "linear-gradient(to right, transparent, var(--bg-surface))",
          pointerEvents: "none",
        }} />

        <div style={{ overflowX: "auto", paddingBottom: 4 }}>
          <div style={{ display: "inline-flex", flexDirection: "column" }}>

            {/* Month labels */}
            <div style={{ display: "flex", marginLeft: 28, marginBottom: 5, gap: GAP }}>
              {weeks.map((_, wi) => {
                const label = monthLabels.find(m => m.weekIndex === wi);
                return (
                  <div key={wi} style={{ width: CELL, fontSize: 9, color: "var(--text-muted)", flexShrink: 0, fontFamily: "var(--font-mono)" }}>
                    {label?.label ?? ""}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 0 }}>
              {/* Day labels */}
              <div style={{ display: "flex", flexDirection: "column", gap: GAP, marginRight: 6, paddingTop: 1 }}>
                {DAYS.map((d, i) => (
                  <div key={i} style={{ height: CELL, fontSize: 9, color: "var(--text-muted)", lineHeight: `${CELL}px`, textAlign: "right", width: 22, fontFamily: "var(--font-mono)" }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Weeks — wave entrance */}
              <div style={{ display: "flex", gap: GAP }}>
                {weeks.map((week, wi) => (
                  <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                    {week.map((day, di) => {
                      if (day.count === -1) return <div key={di} style={{ width: CELL, height: CELL }} />;

                      const level = getLevel(day.count);
                      const opacity = LEVEL_OPACITY[level];
                      const key = `${wi}-${di}`;
                      const isHovered = hoveredDay?.key === key;

                      return (
                        <div key={di} style={{ position: "relative" }}>
                          <AnimatePresence>
                            {isHovered && day.date && day.count > 0 && (
                              <HeatmapTooltip count={day.count} date={day.date} />
                            )}
                          </AnimatePresence>

                          <motion.div
                            initial={{ opacity: 0, scale: 0.4 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              duration: 0.25,
                              delay: wi * 0.008 + di * 0.002,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            whileHover={day.count > 0 ? { scale: 1.35, zIndex: 10 } : {}}
                            onHoverStart={() => day.count > 0 && day.date && setHoveredDay({ date: day.date, count: day.count, key })}
                            onHoverEnd={() => setHoveredDay(null)}
                            style={{
                              width: CELL,
                              height: CELL,
                              borderRadius: 3,
                              background: `rgba(0, 212, 170, ${opacity})`,
                              border: day.count > 0
                                ? "1px solid rgba(0, 212, 170, 0.3)"
                                : "1px solid var(--border-subtle)",
                              cursor: day.count > 0 ? "pointer" : "default",
                              flexShrink: 0,
                              position: "relative",
                              zIndex: isHovered ? 10 : 1,
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 10, justifyContent: "flex-end" }}>
              <span style={{ fontSize: 9, color: "var(--text-muted)", marginRight: 3, fontFamily: "var(--font-mono)" }}>Less</span>
              {([0, 1, 2, 3, 4] as const).map((level, i) => (
                <motion.div
                  key={level}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.2 }}
                  style={{
                    width: CELL, height: CELL, borderRadius: 3,
                    background: `rgba(0, 212, 170, ${LEVEL_OPACITY[level]})`,
                    border: level === 0 ? "1px solid var(--border-subtle)" : "1px solid rgba(0,212,170,0.3)",
                  }}
                />
              ))}
              <span style={{ fontSize: 9, color: "var(--text-muted)", marginLeft: 3, fontFamily: "var(--font-mono)" }}>More</span>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}