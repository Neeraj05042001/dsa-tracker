import Link from "next/link";
import { Problem } from "@/types";

interface RevisionDueProps {
  problems: Problem[];
}

function daysOverdue(dateStr: string | null): number {
  if (!dateStr) return 0;
  const due = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - due.getTime()) / 86400000);
  return Math.max(0, diff);
}

function ConfidenceDot({ confidence }: { confidence: string | null }) {
  const cls = confidence === "low"
    ? "filled-low"
    : confidence === "medium"
    ? "filled-medium"
    : confidence === "high"
    ? "filled-high"
    : "";

  return (
    <div className="confidence-dots">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={`confidence-dot ${i === 0 || (confidence !== "low" && i <= 1) || confidence === "high" ? cls : ""}`}
        />
      ))}
    </div>
  );
}

export function RevisionDue({ problems }: RevisionDueProps) {
  const showing = problems.slice(0, 5);

  return (
    <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="text-section-header">Due for Revision</span>
          {problems.length > 0 && (
            <span style={{
              background: "var(--hard-muted)",
              color: "var(--hard)",
              border: "1px solid color-mix(in srgb, var(--hard) 25%, transparent)",
              fontSize: 10,
              fontWeight: 600,
              fontFamily: "var(--font-mono)",
              padding: "1px 7px",
              borderRadius: "var(--radius-pill)",
            }}>
              {problems.length}
            </span>
          )}
        </div>
        <Link href="/dashboard/revision" style={{
          fontSize: 12,
          color: "var(--accent)",
          textDecoration: "none",
          fontWeight: 500,
        }}>
          Open queue →
        </Link>
      </div>

      {/* List */}
      {showing.length === 0 ? (
        <div style={{
          padding: "32px 0",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: 13,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}>
          {/* Checkmark icon */}
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--easy-muted)",
            border: "1px solid color-mix(in srgb, var(--easy) 25%, transparent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--easy)",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <span>All caught up!</span>
          <span style={{ fontSize: 12 }}>No revisions due today.</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {showing.map((p, i) => {
            const overdue = daysOverdue(p.sm2_next_review);
            return (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: i < showing.length - 1 ? "1px solid var(--border-subtle)" : "none",
                }}
              >
                {/* Overdue indicator */}
                <div style={{
                  width: 4,
                  height: 32,
                  borderRadius: "var(--radius-pill)",
                  background: overdue > 2
                    ? "var(--hard)"
                    : overdue > 0
                    ? "var(--medium)"
                    : "var(--easy)",
                  flexShrink: 0,
                }} />

                {/* Name + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    href={`/dashboard/problems/${p.problem_key}`}
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--text-primary)",
                      textDecoration: "none",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.problem_name}
                  </Link>
                  <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                    <ConfidenceDot confidence={p.confidence} />
                    {p.pattern && (
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.pattern}</span>
                    )}
                  </div>
                </div>

                {/* Overdue label */}
                <span style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: overdue > 0 ? "var(--medium)" : "var(--text-muted)",
                  flexShrink: 0,
                }}>
                  {overdue === 0 ? "today" : `+${overdue}d`}
                </span>
              </div>
            );
          })}

          {/* Show more link if > 5 */}
          {problems.length > 5 && (
            <Link
              href="/dashboard/revision"
              style={{
                marginTop: 12,
                fontSize: 12,
                color: "var(--text-muted)",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              +{problems.length - 5} more in queue
            </Link>
          )}
        </div>
      )}
    </div>
  );
}