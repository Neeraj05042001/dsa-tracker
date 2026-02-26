"use client";

import { Problem } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProblemCardGridProps {
  problems: Problem[];
  onCardClick: (problem: Problem) => void;
  isLoading?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}

function effectiveDifficulty(p: Problem): string | null {
  return p.difficulty ?? p.user_difficulty ?? null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DifficultyPip({ difficulty }: { difficulty: string | null }) {
  const color =
    difficulty === "easy" ? "var(--easy)"
    : difficulty === "medium" ? "var(--medium)"
    : difficulty === "hard" ? "var(--hard)"
    : "var(--text-muted)";
  const label = difficulty
    ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    : "—";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        fontWeight: 600,
        color,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}

function PlatformDot({ platform }: { platform: string }) {
  const color =
    platform === "leetcode" ? "var(--lc-color)"
    : platform === "codeforces" ? "var(--cf-color)"
    : "var(--text-muted)";
  const label =
    platform === "leetcode" ? "LC"
    : platform === "codeforces" ? "CF"
    : platform;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        fontFamily: "var(--font-mono)",
        color,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
        borderRadius: "var(--radius-pill)",
        padding: "2px 6px",
      }}
    >
      {label}
    </span>
  );
}

function ConfidenceDots({ confidence }: { confidence: string | null }) {
  const filledCls =
    confidence === "low" ? "filled-low"
    : confidence === "medium" ? "filled-medium"
    : confidence === "high" ? "filled-high"
    : "";
  const filled =
    confidence === "high" ? 3 : confidence === "medium" ? 2 : confidence === "low" ? 1 : 0;
  return (
    <div className="confidence-dots">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`confidence-dot ${i < filled ? filledCls : ""}`} />
      ))}
    </div>
  );
}

function SolveHelpIcon({ solveHelp }: { solveHelp: string | null }) {
  if (!solveHelp || solveHelp === "no_help") {
    return (
      <span title="No help">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--easy)" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  if (solveHelp === "hints") {
    return (
      <span title="Used hints" style={{ color: "var(--medium)" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
        </svg>
      </span>
    );
  }
  return (
    <span title="Saw solution" style={{ color: "var(--hard)" }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    </span>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="card"
      style={{
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 140,
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="skeleton" style={{ width: "65%", height: 15, borderRadius: 4, animationDelay: `${index * 60}ms` }} />
        <div className="skeleton" style={{ width: 24, height: 16, borderRadius: 10, animationDelay: `${index * 60 + 30}ms` }} />
      </div>
      {/* Tags row */}
      <div style={{ display: "flex", gap: 5 }}>
        <div className="skeleton" style={{ width: 48, height: 18, borderRadius: 10, animationDelay: `${index * 60 + 60}ms` }} />
        <div className="skeleton" style={{ width: 60, height: 18, borderRadius: 10, animationDelay: `${index * 60 + 90}ms` }} />
      </div>
      {/* Bottom row */}
      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between" }}>
        <div className="skeleton" style={{ width: 36, height: 12, borderRadius: 4, animationDelay: `${index * 60 + 120}ms` }} />
        <div className="skeleton" style={{ width: 56, height: 12, borderRadius: 4, animationDelay: `${index * 60 + 150}ms` }} />
      </div>
    </div>
  );
}

// ─── Single Card ──────────────────────────────────────────────────────────────

function ProblemCard({
  problem,
  index,
  onClick,
}: {
  problem: Problem;
  index: number;
  onClick: () => void;
}) {
  const diff = effectiveDifficulty(problem);

  // Left border accent color based on difficulty
  const accentColor =
    diff === "easy" ? "var(--easy)"
    : diff === "medium" ? "var(--medium)"
    : diff === "hard" ? "var(--hard)"
    : "var(--border-mid)";

  return (
    <div
      onClick={onClick}
      className="card animate-fade-in"
      style={{
        padding: 16,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        borderLeft: `3px solid ${accentColor}`,
        position: "relative",
        animationDelay: `${index * 25}ms`,
        transition: "transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
        minHeight: 130,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {/* ── Top: name + platform ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-primary)",
            lineHeight: 1.4,
            flex: 1,
          }}
        >
          {problem.problem_name}
        </span>
        <PlatformDot platform={problem.platform} />
      </div>

      {/* ── Pattern chip ── */}
      {problem.pattern && (
        <div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "var(--accent)",
              background: "var(--accent-muted)",
              border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
              borderRadius: "var(--radius-pill)",
              padding: "2px 8px",
            }}
          >
            {problem.pattern}
          </span>
        </div>
      )}

      {/* ── Tags ── */}
      {problem.tags && problem.tags.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {problem.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                color: "var(--text-muted)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-pill)",
                padding: "1px 6px",
              }}
            >
              {tag}
            </span>
          ))}
          {problem.tags.length > 3 && (
            <span style={{ fontSize: 10, color: "var(--text-muted)", padding: "1px 0" }}>
              +{problem.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Bottom row: difficulty + meta icons + date ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 8,
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <DifficultyPip difficulty={diff} />
          <ConfidenceDots confidence={problem.confidence} />
          <SolveHelpIcon solveHelp={problem.solve_help} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Needs revision dot */}
          {problem.needs_revision && (
            <span
              title="Needs revision"
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--medium)",
                flexShrink: 0,
              }}
            />
          )}
          <span
            className="text-data"
            style={{ fontSize: 11, color: "var(--text-muted)" }}
          >
            {formatDate(problem.solved_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Card Grid ────────────────────────────────────────────────────────────────

export function ProblemCardGrid({
  problems,
  onCardClick,
  isLoading = false,
}: ProblemCardGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 12,
      }}
    >
      {isLoading &&
        Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} index={i} />)}

      {!isLoading &&
        problems.map((p, i) => (
          <ProblemCard
            key={p.id}
            problem={p}
            index={i}
            onClick={() => onCardClick(p)}
          />
        ))}
    </div>
  );
}