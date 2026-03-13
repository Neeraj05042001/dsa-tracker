"use client";

import { useEffect, useState } from "react";
import { SolveHelpBreakdown as SolveHelpData } from "@/types";

interface SolveHelpBreakdownProps {
  data: SolveHelpData;
  delay?: number;
}

export function SolveHelpBreakdown({ data, delay = 0 }: SolveHelpBreakdownProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay + 200);
    return () => clearTimeout(t);
  }, [delay]);

  const total = data.no_help + data.hints + data.saw_solution;

  const segments = [
    {
      key: "no_help",
      label: "No Help",
      sublabel: "Solved independently",
      count: data.no_help,
      color: "var(--easy)",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    {
      key: "hints",
      label: "Hints",
      sublabel: "Used hint(s)",
      count: data.hints,
      color: "var(--medium)",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
        </svg>
      ),
    },
    {
      key: "saw_solution",
      label: "Saw Solution",
      sublabel: "Reviewed editorial",
      count: data.saw_solution,
      color: "var(--hard)",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
  ];

  if (total === 0) {
    return (
      <div style={{ padding: "16px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13, fontStyle: "italic" }}>
        No data yet.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stacked bar */}
      <div style={{
        height: 10,
        borderRadius: "var(--radius-pill)",
        overflow: "hidden",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        display: "flex",
      }}>
        {segments.map((s, i) => {
          const pct = total > 0 ? (s.count / total) * 100 : 0;
          return (
            <div
              key={s.key}
              title={`${s.label}: ${s.count}`}
              style={{
                width: animated ? `${pct}%` : "0%",
                background: s.color,
                transition: `width 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms`,
                boxShadow: animated ? `0 0 8px color-mix(in srgb, ${s.color} 40%, transparent)` : "none",
              }}
            />
          );
        })}
      </div>

      {/* Legend rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {segments.map(s => {
          const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
          return (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Icon */}
              <div style={{
                width: 28,
                height: 28,
                borderRadius: "var(--radius-sm)",
                background: `color-mix(in srgb, ${s.color} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${s.color} 25%, transparent)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: s.color,
                flexShrink: 0,
              }}>
                {s.icon}
              </div>

              {/* Label + sublabel */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>{s.label}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{s.sublabel}</div>
              </div>

              {/* Count + pct */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: s.color, lineHeight: 1 }}>
                  {s.count}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>
                  {pct}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}