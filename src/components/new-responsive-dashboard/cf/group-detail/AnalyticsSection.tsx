// "use client";

// import { useMemo, useRef, useState } from "react";
// import { motion, AnimatePresence, useInView } from "framer-motion";
// import type { CfGroupProblem } from "@/types";

// // ── ContestSummary — matches the type in ContestSection.tsx / ContestsSection.tsx
// export type ContestSummary = {
//   id:        string;
//   name:      string;
//   problems:  CfGroupProblem[];
//   solved:    number;
//   attempted: number;
//   todo:      number;
//   total:     number;
//   pct:       number;
// };

// // ── Design tokens ──────────────────────────────────────────────────────────────

// const D = {
//   surface:   "var(--bg-surface,  #111114)",
//   elevated:  "var(--bg-elevated, #16161a)",
//   border:    "rgba(255,255,255,0.07)",
//   muted:     "var(--text-muted,     #52525b)",
//   secondary: "var(--text-secondary, #a1a1aa)",
//   primary:   "var(--text-primary,   #f4f4f5)",
//   teal:      "#00d4aa",
//   amber:     "#fbbf24",
//   red:       "#f87171",
//   green:     "#4ade80",
//   blue:      "#60a5fa",
//   mono:      "var(--font-mono, 'JetBrains Mono', monospace)",
//   sans:      "var(--font-sans, system-ui, sans-serif)",
// } as const;

// // ── Internal types ─────────────────────────────────────────────────────────────

// type ContestReachPoint = {
//   id:       string;
//   name:     string;
//   total:    number;
//   solved:   number;
//   pct:      number;
//   maxReach: number; // highest ordinal index (1-based) that was solved
// };

// type OrdinalPoint = {
//   ordinal:  number;
//   label:    string;  // "#1", "#2"…
//   eligible: number;  // contests that had ≥N problems
//   solved:   number;  // of eligible, how many did you solve the Nth
//   pct:      number;
// };

// type WeekBucket = {
//   weekStart: string;
//   count:     number;
//   label:     string; // "Mar 3"
// };

// // ── Helpers ────────────────────────────────────────────────────────────────────

// function indexOrder(idx: string): number {
//   if (!idx) return 999;
//   return idx.charCodeAt(0) - 65 + (idx.length > 1 ? (parseInt(idx.slice(1), 10) || 0) * 26 : 0);
// }

// function pColor(p: number): string {
//   if (p === 100) return D.green;
//   if (p >= 70)   return D.teal;
//   if (p >= 40)   return D.amber;
//   if (p > 0)     return D.red;
//   return "rgba(255,255,255,0.15)";
// }

// function ordSuffix(n: number): string {
//   if (n === 1) return "st";
//   if (n === 2) return "nd";
//   if (n === 3) return "rd";
//   return "th";
// }

// /** Catmull-Rom spline through {x,y} points */
// function catmullRom(pts: { x: number; y: number }[]): string {
//   if (pts.length < 2) return "";
//   let d = `M ${pts[0].x} ${pts[0].y}`;
//   for (let i = 0; i < pts.length - 1; i++) {
//     const p0 = pts[Math.max(i - 1, 0)];
//     const p1 = pts[i];
//     const p2 = pts[i + 1];
//     const p3 = pts[Math.min(i + 2, pts.length - 1)];
//     const cp1x = p1.x + (p2.x - p0.x) / 6;
//     const cp1y = p1.y + (p2.y - p0.y) / 6;
//     const cp2x = p2.x - (p3.x - p1.x) / 6;
//     const cp2y = p2.y - (p3.y - p1.y) / 6;
//     d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
//   }
//   return d;
// }

// // ── Data transforms ────────────────────────────────────────────────────────────

// /**
//  * For each contest: find the highest ordinal position (1-based) that was solved.
//  * "reach" ≠ "solved count" because a user could solve A, C, E (skip B, D)
//  * — their reach is 5 but solved is 3.
//  */
// function computeContestReach(contests: ContestSummary[]): ContestReachPoint[] {
//   return contests
//     .map(c => {
//       const sorted = [...c.problems].sort((a, b) => indexOrder(a.problem_index) - indexOrder(b.problem_index));
//       let maxReach = 0;
//       for (let i = 0; i < sorted.length; i++) {
//         if (sorted[i].cf_status === "solved") maxReach = i + 1;
//       }
//       return { id: c.id, name: c.name, total: c.total, solved: c.solved, pct: c.pct, maxReach };
//     })
//     .sort((a, b) => a.id.localeCompare(b.id)); // chronological
// }

// /**
//  * For each ordinal position n (1st, 2nd, 3rd…):
//  *   - eligible = contests that had ≥n problems
//  *   - solved   = how many of those you solved the nth problem in
//  *   - pct      = solved / eligible
//  *
//  * This is the HONEST version of the position chart — it only compares
//  * equivalent difficulties (nth problem within its own contest).
//  */
// function computeOrdinalPoints(contests: ContestSummary[]): OrdinalPoint[] {
//   const maxN = Math.max(...contests.map(c => c.total), 0);
//   const result: OrdinalPoint[] = [];

//   for (let n = 1; n <= maxN; n++) {
//     const eligible = contests.filter(c => c.total >= n);
//     if (eligible.length === 0) break;
//     // Stop when fewer than 2 contests qualify — data too sparse to mean anything
//     if (eligible.length < 2 && n > 4) break;

//     let solvedCount = 0;
//     for (const c of eligible) {
//       const sorted = [...c.problems].sort((a, b) => indexOrder(a.problem_index) - indexOrder(b.problem_index));
//       if (sorted[n - 1]?.cf_status === "solved") solvedCount++;
//     }

//     result.push({
//       ordinal:  n,
//       label:    `#${n}`,
//       eligible: eligible.length,
//       solved:   solvedCount,
//       pct:      (solvedCount / eligible.length) * 100,
//     });
//   }
//   return result;
// }

// /**
//  * Group solved problems by ISO week (Monday = week start).
//  * Fills in zero-count weeks between first solve and now.
//  * Source: solved_at timestamp — always available, no external API needed.
//  */
// function computeVelocity(problems: CfGroupProblem[]): WeekBucket[] {
//   const solved = problems.filter(p => p.solved_at && p.cf_status === "solved");
//   if (solved.length === 0) return [];

//   const map = new Map<string, number>();
//   for (const p of solved) {
//     const d   = new Date(p.solved_at!);
//     const day = d.getDay();
//     const mon = new Date(d);
//     mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
//     mon.setHours(0, 0, 0, 0);
//     const key = mon.toISOString().slice(0, 10);
//     map.set(key, (map.get(key) ?? 0) + 1);
//   }

//   const keys = [...map.keys()].sort();
//   if (keys.length === 0) return [];

//   const result: WeekBucket[] = [];
//   let cur = new Date(keys[0]);
//   const now = new Date();

//   while (cur <= now) {
//     const key = cur.toISOString().slice(0, 10);
//     result.push({
//       weekStart: key,
//       count:     map.get(key) ?? 0,
//       label:     cur.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
//     });
//     cur.setDate(cur.getDate() + 7);
//   }
//   return result;
// }

// // ── Velocity Chart ─────────────────────────────────────────────────────────────

// function VelocityChart({ problems, inView }: { problems: CfGroupProblem[]; inView: boolean }) {
//   const [hovIdx, setHovIdx] = useState<number | null>(null);
//   const buckets = useMemo(() => computeVelocity(problems), [problems]);

//   if (buckets.length === 0) {
//     return (
//       <div style={{ padding: "28px 0", textAlign: "center", color: D.muted, fontSize: 11, fontFamily: D.mono }}>
//         <span style={{ color: "rgba(0,212,170,0.4)" }}>$</span> no solve history yet
//         <span style={{ color: D.teal, marginLeft: 2, fontWeight: 700 }}>▌</span>
//       </div>
//     );
//   }

//   // Only show last 16 weeks max so bars don't get too thin
//   const display  = buckets.slice(-16);
//   const maxCount = Math.max(...display.map(b => b.count), 1);

//   const totalSolved  = buckets.reduce((s, b) => s + b.count, 0);
//   const bestWeek     = buckets.reduce((best, b) => b.count > best.count ? b : best, buckets[0]);
//   const recent4      = display.slice(-4);
//   const recentAvg    = recent4.reduce((s, b) => s + b.count, 0) / recent4.length;
//   const prev4        = display.slice(-8, -4);
//   const prevAvg      = prev4.length > 0 ? prev4.reduce((s, b) => s + b.count, 0) / prev4.length : recentAvg;
//   const trend        = recentAvg - prevAvg;
//   const trendStr     = trend >= 0 ? `+${(Math.round(trend * 10) / 10)}` : `${Math.round(trend * 10) / 10}`;

//   // 4-week rolling average
//   const rolling = display.map((_, i) => {
//     const win = display.slice(Math.max(0, i - 3), i + 1);
//     return win.reduce((s, b) => s + b.count, 0) / win.length;
//   });

//   const stats: { label: string; value: string | number; color: string }[] = [
//     { label: "total",     value: totalSolved,                   color: D.teal  },
//     { label: "best week", value: bestWeek.count,                color: D.green },
//     { label: "4-wk avg",  value: Math.round(recentAvg * 10) / 10, color: D.amber },
//     { label: "trend",     value: trendStr,                      color: trend >= 0 ? D.green : D.red },
//   ];

//   const BAR_W = 520; // SVG viewBox width for rolling line

//   return (
//     <div>
//       {/* Stat row */}
//       <div style={{ display: "flex", gap: 14, marginBottom: 12, flexWrap: "wrap" }}>
//         {stats.map(s => (
//           <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
//             <span style={{ fontSize: 15, fontWeight: 800, fontFamily: D.mono, color: s.color, letterSpacing: "-0.03em", lineHeight: 1 }}>
//               {s.value}
//             </span>
//             <span style={{ fontSize: 9, color: D.muted, fontFamily: D.sans }}>{s.label}</span>
//           </div>
//         ))}
//       </div>

//       {/* Bar chart + rolling avg overlay */}
//       <div style={{ position: "relative", height: 80 }}>
//         {/* Bars */}
//         <div
//           style={{ display: "flex", alignItems: "flex-end", gap: 2.5, height: 72, position: "relative" }}
//         >
//           {display.map((bucket, i) => {
//             const isHov     = hovIdx === i;
//             const isCurrent = i === display.length - 1;
//             const isEmpty   = bucket.count === 0;
//             const hPct      = isEmpty ? 4 : Math.max((bucket.count / maxCount) * 100, 6);
//             const alpha     = 0.28 + (bucket.count / maxCount) * 0.62;

//             return (
//               <motion.div
//                 key={bucket.weekStart}
//                 initial={{ scaleY: 0, opacity: 0 }}
//                 animate={inView ? { scaleY: 1, opacity: 1 } : {}}
//                 transition={{
//                   scaleY:   { duration: 0.45, delay: i * 0.022, ease: [0.22, 1, 0.36, 1] },
//                   opacity:  { duration: 0.2,  delay: i * 0.022 },
//                 }}
//                 onHoverStart={() => setHovIdx(i)}
//                 onHoverEnd={() => setHovIdx(null)}
//                 style={{
//                   flex: 1,
//                   height: `${hPct}%`,
//                   borderRadius: "3px 3px 2px 2px",
//                   background: isEmpty
//                     ? "rgba(255,255,255,0.04)"
//                     : isCurrent
//                       ? D.teal
//                       : isHov
//                         ? "#00d4aa"
//                         : `rgba(0,212,170,${alpha})`,
//                   transformOrigin: "bottom",
//                   cursor: "default",
//                   flexShrink: 0,
//                   position: "relative",
//                   boxShadow: (isCurrent || isHov) && !isEmpty
//                     ? "0 0 8px rgba(0,212,170,0.35)"
//                     : "none",
//                   transition: "background 0.12s, box-shadow 0.12s",
//                 }}
//               />
//             );
//           })}
//         </div>

//         {/* Tooltip on hover */}
//         <AnimatePresence>
//           {hovIdx !== null && (() => {
//             const b = display[hovIdx];
//             const leftPct = ((hovIdx + 0.5) / display.length) * 100;
//             return (
//               <motion.div
//                 key={hovIdx}
//                 initial={{ opacity: 0, scale: 0.88, y: 4 }}
//                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                 exit={{ opacity: 0, scale: 0.88 }}
//                 transition={{ duration: 0.12 }}
//                 style={{
//                   position: "absolute",
//                   bottom: "calc(100% + 6px)",
//                   left: `${Math.max(Math.min(leftPct, 88), 12)}%`,
//                   transform: "translateX(-50%)",
//                   background: D.elevated,
//                   border: `1px solid rgba(0,212,170,0.25)`,
//                   borderRadius: 7,
//                   padding: "5px 10px",
//                   pointerEvents: "none",
//                   zIndex: 10,
//                   whiteSpace: "nowrap",
//                 }}
//               >
//                 <span style={{ fontSize: 10, fontFamily: D.mono, color: D.teal, fontWeight: 700 }}>
//                   {b.count}
//                 </span>
//                 <span style={{ fontSize: 9, color: D.muted, fontFamily: D.mono, marginLeft: 4 }}>
//                   solved · {b.label}
//                 </span>
//               </motion.div>
//             );
//           })()}
//         </AnimatePresence>

//         {/* Rolling avg line — SVG overlay */}
//         {display.length > 3 && (
//           <svg
//             style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 72, overflow: "visible", pointerEvents: "none" }}
//             viewBox={`0 0 ${BAR_W} 72`}
//             preserveAspectRatio="none"
//           >
//             <defs>
//               <filter id="vel-glow" x="-20%" y="-60%" width="140%" height="220%">
//                 <feGaussianBlur stdDeviation="1.5" result="b" />
//                 <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
//               </filter>
//             </defs>
//             {(() => {
//               const step = BAR_W / display.length;
//               const pts  = rolling.map((avg, i) => ({
//                 x: (i + 0.5) * step,
//                 y: 72 - (avg / maxCount) * 68,
//               }));
//               return (
//                 <motion.path
//                   d={catmullRom(pts)}
//                   fill="none"
//                   stroke={D.amber}
//                   strokeWidth="1.8"
//                   strokeLinecap="round"
//                   strokeDasharray="4,3"
//                   style={{ filter: "url(#vel-glow)", opacity: 0.75 }}
//                   initial={{ pathLength: 0 }}
//                   animate={inView ? { pathLength: 1 } : {}}
//                   transition={{ duration: 1.1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
//                 />
//               );
//             })()}
//           </svg>
//         )}
//       </div>

//       {/* X-axis: show 3 labels */}
//       <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
//         {[display[0], display[Math.floor(display.length / 2)], display[display.length - 1]].map((b, i) =>
//           b ? (
//             <span key={i} style={{ fontSize: 8, fontFamily: D.mono, color: D.muted, opacity: 0.6 }}>
//               {b.label}
//             </span>
//           ) : null
//         )}
//       </div>

//       {/* Amber dashed = rolling avg legend */}
//       <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}>
//         <svg width="18" height="6" style={{ flexShrink: 0 }}>
//           <line x1="0" y1="3" x2="18" y2="3"
//             stroke={D.amber} strokeWidth="1.5" strokeDasharray="4,3" />
//         </svg>
//         <span style={{ fontSize: 8.5, color: D.muted, fontFamily: D.mono }}>4-week rolling avg</span>
//       </div>
//     </div>
//   );
// }

// // ── Contest Reach Chart ────────────────────────────────────────────────────────

// function ContestReachChart({ contests, inView }: { contests: ContestSummary[]; inView: boolean }) {
//   const [hovIdx, setHovIdx] = useState<number | null>(null);
//   const reach = useMemo(() => computeContestReach(contests), [contests]);

//   if (reach.length === 0) {
//     return (
//       <div style={{ padding: "28px 0", textAlign: "center", color: D.muted, fontSize: 11, fontFamily: D.mono }}>
//         <span style={{ color: "rgba(0,212,170,0.4)" }}>$</span> no contests yet
//         <span style={{ color: D.teal, marginLeft: 2, fontWeight: 700 }}>▌</span>
//       </div>
//     );
//   }

//   const avgReach  = reach.reduce((s, r) => s + r.maxReach, 0) / reach.length;
//   const improving = reach.length >= 3 &&
//     reach.slice(-3).reduce((s, r) => s + r.maxReach, 0) / 3 >
//     reach.slice(0, 3).reduce((s, r) => s + r.maxReach, 0) / 3;

//   const stats: { label: string; value: string | number; color: string }[] = [
//     { label: "contests",  value: reach.length,                       color: D.teal  },
//     { label: "avg reach", value: Math.round(avgReach * 10) / 10,    color: D.amber },
//     { label: "trend",     value: improving ? "↑ pushing further" : "→ steady", color: improving ? D.green : D.secondary },
//   ];

//   return (
//     <div>
//       {/* Stats */}
//       <div style={{ display: "flex", gap: 14, marginBottom: 12, flexWrap: "wrap" }}>
//         {stats.map(s => (
//           <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
//             <span style={{ fontSize: typeof s.value === "string" ? 11 : 15, fontWeight: 800, fontFamily: D.mono, color: s.color, letterSpacing: "-0.02em", lineHeight: 1 }}>
//               {s.value}
//             </span>
//             {typeof s.value !== "string" && (
//               <span style={{ fontSize: 9, color: D.muted, fontFamily: D.sans }}>{s.label}</span>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Horizontal bars — one per contest */}
//       <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 220, overflowY: "auto" }}>
//         {reach.map((r, i) => {
//           const isHov     = hovIdx === i;
//           const col       = pColor(r.pct);
//           const reachPct  = r.total > 0 ? (r.maxReach / r.total) * 100 : 0;
//           const solvePct  = r.total > 0 ? (r.solved / r.total) * 100 : 0;
//           const shortName = r.name.length > 22 ? r.name.slice(0, 20) + "…" : r.name;

//           return (
//             <motion.div
//               key={r.id}
//               initial={{ opacity: 0, x: -10 }}
//               animate={inView ? { opacity: 1, x: 0 } : {}}
//               transition={{ duration: 0.3, delay: Math.min(i * 0.045, 0.4), ease: [0.22, 1, 0.36, 1] }}
//               onHoverStart={() => setHovIdx(i)}
//               onHoverEnd={() => setHovIdx(null)}
//               style={{ position: "relative" }}
//             >
//               {/* Label row */}
//               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, alignItems: "center" }}>
//                 <span style={{
//                   fontSize: 10.5, fontFamily: D.sans, fontWeight: 500,
//                   color: isHov ? D.primary : D.secondary,
//                   transition: "color 0.12s",
//                 }}>
//                   {shortName}
//                 </span>
//                 <span style={{ fontSize: 9, fontFamily: D.mono, color: D.muted, whiteSpace: "nowrap", marginLeft: 6 }}>
//                   {r.maxReach > 0 ? `#${r.maxReach}` : "—"} / {r.total}
//                 </span>
//               </div>

//               {/* Track */}
//               <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
//                 {/* Reach ghost (how far you went) */}
//                 <motion.div
//                   initial={{ width: 0 }}
//                   animate={inView ? { width: `${reachPct}%` } : {}}
//                   transition={{ duration: 0.55, delay: 0.18 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
//                   style={{
//                     position: "absolute", left: 0, top: 0, bottom: 0,
//                     borderRadius: 4,
//                     background: col === D.green
//                       ? "rgba(74,222,128,0.18)"
//                       : col === D.teal
//                         ? "rgba(0,212,170,0.18)"
//                         : col === D.amber
//                           ? "rgba(251,191,36,0.15)"
//                           : "rgba(248,113,113,0.15)",
//                   }}
//                 />
//                 {/* Actual solved bar */}
//                 <motion.div
//                   initial={{ width: 0 }}
//                   animate={inView ? { width: `${solvePct}%` } : {}}
//                   transition={{ duration: 0.5, delay: 0.3 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
//                   style={{
//                     position: "absolute", left: 0, top: 0, bottom: 0,
//                     borderRadius: 4,
//                     background: col,
//                     boxShadow: isHov ? `0 0 6px ${col}80` : "none",
//                     transition: "box-shadow 0.14s",
//                   }}
//                 />
//               </div>

//               {/* Hover tooltip */}
//               <AnimatePresence>
//                 {isHov && (
//                   <motion.div
//                     key="tip"
//                     initial={{ opacity: 0, y: 3 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0 }}
//                     transition={{ duration: 0.1 }}
//                     style={{
//                       position: "absolute", right: 0, top: -30,
//                       background: D.elevated,
//                       border: `1px solid ${col}40`,
//                       borderRadius: 6,
//                       padding: "3px 8px",
//                       fontSize: 9.5, fontFamily: D.mono, color: col,
//                       whiteSpace: "nowrap", zIndex: 10, pointerEvents: "none",
//                     }}
//                   >
//                     {r.solved}/{r.total} solved · {Math.round(r.pct)}%
//                     {r.maxReach !== r.solved && ` · reached #${r.maxReach}`}
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </motion.div>
//           );
//         })}
//       </div>

//       {/* Legend */}
//       <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
//         {[
//           { label: "solved", opacity: 1 },
//           { label: "reached (not solved)", opacity: 0.2 },
//         ].map(l => (
//           <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
//             <div style={{ width: 18, height: 4, borderRadius: 2, background: `rgba(0,212,170,${l.opacity})` }} />
//             <span style={{ fontSize: 8.5, color: D.muted, fontFamily: D.mono }}>{l.label}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ── Ordinal Funnel Chart ───────────────────────────────────────────────────────

// function OrdinalFunnelChart({ contests, inView }: { contests: ContestSummary[]; inView: boolean }) {
//   const [hovIdx, setHovIdx] = useState<number | null>(null);
//   const pts = useMemo(() => computeOrdinalPoints(contests), [contests]);

//   if (pts.length === 0) {
//     return (
//       <div style={{ padding: "28px 0", textAlign: "center", color: D.muted, fontSize: 11, fontFamily: D.mono }}>
//         <span style={{ color: "rgba(0,212,170,0.4)" }}>$</span> not enough contest data yet
//         <span style={{ color: D.teal, marginLeft: 2, fontWeight: 700 }}>▌</span>
//       </div>
//     );
//   }

//   const W = 540, H = 140, PX = 18, PY = 22, PB = 22;

//   // Drop-off detection
//   let dropIdx = -1;
//   for (let i = 1; i < pts.length; i++) {
//     if (pts[i - 1].pct - pts[i].pct > 20) { dropIdx = i; break; }
//   }

//   const wallPt   = dropIdx > 0 ? pts[dropIdx] : null;
//   const peakPct  = Math.max(...pts.map(p => p.pct));
//   const dropAmt  = dropIdx > 0 ? Math.round(pts[dropIdx - 1].pct - pts[dropIdx].pct) : 0;

//   const svgPts = pts.map((p, i) => ({
//     x: PX + (i / Math.max(pts.length - 1, 1)) * (W - PX * 2),
//     y: PY + (1 - p.pct / 100) * (H - PY - PB),
//     ...p,
//   }));

//   const linePath = catmullRom(svgPts);
//   const areaPath = linePath
//     ? `${linePath} L ${svgPts[svgPts.length - 1].x} ${H - PB} L ${svgPts[0].x} ${H - PB} Z`
//     : "";

//   // Smart label set — avoid collision
//   const labelSet = new Set<number>([0, pts.length - 1]);
//   if (dropIdx > 0) { labelSet.add(dropIdx - 1); labelSet.add(dropIdx); }
//   let minI = 0;
//   for (let i = 1; i < pts.length; i++) {
//     if (pts[i].pct < pts[minI].pct) minI = i;
//   }
//   labelSet.add(minI);

//   const stats = [
//     { label: "peak rate",  value: `${Math.round(peakPct)}%`, color: D.teal  },
//     { label: "skill wall", value: wallPt ? `#${wallPt.ordinal}` : "none",   color: wallPt ? D.red : D.green },
//     { label: "data",       value: `${contests.length} contests`,            color: D.muted },
//   ];

//   return (
//     <div>
//       {/* Stats */}
//       <div style={{ display: "flex", gap: 16, marginBottom: 10, flexWrap: "wrap" }}>
//         {stats.map(s => (
//           <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
//             <span style={{ fontSize: 13, fontWeight: 800, fontFamily: D.mono, color: s.color, letterSpacing: "-0.02em" }}>
//               {s.value}
//             </span>
//             <span style={{ fontSize: 9, color: D.muted, fontFamily: D.sans }}>{s.label}</span>
//           </div>
//         ))}
//       </div>

//       <svg
//         width="100%"
//         viewBox={`0 0 ${W} ${H}`}
//         style={{ overflow: "visible", display: "block" }}
//         aria-label="Ordinal skill funnel chart"
//       >
//         <defs>
//           <linearGradient id="ord-area-grad" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="0%"   stopColor="#00d4aa" stopOpacity="0.22" />
//             <stop offset="100%" stopColor="#00d4aa" stopOpacity="0"    />
//           </linearGradient>
//           <linearGradient id="ord-red-wash" x1="0" y1="0" x2="1" y2="0">
//             <stop offset="0%"   stopColor="#f87171" stopOpacity="0.02" />
//             <stop offset="100%" stopColor="#f87171" stopOpacity="0.1"  />
//           </linearGradient>
//           <filter id="ord-line-glow" x="-5%" y="-50%" width="110%" height="200%">
//             <feGaussianBlur stdDeviation="2" result="b" />
//             <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
//           </filter>
//           <filter id="ord-dot-glow" x="-60%" y="-60%" width="220%" height="220%">
//             <feGaussianBlur stdDeviation="2" result="b" />
//             <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
//           </filter>
//         </defs>

//         {/* Grid */}
//         {[0, 25, 50, 75, 100].map(g => {
//           const gy = PY + (1 - g / 100) * (H - PY - PB);
//           return (
//             <g key={g}>
//               <line x1={PX} x2={W - PX} y1={gy} y2={gy}
//                 stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3,6" />
//               <text x={PX - 5} y={gy + 3.5} fontSize="7" fill="rgba(255,255,255,0.2)"
//                 fontFamily={D.mono} textAnchor="end">{g}%</text>
//             </g>
//           );
//         })}

//         {/* Eligible context bars — show confidence: taller = more contests qualified */}
//         {svgPts.map((p, i) => {
//           const barW = Math.max(8, (W - PX * 2) / pts.length - 3);
//           const confH = (p.eligible / contests.length) * (H - PY - PB) * 0.28;
//           return (
//             <rect key={`conf-${i}`}
//               x={p.x - barW / 2} y={H - PB - confH}
//               width={barW} height={confH}
//               rx="2"
//               fill="rgba(255,255,255,0.035)"
//               title={`${p.eligible} contests eligible`}
//             />
//           );
//         })}

//         {/* Red wash after drop-off */}
//         {dropIdx > 0 && (() => {
//           const midX = (svgPts[dropIdx - 1].x + svgPts[dropIdx].x) / 2;
//           return (
//             <motion.rect
//               x={midX} y={PY - 5}
//               width={W - midX - PX + 5} height={H - PY - PB + 10}
//               fill="url(#ord-red-wash)" rx="4"
//               initial={{ opacity: 0 }}
//               animate={inView ? { opacity: 1 } : {}}
//               transition={{ delay: 1.25, duration: 0.6 }}
//             />
//           );
//         })()}

//         {/* Drop-off dashed vertical */}
//         {dropIdx > 0 && (() => {
//           const midX = (svgPts[dropIdx - 1].x + svgPts[dropIdx].x) / 2;
//           return (
//             <motion.line
//               x1={midX} y1={PY - 5} x2={midX} y2={H - PB + 2}
//               stroke="rgba(248,113,113,0.45)" strokeWidth="1.5" strokeDasharray="4,4"
//               initial={{ pathLength: 0, opacity: 0 }}
//               animate={inView ? { pathLength: 1, opacity: 1 } : {}}
//               transition={{ delay: 1.18, duration: 0.4 }}
//             />
//           );
//         })()}

//         {/* Area */}
//         <motion.path d={areaPath} fill="url(#ord-area-grad)"
//           initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
//           transition={{ delay: 0.7, duration: 0.8 }} />

//         {/* Line */}
//         <motion.path d={linePath} fill="none" stroke={D.teal} strokeWidth="2.2"
//           strokeLinecap="round" style={{ filter: "url(#ord-line-glow)" }}
//           initial={{ pathLength: 0, opacity: 0 }}
//           animate={inView ? { pathLength: 1, opacity: 1 } : {}}
//           transition={{ duration: 1.05, delay: 0.08, ease: [0.22, 1, 0.36, 1] }} />

//         {/* Dots */}
//         {svgPts.map((p, i) => {
//           const isHov  = hovIdx === i;
//           const isDrop = dropIdx > 0 && i >= dropIdx;
//           const dotC   = isDrop ? D.red : D.teal;
//           const r      = isHov ? 5.5 : 4;
//           const showLbl = labelSet.has(i) || isHov;

//           return (
//             <g key={p.ordinal}>
//               {isHov && (
//                 <motion.circle cx={p.x} cy={p.y} r={13}
//                   fill={`${dotC}10`}
//                   initial={{ scale: 0.3, opacity: 0 }}
//                   animate={{ scale: 1, opacity: 1 }}
//                 />
//               )}
//               <motion.circle
//                 cx={p.x} cy={p.y} r={r}
//                 fill={D.elevated} stroke={dotC} strokeWidth={isHov ? 2.5 : 1.8}
//                 style={{ cursor: "pointer", filter: isHov ? "url(#ord-dot-glow)" : "none", transition: "r 0.12s" }}
//                 initial={{ scale: 0, opacity: 0 }}
//                 animate={inView ? { scale: 1, opacity: 1 } : {}}
//                 transition={{ delay: 0.5 + i * 0.065, type: "spring", stiffness: 440, damping: 20 }}
//                 onHoverStart={() => setHovIdx(i)}
//                 onHoverEnd={() => setHovIdx(null)}
//               />
//               {showLbl && (
//                 <motion.text
//                   x={p.x} y={p.y - r - 5}
//                   textAnchor="middle" fontSize={isHov ? 9 : 7.5}
//                   fontFamily={D.mono} fontWeight="700"
//                   fill={isDrop ? "rgba(248,113,113,0.78)" : "rgba(0,212,170,0.78)"}
//                   initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
//                   transition={{ delay: 0.7 + i * 0.065 }}
//                 >
//                   {Math.round(p.pct)}%
//                 </motion.text>
//               )}
//               <motion.text
//                 x={p.x} y={H - 5}
//                 textAnchor="middle" fontSize="8.5"
//                 fontFamily={D.mono} fontWeight="700"
//                 fill={isDrop ? "rgba(248,113,113,0.5)" : "rgba(0,212,170,0.5)"}
//                 initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
//                 transition={{ delay: 0.38 + i * 0.05 }}
//               >
//                 {p.label}
//               </motion.text>
//             </g>
//           );
//         })}

//         {/* Drop-off badge */}
//         {dropIdx > 0 && (() => {
//           const midX = (svgPts[dropIdx - 1].x + svgPts[dropIdx].x) / 2;
//           return (
//             <motion.g
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={inView ? { opacity: 1, scale: 1 } : {}}
//               transition={{ delay: 1.45, type: "spring", stiffness: 320, damping: 22 }}
//             >
//               <rect x={midX - 40} y={H - PB - 26} width={80} height={16}
//                 rx="5" fill="rgba(248,113,113,0.12)" stroke="rgba(248,113,113,0.32)" strokeWidth="1" />
//               <text x={midX} y={H - PB - 14} textAnchor="middle"
//                 fontSize="7.5" fontFamily={D.mono} fontWeight="700" fill={D.red}>
//                 ↓ {dropAmt}% skill wall
//               </text>
//             </motion.g>
//           );
//         })()}

//         {/* Hover tooltip */}
//         <AnimatePresence>
//           {hovIdx !== null && (() => {
//             const p  = svgPts[hovIdx];
//             const dc = dropIdx > 0 && hovIdx >= dropIdx ? D.red : D.teal;
//             const tx = Math.max(Math.min(p.x, W - 52), 52);
//             const ty = p.y > H / 2 ? p.y - 58 : p.y + 12;
//             return (
//               <motion.g key="tt"
//                 initial={{ opacity: 0, scale: 0.84 }} animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0 }} transition={{ duration: 0.11 }}
//               >
//                 <rect x={tx - 48} y={ty} width={96} height={48} rx="7"
//                   fill={D.elevated} stroke={`${dc}44`} strokeWidth="1"
//                   style={{ filter: "drop-shadow(0 5px 16px rgba(0,0,0,0.65))" }} />
//                 <text x={tx} y={ty + 14} textAnchor="middle" fontSize="9.5"
//                   fontFamily={D.mono} fontWeight="700" fill={dc}>
//                   {p.label} problem · {Math.round(p.pct)}%
//                 </text>
//                 <text x={tx} y={ty + 28} textAnchor="middle" fontSize="8.5"
//                   fontFamily={D.mono} fill={D.muted}>
//                   {p.solved} / {p.eligible} contests solved
//                 </text>
//                 <text x={tx} y={ty + 41} textAnchor="middle" fontSize="7.5"
//                   fontFamily={D.mono} fill="rgba(255,255,255,0.2)">
//                   {p.eligible < contests.length
//                     ? `only ${p.eligible} of ${contests.length} had ≥${p.ordinal} problems`
//                     : `all ${contests.length} contests eligible`}
//                 </text>
//               </motion.g>
//             );
//           })()}
//         </AnimatePresence>
//       </svg>

//       {/* Interpretation note */}
//       <div style={{ marginTop: 8, fontSize: 9, color: D.muted, fontFamily: D.sans, lineHeight: 1.6, opacity: 0.8 }}>
//         X-axis = ordinal position within each contest (1st problem, 2nd problem…). Only contests with ≥N problems count toward point N, so each comparison is fair.
//         <span style={{ display: "block", marginTop: 2, opacity: 0.7 }}>
//           Faint bars behind = number of contests with enough problems (taller = more reliable data).
//         </span>
//       </div>
//     </div>
//   );
// }

// // ── Main export ────────────────────────────────────────────────────────────────

// interface AnalyticsSectionProps {
//   contests: ContestSummary[];
//   problems: CfGroupProblem[];
// }

// export function AnalyticsSection({ contests, problems }: AnalyticsSectionProps) {
//   const ref    = useRef<HTMLDivElement>(null);
//   const inView = useInView(ref, { once: true, margin: "-40px" });

//   const solvedCount = problems.filter(p => p.cf_status === "solved").length;

//   return (
//     <motion.div
//       ref={ref}
//       initial={{ opacity: 0, y: 20 }}
//       animate={inView ? { opacity: 1, y: 0 } : {}}
//       transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
//       style={{
//         background: D.surface,
//         border: `1px solid ${D.border}`,
//         borderRadius: 14,
//         overflow: "hidden",
//         position: "relative",
//         fontFamily: D.sans,
//       }}
//     >
//       {/* Ambient glow */}
//       <div aria-hidden style={{
//         position: "absolute", top: -40, right: -40,
//         width: 180, height: 180, borderRadius: "50%",
//         background: D.teal, filter: "blur(75px)",
//         opacity: 0.028, pointerEvents: "none",
//       }} />

//       {/* ── Header */}
//       <div style={{
//         display: "flex", alignItems: "center", justifyContent: "space-between",
//         padding: "12px 16px", borderBottom: `1px solid ${D.border}`,
//         flexWrap: "wrap", gap: 6,
//       }}>
//         <motion.span
//           initial={{ opacity: 0, letterSpacing: "0.3em" }}
//           animate={inView ? { opacity: 1, letterSpacing: "0.1em" } : {}}
//           transition={{ duration: 0.45, delay: 0.1 }}
//           style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: D.muted }}
//         >
//           Analytics
//         </motion.span>
//         <span style={{ fontSize: 9.5, fontFamily: D.mono, color: D.muted }}>
//           {contests.length} contests · {solvedCount} solved
//         </span>
//       </div>

//       {/* ── Top row: Velocity (left) + Contest Reach (right) */}
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderBottom: `1px solid ${D.border}` }}>
//         {/* Velocity */}
//         <div style={{ padding: "14px 16px", borderRight: `1px solid ${D.border}` }}>
//           <div style={{
//             fontSize: 9, fontWeight: 700, color: D.muted,
//             textTransform: "uppercase", letterSpacing: "0.1em",
//             marginBottom: 12, fontFamily: D.mono,
//           }}>
//             Weekly Velocity
//           </div>
//           <VelocityChart problems={problems} inView={inView} />
//         </div>

//         {/* Contest Reach */}
//         <div style={{ padding: "14px 16px" }}>
//           <div style={{
//             fontSize: 9, fontWeight: 700, color: D.muted,
//             textTransform: "uppercase", letterSpacing: "0.1em",
//             marginBottom: 12, fontFamily: D.mono,
//           }}>
//             Contest Reach
//           </div>
//           <ContestReachChart contests={contests} inView={inView} />
//         </div>
//       </div>

//       {/* ── Ordinal Funnel — full width */}
//       <div style={{ padding: "14px 16px" }}>
//         <div style={{
//           display: "flex", alignItems: "center", gap: 8,
//           fontSize: 9, fontWeight: 700, color: D.muted,
//           textTransform: "uppercase", letterSpacing: "0.1em",
//           marginBottom: 12, fontFamily: D.mono,
//         }}>
//           <span>Skill Funnel</span>
//           <span style={{
//             fontSize: 8.5, fontWeight: 600, color: D.teal,
//             background: "rgba(0,212,170,0.08)",
//             border: "1px solid rgba(0,212,170,0.2)",
//             borderRadius: 4, padding: "1px 6px",
//             letterSpacing: "0.03em",
//             textTransform: "none",
//           }}>
//             ordinal-corrected
//           </span>
//         </div>
//         <OrdinalFunnelChart contests={contests} inView={inView} />
//       </div>

//       {/* ── Bottom accent */}
//       <motion.div
//         initial={{ scaleX: 0 }}
//         animate={inView ? { scaleX: 1 } : {}}
//         transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
//         style={{
//           height: 2,
//           background: `linear-gradient(90deg, ${D.teal}, ${D.amber}, transparent)`,
//           transformOrigin: "left",
//           opacity: 0.42,
//         }}
//       />
//     </motion.div>
//   );
// }

"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useReducedMotion,
  animate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import type { CfGroupProblem } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────────

export type ContestSummary = {
  id:        string;
  name:      string;
  problems:  CfGroupProblem[];
  solved:    number;
  attempted: number;
  todo:      number;
  total:     number;
  pct:       number;
};

type ContestReachPoint = {
  id:       string;
  name:     string;
  total:    number;
  solved:   number;
  pct:      number;
  maxReach: number;
};

type OrdinalPoint = {
  ordinal:  number;
  label:    string;
  eligible: number;
  solved:   number;
  pct:      number;
};

type WeekBucket = {
  weekStart: string;
  count:     number;
  label:     string;
};

// ── Design tokens ──────────────────────────────────────────────────────────────

const D = {
  surface:   "var(--bg-surface,  #111114)",
  elevated:  "var(--bg-elevated, #16161a)",
  border:    "rgba(255,255,255,0.07)",
  muted:     "var(--text-muted,     #52525b)",
  secondary: "var(--text-secondary, #a1a1aa)",
  primary:   "var(--text-primary,   #f4f4f5)",
  teal:      "#00d4aa",
  amber:     "#fbbf24",
  red:       "#f87171",
  green:     "#4ade80",
  blue:      "#60a5fa",
  mono:      "var(--font-mono, 'JetBrains Mono', monospace)",
  sans:      "var(--font-sans, system-ui, sans-serif)",
} as const;

// ── Easing ────────────────────────────────────────────────────────────────────

const EASE_ENTER = [0.22, 1, 0.36, 1] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function indexOrder(idx: string): number {
  if (!idx) return 999;
  return idx.charCodeAt(0) - 65 + (idx.length > 1 ? (parseInt(idx.slice(1), 10) || 0) * 26 : 0);
}

function pColor(p: number): string {
  if (p === 100) return D.green;
  if (p >= 70)   return D.teal;
  if (p >= 40)   return D.amber;
  if (p > 0)     return D.red;
  return "rgba(255,255,255,0.15)";
}

function catmullRom(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

// ── Data transforms (logic unchanged) ────────────────────────────────────────

function computeContestReach(contests: ContestSummary[]): ContestReachPoint[] {
  return contests
    .map(c => {
      const sorted = [...c.problems].sort((a, b) => indexOrder(a.problem_index) - indexOrder(b.problem_index));
      let maxReach = 0;
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].cf_status === "solved") maxReach = i + 1;
      }
      return { id: c.id, name: c.name, total: c.total, solved: c.solved, pct: c.pct, maxReach };
    })
    .sort((a, b) => b.id.localeCompare(a.id));
}

function computeOrdinalPoints(contests: ContestSummary[]): OrdinalPoint[] {
  const maxN = Math.max(...contests.map(c => c.total), 0);
  const result: OrdinalPoint[] = [];
  for (let n = 1; n <= maxN; n++) {
    const eligible = contests.filter(c => c.total >= n);
    if (eligible.length === 0) break;
    if (eligible.length < 2 && n > 4) break;
    let solvedCount = 0;
    for (const c of eligible) {
      const sorted = [...c.problems].sort((a, b) => indexOrder(a.problem_index) - indexOrder(b.problem_index));
      if (sorted[n - 1]?.cf_status === "solved") solvedCount++;
    }
    result.push({ ordinal: n, label: `#${n}`, eligible: eligible.length, solved: solvedCount, pct: (solvedCount / eligible.length) * 100 });
  }
  return result;
}

function computeVelocity(problems: CfGroupProblem[]): WeekBucket[] {
  const solved = problems.filter(p => p.solved_at && p.cf_status === "solved");
  if (solved.length === 0) return [];
  const map = new Map<string, number>();
  for (const p of solved) {
    const d = new Date(p.solved_at!);
    const day = d.getDay();
    const mon = new Date(d);
    mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    mon.setHours(0, 0, 0, 0);
    const key = mon.toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  const keys = [...map.keys()].sort();
  if (keys.length === 0) return [];
  const result: WeekBucket[] = [];
  let cur = new Date(keys[0]);
  const now = new Date();
  while (cur <= now) {
    const key = cur.toISOString().slice(0, 10);
    result.push({ weekStart: key, count: map.get(key) ?? 0, label: cur.toLocaleDateString("en-US", { month: "short", day: "numeric" }) });
    cur.setDate(cur.getDate() + 7);
  }
  return result;
}

// ── Count-up hook ─────────────────────────────────────────────────────────────

function useCountUp(target: number, inView: boolean, duration = 1.1) {
  const val = useMotionValue(0);
  const rounded = useTransform(val, Math.round);
  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(val, target, { duration, ease: EASE_ENTER });
    return ctrl.stop;
  }, [inView, target, val, duration]);
  return rounded;
}

// ── Stat pill ─────────────────────────────────────────────────────────────────

function StatPill({
  label, value, color, numeric = false, inView, delay = 0,
}: {
  label: string; value: string | number; color: string;
  numeric?: boolean; inView: boolean; delay?: number;
}) {
  const numVal = typeof value === "number" ? value : 0;
  const counted = useCountUp(numVal, inView && numeric, 1.0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay, ease: EASE_ENTER }}
      style={{
        display: "flex", flexDirection: "column", gap: 2,
        padding: "10px 14px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 10,
        minWidth: 72,
      }}
    >
      <span style={{
        fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", color: D.muted, fontFamily: D.mono,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 18, fontWeight: 800, fontFamily: D.mono,
        color, letterSpacing: "-0.03em", lineHeight: 1,
      }}>
        {numeric ? <motion.span>{counted}</motion.span> : value}
      </span>
    </motion.div>
  );
}

// ── Key Insight Card ──────────────────────────────────────────────────────────

function KeyInsightCard({
  contests, problems, ordinalPts, inView,
}: {
  contests: ContestSummary[];
  problems: CfGroupProblem[];
  ordinalPts: OrdinalPoint[];
  inView: boolean;
}) {
  // Find skill wall
  let dropIdx = -1;
  for (let i = 1; i < ordinalPts.length; i++) {
    if (ordinalPts[i - 1].pct - ordinalPts[i].pct > 20) { dropIdx = i; break; }
  }

  const totalSolved = problems.filter(p => p.cf_status === "solved").length;
  const fullContests = contests.filter(c => c.pct === 100).length;

  // Recent velocity
  const buckets = computeVelocity(problems);
  const recent4 = buckets.slice(-4);
  const recentAvg = recent4.length > 0
    ? recent4.reduce((s, b) => s + b.count, 0) / recent4.length
    : 0;

  let insight = "";
  let insightColor:string = D.teal;

  if (dropIdx > 0 && ordinalPts[dropIdx]) {
    const drop = Math.round(ordinalPts[dropIdx - 1].pct - ordinalPts[dropIdx].pct);
    insight = `Your solve rate drops ${drop}% at problem #${ordinalPts[dropIdx].ordinal} — that's your current skill ceiling. Focus here.`;
    insightColor = D.red;
  } else if (fullContests === contests.length) {
    insight = `Perfect — you've completed all ${contests.length} contests. Your solve consistency is exceptional.`;
    insightColor = D.green;
  } else if (recentAvg > 5) {
    insight = `Strong momentum — you're averaging ${Math.round(recentAvg * 10) / 10} solves/week recently. Keep the streak alive.`;
    insightColor = D.teal;
  } else {
    const topContest = [...contests].sort((a, b) => b.pct - a.pct)[0];
    insight = `${totalSolved} solved across ${contests.length} contests. ${topContest ? `${topContest.name} is your best at ${Math.round(topContest.pct)}%.` : ""}`;
    insightColor = D.amber;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: 0.22, ease: EASE_ENTER }}
      style={{
        margin: "0 16px 0 16px",
        padding: "10px 14px",
        background: `linear-gradient(135deg, ${insightColor}08 0%, transparent 60%)`,
        border: `1px solid ${insightColor}22`,
        borderRadius: 10,
        display: "flex", alignItems: "flex-start", gap: 10,
      }}
    >
      {/* Pulsing dot */}
      <div style={{ position: "relative", flexShrink: 0, marginTop: 3 }}>
        <motion.div
          animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5 }}
          style={{
            position: "absolute", inset: -3,
            borderRadius: "50%", background: insightColor, opacity: 0.25,
          }}
        />
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: insightColor }} />
      </div>

      <div>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: insightColor,
          fontFamily: D.mono, display: "block", marginBottom: 3,
        }}>
          Key Insight
        </span>
        <span style={{ fontSize: 12, color: D.secondary, fontFamily: D.sans, lineHeight: 1.5 }}>
          {insight}
        </span>
      </div>
    </motion.div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children, chip }: { children: React.ReactNode; chip?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <span style={{
        fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
        textTransform: "uppercase", color: D.muted, fontFamily: D.mono,
      }}>
        {children}
      </span>
      {chip}
    </div>
  );
}

// ── Velocity Chart ────────────────────────────────────────────────────────────

function VelocityChart({ problems, inView }: { problems: CfGroupProblem[]; inView: boolean }) {
  const reduced = useReducedMotion();
  const [hovIdx, setHovIdx] = useState<number | null>(null);
  const buckets = useMemo(() => computeVelocity(problems), [problems]);

  if (buckets.length === 0) {
    return (
      <div style={{ padding: "32px 0", textAlign: "center", color: D.muted, fontSize: 11, fontFamily: D.mono }}>
        <span style={{ color: "rgba(0,212,170,0.4)" }}>$</span> no solve history yet
        <span style={{ color: D.teal, marginLeft: 2, fontWeight: 700 }}>▌</span>
      </div>
    );
  }

  const display   = buckets.slice(-16);
  const maxCount  = Math.max(...display.map(b => b.count), 1);
  const totalSolved = buckets.reduce((s, b) => s + b.count, 0);
  const bestWeek  = buckets.reduce((best, b) => b.count > best.count ? b : best, buckets[0]);
  const recent4   = display.slice(-4);
  const recentAvg = recent4.reduce((s, b) => s + b.count, 0) / Math.max(recent4.length, 1);
  const prev4     = display.slice(-8, -4);
  const prevAvg   = prev4.length > 0 ? prev4.reduce((s, b) => s + b.count, 0) / prev4.length : recentAvg;
  const trend     = recentAvg - prevAvg;
  const trendStr  = trend >= 0 ? `+${Math.round(trend * 10) / 10}` : `${Math.round(trend * 10) / 10}`;

  const rolling = display.map((_, i) => {
    const win = display.slice(Math.max(0, i - 3), i + 1);
    return win.reduce((s, b) => s + b.count, 0) / win.length;
  });

  const BAR_W = 520;
  const CHART_H = 130;

  return (
    <div>
      {/* Stat row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
        {[
          { label: "total",     value: totalSolved,                          color: D.teal  },
          { label: "best week", value: bestWeek.count,                       color: D.green },
          { label: "4-wk avg",  value: Math.round(recentAvg * 10) / 10,     color: D.amber },
          { label: "trend",     value: trendStr, color: trend >= 0 ? D.green : D.red },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 6 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.35, delay: i * 0.06, ease: EASE_ENTER }}
            style={{ display: "flex", alignItems: "baseline", gap: 4 }}
          >
            <span style={{
              fontSize: 17, fontWeight: 800, fontFamily: D.mono,
              color: s.color, letterSpacing: "-0.03em", lineHeight: 1,
            }}>
              {s.value}
            </span>
            <span style={{ fontSize: 9, color: D.muted }}>{s.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ position: "relative", height: CHART_H + 8 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: CHART_H, position: "relative" }}>
          {display.map((bucket, i) => {
            const isHov     = hovIdx === i;
            const isCurrent = i === display.length - 1;
            const isEmpty   = bucket.count === 0;
            const hPct      = isEmpty ? 3 : Math.max((bucket.count / maxCount) * 100, 5);
            const alpha     = 0.25 + (bucket.count / maxCount) * 0.65;

            return (
              <motion.div
                key={bucket.weekStart}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={inView ? { scaleY: 1, opacity: 1 } : {}}
                transition={
                  reduced ? { duration: 0 }
                    : {
                        scaleY:  { duration: 0.5, delay: i * 0.025, ease: EASE_ENTER },
                        opacity: { duration: 0.2, delay: i * 0.025 },
                      }
                }
                onHoverStart={() => setHovIdx(i)}
                onHoverEnd={() => setHovIdx(null)}
                style={{
                  flex: 1,
                  height: `${hPct}%`,
                  borderRadius: "3px 3px 2px 2px",
                  background: isEmpty
                    ? "rgba(255,255,255,0.04)"
                    : isCurrent
                    ? `linear-gradient(to top, #00d4aa, #00d4aa88)`
                    : isHov
                    ? `linear-gradient(to top, #00d4aa, #00d4aa88)`
                    : `linear-gradient(to top, rgba(0,212,170,${alpha}), rgba(0,212,170,${alpha * 0.55}))`,
                  transformOrigin: "bottom",
                  cursor: "default",
                  position: "relative",
                  boxShadow: (isCurrent || isHov) && !isEmpty
                    ? "0 0 12px rgba(0,212,170,0.3)"
                    : "none",
                  transition: "background 0.12s, box-shadow 0.12s",
                }}
              />
            );
          })}
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {hovIdx !== null && (() => {
            const b = display[hovIdx];
            const leftPct = ((hovIdx + 0.5) / display.length) * 100;
            return (
              <motion.div
                key={hovIdx}
                initial={{ opacity: 0, scale: 0.88, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.12 }}
                style={{
                  position: "absolute",
                  bottom: `calc(100% - ${CHART_H * (1 - Math.max((b.count / maxCount), 0.03))}px + 10px)`,
                  left: `${Math.max(Math.min(leftPct, 88), 12)}%`,
                  transform: "translateX(-50%)",
                  background: D.elevated,
                  border: "1px solid rgba(0,212,170,0.25)",
                  borderRadius: 7,
                  padding: "5px 10px",
                  pointerEvents: "none",
                  zIndex: 10,
                  whiteSpace: "nowrap",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                }}
              >
                <span style={{ fontSize: 13, fontFamily: D.mono, color: D.teal, fontWeight: 800 }}>{b.count}</span>
                <span style={{ fontSize: 9, color: D.muted, fontFamily: D.mono, marginLeft: 5 }}>solved · {b.label}</span>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Rolling avg SVG overlay */}
        {display.length > 3 && (
          <svg
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: CHART_H, overflow: "visible", pointerEvents: "none" }}
            viewBox={`0 0 ${BAR_W} ${CHART_H}`}
            preserveAspectRatio="none"
          >
            <defs>
              <filter id="vel-glow2" x="-20%" y="-60%" width="140%" height="220%">
                <feGaussianBlur stdDeviation="2" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {(() => {
              const step = BAR_W / display.length;
              const pts  = rolling.map((avg, i) => ({ x: (i + 0.5) * step, y: CHART_H - (avg / maxCount) * (CHART_H - 6) }));
              return (
                <motion.path
                  d={catmullRom(pts)}
                  fill="none"
                  stroke={D.amber}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="5,4"
                  style={{ filter: "url(#vel-glow2)", opacity: 0.8 }}
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : {}}
                  transition={reduced ? { duration: 0 } : { duration: 1.2, delay: 0.55, ease: EASE_ENTER }}
                />
              );
            })()}
          </svg>
        )}
      </div>

      {/* X-axis labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        {[display[0], display[Math.floor(display.length / 2)], display[display.length - 1]].map((b, i) =>
          b ? (
            <span key={i} style={{ fontSize: 8, fontFamily: D.mono, color: D.muted, opacity: 0.55 }}>{b.label}</span>
          ) : null
        )}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8 }}>
        <svg width="20" height="6" style={{ flexShrink: 0 }}>
          <line x1="0" y1="3" x2="20" y2="3" stroke={D.amber} strokeWidth="1.5" strokeDasharray="5,4" />
        </svg>
        <span style={{ fontSize: 8.5, color: D.muted, fontFamily: D.mono }}>4-week rolling avg</span>
      </div>
    </div>
  );
}

// ── Contest Reach Chart ───────────────────────────────────────────────────────

function ContestReachChart({ contests, inView }: { contests: ContestSummary[]; inView: boolean }) {
  const reduced = useReducedMotion();
  const [hovIdx, setHovIdx] = useState<number | null>(null);
  const reach = useMemo(() => computeContestReach(contests), [contests]);

  if (reach.length === 0) {
    return (
      <div style={{ padding: "32px 0", textAlign: "center", color: D.muted, fontSize: 11, fontFamily: D.mono }}>
        <span style={{ color: "rgba(0,212,170,0.4)" }}>$</span> no contests yet
      </div>
    );
  }

  const avgReach  = reach.reduce((s, r) => s + r.maxReach, 0) / reach.length;
  const improving = reach.length >= 3 &&
    reach.slice(-3).reduce((s, r) => s + r.maxReach, 0) / 3 >
    reach.slice(0, 3).reduce((s, r) => s + r.maxReach, 0) / 3;

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
        {[
          { label: "contests",  value: reach.length,                      color: D.teal  },
          { label: "avg reach", value: Math.round(avgReach * 10) / 10,   color: D.amber },
          { label: improving ? "↑ pushing further" : "→ steady",
            value: improving ? "improving" : "steady",
            color: improving ? D.green : D.secondary },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 6 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.35, delay: i * 0.06, ease: EASE_ENTER }}
            style={{ display: "flex", alignItems: "baseline", gap: 4 }}
          >
            {typeof s.value === "number" ? (
              <>
                <span style={{ fontSize: 17, fontWeight: 800, fontFamily: D.mono, color: s.color, letterSpacing: "-0.03em" }}>{s.value}</span>
                <span style={{ fontSize: 9, color: D.muted }}>{s.label}</span>
              </>
            ) : (
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: D.mono, color: s.color }}>
                {i === 2 ? s.label : s.value}
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
        {reach.map((r, i) => {
          const isHov    = hovIdx === i;
          const col      = pColor(r.pct);
          const reachPct = r.total > 0 ? (r.maxReach / r.total) * 100 : 0;
          const solvePct = r.total > 0 ? (r.solved / r.total) * 100 : 0;
          const shortName = r.name.length > 24 ? r.name.slice(0, 22) + "…" : r.name;

          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={
                reduced ? { duration: 0 }
                  : { duration: 0.32, delay: Math.min(i * 0.04, 0.38), ease: EASE_ENTER }
              }
              onHoverStart={() => setHovIdx(i)}
              onHoverEnd={() => setHovIdx(null)}
              style={{
                padding: "6px 8px",
                borderRadius: 8,
                background: isHov ? "rgba(255,255,255,0.03)" : "transparent",
                transition: "background 0.12s",
                position: "relative",
              }}
            >
              {/* Left accent */}
              <motion.div
                animate={{ opacity: isHov ? 1 : 0, scaleY: isHov ? 1 : 0 }}
                transition={{ duration: 0.12 }}
                style={{
                  position: "absolute", left: 0, top: 6, bottom: 6,
                  width: 2.5, borderRadius: "0 2px 2px 0",
                  background: col, transformOrigin: "center",
                }}
              />

              {/* Label row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <span style={{
                  fontSize: 11, fontFamily: D.sans, fontWeight: 500,
                  color: isHov ? D.primary : D.secondary,
                  transition: "color 0.12s",
                  paddingLeft: 6,
                }}>
                  {shortName}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {/* Percentage chip */}
                  <span style={{
                    fontSize: 9.5, fontFamily: D.mono, fontWeight: 700,
                    color: col,
                    background: `${col}14`,
                    border: `1px solid ${col}28`,
                    borderRadius: 5,
                    padding: "1px 6px",
                  }}>
                    {Math.round(r.pct)}%
                  </span>
                  <span style={{ fontSize: 9, fontFamily: D.mono, color: D.muted }}>
                    {r.solved}/{r.total}
                  </span>
                </div>
              </div>

              {/* Track */}
              <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.05)", position: "relative", overflow: "hidden", marginLeft: 6 }}>
                {/* Reach ghost */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${reachPct}%` } : {}}
                  transition={reduced ? { duration: 0 } : { duration: 0.55, delay: 0.15 + i * 0.035, ease: EASE_ENTER }}
                  style={{
                    position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 3,
                    background: `${col}22`,
                  }}
                />
                {/* Solved bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${solvePct}%` } : {}}
                  transition={reduced ? { duration: 0 } : { duration: 0.5, delay: 0.28 + i * 0.035, ease: EASE_ENTER }}
                  style={{
                    position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 3,
                    background: col,
                    boxShadow: isHov ? `0 0 8px ${col}60` : "none",
                    transition: "box-shadow 0.14s",
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
        {[{ label: "solved", opacity: 1 }, { label: "furthest reach", opacity: 0.2 }].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 16, height: 3, borderRadius: 2, background: `rgba(0,212,170,${l.opacity})` }} />
            <span style={{ fontSize: 8.5, color: D.muted, fontFamily: D.mono }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Ordinal Funnel Chart — Hero ───────────────────────────────────────────────

function OrdinalFunnelChart({ contests, inView }: { contests: ContestSummary[]; inView: boolean }) {
  const reduced = useReducedMotion();
  const [hovIdx, setHovIdx] = useState<number | null>(null);
  const pts = useMemo(() => computeOrdinalPoints(contests), [contests]);

  if (pts.length === 0) {
    return (
      <div style={{ padding: "32px 0", textAlign: "center", color: D.muted, fontSize: 11, fontFamily: D.mono }}>
        <span style={{ color: "rgba(0,212,170,0.4)" }}>$</span> not enough contest data yet
        <span style={{ color: D.teal, marginLeft: 2, fontWeight: 700 }}>▌</span>
      </div>
    );
  }

  const W = 560, H = 180, PX = 20, PY = 24, PB = 28;

  // Drop-off detection
  let dropIdx = -1;
  for (let i = 1; i < pts.length; i++) {
    if (pts[i - 1].pct - pts[i].pct > 20) { dropIdx = i; break; }
  }

  const wallPt  = dropIdx > 0 ? pts[dropIdx] : null;
  const peakPct = Math.max(...pts.map(p => p.pct));
  const dropAmt = dropIdx > 0 ? Math.round(pts[dropIdx - 1].pct - pts[dropIdx].pct) : 0;

  const svgPts = pts.map((p, i) => ({
    x: PX + (i / Math.max(pts.length - 1, 1)) * (W - PX * 2),
    y: PY + (1 - p.pct / 100) * (H - PY - PB),
    ...p,
  }));

  const linePath = catmullRom(svgPts);
  const areaPath = linePath
    ? `${linePath} L ${svgPts[svgPts.length - 1].x} ${H - PB} L ${svgPts[0].x} ${H - PB} Z`
    : "";

  // Smart label placement
  const labelSet = new Set<number>([0, pts.length - 1]);
  if (dropIdx > 0) { labelSet.add(dropIdx - 1); labelSet.add(dropIdx); }
  let minI = 0;
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].pct < pts[minI].pct) minI = i;
  }
  labelSet.add(minI);

  const stats = [
    { label: "peak rate",  value: `${Math.round(peakPct)}%`,               color: D.teal  },
    { label: "skill wall", value: wallPt ? `#${wallPt.ordinal}` : "none",  color: wallPt ? D.red : D.green },
    { label: "data",       value: `${contests.length} contests`,            color: D.muted },
  ];

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "flex", gap: 18, marginBottom: 14, flexWrap: "wrap" }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 6 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.35, delay: i * 0.07, ease: EASE_ENTER }}
            style={{ display: "flex", alignItems: "baseline", gap: 4 }}
          >
            <span style={{ fontSize: 14, fontWeight: 800, fontFamily: D.mono, color: s.color, letterSpacing: "-0.02em" }}>
              {s.value}
            </span>
            <span style={{ fontSize: 9, color: D.muted }}>{s.label}</span>
          </motion.div>
        ))}
      </div>

      {/* SVG chart */}
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ overflow: "visible", display: "block" }}
        aria-label="Ordinal skill funnel chart"
      >
        <defs>
          <linearGradient id="ord-area-grad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#00d4aa" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#00d4aa" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="ord-red-wash2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#f87171" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#f87171" stopOpacity="0.12" />
          </linearGradient>
          <filter id="ord-line-glow2" x="-5%" y="-60%" width="110%" height="220%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="ord-dot-glow2" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(g => {
          const gy = PY + (1 - g / 100) * (H - PY - PB);
          return (
            <g key={g}>
              <line x1={PX} x2={W - PX} y1={gy} y2={gy}
                stroke="rgba(255,255,255,0.055)" strokeWidth="1" strokeDasharray="3,7" />
              <text x={PX - 6} y={gy + 3.5} fontSize="7.5" fill="rgba(255,255,255,0.22)"
                fontFamily={D.mono} textAnchor="end">{g}%</text>
            </g>
          );
        })}

        {/* Confidence bars */}
        {svgPts.map((p, i) => {
          const barW = Math.max(10, (W - PX * 2) / pts.length - 4);
          const confH = (p.eligible / contests.length) * (H - PY - PB) * 0.3;
          return (
            <rect key={`conf-${i}`}
              x={p.x - barW / 2} y={H - PB - confH}
              width={barW} height={confH} rx="2"
              fill="rgba(255,255,255,0.04)"
            />
          );
        })}

        {/* Red wash after skill wall */}
        {dropIdx > 0 && (() => {
          const midX = (svgPts[dropIdx - 1].x + svgPts[dropIdx].x) / 2;
          return (
            <motion.rect
              x={midX} y={PY - 5}
              width={W - midX - PX + 5} height={H - PY - PB + 10}
              fill="url(#ord-red-wash2)" rx="4"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={reduced ? { duration: 0 } : { delay: 1.3, duration: 0.6 }}
            />
          );
        })()}

        {/* Drop-off vertical line */}
        {dropIdx > 0 && (() => {
          const midX = (svgPts[dropIdx - 1].x + svgPts[dropIdx].x) / 2;
          return (
            <motion.line
              x1={midX} y1={PY - 5} x2={midX} y2={H - PB + 2}
              stroke="rgba(248,113,113,0.5)" strokeWidth="1.5" strokeDasharray="4,4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={inView ? { pathLength: 1, opacity: 1 } : {}}
              transition={reduced ? { duration: 0 } : { delay: 1.2, duration: 0.4 }}
            />
          );
        })()}

        {/* Area fill */}
        <motion.path d={areaPath} fill="url(#ord-area-grad2)"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={reduced ? { duration: 0 } : { delay: 0.7, duration: 0.8 }}
        />

        {/* Line */}
        <motion.path d={linePath} fill="none" stroke={D.teal} strokeWidth="2.5"
          strokeLinecap="round" style={{ filter: "url(#ord-line-glow2)" }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : {}}
          transition={reduced ? { duration: 0 } : { duration: 1.1, delay: 0.1, ease: EASE_ENTER }}
        />

        {/* Dots */}
        {svgPts.map((p, i) => {
          const isHov  = hovIdx === i;
          const isDrop = dropIdx > 0 && i >= dropIdx;
          const dotC   = isDrop ? D.red : D.teal;
          const r      = isHov ? 6.5 : 4.5;
          const showLbl = labelSet.has(i) || isHov;

          return (
            <g key={p.ordinal}>
              {isHov && (
                <motion.circle cx={p.x} cy={p.y} r={16}
                  fill={`${dotC}10`}
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                />
              )}
              <motion.circle
                cx={p.x} cy={p.y} r={r}
                fill={D.elevated} stroke={dotC} strokeWidth={isHov ? 2.5 : 1.8}
                style={{ cursor: "pointer", filter: isHov ? "url(#ord-dot-glow2)" : "none", transition: "r 0.12s" }}
                initial={{ scale: 0, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : {}}
                transition={reduced ? { duration: 0 } : { delay: 0.55 + i * 0.06, type: "spring", stiffness: 440, damping: 20 }}
                onHoverStart={() => setHovIdx(i)}
                onHoverEnd={() => setHovIdx(null)}
              />
              {showLbl && !isHov && (
                <motion.text
                  x={p.x} y={p.y - r - 6}
                  textAnchor="middle" fontSize="8"
                  fontFamily={D.mono} fontWeight="700"
                  fill={isDrop ? "rgba(248,113,113,0.8)" : "rgba(0,212,170,0.8)"}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.75 + i * 0.055 }}
                >
                  {Math.round(p.pct)}%
                </motion.text>
              )}
              <motion.text
                x={p.x} y={H - 8}
                textAnchor="middle" fontSize="8.5"
                fontFamily={D.mono} fontWeight="700"
                fill={isDrop ? "rgba(248,113,113,0.55)" : "rgba(0,212,170,0.55)"}
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={reduced ? { duration: 0 } : { delay: 0.4 + i * 0.05 }}
              >
                {p.label}
              </motion.text>
            </g>
          );
        })}

        {/* Skill wall badge */}
        {dropIdx > 0 && (() => {
          const midX = (svgPts[dropIdx - 1].x + svgPts[dropIdx].x) / 2;
          const badgeW = 96;
          const badgeX = Math.max(Math.min(midX - badgeW / 2, W - PX - badgeW), PX);
          return (
            <motion.g
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={reduced ? { duration: 0 } : { delay: 1.5, type: "spring", stiffness: 320, damping: 22 }}
            >
              <rect x={badgeX} y={H - PB - 30} width={badgeW} height={20}
                rx="6"
                fill="rgba(248,113,113,0.1)"
                stroke="rgba(248,113,113,0.3)"
                strokeWidth="1"
              />
              <text x={badgeX + badgeW / 2} y={H - PB - 16}
                textAnchor="middle" fontSize="8.5"
                fontFamily={D.mono} fontWeight="700" fill={D.red}
              >
                ↓ {dropAmt}% skill wall
              </text>
            </motion.g>
          );
        })()}

        {/* Hover tooltip */}
        <AnimatePresence>
          {hovIdx !== null && (() => {
            const p  = svgPts[hovIdx];
            const dc = dropIdx > 0 && hovIdx >= dropIdx ? D.red : D.teal;
            const tx = Math.max(Math.min(p.x, W - 56), 56);
            const ty = p.y > H / 2 ? p.y - 72 : p.y + 14;
            return (
              <motion.g key="tt"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.11 }}
              >
                <rect x={tx - 54} y={ty} width={108} height={54} rx="8"
                  fill={D.elevated} stroke={`${dc}44`} strokeWidth="1"
                  style={{ filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.7))" }}
                />
                <text x={tx} y={ty + 16} textAnchor="middle" fontSize="10"
                  fontFamily={D.mono} fontWeight="800" fill={dc}>
                  {p.label} · {Math.round(p.pct)}%
                </text>
                <text x={tx} y={ty + 30} textAnchor="middle" fontSize="8.5"
                  fontFamily={D.mono} fill={D.secondary}>
                  {p.solved} / {p.eligible} contests solved
                </text>
                <text x={tx} y={ty + 44} textAnchor="middle" fontSize="7.5"
                  fontFamily={D.mono} fill={D.muted}>
                  {p.eligible < contests.length
                    ? `${p.eligible}/${contests.length} contests eligible`
                    : `all ${contests.length} contests`}
                </text>
              </motion.g>
            );
          })()}
        </AnimatePresence>
      </svg>

      {/* Caption */}
      <div style={{ marginTop: 8, fontSize: 9, color: D.muted, fontFamily: D.sans, lineHeight: 1.6, opacity: 0.75 }}>
        X-axis = ordinal position within each contest (1st, 2nd problem…). Only contests with ≥N problems count toward point N.
        <span style={{ display: "block", marginTop: 1, opacity: 0.7 }}>
          Faint bars = number of qualifying contests (taller = more reliable data).
        </span>
      </div>
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────

function InnerDivider({ vertical = false }: { vertical?: boolean }) {
  return (
    <div style={
      vertical
        ? { width: 1, alignSelf: "stretch", background: D.border }
        : { height: 1, width: "100%", background: D.border }
    } />
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface AnalyticsSectionProps {
  contests: ContestSummary[];
  problems: CfGroupProblem[];
}

export function AnalyticsSection({ contests, problems }: AnalyticsSectionProps) {
  const reduced    = useReducedMotion();
  const ref        = useRef<HTMLDivElement>(null);
  const inView     = useInView(ref, { once: true, margin: "-40px" });

  const solvedCount  = problems.filter(p => p.cf_status === "solved").length;
  const todoCount    = problems.filter(p => p.cf_status === "todo").length;
  const ordinalPts   = useMemo(() => computeOrdinalPoints(contests), [contests]);

  // Velocity for trend
  const buckets    = useMemo(() => computeVelocity(problems), [problems]);
  const recent4Avg = useMemo(() => {
    const r = buckets.slice(-4);
    return r.length > 0 ? Math.round((r.reduce((s, b) => s + b.count, 0) / r.length) * 10) / 10 : 0;
  }, [buckets]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={reduced ? { duration: 0 } : { duration: 0.5, ease: EASE_ENTER }}
      style={{
        background: D.surface,
        border: `1px solid ${D.border}`,
        borderRadius: 14,
        overflow: "hidden",
        position: "relative",
        fontFamily: D.sans,
      }}
    >
      {/* Ambient glow */}
      <div aria-hidden style={{
        position: "absolute", top: -50, right: -50,
        width: 220, height: 220, borderRadius: "50%",
        background: D.teal, filter: "blur(80px)",
        opacity: 0.025, pointerEvents: "none",
      }} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: `1px solid ${D.border}`,
        flexWrap: "wrap", gap: 10,
      }}>
        <motion.span
          initial={{ opacity: 0, letterSpacing: "0.3em" }}
          animate={inView ? { opacity: 1, letterSpacing: "0.1em" } : {}}
          transition={reduced ? { duration: 0 } : { duration: 0.45, delay: 0.1 }}
          style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: D.muted, fontFamily: D.mono }}
        >
          Analytics
        </motion.span>

        {/* Summary stat pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { label: "contests",  value: contests.length,  color: D.teal  },
            { label: "solved",    value: solvedCount,       color: D.green },
            { label: "todo",      value: todoCount,         color: D.muted },
            { label: "avg/wk",   value: recent4Avg,        color: D.amber },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={reduced ? { duration: 0 } : { delay: 0.15 + i * 0.05, type: "spring", stiffness: 400, damping: 22 }}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "2px 8px",
                background: "rgba(255,255,255,0.035)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 6,
              }}
            >
              <span style={{ fontSize: 11, fontFamily: D.mono, fontWeight: 700, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 8.5, color: D.muted }}>{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Key Insight ─────────────────────────────────────────────────────── */}
      <div style={{ padding: "12px 0 0 0" }}>
        <KeyInsightCard contests={contests} problems={problems} ordinalPts={ordinalPts} inView={inView} />
      </div>

      {/* ── Velocity + Contest Reach — side by side ─────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        borderTop: `1px solid ${D.border}`,
        marginTop: 12,
      }}>
        {/* Velocity */}
        <div style={{ padding: "16px 16px 16px 16px", borderRight: `1px solid ${D.border}` }}>
          <SectionLabel>Weekly Velocity</SectionLabel>
          <VelocityChart problems={problems} inView={inView} />
        </div>

        {/* Contest Reach */}
        <div style={{ padding: "16px 16px" }}>
          <SectionLabel>Contest Reach</SectionLabel>
          <ContestReachChart contests={contests} inView={inView} />
        </div>
      </div>

      {/* ── Skill Funnel — full-width hero ──────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${D.border}` }}>
        <div style={{ padding: "16px 16px 14px 16px" }}>
          <SectionLabel
            chip={
              <span style={{
                fontSize: 8.5, fontWeight: 600, color: D.teal,
                background: "rgba(0,212,170,0.08)",
                border: "1px solid rgba(0,212,170,0.2)",
                borderRadius: 4, padding: "1px 6px",
                letterSpacing: "0.03em", textTransform: "none" as const,
                fontFamily: D.mono,
              }}>
                ordinal-corrected
              </span>
            }
          >
            Skill Funnel
          </SectionLabel>
          <OrdinalFunnelChart contests={contests} inView={inView} />
        </div>
      </div>

      {/* ── Bottom accent ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={reduced ? { duration: 0 } : { duration: 1.3, delay: 0.5, ease: EASE_ENTER }}
        style={{
          height: 2,
          background: `linear-gradient(90deg, ${D.teal}, ${D.amber}, transparent)`,
          transformOrigin: "left",
          opacity: 0.45,
        }}
      />
    </motion.div>
  );
}