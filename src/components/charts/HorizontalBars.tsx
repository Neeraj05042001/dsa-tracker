

"use client";

import { useEffect, useState } from "react";

// "sliding_window" → "Sliding Window", "two_pointers" → "Two Pointers"
function formatLabel(s: string): string {
  return s.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

interface BarItem {
  label: string;
  count: number;
  avgConfidence?: number;
  subLabel?: string;
}

interface HorizontalBarsProps {
  items: BarItem[];
  maxItems?: number;
  delay?: number;
  colorMode?: "confidence" | "accent";
}

function confidenceColor(avg: number): string {
  if (avg >= 0.75) return "var(--easy)";
  if (avg >= 0.4)  return "var(--accent)";
  return "var(--hard)";
}

function ConfidencePip({ avg }: { avg: number }) {
  const color = confidenceColor(avg);
  const label = avg >= 0.75 ? "High" : avg >= 0.4 ? "Med" : "Low";
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)",
      color,
      background: `color-mix(in srgb, ${color} 10%, transparent)`,
      border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
      borderRadius: "var(--radius-pill)",
      padding: "1px 5px", flexShrink: 0,
    }}>
      {label}
    </span>
  );
}

export function HorizontalBars({
  items,
  maxItems = 10,
  delay = 0,
  colorMode = "confidence",
}: HorizontalBarsProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay + 150);
    return () => clearTimeout(t);
  }, [delay]);

  const shown = items.slice(0, maxItems);
  const maxCount = Math.max(...shown.map(i => i.count), 1);

  if (shown.length === 0) {
    return (
      <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13, fontStyle: "italic" }}>
        No data yet.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {shown.map((item, i) => {
        const widthPct = (item.count / maxCount) * 100;
        const barColor = colorMode === "confidence" && item.avgConfidence !== undefined
          ? confidenceColor(item.avgConfidence)
          : "var(--accent)";

        return (
          <div
            key={item.label}
            className="animate-fade-in"
            style={{ display: "flex", flexDirection: "column", gap: 4, animationDelay: `${delay + i * 40}ms` }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{
                fontSize: 12, color: "var(--text-secondary)", fontWeight: 500,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
              }}>
                {formatLabel(item.label)}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                {item.avgConfidence !== undefined && colorMode === "confidence" && (
                  <ConfidencePip avg={item.avgConfidence} />
                )}
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
                  color: barColor, minWidth: 18, textAlign: "right",
                }}>
                  {item.count}
                </span>
              </div>
            </div>
            <div style={{
              height: 5, background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)", borderRadius: 3, overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: animated ? `${widthPct}%` : "0%",
                background: barColor, borderRadius: 3,
                transition: `width 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${i * 40}ms`,
                boxShadow: animated ? `0 0 6px color-mix(in srgb, ${barColor} 50%, transparent)` : "none",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}