"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Problem } from "@/types";

interface RevisionDueProps {
  problems: Problem[];
}

function daysOverdue(dateStr: string | null): number {
  if (!dateStr) return 0;
  const due = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today.getTime() - due.getTime()) / 86400000));
}

function urgencyColor(overdue: number) {
  if (overdue > 2) return "var(--hard)";
  if (overdue > 0) return "var(--medium)";
  return "var(--easy)";
}

function ConfidenceDots({ confidence }: { confidence: string | null }) {
  const levels: Record<string, number> = { low: 1, medium: 2, high: 3 };
  const filled = levels[confidence ?? ""] ?? 0;
  const colors = ["var(--hard)", "var(--medium)", "var(--easy)"];
  const dotColor = filled === 1 ? colors[0] : filled === 2 ? colors[1] : colors[2];

  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: i < filled ? dotColor : "var(--border-mid)",
            transition: "background 0.2s",
          }}
        />
      ))}
    </div>
  );
}

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], },
  }),
};

export function RevisionDue({ problems }: RevisionDueProps) {
  const showing = problems.slice(0, 5);
  const isUrgent = problems.length > 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="card"
      style={{ padding: 24, display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            fontFamily: "var(--font-sans)",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}>
            Due for Revision
          </span>

          {/* Count badge — pulses if urgent */}
          <AnimatePresence>
            {problems.length > 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={isUrgent
                  ? { scale: [1, 1.12, 1], opacity: 1 }
                  : { scale: 1, opacity: 1 }}
                transition={isUrgent
                  ? { scale: { duration: 1.6, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.2 } }
                  : { duration: 0.2 }}
                style={{
                  background: "color-mix(in srgb, var(--hard) 14%, transparent)",
                  color: "var(--hard)",
                  border: "1px solid color-mix(in srgb, var(--hard) 28%, transparent)",
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  padding: "1px 7px",
                  borderRadius: "var(--radius-pill)",
                  display: "inline-block",
                }}
              >
                {problems.length}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Arrow link */}
        <motion.div whileHover="hover" style={{ display: "flex" }}>
          <Link
            href="/dashboard/revision"
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
            Open queue
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
      {showing.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{
            padding: "28px 0",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 13,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "color-mix(in srgb, var(--easy) 12%, transparent)",
              border: "1px solid color-mix(in srgb, var(--easy) 25%, transparent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--easy)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </motion.div>
          <div>
            <div style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
              All caught up!
            </div>
            <div style={{ fontSize: 12 }}>No revisions due today.</div>
          </div>
        </motion.div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {showing.map((p, i) => {
            const overdue = daysOverdue(p.sm2_next_review);
            const barColor = urgencyColor(overdue);

            return (
              <motion.div
                key={p.id}
                custom={i}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ x: 2, backgroundColor: "var(--bg-elevated)" }}
                
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "9px 8px",
                  borderRadius: "var(--radius-md)",
                  borderBottom: i < showing.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  transition: "background 0.15s",
                  cursor: "default",
                }}
              >
                {/* Urgency bar — animates width in */}
                <div style={{ width: 4, height: 34, borderRadius: 4, background: "var(--border-subtle)", flexShrink: 0, overflow: "hidden" }}>
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.06 + 0.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      width: "100%",
                      height: "100%",
                      background: barColor,
                      borderRadius: 4,
                      transformOrigin: "bottom",
                      boxShadow: `0 0 6px ${barColor}`,
                    }}
                  />
                </div>

                {/* Name + confidence */}
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
                    <ConfidenceDots confidence={p.confidence} />
                    {p.pattern && (
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.pattern}</span>
                    )}
                  </div>
                </div>

                {/* Overdue label */}
                <span style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: overdue > 0 ? barColor : "var(--text-muted)",
                  flexShrink: 0,
                  fontWeight: overdue > 0 ? 600 : 400,
                }}>
                  {overdue === 0 ? "today" : `+${overdue}d`}
                </span>
              </motion.div>
            );
          })}

          {problems.length > 5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                href="/dashboard/revision"
                style={{
                  display: "block",
                  marginTop: 10,
                  fontSize: 12,
                  color: "var(--text-muted)",
                  textDecoration: "none",
                  textAlign: "center",
                  padding: "6px",
                  borderRadius: "var(--radius-md)",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                +{problems.length - 5} more in queue
              </Link>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}