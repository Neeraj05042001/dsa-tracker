
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Problem, SubmissionHistory } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProblemDetailProps {
  problem: Problem;
  submissions: SubmissionHistory[];
}

interface EditState {
  approach: string;
  mistakes: string;
  similar_problems: string;
  pattern: string;
  confidence: string;
  needs_revision: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}

function formatPattern(pattern: string | null | undefined): string {
  if (!pattern) return "—";
  return pattern
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function effectiveDifficulty(p: Problem): string | null {
  return p.difficulty ?? p.user_difficulty ?? null;
}

function confidenceLabel(c: string | null): string {
  if (!c) return "—";
  return c.charAt(0).toUpperCase() + c.slice(1);
}

function solveHelpLabel(s: string | null): string {
  if (!s) return "—";
  const map: Record<string, string> = {
    no_help: "No help",
    hints: "Used hints",
    saw_solution: "Saw solution",
  };
  return map[s] ?? s;
}

function timeTakenLabel(t: string | null): string {
  if (!t) return "—";
  const map: Record<string, string> = {
    "<15": "< 15 minutes",
    "15-30": "15–30 minutes",
    "30-60": "30–60 minutes",
    ">60": "> 60 minutes",
  };
  return map[t] ?? t;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-section-header" style={{ marginBottom: 10 }}>
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: "var(--border-subtle)",
        margin: "24px 0",
      }}
    />
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string | null }) {
  if (!difficulty)
    return <span style={{ color: "var(--text-muted)", fontSize: 13 }}>—</span>;
  const cls =
    difficulty === "easy"
      ? "badge badge-easy"
      : difficulty === "medium"
        ? "badge badge-medium"
        : "badge badge-hard";
  return (
    <span className={cls}>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
  const cls =
    platform === "leetcode"
      ? "badge badge-lc"
      : platform === "codeforces"
        ? "badge badge-cf"
        : "badge";
  const label =
    platform === "leetcode"
      ? "LeetCode"
      : platform === "codeforces"
        ? "Codeforces"
        : platform;
  return <span className={cls}>{label}</span>;
}

function ConfidenceDots({ confidence }: { confidence: string | null }) {
  const color =
    confidence === "low"
      ? "var(--hard)"
      : confidence === "medium"
        ? "var(--medium)"
        : confidence === "high"
          ? "var(--easy)"
          : "var(--border-mid)";
  const filled =
    confidence === "high"
      ? 3
      : confidence === "medium"
        ? 2
        : confidence === "low"
          ? 1
          : 0;
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: i < filled ? color : "var(--border-mid)",
            border: `1px solid ${i < filled ? color : "var(--border-subtle)"}`,
          }}
        />
      ))}
    </div>
  );
}

// Meta card — used for Confidence, Help, Time row
function MetaCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <span className="text-section-header">{label}</span>
      <div>{children}</div>
    </div>
  );
}

// Editable textarea field
function EditTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: "100%",
        padding: "10px 12px",
        background: "var(--bg-elevated)",
        border: "1px solid var(--accent)",
        borderRadius: "var(--radius-md)",
        color: "var(--text-primary)",
        fontSize: 13,
        lineHeight: 1.6,
        resize: "vertical",
        outline: "none",
        fontFamily: "var(--font-sans)",
        boxSizing: "border-box",
        transition: "border-color 0.15s",
      }}
      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--border-mid)")}
    />
  );
}

// Confidence chip selector for edit mode
function ConfidenceSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const options = [
    { value: "low", label: "Low", color: "var(--hard)" },
    { value: "medium", label: "Medium", color: "var(--medium)" },
    { value: "high", label: "High", color: "var(--easy)" },
  ];
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={{
            padding: "4px 14px",
            borderRadius: "var(--radius-pill)",
            border: `1px solid ${value === opt.value ? opt.color : "var(--border-mid)"}`,
            background:
              value === opt.value
                ? `color-mix(in srgb, ${opt.color} 15%, transparent)`
                : "transparent",
            color: value === opt.value ? opt.color : "var(--text-muted)",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.12s",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// Submission history timeline entry
function SubmissionEntry({
  submission,
  index,
  total,
}: {
  submission: SubmissionHistory & { confidence?: string | null };
  index: number;
  total: number;
}) {
  const isLatest = index === 0;
  const confidenceColor =
    submission.confidence === "low"
      ? "var(--hard)"
      : submission.confidence === "medium"
        ? "var(--medium)"
        : submission.confidence === "high"
          ? "var(--easy)"
          : "var(--border-mid)";

  return (
    <div style={{ display: "flex", gap: 12, position: "relative" }}>
      {/* Timeline line */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: isLatest ? "var(--accent)" : "var(--border-mid)",
            border: `2px solid ${isLatest ? "var(--accent)" : "var(--border-subtle)"}`,
            marginTop: 3,
            flexShrink: 0,
            boxShadow: isLatest ? "0 0 8px rgba(0,212,170,0.4)" : "none",
          }}
        />
        {index < total - 1 && (
          <div
            style={{
              width: 1,
              flex: 1,
              background: "var(--border-subtle)",
              minHeight: 24,
              marginTop: 4,
            }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: index < total - 1 ? 20 : 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: isLatest ? "var(--text-primary)" : "var(--text-muted)",
              fontWeight: isLatest ? 600 : 400,
            }}
          >
            {formatDateShort(submission.submitted_at)}
            {isLatest && (
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 10,
                  color: "var(--accent)",
                  fontWeight: 600,
                  background: "var(--accent-muted)",
                  padding: "1px 6px",
                  borderRadius: "var(--radius-pill)",
                }}
              >
                latest
              </span>
            )}
          </span>
          {submission.confidence && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <ConfidenceDots confidence={submission.confidence} />
              <span
                style={{
                  fontSize: 11,
                  color: confidenceColor,
                  fontWeight: 500,
                }}
              >
                {confidenceLabel(submission.confidence)}
              </span>
            </div>
          )}
        </div>

        {/* Runtime / Memory / Language chips */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {submission.language && (
            <span
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "var(--text-muted)",
                background: "var(--bg-hover)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "2px 8px",
              }}
            >
              {submission.language}
            </span>
          )}
          {submission.runtime && (
            <span
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "var(--text-muted)",
                background: "var(--bg-hover)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "2px 8px",
              }}
            >
              ⏱ {submission.runtime}
            </span>
          )}
          {submission.memory && (
            <span
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "var(--text-muted)",
                background: "var(--bg-hover)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "2px 8px",
              }}
            >
              ⬡ {submission.memory}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Confidence trend — only shown if multiple submissions with confidence
function ConfidenceTrend({
  submissions,
}: {
  submissions: (SubmissionHistory & { confidence?: string | null })[];
}) {
  const withConfidence = [...submissions]
    .reverse() // oldest first
    .filter((s) => s.confidence);

  if (withConfidence.length < 2) return null;

  const arrowColor = (c: string | null) =>
    c === "high"
      ? "var(--easy)"
      : c === "medium"
        ? "var(--medium)"
        : c === "low"
          ? "var(--hard)"
          : "var(--text-muted)";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 12px",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        marginBottom: 16,
        flexWrap: "wrap",
      }}
    >
      <span
        style={{ fontSize: 11, color: "var(--text-muted)", marginRight: 4 }}
      >
        Progress:
      </span>
      {withConfidence.map((s, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: arrowColor(s.confidence ?? null),
            }}
          >
            {confidenceLabel(s.confidence ?? null)}
          </span>
          {i < withConfidence.length - 1 && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-subtle)"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </span>
      ))}
    </div>
  );
}
// -------------------

// ─── SM2 Human Readable ───────────────────────────────────────────────────────

function formatNextReviewHuman(nextReview: string | null, repetitions: number): {
  label: string;
  sublabel: string;
  color: string;
} {
  if (!nextReview || repetitions === 0) {
    return {
      label: "Not reviewed yet",
      sublabel: "Will schedule after first review session",
      color: "var(--text-muted)",
    };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reviewDate = new Date(nextReview);
  reviewDate.setHours(0, 0, 0, 0);
  const diffDays = Math.round((reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return {
    label: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""}`,
    sublabel: "Should have been reviewed — open Revision queue",
    color: "var(--hard)",
  };
  if (diffDays === 0) return {
    label: "Due today",
    sublabel: "Open the Revision queue to review now",
    color: "var(--medium)",
  };
  if (diffDays === 1) return {
    label: "Due tomorrow",
    sublabel: "Review scheduled for tomorrow",
    color: "var(--medium)",
  };
  return {
    label: `In ${diffDays} days`,
    sublabel: `Scheduled for ${new Date(nextReview).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`,
    color: "var(--easy)",
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────




// ─── Main Component ───────────────────────────────────────────────────────────

export function ProblemDetail({ problem, submissions }: ProblemDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  const [edit, setEdit] = useState<EditState>({
    approach: problem.approach ?? "",
    mistakes: problem.mistakes ?? "",
    similar_problems: problem.similar_problems ?? "",
    pattern: problem.pattern ?? "",
    confidence: problem.confidence ?? "",
    needs_revision: problem.needs_revision ?? false,
  });

  // Optimistic — update local state immediately on save
  const [localProblem, setLocalProblem] = useState(problem);

  const diff = effectiveDifficulty(localProblem);

  function handleEdit() {
    setEdit({
      approach: localProblem.approach ?? "",
      mistakes: localProblem.mistakes ?? "",
      similar_problems: localProblem.similar_problems ?? "",
      pattern: localProblem.pattern ?? "",
      confidence: localProblem.confidence ?? "",
      needs_revision: localProblem.needs_revision ?? false,
    });
    setIsEditing(true);
    setSaveError(null);
  }

  function handleCancel() {
    setIsEditing(false);
    setSaveError(null);
  }

  function handleSave() {
    setSaveError(null);
    startTransition(async () => {
      try {
        // const updated = await updateProblem(localProblem.problem_key, {
        //   approach: edit.approach.trim() || null,
        //   mistakes: edit.mistakes.trim() || null,
        //   similar_problems: edit.similar_problems.trim() || null,
        //   pattern: edit.pattern.trim() || null,
        //   confidence: (edit.confidence as Problem["confidence"]) || null,
        //   needs_revision: edit.needs_revision,
        // });

        const res = await fetch("/api/problems/update", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problem_key: localProblem.problem_key,
            updates: {
              approach: edit.approach.trim() || null,
              mistakes: edit.mistakes.trim() || null,
              similar_problems: edit.similar_problems.trim() || null,
              pattern: edit.pattern.trim() || null,
              confidence: (edit.confidence as Problem["confidence"]) || null,
              needs_revision: edit.needs_revision,
            },
          }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        const updated = json.problem;
        setLocalProblem(updated);
        setIsEditing(false);
      } catch (e) {
        setSaveError("Failed to save. Please try again.");
      }
    });
  }

  return (
    <div>
      {/* ── Breadcrumb + actions ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Link
          href="/dashboard/problems"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--text-muted)",
            textDecoration: "none",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-primary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-muted)")
          }
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Problems
        </Link>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {localProblem.needs_revision && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--medium)",
                background:
                  "color-mix(in srgb, var(--medium) 12%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--medium) 25%, transparent)",
                borderRadius: "var(--radius-pill)",
                padding: "3px 10px",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Needs Revision
            </span>
          )}

          {localProblem.problem_url && (
            <a
              href={localProblem.problem_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Open on{" "}
              {localProblem.platform === "leetcode" ? "LeetCode" : "Codeforces"}
            </a>
          )}

          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="btn btn-ghost"
              style={{
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
          ) : (
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={handleCancel}
                className="btn btn-ghost"
                style={{ fontSize: 12 }}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary"
                style={{
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
                disabled={isPending}
              >
                {isPending ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      {saveError && (
        <div
          style={{
            padding: "10px 14px",
            background: "color-mix(in srgb, var(--hard) 12%, transparent)",
            border:
              "1px solid color-mix(in srgb, var(--hard) 25%, transparent)",
            borderRadius: "var(--radius-md)",
            color: "var(--hard)",
            fontSize: 13,
            marginBottom: 20,
          }}
        >
          {saveError}
        </div>
      )}

      {/* ── Two column layout ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* ════ LEFT COLUMN ════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Problem header card */}
          <div
            className="card"
            style={{ padding: "20px 24px", marginBottom: 16 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    margin: "0 0 10px",
                    lineHeight: 1.3,
                  }}
                >
                  {localProblem.problem_name}
                </h1>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <PlatformBadge platform={localProblem.platform} />
                  <DifficultyBadge difficulty={diff} />
                  {localProblem.cf_rating && (
                    <span
                      style={{
                        fontSize: 12,
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {localProblem.cf_rating}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            {localProblem.tags && localProblem.tags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 5,
                  flexWrap: "wrap",
                  marginTop: 12,
                }}
              >
                {localProblem.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-pill)",
                      padding: "2px 8px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Pattern */}
            {(localProblem.pattern || isEditing) && (
              <div style={{ marginTop: 12 }}>
                {isEditing ? (
                  <div>
                    <span
                      className="text-section-header"
                      style={{ display: "block", marginBottom: 6 }}
                    >
                      Pattern
                    </span>
                    <input
                      type="text"
                      value={edit.pattern}
                      onChange={(e) =>
                        setEdit((prev) => ({
                          ...prev,
                          pattern: e.target.value,
                        }))
                      }
                      placeholder="e.g. sliding_window"
                      style={{
                        width: "100%",
                        height: 32,
                        padding: "0 10px",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--accent)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-primary)",
                        fontSize: 13,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                ) : (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--accent)",
                      background: "var(--accent-muted)",
                      border:
                        "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
                      borderRadius: "var(--radius-pill)",
                      padding: "3px 10px",
                      display: "inline-block",
                      marginTop: 4,
                    }}
                  >
                    {formatPattern(localProblem.pattern)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Meta row — Confidence, Help, Time */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <MetaCard label="Confidence">
              {isEditing ? (
                <ConfidenceSelector
                  value={edit.confidence}
                  onChange={(v) =>
                    setEdit((prev) => ({ ...prev, confidence: v }))
                  }
                />
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ConfidenceDots confidence={localProblem.confidence} />
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--text-primary)",
                      fontWeight: 500,
                    }}
                  >
                    {confidenceLabel(localProblem.confidence)}
                  </span>
                </div>
              )}
            </MetaCard>

            <MetaCard label="Help Used">
              <span
                style={{
                  fontSize: 13,
                  color:
                    localProblem.solve_help === "no_help"
                      ? "var(--easy)"
                      : localProblem.solve_help === "hints"
                        ? "var(--medium)"
                        : localProblem.solve_help === "saw_solution"
                          ? "var(--hard)"
                          : "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                {solveHelpLabel(localProblem.solve_help)}
              </span>
            </MetaCard>

            <MetaCard label="Time Taken">
              <span
                style={{
                  fontSize: 13,
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-primary)",
                }}
              >
                {timeTakenLabel(localProblem.time_taken)}
              </span>
            </MetaCard>
          </div>

          {/* Needs Revision toggle — only in edit mode */}
          {isEditing && (
            <div
              className="card"
              style={{
                padding: "14px 16px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text-primary)",
                  }}
                >
                  Needs Revision
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  Flag this problem for the revision queue
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEdit((prev) => ({
                    ...prev,
                    needs_revision: !prev.needs_revision,
                  }))
                }
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: "var(--radius-pill)",
                  border: "none",
                  background: edit.needs_revision
                    ? "var(--accent)"
                    : "var(--bg-hover)",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.2s",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 3,
                    left: edit.needs_revision ? 20 : 3,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "white",
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  }}
                />
              </button>
            </div>
          )}

          {/* Approach */}
          <div
            className="card"
            style={{ padding: "20px 24px", marginBottom: 16 }}
          >
            <SectionLabel>Approach</SectionLabel>
            {isEditing ? (
              <EditTextarea
                value={edit.approach}
                onChange={(v) => setEdit((prev) => ({ ...prev, approach: v }))}
                placeholder="How did you approach this problem? What data structures / algorithm did you use?"
                rows={4}
              />
            ) : localProblem.approach ? (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  margin: 0,
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                }}
              >
                {localProblem.approach}
              </p>
            ) : (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  margin: 0,
                  fontStyle: "italic",
                }}
              >
                No approach notes yet.{" "}
                <button
                  onClick={handleEdit}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent)",
                    cursor: "pointer",
                    fontSize: 13,
                    padding: 0,
                  }}
                >
                  Add one →
                </button>
              </p>
            )}
          </div>

          {/* Mistakes */}
          <div
            className="card"
            style={{ padding: "20px 24px", marginBottom: 16 }}
          >
            <SectionLabel>Mistakes / Gotchas</SectionLabel>
            {isEditing ? (
              <EditTextarea
                value={edit.mistakes}
                onChange={(v) => setEdit((prev) => ({ ...prev, mistakes: v }))}
                placeholder="What did you get wrong? What edge cases caught you out?"
                rows={3}
              />
            ) : localProblem.mistakes ? (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  margin: 0,
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                }}
              >
                {localProblem.mistakes}
              </p>
            ) : (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  margin: 0,
                  fontStyle: "italic",
                }}
              >
                None noted.
              </p>
            )}
          </div>

          {/* Similar Problems */}
          {(localProblem.similar_problems || isEditing) && (
            <div className="card" style={{ padding: "20px 24px" }}>
              <SectionLabel>Similar Problems</SectionLabel>
              {isEditing ? (
                <EditTextarea
                  value={edit.similar_problems}
                  onChange={(v) =>
                    setEdit((prev) => ({ ...prev, similar_problems: v }))
                  }
                  placeholder="e.g. Three Sum, Container With Most Water"
                  rows={2}
                />
              ) : (
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    margin: 0,
                    lineHeight: 1.7,
                  }}
                >
                  {localProblem.similar_problems}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ════ RIGHT COLUMN ════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* SM2 Card */}
          

          {/* SM2 Card — human readable */}
          <div className="card" style={{ padding: "20px 24px" }}>
            <SectionLabel>Spaced Repetition</SectionLabel>
            {(() => {
              const reps = localProblem.sm2_repetitions ?? 0;
              const { label, sublabel, color } = formatNextReviewHuman(
                localProblem.sm2_next_review,
                reps,
              );
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Next review status */}
                  <div
                    style={{
                      padding: "12px 14px",
                      background: `color-mix(in srgb, ${color} 8%, var(--bg-elevated))`,
                      border: `1px solid color-mix(in srgb, ${color} 22%, var(--border-subtle))`,
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 700, color, display: "block", marginBottom: 3 }}>
                      {label}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {sublabel}
                    </span>
                  </div>

                  {/* Reviewed count + interval — only when reviewed at least once */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <span className="text-section-header" style={{ display: "block", marginBottom: 4 }}>
                        Reviews Done
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: reps > 0 ? "var(--accent)" : "var(--text-muted)" }}>
                        {reps > 0 ? `${reps}×` : "None yet"}
                      </span>
                    </div>
                    <div>
                      <span className="text-section-header" style={{ display: "block", marginBottom: 4 }}>
                        Review Interval
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: reps > 0 ? "var(--text-primary)" : "var(--text-muted)" }}>
                        {reps > 0 ? `Every ${localProblem.sm2_interval ?? 1} day${(localProblem.sm2_interval ?? 1) !== 1 ? "s" : ""}` : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Submission history */}
          <div className="card" style={{ padding: "20px 24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <SectionLabel>Submission History</SectionLabel>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--text-muted)",
                }}
              >
                {submissions.length} attempt
                {submissions.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Confidence trend — only if multiple submissions with confidence */}
            <ConfidenceTrend submissions={submissions} />

            {submissions.length === 0 ? (
              <p
                style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}
              >
                No submission history found.
              </p>
            ) : (
              <div>
                {submissions.map((s, i) => (
                  <SubmissionEntry
                    key={s.id}
                    submission={s}
                    index={i}
                    total={submissions.length}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Metadata footer */}
          <div
            style={{
              padding: "12px 16px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-muted)",
              }}
            >
              key: {localProblem.problem_key}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-muted)",
              }}
            >
              solved: {formatDate(localProblem.solved_at)}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-muted)",
              }}
            >
              added: {formatDateShort(localProblem.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
