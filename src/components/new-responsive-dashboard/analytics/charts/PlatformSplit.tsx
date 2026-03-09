"use client";

import { useEffect, useState } from "react";
import { PlatformStats } from "@/types";

interface PlatformSplitProps {
  platforms: PlatformStats[];
  delay?: number;
}

function MiniBar({
  easy, medium, hard, total, animated, baseDelay,
}: {
  easy: number; medium: number; hard: number; total: number;
  animated: boolean; baseDelay: number;
}) {
  if (total === 0) return null;
  const ep = (easy / total) * 100;
  const mp = (medium / total) * 100;
  const hp = (hard / total) * 100;

  return (
    <div style={{
      height: 5,
      borderRadius: "var(--radius-pill)",
      overflow: "hidden",
      background: "var(--bg-base)",
      display: "flex",
      marginTop: 6,
    }}>
      {[
        { pct: ep, color: "var(--easy)", d: 0 },
        { pct: mp, color: "var(--medium)", d: 80 },
        { pct: hp, color: "var(--hard)", d: 160 },
      ].map((seg, i) => (
        <div key={i} style={{
          width: animated ? `${seg.pct}%` : "0%",
          background: seg.color,
          transition: `width 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${baseDelay + seg.d}ms`,
        }} />
      ))}
    </div>
  );
}

export function PlatformSplit({ platforms, delay = 0 }: PlatformSplitProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay + 200);
    return () => clearTimeout(t);
  }, [delay]);

  const relevant = platforms.filter(p => p.platform !== "other" || p.total > 0);

  const platformMeta: Record<string, { label: string; color: string }> = {
    leetcode:   { label: "LeetCode",   color: "var(--lc-color)" },
    codeforces: { label: "Codeforces", color: "var(--cf-color)" },
    other:      { label: "Other",      color: "var(--text-muted)" },
  };

  if (relevant.every(p => p.total === 0)) {
    return (
      <div style={{ padding: "16px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13, fontStyle: "italic" }}>
        No data yet.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {relevant.map((p, idx) => {
        const meta = platformMeta[p.platform] ?? { label: p.platform, color: "var(--text-muted)" };
        const solvePct = p.total > 0 ? Math.round((p.solved / p.total) * 100) : 0;

        return (
          <div
            key={p.platform}
            className="animate-fade-in"
            style={{
              background: "var(--bg-elevated)",
              border: `1px solid color-mix(in srgb, ${meta.color} 15%, var(--border-subtle))`,
              borderRadius: "var(--radius-md)",
              padding: "12px 14px",
              animationDelay: `${delay + idx * 60}ms`,
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: meta.color,
                  boxShadow: `0 0 5px color-mix(in srgb, ${meta.color} 60%, transparent)`,
                }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                  {meta.label}
                </span>
              </div>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: meta.color,
                fontWeight: 700,
              }}>
                {solvePct}% solved
              </span>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 12, marginBottom: 2 }}>
              {[
                { label: "Total",    val: p.total },
                { label: "Solved",   val: p.solved },
                { label: "Easy",     val: p.easy,   color: "var(--easy)" },
                { label: "Medium",   val: p.medium, color: "var(--medium)" },
                { label: "Hard",     val: p.hard,   color: "var(--hard)" },
              ].map(stat => (
                <div key={stat.label} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, color: "var(--text-muted)" }}>
                    {stat.label}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 14,
                    fontWeight: 700,
                    color: stat.color ?? "var(--text-primary)",
                    lineHeight: 1,
                  }}>
                    {stat.val}
                  </span>
                </div>
              ))}
            </div>

            {/* Mini difficulty bar */}
            <MiniBar
              easy={p.easy} medium={p.medium} hard={p.hard}
              total={p.easy + p.medium + p.hard}
              animated={animated}
              baseDelay={idx * 80}
            />
          </div>
        );
      })}
    </div>
  );
}