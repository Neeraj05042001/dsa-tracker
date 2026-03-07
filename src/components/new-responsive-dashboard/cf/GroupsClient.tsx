"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { CfGroup, CfGroupProblem, UserCfAuth } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type GroupWithProblems = CfGroup & { problems: CfGroupProblem[] };

interface GroupsClientProps {
  groups:      GroupWithProblems[];
  cfAuth:      UserCfAuth | null;
  lastSynced:  string | null;
  userId:      string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTimeAgo(iso: string | null): string {
  if (!iso) return "Never";
  const diff    = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(diff / 3600000);
  const days    = Math.floor(diff / 86400000);
  if (minutes < 1)  return "Just now";
  if (hours < 1)    return `${minutes}m ago`;
  if (days < 1)     return `${hours}h ago`;
  return `${days}d ago`;
}

function getRatingColor(rating: number | null): string {
  if (!rating) return "var(--text-secondary)";
  if (rating < 1200) return "#9b9b9b";
  if (rating < 1400) return "#00c853";
  if (rating < 1600) return "#03a9f4";
  if (rating < 1900) return "#7c4dff";
  if (rating < 2100) return "#ff9800";
  if (rating < 2400) return "#f44336";
  return "#ff1744";
}

// ── Circular Progress Ring ────────────────────────────────────────────────────

function ProgressRing({ pct, size = 72 }: { pct: number; size?: number }) {
  const radius        = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset        = circumference - (pct / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={pct === 100 ? "#00c853" : "#00d4aa"}
        strokeWidth={5} strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      />
    </svg>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "solved" | "attempted" | "todo" }) {
  const config = {
    solved:    { label: "Solved",    bg: "rgba(0,200,83,0.12)",    color: "#00c853" },
    attempted: { label: "Attempted", bg: "rgba(255,152,0,0.12)",   color: "#ff9800" },
    todo:      { label: "Todo",      bg: "rgba(255,255,255,0.06)", color: "var(--text-secondary)" },
  }[status];

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 8px", borderRadius: 6,
      background: config.bg, color: config.color,
      fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: config.color, flexShrink: 0 }} />
      {config.label}
    </span>
  );
}

// ── Problem Row ───────────────────────────────────────────────────────────────

function ProblemRow({
  problem, onAddToTracker, adding,
}: {
  problem: CfGroupProblem;
  onAddToTracker: (p: CfGroupProblem) => void;
  adding: boolean;
}) {
  return (
    <motion.div
      layout
      style={{
        display: "grid",
        gridTemplateColumns: "32px 1fr 90px 60px 120px",
        alignItems: "center",
        gap: 12,
        padding: "10px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        transition: "background 0.15s ease",
      }}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
    >
      <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", textAlign: "center" }}>
        {problem.problem_index}
      </span>
      <a
        href={problem.problem_url} target="_blank" rel="noopener noreferrer"
        style={{
          fontSize: 13, color: "var(--text-primary)", textDecoration: "none",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          transition: "color 0.15s",
        }}
        onMouseOver={e => (e.currentTarget.style.color = "#00d4aa")}
        onMouseOut={e  => (e.currentTarget.style.color = "var(--text-primary)")}
      >
        {problem.problem_name}
      </a>
      <StatusBadge status={problem.cf_status as "solved" | "attempted" | "todo"} />
      <span style={{
        fontSize: 12, fontFamily: "var(--font-mono)",
        color: getRatingColor(problem.cf_rating), textAlign: "right",
      }}>
        {problem.cf_rating ?? "—"}
      </span>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {problem.tracker_problem_id ? (
          <span style={{ fontSize: 11, color: "#00c853", display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Tracked
          </span>
        ) : (
          <button
            onClick={() => onAddToTracker(problem)}
            disabled={adding}
            style={{
              padding: "4px 10px",
              background: "rgba(0,212,170,0.08)",
              border: "1px solid rgba(0,212,170,0.2)",
              borderRadius: 6, color: "#00d4aa",
              fontSize: 11, fontWeight: 600,
              cursor: adding ? "default" : "pointer",
              opacity: adding ? 0.5 : 1,
              transition: "all 0.15s", whiteSpace: "nowrap",
            }}
            onMouseOver={e => { if (!adding) { e.currentTarget.style.background = "rgba(0,212,170,0.15)"; e.currentTarget.style.borderColor = "rgba(0,212,170,0.4)"; }}}
            onMouseOut={e  => { e.currentTarget.style.background = "rgba(0,212,170,0.08)"; e.currentTarget.style.borderColor = "rgba(0,212,170,0.2)"; }}
          >
            {adding ? "Adding..." : "+ Track"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Stat Pill ─────────────────────────────────────────────────────────────────

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{value}</span>
        {" "}{label}
      </span>
    </div>
  );
}

// ── Group Card ────────────────────────────────────────────────────────────────

function GroupCard({ group, index }: { group: GroupWithProblems; index: number }) {
  const [expanded,  setExpanded]  = useState(false);
  const [addingId,  setAddingId]  = useState<string | null>(null);
  const [problems,  setProblems]  = useState(group.problems);
  const [filter,    setFilter]    = useState<"all" | "todo" | "solved" | "attempted">("all");

  const pct       = group.progress_pct ?? 0;
  const total     = group.total_problems ?? 0;
  const solved    = group.solved_count ?? 0;
  const attempted = group.attempted_count ?? 0;
  const todo      = group.todo_count ?? 0;

  const filtered = filter === "all" ? problems : problems.filter(p => p.cf_status === filter);

  async function handleAddToTracker(problem: CfGroupProblem) {
    setAddingId(problem.id);
    try {
      const res = await fetch("/api/problems/from-extension", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_name:   problem.problem_name,
          platform:       "codeforces",
          problem_url:    problem.problem_url,
          problem_key:    `cf-group-${group.group_code}-${problem.contest_id}-${problem.problem_index}`.toLowerCase(),
          cf_rating:      problem.cf_rating,
          status:         problem.cf_status === "solved" ? "solved" : "attempted",
          source:         "cf_group",
          cf_group_code:  group.group_code,
          cf_contest_id:  problem.contest_id,
          cf_problem_idx: problem.problem_index,
          solved_at:      problem.solved_at ?? new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setProblems(prev =>
          prev.map(p => p.id === problem.id ? { ...p, tracker_problem_id: "tracked" } : p)
        );
      }
    } catch (err) {
      console.error("Add to tracker failed:", err);
    } finally {
      setAddingId(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.4, 0.25, 1] }}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14, overflow: "hidden",
        transition: "border-color 0.2s",
      }}
      whileHover={{ borderColor: "rgba(0,212,170,0.15)" }}
    >
      {/* Card Header */}
      <div style={{ padding: "20px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>

          {/* Progress ring */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <ProgressRing pct={pct} size={72} />
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
                {pct}%
              </span>
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Group name */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <a
                href={group.group_url ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 15, fontWeight: 600,
                  color: "var(--text-primary)", textDecoration: "none",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  flex: 1, minWidth: 0,
                  transition: "color 0.15s",
                }}
                onMouseOver={e => (e.currentTarget.style.color = "#00d4aa")}
                onMouseOut={e  => (e.currentTarget.style.color = "var(--text-primary)")}
              >
                {group.group_name}
              </a>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <StatPill label="Solved"    value={solved}   color="#00c853" />
              <StatPill label="Attempted" value={attempted} color="#ff9800" />
              <StatPill label="Todo"      value={todo}     color="var(--text-secondary)" />
            </div>
          </div>
        </div>

        {/* Action row: expand problems + view analytics */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {/* Expand problems button */}
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              flex: 1,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "6px 12px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
              color: "var(--text-secondary)",
              fontSize: 12, fontWeight: 500,
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseOut={e  => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          >
            <span>{total} problem{total !== 1 ? "s" : ""}</span>
            <motion.svg
              width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </button>

          {/* ── View Analytics link ── */}
          <Link
            href={`/dashboard/groups/${group.group_code}`}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 12px",
              background: "rgba(0,212,170,0.07)",
              border: "1px solid rgba(0,212,170,0.18)",
              borderRadius: 8,
              color: "#00d4aa",
              fontSize: 12, fontWeight: 600,
              textDecoration: "none",
              whiteSpace: "nowrap",
              transition: "all 0.15s",
              flexShrink: 0,
            }}
            onMouseOver={(e: any) => { e.currentTarget.style.background = "rgba(0,212,170,0.14)"; e.currentTarget.style.borderColor = "rgba(0,212,170,0.35)"; }}
            onMouseOut={(e: any)  => { e.currentTarget.style.background = "rgba(0,212,170,0.07)"; e.currentTarget.style.borderColor = "rgba(0,212,170,0.18)"; }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Analytics
          </Link>
        </div>
      </div>

      {/* Expandable Problem List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
            style={{ overflow: "hidden" }}
          >
            {/* Filter chips */}
            <div style={{
              display: "flex", gap: 6, padding: "10px 16px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(0,0,0,0.15)",
            }}>
              {(["all", "todo", "solved", "attempted"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "3px 10px", borderRadius: 6,
                    border: filter === f ? "1px solid rgba(0,212,170,0.3)" : "1px solid rgba(255,255,255,0.06)",
                    background: filter === f ? "rgba(0,212,170,0.1)" : "transparent",
                    color: filter === f ? "#00d4aa" : "var(--text-secondary)",
                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                    transition: "all 0.15s", textTransform: "capitalize",
                  }}
                >
                  {f === "all" ? `All (${total})` : f === "todo" ? `Todo (${todo})` : f === "solved" ? `Solved (${solved})` : `Tried (${attempted})`}
                </button>
              ))}
            </div>

            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "32px 1fr 90px 60px 120px",
              gap: 12, padding: "8px 16px",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              background: "rgba(0,0,0,0.1)",
            }}>
              {["#", "Problem", "Status", "Rating", ""].map((h, i) => (
                <span key={i} style={{
                  fontSize: 10, fontWeight: 600,
                  color: "var(--text-secondary)",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  textAlign: i === 3 ? "right" : "left",
                }}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>
                  No {filter} problems
                </div>
              ) : (
                filtered.map(problem => (
                  <ProblemRow
                    key={problem.id}
                    problem={problem}
                    onAddToTracker={handleAddToTracker}
                    adding={addingId === problem.id}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ hasAuth }: { hasAuth: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 16, padding: "80px 24px", textAlign: "center",
        background: "var(--bg-surface)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14,
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: "rgba(0,212,170,0.08)",
        border: "1px solid rgba(0,212,170,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      </div>
      <div>
        <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
          {hasAuth ? "No groups found" : "No Codeforces account connected"}
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 320 }}>
          {hasAuth
            ? "Join a group on Codeforces and sync from the extension."
            : "Open the Memoize extension while on codeforces.com and click Connect to sync your groups."
          }
        </p>
      </div>
    </motion.div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export function GroupsClient({ groups, cfAuth, lastSynced, userId }: GroupsClientProps) {
  const [syncing,     setSyncing]     = useState(false);
  const [syncMsg,     setSyncMsg]     = useState<string | null>(null);
  const [syncError,   setSyncError]   = useState(false);
  const [localSynced, setLocalSynced] = useState(lastSynced);

  async function handleSync() {
    setSyncing(true);
    setSyncMsg(null);
    setSyncError(false);
    try {
      const res    = await fetch("/api/cf/sync-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ triggered_by: "manual" }),
      });
      const result = await res.json();
      if (result.throttled) {
        setSyncMsg(result.message);
        setSyncError(false);
      } else if (result.success) {
        setLocalSynced(new Date().toISOString());
        setSyncMsg(`Synced ${result.groups_synced} group${result.groups_synced !== 1 ? "s" : ""} · ${result.problems_synced} problems`);
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setSyncMsg(result.message || "Sync failed");
        setSyncError(true);
      }
    } catch {
      setSyncMsg("Connection error");
      setSyncError(true);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="stagger">
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20, gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {localSynced && (
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              Last synced: <span style={{ color: "var(--text-primary)" }}>{formatTimeAgo(localSynced)}</span>
            </span>
          )}
          {syncMsg && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                fontSize: 12, color: syncError ? "#ef4444" : "#00c853",
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              {!syncError && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {syncMsg}
            </motion.span>
          )}
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "8px 16px",
            background: syncing ? "rgba(0,212,170,0.06)" : "rgba(0,212,170,0.1)",
            border: "1px solid rgba(0,212,170,0.25)",
            borderRadius: 9, color: "#00d4aa",
            fontSize: 13, fontWeight: 600,
            cursor: syncing ? "default" : "pointer",
            opacity: syncing ? 0.7 : 1,
            transition: "all 0.15s",
          }}
          onMouseOver={e => { if (!syncing) { e.currentTarget.style.background = "rgba(0,212,170,0.15)"; e.currentTarget.style.borderColor = "rgba(0,212,170,0.4)"; }}}
          onMouseOut={e  => { e.currentTarget.style.background = "rgba(0,212,170,0.1)"; e.currentTarget.style.borderColor = "rgba(0,212,170,0.25)"; }}
        >
          <motion.svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            animate={{ rotate: syncing ? 360 : 0 }}
            transition={{ duration: 1, repeat: syncing ? Infinity : 0, ease: "linear" }}
          >
            <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0115-6.7L21 8" />
            <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 01-15 6.7L3 16" />
          </motion.svg>
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      {/* Content */}
      {groups.length === 0 ? (
        <EmptyState hasAuth={!!cfAuth} />
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: 16,
        }}>
          {groups.map((group, i) => (
            <GroupCard key={group.id} group={group} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}