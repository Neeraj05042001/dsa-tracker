"use client";

import { useState, useMemo, useEffect, useRef, forwardRef } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useInView,
} from "framer-motion";
import type { CfGroupProblem } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "todo" | "solved" | "attempted";

export interface ProblemsTableProps {
  problems: CfGroupProblem[];
  contestNameMap: Map<string, string>;
  selectedContest: string | null;
  onClearContest: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function indexOrder(idx: string): number {
  if (!idx) return 999;
  return (
    idx.charCodeAt(0) -
    65 +
    (idx.length > 1 ? (parseInt(idx.slice(1), 10) || 0) * 26 : 0)
  );
}

function stripeConfig(status: string): { color: string; idleOpacity: number } {
  if (status === "solved") return { color: "#22c55e", idleOpacity: 0.45 };
  if (status === "attempted") return { color: "#f59e0b", idleOpacity: 0.4 };
  return { color: "rgba(255,255,255,0.1)", idleOpacity: 0.8 };
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const mon = d.toLocaleDateString("en-US", { month: "short" });
  const day = d.getDate();
  const yr = String(d.getFullYear()).slice(2); // '26
  return `${mon} ${day} '${yr}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// INDEX BADGE
// ─────────────────────────────────────────────────────────────────────────────

function IndexBadge({ index, hovered }: { index: string; hovered: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 24,
        height: 24,
        fontSize: 11,
        fontFamily: "var(--font-mono, monospace)",
        fontWeight: 800,
        color: hovered ? "#00d4aa" : "rgba(0,212,170,0.45)",
        background: hovered ? "rgba(0,212,170,0.08)" : "transparent",
        borderRadius: 6,
        transition: "all 0.14s",
        flexShrink: 0,
      }}
    >
      {index}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPACT STATUS
// ─────────────────────────────────────────────────────────────────────────────

function CompactStatus({ status }: { status: string }) {
  const cfg: Record<string, { label: string; color: string }> = {
    solved: { label: "Solved", color: "#22c55e" },
    attempted: { label: "Tried", color: "#f59e0b" },
    todo: { label: "Todo", color: "rgba(255,255,255,0.22)" },
  };
  const c = cfg[status] ?? cfg.todo;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        fontWeight: 600,
        color: c.color,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: c.color,
          flexShrink: 0,
          boxShadow: status === "solved" ? `0 0 5px ${c.color}88` : "none",
        }}
      />
      {c.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM ROW
// ─────────────────────────────────────────────────────────────────────────────

function ProblemRow({
  problem,
  contestName,
  rowIndex,
  isEven,
}: {
  problem: CfGroupProblem;
  contestName: string;
  rowIndex: number;
  isEven: boolean;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8px" });
  const [hov, setHov] = useState(false);
  const stripe = stripeConfig(problem.cf_status);

  const rowBase =
    problem.cf_status === "solved"
      ? "rgba(34,197,94,0.015)"
      : isEven
        ? "rgba(255,255,255,0.008)"
        : "transparent";

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      exit={{ opacity: 0, y: -4 }}
      transition={
        reduced
          ? { duration: 0 }
          : {
              duration: 0.2,
              delay: Math.min(rowIndex * 0.014, 0.2),
              ease: [0.22, 1, 0.36, 1],
            }
      }
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{
        display: "grid",
        // # | Problem | Status | Date | Link
        gridTemplateColumns: "36px 1fr 76px 72px 22px",
        alignItems: "center",
        gap: 10,
        padding: "9px 14px 9px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.032)",
        background: hov
          ? "linear-gradient(90deg, rgba(0,212,170,0.042) 0%, rgba(0,212,170,0.01) 40%, transparent 70%)"
          : rowBase,
        position: "relative",
        transition: "background 0.14s",
      }}
    >
      {/* Status stripe */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 2.5,
          background: stripe.color,
          opacity: hov ? 1 : stripe.idleOpacity,
          transition: "opacity 0.14s",
          borderRadius: "0 2px 2px 0",
        }}
      />

      {/* # */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <IndexBadge index={problem.problem_index} hovered={hov} />
      </div>

      {/* Name + contest chip */}
      <div style={{ overflow: "hidden", minWidth: 0 }}>
        <a
          href={problem.problem_url ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 12.5,
            fontWeight: 500,
            color: hov ? "#00d4aa" : "var(--text-primary, #fafafa)",
            textDecoration: "none",
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            transition: "color 0.12s, transform 0.14s",
            transform: hov ? "translateX(2px)" : "translateX(0)",
          }}
        >
          {problem.problem_name}
        </a>
        <span
          style={{
            display: "inline-block",
            fontSize: 9,
            fontWeight: 500,
            color: "var(--text-muted, #52525b)",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.055)",
            borderRadius: 4,
            padding: "1px 5px",
            marginTop: 3,
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {contestName}
        </span>
      </div>

      {/* Status */}
      <CompactStatus status={problem.cf_status} />

      {/* Date — solved_at */}
      <span
        style={{
          fontSize: 10,
          fontFamily: "var(--font-mono, monospace)",
          color: problem.solved_at
            ? "var(--text-muted, #52525b)"
            : "rgba(255,255,255,0.1)",
          textAlign: "right",
          whiteSpace: "nowrap",
          letterSpacing: "0.01em",
        }}
      >
        {formatDate(problem.solved_at)}
      </span>

      {/* Link */}
      <motion.a
        href={problem.problem_url ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        animate={{ opacity: hov ? 1 : 0.18 }}
        transition={{ duration: 0.12 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#00d4aa",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </motion.a>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ filter, search }: { filter: string; search: string }) {
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(true);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((t) => !t), 540);
    return () => clearInterval(id);
  }, [reduced]);

  const msg = search
    ? `no results for "${search}"`
    : filter !== "all"
      ? `no ${filter} problems`
      : "no problems";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: "44px 16px", textAlign: "center" }}
    >
      <span
        style={{
          fontSize: 11,
          fontFamily: "var(--font-mono, monospace)",
          color: "var(--text-muted, #52525b)",
        }}
      >
        <span style={{ color: "rgba(0,212,170,0.5)" }}>$</span> {msg}
        <span
          style={{
            color: "#00d4aa",
            marginLeft: 2,
            fontWeight: 700,
            opacity: tick ? 1 : 0,
            transition: "opacity 0s",
          }}
        >
          ▌
        </span>
      </span>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const ProblemsTable = forwardRef<HTMLDivElement, ProblemsTableProps>(
  function ProblemsTable(
    { problems, contestNameMap, selectedContest, onClearContest },
    ref,
  ) {
    const reduced = useReducedMotion();

    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [search, setSearch] = useState("");
    const searchRef = useRef<HTMLInputElement>(null);

    // Reset when contest selection changes
    useEffect(() => {
      setStatusFilter("all");
      setSearch("");
    }, [selectedContest]);

    // ── Filtered + sorted ───────────────────────────────────────────────────
    const filteredProblems = useMemo(() => {
      let list = selectedContest
        ? problems.filter((p) => p.contest_id === selectedContest)
        : problems;

      if (statusFilter !== "all")
        list = list.filter((p) => p.cf_status === statusFilter);

      if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter(
          (p) =>
            p.problem_name.toLowerCase().includes(q) ||
            p.problem_index.toLowerCase() === q,
        );
      }

      return [...list].sort((a, b) => {
        if (a.contest_id !== b.contest_id)
          return a.contest_id.localeCompare(b.contest_id);
        return indexOrder(a.problem_index) - indexOrder(b.problem_index);
      });
    }, [problems, selectedContest, statusFilter, search]);

    // ── Counts ──────────────────────────────────────────────────────────────
    const counts = useMemo(() => {
      const base = selectedContest
        ? problems.filter((p) => p.contest_id === selectedContest)
        : problems;
      return {
        all: base.length,
        todo: base.filter((p) => p.cf_status === "todo").length,
        solved: base.filter((p) => p.cf_status === "solved").length,
        attempted: base.filter((p) => p.cf_status === "attempted").length,
      };
    }, [problems, selectedContest]);

    const tableTitle = selectedContest
      ? (contestNameMap.get(selectedContest) ?? "Contest")
      : "All Problems";

    const labels: Record<StatusFilter, string> = {
      all: `All (${counts.all})`,
      todo: `Todo (${counts.todo})`,
      solved: `Solved (${counts.solved})`,
      attempted: `Tried (${counts.attempted})`,
    };

    // ── RENDER ──────────────────────────────────────────────────────────────

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduced
            ? { duration: 0 }
            : { duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }
        }
        style={{
          background: "var(--bg-surface, #111113)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14,
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          // ← Fixed height — scroll lives inside, container never grows
          height: 520,
        }}
      >
        {/* Bottom accent */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }
          }
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "linear-gradient(90deg, #00d4aa, transparent)",
            transformOrigin: "left",
            opacity: 0.22,
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

        {/* ── TOOLBAR ─────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "11px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            flexWrap: "wrap",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {/* Left — dynamic title + filter tabs */}
          <div
            style={{
              display: "flex",
              gap: 5,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={tableTitle}
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 3 }}
                transition={{ duration: 0.13 }}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: selectedContest
                    ? "#00d4aa"
                    : "var(--text-muted, #52525b)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginRight: 4,
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                {tableTitle}
              </motion.span>
            </AnimatePresence>

            {(["all", "todo", "solved", "attempted"] as StatusFilter[]).map(
              (f) => {
                const active = statusFilter === f;
                return (
                  <motion.button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    whileTap={{ scale: 0.94 }}
                    style={{
                      padding: "3px 9px",
                      borderRadius: 6,
                      border: active
                        ? "1px solid rgba(0,212,170,0.35)"
                        : "1px solid rgba(255,255,255,0.06)",
                      background: active
                        ? "rgba(0,212,170,0.1)"
                        : "transparent",
                      color: active ? "#00d4aa" : "var(--text-muted, #52525b)",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.14s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {labels[f]}
                  </motion.button>
                );
              },
            )}
          </div>

          {/* Right — contest chip + search */}
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {/* Active contest chip */}
            <AnimatePresence>
              {selectedContest && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: 8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 24 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "2px 7px",
                    background: "rgba(0,212,170,0.08)",
                    border: "1px solid rgba(0,212,170,0.2)",
                    borderRadius: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: "#00d4aa",
                      fontWeight: 600,
                      maxWidth: 140,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontFamily: "var(--font-mono, monospace)",
                    }}
                  >
                    {contestNameMap.get(selectedContest) ?? selectedContest}
                  </span>
                  <button
                    onClick={onClearContest}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(0,212,170,0.5)",
                      cursor: "pointer",
                      padding: 0,
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search with expand-on-focus + clear */}
            <div style={{ position: "relative" }}>
              <svg
                style={{
                  position: "absolute",
                  left: 7,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-muted, #52525b)"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  paddingLeft: 24,
                  paddingRight: search ? 26 : 9,
                  paddingTop: 4,
                  paddingBottom: 4,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 7,
                  color: "var(--text-primary, #fafafa)",
                  fontSize: 11,
                  outline: "none",
                  width: 130,
                  transition: "border-color 0.14s, width 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(0,212,170,0.3)";
                  e.target.style.width = "155px";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.07)";
                  if (!search) e.target.style.width = "130px";
                }}
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.1 }}
                    onClick={() => {
                      setSearch("");
                      searchRef.current?.focus();
                    }}
                    style={{
                      position: "absolute",
                      right: 5,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "var(--text-muted, #52525b)",
                      cursor: "pointer",
                      padding: 2,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── COLUMN HEADERS — sticky ──────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "36px 1fr 76px 72px 22px",
            gap: 10,
            padding: "6px 14px 6px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            background: "rgba(0,0,0,0.18)",
            position: "sticky",
            top: 0,
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          {[
            { label: "#", align: "center" },
            { label: "Problem", align: "left" },
            { label: "Status", align: "left" },
            { label: "Date", align: "right" },
            { label: "", align: "left" },
          ].map((col, i) => (
            <span
              key={i}
              style={{
                display: "block",
                fontSize: 9,
                fontWeight: 700,
                color: "var(--text-muted, #52525b)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                textAlign: col.align as React.CSSProperties["textAlign"],
              }}
            >
              {col.label}
            </span>
          ))}
        </div>

        {/* ── ROWS — scrollable, fixed height via parent ───────────────────── */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          <AnimatePresence mode="popLayout">
            {filteredProblems.length === 0 ? (
              <EmptyState key="empty" filter={statusFilter} search={search} />
            ) : (
              filteredProblems.map((p, i) => (
                <ProblemRow
                  key={p.id}
                  problem={p}
                  contestName={contestNameMap.get(p.contest_id) ?? p.contest_id}
                  rowIndex={i}
                  isEven={i % 2 === 0}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: "7px 14px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
            background: "rgba(0,0,0,0.1)",
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: "var(--text-muted, #52525b)",
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            {filteredProblems.length} problem
            {filteredProblems.length !== 1 ? "s" : ""}
            {selectedContest && (
              <span style={{ color: "rgba(255,255,255,0.2)", marginLeft: 4 }}>
                · filtered
              </span>
            )}
          </span>
          <span
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.12)",
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            {statusFilter !== "all" ? `${statusFilter} only` : ""}
          </span>
        </div>
      </motion.div>
    );
  },
);
