import Link from "next/link";
import { Problem } from "@/types";

interface RecentlySolvedProps {
  problems: Problem[];
}

function PlatformBadge({ platform }: { platform: string }) {
  const isLC = platform === "leetcode";
  return (
    <span className={`badge ${isLC ? "badge-lc" : "badge-cf"}`}>
      {isLC ? "LC" : "CF"}
    </span>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string | null }) {
  if (!difficulty) return null;
  return (
    <span className={`badge badge-${difficulty}`}>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function RecentlySolved({ problems }: RecentlySolvedProps) {
  return (
    <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span className="text-section-header">Recently Solved</span>
        <Link href="/dashboard/problems" style={{
          fontSize: 12,
          color: "var(--accent)",
          textDecoration: "none",
          fontWeight: 500,
        }}>
          View all →
        </Link>
      </div>

      {/* List */}
      {problems.length === 0 ? (
        <div style={{
          padding: "32px 0",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: 13,
        }}>
          No problems solved yet.{" "}
          <br />
          <span style={{ fontSize: 12, marginTop: 4, display: "block" }}>
            Solve one and hit "Add to Tracker" in the extension.
          </span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {problems.map((p, i) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: i < problems.length - 1 ? "1px solid var(--border-subtle)" : "none",
                transition: "background var(--transition-fast)",
              }}
            >
              {/* Index */}
              <span style={{
                fontSize: 11,
                color: "var(--text-subtle)",
                fontFamily: "var(--font-mono)",
                width: 16,
                flexShrink: 0,
                textAlign: "right",
              }}>
                {i + 1}
              </span>

              {/* Name + badges */}
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
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <PlatformBadge platform={p.platform} />
                  <DifficultyBadge difficulty={p.difficulty ?? p.user_difficulty} />
                  {p.pattern && (
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {p.pattern}
                    </span>
                  )}
                </div>
              </div>

              {/* Time ago */}
              <span style={{
                fontSize: 11,
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                flexShrink: 0,
              }}>
                {timeAgo(p.solved_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}