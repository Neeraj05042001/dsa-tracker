"use client";

import { useEffect, useState } from "react";
import { DifficultyBreakdown } from "@/types";

interface DifficultyDonutProps {
  data: DifficultyBreakdown;
  delay?: number;
}

const SIZE = 140;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;
const CX = SIZE / 2;
const CY = SIZE / 2;

function Arc({
  pct,
  offset,
  color,
  delay,
  label,
}: {
  pct: number;
  offset: number;
  color: string;
  delay: number;
  label: string;
}) {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const dash = CIRC * pct;
  const gap = CIRC - dash;

  return (
    <circle
      cx={CX}
      cy={CY}
      r={R}
      fill="none"
      stroke={color}
      strokeWidth={STROKE}
      strokeDasharray={`${drawn ? dash : 0} ${CIRC}`}
      strokeDashoffset={-CIRC * offset}
      strokeLinecap="round"
      style={{
        transition: `stroke-dasharray 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        transformOrigin: "center",
        transform: "rotate(-90deg)",
        filter: drawn ? `drop-shadow(0 0 4px color-mix(in srgb, ${color} 60%, transparent))` : "none",
        // transition on filter too
      }}
      aria-label={label}
    />
  );
}

export function DifficultyDonut({ data, delay = 0 }: DifficultyDonutProps) {
  const total = data.easy + data.medium + data.hard + data.unknown;
  const solved = data.easy + data.medium + data.hard;

  if (total === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 140 }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>No data yet</span>
      </div>
    );
  }

  // Percentages with small gaps between arcs
  const GAP = 0.012;
  const easyPct  = (data.easy   / total) * (1 - 3 * GAP);
  const medPct   = (data.medium / total) * (1 - 3 * GAP);
  const hardPct  = (data.hard   / total) * (1 - 3 * GAP);

  // Offsets (cumulative, with gap spacing)
  const easyOff  = 0;
  const medOff   = easyPct  + GAP;
  const hardOff  = medOff   + medPct  + GAP;

  const segments = [
    { pct: easyPct, offset: easyOff, color: "var(--easy)",   label: `Easy: ${data.easy}`,   count: data.easy,   name: "Easy",   key: "easy"   },
    { pct: medPct,  offset: medOff,  color: "var(--medium)", label: `Med: ${data.medium}`,   count: data.medium, name: "Medium", key: "medium" },
    { pct: hardPct, offset: hardOff, color: "var(--hard)",   label: `Hard: ${data.hard}`,    count: data.hard,   name: "Hard",   key: "hard"   },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
      {/* SVG donut */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <svg width={SIZE} height={SIZE}>
          {/* Track */}
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke="var(--bg-elevated)"
            strokeWidth={STROKE}
          />
          {/* Arcs — render in reverse so first segment is on top */}
          {[...segments].reverse().map(s => (
            <Arc
              key={s.key}
              pct={s.pct}
              offset={s.offset}
              color={s.color}
              delay={delay + 200}
              label={s.label}
            />
          ))}
        </svg>

        {/* Center label */}
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 26,
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1,
          }}>
            {solved}
          </span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            solved
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {segments.map(s => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Color dot */}
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: s.color, flexShrink: 0,
              boxShadow: `0 0 5px color-mix(in srgb, ${s.color} 50%, transparent)`,
            }} />
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: s.color,
                }}>
                  {s.count}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
                  {total > 0 ? `${Math.round((s.count / total) * 100)}%` : "0%"}
                </span>
              </div>
            </div>
          </div>
        ))}

        {data.unknown > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--border-mid)", flexShrink: 0 }} />
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Unrated</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)" }}>
                {data.unknown}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}