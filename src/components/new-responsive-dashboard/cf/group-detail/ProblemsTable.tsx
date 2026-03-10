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
  if (status === "solved")    return { color: "#00d4aa",                idleOpacity: 0.5  };
  if (status === "attempted") return { color: "#f59e0b",                idleOpacity: 0.45 };
  return                             { color: "rgba(255,255,255,0.07)", idleOpacity: 1    };
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d   = new Date(iso);
  const mon = d.toLocaleDateString("en-US", { month: "short" });
  const day = d.getDate();
  const yr  = String(d.getFullYear()).slice(2);
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
        width: 26,
        height: 26,
        fontSize: 11,
        fontFamily: "var(--font-mono, monospace)",
        fontWeight: 800,
        color: hovered ? "#00d4aa" : "rgba(0,212,170,0.55)",
        background: hovered ? "rgba(0,212,170,0.12)" : "rgba(0,212,170,0.04)",
        border: `1px solid ${hovered ? "rgba(0,212,170,0.35)" : "rgba(0,212,170,0.1)"}`,
        borderRadius: 7,
        transition: "all 0.14s",
        flexShrink: 0,
        letterSpacing: "-0.02em",
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
  const cfg: Record<string, { label: string; color: string; bg: string; border: string }> = {
    solved: {
      label:  "Solved",
      color:  "#00d4aa",
      bg:     "rgba(0,212,170,0.09)",
      border: "rgba(0,212,170,0.22)",
    },
    attempted: {
      label:  "Tried",
      color:  "#f59e0b",
      bg:     "rgba(245,158,11,0.09)",
      border: "rgba(245,158,11,0.22)",
    },
    todo: {
      label:  "Todo",
      color:  "rgba(255,255,255,0.3)",
      bg:     "rgba(255,255,255,0.04)",
      border: "rgba(255,255,255,0.09)",
    },
  };
  const c = cfg[status] ?? cfg.todo;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 10.5,
        fontWeight: 600,
        color: c.color,
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 5,
        padding: "2px 7px",
        whiteSpace: "nowrap",
        letterSpacing: "0.01em",
      }}
    >
      <span
        style={{
          width: 4.5,
          height: 4.5,
          borderRadius: "50%",
          background: c.color,
          flexShrink: 0,
          boxShadow: status !== "todo" ? `0 0 5px ${c.color}90` : "none",
        }}
      />
      {c.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER TABS — sliding layoutId pill
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_MAP: Record<StatusFilter, { color: string; glow: string }> = {
  all:       { color: "#00d4aa",               glow: "rgba(0,212,170,0.25)"   },
  solved:    { color: "#00d4aa",               glow: "rgba(0,212,170,0.25)"   },
  attempted: { color: "#f59e0b",               glow: "rgba(245,158,11,0.25)"  },
  todo:      { color: "rgba(255,255,255,0.65)", glow: "rgba(255,255,255,0.1)" },
};

function FilterTabs({
  statusFilter,
  labels,
  onChange,
}: {
  statusFilter: StatusFilter;
  labels:       Record<StatusFilter, string>;
  onChange:     (f: StatusFilter) => void;
}) {
  const reduced = useReducedMotion();

  return (
    <div style={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "center" }}>
      {(["all", "todo", "solved", "attempted"] as StatusFilter[]).map((f) => {
        const active = statusFilter === f;
        const acc    = ACCENT_MAP[f];

        return (
          <motion.button
            key={f}
            onClick={() => onChange(f)}
            whileTap={{ scale: 0.94 }}
            style={{
              position: "relative",
              padding: "3px 9px",
              borderRadius: 6,
              border: active
                ? `1px solid ${acc.glow}`
                : "1px solid rgba(255,255,255,0.07)",
              background: "transparent",
              color: active ? acc.color : "var(--text-muted, #52525b)",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              transition: "color 0.16s, border-color 0.16s",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {/* Shared sliding pill — animates between buttons via layoutId */}
            {active && !reduced && (
              <motion.span
                layoutId="filter-pill"
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 5,
                  background: `${acc.color}18`,
                  zIndex: 0,
                }}
              />
            )}
            <span style={{ position: "relative", zIndex: 1 }}>
              {labels[f]}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM ROW
// ─────────────────────────────────────────────────────────────────────────────

function ProblemRow({
  problem,
  contestName,
  rowIndex,
}: {
  problem:     CfGroupProblem;
  contestName: string;
  rowIndex:    number;
  // isEven removed — no more zebra striping
}) {
  const reduced  = useReducedMotion();
  const ref      = useRef<HTMLDivElement>(null);
  const inView   = useInView(ref, { once: true, margin: "-8px" });
  const [hov, setHov] = useState(false);
  const stripe   = stripeConfig(problem.cf_status);
  const isSolved = problem.cf_status === "solved";

  // Clean row base — status tint only, no zebra noise
  const rowBase = isSolved
    ? "rgba(0,212,170,0.018)"
    : problem.cf_status === "attempted"
      ? "rgba(245,158,11,0.014)"
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
              duration: 0.22,
              // Slower stagger — 0.025s per row, cap at 0.35s
              delay: Math.min(rowIndex * 0.025, 0.35),
              ease: [0.22, 1, 0.36, 1],
            }
      }
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "36px 1fr 84px 72px 22px",
        alignItems: "center",
        gap: 10,
        padding: "8px 14px 8px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.028)",
        background: hov
          ? "linear-gradient(90deg, rgba(0,212,170,0.05) 0%, rgba(0,212,170,0.012) 45%, transparent 75%)"
          : rowBase,
        position: "relative",
        overflow: "hidden",         // needed for shimmer clip
        transition: "background 0.14s",
      }}
    >
      {/* Status stripe */}
      <div
        style={{
          position: "absolute",
          left: 0, top: 0, bottom: 0,
          width: 2.5,
          background: stripe.color,
          opacity: hov ? 1 : stripe.idleOpacity,
          transition: "opacity 0.14s",
          borderRadius: "0 2px 2px 0",
        }}
      />

      {/* One-time shimmer sweep — solved rows only, fires on mount */}
      {isSolved && !reduced && (
        <motion.div
          aria-hidden
          initial={{ x: "-110%" }}
          animate={inView ? { x: "110%" } : { x: "-110%" }}
          transition={{
            duration: 0.75,
            delay: Math.min(rowIndex * 0.025, 0.35) + 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(105deg, transparent 30%, rgba(0,212,170,0.07) 50%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      )}

      {/* # */}
      <div style={{ display: "flex", justifyContent: "center", position: "relative", zIndex: 2 }}>
        <IndexBadge index={problem.problem_index} hovered={hov} />
      </div>

      {/* Name + contest chip */}
      <div style={{ overflow: "hidden", minWidth: 0, position: "relative", zIndex: 2 }}>
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
            letterSpacing: "-0.01em",
          }}
        >
          {problem.problem_name}
        </a>
        <span
          style={{
            display: "inline-block",
            fontSize: 9,
            fontWeight: 500,
            color: "rgba(255,255,255,0.28)",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 4,
            padding: "1px 5px",
            marginTop: 3,
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            letterSpacing: "0.01em",
          }}
        >
          {contestName}
        </span>
      </div>

      {/* Status pill */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <CompactStatus status={problem.cf_status} />
      </div>

      {/* Date */}
      <span
        style={{
          fontSize: 10,
          fontFamily: "var(--font-mono, monospace)",
          color: problem.solved_at
            ? "rgba(0,212,170,0.4)"
            : "rgba(255,255,255,0.1)",
          textAlign: "right",
          whiteSpace: "nowrap",
          letterSpacing: "0.01em",
          position: "relative",
          zIndex: 2,
        }}
      >
        {formatDate(problem.solved_at)}
      </span>

      {/* External link */}
      <motion.a
        href={problem.problem_url ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        animate={{ opacity: hov ? 1 : 0.15 }}
        transition={{ duration: 0.12 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#00d4aa",
          width: 22,
          height: 22,
          borderRadius: 5,
          background: hov ? "rgba(0,212,170,0.1)" : "transparent",
          transition: "background 0.14s",
          position: "relative",
          zIndex: 2,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <svg
          width="11" height="11" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
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
// EMPTY STATE  (unchanged)
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
    const [search, setSearch]             = useState("");
    const searchRef     = useRef<HTMLInputElement>(null);
    const searchWrapRef = useRef<HTMLDivElement>(null);

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
        all:       base.length,
        todo:      base.filter((p) => p.cf_status === "todo").length,
        solved:    base.filter((p) => p.cf_status === "solved").length,
        attempted: base.filter((p) => p.cf_status === "attempted").length,
      };
    }, [problems, selectedContest]);

    const tableTitle = selectedContest
      ? (contestNameMap.get(selectedContest) ?? "Contest")
      : "All Problems";

    const labels: Record<StatusFilter, string> = {
      all:       `All (${counts.all})`,
      todo:      `Todo (${counts.todo})`,
      solved:    `Solved (${counts.solved})`,
      attempted: `Tried (${counts.attempted})`,
    };

    // Search clear — clears state + pulses the input wrapper
    function handleClearSearch() {
      setSearch("");
      searchRef.current?.focus();
      if (!reduced && searchWrapRef.current) {
        searchWrapRef.current.animate(
          [
            { transform: "scale(1)"    },
            { transform: "scale(1.04)" },
            { transform: "scale(1)"    },
          ],
          { duration: 180, easing: "ease-out" },
        );
      }
    }

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
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          height: 520,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
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
            bottom: 0, left: 0, right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, #00d4aa 0%, rgba(0,212,170,0.4) 40%, transparent 80%)",
            transformOrigin: "left",
            opacity: 0.35,
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
            padding: "10px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            flexWrap: "wrap",
            gap: 8,
            flexShrink: 0,
            background: "rgba(0,0,0,0.12)",
          }}
        >
          {/* Left — title + sliding-pill filter tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
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
                  fontSize: 9.5,
                  fontWeight: 700,
                  color: selectedContest
                    ? "#00d4aa"
                    : "var(--text-muted, #52525b)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginRight: 6,
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              >
                {tableTitle}
              </motion.span>
            </AnimatePresence>

            <FilterTabs
              statusFilter={statusFilter}
              labels={labels}
              onChange={setStatusFilter}
            />
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
                    padding: "2px 8px",
                    background: "rgba(0,212,170,0.08)",
                    border: "1px solid rgba(0,212,170,0.22)",
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
                      width="9" height="9" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                    >
                      <line x1="18" y1="6"  x2="6"  y2="18" />
                      <line x1="6"  y1="6"  x2="18" y2="18" />
                    </svg>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search input — wrapper ref for clear pulse */}
            <div ref={searchWrapRef} style={{ position: "relative" }}>
              <svg
                style={{
                  position: "absolute",
                  left: 7, top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
                width="10" height="10" viewBox="0 0 24 24"
                fill="none" stroke="var(--text-muted, #52525b)" strokeWidth="2"
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
                  e.target.style.borderColor = "rgba(0,212,170,0.35)";
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
                    onClick={handleClearSearch}
                    style={{
                      position: "absolute",
                      right: 5, top: "50%",
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
                      width="9" height="9" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                    >
                      <line x1="18" y1="6"  x2="6"  y2="18" />
                      <line x1="6"  y1="6"  x2="18" y2="18" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── COLUMN HEADERS ──────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "36px 1fr 84px 72px 22px",
            gap: 10,
            padding: "6px 14px 6px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(0,0,0,0.22)",
            position: "sticky",
            top: 0,
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          {[
            { label: "#",       align: "center" },
            { label: "Problem", align: "left"   },
            { label: "Status",  align: "left"   },
            { label: "Date",    align: "right"  },
            { label: "",        align: "left"   },
          ].map((col, i) => (
            <span
              key={i}
              style={{
                display: "block",
                fontSize: 9,
                fontWeight: 700,
                color: "rgba(255,255,255,0.25)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                textAlign: col.align as React.CSSProperties["textAlign"],
              }}
            >
              {col.label}
            </span>
          ))}
        </div>

        {/* ── ROWS ────────────────────────────────────────────────────────── */}
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
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: "7px 14px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
            background: "rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontFamily: "var(--font-mono, monospace)", color: "var(--text-muted, #52525b)" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00d4aa", opacity: 0.7, display: "inline-block" }} />
              {counts.solved} solved
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontFamily: "var(--font-mono, monospace)", color: "var(--text-muted, #52525b)" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#f59e0b", opacity: 0.7, display: "inline-block" }} />
              {counts.attempted} tried
            </span>
          </div>

          <span
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.14)",
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            {filteredProblems.length} problem{filteredProblems.length !== 1 ? "s" : ""}
            {statusFilter !== "all" ? ` · ${statusFilter} only` : ""}
            {selectedContest ? " · filtered" : ""}
          </span>
        </div>
      </motion.div>
    );
  },
);