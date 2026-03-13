"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  if (avg >= 0.4) return "var(--accent)";
  return "var(--hard)";
}

function ConfidencePip({ avg }: { avg: number }) {
  const color = confidenceColor(avg);
  const label = avg >= 0.75 ? "High" : avg >= 0.4 ? "Med" : "Low";
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)",
      color, background: `color-mix(in srgb, ${color} 10%, transparent)`,
      border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
      borderRadius: "var(--radius-pill)", padding: "1px 5px", flexShrink: 0,
    }}>
      {label}
    </span>
  );
}

function BarRow({ item, index, maxCount, delay, colorMode, animated }: {
  item: BarItem; index: number; maxCount: number;
  delay: number; colorMode: "confidence" | "accent"; animated: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const widthPct = (item.count / maxCount) * 100;
  const barColor = colorMode === "confidence" && item.avgConfidence !== undefined
    ? confidenceColor(item.avgConfidence)
    : "var(--accent)";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (delay + index * 45) / 1000, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: 3 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        display: "flex", flexDirection: "column", gap: 4,
        padding: "4px 6px", borderRadius: "var(--radius-sm)",
        background: hovered ? "var(--bg-hover)" : "transparent",
        transition: "background 0.15s",
        cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{
          fontSize: 12, color: hovered ? "var(--text-primary)" : "var(--text-secondary)",
          fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
          transition: "color 0.15s",
        }}>
          {formatLabel(item.label)}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {item.avgConfidence !== undefined && colorMode === "confidence" && (
            <ConfidencePip avg={item.avgConfidence} />
          )}
          <motion.span
            animate={{ color: hovered ? barColor : barColor, scale: hovered ? 1.1 : 1 }}
            style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, minWidth: 18, textAlign: "right", color: barColor }}
          >
            {item.count}
          </motion.span>
        </div>
      </div>
      <div style={{ height: 5, background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 3, overflow: "hidden", position: "relative" }}>
        <motion.div
          style={{ height: "100%", background: barColor, borderRadius: 3, position: "relative", overflow: "hidden" }}
          initial={{ width: "0%" }}
          animate={{ width: animated ? `${widthPct}%` : "0%" }}
          transition={{ duration: 0.7, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Glow */}
          <div style={{
            position: "absolute", inset: 0,
            boxShadow: `0 0 ${hovered ? 8 : 4}px color-mix(in srgb, ${barColor} ${hovered ? 70 : 45}%, transparent)`,
            transition: "box-shadow 0.2s",
          }} />
          {/* Shimmer on hover */}
          {hovered && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "300%" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{
                position: "absolute", inset: 0, width: "40%",
                background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${barColor} 70%, white), transparent)`,
              }}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export function HorizontalBars({ items, defaultVisible = 5, delay = 0, colorMode = "confidence" }: HorizontalBarsProps) {
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
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <AnimatePresence>
            {visibleItems.map((item, i) => (
              <BarRow key={item.label} item={item} index={i} maxCount={maxCount} delay={delay} colorMode={colorMode} animated={animated} />
            ))}
          </AnimatePresence>
        </div>

        {hasMore && !expanded && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 40,
            background: "linear-gradient(to bottom, transparent, var(--bg-surface))",
            pointerEvents: "none",
          }} />
        )}
      </div>

      {hasMore && (
        <motion.button
          type="button"
          onClick={() => setExpanded(e => !e)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            marginTop: expanded ? 10 : 2,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            width: "100%", padding: "7px 0",
            background: "none", border: "1px solid transparent",
            borderRadius: "var(--radius-sm)", color: "var(--text-muted)",
            fontSize: 11, fontWeight: 600, cursor: "pointer",
            transition: "color 0.15s, border-color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.borderColor = "color-mix(in srgb, var(--accent) 20%, transparent)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "transparent"; }}
        >
          <motion.svg
            animate={{ rotate: expanded ? 180 : 0 }}
            width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </motion.svg>
          {expanded ? "Show less" : `${hiddenCount} more`}
        </motion.button>
      )}
    </div>
  );
}