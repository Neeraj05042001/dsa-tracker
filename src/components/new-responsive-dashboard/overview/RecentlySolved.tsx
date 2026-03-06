"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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

const rowVariants = {
  hidden: { opacity: 0, x: 10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.32, delay: i * 0.065, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], },
  }),
};


export function RecentlySolved({ problems }: RecentlySolvedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="card"
      style={{ padding: 24, display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{
          fontFamily: "var(--font-sans)",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}>
          Recently Solved
        </span>
        <motion.div whileHover="hover" style={{ display: "flex" }}>
          <Link
            href="/dashboard/problems"
            style={{
              fontSize: 12,
              color: "var(--accent)",
              textDecoration: "none",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            View all
            <motion.span
              variants={{ hover: { x: 3 } }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              style={{ display: "inline-block" }}
            >
              →
            </motion.span>
          </Link>
        </motion.div>
      </div>

      {/* Empty state */}
      {problems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{
            padding: "32px 0",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 13,
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
            color: "var(--text-muted)",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
          </div>
          No problems solved yet.
          <br />
          <span style={{ fontSize: 12, marginTop: 4, display: "block", color: "var(--text-muted)" }}>
            Solve one and hit "Add to Tracker" in the extension.
          </span>
        </motion.div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {problems.map((p, i) => (
            <motion.div
              key={p.id}
              custom={i}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              whileHover={{
                x: 3,
                backgroundColor: "var(--bg-elevated)",
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 8px",
                borderRadius: "var(--radius-md)",
                borderBottom: i < problems.length - 1 ? "1px solid var(--border-subtle)" : "none",
                position: "relative",
                transition: "background 0.15s",
                cursor: "default",
                overflow: "hidden",
              }}
            >
              {/* Left border flash on hover */}
              <motion.div
                initial={{ scaleY: 0 }}
                whileHover={{ scaleY: 1 }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: "15%",
                  bottom: "15%",
                  width: 2,
                  borderRadius: 2,
                  background: "var(--accent)",
                  transformOrigin: "center",
                  opacity: 0.7,
                }}
              />

              {/* Index */}
              <span style={{
                fontSize: 10,
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                width: 16,
                flexShrink: 0,
                textAlign: "right",
                userSelect: "none",
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
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-primary)")}
                >
                  {p.problem_name}
                </Link>
                <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                  <PlatformBadge platform={p.platform} />
                  <DifficultyBadge difficulty={p.difficulty ?? p.user_difficulty} />
                  {p.pattern && (
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{p.pattern}</span>
                  )}
                </div>
              </div>

              {/* Time ago */}
              <span style={{
                fontSize: 10,
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                flexShrink: 0,
                transition: "color 0.15s",
              }}>
                {timeAgo(p.solved_at)}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}