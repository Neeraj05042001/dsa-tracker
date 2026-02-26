"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Problem } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProblemDrawerProps {
  problem: Problem | null;
  open: boolean;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateShort(dateStr: string | null): string {
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

function formatPattern(pattern: string | null): string | null {
  if (!pattern) return null;
  return pattern
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-section-header"
      style={{ marginBottom: 8 }}
    >
      {children}
    </div>
  );
}

function MetaValue({ children, mono = false }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <span
      style={{
        fontSize: 13,
        color: "var(--text-primary)",
        fontFamily: mono ? "var(--font-mono)" : undefined,
      }}
    >
      {children}
    </span>
  );
}

function EmptyValue() {
  return <span style={{ fontSize: 13, color: "var(--text-muted)" }}>—</span>;
}

function DifficultyBadge({ difficulty }: { difficulty: string | null }) {
  if (!difficulty) return <EmptyValue />;
  const cls =
    difficulty === "easy" ? "badge badge-easy"
    : difficulty === "medium" ? "badge badge-medium"
    : "badge badge-hard";
  return <span className={cls}>{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>;
}

function PlatformBadge({ platform }: { platform: string }) {
  const cls = platform === "leetcode" ? "badge badge-lc"
    : platform === "codeforces" ? "badge badge-cf"
    : "badge";
  const label = platform === "leetcode" ? "LeetCode" : platform === "codeforces" ? "Codeforces" : platform;
  return <span className={cls}>{label}</span>;
}

function ConfidenceDots({ confidence }: { confidence: string | null }) {
  const filledCls =
    confidence === "low" ? "filled-low"
    : confidence === "medium" ? "filled-medium"
    : confidence === "high" ? "filled-high"
    : "";
  const filled = confidence === "high" ? 3 : confidence === "medium" ? 2 : confidence === "low" ? 1 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div className="confidence-dots">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`confidence-dot ${i < filled ? filledCls : ""}`} />
        ))}
      </div>
      {confidence && (
        <span style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "capitalize" }}>
          {confidence}
        </span>
      )}
    </div>
  );
}

function SolveHelpRow({ solveHelp }: { solveHelp: string | null }) {
  if (!solveHelp) return <EmptyValue />;
  const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    no_help: {
      label: "No help",
      color: "var(--easy)",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    hints: {
      label: "Used hints",
      color: "var(--medium)",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
        </svg>
      ),
    },
    saw_solution: {
      label: "Saw solution",
      color: "var(--hard)",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
  };
  const item = map[solveHelp] ?? map.no_help;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: item.color, fontSize: 13 }}>
      {item.icon}
      {item.label}
    </span>
  );
}

function TimeTakenRow({ timeTaken }: { timeTaken: string | null }) {
  if (!timeTaken) return <EmptyValue />;
  const map: Record<string, string> = {
    "<15": "< 15 minutes",
    "15-30": "15–30 minutes",
    "30-60": "30–60 minutes",
    ">60": "> 60 minutes",
  };
  return <MetaValue mono>{map[timeTaken] ?? timeTaken}</MetaValue>;
}

function SM2Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--border-subtle)", margin: "20px 0" }} />;
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────

export function ProblemDrawer({ problem, open, onClose }: ProblemDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Trap scroll on body when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(2px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* ── Drawer panel ── */}
      <div
        ref={drawerRef}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          width: "min(480px, 100vw)",
          background: "var(--bg-surface)",
          borderLeft: "1px solid var(--border-mid)",
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
          boxShadow: open ? "-24px 0 80px rgba(0,0,0,0.4)" : "none",
          overflowY: "auto",
        }}
      >
        {problem && (
          <>
            {/* ── Header ── */}
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                background: "var(--bg-surface)",
                borderBottom: "1px solid var(--border-subtle)",
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: 12,
                  cursor: "pointer",
                  padding: "4px 0",
                  transition: "color 0.15s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Close
              </button>

              {/* Open full page link */}
              <Link
                href={`/dashboard/problems/${problem.problem_key}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--accent)",
                  textDecoration: "none",
                  flexShrink: 0,
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Open full page
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </div>

            {/* ── Body ── */}
            <div style={{ padding: "24px 20px", flex: 1 }}>

              {/* ── Title block ── */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  {/* Needs revision badge */}
                  {problem.needs_revision && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--medium)",
                        background: "color-mix(in srgb, var(--medium) 12%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--medium) 30%, transparent)",
                        borderRadius: "var(--radius-pill)",
                        padding: "2px 7px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      Needs Revision
                    </span>
                  )}
                </div>

                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    lineHeight: 1.3,
                    margin: "0 0 10px 0",
                  }}
                >
                  {problem.problem_name}
                </h2>

                {/* Platform + Difficulty row */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <PlatformBadge platform={problem.platform} />
                  <DifficultyBadge difficulty={effectiveDifficulty(problem)} />
                  {problem.cf_rating && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--cf-color)",
                        background: "color-mix(in srgb, var(--cf-color) 10%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--cf-color) 25%, transparent)",
                        borderRadius: "var(--radius-pill)",
                        padding: "2px 7px",
                      }}
                    >
                      {problem.cf_rating}
                    </span>
                  )}
                </div>

                {/* Problem URL */}
                {problem.problem_url && (
                  <a
                    href={problem.problem_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      marginTop: 10,
                      fontSize: 12,
                      color: "var(--text-muted)",
                      textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    View problem
                  </a>
                )}
              </div>

              <Divider />

              {/* ── Quick stats row ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                {/* Confidence */}
                <div
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 6 }}>
                    Confidence
                  </div>
                  <ConfidenceDots confidence={problem.confidence} />
                </div>

                {/* Solve help */}
                <div
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 6 }}>
                    Help used
                  </div>
                  <SolveHelpRow solveHelp={problem.solve_help} />
                </div>

                {/* Time taken */}
                <div
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 6 }}>
                    Time taken
                  </div>
                  <TimeTakenRow timeTaken={problem.time_taken} />
                </div>
              </div>

              {/* ── Approach ── */}
              <div style={{ marginBottom: 20 }}>
                <SectionLabel>Approach</SectionLabel>
                {problem.approach ? (
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                      margin: 0,
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "10px 12px",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {problem.approach}
                  </p>
                ) : (
                  <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>
                    No approach noted.
                  </p>
                )}
              </div>

              {/* ── Mistakes ── */}
              {problem.mistakes != null && (
                <div style={{ marginBottom: 20 }}>
                  <SectionLabel>Mistakes / Gotchas</SectionLabel>
                  {problem.mistakes ? (
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        lineHeight: 1.6,
                        margin: 0,
                        background: "color-mix(in srgb, var(--hard) 6%, var(--bg-elevated))",
                        border: "1px solid color-mix(in srgb, var(--hard) 15%, transparent)",
                        borderRadius: "var(--radius-md)",
                        padding: "10px 12px",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {problem.mistakes}
                    </p>
                  ) : (
                    <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>None noted.</p>
                  )}
                </div>
              )}

              {/* ── Pattern + Tags ── */}
              <div style={{ marginBottom: 20 }}>
                <SectionLabel>Pattern & Tags</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {problem.pattern && (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--accent)",
                        background: "var(--accent-muted)",
                        border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
                        borderRadius: "var(--radius-pill)",
                        padding: "3px 10px",
                      }}
                    >
                      {formatPattern(problem.pattern)}
                    </span>
                  )}
                  {problem.tags?.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-pill)",
                        padding: "3px 10px",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  {!problem.pattern && (!problem.tags || problem.tags.length === 0) && (
                    <EmptyValue />
                  )}
                </div>
              </div>

              {/* ── Similar problems ── */}
              {problem.similar_problems && (
                <div style={{ marginBottom: 20 }}>
                  <SectionLabel>Similar Problems</SectionLabel>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                    {problem.similar_problems}
                  </p>
                </div>
              )}

              <Divider />

              {/* ── SM2 block ── */}
              <div style={{ marginBottom: 20 }}>
                <SectionLabel>Spaced Repetition</SectionLabel>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "14px 16px",
                  }}
                >
                  <SM2Row
                    label="Next review"
                    value={problem.sm2_next_review ? formatDateShort(problem.sm2_next_review) : "Not scheduled"}
                  />
                  <SM2Row
                    label="Interval"
                    value={problem.sm2_interval ? `${problem.sm2_interval}d` : "1d"}
                  />
                  <SM2Row
                    label="Repetitions"
                    value={problem.sm2_repetitions ?? 0}
                  />
                  <SM2Row
                    label="Ease factor"
                    value={(problem.sm2_ease_factor ?? 2.5).toFixed(2)}
                  />
                </div>
              </div>

              <Divider />

              {/* ── Submission info ── */}
              <div style={{ marginBottom: 20 }}>
                <SectionLabel>Submission</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {/* Language / Runtime / Memory row */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {problem.language && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          fontFamily: "var(--font-mono)",
                          color: "var(--text-secondary)",
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-sm)",
                          padding: "4px 10px",
                        }}
                      >
                        {/* Code icon */}
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polyline points="16 18 22 12 16 6" />
                          <polyline points="8 6 2 12 8 18" />
                        </svg>
                        {problem.language}
                      </span>
                    )}
                    {problem.runtime && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          fontFamily: "var(--font-mono)",
                          color: "var(--text-secondary)",
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-sm)",
                          padding: "4px 10px",
                        }}
                      >
                        {/* Clock icon */}
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {problem.runtime}
                      </span>
                    )}
                    {problem.memory && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          fontFamily: "var(--font-mono)",
                          color: "var(--text-secondary)",
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-sm)",
                          padding: "4px 10px",
                        }}
                      >
                        {/* Database icon */}
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <ellipse cx="12" cy="5" rx="9" ry="3" />
                          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                        </svg>
                        {problem.memory}
                      </span>
                    )}
                    {!problem.language && !problem.runtime && !problem.memory && (
                      <EmptyValue />
                    )}
                  </div>

                  {/* Solved date */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                      Solved
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)" }}>
                      {formatDate(problem.solved_at)}
                    </span>
                  </div>

                  {/* Submission URL */}
                  {problem.submission_url && (
                    <a
                      href={problem.submission_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12,
                        color: "var(--text-muted)",
                        textDecoration: "none",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      View submission
                    </a>
                  )}
                </div>
              </div>

              {/* ── Metadata footer ── */}
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  paddingTop: 16,
                  borderTop: "1px solid var(--border-subtle)",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
                  key: {problem.problem_key}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
                  added {formatDateShort(problem.created_at)}
                </span>
              </div>

            </div>
          </>
        )}
      </div>
    </>
  );
}