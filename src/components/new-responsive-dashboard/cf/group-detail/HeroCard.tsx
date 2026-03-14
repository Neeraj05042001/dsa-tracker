// "use client";

// import { useRef, useEffect, useState, useCallback } from "react";
// import {
//   motion,
//   AnimatePresence,
//   useReducedMotion,
//   useInView,
// } from "framer-motion";
// import Link from "next/link";
// import type { CfGroup } from "@/types";

// // ─────────────────────────────────────────────────────────────────────────────
// // TYPES
// // ─────────────────────────────────────────────────────────────────────────────

// export interface NextProblem {
//   index: string;
//   name: string;
//   url: string;
//   contestName: string;
// }

// interface HeroCardProps {
//   group: CfGroup;
//   completedContests: number;
//   totalContests: number;
//   nextProblem: NextProblem | null;
// }

// type SyncState = "idle" | "loading" | "success" | "error";

// interface ToastData {
//   id: number;
//   type: "success" | "error";
//   title: string;
//   message: string;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────────────────────────────────────────

// function formatTimeAgo(iso: string | null): string {
//   if (!iso) return "Never synced";
//   const diff = Date.now() - new Date(iso).getTime();
//   const s = Math.floor(diff / 1000);
//   const m = Math.floor(diff / 60000);
//   const h = Math.floor(diff / 3600000);
//   const d = Math.floor(diff / 86400000);
//   if (s < 30) return "Just now";
//   if (m < 1) return `${s}s ago`;
//   if (h < 1) return `${m}m ago`;
//   if (d < 1) return `${h}h ago`;
//   return `${d}d ago`;
// }

// function progressColor(pct: number): string {
//   if (pct >= 90) return "#22c55e";
//   if (pct >= 70) return "#00d4aa";
//   if (pct >= 40) return "#f59e0b";
//   if (pct > 0) return "#f87171";
//   return "rgba(255,255,255,0.2)";
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // useCountUp — exact match of your existing StatCard hook
// // ─────────────────────────────────────────────────────────────────────────────

// function useCountUp(target: number, duration = 700, delay = 0) {
//   const [value, setValue] = useState(0);
//   const raf = useRef<number>(0);
//   useEffect(() => {
//     const timeout = setTimeout(() => {
//       const start = performance.now();
//       const animate = (now: number) => {
//         const elapsed = now - start;
//         const progress = Math.min(elapsed / duration, 1);
//         const eased = 1 - Math.pow(1 - progress, 3);
//         setValue(Math.round(eased * target));
//         if (progress < 1) raf.current = requestAnimationFrame(animate);
//       };
//       raf.current = requestAnimationFrame(animate);
//     }, delay);
//     return () => {
//       clearTimeout(timeout);
//       cancelAnimationFrame(raf.current);
//     };
//   }, [target, duration, delay]);
//   return value;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // TOAST — custom, no library
// // Slides in from bottom-right, depleting progress bar, auto-dismiss 3.5s
// // ─────────────────────────────────────────────────────────────────────────────

// function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
//   const isSuccess = toast.type === "success";
//   const color  = isSuccess ? "#22c55e" : "#f87171";
//   const bg     = isSuccess ? "rgba(34,197,94,0.07)"   : "rgba(248,113,113,0.07)";
//   const border = isSuccess ? "rgba(34,197,94,0.22)"   : "rgba(248,113,113,0.22)";

//   useEffect(() => {
//     const t = setTimeout(() => onDismiss(toast.id), 3500);
//     return () => clearTimeout(t);
//   }, [toast.id, onDismiss]);

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0, x: 64, scale: 0.9 }}
//       animate={{ opacity: 1, x: 0, scale: 1 }}
//       exit={{ opacity: 0, x: 64, scale: 0.9 }}
//       transition={{ type: "spring", stiffness: 300, damping: 26 }}
//       onClick={() => onDismiss(toast.id)}
//       style={{
//         display: "flex", alignItems: "flex-start", gap: 10,
//         padding: "12px 14px",
//         background: "var(--bg-elevated)",
//         border: `1px solid ${border}`,
//         borderRadius: 12,
//         boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${border}`,
//         minWidth: 260, maxWidth: 320,
//         cursor: "pointer",
//         position: "relative", overflow: "hidden",
//       }}
//     >
//       {/* Left accent bar */}
//       <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: color, borderRadius: "12px 0 0 12px" }} />

//       {/* Depleting progress bar */}
//       <motion.div
//         initial={{ scaleX: 1 }} animate={{ scaleX: 0 }}
//         transition={{ duration: 3.5, ease: "linear" }}
//         style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: color, opacity: 0.3, transformOrigin: "left" }}
//       />

//       {/* Icon */}
//       <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0, marginLeft: 4 }}>
//         {isSuccess ? (
//           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
//             <polyline points="20 6 9 17 4 12" />
//           </svg>
//         ) : (
//           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
//             <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
//           </svg>
//         )}
//       </div>

//       {/* Text */}
//       <div style={{ flex: 1, minWidth: 0 }}>
//         <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>{toast.title}</div>
//         <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.45 }}>{toast.message}</div>
//       </div>

//       {/* Dismiss */}
//       <button onClick={(e) => { e.stopPropagation(); onDismiss(toast.id); }}
//         style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2, display: "flex", flexShrink: 0 }}>
//         <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
//           <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
//         </svg>
//       </button>
//     </motion.div>
//   );
// }

// function ToastContainer({ toasts, onDismiss }: { toasts: ToastData[]; onDismiss: (id: number) => void }) {
//   return (
//     <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
//       <AnimatePresence mode="popLayout">
//         {toasts.map((t) => (
//           <div key={t.id} style={{ pointerEvents: "all" }}>
//             <Toast toast={t} onDismiss={onDismiss} />
//           </div>
//         ))}
//       </AnimatePresence>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // ODOMETER — for ring center only (digit roller, purely visual)
// // ─────────────────────────────────────────────────────────────────────────────

// const ALL_DIGITS = ["0","1","2","3","4","5","6","7","8","9"];
// const DIGIT_H = 36;

// function OdometerDigit({ digit, delay, fontSize, color, shouldReduce }: {
//   digit: string; delay: number; fontSize: number; color: string; shouldReduce: boolean;
// }) {
//   const idx = ALL_DIGITS.indexOf(digit);
//   if (idx === -1) return (
//     <span style={{ fontSize, fontWeight: 800, color, letterSpacing: "-0.04em", fontFamily: "var(--font-sans)", lineHeight: `${DIGIT_H}px`, display: "inline-block" }}>
//       {digit}
//     </span>
//   );
//   return (
//     <div style={{ height: DIGIT_H, overflow: "hidden", display: "inline-block", verticalAlign: "top" }}>
//       <motion.div
//         initial={shouldReduce ? false : { y: DIGIT_H * ALL_DIGITS.length }}
//         animate={{ y: -(idx * DIGIT_H) }}
//         transition={shouldReduce ? { duration: 0 } : { type: "spring", stiffness: 75, damping: 13, delay }}
//       >
//         {ALL_DIGITS.map((d) => (
//           <div key={d} style={{ height: DIGIT_H, display: "flex", alignItems: "center", justifyContent: "center", fontSize, fontWeight: 800, color, letterSpacing: "-0.04em", fontFamily: "var(--font-sans)", lineHeight: 1, minWidth: Math.round(fontSize * 0.62) }}>
//             {d}
//           </div>
//         ))}
//       </motion.div>
//     </div>
//   );
// }

// function OdometerNumber({ value, fontSize = 28, color = "var(--text-primary)", baseDelay = 0 }: {
//   value: number; fontSize?: number; color?: string; baseDelay?: number;
// }) {
//   const shouldReduce = useReducedMotion() ?? false;
//   const ref = useRef<HTMLDivElement>(null);
//   const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
//   const [triggered, setTriggered] = useState(false);
//   useEffect(() => { if (inView && !triggered) setTriggered(true); }, [inView, triggered]);
//   const chars = String(value).split("");
//   return (
//     <div ref={ref} style={{ display: "inline-flex", alignItems: "flex-end", height: DIGIT_H, overflow: "hidden" }}>
//       {chars.map((ch, i) =>
//         triggered
//           ? <OdometerDigit key={i} digit={ch} delay={baseDelay + i * 0.05} fontSize={fontSize} color={color} shouldReduce={shouldReduce} />
//           : <OdometerDigit key={i} digit="0" delay={0} fontSize={fontSize} color={color} shouldReduce={true} />
//       )}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // ARC RING
// // ─────────────────────────────────────────────────────────────────────────────

// function ArcRing({ pct }: { pct: number }) {
//   const shouldReduce = useReducedMotion() ?? false;
//   const SIZE = 148, STROKE = 6;
//   const R = (SIZE - STROKE * 2) / 2 - 4;
//   const CIRC = 2 * Math.PI * R;
//   const color = progressColor(pct);
//   const targetOffset = CIRC - (pct / 100) * CIRC;
//   const TICKS = 48;

//   return (
//     <div style={{ position: "relative", width: SIZE, height: SIZE, flexShrink: 0 }}>
//       <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)", display: "block" }}>
//         {Array.from({ length: TICKS }, (_, i) => {
//           const angle = (i / TICKS) * 2 * Math.PI;
//           const outerR = R + STROKE / 2 + 4;
//           const innerR = outerR + (i % 4 === 0 ? 6 : 3.5);
//           const cx = SIZE / 2, cy = SIZE / 2;
//           return <line key={i} x1={cx + Math.cos(angle) * outerR} y1={cy + Math.sin(angle) * outerR} x2={cx + Math.cos(angle) * innerR} y2={cy + Math.sin(angle) * innerR} stroke={`rgba(255,255,255,${i % 4 === 0 ? 0.12 : 0.04})`} strokeWidth={i % 4 === 0 ? 1.5 : 1} />;
//         })}
//         <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="rgba(255,255,255,0.055)" strokeWidth={STROKE} />
//         <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={color} strokeWidth={STROKE + 10} strokeOpacity={0.08} strokeDasharray={CIRC} strokeDashoffset={targetOffset} strokeLinecap="round" />
//         <motion.circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeDasharray={CIRC}
//           initial={{ strokeDashoffset: CIRC }} animate={{ strokeDashoffset: targetOffset }}
//           transition={shouldReduce ? { duration: 0 } : { duration: 2.0, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
//           style={{ filter: `drop-shadow(0 0 3px ${color}88)` }} />
//         {pct > 3 && (
//           <motion.circle cx={SIZE / 2 + R} cy={SIZE / 2} r={4} fill={color}
//             initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
//             transition={shouldReduce ? { duration: 0 } : { delay: 0.65, duration: 0.4, type: "spring" }}
//             transform={`rotate(${(pct / 100) * 360} ${SIZE / 2} ${SIZE / 2})`}
//             style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
//         )}
//       </svg>
//       <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
//         <div style={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
//           <OdometerNumber value={pct} fontSize={26} color={color} baseDelay={0.3} />
//           <span style={{ fontSize: 13, fontWeight: 700, color, opacity: 0.8, marginBottom: 3, lineHeight: 1 }}>%</span>
//         </div>
//         <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2 }}>complete</span>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // STAT CARD
// // Matches your existing StatCard exactly:
// //   - useCountUp (cubic-ease, same duration/delay)
// //   - whileHover y:-4, scale:1.025, spring stiffness:400 damping:22
// //   - Ambient glow top-right, animates opacity+scale on hover
// //   - Icon wobble: rotate [0,-10,10,-5,0] on hover
// //   - color-mix box-shadow on hover
// //   - Fraction display (for contests) uses font-mono
// // ─────────────────────────────────────────────────────────────────────────────

// function StatCard({ value, label, color, icon, delay, fraction, sub }: {
//   value: number; label: string; color: string; icon: React.ReactNode;
//   delay: number; fraction?: string; sub?: string;
// }) {
//   const displayed = useCountUp(value, 700, delay);
//   const [hovered, setHovered] = useState(false);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.45, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
//       whileHover={{ y: -4, scale: 1.025, transition: { type: "spring", stiffness: 400, damping: 22 } }}
//       onHoverStart={() => setHovered(true)}
//       onHoverEnd={() => setHovered(false)}
//       style={{
//         padding: "18px 18px 14px",
//         background: "var(--bg-elevated)",
//         border: "1px solid rgba(255,255,255,0.065)",
//         borderRadius: 12,
//         display: "flex",
//         flexDirection: "column",
//         gap: 8,
//         position: "relative",
//         overflow: "hidden",
//         cursor: "default",
//         boxShadow: hovered
//           ? `0 12px 36px -4px color-mix(in srgb, ${color} 22%, transparent), 0 0 0 1px color-mix(in srgb, ${color} 18%, transparent)`
//           : "none",
//         transition: "box-shadow 0.3s ease",
//       }}
//     >
//       {/* Ambient glow — top right, matches your StatCard exactly */}
//       <motion.div
//         animate={{ opacity: hovered ? 0.14 : 0.06, scale: hovered ? 1.4 : 1 }}
//         transition={{ duration: 0.35, ease: "easeOut" }}
//         style={{
//           position: "absolute", top: -24, right: -24,
//           width: 90, height: 90, borderRadius: "50%",
//           background: color, filter: "blur(22px)", pointerEvents: "none",
//         }}
//       />

//       {/* Header row: label + icon */}
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//         <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
//           {label}
//         </span>

//         {/* Icon with wobble on hover — matches your StatCard */}
//         <motion.div
//           animate={hovered ? { rotate: [0, -10, 10, -5, 0] } : { rotate: 0 }}
//           transition={{ duration: 0.45 }}
//           style={{
//             width: 30, height: 30, borderRadius: 8,
//             background: `color-mix(in srgb, ${color} 12%, transparent)`,
//             border: `1px solid color-mix(in srgb, ${color} 22%, transparent)`,
//             display: "flex", alignItems: "center", justifyContent: "center",
//             color, flexShrink: 0,
//           }}
//         >
//           {icon}
//         </motion.div>
//       </div>

//       {/* Value — countUp for numbers, monospace fraction for contests */}
//       <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
//         {fraction ? (
//           <span style={{
//             fontSize: 26, fontWeight: 700,
//             fontFamily: "var(--font-mono)",
//             color, lineHeight: 1, letterSpacing: "-0.02em",
//           }}>
//             {fraction}
//           </span>
//         ) : (
//           <span style={{
//             fontSize: 32, fontWeight: 700,
//             fontFamily: "var(--font-mono)",
//             color, lineHeight: 1, letterSpacing: "-0.02em",
//           }}>
//             {displayed}
//           </span>
//         )}
//       </div>

//       {/* Sub label */}
//       {sub && (
//         <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: -4 }}>
//           {sub}
//         </span>
//       )}
//     </motion.div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // SYNC BUTTON
// // Exact logic from GroupsClient:
// //   - window.postMessage({ type: "MEMOIZE_TRIGGER_SYNC" }, "*")
// //   - Listen for MEMOIZE_SYNC_COMPLETE
// //   - 60s timeout
// //   - On success: show toast, window.location.reload() after 1200ms
// //   - On error: show error toast
// // ─────────────────────────────────────────────────────────────────────────────

// function SyncButton({
//   lastSynced,
//   onToast,
// }: {
//   lastSynced: string | null;
//   onToast: (t: Omit<ToastData, "id">) => void;
// }) {
//   const shouldReduce = useReducedMotion() ?? false;
//   const [syncing, setSyncing] = useState(false);
//   const [state, setState] = useState<SyncState>("idle");
//   const [localSynced, setLocalSynced] = useState(lastSynced);

//   async function handleSync() {
//     if (syncing) return;
//     setSyncing(true);
//     setState("loading");

//     try {
//       const result = await new Promise<any>((resolve, reject) => {
//         // 60s timeout — matches GroupsClient exactly
//         const timeout = setTimeout(() => {
//           reject(new Error("Extension timeout — make sure Memoize is active and you're logged into Codeforces"));
//         }, 60000);

//         window.addEventListener("message", function handler(e) {
//           if (e.data?.type !== "MEMOIZE_SYNC_COMPLETE") return;
//           clearTimeout(timeout);
//           window.removeEventListener("message", handler);
//           resolve(e.data);
//         });

//         // Trigger the extension scraper
//         window.postMessage({ type: "MEMOIZE_TRIGGER_SYNC" }, "*");
//       });

//       if (result.success) {
//         const now = new Date().toISOString();
//         setLocalSynced(now);
//         setState("success");
//         onToast({
//           type: "success",
//           title: "Sync complete",
//           message: `${result.groups_synced} group${result.groups_synced !== 1 ? "s" : ""} · ${result.problems_synced} problems updated`,
//         });
//         setTimeout(() => window.location.reload(), 1200);
//       } else {
//         setState("error");
//         onToast({
//           type: "error",
//           title: "Sync failed",
//           message: result.message || "Could not sync groups. Try again.",
//         });
//       }
//     } catch (err: any) {
//       setState("error");
//       onToast({
//         type: "error",
//         title: "Connection error",
//         message: err.message || "Make sure Memoize extension is active and you're logged into Codeforces.",
//       });
//     } finally {
//       setSyncing(false);
//       setTimeout(() => setState("idle"), 3000);
//     }
//   }

//   const isClickable = !syncing;

//   const cfg = {
//     idle:    { label: formatTimeAgo(localSynced), iconColor: "var(--text-muted)",   border: "rgba(255,255,255,0.08)",  bg: "rgba(255,255,255,0.04)",   textColor: "var(--text-muted)" },
//     loading: { label: "Syncing…",                 iconColor: "#00d4aa",              border: "rgba(0,212,170,0.28)",    bg: "rgba(0,212,170,0.06)",     textColor: "#00d4aa" },
//     success: { label: "Synced!",                  iconColor: "#22c55e",              border: "rgba(34,197,94,0.28)",    bg: "rgba(34,197,94,0.06)",     textColor: "#22c55e" },
//     error:   { label: "Failed — retry",           iconColor: "#f87171",              border: "rgba(248,113,113,0.28)",  bg: "rgba(248,113,113,0.06)",   textColor: "#f87171" },
//   }[state];

//   return (
//     <motion.button
//       onClick={handleSync}
//       disabled={!isClickable}
//       whileHover={isClickable && !shouldReduce ? { scale: 1.03 } : {}}
//       whileTap={isClickable && !shouldReduce ? { scale: 0.96 } : {}}
//       style={{
//         display: "inline-flex", alignItems: "center", gap: 6,
//         padding: "5px 12px 5px 10px",
//         background: cfg.bg, border: `1px solid ${cfg.border}`,
//         borderRadius: 20, cursor: isClickable ? "pointer" : "wait",
//         outline: "none", transition: "background 0.2s, border-color 0.2s",
//         fontFamily: "var(--font-sans)",
//       }}
//     >
//       <AnimatePresence mode="wait">
//         {state === "loading" ? (
//           <motion.span key="spin" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} style={{ display: "flex", color: cfg.iconColor }}>
//             <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
//               <path d="M21 12a9 9 0 11-6.219-8.56" />
//             </svg>
//           </motion.span>
//         ) : state === "success" ? (
//           <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 300, damping: 16 }} style={{ display: "flex", color: cfg.iconColor }}>
//             <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
//           </motion.span>
//         ) : state === "error" ? (
//           <motion.span key="err" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ display: "flex", color: cfg.iconColor }}>
//             <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
//               <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
//             </svg>
//           </motion.span>
//         ) : (
//           <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", color: cfg.iconColor }}>
//             <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
//               <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
//               <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
//             </svg>
//           </motion.span>
//         )}
//       </AnimatePresence>
//       <AnimatePresence mode="wait">
//         <motion.span key={state} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
//           transition={{ duration: 0.14 }} style={{ fontSize: 11, fontWeight: 500, color: cfg.textColor, whiteSpace: "nowrap" }}>
//           {cfg.label}
//         </motion.span>
//       </AnimatePresence>
//     </motion.button>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // CONTINUE BUTTON
// // ─────────────────────────────────────────────────────────────────────────────

// function ContinueButton({ problem }: { problem: NextProblem }) {
//   const shouldReduce = useReducedMotion() ?? false;
//   const [hovered, setHovered] = useState(false);

//   return (
//     <motion.a
//       href={problem.url} target="_blank" rel="noopener noreferrer"
//       initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.55, duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
//       whileHover={shouldReduce ? {} : { scale: 1.015 }}
//       whileTap={shouldReduce ? {} : { scale: 0.975 }}
//       onHoverStart={() => setHovered(true)}
//       onHoverEnd={() => setHovered(false)}
//       style={{
//         display: "inline-flex", alignItems: "center", gap: 8,
//         padding: "9px 16px",
//         background: hovered ? "rgba(0,212,170,0.14)" : "rgba(0,212,170,0.09)",
//         border: `1px solid ${hovered ? "rgba(0,212,170,0.35)" : "rgba(0,212,170,0.22)"}`,
//         borderRadius: 10, color: "#00d4aa", fontSize: 12.5, fontWeight: 700,
//         textDecoration: "none", position: "relative", overflow: "hidden",
//         flexShrink: 0, alignSelf: "flex-start",
//         boxShadow: hovered ? "0 0 20px rgba(0,212,170,0.14)" : "none",
//         transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s",
//       }}
//     >
//       {!shouldReduce && (
//         <motion.div animate={{ x: ["-110%", "210%"] }} transition={{ duration: 1.5, delay: 1.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 5 }}
//           style={{ position: "absolute", inset: 0, width: "42%", background: "linear-gradient(90deg, transparent, rgba(0,212,170,0.2), transparent)", pointerEvents: "none" }} />
//       )}
//       <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, zIndex: 1 }}>
//         <polygon points="5 3 19 12 5 21 5 3" />
//       </svg>
//       <span style={{ zIndex: 1, whiteSpace: "nowrap" }}>
//         <span style={{ opacity: 0.5, fontWeight: 500 }}>Continue — </span>
//         <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{problem.index}</span>
//         <span style={{ opacity: 0.5 }}> · </span>
//         {problem.name.length > 26 ? problem.name.slice(0, 26) + "…" : problem.name}
//       </span>
//       <motion.svg animate={hovered && !shouldReduce ? { x: 3 } : { x: 0 }} transition={{ duration: 0.18 }}
//         width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
//         style={{ flexShrink: 0, zIndex: 1, opacity: 0.65 }}>
//         <path d="M5 12h14M12 5l7 7-7 7" />
//       </motion.svg>
//     </motion.a>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HERO CARD — main export
// // ─────────────────────────────────────────────────────────────────────────────

// export function HeroCard({ group, completedContests, totalContests, nextProblem }: HeroCardProps) {
//   const shouldReduce = useReducedMotion() ?? false;
//   const pct = group.progress_pct ?? 0;
//   const color = progressColor(pct);
//   const total = (group.solved_count ?? 0) + (group.todo_count ?? 0) + (group.attempted_count ?? 0);

//   const [toasts, setToasts] = useState<ToastData[]>([]);
//   const toastIdRef = useRef(0);

//   const addToast = useCallback((t: Omit<ToastData, "id">) => {
//     const id = ++toastIdRef.current;
//     setToasts((prev) => [...prev, { ...t, id }]);
//   }, []);

//   const dismissToast = useCallback((id: number) => {
//     setToasts((prev) => prev.filter((t) => t.id !== id));
//   }, []);

//   return (
//     <>
//       <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

//         {/* Back nav */}
//         <motion.div initial={shouldReduce ? false : { opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
//           <Link href="/dashboard2/groups"
//             style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: "var(--text-muted)", textDecoration: "none", transition: "color 0.14s" }}
//             onMouseOver={(e: any) => (e.currentTarget.style.color = "#00d4aa")}
//             onMouseOut={(e: any) => (e.currentTarget.style.color = "var(--text-muted)")}
//           >
//             <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
//               <path d="M19 12H5M12 5l-7 7 7 7" />
//             </svg>
//             CF Groups
//           </Link>
//         </motion.div>

//         {/* Page title */}
//         <motion.div initial={shouldReduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }} style={{ paddingLeft: 2 }}>
//           <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", margin: 0, lineHeight: 1.2, fontFamily: "var(--font-sans)" }}>
//             {group.group_name}
//           </h1>
//           <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
//             {group.solved_count ?? 0}/{total} solved · {pct}% complete
//           </div>
//         </motion.div>

//         {/* Hero card */}
//         <motion.div
//           initial={shouldReduce ? false : { opacity: 0, y: 18 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.08, ease: [0.25, 0.4, 0.25, 1] }}
//           style={{ background: "var(--bg-surface)", border: "1px solid rgba(255,255,255,0.065)", borderRadius: 16, padding: "24px 26px 22px", position: "relative", overflow: "hidden" }}
//         >
//           {/* Atmospheric glow */}
//           <div style={{ position: "absolute", top: -50, left: -30, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, ${color}${Math.max(8, Math.round((pct / 100) * 20)).toString(16).padStart(2, "0")} 0%, transparent 65%)`, pointerEvents: "none" }} />
//           <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.006) 2px, rgba(255,255,255,0.006) 3px)", pointerEvents: "none" }} />

//           <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap", position: "relative" }}>

//             {/* Ring */}
//             <motion.div initial={shouldReduce ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}>
//               <ArcRing pct={pct} />
//             </motion.div>

//             {/* Right panel */}
//             <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: 12 }}>

//               {/* Sync button */}
//               <div style={{ display: "flex", justifyContent: "flex-end" }}>
//                 <SyncButton lastSynced={group.last_synced ?? null} onToast={addToast} />
//               </div>

//               {/* 2×2 stat grid */}
//               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
//                 <StatCard value={group.solved_count ?? 0} label="Solved" color="#22c55e" delay={150} sub={`of ${total} total`}
//                   icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
//                 />
//                 <StatCard value={group.todo_count ?? 0} label="To Do" color="var(--text-secondary)" delay={200}
//                   icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
//                 />
//                 <StatCard value={group.attempted_count ?? 0} label="Attempted" color="#f59e0b" delay={250}
//                   icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>}
//                 />
//                 <StatCard value={completedContests} label="Contests" color="#00d4aa" delay={300}
//                   fraction={`${completedContests}/${totalContests}`}
//                   icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0012 0V2z" /></svg>}
//                 />
//               </div>

//               {/* Continue CTA */}
//               {nextProblem && <div><ContinueButton problem={nextProblem} /></div>}
//             </div>
//           </div>

//           {/* Bottom progress strip */}
//           <motion.div initial={shouldReduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
//             style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
//             <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
//               transition={shouldReduce ? { duration: 0 } : { duration: 2.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
//               style={{ height: "100%", background: `linear-gradient(90deg, ${color}55, ${color})`, boxShadow: `0 0 8px ${color}80` }} />
//           </motion.div>
//         </motion.div>
//       </div>

//       <ToastContainer toasts={toasts} onDismiss={dismissToast} />
//     </>
//   );
// }


"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useInView,
} from "framer-motion";
import Link from "next/link";
import type { CfGroup } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface NextProblem {
  index: string;
  name: string;
  url: string;
  contestName: string;
}

interface HeroCardProps {
  group: CfGroup;
  completedContests: number;
  totalContests: number;
  nextProblem: NextProblem | null;
}

type SyncState = "idle" | "loading" | "success" | "error";

interface ToastData {
  id: number;
  type: "success" | "error";
  title: string;
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatTimeAgo(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (s < 30) return "Just now";
  if (m < 1) return `${s}s ago`;
  if (h < 1) return `${m}m ago`;
  if (d < 1) return `${h}h ago`;
  return `${d}d ago`;
}

function progressColor(pct: number): string {
  if (pct >= 90) return "#22c55e";
  if (pct >= 70) return "#00d4aa";
  if (pct >= 40) return "#f59e0b";
  if (pct > 0) return "#f87171";
  return "rgba(255,255,255,0.2)";
}

// ─────────────────────────────────────────────────────────────────────────────
// useCountUp
// ─────────────────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 700, delay = 0) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) raf.current = requestAnimationFrame(animate);
      };
      raf.current = requestAnimationFrame(animate);
    }, delay);
    return () => { clearTimeout(timeout); cancelAnimationFrame(raf.current); };
  }, [target, duration, delay]);
  return value;
}

// ─────────────────────────────────────────────────────────────────────────────
// TOAST — unchanged
// ─────────────────────────────────────────────────────────────────────────────

function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
  const isSuccess = toast.type === "success";
  const color  = isSuccess ? "#22c55e" : "#f87171";
  const bg     = isSuccess ? "rgba(34,197,94,0.07)"  : "rgba(248,113,113,0.07)";
  const border = isSuccess ? "rgba(34,197,94,0.22)"  : "rgba(248,113,113,0.22)";

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 64, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 64, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      onClick={() => onDismiss(toast.id)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        padding: "12px 14px",
        background: "var(--bg-elevated)",
        border: `1px solid ${border}`,
        borderRadius: 12,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${border}`,
        minWidth: 260, maxWidth: 320,
        cursor: "pointer",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: color, borderRadius: "12px 0 0 12px" }} />
      <motion.div
        initial={{ scaleX: 1 }} animate={{ scaleX: 0 }}
        transition={{ duration: 3.5, ease: "linear" }}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: color, opacity: 0.3, transformOrigin: "left" }}
      />
      <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0, marginLeft: 4 }}>
        {isSuccess
          ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>{toast.title}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.45 }}>{toast.message}</div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDismiss(toast.id); }}
        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 2, display: "flex", flexShrink: 0 }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </motion.div>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: ToastData[]; onDismiss: (id: number) => void }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: "all" }}>
            <Toast toast={t} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ODOMETER — unchanged, DIGIT_H reduced to 32
// ─────────────────────────────────────────────────────────────────────────────

const ALL_DIGITS = ["0","1","2","3","4","5","6","7","8","9"];
const DIGIT_H = 32;

function OdometerDigit({ digit, delay, fontSize, color, shouldReduce }: {
  digit: string; delay: number; fontSize: number; color: string; shouldReduce: boolean;
}) {
  const idx = ALL_DIGITS.indexOf(digit);
  if (idx === -1) return (
    <span style={{ fontSize, fontWeight: 800, color, letterSpacing: "-0.04em", fontFamily: "var(--font-sans)", lineHeight: `${DIGIT_H}px`, display: "inline-block" }}>
      {digit}
    </span>
  );
  return (
    <div style={{ height: DIGIT_H, overflow: "hidden", display: "inline-block", verticalAlign: "top" }}>
      <motion.div
        initial={shouldReduce ? false : { y: DIGIT_H * ALL_DIGITS.length }}
        animate={{ y: -(idx * DIGIT_H) }}
        transition={shouldReduce ? { duration: 0 } : { type: "spring", stiffness: 75, damping: 13, delay }}
      >
        {ALL_DIGITS.map((d) => (
          <div key={d} style={{ height: DIGIT_H, display: "flex", alignItems: "center", justifyContent: "center", fontSize, fontWeight: 800, color, letterSpacing: "-0.04em", fontFamily: "var(--font-sans)", lineHeight: 1, minWidth: Math.round(fontSize * 0.62) }}>
            {d}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function OdometerNumber({ value, fontSize = 22, color = "var(--text-primary)", baseDelay = 0 }: {
  value: number; fontSize?: number; color?: string; baseDelay?: number;
}) {
  const shouldReduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const [triggered, setTriggered] = useState(false);
  useEffect(() => { if (inView && !triggered) setTriggered(true); }, [inView, triggered]);
  const chars = String(value).split("");
  return (
    <div ref={ref} style={{ display: "inline-flex", alignItems: "flex-end", height: DIGIT_H, overflow: "hidden" }}>
      {chars.map((ch, i) =>
        triggered
          ? <OdometerDigit key={i} digit={ch} delay={baseDelay + i * 0.05} fontSize={fontSize} color={color} shouldReduce={shouldReduce} />
          : <OdometerDigit key={i} digit="0" delay={0} fontSize={fontSize} color={color} shouldReduce={true} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ARC RING — scaled to 108px for compact layout
// ─────────────────────────────────────────────────────────────────────────────

function ArcRing({ pct }: { pct: number }) {
  const shouldReduce = useReducedMotion() ?? false;
  const SIZE = 108, STROKE = 5;
  const R = (SIZE - STROKE * 2) / 2 - 4;
  const CIRC = 2 * Math.PI * R;
  const color = progressColor(pct);
  const targetOffset = CIRC - (pct / 100) * CIRC;
  const TICKS = 40;

  return (
    <div style={{ position: "relative", width: SIZE, height: SIZE, flexShrink: 0 }}>
      <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)", display: "block" }}>
        {Array.from({ length: TICKS }, (_, i) => {
          const angle = (i / TICKS) * 2 * Math.PI;
          const outerR = R + STROKE / 2 + 3;
          const innerR = outerR + (i % 4 === 0 ? 5 : 3);
          const cx = SIZE / 2, cy = SIZE / 2;
          return <line key={i}
            x1={cx + Math.cos(angle) * outerR} y1={cy + Math.sin(angle) * outerR}
            x2={cx + Math.cos(angle) * innerR} y2={cy + Math.sin(angle) * innerR}
            stroke={`rgba(255,255,255,${i % 4 === 0 ? 0.11 : 0.035})`}
            strokeWidth={i % 4 === 0 ? 1.5 : 1}
          />;
        })}
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={STROKE} />
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={color} strokeWidth={STROKE + 8} strokeOpacity={0.07} strokeDasharray={CIRC} strokeDashoffset={targetOffset} strokeLinecap="round" />
        <motion.circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }} animate={{ strokeDashoffset: targetOffset }}
          transition={shouldReduce ? { duration: 0 } : { duration: 2.0, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          style={{ filter: `drop-shadow(0 0 3px ${color}88)` }}
        />
        {pct > 3 && (
          <motion.circle cx={SIZE / 2 + R} cy={SIZE / 2} r={3.5} fill={color}
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={shouldReduce ? { duration: 0 } : { delay: 0.65, duration: 0.4, type: "spring" }}
            transform={`rotate(${(pct / 100) * 360} ${SIZE / 2} ${SIZE / 2})`}
            style={{ filter: `drop-shadow(0 0 5px ${color})` }}
          />
        )}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
          <OdometerNumber value={pct} fontSize={22} color={color} baseDelay={0.3} />
          <span style={{ fontSize: 11, fontWeight: 700, color, opacity: 0.8, marginBottom: 2, lineHeight: 1 }}>%</span>
        </div>
        <span style={{ fontSize: 8, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 1 }}>complete</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT PILL — compact card inside hero shell
// Blends both StatCard DNA:
//   • Animated glow + icon wobble + color-mix shadow on hover (analytics)
//   • Uppercase label, font-mono value/sub, bottom accent line (dashboard)
// ─────────────────────────────────────────────────────────────────────────────

function StatPill({ value, label, color, icon, delay, fraction, sub }: {
  value: number; label: string; color: string; icon: React.ReactNode;
  delay: number; fraction?: string; sub?: string;
}) {
  const displayed = useCountUp(value, 700, delay);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 22 } }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        flex: 1,
        minWidth: 100,
        padding: "11px 14px 9px",
        background: "var(--bg-elevated)",
        border: `1px solid ${hovered
          ? `color-mix(in srgb, ${color} 28%, var(--border-subtle))`
          : "var(--border-subtle)"}`,
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        boxShadow: hovered
          ? `0 8px 24px -4px color-mix(in srgb, ${color} 18%, transparent)`
          : "none",
        transition: "background 0.2s, box-shadow 0.25s, border-color 0.2s",
      }}
    >
      {/* Ambient glow */}
      <motion.div
        animate={{ opacity: hovered ? 0.12 : 0.05, scale: hovered ? 1.5 : 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          position: "absolute", top: -16, right: -16,
          width: 64, height: 64, borderRadius: "50%",
          background: color, filter: "blur(16px)",
          pointerEvents: "none",
        }}
      />

      {/* Header: uppercase label + icon */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontSize: 9.5, fontWeight: 600,
          color: "var(--text-muted)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontFamily: "var(--font-sans)",
        }}>
          {label}
        </span>
        <motion.div
          animate={hovered ? { rotate: [0, -10, 10, -5, 0] } : { rotate: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            width: 24, height: 24, borderRadius: 6,
            background: `color-mix(in srgb, ${color} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color} ${hovered ? 30 : 18}%, transparent)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color, flexShrink: 0,
            transition: "border-color 0.2s",
          }}
        >
          {icon}
        </motion.div>
      </div>

      {/* Value */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        {fraction ? (
          <span style={{ fontSize: 21, fontWeight: 700, fontFamily: "var(--font-mono)", color, lineHeight: 1, letterSpacing: "-0.03em" }}>
            {fraction}
          </span>
        ) : (
          <span style={{ fontSize: 26, fontWeight: 700, fontFamily: "var(--font-mono)", color, lineHeight: 1, letterSpacing: "-0.03em" }}>
            {displayed}
          </span>
        )}
      </div>

      {/* Sub */}
      {sub && (
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: -2, letterSpacing: "0.01em" }}>
          {sub}
        </span>
      )}

      {/* Bottom accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: delay / 1000 + 0.18, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${color}, transparent)`,
          transformOrigin: "left",
          opacity: hovered ? 0.65 : 0.35,
          transition: "opacity 0.25s",
        }}
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SYNC BUTTON — GroupsClient logic
// ─────────────────────────────────────────────────────────────────────────────

function SyncButton({
  lastSynced,
  onToast,
}: {
  lastSynced: string | null;
  onToast: (t: Omit<ToastData, "id">) => void;
}) {
  const [syncing, setSyncing]         = useState(false);
  const [syncError, setSyncError]     = useState(false);
  const [syncMsg, setSyncMsg]         = useState<string | null>(null);
  const [localSynced, setLocalSynced] = useState(lastSynced);
  const [state, setState]             = useState<SyncState>("idle");
  const [hovered, setHovered]         = useState(false);

  async function handleSync() {
    if (syncing) return;
    setSyncing(true);
    setSyncMsg(null);
    setSyncError(false);
    setState("loading");

    try {
      const result = await new Promise<any>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Extension timeout — make sure Memoize is active and you're logged into Codeforces"));
        }, 60000);

        window.addEventListener("message", function handler(e) {
          if (e.data?.type !== "MEMOIZE_SYNC_COMPLETE") return;
          clearTimeout(timeout);
          window.removeEventListener("message", handler);
          resolve(e.data);
        });

        window.postMessage({ type: "MEMOIZE_TRIGGER_SYNC" }, "*");
      });

      if (result.success) {
        const now = new Date().toISOString();
        setLocalSynced(now);
        setSyncMsg(`Synced ${result.groups_synced} group${result.groups_synced !== 1 ? "s" : ""} · ${result.problems_synced} problems`);
        setSyncError(false);
        setState("success");
        onToast({
          type: "success",
          title: "Sync complete",
          message: `${result.groups_synced} group${result.groups_synced !== 1 ? "s" : ""} · ${result.problems_synced} problems updated`,
        });
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setSyncMsg(result.message || "Sync failed");
        setSyncError(true);
        setState("error");
        onToast({ type: "error", title: "Sync failed", message: result.message || "Could not sync groups. Try again." });
      }
    } catch (err: any) {
      setSyncMsg(err.message || "Connection error");
      setSyncError(true);
      setState("error");
      onToast({ type: "error", title: "Connection error", message: err.message || "Make sure Memoize extension is active and you're logged into Codeforces." });
    } finally {
      setSyncing(false);
      setTimeout(() => setState("idle"), 3000);
    }
  }

  const cfg = {
    idle:    { bg: "rgba(0,212,170,0.08)",    border: "rgba(0,212,170,0.22)",    hBg: "rgba(0,212,170,0.15)",    hBorder: "rgba(0,212,170,0.4)",    color: "#00d4aa" },
    loading: { bg: "rgba(0,212,170,0.06)",    border: "rgba(0,212,170,0.28)",    hBg: "rgba(0,212,170,0.06)",    hBorder: "rgba(0,212,170,0.28)",   color: "#00d4aa" },
    success: { bg: "rgba(34,197,94,0.08)",    border: "rgba(34,197,94,0.28)",    hBg: "rgba(34,197,94,0.13)",    hBorder: "rgba(34,197,94,0.4)",    color: "#22c55e" },
    error:   { bg: "rgba(248,113,113,0.08)",  border: "rgba(248,113,113,0.28)",  hBg: "rgba(248,113,113,0.13)",  hBorder: "rgba(248,113,113,0.4)",  color: "#f87171" },
  }[state];

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 13px",
        background: hovered && !syncing ? cfg.hBg : cfg.bg,
        border: `1px solid ${hovered && !syncing ? cfg.hBorder : cfg.border}`,
        borderRadius: 8,
        color: cfg.color,
        fontSize: 12, fontWeight: 600,
        fontFamily: "var(--font-sans)",
        cursor: syncing ? "wait" : "pointer",
        opacity: syncing ? 0.8 : 1,
        transition: "background 0.15s, border-color 0.15s",
        outline: "none",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <AnimatePresence mode="wait">
        {state === "loading" ? (
          <motion.span key="spin" animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }} style={{ display: "flex" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          </motion.span>
        ) : state === "success" ? (
          <motion.span key="chk" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 300, damping: 16 }} style={{ display: "flex" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
          </motion.span>
        ) : state === "error" ? (
          <motion.span key="err" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 300, damping: 16 }} style={{ display: "flex" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </motion.span>
        ) : (
          <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
              <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0115-6.7L21 8" />
              <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 01-15 6.7L3 16" />
            </svg>
          </motion.span>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.span key={state} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.12 }}>
          {state === "idle"    ? "Sync Now" : null}
          {state === "loading" ? "Syncing…" : null}
          {state === "success" ? "Synced!"  : null}
          {state === "error"   ? "Retry"    : null}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTINUE BUTTON
// ─────────────────────────────────────────────────────────────────────────────

function ContinueButton({ problem }: { problem: NextProblem }) {
  const shouldReduce = useReducedMotion() ?? false;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      href={problem.url} target="_blank" rel="noopener noreferrer"
      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
      whileHover={shouldReduce ? {} : { scale: 1.015 }}
      whileTap={shouldReduce ? {} : { scale: 0.975 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "6px 14px",
        background: hovered ? "rgba(0,212,170,0.14)" : "rgba(0,212,170,0.08)",
        border: `1px solid ${hovered ? "rgba(0,212,170,0.38)" : "rgba(0,212,170,0.2)"}`,
        borderRadius: 8,
        color: "#00d4aa", fontSize: 12, fontWeight: 700,
        textDecoration: "none",
        position: "relative", overflow: "hidden",
        flexShrink: 0,
        boxShadow: hovered ? "0 0 18px rgba(0,212,170,0.12)" : "none",
        transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s",
      }}
    >
      {!shouldReduce && (
        <motion.div
          animate={{ x: ["-110%", "210%"] }}
          transition={{ duration: 1.6, delay: 1.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 5 }}
          style={{ position: "absolute", inset: 0, width: "42%", background: "linear-gradient(90deg, transparent, rgba(0,212,170,0.18), transparent)", pointerEvents: "none" }}
        />
      )}
      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, zIndex: 1 }}>
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      <span style={{ zIndex: 1, whiteSpace: "nowrap", fontFamily: "var(--font-sans)" }}>
        <span style={{ opacity: 0.5, fontWeight: 500 }}>Continue — </span>
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{problem.index}</span>
        <span style={{ opacity: 0.5 }}> · </span>
        {problem.name.length > 28 ? problem.name.slice(0, 28) + "…" : problem.name}
      </span>
      <motion.svg
        animate={hovered && !shouldReduce ? { x: 3 } : { x: 0 }}
        transition={{ duration: 0.16 }}
        width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
        style={{ flexShrink: 0, zIndex: 1, opacity: 0.6 }}
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </motion.svg>
    </motion.a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO CARD
//
// COMPACT LAYOUT — ~55% less vertical footprint than before:
//
//  [← CF Groups]  Group Name                         [Sync Now]   ← outside card, 1 row
//  ┌─────────────────────────────────────────────────────────────┐
//  │ [Ring]  │  [Solved]  [To Do]  [Attempted]  [Contests]       │ ← main row
//  ├─────────────────────────────────────────────────────────────┤
//  │ [▶ Continue ──────────────────────]        synced 5h ago    │ ← slim footer
//  └═════════════════════════════════════════════════════════════╛ ← progress strip
//
// ─────────────────────────────────────────────────────────────────────────────

export function HeroCard({ group, completedContests, totalContests, nextProblem }: HeroCardProps) {
  const shouldReduce = useReducedMotion() ?? false;
  const pct   = group.progress_pct ?? 0;
  const color = progressColor(pct);
  const total = (group.solved_count ?? 0) + (group.todo_count ?? 0) + (group.attempted_count ?? 0);

  const [toasts, setToasts] = useState<ToastData[]>([]);
  const toastIdRef          = useRef(0);

  const addToast = useCallback((t: Omit<ToastData, "id">) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { ...t, id }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>

        {/* ── Compact page header: back + title + sync all in one row ── */}
        <motion.div
          initial={shouldReduce ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "nowrap" }}
        >
          <Link
            href="/dashboard/groups"
            style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 500, color: "var(--text-muted)", textDecoration: "none", transition: "color 0.14s", flexShrink: 0, whiteSpace: "nowrap" }}
            onMouseOver={(e: any) => (e.currentTarget.style.color = "#00d4aa")}
            onMouseOut={(e: any) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            CF Groups
          </Link>

          <span style={{ color: "var(--border-subtle)", fontSize: 14, lineHeight: 1, flexShrink: 0 }}>›</span>

          <h1 style={{
            fontSize: 15, fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.025em",
            margin: 0, lineHeight: 1,
            fontFamily: "var(--font-sans)",
            flex: 1, minWidth: 0,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {group.group_name}
          </h1>

          {/* subtitle chip */}
          <span style={{
            fontSize: 10.5, color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            flexShrink: 0, whiteSpace: "nowrap",
          }}>
            {group.solved_count ?? 0}/{total} · {pct}%
          </span>

          <SyncButton lastSynced={group.last_synced ?? null} onToast={addToast} />
        </motion.div>

        {/* ── Hero card shell ── */}
        <motion.div
          initial={shouldReduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06, ease: [0.25, 0.4, 0.25, 1] }}
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: 14,
            padding: "16px 18px 0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Atmospheric glow */}
          <div style={{
            position: "absolute", top: -40, left: -24,
            width: 200, height: 200, borderRadius: "50%",
            background: `radial-gradient(circle, ${color}${Math.max(8, Math.round((pct / 100) * 18)).toString(16).padStart(2, "0")} 0%, transparent 65%)`,
            pointerEvents: "none",
          }} />
          {/* Scanlines */}
          <div style={{
            position: "absolute", inset: 0,
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.005) 2px, rgba(255,255,255,0.005) 3px)",
            pointerEvents: "none",
          }} />

          {/* ── Single main row: ring | divider | 4 stat pills ── */}
          <div style={{ display: "flex", gap: 16, alignItems: "center", position: "relative", flexWrap: "wrap" }}>

            {/* Ring */}
            <motion.div
              initial={shouldReduce ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
              style={{ flexShrink: 0 }}
            >
              <ArcRing pct={pct} />
            </motion.div>

            {/* Vertical divider */}
            <div style={{
              width: 1, alignSelf: "stretch", minHeight: 72,
              background: "var(--border-subtle)",
              flexShrink: 0,
            }} />

            {/* 4 stat pills — single row */}
            <div style={{ display: "flex", gap: 10, flex: 1, minWidth: 0, flexWrap: "wrap" }}>
              <StatPill
                value={group.solved_count ?? 0} label="Solved" color="#22c55e" delay={140}
                sub={`of ${total}`}
                icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
              />
              <StatPill
                value={group.todo_count ?? 0} label="To Do" color="var(--text-secondary)" delay={190}
                icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
              />
              <StatPill
                value={group.attempted_count ?? 0} label="Attempted" color="#f59e0b" delay={240}
                icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>}
              />
              <StatPill
                value={completedContests} label="Contests" color="#00d4aa" delay={290}
                fraction={`${completedContests}/${totalContests}`}
                icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6" /><path d="M18 9h1.5a2.5 2.5 0 000-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0012 0V2z" /></svg>}
              />
            </div>
          </div>

          {/* ── Slim footer strip ── */}
          <motion.div
            initial={shouldReduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 12,
              paddingTop: 10,
              paddingBottom: 12,
              borderTop: "1px solid var(--border-subtle)",
              position: "relative",
              gap: 10,
            }}
          >
            {nextProblem
              ? <ContinueButton problem={nextProblem} />
              : <span style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>No pending problems</span>
            }

            {group.last_synced && (
              <span style={{
                fontSize: 10.5, color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                display: "flex", alignItems: "center", gap: 4,
                flexShrink: 0,
              }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ opacity: 0.45 }}>
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                {formatTimeAgo(group.last_synced)}
              </span>
            )}
          </motion.div>

          {/* Bottom progress strip — unchanged */}
          <motion.div
            initial={shouldReduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.03)", overflow: "hidden" }}
          >
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
              transition={shouldReduce ? { duration: 0 } : { duration: 2.2, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: "100%", background: `linear-gradient(90deg, ${color}55, ${color})`, boxShadow: `0 0 8px ${color}80` }}
            />
          </motion.div>
        </motion.div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}