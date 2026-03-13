"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";


// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface DayActivity {
  date: string; // ISO date — "2025-03-08"
  count: number; // total submissions that day
  easy?: number;
  medium?: number;
  hard?: number;
}

interface ActivityPulseProps {
  data: DayActivity[]; // full history; component slices last N days
  days?: number; // default 60
  totalSubmissions?: number; // override label if precomputed
  groupName?: string; // shown in tooltip context
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDayOfWeek(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short" });
}

// Returns a mixed color string based on difficulty ratio
// Pure easy → #22c55e, Pure hard → #f87171, mixed → interpolated via teal
function difficultyColor(easy = 0, medium = 0, hard = 0, count = 1): string {
  if (count === 0) return "var(--bg-elevated)";
  const total = easy + medium + hard || count;
  const eRatio = easy / total;
  const mRatio = medium / total;
  const hRatio = hard / total;

  // Dominant difficulty
  if (hRatio > 0.5) return "#f87171";
  if (hRatio > 0.25) return "#f59e0b";
  if (mRatio > 0.5) return "#f59e0b";
  if (eRatio > 0.7) return "#22c55e";
  return "#00d4aa"; // mixed / teal default
}

function computeStreak(days: DayActivity[]): {
  current: number;
  longest: number;
  bestDay: DayActivity | null;
} {
  let current = 0;
  let longest = 0;
  let run = 0;
  let bestDay: DayActivity | null = null;

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const today = new Date().toISOString().slice(0, 10);

  for (let i = sorted.length - 1; i >= 0; i--) {
    const d = sorted[i];
    if (!bestDay || d.count > bestDay.count) bestDay = d;

    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - (sorted.length - 1 - i));
    const expected = expectedDate.toISOString().slice(0, 10);

    if (d.count > 0 && d.date === expected) {
      run++;
      if (
        i === sorted.length - 1 ||
        sorted[i + 1].date ===
          new Date(new Date(d.date).getTime() + 86400000)
            .toISOString()
            .slice(0, 10)
      ) {
        current = run;
      }
    } else {
      run = 0;
    }
    if (run > longest) longest = run;
  }

  // simpler current streak: count backwards from today
  let cs = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].count > 0) cs++;
    else break;
  }

  return { current: cs, longest: Math.max(longest, cs), bestDay };
}

// ─────────────────────────────────────────────────────────────────────────────
// TOOLTIP
// ─────────────────────────────────────────────────────────────────────────────

interface TooltipData {
  day: DayActivity;
  x: number;
  barWidth: number;
  containerWidth: number;
}

function PulseTooltip({ data }: { data: TooltipData }) {
  const { day, x, barWidth, containerWidth } = data;
  const color = difficultyColor(day.easy, day.medium, day.hard, day.count);
  const total = (day.easy ?? 0) + (day.medium ?? 0) + (day.hard ?? 0);
  const hasBreakdown = total > 0;

  // Flip tooltip if near right edge
  const tipWidth = 180;
  const flip = x + barWidth / 2 + tipWidth / 2 > containerWidth - 16;
  const left = flip
    ? x + barWidth / 2 - tipWidth + 8
    : x + barWidth / 2 - tipWidth / 2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 4 }}
      transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "absolute",
        bottom: "calc(100% + 10px)",
        left: Math.max(8, left),
        width: tipWidth,
        background: "var(--bg-overlay, #1f1f23)",
        border: `1px solid ${day.count > 0 ? `color-mix(in srgb, ${color} 30%, var(--border-default, rgba(255,255,255,0.11)))` : "var(--border-subtle, rgba(255,255,255,0.07))"}`,
        borderRadius: 10,
        padding: "10px 12px",
        pointerEvents: "none",
        zIndex: 50,
        boxShadow: `0 16px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)`,
      }}
    >
      {/* Tiny arrow */}
      <div
        style={{
          position: "absolute",
          bottom: -5,
          left: flip ? tipWidth - 24 : tipWidth / 2 - 4,
          width: 8,
          height: 8,
          background: "var(--bg-overlay, #1f1f23)",
          border: `1px solid ${day.count > 0 ? `color-mix(in srgb, ${color} 30%, var(--border-default))` : "var(--border-subtle)"}`,
          borderTop: "none",
          borderLeft: "none",
          transform: "rotate(45deg)",
        }}
      />

      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "var(--text-muted)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {getDayOfWeek(day.date)} · {formatShortDate(day.date)}
      </div>

      {day.count === 0 ? (
        <div
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            fontStyle: "italic",
          }}
        >
          No submissions
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 4,
              marginBottom: hasBreakdown ? 8 : 0,
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "var(--font-mono, monospace)",
                color,
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              {day.count}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono, monospace)",
              }}
            >
              submission{day.count !== 1 ? "s" : ""}
            </span>
          </div>

          {hasBreakdown && (
            <div style={{ display: "flex", gap: 8 }}>
              {day.easy ? (
                <span
                  style={{
                    fontSize: 10.5,
                    fontFamily: "var(--font-mono, monospace)",
                    color: "#22c55e",
                    background: "rgba(34,197,94,0.1)",
                    border: "1px solid rgba(34,197,94,0.2)",
                    borderRadius: 4,
                    padding: "2px 6px",
                  }}
                >
                  {day.easy}E
                </span>
              ) : null}
              {day.medium ? (
                <span
                  style={{
                    fontSize: 10.5,
                    fontFamily: "var(--font-mono, monospace)",
                    color: "#f59e0b",
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    borderRadius: 4,
                    padding: "2px 6px",
                  }}
                >
                  {day.medium}M
                </span>
              ) : null}
              {day.hard ? (
                <span
                  style={{
                    fontSize: 10.5,
                    fontFamily: "var(--font-mono, monospace)",
                    color: "#f87171",
                    background: "rgba(248,113,113,0.1)",
                    border: "1px solid rgba(248,113,113,0.2)",
                    borderRadius: 4,
                    padding: "2px 6px",
                  }}
                >
                  {day.hard}H
                </span>
              ) : null}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CHIP — compact footer stat
// ─────────────────────────────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  color?: string;
  icon?: React.ReactNode;
}) {
  const c = color ?? "var(--text-secondary)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      {icon && (
        <span
          style={{ color: c, opacity: 0.7, display: "flex", flexShrink: 0 }}
        >
          {icon}
        </span>
      )}
      <span
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 12,
          fontWeight: 700,
          color: c,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: 10.5,
          color: "var(--text-muted)",
          fontWeight: 500,
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY PULSE BAR — main export
// ─────────────────────────────────────────────────────────────────────────────

export function ActivityPulseBar({
  data,
  days = 60,
  totalSubmissions,
  groupName,
}: ActivityPulseProps) {
  const shouldReduce = useReducedMotion() ?? false;
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Slice to last N days, pad with empty days if needed
  const today = new Date();
  const sliced: DayActivity[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const found = data.find((x) => x.date === iso);
    sliced.push(found ?? { date: iso, count: 0 });
  }

  const maxCount = Math.max(...sliced.map((d) => d.count), 1);
  const activeDays = sliced.filter((d) => d.count > 0).length;
  const totalSubs = totalSubmissions ?? sliced.reduce((s, d) => s + d.count, 0);
  const {
    current: currentStreak,
    longest: longestStreak,
    bestDay,
  } = computeStreak(sliced);

  // Month label positions
  const monthLabels: { label: string; idx: number }[] = [];
  sliced.forEach((d, i) => {
    if (new Date(d.date).getDate() === 1 || i === 0) {
      monthLabels.push({
        label: new Date(d.date).toLocaleDateString("en-US", { month: "short" }),
        idx: i,
      });
    }
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(containerRef.current);
    setContainerWidth(containerRef.current.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const handleBarHover = useCallback(
    (day: DayActivity, idx: number, barEl: HTMLElement) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const barRect = barEl.getBoundingClientRect();
      setTooltip({
        day,
        x: barRect.left - containerRect.left,
        barWidth: barRect.width,
        containerWidth: containerRect.width,
      });
      setHoveredIdx(idx);
    },
    [],
  );

  const handleBarLeave = useCallback(() => {
    setTooltip(null);
    setHoveredIdx(null);
  }, []);

  // Gap between bars (1px)
  const BAR_GAP = 1.5;
  const barWidth =
    containerWidth > 0
      ? Math.max(3, (containerWidth - BAR_GAP * (days - 1)) / days)
      : 0;

  return (
    <>
      
      <motion.div
        initial={shouldReduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "var(--bg-surface, #111113)",
          border: "1px solid var(--border-subtle, rgba(255,255,255,0.07))",
          borderRadius: 14,
          padding: "16px 18px 14px",
          position: "relative",
          // overflow: "hidden",
        }}
      >
        {/* Ambient glow — top right */}
        <motion.div
          animate={{ opacity: hoveredIdx !== null ? 0.1 : 0.05 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "absolute",
            top: -32,
            right: -32,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "#00d4aa",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        {/* Bottom progress strip — accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "linear-gradient(90deg, #00d4aa, transparent)",
            transformOrigin: "left",
            opacity: 0.4,
            pointerEvents: "none",
          }}
        />

        {/* ── Header row ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: "var(--font-sans, sans-serif)",
              }}
            >
              Activity
            </span>
            <span
              style={{
                fontSize: 10,
                color: "var(--text-muted)",
                opacity: 0.5,
                fontFamily: "var(--font-mono, monospace)",
              }}
            >
              · last {days}d
            </span>
          </div>

          {/* Difficulty legend */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {[
              { label: "Easy", color: "#22c55e" },
              { label: "Med", color: "#f59e0b" },
              { label: "Hard", color: "#f87171" },
              { label: "Mix", color: "#00d4aa" },
            ].map(({ label, color }) => (
              <div
                key={label}
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 2,
                    background: color,
                    opacity: 0.8,
                  }}
                />
                <span
                  style={{
                    fontSize: 9.5,
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono, monospace)",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pulse bar container ── */}
        <div ref={containerRef} style={{ position: "relative" }}>
          {/* Month labels row */}
          <div
            style={{
              display: "flex",
              marginBottom: 4,
              height: 14,
              position: "relative",
            }}
          >
            {containerWidth > 0 &&
              monthLabels.map(({ label, idx }) => (
                <div
                  key={`${label}-${idx}`}
                  style={{
                    position: "absolute",
                    left: idx * (barWidth + BAR_GAP),
                    fontSize: 9,
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono, monospace)",
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    opacity: 0.6,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </div>
              ))}
          </div>

          {/* Bars */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: BAR_GAP,
              height: 52,
              position: "relative",
            }}
          >
            {sliced.map((day, i) => {
              const isToday = day.date === today.toISOString().slice(0, 10);
              const isBest = bestDay?.date === day.date && day.count > 0;
              const isHovered = hoveredIdx === i;
              const heightPct =
                day.count === 0 ? 0.08 : Math.max(0.12, day.count / maxCount);
              const color = difficultyColor(
                day.easy,
                day.medium,
                day.hard,
                day.count,
              );
              const isEmpty = day.count === 0;

              return (
                <motion.div
                  key={day.date}
                  initial={shouldReduce ? false : { scaleY: 0, opacity: 0 }}
                  animate={{
                    scaleY: 1,
                    opacity: hoveredIdx !== null && !isHovered ? 0.35 : 1,
                  }}
                  transition={
                    shouldReduce
                      ? { duration: 0 }
                      : {
                          scaleY: {
                            duration: 0.5,
                            delay: i * 0.008,
                            ease: [0.22, 1, 0.36, 1],
                          },
                          opacity: { duration: 0.2 },
                        }
                  }
                  onHoverStart={(e) =>
                    handleBarHover(day, i, e.target as HTMLElement)
                  }
                  onHoverEnd={handleBarLeave}
                  style={{
                    width: barWidth,
                    height: `${heightPct * 100}%`,
                    flexShrink: 0,
                    borderRadius: isEmpty ? 2 : "3px 3px 2px 2px",
                    background: isEmpty
                      ? "var(--bg-elevated, rgba(255,255,255,0.05))"
                      : isHovered
                        ? color
                        : `color-mix(in srgb, ${color} ${isToday ? 100 : 75}%, transparent)`,
                    transformOrigin: "bottom",
                    cursor: isEmpty ? "default" : "pointer",
                    position: "relative",
                    boxShadow:
                      isHovered && !isEmpty
                        ? `0 0 10px color-mix(in srgb, ${color} 50%, transparent), 0 0 4px ${color}`
                        : isBest
                          ? `0 0 6px color-mix(in srgb, ${color} 35%, transparent)`
                          : "none",
                    transition: "background 0.15s, box-shadow 0.15s",
                  }}
                >
                  {/* Today indicator — glowing dot on top */}
                  {isToday && day.count > 0 && (
                    <motion.div
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{
                        position: "absolute",
                        top: -5,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: color,
                        boxShadow: `0 0 6px ${color}`,
                      }}
                    />
                  )}

                  {/* Best day crown indicator */}
                  {isBest && !isToday && (
                    <div
                      style={{
                        position: "absolute",
                        top: -8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: 7,
                        lineHeight: 1,
                        opacity: 0.7,
                      }}
                    >
                      ▲
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Tooltip */}
            <AnimatePresence>
              {tooltip && (
                <PulseTooltip
                  key={tooltip.day.date}
                  data={{ ...tooltip, containerWidth }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* "Now" label at the right end */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 4,
            }}
          >
            <span
              style={{
                fontSize: 9,
                color: "var(--text-muted)",
                opacity: 0.5,
                fontFamily: "var(--font-mono, monospace)",
              }}
            >
              now
            </span>
          </div>
        </div>

        {/* ── Footer stats row ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid var(--border-subtle, rgba(255,255,255,0.07))",
            flexWrap: "wrap",
          }}
        >
          <StatChip
            label="submissions"
            value={totalSubs}
            color="#00d4aa"
            icon={
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            }
          />
          <StatChip
            label="active days"
            value={activeDays}
            color="#3b82f6"
            icon={
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
          />

          {currentStreak > 0 && (
            <StatChip
              label={`day streak`}
              value={currentStreak}
              color="#f97316"
              icon={
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
                </svg>
              }
            />
          )}

          {longestStreak > 1 && longestStreak !== currentStreak && (
            <StatChip
              label="best streak"
              value={longestStreak}
              color="var(--text-muted)"
              icon={
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              }
            />
          )}

          {bestDay && bestDay.count > 0 && (
            <StatChip
              label={`best — ${formatShortDate(bestDay.date)}`}
              value={bestDay.count}
              color={difficultyColor(
                bestDay.easy,
                bestDay.medium,
                bestDay.hard,
                bestDay.count,
              )}
              icon={
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              }
            />
          )}
        </div>
      </motion.div>
    </>
  );
}
