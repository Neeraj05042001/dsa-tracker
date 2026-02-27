"use client";

import { useEffect, useRef, useState } from "react";
import { SM2Rating } from "@/lib/sm2";

interface SessionResult {
  problemKey: string;
  problemName: string;
  pattern: string | null;
  rating: SM2Rating;
  newInterval: number;
}

interface SessionSummaryProps {
  results: SessionResult[];
  onStartNew: () => void;
}

function useCountUp(target: number, delay = 0) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / 700, 1);
        const e = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(e * target));
        if (p < 1) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(t); cancelAnimationFrame(raf.current); };
  }, [target, delay]);
  return val;
}

const RATING_COLORS: Record<SM2Rating, string> = {
  1: "var(--hard)",
  2: "var(--medium)",
  3: "var(--accent)",
  4: "var(--easy)",
};
const RATING_LABELS: Record<SM2Rating, string> = {
  1: "Again", 2: "Hard", 3: "Good", 4: "Easy",
};

export function SessionSummary({ results, onStartNew }: SessionSummaryProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const total = results.length;
  const strong = results.filter(r => r.rating >= 3).length;
  const needWork = results.filter(r => r.rating <= 2).length;
  const avgInterval = total > 0
    ? Math.round(results.reduce((s, r) => s + r.newInterval, 0) / total)
    : 0;

  const strongCount = useCountUp(strong, 400);
  const needWorkCount = useCountUp(needWork, 500);
  const avgIntervalCount = useCountUp(avgInterval, 600);

  // Pattern breakdown
  const patternMap = new Map<string, { good: number; again: number }>();
  for (const r of results) {
    const key = r.pattern ?? "Other";
    const existing = patternMap.get(key) ?? { good: 0, again: 0 };
    if (r.rating >= 3) existing.good++;
    else existing.again++;
    patternMap.set(key, existing);
  }
  const patterns = [...patternMap.entries()].sort((a, b) => (b[1].good + b[1].again) - (a[1].good + a[1].again));

  // Verdict
  const successRate = total > 0 ? strong / total : 0;
  const verdict = successRate >= 0.8
    ? { text: "Excellent session!", color: "var(--easy)" }
    : successRate >= 0.6
    ? { text: "Good progress.", color: "var(--accent)" }
    : successRate >= 0.4
    ? { text: "Keep reviewing these.", color: "var(--medium)" }
    : { text: "These need more work.", color: "var(--hard)" };

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 24,
      width: "100%",
      maxWidth: 640,
      margin: "0 auto",
    }}>

      {/* Hero */}
      <div style={{
        textAlign: "center",
        padding: "32px 40px 28px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
      }}>
        {/* Glow */}
        <div style={{
          position: "absolute", top: -40, left: "50%",
          transform: "translateX(-50%)",
          width: 200, height: 200, borderRadius: "50%",
          background: verdict.color, opacity: 0.06,
          filter: "blur(40px)", pointerEvents: "none",
        }} />

        {/* Checkmark */}
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: `color-mix(in srgb, ${verdict.color} 12%, transparent)`,
          border: `2px solid color-mix(in srgb, ${verdict.color} 35%, transparent)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
          boxShadow: `0 0 20px color-mix(in srgb, ${verdict.color} 30%, transparent)`,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={verdict.color} strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2 style={{
          margin: "0 0 6px",
          fontSize: 22, fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
        }}>
          Session Complete
        </h2>
        <p style={{
          margin: "0 0 24px",
          fontSize: 14,
          color: verdict.color,
          fontWeight: 600,
        }}>
          {verdict.text}
        </p>

        {/* Stats row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1,
          background: "var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          marginBottom: 0,
        }}>
          {[
            { label: "Reviewed", value: total, color: "var(--text-primary)", suffix: "" },
            { label: "Strong", value: strongCount, color: "var(--easy)", suffix: "" },
            { label: "Avg Interval", value: avgIntervalCount, color: "var(--accent)", suffix: "d" },
          ].map(s => (
            <div key={s.label} style={{
              padding: "16px 12px",
              background: "var(--bg-elevated)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: 26, fontWeight: 700,
                color: s.color, lineHeight: 1,
              }}>
                {s.value}{s.suffix}
              </span>
              <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Needs work */}
      {needWork > 0 && (
        <div
          className="animate-fade-in"
          style={{
            width: "100%",
            padding: "16px 20px",
            background: "color-mix(in srgb, var(--hard) 5%, var(--bg-surface))",
            border: "1px solid color-mix(in srgb, var(--hard) 20%, var(--border-subtle))",
            borderRadius: "var(--radius-md)",
            animationDelay: "300ms",
          }}
        >
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.06em", color: "var(--hard)", marginBottom: 10,
          }}>
            {needWork} need{needWork !== 1 ? "" : "s"} more work
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {results.filter(r => r.rating <= 2).map((r, i) => (
              <div key={r.problemKey}
                className="animate-fade-in"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  animationDelay: `${400 + i * 50}ms`,
                }}
              >
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{r.problemName}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: RATING_COLORS[r.rating],
                  background: `color-mix(in srgb, ${RATING_COLORS[r.rating]} 10%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${RATING_COLORS[r.rating]} 25%, transparent)`,
                  borderRadius: "var(--radius-pill)", padding: "1px 7px",
                  fontFamily: "var(--font-mono)",
                }}>
                  {RATING_LABELS[r.rating]} · +{r.newInterval}d
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pattern breakdown */}
      {patterns.length > 0 && (
        <div
          className="animate-fade-in"
          style={{
            width: "100%",
            padding: "16px 20px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            animationDelay: "500ms",
          }}
        >
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 12,
          }}>
            Patterns reviewed
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {patterns.map(([pattern, counts], i) => (
              <div
                key={pattern}
                className="animate-fade-in"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-pill)",
                  padding: "5px 12px",
                  animationDelay: `${600 + i * 40}ms`,
                }}
              >
                <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>
                  {pattern}
                </span>
                {counts.good > 0 && (
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
                    color: "var(--easy)",
                  }}>
                    ✓{counts.good}
                  </span>
                )}
                {counts.again > 0 && (
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
                    color: "var(--hard)",
                  }}>
                    ✗{counts.again}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onStartNew}
        className="animate-fade-in"
        style={{
          animationDelay: "700ms",
          padding: "13px 32px",
          background: "var(--accent)",
          border: "none",
          borderRadius: "var(--radius-md)",
          color: "var(--bg-base)",
          fontSize: 14, fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.2s ease",
          boxShadow: "0 0 20px color-mix(in srgb, var(--accent) 30%, transparent)",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 24px color-mix(in srgb, var(--accent) 40%, transparent)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 0 20px color-mix(in srgb, var(--accent) 30%, transparent)";
        }}
      >
        Back to dashboard →
      </button>
    </div>
  );
}