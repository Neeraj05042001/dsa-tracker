"use client";

import { motion } from "framer-motion";
import { Problem } from "@/types";

interface ProblemCardGridProps {
  problems: Problem[];
  onCardClick: (problem: Problem) => void;
  isLoading?: boolean;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

function effectiveDifficulty(p: Problem): string | null {
  return p.difficulty ?? p.user_difficulty ?? null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDifficultyColor(diff: string | null) {
  if (diff === "easy") return "var(--easy)";
  if (diff === "medium") return "var(--medium)";
  if (diff === "hard") return "var(--hard)";
  return "var(--border-mid)";
}

function getPlatformColor(platform: string) {
  if (platform === "leetcode") return "var(--lc-color)";
  if (platform === "codeforces") return "var(--cf-color)";
  return "var(--text-muted)";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DifficultyPip({ difficulty }: { difficulty: string | null }) {
  const color = getDifficultyColor(difficulty);
  const label = difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : "—";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0, boxShadow: `0 0 4px ${color}` }} />
      {label}
    </span>
  );
}

function PlatformChip({ platform }: { platform: string }) {
  const color = getPlatformColor(platform);
  const label = platform === "leetcode" ? "LC" : platform === "codeforces" ? "CF" : platform;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)", color,
      background: `color-mix(in srgb, ${color} 14%, transparent)`,
      border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`,
      borderRadius: "var(--radius-pill)", padding: "2px 7px",
      letterSpacing: "0.03em",
    }}>
      {label}
    </span>
  );
}

function ConfidenceDots({ confidence }: { confidence: string | null }) {
  const filled = confidence === "high" ? 3 : confidence === "medium" ? 2 : confidence === "low" ? 1 : 0;
  const color = confidence === "high" ? "var(--easy)" : confidence === "medium" ? "var(--medium)" : "var(--hard)";
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          background: i < filled ? color : "var(--border-mid)",
          boxShadow: i < filled ? `0 0 5px ${color}` : "none",
          transition: "background 0.2s",
        }} />
      ))}
    </div>
  );
}

function SolveHelpIcon({ solveHelp }: { solveHelp: string | null }) {
  if (!solveHelp || solveHelp === "no_help") return (
    <span title="No help" style={{ display: "flex" }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--easy)" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
  if (solveHelp === "hints") return (
    <span title="Used hints" style={{ color: "var(--medium)", display: "flex" }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
      </svg>
    </span>
  );
  return (
    <span title="Saw solution" style={{ color: "var(--hard)", display: "flex" }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard({ index }: { index: number }) {
  return (
    <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, minHeight: 148 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="skeleton" style={{ width: "62%", height: 14, borderRadius: 4, animationDelay: `${index * 60}ms` }} />
        <div className="skeleton" style={{ width: 26, height: 16, borderRadius: 10, animationDelay: `${index * 60 + 30}ms` }} />
      </div>
      <div className="skeleton" style={{ width: "40%", height: 18, borderRadius: 10, animationDelay: `${index * 60 + 60}ms` }} />
      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border-subtle)" }}>
        <div className="skeleton" style={{ width: 48, height: 11, borderRadius: 4, animationDelay: `${index * 60 + 90}ms` }} />
        <div className="skeleton" style={{ width: 52, height: 11, borderRadius: 4, animationDelay: `${index * 60 + 120}ms` }} />
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function ProblemCard({ problem, index, onClick }: {
  problem: Problem; index: number; onClick: () => void;
}) {
  const diff = effectiveDifficulty(problem);
  const diffColor = getDifficultyColor(diff);
  const platformColor = getPlatformColor(problem.platform);

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.025, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -3,
        boxShadow: `0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px color-mix(in srgb, ${diffColor} 30%, transparent)`,
      }}
      style={{
        position: "relative",
        padding: "16px 16px 14px",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        overflow: "hidden",
        minHeight: 148,
        transition: "border-color 0.2s",
      }}
    >
      {/* Ambient glow blob — difficulty color, top-left */}
      <div style={{
        position: "absolute", top: -20, left: -20,
        width: 80, height: 80, borderRadius: "50%",
        background: diffColor, opacity: 0.06,
        filter: "blur(22px)", pointerEvents: "none",
      }} />

      {/* Top accent line — difficulty */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.55, delay: index * 0.025 + 0.08, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${diffColor} 0%, transparent 65%)`,
          transformOrigin: "left", opacity: 0.55,
        }}
      />

      {/* ── Top row: name + platform ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, justifyContent: "space-between" }}>
        <span style={{
          fontSize: 13, fontWeight: 600,
          color: "var(--text-primary)", lineHeight: 1.4, flex: 1,
        }}>
          {problem.problem_name}
        </span>
        <PlatformChip platform={problem.platform} />
      </div>

      {/* ── Pattern pill ── */}
      {problem.pattern && (
        <div>
          <motion.span
            whileHover={{ scale: 1.03 }}
            style={{
              display: "inline-block",
              fontSize: 11, fontWeight: 500,
              color: "var(--accent)",
              background: "var(--accent-muted)",
              border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
              borderRadius: "var(--radius-pill)", padding: "2px 9px",
              cursor: "default",
            }}
          >
            {problem.pattern.split(/[_\s]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
          </motion.span>
        </div>
      )}

      {/* ── Tags ── */}
      {problem.tags && problem.tags.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {problem.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{
              fontSize: 10, color: "var(--text-muted)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-pill)", padding: "2px 7px",
            }}>
              {tag}
            </span>
          ))}
          {problem.tags.length > 3 && (
            <span style={{ fontSize: 10, color: "var(--text-muted)", padding: "2px 0" }}>
              +{problem.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* ── Bottom row ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingTop: 10, borderTop: "1px solid var(--border-subtle)",
        marginTop: 2,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <DifficultyPip difficulty={diff} />
          <ConfidenceDots confidence={problem.confidence} />
          <SolveHelpIcon solveHelp={problem.solve_help} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {problem.needs_revision && (
            <span style={{
              fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const,
              letterSpacing: "0.06em", color: "var(--medium)",
              background: "color-mix(in srgb, var(--medium) 12%, transparent)",
              border: "1px solid color-mix(in srgb, var(--medium) 30%, transparent)",
              borderRadius: "var(--radius-pill)", padding: "1px 6px",
            }}>
              Review
            </span>
          )}
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            {formatDate(problem.solved_at)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

export function ProblemCardGrid({ problems, onCardClick, isLoading = false }: ProblemCardGridProps) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(265px, 1fr))",
      gap: 13,
    }}>
      {isLoading && Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} index={i} />)}
      {!isLoading && problems.map((p, i) => (
        <ProblemCard key={p.id} problem={p} index={i} onClick={() => onCardClick(p)} />
      ))}
    </div>
  );
}