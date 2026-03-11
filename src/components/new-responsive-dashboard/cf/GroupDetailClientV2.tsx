"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useTransform,
  useInView,
  useScroll,
  useSpring,
} from "framer-motion";
import type { CfGroup, CfGroupProblem } from "@/types";
import { HeroCard } from "./group-detail/HeroCard";
import { ActivityPulseBar } from "./group-detail/ActivityPulseBar";
import type { DayActivity } from "./group-detail/ActivityPulseBar";
// import { ContestsSection } from "./group-detail/ContestsSection";
import { ContestsSection } from "./group-detail/ContestSection";

import { ProblemsTable } from "./group-detail/ProblemsTable";

// import type { ContestSummary } from "./group-detail/ContestsSection";
import { ContestSummary } from "./group-detail/ContestSection";
import {
  PerformanceSection,
  type DiffPoint,
} from "./group-detail/PerformanceSection";

import { AnalyticsSection } from "./group-detail/AnalyticsSection";
import { RecommendedProblems2 } from "./group-detail/RecommendProblems2";
// ─────────────────────────────────────────────────────────────────────────────
// SECTION SEPARATOR  (full-width, centered label — replaces old Separator)
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL-IN SECTION WRAPPER
// Each major section fades + slides up as it enters the viewport
// ─────────────────────────────────────────────────────────────────────────────

function ScrollSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-48px 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.52, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION SEPARATOR — premium version
// Left-aligned label with teal dot, asymmetric gradient lines
// ─────────────────────────────────────────────────────────────────────────────

function SectionSeparator({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });

  return (
    // <motion.div
    //   ref={ref}
    //   initial={{ opacity: 0 }}
    //   animate={inView ? { opacity: 1 } : {}}
    //   transition={{ duration: 0.4, ease: "easeOut" }}
    //   style={{
    //     display: "flex",
    //     alignItems: "center",
    //     gap: 12,
    //     padding: "4px 0",
    //     userSelect: "none",
    //   }}
    // >
    //   {/* Teal dot */}
    //   <div
    //     style={{
    //       width: 5,
    //       height: 5,
    //       borderRadius: "50%",
    //       background: "#00d4aa",
    //       boxShadow: "0 0 8px rgba(0,212,170,0.6)",
    //       flexShrink: 0,
    //     }}
    //   />

    //   {/* Label */}
    //   <div
    //     style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
    //   >
    //     {icon && (
    //       <span
    //         style={{
    //           color: "rgba(0,212,170,0.5)",
    //           display: "flex",
    //           alignItems: "center",
    //         }}
    //       >
    //         {icon}
    //       </span>
    //     )}
    //     <span
    //       style={{
    //         fontSize: 9,
    //         fontWeight: 800,
    //         letterSpacing: "0.18em",
    //         textTransform: "uppercase",
    //         color: "rgba(255,255,255,0.28)",
    //         fontFamily: "var(--font-mono, monospace)",
    //         whiteSpace: "nowrap",
    //       }}
    //     >
    //       {children}
    //     </span>
    //   </div>

    //   {/* Right line — animated, gradient fading out */}
    //   <motion.div
    //     initial={{ scaleX: 0 }}
    //     animate={inView ? { scaleX: 1 } : {}}
    //     transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    //     style={{
    //       flex: 1,
    //       height: 1,
    //       background:
    //         "linear-gradient(to right, rgba(0,212,170,0.18), rgba(255,255,255,0.04) 40%, transparent)",
    //       transformOrigin: "left",
    //     }}
    //   />
    // </motion.div>

    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "4px 0",
        userSelect: "none",
      }}
    >
      {/* Left line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        style={{
          flex: 1,
          height: 1,
          background: "linear-gradient(to left, rgba(0,212,170,0.2), transparent)",
          transformOrigin: "right",
        }}
      />

      {/* Center label */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
        {icon && (
          <span style={{ color: "rgba(0,212,170,0.55)", display: "flex", alignItems: "center" }}>
            {icon}
          </span>
        )}
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.45)",
          fontFamily: "var(--font-mono, monospace)",
          whiteSpace: "nowrap",
        }}>
          {children}
        </span>
      </div>

      {/* Right line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        style={{
          flex: 1,
          height: 1,
          background: "linear-gradient(to right, rgba(0,212,170,0.2), transparent)",
          transformOrigin: "left",
        }}
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type PeerData = {
  recommended_problems: Array<{
    name: string;
    link: string;
    solvedCount: number;
    status: string;
  }>;
  submissionTimestamps: number[];
};

// ContestSummary and DiffPoint are owned by their component files

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const EASE_ENTER = [0.22, 1, 0.36, 1] as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

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

function contestDisplayName(
  name: string | null | undefined,
  id: string,
): string {
  return name?.trim() || `Contest ${id}`;
}

// function progressColor(pct: number): string {
//   if (pct >= 90) return "#00c853";
//   if (pct >= 70) return "#00d4aa";
//   if (pct >= 40) return "#f59e0b";
//   if (pct > 0) return "#f87171";
//   return "rgba(255,255,255,0.15)";
// }

function deriveActivityData(timestamps: number[]): DayActivity[] {
  const map = new Map<string, number>();
  for (const ts of timestamps) {
    const iso = new Date(ts * 1000).toISOString().slice(0, 10);
    map.set(iso, (map.get(iso) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        transformOrigin: "left",
        background: "linear-gradient(90deg, #00d4aa, #22c55e)",
        scaleX,
        zIndex: 9999,
        boxShadow: "0 0 8px rgba(0,212,170,0.6)",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED COUNTER
// ─────────────────────────────────────────────────────────────────────────────

// function Counter({
//   value,
//   duration = 1.2,
// }: {
//   value: number;
//   duration?: number;
// }) {
//   const count = useMotionValue(0);
//   const rounded = useTransform(count, Math.round);
//   const ref = useRef<HTMLSpanElement>(null);
//   const inView = useInView(ref, { once: true });

//   useEffect(() => {
//     if (!inView) return;
//     const ctrl = animate(count, value, { duration, ease: EASE_OUT });
//     return ctrl.stop;
//   }, [inView, value, count, duration]);

//   return <motion.span ref={ref}>{rounded}</motion.span>;
// }

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────

// function StatusBadge({ status }: { status: string }) {
//   const cfg = (
//     {
//       solved: { label: "Solved", bg: "rgba(0,200,83,0.12)", color: "#00c853" },
//       attempted: {
//         label: "Attempted",
//         bg: "rgba(245,158,11,0.12)",
//         color: "#f59e0b",
//       },
//       todo: {
//         label: "Todo",
//         bg: "rgba(255,255,255,0.05)",
//         color: "var(--text-secondary)",
//       },
//     } as Record<string, { label: string; bg: string; color: string }>
//   )[status] ?? {
//     label: status,
//     bg: "rgba(255,255,255,0.05)",
//     color: "var(--text-secondary)",
//   };
//   return (
//     <span
//       style={{
//         display: "inline-flex",
//         alignItems: "center",
//         gap: 5,
//         padding: "2px 8px",
//         borderRadius: 6,
//         background: cfg.bg,
//         color: cfg.color,
//         fontSize: 11,
//         fontWeight: 600,
//         whiteSpace: "nowrap",
//       }}
//     >
//       <span
//         style={{
//           width: 5,
//           height: 5,
//           borderRadius: "50%",
//           background: cfg.color,
//           flexShrink: 0,
//         }}
//       />
//       {cfg.label}
//     </span>
//   );
// }

// ─────────────────────────────────────────────────────────────────────────────
// SECTION WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

// function Section({
//   title,
//   children,
//   action,
//   delay = 0,
// }: {
//   title: string;
//   children: React.ReactNode;
//   action?: React.ReactNode;
//   delay?: number;
// }) {
//   const ref = useRef<HTMLDivElement>(null);
//   const inView = useInView(ref, { once: true, margin: "-60px" });

//   return (
//     <motion.div
//       ref={ref}
//       initial={{ opacity: 0, y: 20 }}
//       animate={inView ? { opacity: 1, y: 0 } : {}}
//       transition={{ duration: 0.5, delay, ease: EASE_ENTER }}
//       style={{
//         background: "var(--bg-surface, #111113)",
//         border: "1px solid rgba(255,255,255,0.06)",
//         borderRadius: 14,
//         overflow: "hidden",
//         position: "relative",
//       }}
//     >
//       {/* Bottom accent */}
//       <motion.div
//         initial={{ scaleX: 0 }}
//         animate={inView ? { scaleX: 1 } : {}}
//         transition={{ duration: 0.9, delay: delay + 0.2, ease: EASE_ENTER }}
//         style={{
//           position: "absolute",
//           bottom: 0,
//           left: 0,
//           right: 0,
//           height: 2,
//           background: "linear-gradient(90deg, #00d4aa, transparent)",
//           transformOrigin: "left",
//           opacity: 0.3,
//           pointerEvents: "none",
//         }}
//       />

//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           padding: "13px 18px",
//           borderBottom: "1px solid rgba(255,255,255,0.05)",
//         }}
//       >
//         <span
//           style={{
//             fontSize: 10,
//             fontWeight: 700,
//             color: "var(--text-muted, #71717a)",
//             letterSpacing: "0.1em",
//             textTransform: "uppercase",
//           }}
//         >
//           {title}
//         </span>
//         {action}
//       </div>

//       <div style={{ padding: "16px 18px" }}>{children}</div>
//     </motion.div>
//   );
// }

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM ROW
// ─────────────────────────────────────────────────────────────────────────────

// function ProblemRow({
//   problem,
//   contestName,
//   peerCount,
//   rowIndex,
// }: {
//   problem: CfGroupProblem;
//   contestName: string;
//   peerCount: number;
//   rowIndex: number;
// }) {
//   const [hovered, setHovered] = useState(false);
//   const showPeers = peerCount > 0 && problem.cf_status !== "solved";

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, y: 8 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -4 }}
//       transition={{ duration: 0.2, delay: Math.min(rowIndex * 0.022, 0.3) }}
//       onHoverStart={() => setHovered(true)}
//       onHoverEnd={() => setHovered(false)}
//       style={{
//         display: "grid",
//         gridTemplateColumns: "28px 1fr 100px 70px 30px",
//         alignItems: "center",
//         gap: 12,
//         padding: "9px 16px",
//         borderBottom: "1px solid rgba(255,255,255,0.04)",
//         background: hovered ? "rgba(0,212,170,0.025)" : "transparent",
//         position: "relative",
//         transition: "background 0.12s",
//       }}
//     >
//       {/* Left hover bar */}
//       <motion.div
//         animate={{ scaleY: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
//         transition={{ duration: 0.14 }}
//         style={{
//           position: "absolute",
//           left: 0,
//           top: 0,
//           bottom: 0,
//           width: 2,
//           background: "#00d4aa",
//           transformOrigin: "top",
//         }}
//       />

//       <span
//         style={{
//           fontSize: 11,
//           fontFamily: "var(--font-mono, monospace)",
//           fontWeight: 700,
//           color: "rgba(0,212,170,0.6)",
//           textAlign: "center",
//         }}
//       >
//         {problem.problem_index}
//       </span>

//       <div style={{ overflow: "hidden", minWidth: 0 }}>
//         <a
//           href={problem.problem_url}
//           target="_blank"
//           rel="noopener noreferrer"
//           style={{
//             fontSize: 13,
//             color: hovered ? "#00d4aa" : "var(--text-primary)",
//             textDecoration: "none",
//             display: "block",
//             overflow: "hidden",
//             textOverflow: "ellipsis",
//             whiteSpace: "nowrap",
//             transition: "color 0.12s",
//           }}
//         >
//           {problem.problem_name}
//         </a>
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: 6,
//             marginTop: 2,
//           }}
//         >
//           <span
//             style={{
//               fontSize: 10,
//               color: "var(--text-muted, #71717a)",
//               overflow: "hidden",
//               textOverflow: "ellipsis",
//               whiteSpace: "nowrap",
//             }}
//           >
//             {contestName}
//           </span>
//           {showPeers && (
//             <span
//               style={{
//                 fontSize: 9,
//                 fontWeight: 700,
//                 color: "rgba(0,212,170,0.55)",
//                 whiteSpace: "nowrap",
//                 flexShrink: 0,
//               }}
//             >
//               · {peerCount} solves
//             </span>
//           )}
//         </div>
//       </div>

//       <StatusBadge status={problem.cf_status} />

//       <span
//         style={{
//           fontSize: 11,
//           fontFamily: "var(--font-mono, monospace)",
//           color: problem.cf_rating ? "#00d4aa" : "rgba(255,255,255,0.15)",
//           textAlign: "right",
//         }}
//       >
//         {problem.cf_rating ?? "—"}
//       </span>

//       <a
//         href={problem.problem_url}
//         target="_blank"
//         rel="noopener noreferrer"
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           color: hovered ? "#00d4aa" : "rgba(255,255,255,0.2)",
//           transition: "color 0.12s",
//         }}
//       >
//         <svg
//           width="12"
//           height="12"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2"
//           strokeLinecap="round"
//         >
//           <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
//           <polyline points="15 3 21 3 21 9" />
//           <line x1="10" y1="14" x2="21" y2="3" />
//         </svg>
//       </a>
//     </motion.div>
//   );
// }

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  group: CfGroup;
  problems: CfGroupProblem[];
  selectedContestId: string | null;
  peerData: PeerData | null;
  dueProblems?: string[];
}

export function GroupDetailClientV2({
  group,
  problems,
  selectedContestId: initialSelected,
  peerData,
}: Props) {
  const [selectedContest, setSelectedContest] = useState<string | null>(
    initialSelected,
  );
  const tableRef = useRef<HTMLDivElement>(null);

  // ── Peer count map ────────────────────────────────────────────────────────
  const peerCountMap = useMemo(() => {
    const m = new Map<string, number>();
    if (!peerData) return m;
    for (const rp of peerData.recommended_problems)
      m.set(rp.link, rp.solvedCount);
    return m;
  }, [peerData]);

  // ── Contests ──────────────────────────────────────────────────────────────
  const contests = useMemo<ContestSummary[]>(() => {
    const map = new Map<string, CfGroupProblem[]>();
    for (const p of problems) {
      if (!map.has(p.contest_id)) map.set(p.contest_id, []);
      map.get(p.contest_id)!.push(p);
    }
    return Array.from(map.entries())
      .map(([id, probs]) => {
        const sorted = [...probs].sort(
          (a, b) => indexOrder(a.problem_index) - indexOrder(b.problem_index),
        );
        const solved = probs.filter((p) => p.cf_status === "solved").length;
        const attempted = probs.filter(
          (p) => p.cf_status === "attempted",
        ).length;
        const todo = probs.filter((p) => p.cf_status === "todo").length;
        const total = probs.length;
        const pct = total > 0 ? (solved / total) * 100 : 0;
        return {
          id,
          name: contestDisplayName(probs[0]?.contest_name, id),
          problems: sorted,
          solved,
          attempted,
          todo,
          total,
          pct,
        };
      })
      .sort((a, b) => {
        if (a.pct > 0 && a.pct < 100 && (b.pct === 0 || b.pct === 100))
          return -1;
        if (b.pct > 0 && b.pct < 100 && (a.pct === 0 || a.pct === 100))
          return 1;
        if (a.pct === 100 && b.pct !== 100) return -1;
        if (b.pct === 100 && a.pct !== 100) return 1;
        return b.solved - a.solved;
      });
  }, [problems]);

  // ── Difficulty points ─────────────────────────────────────────────────────
  const diffPoints = useMemo<DiffPoint[]>(() => {
    const map = new Map<string, { total: number; solved: number }>();
    for (const p of problems) {
      const cur = map.get(p.problem_index) ?? { total: 0, solved: 0 };
      map.set(p.problem_index, {
        total: cur.total + 1,
        solved: cur.solved + (p.cf_status === "solved" ? 1 : 0),
      });
    }
    return Array.from(map.entries())
      .map(([index, { total, solved }]) => ({
        index,
        total,
        solved,
        pct: total > 0 ? (solved / total) * 100 : 0,
      }))
      .sort((a, b) => indexOrder(a.index) - indexOrder(b.index));
  }, [problems]);

  // ── Lookup maps ───────────────────────────────────────────────────────────
  const contestNameMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of contests) m.set(c.id, c.name);
    return m;
  }, [contests]);

  // ── Next problem ──────────────────────────────────────────────────────────
  const nextProblem = useMemo(() => {
    const incomplete = [...contests]
      .filter((c) => c.pct < 100)
      .sort((a, b) =>
        a.pct > 0 && b.pct === 0
          ? -1
          : b.pct > 0 && a.pct === 0
            ? 1
            : b.pct - a.pct,
      )[0];
    if (!incomplete) return null;
    const unsolved = incomplete.problems.filter(
      (p: CfGroupProblem) => p.cf_status === "todo",
    );
    if (!unsolved.length) return null;
    const first = peerData
      ? unsolved.sort(
          (a: CfGroupProblem, b: CfGroupProblem) =>
            (peerCountMap.get(b.problem_url) ?? 0) -
            (peerCountMap.get(a.problem_url) ?? 0),
        )[0]
      : unsolved[0];
    return {
      index: first.problem_index,
      name: first.problem_name,
      url: first.problem_url,
      contestName: incomplete.name,
    };
  }, [contests, peerData, peerCountMap]);

  // ── Activity data ──────────────────────────────────────────────────────────
  const activityData = useMemo<DayActivity[]>(
    () => (peerData ? deriveActivityData(peerData.submissionTimestamps) : []),
    [peerData],
  );

  const completedContests = contests.filter((c) => c.pct === 100).length;

  // ── Contest click → scroll to table ───────────────────────────────────────
  const handleContestSelect = useCallback((id: string | null) => {
    setSelectedContest((prev) => (prev === id ? null : (id ?? null)));
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <ScrollProgressBar />

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {/* ── 1. Hero ─────────────────────────────────────────────────── */}
        <div style={{ paddingBottom: 32 }}>
          <HeroCard
            group={group}
            completedContests={completedContests}
            totalContests={contests.length}
            nextProblem={nextProblem}
          />
        </div>

        {/* ── 2. Activity ─────────────────────────────────────────────── */}
        <SectionSeparator
          icon={
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
        >
          Submission Activity
        </SectionSeparator>

        <div style={{ paddingTop: 14, paddingBottom: 32 }}>
          <ScrollSection>
            <ActivityPulseBar
              data={activityData}
              days={60}
              groupName={group.group_name}
              totalSubmissions={peerData?.submissionTimestamps.length ?? 0}
            />
          </ScrollSection>
        </div>

        {/* ── 3. Contests & Problems ───────────────────────────────────── */}
        <SectionSeparator
          icon={
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
              <path d="M18 2H6v7a6 6 0 0012 0V2z" />
            </svg>
          }
        >
          Contests &amp; Problems
        </SectionSeparator>

        <div style={{ paddingTop: 14, paddingBottom: 32 }}>
          <ScrollSection>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                alignItems: "start",
              }}
            >
              <ContestsSection
                contests={contests}
                selectedContest={selectedContest}
                onSelectContest={handleContestSelect}
              />
              <ProblemsTable
                ref={tableRef}
                problems={problems}
                contestNameMap={contestNameMap}
                selectedContest={selectedContest}
                onClearContest={() => setSelectedContest(null)}
              />
            </div>
          </ScrollSection>
        </div>

        {/* ── 4. Analytics ────────────────────────────────────────────── */}
        {contests.length > 0 && (
          <>
            <SectionSeparator
              icon={
                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              }
            >
              Insights &amp; Analytics
            </SectionSeparator>

            <div style={{ paddingTop: 14, paddingBottom: 32 }}>
              <ScrollSection>
                <AnalyticsSection contests={contests} problems={problems} />
              </ScrollSection>
            </div>
          </>
        )}

        {/* ── 5. Up Next ──────────────────────────────────────────────── */}
        <SectionSeparator
          icon={
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          }
        >
          What to Solve Next
        </SectionSeparator>

        <div style={{ paddingTop: 14, paddingBottom: 16 }}>
          <ScrollSection>
            <RecommendedProblems2 problems={problems} contests={contests} />
          </ScrollSection>
        </div>
      </div>
    </>
  );
}

// ── Re-export deriveContests (used by page.tsx if needed) ─────────────────────
export function deriveContests(problems: CfGroupProblem[]) {
  const map = new Map<string, CfGroupProblem[]>();
  for (const p of problems) {
    if (!map.has(p.contest_id)) map.set(p.contest_id, []);
    map.get(p.contest_id)!.push(p);
  }
  return Array.from(map.entries())
    .map(([id, probs]) => {
      const solved = probs.filter((p) => p.cf_status === "solved").length;
      const attempted = probs.filter((p) => p.cf_status === "attempted").length;
      const todo = probs.filter((p) => p.cf_status === "todo").length;
      const total = probs.length;
      const pct = total > 0 ? (solved / total) * 100 : 0;
      return {
        id,
        name: contestDisplayName(probs[0]?.contest_name, id),
        problems: [...probs].sort(
          (a, b) => indexOrder(a.problem_index) - indexOrder(b.problem_index),
        ),
        solved,
        attempted,
        todo,
        total,
        pct,
      };
    })
    .sort((a, b) => {
      if (a.pct > 0 && a.pct < 100 && (b.pct === 0 || b.pct === 100)) return -1;
      if (b.pct > 0 && b.pct < 100 && (a.pct === 0 || a.pct === 100)) return 1;
      if (a.pct === 100 && b.pct !== 100) return -1;
      if (b.pct === 100 && a.pct !== 100) return 1;
      return b.solved - a.solved;
    });
}
