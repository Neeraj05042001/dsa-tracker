"use client";

import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";

// ─── Feature 1 visual: Auto-capture live feed ─────────────────────────────────
function AutoCaptureVisual({ inView }: { inView: boolean }) {
  const reduce = useReducedMotion();

  const events = [
    { platform: "LC", color: "var(--lc-color)", muted: "var(--lc-muted)", title: "3Sum Closest", diff: "Medium", diffColor: "var(--medium)", tag: "Two Pointers", time: "just now", delay: 0.2 },
    { platform: "LC", color: "var(--lc-color)", muted: "var(--lc-muted)", title: "Jump Game II", diff: "Medium", diffColor: "var(--medium)", tag: "Greedy", time: "2m ago", delay: 0.35 },
    { platform: "CF", color: "var(--cf-color)", muted: "var(--cf-muted)", title: "Beautiful Matrix", diff: "Hard", diffColor: "var(--hard)", tag: "DP", time: "1h ago", delay: 0.5 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {events.map((e, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: reduce ? 0 : -14 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.4, delay: e.delay, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Scan flash on entry */}
          {!reduce && (
            <motion.div
              initial={{ x: "-100%", opacity: 0.3 }}
              animate={inView ? { x: "200%", opacity: 0 } : {}}
              transition={{ duration: 0.6, delay: e.delay + 0.1, ease: "easeOut" }}
              style={{
                position: "absolute", inset: 0,
                background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${e.color} 20%, transparent), transparent)`,
                pointerEvents: "none",
              }}
            />
          )}

          {/* Platform badge */}
          <div style={{
            width: 26, height: 26, borderRadius: 6, flexShrink: 0,
            background: e.muted,
            border: `1px solid color-mix(in srgb, ${e.color} 30%, transparent)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 700, color: e.color }}>{e.platform}</span>
          </div>

          {/* Problem info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {e.title}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 2, alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: e.diffColor }}>{e.diff}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>· {e.tag}</span>
            </div>
          </div>

          {/* Time + accepted dot */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--easy)", boxShadow: i === 0 ? "0 0 5px var(--easy)" : "none" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>{e.time}</span>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Auto-capture label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.7 }}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 10px",
          background: "var(--accent-muted)",
          border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <motion.div
          animate={reduce ? {} : { scale: [1, 1.3, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }}
        />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)" }}>
          Extension active — capturing automatically
        </span>
      </motion.div>
    </div>
  );
}

// ─── Feature 2 visual: SM-2 schedule timeline ────────────────────────────────
function SM2Visual({ inView }: { inView: boolean }) {
  const reduce = useReducedMotion();

  const reviews = [
    { label: "Solved",   day: "Mar 4",  interval: null,   conf: 2, color: "var(--accent)" },
    { label: "Review 1", day: "Mar 5",  interval: "1d",   conf: 2, color: "var(--medium)" },
    { label: "Review 2", day: "Mar 11", interval: "6d",   conf: 3, color: "var(--medium)" },
    { label: "Review 3", day: "Mar 26", interval: "15d",  conf: null, color: "var(--border-mid)" },
    { label: "Review 4", day: "Apr 25", interval: "30d",  conf: null, color: "var(--border-mid)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {reviews.map((r, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: reduce ? 0 : 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
        >
          {/* Timeline spine */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%", marginTop: 3,
              background: r.conf !== null ? r.color : "var(--bg-elevated)",
              border: `1.5px solid ${r.color}`,
              flexShrink: 0,
              boxShadow: i === 0 ? `0 0 6px ${r.color}` : "none",
            }} />
            {i < reviews.length - 1 && (
              <div style={{
                width: 1, flex: 1, minHeight: 28,
                background: i < 2 ? `linear-gradient(to bottom, ${r.color}, var(--border-subtle))` : "var(--border-subtle)",
                margin: "3px 0",
              }} />
            )}
          </div>

          {/* Content */}
          <div style={{ flex: 1, paddingBottom: i < reviews.length - 1 ? 8 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, color: r.conf !== null ? "var(--text-primary)" : "var(--text-muted)" }}>
                {r.label}
              </span>
              {r.interval && (
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 9,
                  color: "var(--accent)",
                  background: "var(--accent-muted)",
                  border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
                  borderRadius: "var(--radius-pill)",
                  padding: "1px 6px",
                }}>+{r.interval}</span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>{r.day}</span>
              {r.conf !== null && (
                <div style={{ display: "flex", gap: 2 }}>
                  {Array.from({ length: 3 }, (_, di) => (
                    <div key={di} style={{
                      width: 4, height: 4, borderRadius: "50%",
                      background: di < r.conf ? "var(--accent)" : "var(--border-mid)",
                    }} />
                  ))}
                </div>
              )}
              {r.conf === null && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-subtle)", fontStyle: "italic" }}>scheduled</span>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.85 }}
        style={{
          marginTop: 10,
          padding: "6px 10px",
          background: "color-mix(in srgb, var(--cf-color) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--cf-color) 20%, transparent)",
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--cf-color)",
        }}
      >
        Interval grows only when you remember. Forget it → resets to Day 1.
      </motion.div>
    </div>
  );
}

// ─── Feature 3 visual: Readiness score gauge ─────────────────────────────────
function ReadinessVisual({ inView }: { inView: boolean }) {
  const reduce = useReducedMotion();
  const score = 69;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);

  const signals = [
    { label: "Consistency",        value: 50, max: 25, color: "var(--accent)"    },
    { label: "Difficulty Spread",  value: 95, max: 25, color: "var(--accent)"    },
    { label: "Avg Confidence",     value: 72, max: 25, color: "var(--medium)"    },
    { label: "Revision Discipline",value: 57, max: 25, color: "var(--medium)"    },
  ];

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      {/* Gauge */}
      <div style={{ flexShrink: 0, position: "relative", width: 130, height: 130 }}>
        <svg width="130" height="130" viewBox="0 0 130 130">
          {/* Track */}
          <circle cx="65" cy="65" r={radius} fill="none"
            stroke="var(--bg-elevated)" strokeWidth="10" />
          {/* Progress arc */}
          <motion.circle
            cx="65" cy="65" r={radius}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={inView ? { strokeDashoffset: reduce ? dashOffset : dashOffset } : { strokeDashoffset: circumference }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            transform="rotate(-90 65 65)"
            style={{ filter: "drop-shadow(0 0 6px rgba(0,212,170,0.4))" }}
          />
        </svg>
        {/* Score text */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.04em", lineHeight: 1, textAlign: "center" }}>
              {score}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", textAlign: "center", marginTop: 2 }}>/ 100</div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 600,
              color: "var(--accent)", textAlign: "center", marginTop: 5,
              background: "var(--accent-muted)",
              border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
              borderRadius: "var(--radius-pill)", padding: "1px 6px",
            }}>On Track</div>
          </motion.div>
        </div>
      </div>

      {/* Signal bars */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {signals.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: reduce ? 0 : 10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.35, delay: 0.2 + i * 0.1 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 500, color: "var(--text-secondary)" }}>{s.label}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: s.color }}>{s.value}</span>
            </div>
            <div style={{ height: 4, background: "var(--bg-elevated)", borderRadius: 2, overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={inView ? { width: `${s.value}%` } : { width: 0 }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ height: "100%", borderRadius: 2, background: s.color }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Feature 4 visual: Pattern coverage map ──────────────────────────────────
function PatternMapVisual({ inView }: { inView: boolean }) {
  const reduce = useReducedMotion();
  const [hoveredPattern, setHoveredPattern] = useState<string | null>(null);

  const patterns = [
    { name: "Sliding Window",   count: 3, conf: "med",  group: "foundation" },
    { name: "Two Pointers",     count: 5, conf: "high", group: "foundation" },
    { name: "Binary Search",    count: 1, conf: "med",  group: "foundation" },
    { name: "BFS",              count: 0, conf: "none", group: "foundation" },
    { name: "DFS",              count: 1, conf: "high", group: "foundation" },
    { name: "Dynamic Prog.",    count: 0, conf: "none", group: "advanced"   },
    { name: "Backtracking",     count: 0, conf: "none", group: "advanced"   },
    { name: "Heap / Top-K",     count: 0, conf: "none", group: "advanced"   },
    { name: "Trie",             count: 0, conf: "none", group: "advanced"   },
    { name: "Graphs",           count: 0, conf: "none", group: "advanced"   },
  ];

  const confColor = (conf: string) =>
    conf === "high" ? "var(--accent)"
    : conf === "med"  ? "var(--medium)"
    : "var(--bg-elevated)";

  const confBorder = (conf: string) =>
    conf === "high" ? "color-mix(in srgb, var(--accent) 40%, transparent)"
    : conf === "med"  ? "color-mix(in srgb, var(--medium) 40%, transparent)"
    : "var(--border-subtle)";

  const confText = (conf: string) =>
    conf === "high" ? "var(--accent)"
    : conf === "med"  ? "var(--medium)"
    : "var(--text-subtle)";

  const attempted = patterns.filter((p) => p.conf !== "none").length;

  return (
    <div>
      {/* Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
          {attempted} of {patterns.length} patterns attempted
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          {[["var(--accent)", "High"], ["var(--medium)", "Med"], ["var(--border-mid)", "None"]].map(([c, l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: 2, background: c }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)" }}>{l}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Pattern tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
        {patterns.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, scale: reduce ? 1 : 0.85 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.15 + i * 0.05, ease: "backOut" }}
            onMouseEnter={() => setHoveredPattern(p.name)}
            onMouseLeave={() => setHoveredPattern(null)}
            style={{
              aspectRatio: "1",
              borderRadius: "var(--radius-md)",
              background: p.conf !== "none"
                ? `color-mix(in srgb, ${confColor(p.conf)} 12%, var(--bg-elevated))`
                : "var(--bg-elevated)",
              border: `1px solid ${confBorder(p.conf)}`,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              cursor: "default",
              transition: "all var(--transition-fast)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {p.conf !== "none" && (
              <motion.div
                animate={reduce ? {} : { opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }}
                style={{
                  position: "absolute", inset: 0,
                  background: `radial-gradient(circle at 50% 50%, color-mix(in srgb, ${confColor(p.conf)} 8%, transparent) 0%, transparent 70%)`,
                  pointerEvents: "none",
                }}
              />
            )}
            {p.count > 0 && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: confColor(p.conf), lineHeight: 1, marginBottom: 3 }}>
                {p.count}
              </span>
            )}
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 7.5, color: confText(p.conf),
              textAlign: "center", lineHeight: 1.3, padding: "0 3px",
              letterSpacing: "0.01em",
            }}>
              {p.conf === "none" ? "—" : p.name.split(" ")[0]}
            </span>

            {/* Hover tooltip */}
            <AnimatePresence>
              {hoveredPattern === p.name && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute",
                    bottom: "calc(100% + 6px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-mid)",
                    borderRadius: "var(--radius-sm)",
                    padding: "4px 8px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 9,
                    color: "var(--text-primary)",
                    whiteSpace: "nowrap",
                    boxShadow: "var(--shadow-md)",
                    zIndex: 10,
                    pointerEvents: "none",
                  }}
                >
                  {p.name} {p.count > 0 ? `· ${p.count} solved` : "· not yet"}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Weak area callout */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.85 }}
        style={{
          marginTop: 10,
          padding: "6px 10px",
          background: "color-mix(in srgb, var(--hard) 6%, transparent)",
          border: "1px solid color-mix(in srgb, var(--hard) 20%, transparent)",
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--hard)",
          display: "flex", alignItems: "center", gap: 6,
        }}
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M4.5 1L8 7.5H1L4.5 1Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
        </svg>
        Focus: Dynamic Programming — 0 problems attempted
      </motion.div>
    </div>
  );
}

// ─── Bento card ───────────────────────────────────────────────────────────────
interface BentoCard {
  id: string;
  tag: string;
  tagColor: string;
  headline: string;
  sub: string;
  visual: (inView: boolean) => React.ReactNode;
  span?: "normal" | "wide";
}

const FEATURES: BentoCard[] = [
  {
    id: "capture",
    tag: "Zero effort",
    tagColor: "var(--accent)",
    headline: "Auto-captures every accepted solve",
    sub: "The extension detects submissions on LeetCode and Codeforces the moment they're accepted. Platform, tags, difficulty, runtime — all pulled in automatically.",
    visual: (inView) => <AutoCaptureVisual inView={inView} />,
  },
  {
    id: "sm2",
    tag: "SM-2 algorithm",
    tagColor: "var(--cf-color)",
    headline: "Reviews scheduled at the exact moment you'd forget",
    sub: "The SM-2 algorithm calculates your personal decay rate per problem. Shaky on Two Pointers? You'll see it again tomorrow. Solid on Arrays? In 3 weeks.",
    visual: (inView) => <SM2Visual inView={inView} />,
  },
  {
    id: "readiness",
    tag: "Interview readiness",
    tagColor: "var(--medium)",
    headline: "A single score that tells you if you're ready",
    sub: "Four signals — consistency, difficulty spread, average confidence, and revision discipline — combined into one honest number. Know exactly where you stand before the interview.",
    visual: (inView) => <ReadinessVisual inView={inView} />,
  },
  {
    id: "patterns",
    tag: "Pattern awareness",
    tagColor: "var(--hard)",
    headline: "See your blind spots before the interviewer does",
    sub: "A coverage map of all 16 DSA patterns shows which you've mastered, which are weak, and which you've never touched. Interviewers pick exactly what you avoided.",
    visual: (inView) => <PatternMapVisual inView={inView} />,
  },
];

function BentoCardComponent({ card, index }: { card: BentoCard; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: reduce ? 0 : 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? {} : { borderColor: `color-mix(in srgb, ${card.tagColor} 35%, transparent)` }}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        padding: "28px 28px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        position: "relative",
        overflow: "hidden",
        transition: "border-color var(--transition-base)",
        cursor: "default",
      }}
    >
      {/* Corner radial glow */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 180, height: 180,
        background: `radial-gradient(circle at 100% 0%, color-mix(in srgb, ${card.tagColor} 9%, transparent) 0%, transparent 65%)`,
        pointerEvents: "none",
      }} />

      {/* Tag */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
          letterSpacing: "0.1em", textTransform: "uppercase" as const,
          color: card.tagColor,
          background: `color-mix(in srgb, ${card.tagColor} 10%, transparent)`,
          border: `1px solid color-mix(in srgb, ${card.tagColor} 25%, transparent)`,
          borderRadius: "var(--radius-pill)",
          padding: "3px 9px",
        }}>
          {card.tag}
        </span>
      </div>

      {/* Headline */}
      <h3 style={{
        fontFamily: "var(--font-sans)",
        fontSize: "clamp(16px, 1.8vw, 20px)",
        fontWeight: 700, letterSpacing: "-0.025em",
        color: "var(--text-primary)", lineHeight: 1.25,
        margin: 0, position: "relative", zIndex: 1,
      }}>
        {card.headline}
      </h3>

      {/* Sub */}
      <p style={{
        fontFamily: "var(--font-sans)", fontSize: 13,
        color: "var(--text-secondary)", lineHeight: 1.65,
        margin: 0, position: "relative", zIndex: 1,
      }}>
        {card.sub}
      </p>

      {/* Visual */}
      <div style={{ position: "relative", zIndex: 1, marginTop: 4 }}>
        {card.visual(inView)}
      </div>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function Features() {
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  return (
    <>
      <style>{`
        .features-section {
          padding: 100px clamp(16px, 4vw, 40px) 80px;
          position: relative;
          overflow: hidden;
        }

        .features-section::before {
          content: "";
          position: absolute;
          top: 0; left: 50%; transform: translateX(-50%);
          width: min(800px, 120vw);
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            color-mix(in srgb, var(--accent) 30%, transparent) 50%,
            transparent 100%
          );
        }

        .bento-grid {
          max-width: 1100px;
          margin: 56px auto 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (max-width: 720px) {
          .bento-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section className="features-section" id="features" aria-label="Features">

        {/* Section header */}
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center" }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--text-muted)", marginBottom: 16,
          }}>
            <div style={{ width: 20, height: 1, background: "var(--border-strong)" }} />
            Features
            <div style={{ width: 20, height: 1, background: "var(--border-strong)" }} />
          </div>

          <h2 style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(26px, 3.5vw, 40px)",
            fontWeight: 700, letterSpacing: "-0.03em",
            color: "var(--text-primary)", lineHeight: 1.15,
            margin: "0 auto", maxWidth: 620,
          }}>
            Your solve sessions just got a{" "}
            <span
              className={titleInView ? "memory-glow" : ""}
              style={{ color: "var(--accent)" }}
            >
              memory.
            </span>
          </h2>

          <style>{`
            .memory-glow {
              animation: memory-pulse 1.8s ease forwards;
              animation-delay: 0.4s;
            }
            @keyframes memory-pulse {
              0%   { text-shadow: none; }
              30%  { text-shadow: 0 0 28px rgba(0,212,170,0.7), 0 0 8px rgba(0,212,170,0.4); }
              65%  { text-shadow: 0 0 16px rgba(0,212,170,0.45), 0 0 4px rgba(0,212,170,0.2); }
              100% { text-shadow: 0 0 10px rgba(0,212,170,0.2); }
            }
          `}</style>

          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(13px, 1.5vw, 15px)",
            color: "var(--text-secondary)", lineHeight: 1.7,
            maxWidth: 500, margin: "16px auto 0",
          }}>
            Auto-capture, spaced repetition, readiness scoring, pattern tracking —
            running silently while you focus on solving.
          </p>
        </motion.div>

        {/* 2×2 bento grid */}
        <div className="bento-grid">
          {FEATURES.map((card, i) => (
            <BentoCardComponent key={card.id} card={card} index={i} />
          ))}
        </div>

      </section>
    </>
  );
}