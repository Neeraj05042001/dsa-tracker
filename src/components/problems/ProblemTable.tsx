"use client";

import { Problem, SortField, SortDirection, TableSortState } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProblemTableProps {
  problems: Problem[];
  sort: TableSortState;
  onSort: (field: SortField) => void;
  onRowClick: (problem: Problem) => void;
  isLoading?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
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

function DifficultyBadge({ difficulty }: { difficulty: string | null }) {
  if (!difficulty)
    return <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>;
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
      ? "LC"
      : platform === "codeforces"
        ? "CF"
        : platform;
  return <span className={cls}>{label}</span>;
}

function ConfidenceDots({ confidence }: { confidence: string | null }) {
  const filledCls =
    confidence === "low"
      ? "filled-low"
      : confidence === "medium"
        ? "filled-medium"
        : confidence === "high"
          ? "filled-high"
          : "";

  const filled =
    confidence === "high"
      ? 3
      : confidence === "medium"
        ? 2
        : confidence === "low"
          ? 1
          : 0;

  return (
    <div className="confidence-dots">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`confidence-dot ${i < filled ? filledCls : ""}`}
        />
      ))}
    </div>
  );
}

function SolveHelpIcon({ solveHelp }: { solveHelp: string | null }) {
  if (!solveHelp || solveHelp === "no_help") {
    return (
      <span title="No help needed">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--easy)"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  if (solveHelp === "hints") {
    return (
      <span title="Used hints" style={{ color: "var(--medium)" }}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
        </svg>
      </span>
    );
  }
  // saw_solution
  // saw_solution — distinct X icon, not the same as hints
  return (
    <span title="Saw solution" style={{ color: "var(--hard)" }}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    </span>
  );
}

function TimeTakenLabel({ timeTaken }: { timeTaken: string | null }) {
  if (!timeTaken) return <span style={{ color: "var(--text-muted)" }}>—</span>;
  const map: Record<string, string> = {
    "<15": "< 15m",
    "15-30": "15–30m",
    "30-60": "30–60m",
    ">60": "> 60m",
  };
  return (
    <span
      className="text-data"
      style={{ color: "var(--text-secondary)", fontSize: 12 }}
    >
      {map[timeTaken] ?? timeTaken}
    </span>
  );
}

// ─── Sort Header Cell ─────────────────────────────────────────────────────────

function SortTh({
  field,
  label,
  current,
  onSort,
  align = "left",
}: {
  field: SortField;
  label: string;
  current: TableSortState;
  onSort: (field: SortField) => void;
  align?: "left" | "right" | "center";
}) {
  const isActive = current.field === field;
  const dir = current.direction;

  return (
    <th
      onClick={() => onSort(field)}
      style={{
        padding: "8px 12px",
        textAlign: align,
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: isActive ? "var(--accent)" : "var(--text-muted)",
          transition: "color 0.15s",
        }}
      >
        {label}
        <span
          style={{
            display: "inline-flex",
            flexDirection: "column",
            gap: 1,
            opacity: isActive ? 1 : 0.3,
          }}
        >
          <svg
            width="7"
            height="5"
            viewBox="0 0 7 5"
            fill={
              isActive && dir === "asc" ? "var(--accent)" : "var(--text-muted)"
            }
          >
            <polygon points="3.5,0 7,5 0,5" />
          </svg>
          <svg
            width="7"
            height="5"
            viewBox="0 0 7 5"
            fill={
              isActive && dir === "desc" ? "var(--accent)" : "var(--text-muted)"
            }
          >
            <polygon points="3.5,5 7,0 0,0" />
          </svg>
        </span>
      </span>
    </th>
  );
}

function StaticTh({
  label,
  align = "left",
}: {
  label: string;
  align?: "left" | "right" | "center";
}) {
  return (
    <th
      style={{
        padding: "8px 12px",
        textAlign: align,
        whiteSpace: "nowrap",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--text-muted)",
        }}
      >
        {label}
      </span>
    </th>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow({ index }: { index: number }) {
  const widths = [140, 28, 55, 90, 40, 28, 50, 60];
  return (
    <tr>
      {/* # */}
      <td style={{ padding: "10px 12px" }}>
        <div
          className="skeleton"
          style={{ width: 20, height: 12, borderRadius: 4 }}
        />
      </td>
      {widths.map((w, i) => (
        <td key={i} style={{ padding: "10px 12px" }}>
          <div
            className="skeleton"
            style={{
              width: w,
              height: 14,
              borderRadius: 4,
              animationDelay: `${(index * 8 + i) * 40}ms`,
            }}
          />
        </td>
      ))}
      {/* Actions */}
      <td style={{ padding: "10px 12px" }}>
        <div
          className="skeleton"
          style={{ width: 20, height: 20, borderRadius: 6 }}
        />
      </td>
    </tr>
  );
}

// ─── Main Table ───────────────────────────────────────────────────────────────

export function ProblemTable({
  problems,
  sort,
  onSort,
  onRowClick,
  isLoading = false,
}: ProblemTableProps) {
  return (
    <div
      style={{
        overflowX: "auto",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "auto",
        }}
      >
        {/* ── Head ── */}
        <thead style={{ background: "var(--bg-elevated)" }}>
          <tr>
            {/* Row # */}
            <th
              style={{
                padding: "8px 12px",
                textAlign: "right",
                width: 40,
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted)",
                }}
              >
                #
              </span>
            </th>

            <SortTh
              field="problem_name"
              label="Problem"
              current={sort}
              onSort={onSort}
            />
            <StaticTh label="Platform" align="center" />
            <SortTh
              field="difficulty"
              label="Difficulty"
              current={sort}
              onSort={onSort}
              align="center"
            />
            <StaticTh label="Pattern" />
            {/* <SortTh
              field="confidence"
              label="Conf."
              current={sort}
              onSort={onSort}
              align="center"
            /> */}
             <th
              onClick={() => onSort("confidence")}
              title="Confidence: ● Low  ●● Medium  ●●● High"
              style={{
                padding: "8px 12px",
                textAlign: "center",
                cursor: "pointer",
                userSelect: "none",
                whiteSpace: "nowrap",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase" as const,
                letterSpacing: "0.06em",
                color: sort.field === "confidence" ? "var(--accent)" : "var(--text-muted)",
                transition: "color 0.15s",
                borderBottom: "1px dashed var(--border-mid)",
                paddingBottom: 1,
              }}>
                Conf.
              </span>
            </th>
            <StaticTh label="Help" align="center" />
            <StaticTh label="Time" align="center" />
            <SortTh
              field="solved_at"
              label="Solved"
              current={sort}
              onSort={onSort}
              align="right"
            />
            {/* Actions — no header text */}
            <th
              style={{
                width: 36,
                borderBottom: "1px solid var(--border-subtle)",
              }}
            />
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody>
          {/* Loading state */}
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => (
              <SkeletonRow key={i} index={i} />
            ))}

          {/* Empty state handled by parent, but as a safety net: */}
          {!isLoading && problems.length === 0 && (
            <tr>
              <td
                colSpan={10}
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontSize: 13,
                }}
              >
                No problems found.
              </td>
            </tr>
          )}

          {/* Data rows */}
          {!isLoading &&
            problems.map((p, idx) => {
              const diff = effectiveDifficulty(p);
              return (
                <tr
                  key={p.id}
                  onClick={() => onRowClick(p)}
                  className="animate-fade-in"
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid var(--border-subtle)",
                    transition: "background 0.12s ease",
                    animationDelay: `${idx * 20}ms`,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {/* Row number */}
                  <td
                    style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--text-muted)",
                    }}
                  >
                    {idx + 1}
                  </td>

                  {/* Problem name */}
                  <td style={{ padding: "10px 12px", maxWidth: 280 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {/* Needs revision indicator */}
                      {p.needs_revision && (
                        <span
                          title="Flagged for revision"
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            textTransform: "uppercase" as const,
                            letterSpacing: "0.05em",
                            color: "var(--medium)",
                            background:
                              "color-mix(in srgb, var(--medium) 12%, transparent)",
                            border:
                              "1px solid color-mix(in srgb, var(--medium) 30%, transparent)",
                            borderRadius: "var(--radius-pill)",
                            padding: "1px 5px",
                            flexShrink: 0,
                            lineHeight: 1.6,
                          }}
                        >
                          Review
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.problem_name}
                      </span>
                    </div>
                    {/* Tags — subtle row below name */}
                    {p.tags && p.tags.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          marginTop: 3,
                          flexWrap: "wrap",
                        }}
                      >
                        {p.tags.slice(0, 3).map((tag) => (
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
                        {p.tags.length > 3 && (
                          <span
                            style={{ fontSize: 10, color: "var(--text-muted)" }}
                          >
                            +{p.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Platform */}
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <PlatformBadge platform={p.platform} />
                  </td>

                  {/* Difficulty */}
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <DifficultyBadge difficulty={diff} />
                  </td>

                  {/* Pattern */}
                  <td style={{ padding: "10px 12px", maxWidth: 120 }}>
                    {p.pattern ? (
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                        }}
                      >
                        {formatPattern(p.pattern)}
                      </span>
                    ) : (
                      <span
                        style={{ color: "var(--text-muted)", fontSize: 12 }}
                      >
                        —
                      </span>
                    )}
                  </td>

                  {/* Confidence dots */}
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <ConfidenceDots confidence={p.confidence} />
                    </div>
                  </td>

                  {/* Solve help icon */}
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <SolveHelpIcon solveHelp={p.solve_help} />
                    </div>
                  </td>

                  {/* Time taken */}
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <TimeTakenLabel timeTaken={p.time_taken} />
                  </td>

                  {/* Solved date */}
                  <td style={{ padding: "10px 12px", textAlign: "right" }}>
                    <span
                      className="text-data"
                      style={{ fontSize: 12, color: "var(--text-muted)" }}
                    >
                      {formatDate(p.solved_at)}
                    </span>
                  </td>

                  {/* Actions — chevron */}
                  <td style={{ padding: "10px 8px", textAlign: "center" }}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--text-muted)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      style={{ display: "block", margin: "0 auto" }}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
