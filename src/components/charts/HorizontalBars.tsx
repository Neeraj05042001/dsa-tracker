"use client";

import { useEffect, useState } from "react";

function formatLabel(s: string): string {
  return s.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

interface BarItem {
  label: string;
  count: number;
  avgConfidence?: number;
}

interface HorizontalBarsProps {
  items: BarItem[];
  defaultVisible?: number;
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

function BarRow({
  item, index, maxCount, delay, colorMode, animated,
}: {
  item: BarItem; index: number; maxCount: number;
  delay: number; colorMode: "confidence" | "accent"; animated: boolean;
}) {
  const widthPct = (item.count / maxCount) * 100;
  const barColor = colorMode === "confidence" && item.avgConfidence !== undefined
    ? confidenceColor(item.avgConfidence)
    : "var(--accent)";

  return (
    <div
      className="animate-fade-in"
      style={{ display: "flex", flexDirection: "column", gap: 4, animationDelay: `${delay + index * 40}ms` }}
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
          transition: `width 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${index * 40}ms`,
          boxShadow: animated ? `0 0 6px color-mix(in srgb, ${barColor} 50%, transparent)` : "none",
        }} />
      </div>
    </div>
  );
}

export function HorizontalBars({
  items,
  defaultVisible = 5,
  delay = 0,
  colorMode = "confidence",
}: HorizontalBarsProps) {
  const [animated, setAnimated] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay + 150);
    return () => clearTimeout(t);
  }, [delay]);

  if (items.length === 0) {
    return (
      <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13, fontStyle: "italic" }}>
        No data yet.
      </div>
    );
  }

  const maxCount = Math.max(...items.map(i => i.count), 1);
  const hasMore = items.length > defaultVisible;
  const visibleItems = expanded ? items : items.slice(0, defaultVisible);
  const hiddenCount = items.length - defaultVisible;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Bar list */}
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {visibleItems.map((item, i) => (
            <BarRow
              key={item.label}
              item={item}
              index={i}
              maxCount={maxCount}
              delay={delay}
              colorMode={colorMode}
              animated={animated}
            />
          ))}
        </div>

        {/* Bottom fade — only when collapsed and more items exist */}
        {hasMore && !expanded && (
          <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: 40,
            background: "linear-gradient(to bottom, transparent, var(--bg-surface))",
            pointerEvents: "none",
          }} />
        )}
      </div>

      {/* Expand / collapse */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          style={{
            marginTop: expanded ? 10 : 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            width: "100%",
            padding: "7px 0",
            background: "none",
            border: "1px solid transparent",
            borderRadius: "var(--radius-sm)",
            color: "var(--text-muted)",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            transition: "color 0.15s, border-color 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = "var(--accent)";
            e.currentTarget.style.borderColor = "color-mix(in srgb, var(--accent) 20%, transparent)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = "var(--text-muted)";
            e.currentTarget.style.borderColor = "transparent";
          }}
        >
          {expanded ? (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              Show less
            </>
          ) : (
            <>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
              {hiddenCount} more
            </>
          )}
        </button>
      )}
    </div>
  );
}