"use client";

import { useState, useEffect } from "react";
import { Problem } from "@/types";

interface ReviewCardProps {
  problem: Problem;
  isFlipped: boolean;
  onFlip: () => void;
  exitDirection?: "left" | null;
}

function diffColor(d: string | null): string {
  return d === "easy" ? "var(--easy)"
    : d === "medium" ? "var(--medium)"
    : d === "hard" ? "var(--hard)"
    : "var(--text-muted)";
}

function IcoExternal() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}

function IcoEye() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

// ─── Card front — recall test ─────────────────────────────────────────────────

function CardFront({ problem, onFlip }: { problem: Problem; onFlip: () => void }) {
  const diff = problem.difficulty ?? problem.user_difficulty;
  const dc = diffColor(diff);
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <div style={{
      position: "absolute", inset: 0,
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      display: "flex",
      flexDirection: "column",
      padding: "36px 40px 32px",
    }}>
      {/* Top row — platform + difficulty */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: problem.platform === "leetcode" ? "var(--lc-color)" : "var(--cf-color)",
          background: `color-mix(in srgb, ${problem.platform === "leetcode" ? "var(--lc-color)" : "var(--cf-color)"} 10%, transparent)`,
          border: `1px solid color-mix(in srgb, ${problem.platform === "leetcode" ? "var(--lc-color)" : "var(--cf-color)"} 25%, transparent)`,
          borderRadius: "var(--radius-pill)", padding: "3px 10px",
        }}>
          {problem.platform === "leetcode" ? "LeetCode" : "Codeforces"}
        </span>
        {diff && (
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: dc,
            background: `color-mix(in srgb, ${dc} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${dc} 25%, transparent)`,
            borderRadius: "var(--radius-pill)", padding: "3px 10px",
            textTransform: "capitalize",
          }}>
            {diff}
          </span>
        )}
        {problem.cf_rating && (
          <span style={{
            fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700,
            color: "var(--cf-color)",
            background: "color-mix(in srgb, var(--cf-color) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--cf-color) 25%, transparent)",
            borderRadius: "var(--radius-pill)", padding: "3px 10px",
          }}>
            {problem.cf_rating}
          </span>
        )}
        <div style={{ flex: 1 }} />
        {problem.problem_url && (
          <a
            href={problem.problem_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 11, color: "var(--text-muted)",
              textDecoration: "none", transition: "color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <IcoExternal /> Open problem
          </a>
        )}
      </div>

      {/* Problem name — the hero */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h2 style={{
          fontSize: 28,
          fontWeight: 700,
          color: "var(--text-primary)",
          margin: "0 0 20px",
          lineHeight: 1.2,
          letterSpacing: "-0.015em",
        }}>
          {problem.problem_name}
        </h2>

        {/* Pattern + tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {problem.pattern && (
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: "var(--accent)",
              background: "var(--accent-muted)",
              border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
              borderRadius: "var(--radius-pill)", padding: "4px 10px",
            }}>
              {problem.pattern}
            </span>
          )}
          {problem.tags?.slice(0, 4).map(tag => (
            <span key={tag} style={{
              fontSize: 12, color: "var(--text-muted)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-pill)", padding: "4px 10px",
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Recall prompt */}
      <div style={{
        marginTop: 28,
        padding: "16px 20px",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        marginBottom: 24,
        textAlign: "center",
      }}>
        <p style={{
          fontSize: 13,
          color: "var(--text-muted)",
          margin: 0,
          lineHeight: 1.5,
        }}>
          Try to recall your approach before flipping.
          Think about the pattern, edge cases, and time complexity.
        </p>
      </div>

      {/* Flip button */}
      <button
        onClick={onFlip}
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "100%",
          padding: "14px",
          background: btnHovered
            ? "color-mix(in srgb, var(--accent) 15%, var(--bg-elevated))"
            : "var(--bg-elevated)",
          border: `1px solid ${btnHovered
            ? "color-mix(in srgb, var(--accent) 40%, var(--border-subtle))"
            : "var(--border-mid)"}`,
          borderRadius: "var(--radius-md)",
          color: btnHovered ? "var(--accent)" : "var(--text-secondary)",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s ease",
          transform: btnHovered ? "translateY(-1px)" : "translateY(0)",
          boxShadow: btnHovered ? "0 4px 16px rgba(0,0,0,0.3)" : "none",
        }}
      >
        <IcoEye />
        Reveal approach
      </button>
    </div>
  );
}

// ─── Card back — approach reveal ──────────────────────────────────────────────

function CardBack({ problem }: { problem: Problem }) {
  const solveHelpColors: Record<string, string> = {
    no_help: "var(--easy)",
    hints: "var(--medium)",
    saw_solution: "var(--hard)",
  };
  const solveHelpLabels: Record<string, string> = {
    no_help: "No help",
    hints: "Used hints",
    saw_solution: "Saw solution",
  };

  return (
    <div style={{
      position: "absolute", inset: 0,
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      transform: "rotateY(180deg)",
      display: "flex",
      flexDirection: "column",
      padding: "28px 40px 28px",
      overflowY: "auto",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.07em", color: "var(--accent)",
            background: "var(--accent-muted)",
            border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
            borderRadius: "var(--radius-pill)", padding: "2px 8px",
          }}>
            Your approach
          </span>
          {problem.solve_help && (
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: solveHelpColors[problem.solve_help] ?? "var(--text-muted)",
              background: `color-mix(in srgb, ${solveHelpColors[problem.solve_help] ?? "var(--text-muted)"} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${solveHelpColors[problem.solve_help] ?? "var(--text-muted)"} 25%, transparent)`,
              borderRadius: "var(--radius-pill)", padding: "2px 8px",
            }}>
              {solveHelpLabels[problem.solve_help] ?? problem.solve_help}
            </span>
          )}
        </div>
        <h3 style={{
          margin: 0, fontSize: 16, fontWeight: 700,
          color: "var(--text-primary)", lineHeight: 1.2,
        }}>
          {problem.problem_name}
        </h3>
      </div>

      {/* Approach */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
        <div style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          padding: "14px 16px",
          flex: problem.mistakes ? "0 0 auto" : 1,
        }}>
          {problem.approach ? (
            <p style={{
              fontSize: 13, color: "var(--text-secondary)",
              margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.7,
            }}>
              {problem.approach}
            </p>
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>
              No approach noted.
            </p>
          )}
        </div>

        {/* Mistakes */}
        {problem.mistakes && (
          <div style={{
            background: "color-mix(in srgb, var(--hard) 6%, var(--bg-elevated))",
            border: "1px solid color-mix(in srgb, var(--hard) 20%, var(--border-subtle))",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.06em", color: "var(--hard)", marginBottom: 6,
            }}>
              Watch out for
            </div>
            <p style={{
              fontSize: 13, color: "var(--text-secondary)",
              margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.6,
            }}>
              {problem.mistakes}
            </p>
          </div>
        )}
      </div>

      {/* Bottom meta */}
      <div style={{
        marginTop: 16, paddingTop: 14,
        borderTop: "1px solid var(--border-subtle)",
        display: "flex", gap: 16, flexWrap: "wrap",
      }}>
        {problem.pattern && (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", fontWeight: 600 }}>Pattern</span>
            <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>{problem.pattern}</span>
          </div>
        )}
        {problem.language && (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", fontWeight: 600 }}>Language</span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{problem.language}</span>
          </div>
        )}
        {problem.time_taken && (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", fontWeight: 600 }}>Time</span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
              {{"<15": "< 15 min", "15-30": "15–30 min", "30-60": "30–60 min", ">60": "> 60 min"}[problem.time_taken] ?? problem.time_taken}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main card wrapper ────────────────────────────────────────────────────────

export function ReviewCard({ problem, isFlipped, onFlip, exitDirection }: ReviewCardProps) {
  const diff = problem.difficulty ?? problem.user_difficulty;
  const dc = diffColor(diff);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 640,
        margin: "0 auto",
        height: 520,
        perspective: "1200px",
        transform: exitDirection === "left"
          ? "translateX(-110%) rotate(-4deg)"
          : "translateX(0) rotate(0deg)",
        opacity: exitDirection === "left" ? 0 : 1,
        transition: exitDirection === "left"
          ? "transform 0.45s cubic-bezier(0.4, 0, 1, 1), opacity 0.35s ease"
          : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease",
      }}
    >
      {/* The 3D flipper */}
      <div style={{
        position: "relative",
        width: "100%",
        height: "100%",
        transformStyle: "preserve-3d",
        transition: "transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
      }}>
        {/* Card surface */}
        <div style={{
          position: "absolute", inset: 0,
          background: "var(--bg-surface)",
          border: `1px solid color-mix(in srgb, ${dc} 15%, var(--border-subtle))`,
          borderRadius: "var(--radius-lg)",
          boxShadow: `0 0 0 1px color-mix(in srgb, ${dc} 8%, transparent), 0 24px 64px rgba(0,0,0,0.4)`,
          // Left accent border in difficulty color
          borderLeft: `3px solid ${dc}`,
          transformStyle: "preserve-3d",
        }}>
          {/* Ambient glow in difficulty color */}
          <div style={{
            position: "absolute", top: -30, left: "50%",
            transform: "translateX(-50%)",
            width: 200, height: 200, borderRadius: "50%",
            background: dc, opacity: 0.04, filter: "blur(40px)",
            pointerEvents: "none",
          }} />

          <CardFront problem={problem} onFlip={onFlip} />
          <CardBack problem={problem} />
        </div>
      </div>
    </div>
  );
}