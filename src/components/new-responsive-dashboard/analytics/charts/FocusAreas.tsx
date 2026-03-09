"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PatternStat, TagStat } from "@/types";

interface FocusAreasProps {
  patterns: PatternStat[];
  tags: TagStat[];
  delay?: number;
}

function encodeParam(value: string): string {
  return encodeURIComponent(value);
}

function formatLabel(s: string): string {
  return s.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function FocusChip({ href, label, count, color, i }: {
  href: string; label: string; count: string | number; color: string; i: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.06, y: -1 }}
      whileTap={{ scale: 0.93 }}
    >
      <Link
        href={href}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, fontWeight: 500, color,
          background: `color-mix(in srgb, ${color} 10%, transparent)`,
          border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`,
          borderRadius: "var(--radius-pill)",
          padding: "5px 11px", textDecoration: "none",
          transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s",
          boxShadow: `0 2px 10px color-mix(in srgb, ${color} 8%, transparent)`,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = `color-mix(in srgb, ${color} 18%, transparent)`;
          e.currentTarget.style.boxShadow = `0 4px 16px color-mix(in srgb, ${color} 22%, transparent)`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = `color-mix(in srgb, ${color} 10%, transparent)`;
          e.currentTarget.style.boxShadow = `0 2px 10px color-mix(in srgb, ${color} 8%, transparent)`;
        }}
      >
        {label}
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, opacity: 0.8 }}>
          {count}
        </span>
        <motion.svg
          width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round"
          whileHover={{ x: 2 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <polyline points="9 18 15 12 9 6" />
        </motion.svg>
      </Link>
    </motion.div>
  );
}

export function FocusAreas({ patterns, tags, delay = 0 }: FocusAreasProps) {
  const weakPatterns = patterns
    .filter(p => p.avg_confidence < 0.65 && p.count >= 1)
    .sort((a, b) => a.avg_confidence - b.avg_confidence)
    .slice(0, 3);

  const weakTags = tags
    .filter(t => t.low_confidence_count >= 1 && t.avg_confidence < 0.5)
    .sort((a, b) => b.low_confidence_count - a.low_confidence_count)
    .slice(0, 3);

  const hasWeakAreas = weakPatterns.length > 0 || weakTags.length > 0;

  if (!hasWeakAreas) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 20px",
          background: "color-mix(in srgb, var(--easy) 6%, var(--bg-elevated))",
          border: "1px solid color-mix(in srgb, var(--easy) 20%, var(--border-subtle))",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: delay / 1000 + 0.1 }}
          style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: "color-mix(in srgb, var(--easy) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--easy) 25%, transparent)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--easy)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--easy)" }}>Strong across all areas</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>
            No significant weak spots. Keep solving harder problems to maintain momentum.
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      style={{
        padding: "18px 22px",
        background: "color-mix(in srgb, var(--medium) 4%, var(--bg-surface))",
        borderColor: "color-mix(in srgb, var(--medium) 20%, var(--border-subtle))",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Ambient */}
      <motion.div
        animate={{ opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: -20, right: -20,
          width: 80, height: 80, borderRadius: "50%",
          background: "var(--medium)", filter: "blur(20px)", pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, delay: delay / 1000 + 0.15 }}
          style={{
            width: 32, height: 32, borderRadius: "var(--radius-md)", flexShrink: 0,
            background: "color-mix(in srgb, var(--medium) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--medium) 25%, transparent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--medium)", marginTop: 1,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
          </svg>
        </motion.div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>Focus Areas</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
            Patterns and tags where your confidence is lowest — review these next.
          </div>

          {weakPatterns.length > 0 && (
            <div style={{ marginBottom: weakTags.length > 0 ? 10 : 0 }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 7 }}>
                Patterns
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {weakPatterns.map((p, i) => {
                  const confColor = p.avg_confidence < 0.3 ? "var(--hard)" : "var(--medium)";
                  return (
                    <FocusChip
                      key={p.pattern}
                      href={`/dashboard/problems?pattern=${encodeParam(p.pattern)}`}
                      label={formatLabel(p.pattern)}
                      count={p.count}
                      color={confColor}
                      i={i}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {weakTags.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 7 }}>
                Tags with low-confidence problems
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {weakTags.map((t, i) => (
                  <FocusChip
                    key={t.tag}
                    href={`/dashboard/problems?tags=${encodeParam(t.tag)}&confidence=low`}
                    label={formatLabel(t.tag)}
                    count={`${t.low_confidence_count} low`}
                    color="var(--hard)"
                    i={i + weakPatterns.length}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}