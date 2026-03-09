// "use client";

// import {
//   useState,
//   useMemo,
//   useRef,
//   useEffect,
//   useCallback,
// } from "react";
// import {
//   motion,
//   AnimatePresence,
//   animate,
//   useMotionValue,
//   useTransform,
//   useInView,
// } from "framer-motion";
// import Link from "next/link";
// import type { CfGroup, CfGroupProblem } from "@/types";

// // ─────────────────────────────────────────────────────────────────────────────
// // TYPES
// // ─────────────────────────────────────────────────────────────────────────────

// type ProblemWithContest = CfGroupProblem;

// type ContestSummary = {
//   id: string;
//   name: string;
//   problems: ProblemWithContest[];
//   solved: number;
//   attempted: number;
//   todo: number;
//   total: number;
//   pct: number;
// };

// type DiffPoint = {
//   index: string;
//   total: number;
//   solved: number;
//   pct: number;
// };

// type StatusFilter = "all" | "todo" | "solved" | "attempted";

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────────────────────────────────────────

// function formatTimeAgo(iso: string | null): string {
//   if (!iso) return "Never";
//   const diff = Date.now() - new Date(iso).getTime();
//   const m = Math.floor(diff / 60000);
//   const h = Math.floor(diff / 3600000);
//   const d = Math.floor(diff / 86400000);
//   if (m < 1) return "Just now";
//   if (h < 1) return `${m}m ago`;
//   if (d < 1) return `${h}h ago`;
//   return `${d}d ago`;
// }

// // Sort problem indexes correctly: A < B < ... < Z < A1 < B1 ...
// function indexOrder(idx: string): number {
//   if (!idx) return 999;
//   const letter = idx.charCodeAt(0) - 65;
//   const num = idx.length > 1 ? parseInt(idx.slice(1), 10) || 0 : 0;
//   return letter + num * 26;
// }

// function barColor(pct: number): string {
//   if (pct >= 90) return "#00c853";
//   if (pct >= 70) return "#00d4aa";
//   if (pct >= 40) return "#ff9800";
//   if (pct > 0) return "#ff6b6b";
//   return "rgba(255,255,255,0.15)";
// }

// function contestDisplayName(name: string | null | undefined, id: string): string {
//   if (name && name.trim()) return name;
//   return `Contest ${id}`;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // ANIMATED COUNTER
// // ─────────────────────────────────────────────────────────────────────────────

// function Counter({ value, duration = 1.4 }: { value: number; duration?: number }) {
//   const count = useMotionValue(0);
//   const rounded = useTransform(count, Math.round);
//   const ref = useRef<HTMLSpanElement>(null);
//   const inView = useInView(ref, { once: true });

//   useEffect(() => {
//     if (!inView) return;
//     const ctrl = animate(count, value, {
//       duration,
//       ease: [0.16, 1, 0.3, 1],
//     });
//     return ctrl.stop;
//   }, [inView, value, count, duration]);

//   return <motion.span ref={ref}>{rounded}</motion.span>;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // PROGRESS RING
// // ─────────────────────────────────────────────────────────────────────────────

// function ProgressRing({ pct, size = 124 }: { pct: number; size?: number }) {
//   const sw = 7;
//   const r = (size - sw * 2) / 2;
//   const circ = 2 * Math.PI * r;
//   const offset = circ - (pct / 100) * circ;
//   const color = pct === 100 ? "#00c853" : "#00d4aa";

//   return (
//     <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
//       <circle cx={size / 2} cy={size / 2} r={r} fill="none"
//         stroke="rgba(255,255,255,0.07)" strokeWidth={sw} />
//       {/* Subtle glow track */}
//       <circle cx={size / 2} cy={size / 2} r={r} fill="none"
//         stroke={color} strokeWidth={sw + 4} strokeOpacity={0.06} />
//       <motion.circle
//         cx={size / 2} cy={size / 2} r={r}
//         fill="none" stroke={color} strokeWidth={sw}
//         strokeLinecap="round"
//         strokeDasharray={circ}
//         initial={{ strokeDashoffset: circ }}
//         animate={{ strokeDashoffset: offset }}
//         transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
//       />
//     </svg>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // STATUS BADGE
// // ─────────────────────────────────────────────────────────────────────────────

// function StatusBadge({ status }: { status: string }) {
//   const cfg = {
//     solved: { label: "Solved", bg: "rgba(0,200,83,0.12)", color: "#00c853" },
//     attempted: { label: "Attempted", bg: "rgba(255,152,0,0.12)", color: "#ff9800" },
//     todo: { label: "Todo", bg: "rgba(255,255,255,0.06)", color: "var(--text-secondary)" },
//   }[(status as "solved" | "attempted" | "todo")] ?? {
//     label: status, bg: "rgba(255,255,255,0.06)", color: "var(--text-secondary)",
//   };

//   return (
//     <span style={{
//       display: "inline-flex", alignItems: "center", gap: 5,
//       padding: "2px 8px", borderRadius: 6,
//       background: cfg.bg, color: cfg.color,
//       fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
//     }}>
//       <span style={{
//         width: 5, height: 5, borderRadius: "50%",
//         background: cfg.color, flexShrink: 0,
//       }} />
//       {cfg.label}
//     </span>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // CONTEST BAR ROW
// // ─────────────────────────────────────────────────────────────────────────────

// function ContestBarRow({
//   contest, isSelected, onSelect, delay,
// }: {
//   contest: ContestSummary;
//   isSelected: boolean;
//   onSelect: () => void;
//   delay: number;
// }) {
//   const barRef = useRef<HTMLDivElement>(null);
//   const inView = useInView(barRef, { once: true });
//   const isComplete = contest.pct === 100;
//   const isNotStarted = contest.pct === 0;
//   const color = barColor(contest.pct);

//   return (
//     <motion.div
//       initial={{ opacity: 0, x: -16 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ duration: 0.4, delay, ease: [0.25, 0.4, 0.25, 1] }}
//       onClick={onSelect}
//       style={{
//         padding: "12px 14px",
//         borderRadius: 10,
//         border: isSelected
//           ? "1px solid rgba(0,212,170,0.35)"
//           : "1px solid rgba(255,255,255,0.05)",
//         background: isSelected
//           ? "rgba(0,212,170,0.06)"
//           : "rgba(255,255,255,0.02)",
//         cursor: "pointer",
//         transition: "border-color 0.2s, background 0.2s",
//         position: "relative",
//         overflow: "hidden",
//       }}
//       whileHover={{
//         borderColor: isSelected ? "rgba(0,212,170,0.4)" : "rgba(0,212,170,0.18)",
//         backgroundColor: isSelected ? "rgba(0,212,170,0.06)" : "rgba(0,212,170,0.02)",
//       }}
//     >
//       {/* Left accent bar */}
//       <AnimatePresence>
//         {isSelected && (
//           <motion.div
//             initial={{ scaleY: 0 }}
//             animate={{ scaleY: 1 }}
//             exit={{ scaleY: 0 }}
//             transition={{ duration: 0.2 }}
//             style={{
//               position: "absolute", left: 0, top: 0, bottom: 0,
//               width: 3, background: "#00d4aa",
//               borderRadius: "10px 0 0 10px",
//               transformOrigin: "top",
//             }}
//           />
//         )}
//       </AnimatePresence>

//       <div style={{
//         display: "flex", alignItems: "center",
//         gap: 10, marginBottom: 8,
//       }}>
//         {/* Status icon */}
//         <div style={{
//           width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
//           background: isComplete
//             ? "rgba(0,200,83,0.15)"
//             : isNotStarted
//             ? "rgba(255,255,255,0.05)"
//             : "rgba(0,212,170,0.1)",
//           border: `1.5px solid ${isComplete
//             ? "rgba(0,200,83,0.4)"
//             : isNotStarted
//             ? "rgba(255,255,255,0.1)"
//             : "rgba(0,212,170,0.25)"}`,
//           display: "flex", alignItems: "center", justifyContent: "center",
//         }}>
//           {isComplete ? (
//             <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
//               stroke="#00c853" strokeWidth="3" strokeLinecap="round">
//               <polyline points="20 6 9 17 4 12" />
//             </svg>
//           ) : isNotStarted ? (
//             <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
//           ) : (
//             <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#00d4aa" }} />
//           )}
//         </div>

//         {/* Name */}
//         <span style={{
//           flex: 1, fontSize: 13, fontWeight: 500,
//           color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
//           overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//           transition: "color 0.15s",
//         }}>
//           {contest.name}
//         </span>

//         {/* Count + pct */}
//         <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
//           <span style={{
//             fontSize: 11, fontFamily: "var(--font-mono)",
//             color: "var(--text-secondary)",
//           }}>
//             {contest.solved}/{contest.total}
//           </span>
//           <span style={{
//             fontSize: 11, fontWeight: 700, color,
//             minWidth: 28, textAlign: "right",
//           }}>
//             {isComplete ? "✓" : isNotStarted ? "—" : `${Math.round(contest.pct)}%`}
//           </span>
//         </div>
//       </div>

//       {/* Progress bar */}
//       <div ref={barRef} style={{
//         height: 5, borderRadius: 3,
//         background: "rgba(255,255,255,0.06)", overflow: "hidden",
//       }}>
//         <motion.div
//           initial={{ width: 0 }}
//           animate={{ width: inView ? `${contest.pct}%` : 0 }}
//           transition={{ duration: 0.9, delay: delay + 0.05, ease: [0.16, 1, 0.3, 1] }}
//           style={{
//             height: "100%", borderRadius: 3,
//             background: isComplete
//               ? "linear-gradient(90deg, #00c853, #00d4aa)"
//               : `linear-gradient(90deg, #00d4aa80, ${color})`,
//           }}
//         />
//       </div>
//     </motion.div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // DIFFICULTY CHART
// // ─────────────────────────────────────────────────────────────────────────────

// function DifficultyChart({ points }: { points: DiffPoint[] }) {
//   const ref = useRef<HTMLDivElement>(null);
//   const inView = useInView(ref, { once: true });

//   if (points.length === 0) return null;

//   const getDropOffLabel = (pct: number, i: number, prev: number | null) => {
//     if (prev !== null && prev - pct > 20) return "↓ drop-off";
//     return null;
//   };

//   return (
//     <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 9 }}>
//       {points.map((pt, i) => {
//         const prevPct = i > 0 ? points[i - 1].pct : null;
//         const dropOff = getDropOffLabel(pt.pct, i, prevPct);
//         const color = barColor(pt.pct);

//         return (
//           <div key={pt.index} style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             {/* Index */}
//             <span style={{
//               width: 18, fontSize: 11, fontWeight: 700,
//               fontFamily: "var(--font-mono)", color,
//               textAlign: "center", flexShrink: 0,
//             }}>
//               {pt.index}
//             </span>

//             {/* Track */}
//             <div style={{
//               flex: 1, height: 7, borderRadius: 4,
//               background: "rgba(255,255,255,0.05)", overflow: "hidden",
//             }}>
//               <motion.div
//                 initial={{ width: 0 }}
//                 animate={{ width: inView ? `${pt.pct}%` : 0 }}
//                 transition={{
//                   duration: 0.75, delay: i * 0.055,
//                   ease: [0.16, 1, 0.3, 1],
//                 }}
//                 style={{ height: "100%", borderRadius: 4, background: color }}
//               />
//             </div>

//             {/* Stats */}
//             <div style={{
//               display: "flex", alignItems: "center", gap: 6,
//               flexShrink: 0, minWidth: 90,
//             }}>
//               <span style={{
//                 fontSize: 10, fontFamily: "var(--font-mono)",
//                 color: "var(--text-secondary)",
//               }}>
//                 {pt.solved}/{pt.total}
//               </span>
//               <span style={{
//                 fontSize: 10, fontWeight: 700, color,
//                 minWidth: 30, textAlign: "right",
//               }}>
//                 {Math.round(pt.pct)}%
//               </span>
//               {dropOff && (
//                 <span style={{
//                   fontSize: 9, color: "#ff6b6b",
//                   fontWeight: 600, letterSpacing: "0.02em",
//                 }}>
//                   {dropOff}
//                 </span>
//               )}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // PROBLEM TABLE ROW
// // ─────────────────────────────────────────────────────────────────────────────

// function ProblemRow({
//   problem,
//   contestName,
// }: {
//   problem: ProblemWithContest;
//   contestName: string;
// }) {
//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, y: 6 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0 }}
//       transition={{ duration: 0.18 }}
//       style={{
//         display: "grid",
//         gridTemplateColumns: "28px 1fr 100px 90px 30px",
//         alignItems: "center",
//         gap: 12,
//         padding: "9px 16px",
//         borderBottom: "1px solid rgba(255,255,255,0.04)",
//         transition: "background 0.12s",
//       }}
//       whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}
//     >
//       {/* Index */}
//       <span style={{
//         fontSize: 11, fontFamily: "var(--font-mono)",
//         fontWeight: 700, color: "rgba(0,212,170,0.6)",
//         textAlign: "center",
//       }}>
//         {problem.problem_index}
//       </span>

//       {/* Name + contest subtitle */}
//       <div style={{ overflow: "hidden", minWidth: 0 }}>
//         <a
//           href={problem.problem_url}
//           target="_blank"
//           rel="noopener noreferrer"
//           style={{
//             fontSize: 13, color: "var(--text-primary)",
//             textDecoration: "none",
//             display: "block",
//             overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//             transition: "color 0.12s",
//           }}
//           onMouseOver={e => (e.currentTarget.style.color = "#00d4aa")}
//           onMouseOut={e => (e.currentTarget.style.color = "var(--text-primary)")}
//         >
//           {problem.problem_name}
//         </a>
//         <span style={{
//           fontSize: 10, color: "var(--text-secondary)",
//           overflow: "hidden", textOverflow: "ellipsis",
//           whiteSpace: "nowrap", display: "block", marginTop: 1,
//         }}>
//           {contestName}
//         </span>
//       </div>

//       {/* Status */}
//       <StatusBadge status={problem.cf_status} />

//       {/* Rating */}
//       <span style={{
//         fontSize: 11, fontFamily: "var(--font-mono)",
//         color: problem.cf_rating ? "#00d4aa" : "rgba(255,255,255,0.2)",
//         textAlign: "right",
//       }}>
//         {problem.cf_rating ?? "—"}
//       </span>

//       {/* Open link */}
//       <a
//         href={problem.problem_url}
//         target="_blank"
//         rel="noopener noreferrer"
//         style={{
//           display: "flex", alignItems: "center", justifyContent: "center",
//           color: "rgba(255,255,255,0.2)", transition: "color 0.12s",
//         }}
//         onMouseOver={e => (e.currentTarget.style.color = "#00d4aa")}
//         onMouseOut={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
//       >
//         <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
//           stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//           <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
//           <polyline points="15 3 21 3 21 9" />
//           <line x1="10" y1="14" x2="21" y2="3" />
//         </svg>
//       </a>
//     </motion.div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // STAT CARD (hero section)
// // ─────────────────────────────────────────────────────────────────────────────

// function StatCard({
//   value, label, color, delay,
// }: {
//   value: number; label: string; color: string; delay: number;
// }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 12 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.45, delay, ease: [0.25, 0.4, 0.25, 1] }}
//       style={{
//         padding: "14px 16px",
//         background: "rgba(255,255,255,0.03)",
//         border: "1px solid rgba(255,255,255,0.06)",
//         borderRadius: 10,
//         flex: 1, minWidth: 80,
//       }}
//     >
//       <div style={{
//         fontSize: 22, fontWeight: 700,
//         color, letterSpacing: "-0.02em", lineHeight: 1,
//       }}>
//         <Counter value={value} />
//       </div>
//       <div style={{
//         fontSize: 11, color: "var(--text-secondary)",
//         marginTop: 4, fontWeight: 500,
//       }}>
//         {label}
//       </div>
//     </motion.div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // SECTION WRAPPER
// // ─────────────────────────────────────────────────────────────────────────────

// function Section({
//   title, children, action, delay = 0,
// }: {
//   title: string;
//   children: React.ReactNode;
//   action?: React.ReactNode;
//   delay?: number;
// }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 16 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay, ease: [0.25, 0.4, 0.25, 1] }}
//       style={{
//         background: "var(--bg-surface)",
//         border: "1px solid rgba(255,255,255,0.06)",
//         borderRadius: 14,
//         overflow: "hidden",
//       }}
//     >
//       <div style={{
//         display: "flex", alignItems: "center",
//         justifyContent: "space-between",
//         padding: "16px 20px",
//         borderBottom: "1px solid rgba(255,255,255,0.05)",
//       }}>
//         <span style={{
//           fontSize: 11, fontWeight: 700,
//           color: "var(--text-secondary)",
//           letterSpacing: "0.08em",
//           textTransform: "uppercase",
//         }}>
//           {title}
//         </span>
//         {action}
//       </div>
//       <div style={{ padding: "16px 20px" }}>
//         {children}
//       </div>
//     </motion.div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MAIN COMPONENT
// // ─────────────────────────────────────────────────────────────────────────────

// interface GroupDetailClientProps {
//   group: CfGroup;
//   problems: ProblemWithContest[];
//   selectedContestId: string | null;
// }

// export function GroupDetailClient({
//   group,
//   problems,
//   selectedContestId: initialSelected,
// }: GroupDetailClientProps) {
//   const [selectedContest, setSelectedContest] = useState<string | null>(initialSelected);
//   const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
//   const [search, setSearch] = useState("");
//   const tableRef = useRef<HTMLDivElement>(null);

//   // ── Derive contests ─────────────────────────────────────────────────────
//   const contests = useMemo<ContestSummary[]>(() => {
//     const map = new Map<string, ProblemWithContest[]>();
//     for (const p of problems) {
//       if (!map.has(p.contest_id)) map.set(p.contest_id, []);
//       map.get(p.contest_id)!.push(p);
//     }

//     return Array.from(map.entries())
//       .map(([id, probs]) => {
//         const sorted = [...probs].sort(
//           (a, b) => indexOrder(a.problem_index) - indexOrder(b.problem_index)
//         );
//         const solved = probs.filter(p => p.cf_status === "solved").length;
//         const attempted = probs.filter(p => p.cf_status === "attempted").length;
//         const todo = probs.filter(p => p.cf_status === "todo").length;
//         const total = probs.length;
//         const pct = total > 0 ? (solved / total) * 100 : 0;
//         const name = contestDisplayName(probs[0]?.contest_name, id);
//         return { id, name, problems: sorted, solved, attempted, todo, total, pct };
//       })
//       // Sort: in-progress first, then complete, then not started
//       .sort((a, b) => {
//         if (a.pct > 0 && a.pct < 100 && (b.pct === 0 || b.pct === 100)) return -1;
//         if (b.pct > 0 && b.pct < 100 && (a.pct === 0 || a.pct === 100)) return 1;
//         if (a.pct === 100 && b.pct !== 100) return -1;
//         if (b.pct === 100 && a.pct !== 100) return 1;
//         return b.solved - a.solved;
//       });
//   }, [problems]);

//   // ── Difficulty curve ────────────────────────────────────────────────────
//   const diffPoints = useMemo<DiffPoint[]>(() => {
//     const map = new Map<string, { total: number; solved: number }>();
//     for (const p of problems) {
//       const cur = map.get(p.problem_index) ?? { total: 0, solved: 0 };
//       map.set(p.problem_index, {
//         total: cur.total + 1,
//         solved: cur.solved + (p.cf_status === "solved" ? 1 : 0),
//       });
//     }
//     return Array.from(map.entries())
//       .map(([index, { total, solved }]) => ({
//         index, total, solved,
//         pct: total > 0 ? (solved / total) * 100 : 0,
//       }))
//       .sort((a, b) => indexOrder(a.index) - indexOrder(b.index));
//   }, [problems]);

//   // ── Contest name lookup ─────────────────────────────────────────────────
//   const contestNameMap = useMemo(() => {
//     const m = new Map<string, string>();
//     for (const c of contests) m.set(c.id, c.name);
//     return m;
//   }, [contests]);

//   // ── Next unsolved problem ───────────────────────────────────────────────
//   const nextProblem = useMemo(() => {
//     const incomplete = [...contests]
//       .filter(c => c.pct < 100)
//       .sort((a, b) => {
//         // Prefer in-progress over not-started
//         if (a.pct > 0 && b.pct === 0) return -1;
//         if (b.pct > 0 && a.pct === 0) return 1;
//         return b.pct - a.pct;
//       })[0];

//     if (!incomplete) return null;
//     const first = incomplete.problems.find(p => p.cf_status === "todo");
//     if (!first) return null;
//     return { problem: first, contestName: incomplete.name };
//   }, [contests]);

//   // ── Filtered problems for table ─────────────────────────────────────────
//   const filteredProblems = useMemo(() => {
//     let list: ProblemWithContest[] = selectedContest
//       ? problems.filter(p => p.contest_id === selectedContest)
//       : problems;

//     if (statusFilter !== "all") {
//       list = list.filter(p => p.cf_status === statusFilter);
//     }

//     if (search.trim()) {
//       const q = search.toLowerCase();
//       list = list.filter(
//         p =>
//           p.problem_name.toLowerCase().includes(q) ||
//           p.problem_index.toLowerCase() === q
//       );
//     }

//     return [...list].sort((a, b) => {
//       if (a.contest_id !== b.contest_id)
//         return a.contest_id.localeCompare(b.contest_id);
//       return indexOrder(a.problem_index) - indexOrder(b.problem_index);
//     });
//   }, [problems, selectedContest, statusFilter, search]);

//   // ── Filter counts ────────────────────────────────────────────────────────
//   const counts = useMemo(() => {
//     const base = selectedContest
//       ? problems.filter(p => p.contest_id === selectedContest)
//       : problems;
//     return {
//       all: base.length,
//       todo: base.filter(p => p.cf_status === "todo").length,
//       solved: base.filter(p => p.cf_status === "solved").length,
//       attempted: base.filter(p => p.cf_status === "attempted").length,
//     };
//   }, [problems, selectedContest]);

//   const completedContests = contests.filter(c => c.pct === 100).length;
//   const pct = group.progress_pct ?? 0;

//   // ── Contest select → scroll to table ────────────────────────────────────
//   const handleContestSelect = useCallback((id: string) => {
//     setSelectedContest(prev => prev === id ? null : id);
//     setStatusFilter("all");
//     setSearch("");
//     setTimeout(() => {
//       tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
//     }, 100);
//   }, []);

//   // ─────────────────────────────────────────────────────────────────────────
//   // RENDER
//   // ─────────────────────────────────────────────────────────────────────────

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

//       {/* ── Back navigation ─────────────────────────────────────────────── */}
//       <motion.div
//         initial={{ opacity: 0, x: -12 }}
//         animate={{ opacity: 1, x: 0 }}
//         transition={{ duration: 0.3 }}
//       >
//         <Link
//           href="/dashboard/groups"
//           style={{
//             display: "inline-flex", alignItems: "center", gap: 6,
//             fontSize: 12, fontWeight: 500,
//             color: "var(--text-secondary)",
//             textDecoration: "none",
//             padding: "4px 0",
//             transition: "color 0.15s",
//           }}
//           onMouseOver={(e: any) => (e.currentTarget.style.color = "#00d4aa")}
//           onMouseOut={(e: any) => (e.currentTarget.style.color = "var(--text-secondary)")}
//         >
//           <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
//             stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//             <path d="M19 12H5M12 5l-7 7 7 7" />
//           </svg>
//           CF Groups
//         </Link>
//       </motion.div>

//       {/* ── Hero section ────────────────────────────────────────────────── */}
//       <motion.div
//         initial={{ opacity: 0, y: 16 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
//         style={{
//           background: "var(--bg-surface)",
//           border: "1px solid rgba(255,255,255,0.06)",
//           borderRadius: 14,
//           padding: "24px",
//           position: "relative",
//           overflow: "hidden",
//         }}
//       >
//         {/* Ambient glow */}
//         <div style={{
//           position: "absolute", top: -60, right: -60,
//           width: 200, height: 200, borderRadius: "50%",
//           background: `radial-gradient(circle, rgba(0,212,170,${pct / 500}) 0%, transparent 70%)`,
//           pointerEvents: "none",
//         }} />

//         <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
//           {/* Progress ring + pct */}
//           <div style={{ position: "relative", flexShrink: 0 }}>
//             <ProgressRing pct={pct} size={124} />
//             <div style={{
//               position: "absolute", inset: 0,
//               display: "flex", flexDirection: "column",
//               alignItems: "center", justifyContent: "center",
//               gap: 1,
//             }}>
//               <span style={{
//                 fontSize: 22, fontWeight: 800,
//                 color: "var(--text-primary)",
//                 letterSpacing: "-0.03em", lineHeight: 1,
//               }}>
//                 <Counter value={pct} />%
//               </span>
//               <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>
//                 complete
//               </span>
//             </div>
//           </div>

//           {/* Right side info */}
//           <div style={{ flex: 1, minWidth: 200 }}>
//             {/* Group name + external link */}
//             <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
//               <h2 style={{
//                 fontSize: 18, fontWeight: 700,
//                 color: "var(--text-primary)",
//                 letterSpacing: "-0.02em", margin: 0,
//               }}>
//                 {group.group_name}
//               </h2>
//               {group.group_url && (
//                 <a
//                   href={group.group_url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   style={{ color: "var(--text-secondary)", transition: "color 0.15s" }}
//                   onMouseOver={(e: any) => (e.currentTarget.style.color = "#00d4aa")}
//                   onMouseOut={(e: any) => (e.currentTarget.style.color = "var(--text-secondary)")}
//                 >
//                   <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
//                     stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//                     <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
//                     <polyline points="15 3 21 3 21 9" />
//                     <line x1="10" y1="14" x2="21" y2="3" />
//                   </svg>
//                 </a>
//               )}
//             </div>

//             {/* Stat cards row */}
//             <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
//               <StatCard value={group.solved_count ?? 0} label="Solved" color="#00c853" delay={0.15} />
//               <StatCard value={group.todo_count ?? 0} label="To Do" color="var(--text-secondary)" delay={0.2} />
//               <StatCard value={group.attempted_count ?? 0} label="Attempted" color="#ff9800" delay={0.25} />
//               <StatCard value={contests.length} label="Contests" color="#00d4aa" delay={0.3} />
//               <StatCard value={completedContests} label="Finished" color="#00c853" delay={0.35} />
//             </div>

//             {/* Continue CTA + last synced */}
//             <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
//               {nextProblem && (
//                 <motion.a
//                   href={nextProblem.problem.problem_url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   initial={{ opacity: 0, scale: 0.95 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.5, duration: 0.3 }}
//                   style={{
//                     display: "inline-flex", alignItems: "center", gap: 7,
//                     padding: "8px 16px",
//                     background: "rgba(0,212,170,0.12)",
//                     border: "1px solid rgba(0,212,170,0.3)",
//                     borderRadius: 9,
//                     color: "#00d4aa",
//                     fontSize: 12, fontWeight: 700,
//                     textDecoration: "none",
//                     transition: "all 0.15s",
//                   }}
//                   whileHover={{
//                     background: "rgba(0,212,170,0.18)",
//                     borderColor: "rgba(0,212,170,0.5)",
//                     scale: 1.02,
//                   }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
//                     stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
//                     <polygon points="5 3 19 12 5 21 5 3" />
//                   </svg>
//                   Continue: {nextProblem.problem.problem_index} · {nextProblem.problem.problem_name.slice(0, 24)}{nextProblem.problem.problem_name.length > 24 ? "..." : ""}
//                 </motion.a>
//               )}

//               {group.last_synced && (
//                 <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
//                   Synced {formatTimeAgo(group.last_synced)}
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>
//       </motion.div>

//       {/* ── Two-column: Contests + Difficulty chart ──────────────────────── */}
//       <div style={{
//         display: "grid",
//         gridTemplateColumns: "1fr 340px",
//         gap: 16,
//       }}>

//         {/* Contest Breakdown */}
//         <Section title="Contests" delay={0.1}>
//           <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
//             {contests.map((c, i) => (
//               <ContestBarRow
//                 key={c.id}
//                 contest={c}
//                 isSelected={selectedContest === c.id}
//                 onSelect={() => handleContestSelect(c.id)}
//                 delay={0.05 * i}
//               />
//             ))}
//           </div>
//         </Section>

//         {/* Right column: Difficulty chart + insight */}
//         <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

//           {/* Difficulty Curve */}
//           <Section
//             title="Performance by position"
//             delay={0.15}
//             action={
//               <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>
//                 A = easiest → {diffPoints[diffPoints.length - 1]?.index ?? "?"} = hardest
//               </span>
//             }
//           >
//             <DifficultyChart points={diffPoints} />
//           </Section>

//           {/* Insight card */}
//           {diffPoints.length > 0 && (() => {
//             const dropOff = diffPoints.find((p, i) =>
//               i > 0 && diffPoints[i - 1].pct - p.pct > 20
//             );
//             const weakest = [...diffPoints].sort((a, b) => a.pct - b.pct)[0];
//             return (
//               <motion.div
//                 initial={{ opacity: 0, y: 12 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.4, duration: 0.4 }}
//                 style={{
//                   padding: "14px 16px",
//                   background: "rgba(0,212,170,0.04)",
//                   border: "1px solid rgba(0,212,170,0.1)",
//                   borderRadius: 10,
//                 }}
//               >
//                 <div style={{
//                   fontSize: 10, fontWeight: 700,
//                   color: "#00d4aa", letterSpacing: "0.08em",
//                   textTransform: "uppercase", marginBottom: 8,
//                 }}>
//                   Insight
//                 </div>
//                 {dropOff ? (
//                   <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
//                     Your solve rate drops at position{" "}
//                     <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
//                       {dropOff.index}
//                     </span>
//                     {" "}({Math.round(dropOff.pct)}% vs{" "}
//                     {Math.round(diffPoints[diffPoints.indexOf(dropOff) - 1]?.pct ?? 0)}% before).
//                     Focus here to improve your contest performance.
//                   </p>
//                 ) : (
//                   <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
//                     Your weakest position is{" "}
//                     <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
//                       {weakest.index}
//                     </span>{" "}
//                     at {Math.round(weakest.pct)}% solve rate. Prioritise those problems to level up.
//                   </p>
//                 )}
//               </motion.div>
//             );
//           })()}
//         </div>
//       </div>

//       {/* ── Problem Explorer ─────────────────────────────────────────────── */}
//       <motion.div
//         ref={tableRef}
//         initial={{ opacity: 0, y: 16 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
//         style={{
//           background: "var(--bg-surface)",
//           border: "1px solid rgba(255,255,255,0.06)",
//           borderRadius: 14,
//           overflow: "hidden",
//         }}
//       >
//         {/* Table header */}
//         <div style={{
//           display: "flex", alignItems: "center",
//           justifyContent: "space-between",
//           padding: "14px 16px",
//           borderBottom: "1px solid rgba(255,255,255,0.05)",
//           flexWrap: "wrap", gap: 10,
//         }}>
//           {/* Filter tabs */}
//           <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
//             {(["all", "todo", "solved", "attempted"] as StatusFilter[]).map(f => {
//               const labels: Record<StatusFilter, string> = {
//                 all: `All (${counts.all})`,
//                 todo: `Todo (${counts.todo})`,
//                 solved: `Solved (${counts.solved})`,
//                 attempted: `Tried (${counts.attempted})`,
//               };
//               const active = statusFilter === f;
//               return (
//                 <button
//                   key={f}
//                   onClick={() => setStatusFilter(f)}
//                   style={{
//                     padding: "4px 10px", borderRadius: 6,
//                     border: active
//                       ? "1px solid rgba(0,212,170,0.35)"
//                       : "1px solid rgba(255,255,255,0.07)",
//                     background: active ? "rgba(0,212,170,0.1)" : "transparent",
//                     color: active ? "#00d4aa" : "var(--text-secondary)",
//                     fontSize: 11, fontWeight: 600,
//                     cursor: "pointer", transition: "all 0.15s",
//                   }}
//                 >
//                   {labels[f]}
//                 </button>
//               );
//             })}
//           </div>

//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             {/* Selected contest indicator */}
//             <AnimatePresence>
//               {selectedContest && (
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   exit={{ opacity: 0, scale: 0.9 }}
//                   style={{
//                     display: "flex", alignItems: "center", gap: 6,
//                     padding: "3px 8px",
//                     background: "rgba(0,212,170,0.08)",
//                     border: "1px solid rgba(0,212,170,0.2)",
//                     borderRadius: 6,
//                   }}
//                 >
//                   <span style={{ fontSize: 11, color: "#00d4aa", fontWeight: 500, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                     {contestNameMap.get(selectedContest) ?? selectedContest}
//                   </span>
//                   <button
//                     onClick={() => setSelectedContest(null)}
//                     style={{
//                       background: "none", border: "none",
//                       color: "rgba(0,212,170,0.6)", cursor: "pointer",
//                       padding: 0, lineHeight: 1, fontSize: 14,
//                     }}
//                   >
//                     ×
//                   </button>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* Search */}
//             <div style={{ position: "relative" }}>
//               <svg
//                 style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }}
//                 width="11" height="11" viewBox="0 0 24 24" fill="none"
//                 stroke="var(--text-secondary)" strokeWidth="2"
//               >
//                 <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
//               </svg>
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 value={search}
//                 onChange={e => setSearch(e.target.value)}
//                 style={{
//                   paddingLeft: 26, paddingRight: 10,
//                   paddingTop: 5, paddingBottom: 5,
//                   background: "rgba(255,255,255,0.04)",
//                   border: "1px solid rgba(255,255,255,0.08)",
//                   borderRadius: 7,
//                   color: "var(--text-primary)",
//                   fontSize: 11,
//                   outline: "none",
//                   width: 140,
//                   transition: "border-color 0.15s",
//                 }}
//                 onFocus={e => (e.target.style.borderColor = "rgba(0,212,170,0.3)")}
//                 onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Column headers */}
//         <div style={{
//           display: "grid",
//           gridTemplateColumns: "28px 1fr 100px 90px 30px",
//           gap: 12, padding: "7px 16px",
//           borderBottom: "1px solid rgba(255,255,255,0.04)",
//           background: "rgba(0,0,0,0.1)",
//         }}>
//           {["#", "Problem", "Status", "Rating", ""].map((h, i) => (
//             <span key={i} style={{
//               fontSize: 10, fontWeight: 600,
//               color: "var(--text-secondary)",
//               textTransform: "uppercase",
//               letterSpacing: "0.07em",
//               textAlign: i === 3 ? "right" : "left",
//             }}>
//               {h}
//             </span>
//           ))}
//         </div>

//         {/* Rows */}
//         <div style={{ maxHeight: 480, overflowY: "auto" }}>
//           <AnimatePresence mode="popLayout">
//             {filteredProblems.length === 0 ? (
//               <motion.div
//                 key="empty"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 style={{
//                   padding: "40px 16px",
//                   textAlign: "center",
//                   color: "var(--text-secondary)",
//                   fontSize: 13,
//                 }}
//               >
//                 No {statusFilter !== "all" ? statusFilter : ""} problems
//                 {search ? ` matching "${search}"` : ""}
//               </motion.div>
//             ) : (
//               filteredProblems.map(p => (
//                 <ProblemRow
//                   key={p.id}
//                   problem={p}
//                   contestName={contestNameMap.get(p.contest_id) ?? p.contest_id}
//                 />
//               ))
//             )}
//           </AnimatePresence>
//         </div>

//         {/* Footer */}
//         {filteredProblems.length > 0 && (
//           <div style={{
//             padding: "8px 16px",
//             borderTop: "1px solid rgba(255,255,255,0.04)",
//             display: "flex", justifyContent: "flex-end",
//           }}>
//             <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
//               {filteredProblems.length} problem{filteredProblems.length !== 1 ? "s" : ""}
//             </span>
//           </div>
//         )}
//       </motion.div>
//     </div>
//   );
// }



