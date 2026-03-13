// "use client";

// import {
//   useState,
//   useMemo,
//   useRef,
//   useEffect,
//   useCallback,
//   useLayoutEffect,
// } from "react";
// import {
//   motion,
//   AnimatePresence,
//   animate,
//   useMotionValue,
//   useTransform,
//   useInView,
//   useSpring,
// } from "framer-motion";
// import Link from "next/link";
// import type {
//   CfGroup,
//   CfGroupProblem,
//   UserCfAuth,
//   CfSyncStatus,
// } from "@/types";

// // ─────────────────────────────────────────────────────────────────────────────
// // TYPES
// // ─────────────────────────────────────────────────────────────────────────────

// type GroupWithProblems = CfGroup & { problems: CfGroupProblem[] };

// interface Props {
//   groups: GroupWithProblems[];
//   cfAuth: UserCfAuth | null;
//   lastSynced: string | null;
//   userId: string;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // DESIGN TOKENS
// // ─────────────────────────────────────────────────────────────────────────────

// const D = {
//   surface: "var(--bg-surface,  #111114)",
//   elevated: "var(--bg-elevated, #16161a)",
//   border: "rgba(255,255,255,0.07)",
//   muted: "var(--text-muted,     #52525b)",
//   secondary: "var(--text-secondary, #a1a1aa)",
//   primary: "var(--text-primary,   #f4f4f5)",
//   teal: "#00d4aa",
//   amber: "#fbbf24",
//   red: "#f87171",
//   green: "#4ade80",
//   mono: "var(--font-mono, 'JetBrains Mono', monospace)",
//   sans: "var(--font-sans, system-ui, sans-serif)",
// } as const;

// const EASE = [0.22, 1, 0.36, 1] as const;

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────────────────────────────────────────

// function formatTimeAgo(iso: string | null): string {
//   if (!iso) return "Never";
//   const diff = Date.now() - new Date(iso).getTime();
//   const m = Math.floor(diff / 60_000);
//   const h = Math.floor(diff / 3_600_000);
//   const d = Math.floor(diff / 86_400_000);
//   if (m < 1) return "Just now";
//   if (h < 1) return `${m}m ago`;
//   if (d < 1) return `${h}h ago`;
//   return `${d}d ago`;
// }

// function syncColor(iso: string | null): string {
//   if (!iso) return D.red;
//   const h = (Date.now() - new Date(iso).getTime()) / 3_600_000;
//   if (h < 24) return D.green;
//   if (h < 72) return D.amber;
//   return D.red;
// }

// function indexOrder(idx: string): number {
//   if (!idx) return 999;
//   return (
//     idx.charCodeAt(0) -
//     65 +
//     (idx.length > 1 ? (parseInt(idx.slice(1), 10) || 0) * 26 : 0)
//   );
// }

// function pctColor(pct: number): string {
//   if (pct === 100) return D.green;
//   if (pct >= 70) return D.teal;
//   if (pct >= 40) return D.amber;
//   if (pct > 0) return "#fb923c";
//   return "rgba(255,255,255,0.18)";
// }

// /** Next unsolved problem in the most-active incomplete contest */
// function getNextProblem(
//   g: GroupWithProblems,
// ): { index: string; name: string; url: string; contestName: string } | null {
//   const byContest = new Map<string, CfGroupProblem[]>();
//   for (const p of g.problems) {
//     if (!byContest.has(p.contest_id)) byContest.set(p.contest_id, []);
//     byContest.get(p.contest_id)!.push(p);
//   }

//   const contests = Array.from(byContest.entries())
//     .map(([id, probs]) => {
//       const solved = probs.filter((p) => p.cf_status === "solved").length;
//       const total = probs.length;
//       const pct = total > 0 ? solved / total : 0;
//       return {
//         id,
//         probs,
//         solved,
//         total,
//         pct,
//         name: probs[0]?.contest_name ?? `Contest ${id}`,
//       };
//     })
//     .filter((c) => c.pct < 1)
//     .sort((a, b) => b.pct - a.pct); // most progress first

//   for (const c of contests) {
//     const unsolved = [...c.probs]
//       .filter((p) => p.cf_status === "todo")
//       .sort(
//         (a, b) => indexOrder(a.problem_index) - indexOrder(b.problem_index),
//       );
//     if (unsolved.length > 0) {
//       return {
//         index: unsolved[0].problem_index,
//         name: unsolved[0].problem_name,
//         url: unsolved[0].problem_url,
//         contestName: c.name,
//       };
//     }
//   }
//   return null;
// }

// /** 30-day solved activity bars from solved_at */
// function get30DayActivity(problems: CfGroupProblem[]): number[] {
//   const counts = Array<number>(30).fill(0);
//   const now = Date.now();
//   for (const p of problems) {
//     if (p.cf_status !== "solved" || !p.solved_at) continue;
//     const daysAgo = Math.floor(
//       (now - new Date(p.solved_at).getTime()) / 86_400_000,
//     );
//     if (daysAgo >= 0 && daysAgo < 30) counts[29 - daysAgo]++;
//   }
//   return counts;
// }

// /** Contest pills — up to 6, sorted active → complete → todo */
// function getContestPills(g: GroupWithProblems) {
//   const map = new Map<string, CfGroupProblem[]>();
//   for (const p of g.problems) {
//     if (!map.has(p.contest_id)) map.set(p.contest_id, []);
//     map.get(p.contest_id)!.push(p);
//   }
//   return Array.from(map.entries())
//     .map(([id, probs]) => {
//       const solved = probs.filter((p) => p.cf_status === "solved").length;
//       const total = probs.length;
//       const pct = total > 0 ? (solved / total) * 100 : 0;
//       const name = probs[0]?.contest_name ?? `Contest ${id}`;
//       return { id, name, pct, solved, total };
//     })
//     .sort((a, b) => {
//       // active > complete > untouched
//       const aActive = a.pct > 0 && a.pct < 100;
//       const bActive = b.pct > 0 && b.pct < 100;
//       if (aActive && !bActive) return -1;
//       if (!aActive && bActive) return 1;
//       if (a.pct === 100 && b.pct !== 100) return -1;
//       if (b.pct === 100 && a.pct !== 100) return 1;
//       return b.solved - a.solved;
//     })
//     .slice(0, 6);
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // ANIMATED COUNTER
// // ─────────────────────────────────────────────────────────────────────────────

// function Counter({
//   value,
//   duration = 1.3,
// }: {
//   value: number;
//   duration?: number;
// }) {
//   const mv = useMotionValue(0);
//   const rounded = useTransform(mv, Math.round);
//   const ref = useRef<HTMLSpanElement>(null);
//   const inView = useInView(ref, { once: true });

//   useEffect(() => {
//     if (!inView) return;
//     const ctrl = animate(mv, value, { duration, ease: [0.16, 1, 0.3, 1] });
//     return ctrl.stop;
//   }, [inView, value, mv, duration]);

//   return <motion.span ref={ref}>{rounded}</motion.span>;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // PROGRESS RING
// // ─────────────────────────────────────────────────────────────────────────────

// function ProgressRing({ pct, size = 80 }: { pct: number; size?: number }) {
//   const sw = 5.5;
//   const r = (size - sw * 2) / 2;
//   const circ = 2 * Math.PI * r;
//   const color = pctColor(pct);

//   return (
//     <svg
//       width={size}
//       height={size}
//       style={{ transform: "rotate(-90deg)", flexShrink: 0 }}
//       aria-label={`${Math.round(pct)}% progress`}
//     >
//       {/* Track */}
//       <circle
//         cx={size / 2}
//         cy={size / 2}
//         r={r}
//         fill="none"
//         stroke="rgba(255,255,255,0.06)"
//         strokeWidth={sw}
//       />
//       {/* Glow halo */}
//       <circle
//         cx={size / 2}
//         cy={size / 2}
//         r={r}
//         fill="none"
//         stroke={color}
//         strokeWidth={sw + 5}
//         strokeOpacity={0.07}
//       />
//       {/* Progress arc */}
//       <motion.circle
//         cx={size / 2}
//         cy={size / 2}
//         r={r}
//         fill="none"
//         stroke={color}
//         strokeWidth={sw}
//         strokeLinecap="round"
//         strokeDasharray={circ}
//         initial={{ strokeDashoffset: circ }}
//         animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
//         transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
//       />
//     </svg>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MINI ACTIVITY STRIP
// // ─────────────────────────────────────────────────────────────────────────────

// function ActivityStrip({ problems }: { problems: CfGroupProblem[] }) {
//   const bars = useMemo(() => get30DayActivity(problems), [problems]);
//   const ref = useRef<HTMLDivElement>(null);
//   const inView = useInView(ref, { once: true });
//   const maxBar = Math.max(...bars, 1);

//   const hasSolves = bars.some((b) => b > 0);
//   if (!hasSolves) {
//     return (
//       <div
//         ref={ref}
//         style={{ height: 28, display: "flex", alignItems: "center" }}
//       >
//         <span style={{ fontSize: 9, color: D.muted, fontFamily: D.mono }}>
//           no activity yet
//         </span>
//       </div>
//     );
//   }

//   return (
//     <div
//       ref={ref}
//       style={{
//         display: "flex",
//         alignItems: "flex-end",
//         gap: 1.5,
//         height: 28,
//       }}
//       aria-label="30-day solve activity"
//     >
//       {bars.map((count, i) => {
//         const isToday = i === bars.length - 1;
//         const hPct = count === 0 ? 8 : Math.max((count / maxBar) * 100, 18);
//         const alpha = 0.2 + (count / maxBar) * 0.7;

//         return (
//           <motion.div
//             key={i}
//             initial={{ scaleY: 0, opacity: 0 }}
//             animate={inView ? { scaleY: 1, opacity: 1 } : {}}
//             transition={{
//               scaleY: { duration: 0.35, delay: i * 0.012, ease: EASE },
//               opacity: { duration: 0.2, delay: i * 0.012 },
//             }}
//             style={{
//               flex: 1,
//               height: `${hPct}%`,
//               borderRadius: "2px 2px 1px 1px",
//               background:
//                 count === 0
//                   ? "rgba(255,255,255,0.05)"
//                   : isToday
//                     ? D.teal
//                     : `rgba(0,212,170,${alpha})`,
//               transformOrigin: "bottom",
//               boxShadow:
//                 isToday && count > 0 ? "0 0 6px rgba(0,212,170,0.4)" : "none",
//             }}
//           />
//         );
//       })}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // CONTEST PILLS
// // ─────────────────────────────────────────────────────────────────────────────

// function ContestPills({ g }: { g: GroupWithProblems }) {
//   const ref = useRef<HTMLDivElement>(null);
//   const inView = useInView(ref, { once: true });
//   const pills = useMemo(() => getContestPills(g), [g]);

//   return (
//     <div ref={ref} style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
//       {pills.map((c, i) => {
//         const col = pctColor(c.pct);
//         return (
//           <motion.div
//             key={c.id}
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={inView ? { opacity: 1, scale: 1 } : {}}
//             transition={{
//               delay: 0.06 + i * 0.055,
//               type: "spring",
//               stiffness: 400,
//               damping: 22,
//             }}
//             title={`${c.name}: ${c.solved}/${c.total}`}
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 4,
//               padding: "2px 7px",
//               borderRadius: 5,
//               background: `${col}12`,
//               border: `1px solid ${col}28`,
//               maxWidth: 110,
//               overflow: "hidden",
//             }}
//           >
//             {/* Tiny fill bar */}
//             <div
//               style={{
//                 position: "relative",
//                 width: 22,
//                 height: 3,
//                 borderRadius: 2,
//                 background: "rgba(255,255,255,0.08)",
//                 flexShrink: 0,
//               }}
//             >
//               <motion.div
//                 initial={{ width: 0 }}
//                 animate={inView ? { width: `${c.pct}%` } : {}}
//                 transition={{
//                   duration: 0.5,
//                   delay: 0.2 + i * 0.05,
//                   ease: EASE,
//                 }}
//                 style={{
//                   position: "absolute",
//                   left: 0,
//                   top: 0,
//                   bottom: 0,
//                   borderRadius: 2,
//                   background: col,
//                 }}
//               />
//             </div>
//             <span
//               style={{
//                 fontSize: 9.5,
//                 fontFamily: D.mono,
//                 color: col,
//                 fontWeight: 600,
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 whiteSpace: "nowrap",
//                 maxWidth: 68,
//               }}
//             >
//               {c.name.length > 9 ? c.name.slice(0, 8) + "…" : c.name}
//             </span>
//           </motion.div>
//         );
//       })}
//       {getContestPills(g).length < g.problems.length &&
//         (() => {
//           const totalContests = new Set(g.problems.map((p) => p.contest_id))
//             .size;
//           const shown = Math.min(totalContests, 6);
//           if (totalContests <= 6) return null;
//           return (
//             <span
//               style={{
//                 fontSize: 9,
//                 color: D.muted,
//                 fontFamily: D.mono,
//                 padding: "2px 6px",
//                 alignSelf: "center",
//               }}
//             >
//               +{totalContests - shown}
//             </span>
//           );
//         })()}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // GROUP CARD — main interactive tile
// // ─────────────────────────────────────────────────────────────────────────────

// function GroupCard({ g, index }: { g: GroupWithProblems; index: number }) {
//   const cardRef = useRef<HTMLDivElement>(null);
//   const inView = useInView(cardRef, { once: true, margin: "-40px" });
//   const [glow, setGlow] = useState({ x: 50, y: 50 });
//   const [hovered, setHovered] = useState(false);

//   const nextProblem = useMemo(() => getNextProblem(g), [g]);
//   const color = pctColor(g.progress_pct);
//   const isComplete = g.progress_pct === 100;

//   // Mouse-tracking radial glow (MagicCard effect)
//   const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
//     const rect = cardRef.current?.getBoundingClientRect();
//     if (!rect) return;
//     setGlow({
//       x: ((e.clientX - rect.left) / rect.width) * 100,
//       y: ((e.clientY - rect.top) / rect.height) * 100,
//     });
//   }, []);

//   const totalContests = useMemo(
//     () => new Set(g.problems.map((p) => p.contest_id)).size,
//     [g.problems],
//   );
//   const completedContests = useMemo(() => {
//     const map = new Map<string, { solved: number; total: number }>();
//     for (const p of g.problems) {
//       const c = map.get(p.contest_id) ?? { solved: 0, total: 0 };
//       map.set(p.contest_id, {
//         solved: c.solved + (p.cf_status === "solved" ? 1 : 0),
//         total: c.total + 1,
//       });
//     }
//     return Array.from(map.values()).filter(
//       (c) => c.solved === c.total && c.total > 0,
//     ).length;
//   }, [g.problems]);

//   return (
//     <motion.div
//       ref={cardRef}
//       initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
//       animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
//       transition={{ duration: 0.48, delay: index * 0.07, ease: EASE }}
//       onMouseMove={onMouseMove}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       style={{
//         position: "relative",
//         background: D.surface,
//         border: `1px solid ${hovered ? "rgba(0,212,170,0.18)" : D.border}`,
//         borderRadius: 16,
//         overflow: "hidden",
//         display: "flex",
//         flexDirection: "column",
//         transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
//         transform: hovered ? "translateY(-3px)" : "translateY(0)",
//         boxShadow: hovered
//           ? "0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,212,170,0.08)"
//           : "0 4px 16px rgba(0,0,0,0.25)",
//         cursor: "default",
//       }}
//     >
//       {/* Mouse-following radial glow */}
//       <div
//         aria-hidden
//         style={{
//           position: "absolute",
//           inset: 0,
//           background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(0,212,170,${hovered ? 0.065 : 0}) 0%, transparent 65%)`,
//           transition: "background 0.1s",
//           pointerEvents: "none",
//           borderRadius: 16,
//           zIndex: 0,
//         }}
//       />

//       {/* Top accent line — color by progress */}
//       <motion.div
//         initial={{ scaleX: 0 }}
//         animate={inView ? { scaleX: 1 } : {}}
//         transition={{ duration: 0.9, delay: index * 0.07 + 0.25, ease: EASE }}
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           right: 0,
//           height: 2,
//           background: `linear-gradient(90deg, ${color}, transparent)`,
//           transformOrigin: "left",
//           opacity: 0.7,
//           zIndex: 1,
//         }}
//       />

//       {/* Content */}
//       <div
//         style={{
//           position: "relative",
//           zIndex: 1,
//           padding: "18px 20px",
//           display: "flex",
//           flexDirection: "column",
//           gap: 14,
//           flex: 1,
//         }}
//       >
//         {/* ── HEADER ───────────────────────────────────────────────────── */}
//         <div
//           style={{
//             display: "flex",
//             alignItems: "flex-start",
//             justifyContent: "space-between",
//             gap: 8,
//           }}
//         >
//           <div style={{ minWidth: 0, flex: 1 }}>
//             <h3
//               style={{
//                 margin: 0,
//                 fontSize: 14.5,
//                 fontWeight: 700,
//                 color: D.primary,
//                 letterSpacing: "-0.02em",
//                 lineHeight: 1.3,
//                 fontFamily: D.sans,
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 whiteSpace: "nowrap",
//               }}
//             >
//               {g.group_name}
//             </h3>

//             {/* Sync status */}
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 5,
//                 marginTop: 4,
//               }}
//             >
//               <motion.div
//                 animate={{ opacity: [1, 0.3, 1] }}
//                 transition={{
//                   repeat: Infinity,
//                   duration: 2.4,
//                   ease: "easeInOut",
//                 }}
//                 style={{
//                   width: 5,
//                   height: 5,
//                   borderRadius: "50%",
//                   background: syncColor(g.last_synced),
//                   flexShrink: 0,
//                 }}
//               />
//               <span
//                 style={{ fontSize: 10, color: D.muted, fontFamily: D.mono }}
//               >
//                 {g.last_synced
//                   ? `synced ${formatTimeAgo(g.last_synced)}`
//                   : "never synced"}
//               </span>
//             </div>
//           </div>

//           {/* CF link + complete badge */}
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 6,
//               flexShrink: 0,
//             }}
//           >
//             {isComplete && (
//               <motion.span
//                 initial={{ opacity: 0, scale: 0.6 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{
//                   type: "spring",
//                   stiffness: 500,
//                   damping: 22,
//                   delay: 0.5,
//                 }}
//                 style={{
//                   fontSize: 9,
//                   fontWeight: 700,
//                   color: D.green,
//                   background: "rgba(74,222,128,0.1)",
//                   border: "1px solid rgba(74,222,128,0.25)",
//                   borderRadius: 5,
//                   padding: "2px 6px",
//                   letterSpacing: "0.06em",
//                   fontFamily: D.mono,
//                 }}
//               >
//                 COMPLETE
//               </motion.span>
//             )}
//             {g.group_url && (
//               <a
//                 href={g.group_url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   width: 26,
//                   height: 26,
//                   background: "rgba(255,255,255,0.04)",
//                   border: "1px solid rgba(255,255,255,0.08)",
//                   borderRadius: 7,
//                   color: hovered ? D.teal : D.muted,
//                   transition: "color 0.15s, border-color 0.15s",
//                   textDecoration: "none",
//                 }}
//                 onClick={(e) => e.stopPropagation()}
//                 title="Open on Codeforces"
//               >
//                 <svg
//                   width="11"
//                   height="11"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2.2"
//                   strokeLinecap="round"
//                 >
//                   <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
//                   <polyline points="15 3 21 3 21 9" />
//                   <line x1="10" y1="14" x2="21" y2="3" />
//                 </svg>
//               </a>
//             )}
//           </div>
//         </div>

//         {/* ── PROGRESS ROW ─────────────────────────────────────────────── */}
//         <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
//           {/* Arc ring */}
//           <div style={{ position: "relative", flexShrink: 0 }}>
//             <ProgressRing pct={g.progress_pct} size={72} />
//             <div
//               style={{
//                 position: "absolute",
//                 inset: 0,
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <span
//                 style={{
//                   fontSize: 15,
//                   fontWeight: 800,
//                   color: color,
//                   fontFamily: D.mono,
//                   letterSpacing: "-0.04em",
//                   lineHeight: 1,
//                 }}
//               >
//                 <Counter value={Math.round(g.progress_pct)} />%
//               </span>
//             </div>
//           </div>

//           {/* Stats grid */}
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1fr",
//               gap: "6px 16px",
//               flex: 1,
//             }}
//           >
//             {[
//               { label: "Solved", value: g.solved_count, color: D.teal },
//               { label: "Todo", value: g.todo_count, color: D.secondary },
//               {
//                 label: "Tried",
//                 value: g.attempted_count,
//                 color: g.attempted_count > 0 ? D.amber : D.muted,
//               },
//               { label: "Total", value: g.total_problems, color: D.muted },
//             ].map((s) => (
//               <div key={s.label}>
//                 <div
//                   style={{
//                     fontSize: 15.5,
//                     fontWeight: 800,
//                     color: s.color,
//                     fontFamily: D.mono,
//                     letterSpacing: "-0.04em",
//                     lineHeight: 1,
//                   }}
//                 >
//                   <Counter value={s.value} />
//                 </div>
//                 <div
//                   style={{
//                     fontSize: 9,
//                     color: D.muted,
//                     fontFamily: D.sans,
//                     marginTop: 1,
//                   }}
//                 >
//                   {s.label}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Contests completed chip */}
//         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           <div
//             style={{
//               fontSize: 9.5,
//               fontFamily: D.mono,
//               color: D.muted,
//               background: "rgba(255,255,255,0.04)",
//               border: `1px solid ${D.border}`,
//               borderRadius: 5,
//               padding: "2px 8px",
//               whiteSpace: "nowrap",
//             }}
//           >
//             {completedContests}/{totalContests} contests done
//           </div>

//           {g.attempted_count > 0 && (
//             <div
//               style={{
//                 fontSize: 9.5,
//                 fontFamily: D.mono,
//                 color: D.amber,
//                 background: "rgba(251,191,36,0.08)",
//                 border: "1px solid rgba(251,191,36,0.18)",
//                 borderRadius: 5,
//                 padding: "2px 8px",
//                 whiteSpace: "nowrap",
//               }}
//             >
//               {g.attempted_count} stuck
//             </div>
//           )}
//         </div>

//         {/* ── CONTEST PILLS ────────────────────────────────────────────── */}
//         <div>
//           <div
//             style={{
//               fontSize: 8.5,
//               fontWeight: 700,
//               color: D.muted,
//               textTransform: "uppercase",
//               letterSpacing: "0.1em",
//               fontFamily: D.mono,
//               marginBottom: 6,
//             }}
//           >
//             Contests
//           </div>
//           <ContestPills g={g} />
//         </div>

//         {/* ── ACTIVITY STRIP ───────────────────────────────────────────── */}
//         <div>
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               marginBottom: 5,
//             }}
//           >
//             <span
//               style={{
//                 fontSize: 8.5,
//                 fontWeight: 700,
//                 color: D.muted,
//                 textTransform: "uppercase",
//                 letterSpacing: "0.1em",
//                 fontFamily: D.mono,
//               }}
//             >
//               30-day activity
//             </span>
//             <span style={{ fontSize: 8.5, color: D.muted, fontFamily: D.mono }}>
//               {g.solved_count} solved total
//             </span>
//           </div>
//           <ActivityStrip problems={g.problems} />
//         </div>

//         {/* ── NEXT PROBLEM ─────────────────────────────────────────────── */}
//         {nextProblem && !isComplete && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={inView ? { opacity: 1 } : {}}
//             transition={{ delay: index * 0.07 + 0.45 }}
//             style={{
//               padding: "8px 10px",
//               background: "rgba(0,212,170,0.04)",
//               border: "1px solid rgba(0,212,170,0.1)",
//               borderRadius: 8,
//             }}
//           >
//             <div
//               style={{
//                 fontSize: 8.5,
//                 fontWeight: 700,
//                 color: "rgba(0,212,170,0.5)",
//                 textTransform: "uppercase",
//                 letterSpacing: "0.1em",
//                 fontFamily: D.mono,
//                 marginBottom: 4,
//               }}
//             >
//               ⚡ Next up
//             </div>
//             <a
//               href={nextProblem.url}
//               target="_blank"
//               rel="noopener noreferrer"
//               style={{
//                 fontSize: 11.5,
//                 fontWeight: 600,
//                 color: D.primary,
//                 textDecoration: "none",
//                 display: "block",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 whiteSpace: "nowrap",
//               }}
//               onClick={(e) => e.stopPropagation()}
//             >
//               <span style={{ color: D.teal, fontFamily: D.mono }}>
//                 {nextProblem.index}.
//               </span>{" "}
//               {nextProblem.name}
//             </a>
//             <span
//               style={{
//                 fontSize: 9.5,
//                 color: D.muted,
//                 fontFamily: D.mono,
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 whiteSpace: "nowrap",
//                 display: "block",
//                 marginTop: 2,
//               }}
//             >
//               {nextProblem.contestName}
//             </span>
//           </motion.div>
//         )}

//         {isComplete && (
//           <div
//             style={{
//               padding: "8px 10px",
//               background: "rgba(74,222,128,0.04)",
//               border: "1px solid rgba(74,222,128,0.1)",
//               borderRadius: 8,
//               textAlign: "center",
//             }}
//           >
//             <span style={{ fontSize: 11, color: D.green, fontFamily: D.mono }}>
//               🎯 All problems solved
//             </span>
//           </div>
//         )}
//       </div>

//       {/* ── FOOTER / CTA ──────────────────────────────────────────────── */}
//       <Link
//         href={`/dashboard2/groups/${g.group_code}`}
//         style={{
//           position: "relative",
//           zIndex: 1,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           padding: "11px 20px",
//           borderTop: "1px solid rgba(255,255,255,0.05)",
//           background: hovered ? "rgba(0,212,170,0.035)" : "transparent",
//           textDecoration: "none",
//           transition: "background 0.15s",
//           flexShrink: 0,
//         }}
//       >
//         <span
//           style={{
//             fontSize: 11,
//             fontWeight: 600,
//             color: hovered ? D.teal : D.secondary,
//             fontFamily: D.sans,
//             transition: "color 0.15s",
//           }}
//         >
//           View Details
//         </span>
//         <motion.span
//           animate={{ x: hovered ? 4 : 0 }}
//           transition={{ duration: 0.18, ease: EASE }}
//           style={{
//             color: hovered ? D.teal : D.muted,
//             display: "flex",
//             alignItems: "center",
//             transition: "color 0.15s",
//           }}
//         >
//           <svg
//             width="14"
//             height="14"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2.2"
//             strokeLinecap="round"
//           >
//             <line x1="5" y1="12" x2="19" y2="12" />
//             <polyline points="12 5 19 12 12 19" />
//           </svg>
//         </motion.span>
//       </Link>
//     </motion.div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // ADD GROUP CARD — dashed placeholder at end of grid
// // ─────────────────────────────────────────────────────────────────────────────

// function AddGroupCard() {
//   const [hovered, setHovered] = useState(false);

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ delay: 0.4, duration: 0.5 }}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       style={{
//         border: `1px dashed ${hovered ? "rgba(0,212,170,0.3)" : "rgba(255,255,255,0.09)"}`,
//         borderRadius: 16,
//         padding: "28px 24px",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         gap: 10,
//         minHeight: 180,
//         background: hovered ? "rgba(0,212,170,0.02)" : "transparent",
//         transition: "border-color 0.2s, background 0.2s",
//         cursor: "default",
//       }}
//     >
//       <div
//         style={{
//           width: 36,
//           height: 36,
//           borderRadius: "50%",
//           background: hovered
//             ? "rgba(0,212,170,0.1)"
//             : "rgba(255,255,255,0.04)",
//           border: `1px solid ${hovered ? "rgba(0,212,170,0.25)" : "rgba(255,255,255,0.08)"}`,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           transition: "background 0.2s, border-color 0.2s",
//         }}
//       >
//         <svg
//           width="14"
//           height="14"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke={hovered ? D.teal : D.muted}
//           strokeWidth="2.2"
//           strokeLinecap="round"
//         >
//           <line x1="12" y1="5" x2="12" y2="19" />
//           <line x1="5" y1="12" x2="19" y2="12" />
//         </svg>
//       </div>
//       <div style={{ textAlign: "center" }}>
//         <div
//           style={{
//             fontSize: 11.5,
//             fontWeight: 600,
//             color: hovered ? D.secondary : D.muted,
//             fontFamily: D.sans,
//             transition: "color 0.15s",
//           }}
//         >
//           Join another group
//         </div>
//         <div
//           style={{
//             fontSize: 10,
//             color: D.muted,
//             fontFamily: D.mono,
//             marginTop: 3,
//           }}
//         >
//           sync from the extension
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // EMPTY STATE
// // ─────────────────────────────────────────────────────────────────────────────

// function EmptyState() {
//   const steps = [
//     "Install the Memoize extension",
//     "Open any CF Group you're in",
//     "Click Sync — it appears here",
//   ];

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 16 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, ease: EASE }}
//       style={{
//         maxWidth: 420,
//         margin: "40px auto",
//         background: D.surface,
//         border: `1px solid ${D.border}`,
//         borderRadius: 16,
//         padding: "32px 28px",
//         fontFamily: D.mono,
//       }}
//     >
//       <div
//         style={{ fontSize: 11, color: "rgba(0,212,170,0.5)", marginBottom: 12 }}
//       >
//         <span style={{ color: D.teal }}>$</span> waiting for your first group
//         <motion.span
//           animate={{ opacity: [1, 0, 1] }}
//           transition={{ repeat: Infinity, duration: 1 }}
//           style={{ color: D.teal, marginLeft: 2 }}
//         >
//           ▌
//         </motion.span>
//       </div>

//       <div
//         style={{
//           fontSize: 13,
//           fontWeight: 600,
//           color: D.primary,
//           marginBottom: 16,
//           fontFamily: D.sans,
//         }}
//       >
//         How to add a CF Group
//       </div>

//       <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//         {steps.map((s, i) => (
//           <motion.div
//             key={i}
//             initial={{ opacity: 0, x: -10 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.15 + i * 0.1, ease: EASE }}
//             style={{ display: "flex", alignItems: "center", gap: 10 }}
//           >
//             <div
//               style={{
//                 width: 18,
//                 height: 18,
//                 borderRadius: "50%",
//                 background: "rgba(0,212,170,0.1)",
//                 border: "1px solid rgba(0,212,170,0.2)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 flexShrink: 0,
//               }}
//             >
//               <span style={{ fontSize: 9, color: D.teal, fontWeight: 700 }}>
//                 {i + 1}
//               </span>
//             </div>
//             <span
//               style={{ fontSize: 11.5, color: D.secondary, fontFamily: D.sans }}
//             >
//               {s}
//             </span>
//           </motion.div>
//         ))}
//       </div>
//     </motion.div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // GLOBAL COMMAND BAR
// // ─────────────────────────────────────────────────────────────────────────────

// function CommandBar({
//   groups,
//   lastSynced,
//   cfAuth,
// }: {
//   groups: GroupWithProblems[];
//   lastSynced: string | null;
//   cfAuth: UserCfAuth | null;
// }) {
//   const totals = useMemo(() => {
//     const solved = groups.reduce((s, g) => s + g.solved_count, 0);
//     const total = groups.reduce((s, g) => s + g.total_problems, 0);
//     const tried = groups.reduce((s, g) => s + g.attempted_count, 0);
//     const overall = total > 0 ? Math.round((solved / total) * 100) : 0;
//     return { solved, total, tried, overall };
//   }, [groups]);

//   const scColor = syncColor(lastSynced);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: -10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.4, ease: EASE }}
//       style={{
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         flexWrap: "wrap",
//         gap: 12,
//         padding: "12px 18px",
//         background: D.surface,
//         border: `1px solid ${D.border}`,
//         borderRadius: 12,
//         marginBottom: 16,
//       }}
//     >
//       {/* Stats */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: 20,
//           flexWrap: "wrap",
//         }}
//       >
//         {[
//           { label: "groups", value: groups.length, color: D.secondary },
//           { label: "solved", value: totals.solved, color: D.teal },
//           {
//             label: "remaining",
//             value: totals.total - totals.solved,
//             color: D.muted,
//           },
//           {
//             label: "stuck",
//             value: totals.tried,
//             color: totals.tried > 0 ? D.amber : D.muted,
//           },
//         ].map((s) => (
//           <div
//             key={s.label}
//             style={{ display: "flex", alignItems: "baseline", gap: 4 }}
//           >
//             <span
//               style={{
//                 fontSize: 16,
//                 fontWeight: 800,
//                 fontFamily: D.mono,
//                 color: s.color,
//                 letterSpacing: "-0.04em",
//                 lineHeight: 1,
//               }}
//             >
//               <Counter value={s.value} />
//             </span>
//             <span style={{ fontSize: 9, color: D.muted, fontFamily: D.sans }}>
//               {s.label}
//             </span>
//           </div>
//         ))}

//         {/* Overall % with mini ring */}
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: 6,
//             paddingLeft: 8,
//             borderLeft: `1px solid rgba(255,255,255,0.07)`,
//           }}
//         >
//           <svg width="28" height="28" style={{ transform: "rotate(-90deg)" }}>
//             <circle
//               cx={14}
//               cy={14}
//               r={10}
//               fill="none"
//               stroke="rgba(255,255,255,0.06)"
//               strokeWidth={3.5}
//             />
//             <motion.circle
//               cx={14}
//               cy={14}
//               r={10}
//               fill="none"
//               stroke={pctColor(totals.overall)}
//               strokeWidth={3.5}
//               strokeLinecap="round"
//               strokeDasharray={62.83}
//               initial={{ strokeDashoffset: 62.83 }}
//               animate={{
//                 strokeDashoffset: 62.83 - (totals.overall / 100) * 62.83,
//               }}
//               transition={{
//                 duration: 1.5,
//                 ease: [0.16, 1, 0.3, 1],
//                 delay: 0.3,
//               }}
//             />
//           </svg>
//           <span
//             style={{
//               fontSize: 15,
//               fontWeight: 800,
//               fontFamily: D.mono,
//               color: pctColor(totals.overall),
//               letterSpacing: "-0.04em",
//             }}
//           >
//             <Counter value={totals.overall} />%
//           </span>
//           <span style={{ fontSize: 9, color: D.muted, fontFamily: D.sans }}>
//             overall
//           </span>
//         </div>
//       </div>

//       {/* Right: sync indicator */}
//       <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
//           <motion.div
//             animate={{ opacity: [1, 0.3, 1] }}
//             transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
//             style={{
//               width: 6,
//               height: 6,
//               borderRadius: "50%",
//               background: scColor,
//               flexShrink: 0,
//               boxShadow: `0 0 5px ${scColor}`,
//             }}
//           />
//           <span style={{ fontSize: 10.5, color: D.muted, fontFamily: D.mono }}>
//             {lastSynced
//               ? `Last sync: ${formatTimeAgo(lastSynced)}`
//               : "Never synced"}
//           </span>
//         </div>

//         {cfAuth?.cf_handle && (
//           <div
//             style={{
//               fontSize: 10,
//               fontFamily: D.mono,
//               color: D.teal,
//               background: "rgba(0,212,170,0.08)",
//               border: "1px solid rgba(0,212,170,0.15)",
//               borderRadius: 5,
//               padding: "2px 8px",
//             }}
//           >
//             @{cfAuth.cf_handle}
//           </div>
//         )}
//       </div>
//     </motion.div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MAIN
// // ─────────────────────────────────────────────────────────────────────────────

// export function GroupsClient({ groups, cfAuth, lastSynced, userId }: Props) {
//   return (
//     <div style={{ fontFamily: D.sans }}>
//       {/* Global command bar */}
//       {groups.length > 0 && (
//         <CommandBar groups={groups} lastSynced={lastSynced} cfAuth={cfAuth} />
//       )}

//       {/* Grid */}
//       {groups.length === 0 ? (
//         <EmptyState />
//       ) : (
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns:
//               "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
//             gap: 16,
//             alignItems: "start",
//           }}
//         >
//           {groups.map((g, i) => (
//             <GroupCard key={g.id} g={g} index={i} />
//           ))}
//           <AddGroupCard />
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useTransform,
  useInView,
  useSpring,
} from "framer-motion";
import Link from "next/link";
// import { SyncButton } from "./SyncButton";
import { SyncButton } from "./group-detail/SyncButton";
import type {
  CfGroup,
  CfGroupProblem,
  UserCfAuth,
  CfSyncStatus,
} from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type GroupWithProblems = CfGroup & { problems: CfGroupProblem[] };

interface Props {
  groups: GroupWithProblems[];
  cfAuth: UserCfAuth | null;
  lastSynced: string | null;
  userId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────

const D = {
  surface: "var(--bg-surface,  #111114)",
  elevated: "var(--bg-elevated, #16161a)",
  border: "rgba(255,255,255,0.07)",
  muted: "var(--text-muted,     #52525b)",
  secondary: "var(--text-secondary, #a1a1aa)",
  primary: "var(--text-primary,   #f4f4f5)",
  teal: "#00d4aa",
  amber: "#fbbf24",
  red: "#f87171",
  green: "#4ade80",
  mono: "var(--font-mono, 'JetBrains Mono', monospace)",
  sans: "var(--font-sans, system-ui, sans-serif)",
} as const;

const EASE = [0.22, 1, 0.36, 1] as const;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatTimeAgo(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (m < 1) return "Just now";
  if (h < 1) return `${m}m ago`;
  if (d < 1) return `${h}h ago`;
  return `${d}d ago`;
}

function syncColor(iso: string | null): string {
  if (!iso) return D.red;
  const h = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  if (h < 24) return D.green;
  if (h < 72) return D.amber;
  return D.red;
}

function indexOrder(idx: string): number {
  if (!idx) return 999;
  return (
    idx.charCodeAt(0) -
    65 +
    (idx.length > 1 ? (parseInt(idx.slice(1), 10) || 0) * 26 : 0)
  );
}

function pctColor(pct: number): string {
  if (pct === 100) return D.green;
  if (pct >= 70) return D.teal;
  if (pct >= 40) return D.amber;
  if (pct > 0) return "#fb923c";
  return "rgba(255,255,255,0.18)";
}

/** Next unsolved problem in the most-active incomplete contest */
function getNextProblem(
  g: GroupWithProblems,
): { index: string; name: string; url: string; contestName: string } | null {
  const byContest = new Map<string, CfGroupProblem[]>();
  for (const p of g.problems) {
    if (!byContest.has(p.contest_id)) byContest.set(p.contest_id, []);
    byContest.get(p.contest_id)!.push(p);
  }

  const contests = Array.from(byContest.entries())
    .map(([id, probs]) => {
      const solved = probs.filter((p) => p.cf_status === "solved").length;
      const total = probs.length;
      const pct = total > 0 ? solved / total : 0;
      return {
        id,
        probs,
        solved,
        total,
        pct,
        name: probs[0]?.contest_name ?? `Contest ${id}`,
      };
    })
    .filter((c) => c.pct < 1)
    .sort((a, b) => b.pct - a.pct); // most progress first

  for (const c of contests) {
    const unsolved = [...c.probs]
      .filter((p) => p.cf_status === "todo")
      .sort(
        (a, b) => indexOrder(a.problem_index) - indexOrder(b.problem_index),
      );
    if (unsolved.length > 0) {
      return {
        index: unsolved[0].problem_index,
        name: unsolved[0].problem_name,
        url: unsolved[0].problem_url,
        contestName: c.name,
      };
    }
  }
  return null;
}

/** 30-day solved activity bars from solved_at */
function get30DayActivity(problems: CfGroupProblem[]): number[] {
  const counts = Array<number>(30).fill(0);
  const now = Date.now();
  for (const p of problems) {
    if (p.cf_status !== "solved" || !p.solved_at) continue;
    const daysAgo = Math.floor(
      (now - new Date(p.solved_at).getTime()) / 86_400_000,
    );
    if (daysAgo >= 0 && daysAgo < 30) counts[29 - daysAgo]++;
  }
  return counts;
}

/** Contest pills — up to 6, sorted active → complete → todo */
function getContestPills(g: GroupWithProblems) {
  const map = new Map<string, CfGroupProblem[]>();
  for (const p of g.problems) {
    if (!map.has(p.contest_id)) map.set(p.contest_id, []);
    map.get(p.contest_id)!.push(p);
  }
  return Array.from(map.entries())
    .map(([id, probs]) => {
      const solved = probs.filter((p) => p.cf_status === "solved").length;
      const total = probs.length;
      const pct = total > 0 ? (solved / total) * 100 : 0;
      const name = probs[0]?.contest_name ?? `Contest ${id}`;
      return { id, name, pct, solved, total };
    })
    .sort((a, b) => {
      // active > complete > untouched
      const aActive = a.pct > 0 && a.pct < 100;
      const bActive = b.pct > 0 && b.pct < 100;
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;
      if (a.pct === 100 && b.pct !== 100) return -1;
      if (b.pct === 100 && a.pct !== 100) return 1;
      return b.solved - a.solved;
    })
    .slice(0, 6);
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED COUNTER
// ─────────────────────────────────────────────────────────────────────────────

function Counter({
  value,
  duration = 1.3,
}: {
  value: number;
  duration?: number;
}) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, Math.round);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(mv, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return ctrl.stop;
  }, [inView, value, mv, duration]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS RING
// ─────────────────────────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 80 }: { pct: number; size?: number }) {
  const sw = 5.5;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const color = pctColor(pct);

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)", flexShrink: 0 }}
      aria-label={`${Math.round(pct)}% progress`}
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={sw}
      />
      {/* Glow halo */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={sw + 5}
        strokeOpacity={0.07}
      />
      {/* Progress arc */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MINI ACTIVITY STRIP
// ─────────────────────────────────────────────────────────────────────────────

function ActivityStrip({ problems }: { problems: CfGroupProblem[] }) {
  const bars = useMemo(() => get30DayActivity(problems), [problems]);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const maxBar = Math.max(...bars, 1);

  const hasSolves = bars.some((b) => b > 0);
  if (!hasSolves) {
    return (
      <div
        ref={ref}
        style={{ height: 28, display: "flex", alignItems: "center" }}
      >
        <span style={{ fontSize: 9, color: D.muted, fontFamily: D.mono }}>
          no activity yet
        </span>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 1.5,
        height: 28,
      }}
      aria-label="30-day solve activity"
    >
      {bars.map((count, i) => {
        const isToday = i === bars.length - 1;
        const hPct = count === 0 ? 4 : Math.max((count / maxBar) * 100, 16);
        const alpha = 0.2 + (count / maxBar) * 0.7;

        return (
          <motion.div
            key={i}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={inView ? { scaleY: 1, opacity: 1 } : {}}
            transition={{
              scaleY: { duration: 0.35, delay: i * 0.012, ease: EASE },
              opacity: { duration: 0.2, delay: i * 0.012 },
            }}
            style={{
              flex: 1,
              height: `${hPct}%`,
              borderRadius: "2px 2px 1px 1px",
              background:
                count === 0
                  ? "rgba(255,255,255,0.05)"
                  : isToday
                    ? D.teal
                    : `rgba(0,212,170,${alpha})`,
              transformOrigin: "bottom",
              boxShadow:
                isToday && count > 0 ? "0 0 6px rgba(0,212,170,0.4)" : "none",
            }}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEST PILLS
// ─────────────────────────────────────────────────────────────────────────────

function ContestPills({ g }: { g: GroupWithProblems }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const pills = useMemo(() => getContestPills(g), [g]);

  return (
    <div ref={ref} style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {pills.map((c, i) => {
        const col = pctColor(c.pct);
        return (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{
              delay: 0.06 + i * 0.05,
              type: "spring",
              stiffness: 420,
              damping: 24,
            }}
            title={`${c.name}: ${c.solved}/${c.total} solved`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 8px",
              borderRadius: 5,
              background: `${col}10`,
              border: `1px solid ${col}25`,
            }}
          >
            {/* Color dot instead of wide bar */}
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: col,
                flexShrink: 0,
                opacity: 0.8,
              }}
            />
            <span
              style={{
                fontSize: 9.5,
                fontFamily: D.mono,
                color: col,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {c.name.length > 14 ? c.name.slice(0, 13) + "…" : c.name}
            </span>
          </motion.div>
        );
      })}
      {(() => {
        const totalContests = new Set(g.problems.map((p) => p.contest_id)).size;
        if (totalContests <= 6) return null;
        return (
          <span
            style={{
              fontSize: 9.5,
              color: D.muted,
              fontFamily: D.mono,
              padding: "3px 6px",
              alignSelf: "center",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${D.border}`,
              borderRadius: 5,
            }}
          >
            +{totalContests - 6}
          </span>
        );
      })()}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GROUP CARD — main interactive tile
// ─────────────────────────────────────────────────────────────────────────────

function GroupCard({ g, index }: { g: GroupWithProblems; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, margin: "-40px" });
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const nextProblem = useMemo(() => getNextProblem(g), [g]);
  const color = pctColor(g.progress_pct);
  const isComplete = g.progress_pct === 100;

  // Mouse-tracking radial glow (MagicCard effect)
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setGlow({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  const totalContests = useMemo(
    () => new Set(g.problems.map((p) => p.contest_id)).size,
    [g.problems],
  );
  const completedContests = useMemo(() => {
    const map = new Map<string, { solved: number; total: number }>();
    for (const p of g.problems) {
      const c = map.get(p.contest_id) ?? { solved: 0, total: 0 };
      map.set(p.contest_id, {
        solved: c.solved + (p.cf_status === "solved" ? 1 : 0),
        total: c.total + 1,
      });
    }
    return Array.from(map.values()).filter(
      (c) => c.solved === c.total && c.total > 0,
    ).length;
  }, [g.problems]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.48, delay: index * 0.07, ease: EASE }}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: D.surface,
        border: `1px solid ${hovered ? "rgba(0,212,170,0.18)" : D.border}`,
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,212,170,0.08)"
          : "0 4px 16px rgba(0,0,0,0.25)",
        cursor: "default",
      }}
    >
      {/* Mouse-following radial glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(0,212,170,${hovered ? 0.065 : 0}) 0%, transparent 65%)`,
          transition: "background 0.1s",
          pointerEvents: "none",
          borderRadius: 16,
          zIndex: 0,
        }}
      />

      {/* Top accent line — color by progress */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.9, delay: index * 0.07 + 0.25, ease: EASE }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${color}, transparent)`,
          transformOrigin: "left",
          opacity: 0.7,
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          flex: 1,
        }}
      >
        {/* ── HEADER ───────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3
              style={{
                margin: 0,
                fontSize: 14.5,
                fontWeight: 700,
                color: D.primary,
                letterSpacing: "-0.02em",
                lineHeight: 1.3,
                fontFamily: D.sans,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {g.group_name}
            </h3>

            {/* Sync status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginTop: 4,
              }}
            >
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.4,
                  ease: "easeInOut",
                }}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: syncColor(g.last_synced),
                  flexShrink: 0,
                }}
              />
              <span
                style={{ fontSize: 10, color: D.muted, fontFamily: D.mono }}
              >
                {g.last_synced
                  ? `synced ${formatTimeAgo(g.last_synced)}`
                  : "never synced"}
              </span>
            </div>
          </div>

          {/* CF link + complete badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
            }}
          >
            {isComplete && (
              <motion.span
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 22,
                  delay: 0.5,
                }}
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: D.green,
                  background: "rgba(74,222,128,0.1)",
                  border: "1px solid rgba(74,222,128,0.25)",
                  borderRadius: 5,
                  padding: "2px 6px",
                  letterSpacing: "0.06em",
                  fontFamily: D.mono,
                }}
              >
                COMPLETE
              </motion.span>
            )}
            {g.group_url && (
              <a
                href={g.group_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 26,
                  height: 26,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 7,
                  color: hovered ? D.teal : D.muted,
                  transition: "color 0.15s, border-color 0.15s",
                  textDecoration: "none",
                }}
                onClick={(e) => e.stopPropagation()}
                title="Open on Codeforces"
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* ── PROGRESS ROW ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Arc ring */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <ProgressRing pct={g.progress_pct} size={72} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: color,
                  fontFamily: D.mono,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                <Counter value={Math.round(g.progress_pct)} />%
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6px 16px",
              flex: 1,
            }}
          >
            {[
              { label: "Solved", value: g.solved_count, color: D.teal },
              { label: "Todo", value: g.todo_count, color: D.secondary },
              {
                label: "Tried",
                value: g.attempted_count,
                color: g.attempted_count > 0 ? D.amber : D.muted,
              },
              { label: "Total", value: g.total_problems, color: D.muted },
            ].map((s) => (
              <div key={s.label}>
                <div
                  style={{
                    fontSize: 15.5,
                    fontWeight: 800,
                    color: s.color,
                    fontFamily: D.mono,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  <Counter value={s.value} />
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: D.muted,
                    fontFamily: D.sans,
                    marginTop: 1,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contests completed chip */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              fontSize: 9.5,
              fontFamily: D.mono,
              color: D.muted,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${D.border}`,
              borderRadius: 5,
              padding: "2px 8px",
              whiteSpace: "nowrap",
            }}
          >
            {completedContests}/{totalContests} contests done
          </div>

          {g.attempted_count > 0 && (
            <div
              style={{
                fontSize: 9.5,
                fontFamily: D.mono,
                color: D.amber,
                background: "rgba(251,191,36,0.08)",
                border: "1px solid rgba(251,191,36,0.18)",
                borderRadius: 5,
                padding: "2px 8px",
                whiteSpace: "nowrap",
              }}
            >
              {g.attempted_count} stuck
            </div>
          )}
        </div>

        {/* ── CONTEST PILLS ────────────────────────────────────────────── */}
        <div>
          <div
            style={{
              fontSize: 8.5,
              fontWeight: 700,
              color: D.muted,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontFamily: D.mono,
              marginBottom: 6,
            }}
          >
            Contests
          </div>
          <ContestPills g={g} />
        </div>

        {/* ── ACTIVITY STRIP ───────────────────────────────────────────── */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 5,
            }}
          >
            <span
              style={{
                fontSize: 8.5,
                fontWeight: 700,
                color: D.muted,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: D.mono,
              }}
            >
              30-day activity
            </span>
            <span style={{ fontSize: 8.5, color: D.muted, fontFamily: D.mono }}>
              {g.solved_count} solved total
            </span>
          </div>
          <ActivityStrip problems={g.problems} />
        </div>

        {/* ── NEXT PROBLEM ─────────────────────────────────────────────── */}
        {nextProblem && !isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: index * 0.07 + 0.45 }}
            style={{
              padding: "8px 10px",
              background: "rgba(0,212,170,0.04)",
              border: "1px solid rgba(0,212,170,0.1)",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                fontSize: 8.5,
                fontWeight: 700,
                color: "rgba(0,212,170,0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: D.mono,
                marginBottom: 4,
              }}
            >
              ⚡ Next up
            </div>
            <a
              href={nextProblem.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: D.primary,
                textDecoration: "none",
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <span style={{ color: D.teal, fontFamily: D.mono }}>
                {nextProblem.index}.
              </span>{" "}
              {nextProblem.name}
            </a>
            <span
              style={{
                fontSize: 9.5,
                color: D.muted,
                fontFamily: D.mono,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
                marginTop: 2,
              }}
            >
              {nextProblem.contestName}
            </span>
          </motion.div>
        )}

        {isComplete && (
          <div
            style={{
              padding: "8px 10px",
              background: "rgba(74,222,128,0.04)",
              border: "1px solid rgba(74,222,128,0.1)",
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: 11, color: D.green, fontFamily: D.mono }}>
              🎯 All problems solved
            </span>
          </div>
        )}
      </div>

      {/* ── FOOTER / CTA ──────────────────────────────────────────────── */}
      <Link
        href={`/dashboard/groups/${g.group_code}`}
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "11px 20px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: hovered ? "rgba(0,212,170,0.035)" : "transparent",
          textDecoration: "none",
          transition: "background 0.15s",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: hovered ? D.teal : D.secondary,
            fontFamily: D.sans,
            transition: "color 0.15s",
          }}
        >
          View Details
        </span>
        <motion.span
          animate={{ x: hovered ? 4 : 0 }}
          transition={{ duration: 0.18, ease: EASE }}
          style={{
            color: hovered ? D.teal : D.muted,
            display: "flex",
            alignItems: "center",
            transition: "color 0.15s",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </motion.span>
      </Link>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD GROUP CARD — dashed placeholder at end of grid
// ─────────────────────────────────────────────────────────────────────────────

function AddGroupCard() {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px dashed ${hovered ? "rgba(0,212,170,0.3)" : "rgba(255,255,255,0.09)"}`,
        borderRadius: 16,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        minHeight: 120,
        alignSelf: "start",
        background: hovered ? "rgba(0,212,170,0.02)" : "transparent",
        transition: "border-color 0.2s, background 0.2s",
        cursor: "default",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: hovered
            ? "rgba(0,212,170,0.1)"
            : "rgba(255,255,255,0.04)",
          border: `1px solid ${hovered ? "rgba(0,212,170,0.25)" : "rgba(255,255,255,0.08)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s, border-color 0.2s",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={hovered ? D.teal : D.muted}
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: hovered ? D.secondary : D.muted,
            fontFamily: D.sans,
            transition: "color 0.15s",
          }}
        >
          Join another group
        </div>
        <div
          style={{
            fontSize: 10,
            color: D.muted,
            fontFamily: D.mono,
            marginTop: 3,
          }}
        >
          sync from the extension
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState() {
  const steps = [
    "Install the Memoize extension",
    "Open any CF Group you're in",
    "Click Sync — it appears here",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{
        maxWidth: 420,
        margin: "40px auto",
        background: D.surface,
        border: `1px solid ${D.border}`,
        borderRadius: 16,
        padding: "32px 28px",
        fontFamily: D.mono,
      }}
    >
      <div
        style={{ fontSize: 11, color: "rgba(0,212,170,0.5)", marginBottom: 12 }}
      >
        <span style={{ color: D.teal }}>$</span> waiting for your first group
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          style={{ color: D.teal, marginLeft: 2 }}
        >
          ▌
        </motion.span>
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: D.primary,
          marginBottom: 16,
          fontFamily: D.sans,
        }}
      >
        How to add a CF Group
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.1, ease: EASE }}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "rgba(0,212,170,0.1)",
                border: "1px solid rgba(0,212,170,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 9, color: D.teal, fontWeight: 700 }}>
                {i + 1}
              </span>
            </div>
            <span
              style={{ fontSize: 11.5, color: D.secondary, fontFamily: D.sans }}
            >
              {s}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL COMMAND BAR
// ─────────────────────────────────────────────────────────────────────────────

function CommandBar({
  groups,
  lastSynced,
  cfAuth,
}: {
  groups: GroupWithProblems[];
  lastSynced: string | null;
  cfAuth: UserCfAuth | null;
}) {
  const totals = useMemo(() => {
    const solved = groups.reduce((s, g) => s + g.solved_count, 0);
    const total = groups.reduce((s, g) => s + g.total_problems, 0);
    const tried = groups.reduce((s, g) => s + g.attempted_count, 0);
    const overall = total > 0 ? Math.round((solved / total) * 100) : 0;
    return { solved, total, tried, overall };
  }, [groups]);

  const scColor = syncColor(lastSynced);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        padding: "12px 18px",
        background: D.surface,
        border: `1px solid ${D.border}`,
        borderRadius: 12,
        marginBottom: 16,
      }}
    >
      {/* Stats */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "groups", value: groups.length, color: D.secondary },
          { label: "solved", value: totals.solved, color: D.teal },
          {
            label: "remaining",
            value: totals.total - totals.solved,
            color: D.muted,
          },
          {
            label: "stuck",
            value: totals.tried,
            color: totals.tried > 0 ? D.amber : D.muted,
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{ display: "flex", alignItems: "baseline", gap: 4 }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: 800,
                fontFamily: D.mono,
                color: s.color,
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              <Counter value={s.value} />
            </span>
            <span style={{ fontSize: 9, color: D.muted, fontFamily: D.sans }}>
              {s.label}
            </span>
          </div>
        ))}

        {/* Overall % — inline text only, no ring (ring lives in the card) */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 4,
            paddingLeft: 8,
            borderLeft: `1px solid rgba(255,255,255,0.07)`,
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 800,
              fontFamily: D.mono,
              color: pctColor(totals.overall),
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            <Counter value={totals.overall} />%
          </span>
          <span style={{ fontSize: 9, color: D.muted, fontFamily: D.sans }}>
            overall
          </span>
        </div>
      </div>

      {/* Right: sync indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: scColor,
              flexShrink: 0,
              boxShadow: `0 0 5px ${scColor}`,
            }}
          />
          <span style={{ fontSize: 10.5, color: D.muted, fontFamily: D.mono }}>
            {lastSynced
              ? `Last sync: ${formatTimeAgo(lastSynced)}`
              : "Never synced"}
          </span>
        </div>

        {cfAuth?.cf_handle && (
          <div
            style={{
              fontSize: 10,
              fontFamily: D.mono,
              color: D.teal,
              background: "rgba(0,212,170,0.08)",
              border: "1px solid rgba(0,212,170,0.15)",
              borderRadius: 5,
              padding: "2px 8px",
            }}
          >
            @{cfAuth.cf_handle}
          </div>
        )}

        <SyncButton />
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export function GroupsClient({ groups, cfAuth, lastSynced, userId }: Props) {
  return (
    <div style={{ fontFamily: D.sans }}>
      {/* Global command bar */}
      {groups.length > 0 && (
        <CommandBar groups={groups} lastSynced={lastSynced} cfAuth={cfAuth} />
      )}

      {/* Grid */}
      {groups.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
            gap: 16,
            alignItems: "start",
          }}
        >
          {groups.map((g, i) => (
            <GroupCard key={g.id} g={g} index={i} />
          ))}
          <AddGroupCard />
        </div>
      )}
    </div>
  );
}