"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface EmptyStateProps {
  nextReviewDate: string | null;
  totalProblems: number;
}

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / 86400000);
}

export function EmptyState({ nextReviewDate, totalProblems }: EmptyStateProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  const days = nextReviewDate ? daysUntil(nextReviewDate) : null;

  const formattedNext = nextReviewDate
    ? new Date(nextReviewDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : null;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      minHeight: 420,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      gap: 20,
    }}>
      {/* Animated check circle */}
      <div style={{
        width: 72, height: 72,
        borderRadius: "50%",
        background: "color-mix(in srgb, var(--easy) 10%, transparent)",
        border: "2px solid color-mix(in srgb, var(--easy) 30%, transparent)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 30px color-mix(in srgb, var(--easy) 20%, transparent)",
        animation: "pulse 2.5s ease-in-out infinite",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke="var(--easy)" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div>
        <h2 style={{
          margin: "0 0 8px",
          fontSize: 24, fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
        }}>
          All caught up
        </h2>
        <p style={{
          margin: 0,
          fontSize: 14, color: "var(--text-muted)",
          lineHeight: 1.6, maxWidth: 320,
        }}>
          {totalProblems === 0
            ? "No problems to review yet. Solve some problems and come back."
            : "No reviews due right now. Your spaced repetition schedule is on track."}
        </p>
      </div>

      {/* Next review */}
      {formattedNext && days !== null && (
        <div style={{
          padding: "14px 24px",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.07em", color: "var(--text-muted)",
          }}>
            Next review
          </span>
          <span style={{
            fontSize: 15, fontWeight: 600,
            color: days <= 1 ? "var(--accent)" : "var(--text-primary)",
          }}>
            {days === 0 ? "Later today" : days === 1 ? "Tomorrow" : formattedNext}
          </span>
          {days > 1 && (
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)",
            }}>
              in {days} day{days !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {/* Link to problems */}
      <Link
        href="/dashboard/problems"
        style={{
          fontSize: 13, color: "var(--text-muted)",
          textDecoration: "none", transition: "color 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        Browse all problems →
      </Link>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 30px color-mix(in srgb, var(--easy) 20%, transparent); }
          50% { box-shadow: 0 0 50px color-mix(in srgb, var(--easy) 35%, transparent); }
        }
      `}</style>
    </div>
  );
}