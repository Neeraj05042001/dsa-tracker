// "use client";

// import { useState, useTransition } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import type { CfGroup, CfGroupProblem, UserCfAuth } from "@/types";

// // ── Types ─────────────────────────────────────────────────────────────────────

// type GroupWithProblems = CfGroup & { problems: CfGroupProblem[] };

// interface GroupsClientProps {
//   groups:      GroupWithProblems[];
//   cfAuth:      UserCfAuth | null;
//   lastSynced:  string | null;
//   userId:      string;
// }

// // ── Helpers ───────────────────────────────────────────────────────────────────

// function formatTimeAgo(iso: string | null): string {
//   if (!iso) return "Never";
//   const diff    = Date.now() - new Date(iso).getTime();
//   const minutes = Math.floor(diff / 60000);
//   const hours   = Math.floor(diff / 3600000);
//   const days    = Math.floor(diff / 86400000);
//   if (minutes < 1)  return "Just now";
//   if (hours < 1)    return `${minutes}m ago`;
//   if (days < 1)     return `${hours}h ago`;
//   return `${days}d ago`;
// }

// function getRatingColor(rating: number | null): string {
//   if (!rating) return "var(--text-secondary)";
//   if (rating < 1200) return "#9b9b9b";
//   if (rating < 1400) return "#00c853";
//   if (rating < 1600) return "#03a9f4";
//   if (rating < 1900) return "#7c4dff";
//   if (rating < 2100) return "#ff9800";
//   if (rating < 2400) return "#f44336";
//   return "#ff1744";
// }

// // ── Circular Progress Ring ────────────────────────────────────────────────────

// function ProgressRing({ pct, size = 72 }: { pct: number; size?: number }) {
//   const radius      = (size - 8) / 2;
//   const circumference = 2 * Math.PI * radius;
//   const offset      = circumference - (pct / 100) * circumference;

//   return (
//     <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
//       {/* Track */}
//       <circle
//         cx={size / 2} cy={size / 2} r={radius}
//         fill="none"
//         stroke="rgba(255,255,255,0.06)"
//         strokeWidth={5}
//       />
//       {/* Progress */}
//       <motion.circle
//         cx={size / 2} cy={size / 2} r={radius}
//         fill="none"
//         stroke="#00d4aa"
//         strokeWidth={5}
//         strokeLinecap="round"
//         strokeDasharray={circumference}
//         initial={{ strokeDashoffset: circumference }}
//         animate={{ strokeDashoffset: offset }}
//         transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
//       />
//     </svg>
//   );
// }

// // ── Status Badge ──────────────────────────────────────────────────────────────

// function StatusBadge({ status }: { status: "solved" | "attempted" | "todo" }) {
//   const config = {
//     solved:    { label: "Solved",    bg: "rgba(0,200,83,0.12)",    color: "#00c853",  dot: "#00c853"  },
//     attempted: { label: "Attempted", bg: "rgba(255,152,0,0.12)",   color: "#ff9800",  dot: "#ff9800"  },
//     todo:      { label: "Todo",      bg: "rgba(255,255,255,0.06)", color: "var(--text-secondary)", dot: "rgba(255,255,255,0.3)" },
//   }[status];

//   return (
//     <span style={{
//       display:        "inline-flex",
//       alignItems:     "center",
//       gap:            5,
//       padding:        "2px 8px",
//       borderRadius:   6,
//       background:     config.bg,
//       color:          config.color,
//       fontSize:       11,
//       fontWeight:     600,
//       letterSpacing:  "0.02em",
//       whiteSpace:     "nowrap",
//     }}>
//       <span style={{ width: 5, height: 5, borderRadius: "50%", background: config.dot, flexShrink: 0 }} />
//       {config.label}
//     </span>
//   );
// }

// // ── Problem Row ───────────────────────────────────────────────────────────────

// function ProblemRow({
//   problem,
//   onAddToTracker,
//   adding,
// }: {
//   problem:        CfGroupProblem;
//   onAddToTracker: (p: CfGroupProblem) => void;
//   adding:         boolean;
// }) {
//   return (
//     <motion.div
//       layout
//       style={{
//         display:       "grid",
//         gridTemplateColumns: "32px 1fr 90px 60px 120px",
//         alignItems:    "center",
//         gap:           12,
//         padding:       "10px 16px",
//         borderBottom:  "1px solid rgba(255,255,255,0.04)",
//         transition:    "background 0.15s ease",
//       }}
//       whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
//     >
//       {/* Index */}
//       <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", textAlign: "center" }}>
//         {problem.problem_index}
//       </span>

//       {/* Name */}
//       <a
//         href={problem.problem_url}
//         target="_blank"
//         rel="noopener noreferrer"
//         style={{
//           fontSize:       13,
//           color:          "var(--text-primary)",
//           textDecoration: "none",
//           overflow:       "hidden",
//           textOverflow:   "ellipsis",
//           whiteSpace:     "nowrap",
//           transition:     "color 0.15s",
//         }}
//         onMouseOver={e => (e.currentTarget.style.color = "#00d4aa")}
//         onMouseOut={e  => (e.currentTarget.style.color = "var(--text-primary)")}
//       >
//         {problem.problem_name}
//       </a>

//       {/* Status */}
//       <StatusBadge status={problem.cf_status as "solved" | "attempted" | "todo"} />

//       {/* Rating */}
//       <span style={{
//         fontSize:   12,
//         fontFamily: "var(--font-mono)",
//         color:      getRatingColor(problem.cf_rating),
//         textAlign:  "right",
//       }}>
//         {problem.cf_rating ?? "—"}
//       </span>

//       {/* Add to tracker */}
//       <div style={{ display: "flex", justifyContent: "flex-end" }}>
//         {problem.tracker_problem_id ? (
//           <span style={{ fontSize: 11, color: "#00c853", display: "flex", alignItems: "center", gap: 4 }}>
//             <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//               <polyline points="20 6 9 17 4 12" />
//             </svg>
//             Tracked
//           </span>
//         ) : (
//           <button
//             onClick={() => onAddToTracker(problem)}
//             disabled={adding}
//             style={{
//               padding:        "4px 10px",
//               background:     "rgba(0,212,170,0.08)",
//               border:         "1px solid rgba(0,212,170,0.2)",
//               borderRadius:   6,
//               color:          "#00d4aa",
//               fontSize:       11,
//               fontWeight:     600,
//               cursor:         adding ? "default" : "pointer",
//               opacity:        adding ? 0.5 : 1,
//               transition:     "all 0.15s",
//               whiteSpace:     "nowrap",
//             }}
//             onMouseOver={e => { if (!adding) { e.currentTarget.style.background = "rgba(0,212,170,0.15)"; e.currentTarget.style.borderColor = "rgba(0,212,170,0.4)"; }}}
//             onMouseOut={e  => { e.currentTarget.style.background = "rgba(0,212,170,0.08)"; e.currentTarget.style.borderColor = "rgba(0,212,170,0.2)"; }}
//           >
//             {adding ? "Adding..." : "+ Track"}
//           </button>
//         )}
//       </div>
//     </motion.div>
//   );
// }

// // ── Group Card ────────────────────────────────────────────────────────────────

// function GroupCard({
//   group,
//   index,
// }: {
//   group: GroupWithProblems;
//   index: number;
// }) {
//   const [expanded,  setExpanded]  = useState(false);
//   const [addingId,  setAddingId]  = useState<string | null>(null);
//   const [problems,  setProblems]  = useState(group.problems);
//   const [filter,    setFilter]    = useState<"all" | "todo" | "solved" | "attempted">("all");

//   // const pct        = group.progress_pct ?? 0;
//   // const total      = group.total_problems ?? 0;
//   // const solved     = group.solved_count ?? 0;
//   // const attempted  = group.attempted_count ?? 0;
//   // const todo       = group.todo_count ?? 0;

//   const total     = problems.length;
// const solved    = problems.filter(p => p.cf_status === 'solved').length;
// const attempted = problems.filter(p => p.cf_status === 'attempted').length;
// const todo      = problems.filter(p => p.cf_status === 'todo').length;
// const pct       = total > 0 ? Math.round((solved / total) * 100) : 0;

//   const filtered = filter === "all"
//     ? problems
//     : problems.filter(p => p.cf_status === filter);

//   async function handleAddToTracker(problem: CfGroupProblem) {
//     setAddingId(problem.id);
//     try {
//       const res = await fetch("/api/problems/from-extension", {
//         method:  "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           problem_name:  problem.problem_name,
//           platform:      "codeforces",
//           problem_url:   problem.problem_url,
//           problem_key:   `cf-group-${group.group_code}-${problem.contest_id}-${problem.problem_index}`.toLowerCase(),
//           cf_rating:     problem.cf_rating,
//           status:        problem.cf_status === "solved" ? "solved" : "attempted",
//           source:        "cf_group",
//           cf_group_code: group.group_code,
//           cf_contest_id: problem.contest_id,
//           cf_problem_idx: problem.problem_index,
//           solved_at:     problem.solved_at ?? new Date().toISOString(),
//         }),
//       });

//       if (res.ok) {
//         // Mark as tracked locally
//         setProblems(prev =>
//           prev.map(p =>
//             p.id === problem.id ? { ...p, tracker_problem_id: "tracked" } : p
//           )
//         );
//       }
//     } catch (err) {
//       console.error("Add to tracker failed:", err);
//     } finally {
//       setAddingId(null);
//     }
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.4, 0.25, 1] }}
//       style={{
//         background:   "var(--bg-surface)",
//         border:       "1px solid rgba(255,255,255,0.06)",
//         borderRadius: 14,
//         overflow:     "hidden",
//         transition:   "border-color 0.2s",
//       }}
//       whileHover={{ borderColor: "rgba(0,212,170,0.15)" }}
//     >
//       {/* Card Header */}
//       <div style={{ padding: "20px 20px 16px" }}>
//         <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>

//           {/* Progress ring + pct */}
//           <div style={{ position: "relative", flexShrink: 0 }}>
//             <ProgressRing pct={pct} size={72} />
//             <div style={{
//               position:   "absolute",
//               inset:      0,
//               display:    "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               flexDirection: "column",
//             }}>
//               <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
//                 {pct}%
//               </span>
//             </div>
//           </div>

//           {/* Info */}
//           <div style={{ flex: 1, minWidth: 0 }}>
//             <a
//               href={group.group_url ?? undefined}
//               target="_blank"
//               rel="noopener noreferrer"
//               style={{
//                 fontSize:       15,
//                 fontWeight:     600,
//                 color:          "var(--text-primary)",
//                 textDecoration: "none",
//                 display:        "block",
//                 overflow:       "hidden",
//                 textOverflow:   "ellipsis",
//                 whiteSpace:     "nowrap",
//                 marginBottom:   8,
//                 transition:     "color 0.15s",
//               }}
//               onMouseOver={e => (e.currentTarget.style.color = "#00d4aa")}
//               onMouseOut={e  => (e.currentTarget.style.color = "var(--text-primary)")}
//             >
//               {group.group_name}
//             </a>

//             {/* Stats row */}
//             <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
//               <StatPill label="Solved"    value={solved}   color="#00c853" />
//               <StatPill label="Attempted" value={attempted} color="#ff9800" />
//               <StatPill label="Todo"      value={todo}     color="var(--text-secondary)" />
//             </div>
//           </div>
//         </div>

//         {/* Expand button */}
//         <button
//           onClick={() => setExpanded(e => !e)}
//           style={{
//             display:        "flex",
//             alignItems:     "center",
//             gap:            6,
//             marginTop:      14,
//             padding:        "6px 12px",
//             width:          "100%",
//             background:     "rgba(255,255,255,0.03)",
//             border:         "1px solid rgba(255,255,255,0.06)",
//             borderRadius:   8,
//             color:          "var(--text-secondary)",
//             fontSize:       12,
//             fontWeight:     500,
//             cursor:         "pointer",
//             transition:     "all 0.15s",
//             justifyContent: "space-between",
//           }}
//           onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--text-primary)"; }}
//           onMouseOut={e  => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
//         >
//           <span>{total} problem{total !== 1 ? "s" : ""}</span>
//           <motion.svg
//             width="13" height="13" viewBox="0 0 24 24" fill="none"
//             stroke="currentColor" strokeWidth="2"
//             animate={{ rotate: expanded ? 180 : 0 }}
//             transition={{ duration: 0.2 }}
//           >
//             <polyline points="6 9 12 15 18 9" />
//           </motion.svg>
//         </button>
//       </div>

//       {/* Expandable Problem List */}
//       <AnimatePresence>
//         {expanded && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: "auto", opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
//             style={{ overflow: "hidden" }}
//           >
//             {/* Filter chips */}
//             <div style={{
//               display:    "flex",
//               gap:        6,
//               padding:    "10px 16px",
//               borderTop:  "1px solid rgba(255,255,255,0.05)",
//               background: "rgba(0,0,0,0.15)",
//             }}>
//               {(["all", "todo", "solved", "attempted"] as const).map(f => (
//                 <button
//                   key={f}
//                   onClick={() => setFilter(f)}
//                   style={{
//                     padding:      "3px 10px",
//                     borderRadius: 6,
//                     border:       filter === f ? "1px solid rgba(0,212,170,0.3)" : "1px solid rgba(255,255,255,0.06)",
//                     background:   filter === f ? "rgba(0,212,170,0.1)" : "transparent",
//                     color:        filter === f ? "#00d4aa" : "var(--text-secondary)",
//                     fontSize:     11,
//                     fontWeight:   600,
//                     cursor:       "pointer",
//                     transition:   "all 0.15s",
//                     textTransform: "capitalize",
//                   }}
//                 >
//                   {f === "all" ? `All (${total})` : f === "todo" ? `Todo (${todo})` : f === "solved" ? `Solved (${solved})` : `Tried (${attempted})`}
//                 </button>
//               ))}
//             </div>

//             {/* Table header */}
//             <div style={{
//               display:             "grid",
//               gridTemplateColumns: "32px 1fr 90px 60px 120px",
//               gap:                 12,
//               padding:             "8px 16px",
//               borderTop:           "1px solid rgba(255,255,255,0.04)",
//               background:          "rgba(0,0,0,0.1)",
//             }}>
//               {["#", "Problem", "Status", "Rating", ""].map((h, i) => (
//                 <span key={i} style={{
//                   fontSize:  10,
//                   fontWeight: 600,
//                   color:     "var(--text-secondary)",
//                   textTransform: "uppercase",
//                   letterSpacing: "0.08em",
//                   textAlign: i === 3 ? "right" : "left",
//                 }}>
//                   {h}
//                 </span>
//               ))}
//             </div>

//             {/* Problem rows */}
//             <div style={{ maxHeight: 320, overflowY: "auto" }}>
//               {filtered.length === 0 ? (
//                 <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>
//                   No {filter} problems
//                 </div>
//               ) : (
//                 filtered.map(problem => (
//                   <ProblemRow
//                     key={problem.id}
//                     problem={problem}
//                     onAddToTracker={handleAddToTracker}
//                     adding={addingId === problem.id}
//                   />
//                 ))
//               )}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// }

// function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
//       <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
//       <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
//         <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{value}</span>
//         {" "}{label}
//       </span>
//     </div>
//   );
// }

// // ── Empty State ───────────────────────────────────────────────────────────────

// function EmptyState({ hasAuth }: { hasAuth: boolean }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       style={{
//         display:        "flex",
//         flexDirection:  "column",
//         alignItems:     "center",
//         justifyContent: "center",
//         gap:            16,
//         padding:        "80px 24px",
//         textAlign:      "center",
//         background:     "var(--bg-surface)",
//         border:         "1px solid rgba(255,255,255,0.06)",
//         borderRadius:   14,
//       }}
//     >
//       <div style={{
//         width:        56,
//         height:       56,
//         borderRadius: "50%",
//         background:   "rgba(0,212,170,0.08)",
//         border:       "1px solid rgba(0,212,170,0.15)",
//         display:      "flex",
//         alignItems:   "center",
//         justifyContent: "center",
//       }}>
//         <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="1.5">
//           <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
//           <circle cx="9" cy="7" r="4"/>
//           <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
//         </svg>
//       </div>
//       <div>
//         <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
//           {hasAuth ? "No groups found" : "No Codeforces account connected"}
//         </h3>
//         <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 320 }}>
//           {hasAuth
//             ? "You're not a member of any Codeforces groups yet. Join a group on Codeforces and sync from the extension."
//             : "Open the Memoize extension while on codeforces.com and click Connect to sync your groups."
//           }
//         </p>
//       </div>
//     </motion.div>
//   );
// }

// // ── Main Export ───────────────────────────────────────────────────────────────

// export function GroupsClient({ groups, cfAuth, lastSynced, userId }: GroupsClientProps) {
//   const [syncing,     setSyncing]     = useState(false);
//   const [syncMsg,     setSyncMsg]     = useState<string | null>(null);
//   const [syncError,   setSyncError]   = useState(false);
//   const [localSynced, setLocalSynced] = useState(lastSynced);

  

// //   async function handleSync() {
// //   setSyncing(true);
// //   setSyncMsg(null);
// //   setSyncError(false);

// //   try {
// //     // Step 1: Ask extension to scrape + push to /api/cf/push-groups
// //     const result = await new Promise<any>((resolve, reject) => {
// //       const timeout = setTimeout(() => {
// //         reject(new Error("Extension timeout — make sure Memoize is active and you're logged into Codeforces"));
// //       }, 60000); // 60s — scraping takes time

// //       window.addEventListener("message", function handler(e) {
// //         if (e.data?.type !== "MEMOIZE_SYNC_COMPLETE") return;
// //         clearTimeout(timeout);
// //         window.removeEventListener("message", handler);
// //         resolve(e.data);
// //       });

// //       // Trigger the extension scraper
// //       window.postMessage({ type: "MEMOIZE_TRIGGER_SYNC" }, "*");
// //     });

// //     // Step 2: Handle result
// //     if (result.success) {
// //       const now = new Date().toISOString();
// //       setLocalSynced(now);
// //       setSyncMsg(`Synced ${result.groups_synced} group${result.groups_synced !== 1 ? "s" : ""} · ${result.problems_synced} problems`);
// //       setSyncError(false);
// //       setTimeout(() => window.location.reload(), 1200);
// //     } else {
// //       setSyncMsg(result.message || "Sync failed");
// //       setSyncError(true);
// //     }

// //   } catch (err: any) {
// //     setSyncMsg(err.message || "Connection error");
// //     setSyncError(true);
// //   } finally {
// //     setSyncing(false);
// //   }
// // }

// async function handleSync() {
//   setSyncing(true);
//   setSyncError(false);
//   setSyncMsg("Opening Codeforces...");

//   window.postMessage({ type: "MEMOIZE_TRIGGER_SYNC" }, "*");

//   // Progress messages so user knows it's working
//   const t1 = setTimeout(() => setSyncMsg("Scraping contests... (this takes ~2 min)"), 5000);
//   const t2 = setTimeout(() => setSyncMsg("Still working — fetching problem statuses..."), 45000);

//   // 3 minute hard timeout
//   const timeoutId = setTimeout(() => {
//     window.removeEventListener("message", handler);
//     setSyncing(false);
//     setSyncError(true);
//     setSyncMsg("Timed out — try syncing from the extension popup instead");
//     clearTimeout(t1); clearTimeout(t2);
//   }, 180000);

//   function handler(e: MessageEvent) {
//     if (e.data?.type !== "MEMOIZE_SYNC_COMPLETE") return;
//     window.removeEventListener("message", handler);
//     clearTimeout(timeoutId); clearTimeout(t1); clearTimeout(t2);
//     setSyncing(false);
//     if (e.data.success) {
//       setSyncMsg(`✓ Synced ${e.data.groups_synced} groups · ${e.data.problems_synced} problems`);
//       setTimeout(() => window.location.reload(), 1200);
//     } else {
//       setSyncMsg(e.data.message || "Sync failed");
//       setSyncError(true);
//     }
//   }

//   window.addEventListener("message", handler);
// }

//   return (
//     <div className="stagger">
//       {/* ── Toolbar ── */}
//       <div style={{
//         display:        "flex",
//         alignItems:     "center",
//         justifyContent: "space-between",
//         marginBottom:   20,
//         gap:            12,
//         flexWrap:       "wrap",
//       }}>
//         {/* Last synced */}
//         <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//           {localSynced && (
//             <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
//               Last synced: <span style={{ color: "var(--text-primary)" }}>{formatTimeAgo(localSynced)}</span>
//             </span>
//           )}
//           {syncMsg && (
//             <motion.span
//               initial={{ opacity: 0, x: -8 }}
//               animate={{ opacity: 1, x: 0 }}
//               style={{
//                 fontSize: 12,
//                 color:    syncError ? "#ef4444" : "#00c853",
//                 display:  "flex",
//                 alignItems: "center",
//                 gap:      4,
//               }}
//             >
//               {!syncError && (
//                 <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//                   <polyline points="20 6 9 17 4 12" />
//                 </svg>
//               )}
//               {syncMsg}
//             </motion.span>
//           )}
//         </div>

//         {/* Sync button */}
//         <button
//           onClick={handleSync}
//           disabled={syncing}
//           style={{
//             display:      "flex",
//             alignItems:   "center",
//             gap:          7,
//             padding:      "8px 16px",
//             background:   syncing ? "rgba(0,212,170,0.06)" : "rgba(0,212,170,0.1)",
//             border:       "1px solid rgba(0,212,170,0.25)",
//             borderRadius: 9,
//             color:        "#00d4aa",
//             fontSize:     13,
//             fontWeight:   600,
//             cursor:       syncing ? "default" : "pointer",
//             opacity:      syncing ? 0.7 : 1,
//             transition:   "all 0.15s",
//           }}
//           onMouseOver={e => { if (!syncing) { e.currentTarget.style.background = "rgba(0,212,170,0.15)"; e.currentTarget.style.borderColor = "rgba(0,212,170,0.4)"; }}}
//           onMouseOut={e  => { e.currentTarget.style.background = "rgba(0,212,170,0.1)"; e.currentTarget.style.borderColor = "rgba(0,212,170,0.25)"; }}
//         >
//           <motion.svg
//             width="14" height="14" viewBox="0 0 24 24" fill="none"
//             stroke="currentColor" strokeWidth="2"
//             animate={{ rotate: syncing ? 360 : 0 }}
//             transition={{ duration: 1, repeat: syncing ? Infinity : 0, ease: "linear" }}
//           >
//             <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0115-6.7L21 8" />
//             <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 01-15 6.7L3 16" />
//           </motion.svg>
//           {syncing ? "Syncing..." : "Sync Now"}
//         </button>
//       </div>

//       {/* ── Content ── */}
//       {groups.length === 0 ? (
//         <EmptyState hasAuth={!!cfAuth} />
//       ) : (
//         <div style={{
//           display:             "grid",
//           gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
//           gap:                 16,
//         }}>
//           {groups.map((group, i) => (
//             <GroupCard key={group.id} group={group} index={i} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  useInView,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";
import type { CfGroup, CfGroupProblem, UserCfAuth } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type GroupWithProblems = CfGroup & { problems: CfGroupProblem[] };

interface GroupsClientProps {
  groups:     GroupWithProblems[];
  cfAuth:     UserCfAuth | null;
  lastSynced: string | null;
  userId:     string;
}

// ─────────────────────────────────────────────────────────────────────────────
// EASE PRESETS
// ─────────────────────────────────────────────────────────────────────────────

const EASE_ENTER = [0.22, 1, 0.36, 1] as [number,number,number,number];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatTimeAgo(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "Just now";
  if (h < 1) return `${m}m ago`;
  if (d < 1) return `${h}h ago`;
  return `${d}d ago`;
}

function getRatingColor(rating: number | null): string {
  if (!rating) return "var(--text-muted)";
  if (rating < 1200) return "#9b9b9b";
  if (rating < 1400) return "#22c55e";
  if (rating < 1600) return "#3b82f6";
  if (rating < 1900) return "#a855f7";
  if (rating < 2100) return "#f59e0b";
  if (rating < 2400) return "#f87171";
  return "#ff1744";
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED COUNTER
// ─────────────────────────────────────────────────────────────────────────────

function Counter({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const reduced = useReducedMotion();
  const count   = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const ref     = useRef<HTMLSpanElement>(null);
  const inView  = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    if (reduced) { count.set(value); return; }
    const ctrl = animate(count, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return ctrl.stop;
  }, [inView, value, reduced, count, duration]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS RING
// ─────────────────────────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 88, stroke = 6 }: { pct: number; size?: number; stroke?: number }) {
  const reduced = useReducedMotion();
  const r     = (size - stroke * 2) / 2;
  const circ  = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color  = pct === 100 ? "#22c55e" : "#00d4aa";

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke+6} strokeOpacity={0.07} />
      <motion.circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={reduced ? { duration: 0 } : { duration: 1.4, ease: [0.16,1,0.3,1], delay: 0.2 }}
        style={{ filter: `drop-shadow(0 0 5px ${color}80)` }}
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "solved" | "attempted" | "todo" }) {
  const cfg = {
    solved:    { label: "Solved",    bg: "rgba(34,197,94,0.1)",   color: "#22c55e",               border: "rgba(34,197,94,0.2)"    },
    attempted: { label: "Attempted", bg: "rgba(245,158,11,0.1)",  color: "#f59e0b",               border: "rgba(245,158,11,0.2)"   },
    todo:      { label: "Todo",      bg: "rgba(255,255,255,0.05)", color: "var(--text-secondary)",  border: "rgba(255,255,255,0.08)" },
  }[status];

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "2px 8px", borderRadius: 6,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      color: cfg.color, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CHIP
// ─────────────────────────────────────────────────────────────────────────────

function StatChip({ value, label, color, delay = 0, suffix = "" }: {
  value: number; label: string; color: string; delay?: number; suffix?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { delay, duration: 0.4, ease: EASE_ENTER }}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "8px 14px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 10, minWidth: 60, gap: 3,
      }}
    >
      <span style={{
        fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)",
        color, letterSpacing: "-0.03em", lineHeight: 1,
      }}>
        <Counter value={value} />{suffix}
      </span>
      <span style={{
        fontSize: 10, fontWeight: 600, color: "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: "0.09em",
      }}>
        {label}
      </span>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM ROW
// ─────────────────────────────────────────────────────────────────────────────

function ProblemRow({
  problem, onAddToTracker, adding, index,
}: {
  problem: CfGroupProblem;
  onAddToTracker: (p: CfGroupProblem) => void;
  adding: boolean;
  index: number;
}) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      layout
      custom={index}
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: (i: number) => ({
          opacity: 1, y: 0,
          transition: { delay: i * 0.03, ease: EASE_ENTER, duration: 0.3 },
        }),
      }}
      initial={reduced ? "visible" : "hidden"}
      animate="visible"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "32px 1fr 100px 60px 110px",
        alignItems: "center", gap: 12,
        padding: "10px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        position: "relative",
        background: hovered ? "rgba(0,212,170,0.03)" : "transparent",
        transition: "background 0.12s",
      }}
    >
      {/* Left accent bar */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: 2, background: "#00d4aa",
              borderRadius: "0 2px 2px 0",
              transformOrigin: "center",
            }}
          />
        )}
      </AnimatePresence>

      <span style={{
        fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700,
        color: "rgba(0,212,170,0.5)", textAlign: "center",
      }}>
        {problem.problem_index}
      </span>

      <a
        href={problem.problem_url} target="_blank" rel="noopener noreferrer"
        style={{
          fontSize: 13, color: hovered ? "#00d4aa" : "var(--text-primary)",
          textDecoration: "none",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          transition: "color 0.12s",
        }}
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
          <span style={{
            fontSize: 11, color: "#22c55e",
            display: "flex", alignItems: "center", gap: 4, fontWeight: 600,
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Tracked
          </span>
        ) : (
          <motion.button
            onClick={() => onAddToTracker(problem)}
            disabled={adding}
            whileHover={adding ? {} : { scale: 1.04 }}
            whileTap={adding ? {} : { scale: 0.96 }}
            style={{
              padding: "4px 10px",
              background: "rgba(0,212,170,0.08)",
              border: "1px solid rgba(0,212,170,0.22)",
              borderRadius: 6, color: "#00d4aa",
              fontSize: 11, fontWeight: 600,
              cursor: adding ? "default" : "pointer",
              opacity: adding ? 0.5 : 1,
              transition: "background 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseOver={e => { if (!adding) e.currentTarget.style.background = "rgba(0,212,170,0.15)"; }}
            onMouseOut={e => { e.currentTarget.style.background = "rgba(0,212,170,0.08)"; }}
          >
            {adding ? "Adding..." : "+ Track"}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GROUP CARD
// ─────────────────────────────────────────────────────────────────────────────

function GroupCard({ group, index }: { group: GroupWithProblems; index: number }) {
  const reduced   = useReducedMotion();
  const [expanded, setExpanded]   = useState(false);
  const [addingId, setAddingId]   = useState<string | null>(null);
  const [problems, setProblems]   = useState(group.problems);
  const [filter, setFilter]       = useState<"all"|"todo"|"solved"|"attempted">("all");
  const [hovered, setHovered]     = useState(false);

  const total    = problems.length;
  const solved   = problems.filter(p => p.cf_status === "solved").length;
  const attempted = problems.filter(p => p.cf_status === "attempted").length;
  const todo     = problems.filter(p => p.cf_status === "todo").length;
  const pct      = total > 0 ? Math.round((solved / total) * 100) : 0;
  const color    = pct === 100 ? "#22c55e" : "#00d4aa";
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
        setProblems(prev => prev.map(p =>
          p.id === problem.id ? { ...p, tracker_problem_id: "tracked" } : p
        ));
      }
    } catch (err) {
      console.error("Add to tracker failed:", err);
    } finally {
      setAddingId(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.5, delay: index * 0.1, ease: EASE_ENTER }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={reduced ? {} : { y: -2 }}
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${hovered ? "rgba(0,212,170,0.2)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 16, overflow: "hidden", position: "relative",
        boxShadow: hovered
          ? "0 8px 32px -4px rgba(0,212,170,0.14), 0 0 0 1px rgba(0,212,170,0.08)"
          : "0 1px 3px rgba(0,0,0,0.4)",
        transition: "border-color 0.2s, box-shadow 0.25s",
      }}
    >
      {/* Ambient glow */}
      <motion.div
        animate={{ opacity: hovered ? 0.12 : 0.04, scale: hovered ? 1.4 : 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{
          position: "absolute", top: -50, right: -50,
          width: 200, height: 200, borderRadius: "50%",
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Bottom accent line */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}50, ${color}20, transparent)`,
        opacity: hovered ? 1 : 0.3,
        transition: "opacity 0.25s",
      }} />

      {/* Card body */}
      <div style={{ padding: "24px 24px 20px", position: "relative" }}>

        {/* Top row */}
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

          {/* Ring */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <ProgressRing pct={pct} size={88} />
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 1,
            }}>
              <span style={{
                fontSize: 17, fontWeight: 800, fontFamily: "var(--font-mono)",
                color: "var(--text-primary)", letterSpacing: "-0.04em", lineHeight: 1,
              }}>
                <Counter value={pct} />%
              </span>
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <a
                href={group.group_url ?? undefined}
                target="_blank" rel="noopener noreferrer"
                style={{
                  fontSize: 16, fontWeight: 700,
                  color: "var(--text-primary)", textDecoration: "none",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  flex: 1, minWidth: 0, letterSpacing: "-0.02em",
                  transition: "color 0.15s",
                }}
                onMouseOver={e => (e.currentTarget.style.color = "#00d4aa")}
                onMouseOut={e => (e.currentTarget.style.color = "var(--text-primary)")}
              >
                {group.group_name}
              </a>
              {group.group_url && (
                <a
                  href={group.group_url} target="_blank" rel="noopener noreferrer"
                  style={{ color: "var(--text-muted)", transition: "color 0.15s", flexShrink: 0 }}
                  onMouseOver={e => (e.currentTarget.style.color = "#00d4aa")}
                  onMouseOut={e => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              )}
            </div>

            {/* Stat chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <StatChip value={solved}    label="Solved"  color="#22c55e"                delay={0.15} />
              <StatChip value={todo}      label="Todo"    color="var(--text-secondary)"   delay={0.2}  />
              <StatChip value={attempted} label="Tried"   color="#f59e0b"                delay={0.25} />
              <StatChip value={total}     label="Total"   color="var(--text-secondary)"   delay={0.3}  />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 7,
          }}>
            <span style={{
              fontSize: 10, fontWeight: 600, color: "var(--text-muted)",
              textTransform: "uppercase", letterSpacing: "0.09em",
            }}>
              Progress
            </span>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
              {solved}/{total}
            </span>
          </div>
          <div style={{ height: 5, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={reduced ? { duration: 0 } : { duration: 1.4, ease: [0.16,1,0.3,1], delay: 0.3 }}
              style={{
                height: "100%", borderRadius: 4,
                background: pct === 100
                  ? "linear-gradient(90deg, #22c55e, #00d4aa)"
                  : "linear-gradient(90deg, rgba(0,212,170,0.5), #00d4aa)",
                boxShadow: `0 0 8px ${color}50`,
              }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <motion.button
            onClick={() => setExpanded(e => !e)}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 1, display: "flex", alignItems: "center",
              justifyContent: "space-between",
              padding: "9px 14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              color: "var(--text-secondary)", fontSize: 12, fontWeight: 500,
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
              {total} problems
            </span>
            <motion.svg
              width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2, ease: EASE_ENTER }}
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </motion.button>

          {/* Analytics CTA with shimmer */}
          <Link
            href={`/dashboard2/groups/${group.group_code}`}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 18px",
              background: "rgba(0,212,170,0.08)",
              border: "1px solid rgba(0,212,170,0.22)",
              borderRadius: 10, color: "#00d4aa",
              fontSize: 12, fontWeight: 700,
              textDecoration: "none", whiteSpace: "nowrap",
              flexShrink: 0, position: "relative", overflow: "hidden",
              transition: "all 0.15s",
            }}
            onMouseOver={(e: any) => {
              e.currentTarget.style.background = "rgba(0,212,170,0.14)";
              e.currentTarget.style.borderColor = "rgba(0,212,170,0.4)";
            }}
            onMouseOut={(e: any) => {
              e.currentTarget.style.background = "rgba(0,212,170,0.08)";
              e.currentTarget.style.borderColor = "rgba(0,212,170,0.22)";
            }}
          >
            <motion.div
              animate={{ x: ["-110%", "210%"] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 6, ease: "easeInOut" }}
              style={{
                position: "absolute", top: 0, left: 0,
                width: "40%", height: "100%",
                background: "linear-gradient(90deg, transparent, rgba(0,212,170,0.2), transparent)",
                pointerEvents: "none",
              }}
            />
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Analytics
          </Link>
        </div>
      </div>

      {/* Expandable table */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE_ENTER }}
            style={{ overflow: "hidden" }}
          >
            {/* Filter chips */}
            <div style={{
              display: "flex", gap: 6, padding: "10px 16px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(0,0,0,0.18)", flexWrap: "wrap",
            }}>
              {(["all","todo","solved","attempted"] as const).map(f => {
                const labels = {
                  all:      `All (${total})`,
                  todo:     `Todo (${todo})`,
                  solved:   `Solved (${solved})`,
                  attempted:`Tried (${attempted})`,
                };
                const active = filter === f;
                return (
                  <motion.button
                    key={f}
                    onClick={() => setFilter(f)}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: "4px 10px", borderRadius: 6,
                      border: active ? "1px solid rgba(0,212,170,0.3)" : "1px solid rgba(255,255,255,0.07)",
                      background: active ? "rgba(0,212,170,0.1)" : "transparent",
                      color: active ? "#00d4aa" : "var(--text-secondary)",
                      fontSize: 11, fontWeight: 600,
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {labels[f]}
                  </motion.button>
                );
              })}
            </div>

            {/* Column headers */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "32px 1fr 100px 60px 110px",
              gap: 12, padding: "8px 16px",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              background: "rgba(0,0,0,0.12)",
            }}>
              {["#","Problem","Status","Rating",""].map((h, i) => (
                <span key={i} style={{
                  fontSize: 10, fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase", letterSpacing: "0.09em",
                  textAlign: i === 3 ? "right" : "left",
                }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            <div style={{ maxHeight: 340, overflowY: "auto" }}>
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ padding: "28px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}
                  >
                    No {filter} problems
                  </motion.div>
                ) : (
                  filtered.map((p, i) => (
                    <ProblemRow
                      key={p.id} problem={p}
                      onAddToTracker={handleAddToTracker}
                      adding={addingId === p.id} index={i}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>

            {filtered.length > 0 && (
              <div style={{
                padding: "8px 16px",
                borderTop: "1px solid rgba(255,255,255,0.04)",
                display: "flex", justifyContent: "flex-end",
              }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  {filtered.length} problem{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY STRIP
// ─────────────────────────────────────────────────────────────────────────────

function SummaryStrip({ groups }: { groups: GroupWithProblems[] }) {
  const reduced = useReducedMotion();
  const total   = groups.reduce((s, g) => s + g.problems.length, 0);
  const solved  = groups.reduce((s, g) => s + g.problems.filter(p => p.cf_status === "solved").length, 0);
  const todo    = groups.reduce((s, g) => s + g.problems.filter(p => p.cf_status === "todo").length, 0);
  const pct     = total > 0 ? Math.round((solved / total) * 100) : 0;

  const items = [
    { value: groups.length, label: "Groups",   color: "#00d4aa",               suffix: "" },
    { value: total,         label: "Problems", color: "var(--text-secondary)",  suffix: "" },
    { value: solved,        label: "Solved",   color: "#22c55e",               suffix: "" },
    { value: todo,          label: "Todo",     color: "var(--text-secondary)",  suffix: "" },
    { value: pct,           label: "Overall",  color: "#00d4aa",               suffix: "%" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.4, ease: EASE_ENTER }}
      style={{
        display: "flex", gap: 0,
        background: "var(--bg-surface)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12, overflow: "hidden",
        marginBottom: 20,
      }}
    >
      {items.map((item, i) => (
        <div
          key={item.label}
          style={{
            flex: 1, padding: "14px 20px",
            borderRight: i < items.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
            display: "flex", flexDirection: "column", gap: 4,
          }}
        >
          <span style={{
            fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)",
            color: item.color, letterSpacing: "-0.03em", lineHeight: 1,
          }}>
            <Counter value={item.value} />{item.suffix}
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, color: "var(--text-muted)",
            textTransform: "uppercase", letterSpacing: "0.09em",
          }}>
            {item.label}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SYNC BUTTON
// ─────────────────────────────────────────────────────────────────────────────

type SyncState = "idle" | "syncing" | "success" | "error";

function SyncButton({ state, onClick }: { state: SyncState; onClick: () => void }) {
  const reduced = useReducedMotion();

  const cfg: Record<SyncState, { bg: string; border: string; color: string; label: string }> = {
    idle:    { bg: "rgba(0,212,170,0.1)",   border: "rgba(0,212,170,0.28)",   color: "#00d4aa", label: "Sync Now"  },
    syncing: { bg: "rgba(0,212,170,0.06)",  border: "rgba(0,212,170,0.18)",   color: "#00d4aa", label: "Syncing..." },
    success: { bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.28)",   color: "#22c55e", label: "Synced"    },
    error:   { bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.28)", color: "#f87171", label: "Failed"    },
  };

  const c = cfg[state];

  return (
    <motion.button
      onClick={onClick}
      disabled={state === "syncing"}
      whileHover={state !== "syncing" && !reduced ? { scale: 1.02, y: -1 } : {}}
      whileTap={state !== "syncing" && !reduced ? { scale: 0.97 } : {}}
      style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "9px 18px",
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 10, color: c.color,
        fontSize: 13, fontWeight: 700,
        cursor: state === "syncing" ? "default" : "pointer",
        transition: "all 0.2s",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Shimmer on idle */}
      {state === "idle" && (
        <motion.div
          animate={{ x: ["-110%", "210%"] }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
          style={{
            position: "absolute", top: 0, left: 0,
            width: "40%", height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(0,212,170,0.2), transparent)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Icon */}
      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.15 }}
        >
          {state === "success" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : state === "error" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <motion.svg
              width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              animate={{ rotate: state === "syncing" ? 360 : 0 }}
              transition={{ duration: 0.9, repeat: state === "syncing" ? Infinity : 0, ease: "linear" }}
            >
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0115-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 01-15 6.7L3 16" />
            </motion.svg>
          )}
        </motion.span>
      </AnimatePresence>

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          {c.label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ hasAuth }: { hasAuth: boolean }) {
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(true);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick(t => !t), 600);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.5, ease: EASE_ENTER }}
      style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 20, padding: "72px 32px", textAlign: "center",
        background: "var(--bg-surface)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16, position: "relative", overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
        width: 240, height: 240, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,212,170,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        width: 64, height: 64, borderRadius: 14,
        background: "rgba(0,212,170,0.08)",
        border: "1px solid rgba(0,212,170,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-mono)", fontSize: 20,
        color: "#00d4aa", fontWeight: 700,
      }}>
        {">_"}
      </div>

      <div>
        <h3 style={{
          margin: "0 0 10px", fontSize: 18, fontWeight: 700,
          color: "var(--text-primary)", letterSpacing: "-0.02em",
        }}>
          {hasAuth ? "No groups found" : "No CF account connected"}
        </h3>
        <p style={{
          margin: 0, fontSize: 12,
          color: "var(--text-secondary)", lineHeight: 1.8,
          maxWidth: 340, fontFamily: "var(--font-mono)",
        }}>
          {hasAuth
            ? "$ join a CF group → open extension → sync"
            : "$ open Memoize on codeforces.com → connect"
          }
          <motion.span
            animate={{ opacity: tick ? 1 : 0 }}
            transition={{ duration: 0 }}
            style={{ color: "#00d4aa", fontWeight: 700, marginLeft: 2 }}
          >
            ▌
          </motion.span>
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export function GroupsClient({ groups, cfAuth, lastSynced, userId }: GroupsClientProps) {
  const reduced = useReducedMotion();
  const [syncState, setSyncState]     = useState<SyncState>("idle");
  const [syncMsg, setSyncMsg]         = useState<string | null>(null);
  const [localSynced, setLocalSynced] = useState(lastSynced);

  async function handleSync() {
    setSyncState("syncing");
    setSyncMsg("Opening Codeforces...");
    window.postMessage({ type: "MEMOIZE_TRIGGER_SYNC" }, "*");

    const t1 = setTimeout(() => setSyncMsg("Scraping contests..."), 5000);
    const t2 = setTimeout(() => setSyncMsg("Fetching problem statuses..."), 45000);
    const t3 = setTimeout(() => setSyncMsg("Almost done..."), 110000);

    const timeoutId = setTimeout(() => {
      window.removeEventListener("message", handler);
      setSyncState("error");
      setSyncMsg("Timed out — use the extension popup");
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
    }, 180000);

    function handler(e: MessageEvent) {
      if (e.data?.type !== "MEMOIZE_SYNC_COMPLETE") return;
      window.removeEventListener("message", handler);
      clearTimeout(timeoutId); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);

      if (e.data.success) {
        setSyncState("success");
        setSyncMsg(`${e.data.groups_synced}g · ${e.data.problems_synced}p synced`);
        setLocalSynced(new Date().toISOString());
        setTimeout(() => window.location.reload(), 1400);
      } else {
        setSyncState("error");
        setSyncMsg(e.data.message || "Sync failed");
      }
    }

    window.addEventListener("message", handler);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>

      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20, gap: 12, flexWrap: "wrap",
      }}>
        {/* Left: last synced + progress message */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <AnimatePresence mode="wait">
            {localSynced ? (
              <motion.div
                key="synced"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.5)",
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  Last synced:{" "}
                  <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                    {formatTimeAgo(localSynced)}
                  </span>
                </span>
              </motion.div>
            ) : (
              <motion.span
                key="never"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ fontSize: 12, color: "var(--text-muted)" }}
              >
                Never synced
              </motion.span>
            )}
          </AnimatePresence>

          {/* Sync progress banner */}
          <AnimatePresence>
            {syncState === "syncing" && syncMsg && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "4px 12px",
                  background: "rgba(0,212,170,0.06)",
                  border: "1px solid rgba(0,212,170,0.14)",
                  borderRadius: 8,
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                </motion.div>
                <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                  {syncMsg}
                </span>
              </motion.div>
            )}
            {(syncState === "success" || syncState === "error") && syncMsg && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  fontSize: 12, fontWeight: 500,
                  color: syncState === "success" ? "#22c55e" : "#f87171",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {syncMsg}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <SyncButton state={syncState} onClick={handleSync} />
      </div>

      {/* Content */}
      {groups.length === 0 ? (
        <EmptyState hasAuth={!!cfAuth} />
      ) : (
        <>
          <SummaryStrip groups={groups} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {groups.map((group, i) => (
              <GroupCard key={group.id} group={group} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}