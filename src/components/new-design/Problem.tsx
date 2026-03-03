"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

// ─── Typewriter ───────────────────────────────────────────────────────────────
// Supports \n with a configurable pause — the pause is the whole point.
function Typewriter({
  text,
  trigger,
  charDelay = 28,
  newlinePause = 460,
  startDelay = 0,
  style,
  className,
}: {
  text: string;
  trigger: boolean;
  charDelay?: number;
  newlinePause?: number;
  startDelay?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [displayed, setDisplayed] = useState("");
  const [cursorVisible, setCursorVisible] = useState(false);
  const [done, setDone] = useState(false);
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!trigger) return;
    if (reduce) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    setDisplayed("");
    setDone(false);
    setCursorVisible(true);

    let i = 0;
    let accumulated = "";

    const type = () => {
      if (i >= text.length) {
        setDone(true);
        // Blink cursor briefly then hide
        setTimeout(() => setCursorVisible(false), 1200);
        return;
      }

      const char = text[i];
      accumulated += char;
      setDisplayed(accumulated);
      i++;

      const delay = char === "\n" ? newlinePause : charDelay;
      rafRef.current = setTimeout(type, delay);
    };

    rafRef.current = setTimeout(type, startDelay);

    return () => {
      if (rafRef.current) clearTimeout(rafRef.current);
    };
  }, [trigger, text, charDelay, newlinePause, startDelay, reduce]);

  // Split by \n to render line breaks correctly
  const lines = displayed.split("\n");

  return (
    <span className={className} style={{ ...style, position: "relative" }}>
      {lines.map((line, idx) => (
        <span key={idx}>
          {line}
          {idx < lines.length - 1 && <br />}
        </span>
      ))}
      {/* Blinking cursor */}
      {cursorVisible && !done && (
        <span
          style={{
            display: "inline-block",
            width: "2px",
            height: "0.85em",
            background: "var(--accent)",
            marginLeft: "2px",
            verticalAlign: "text-bottom",
            borderRadius: "1px",
            animation: "tw-blink 0.6s step-end infinite",
          }}
          aria-hidden="true"
        />
      )}
      {/* Cursor blinks a few times after done, then fades */}
      {cursorVisible && done && (
        <span
          style={{
            display: "inline-block",
            width: "2px",
            height: "0.85em",
            background: "var(--accent)",
            marginLeft: "2px",
            verticalAlign: "text-bottom",
            borderRadius: "1px",
            animation: "tw-blink-fade 1.2s ease forwards",
            opacity: 0,
          }}
          aria-hidden="true"
        />
      )}
      <style>{`
        @keyframes tw-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes tw-blink-fade {
          0%   { opacity: 1; }
          60%  { opacity: 0; }
          80%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}

// ─── Visual 1: Spreadsheet with staggered row scan ────────────────────────────
function SpreadsheetChaos() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();

  const rows = [
    { title: "Two Sum", conf: 1, date: "Mar 1" },
    { title: "Valid Parentheses", conf: 2, date: "Feb 28" },
    { title: "Merge Intervals", conf: 0, date: "Feb 20" },
    { title: "LRU Cache", conf: 1, date: "Feb 15" },
    { title: "Course Schedule", conf: 0, date: "Feb 10" },
  ];

  return (
    <div
      ref={ref}
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        fontFamily: "var(--font-mono)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 52px 64px 58px",
          padding: "7px 12px",
          background: "var(--bg-base)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {["PROBLEM", "STATUS", "CONF.", "DATE"].map((h) => (
          <div
            key={h}
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "var(--text-muted)",
              textTransform: "uppercase",
            }}
          >
            {h}
          </div>
        ))}
      </div>

      {rows.map((row, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: reduce ? 0 : -10 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{
            duration: 0.35,
            delay: i * 0.07,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 52px 64px 58px",
            padding: "7px 12px",
            borderBottom:
              i < rows.length - 1 ? "1px solid var(--border-subtle)" : "none",
            alignItems: "center",
            position: "relative",
          }}
          whileHover={reduce ? {} : { backgroundColor: "var(--bg-hover)" }}
        >
          {!reduce && (
            <motion.div
              initial={{ opacity: 0.18, scaleX: 1 }}
              animate={inView ? { opacity: 0, scaleX: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: i * 0.07 + 0.2 }}
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, transparent, color-mix(in srgb, var(--hard) 15%, transparent), transparent)",
                pointerEvents: "none",
                transformOrigin: "left",
              }}
            />
          )}
          <div
            style={{
              fontSize: 11,
              color: "var(--text-primary)",
              fontFamily: "var(--font-sans)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.title}
          </div>
          <div
            style={{
              fontSize: 10,
              color: row.conf > 0 ? "var(--easy)" : "var(--text-subtle)",
            }}
          >
            {row.conf > 0 ? "✓" : "???"}
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            {Array.from({ length: 3 }, (_, di) => (
              <div
                key={di}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background:
                    di < row.conf
                      ? row.conf === 1
                        ? "var(--hard)"
                        : "var(--medium)"
                      : "var(--border-mid)",
                }}
              />
            ))}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "var(--hard)",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <circle
                cx="4"
                cy="4"
                r="3.5"
                stroke="var(--hard)"
                strokeWidth="1"
              />
              <path
                d="M4 2v2.5l1.5 1"
                stroke="var(--hard)"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
            {row.date}
          </div>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.5 }}
        style={{
          padding: "7px 12px",
          background: "color-mix(in srgb, var(--hard) 6%, transparent)",
          borderTop:
            "1px solid color-mix(in srgb, var(--hard) 20%, transparent)",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <path
            d="M4.5 1L8 7.5H1L4.5 1Z"
            stroke="var(--hard)"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 3.5v2"
            stroke="var(--hard)"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <circle cx="4.5" cy="6.5" r="0.4" fill="var(--hard)" />
        </svg>
        <span style={{ fontSize: 9, color: "var(--hard)" }}>
          5 problems overdue for review
        </span>
      </motion.div>
    </div>
  );
}

// ─── Visual 2: Forgetting curve draws itself on scroll ────────────────────────
function ForgettingCurve() {
  const containerRef = useRef<HTMLDivElement>(null);
  const forgetRef = useRef<SVGPathElement>(null);
  const sm2Ref = useRef<SVGPathElement>(null);
  const containerInView = useInView(containerRef, {
    once: true,
    margin: "-40px",
  });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!containerInView || reduce) return;
    const animatePath = (el: SVGPathElement | null, delay: number) => {
      if (!el) return;
      const length = el.getTotalLength();
      el.style.strokeDasharray = `${length}`;
      el.style.strokeDashoffset = `${length}`;
      const start = performance.now() + delay;
      const duration = 1400;
      const tick = (now: number) => {
        const elapsed = Math.max(0, now - start);
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.style.strokeDashoffset = `${length * (1 - eased)}`;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    animatePath(forgetRef.current, 0);
    animatePath(sm2Ref.current, 300);
  }, [containerInView, reduce]);

  const W = 280,
    H = 110;
  const forgetPoints: [number, number][] = [
    [0, 8],
    [18, 42],
    [45, 65],
    [85, 80],
    [135, 90],
    [200, 96],
    [W, 99],
  ];
  const sm2Points: [number, number][] = [
    [0, 8],
    [15, 38],
    [16, 14],
    [35, 32],
    [36, 8],
    [60, 26],
    [61, 5],
    [100, 20],
    [101, 4],
    [160, 14],
    [220, 9],
    [W, 7],
  ];
  const toPath = (pts: [number, number][]) =>
    pts.reduce((acc, [x, y], i) => {
      const px = (x / W) * 260 + 10;
      const py = (y / H) * 90 + 8;
      return i === 0 ? `M${px},${py}` : `${acc} L${px},${py}`;
    }, "");

  return (
    <div ref={containerRef}>
      <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
        {[
          { color: "var(--hard)", label: "Without review", dashed: false },
          { color: "var(--accent)", label: "With SM-2", dashed: true },
        ].map((l) => (
          <div
            key={l.label}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <svg width="20" height="6">
              {l.dashed ? (
                <line
                  x1="0"
                  y1="3"
                  x2="20"
                  y2="3"
                  stroke={l.color}
                  strokeWidth="2"
                  strokeDasharray="4,2"
                />
              ) : (
                <line
                  x1="0"
                  y1="3"
                  x2="20"
                  y2="3"
                  stroke={l.color}
                  strokeWidth="2"
                />
              )}
            </svg>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: "var(--text-muted)",
              }}
            >
              {l.label}
            </span>
          </div>
        ))}
      </div>
      <svg viewBox="0 0 280 120" width="100%" style={{ overflow: "visible" }}>
        {[0, 25, 50, 75, 100].map((pct) => {
          const y = (pct / H) * 90 + 8;
          return (
            <line
              key={pct}
              x1="10"
              y1={y}
              x2="270"
              y2={y}
              stroke="var(--border-subtle)"
              strokeWidth="0.5"
              strokeDasharray="3,4"
            />
          );
        })}
        {[100, 50, 0].map((pct) => {
          const y = (pct / H) * 90 + 8;
          return (
            <text
              key={pct}
              x="6"
              y={y + 3}
              fontSize="7"
              fill="var(--text-subtle)"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
            >
              {pct}%
            </text>
          );
        })}
        <motion.path
          d={`${toPath(forgetPoints)} L270,100 L10,100 Z`}
          fill="color-mix(in srgb, var(--hard) 8%, transparent)"
          initial={{ opacity: 0 }}
          animate={containerInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        />
        <path
          ref={forgetRef}
          d={toPath(forgetPoints)}
          stroke="var(--hard)"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: reduce ? "none" : "9999",
            strokeDashoffset: reduce ? "0" : "9999",
          }}
        />
        <path
          ref={sm2Ref}
          d={toPath(sm2Points)}
          stroke="var(--accent)"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4,3"
          style={{
            strokeDasharray: reduce ? "4,3" : "9999",
            strokeDashoffset: reduce ? "0" : "9999",
          }}
        />
        {[15, 35, 60, 100, 160].map((x, i) => {
          const px = (x / W) * 260 + 10;
          const py = 90;
          return (
            <motion.circle
              key={x}
              cx={px}
              cy={py}
              r="3"
              fill="var(--accent)"
              initial={{ scale: 0, opacity: 0 }}
              animate={containerInView ? { scale: 1, opacity: 0.85 } : {}}
              transition={{
                duration: 0.3,
                delay: 1.4 + i * 0.1,
                ease: "backOut",
              }}
              style={{ transformOrigin: `${px}px ${py}px` }}
            />
          );
        })}
        {["Day 1", "Day 7", "Day 14", "Day 30"].map((d, i) => {
          const x = [0, 80, 160, 240][i];
          const px = (x / W) * 260 + 10;
          return (
            <text
              key={d}
              x={px}
              y="116"
              fontSize="7.5"
              fill="var(--text-subtle)"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
            >
              {d}
            </text>
          );
        })}
      </svg>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={containerInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 1.8 }}
        style={{
          marginTop: 8,
          padding: "6px 10px",
          background: "color-mix(in srgb, var(--medium) 8%, transparent)",
          border:
            "1px solid color-mix(in srgb, var(--medium) 20%, transparent)",
          borderRadius: "var(--radius-sm)",
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--medium)",
        }}
      >
        ~70% forgotten within 24 hours without review — Ebbinghaus, 1885
      </motion.div>
    </div>
  );
}

// ─── Visual 3: Pattern bars animate width on scroll ───────────────────────────
function PatternGap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const patterns = [
    { name: "Array", count: 6, conf: "high" },
    { name: "Two Pointers", count: 5, conf: "high" },
    { name: "Sliding Window", count: 3, conf: "med" },
    { name: "Binary Search", count: 1, conf: "med" },
    { name: "Dynamic Prog.", count: 0, conf: "none" },
    { name: "Backtracking", count: 0, conf: "none" },
    { name: "Graphs / BFS", count: 0, conf: "none" },
    { name: "Trie", count: 0, conf: "none" },
  ];
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {patterns.map((p, i) => {
        const targetWidth = (p.count / 6) * 100;
        const barColor =
          p.conf === "high"
            ? "var(--accent)"
            : p.conf === "med"
              ? "var(--medium)"
              : "var(--border-mid)";
        return (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, x: reduce ? 0 : -8 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{
              duration: 0.35,
              delay: i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <div
              style={{
                width: 104,
                flexShrink: 0,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color:
                  p.count > 0 ? "var(--text-secondary)" : "var(--text-subtle)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {p.name}
            </div>
            <div
              style={{
                flex: 1,
                height: 6,
                background: "var(--bg-elevated)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={inView ? { width: `${targetWidth}%` } : { width: 0 }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.07 + 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  height: "100%",
                  borderRadius: 3,
                  background: barColor,
                }}
              />
            </div>
            {p.count > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.3, delay: i * 0.07 + 0.6 }}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 600,
                  color: barColor,
                  width: 14,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {p.count}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.3, delay: i * 0.07 + 0.4 }}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: "var(--text-subtle)",
                  width: 36,
                  textAlign: "right",
                  flexShrink: 0,
                  letterSpacing: "0.03em",
                }}
              >
                not yet
              </motion.div>
            )}
          </motion.div>
        );
      })}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.9 }}
        style={{
          marginTop: 4,
          padding: "6px 10px",
          background: "color-mix(in srgb, var(--cf-color) 8%, transparent)",
          border:
            "1px solid color-mix(in srgb, var(--cf-color) 20%, transparent)",
          borderRadius: "var(--radius-sm)",
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--cf-color)",
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path
            d="M4.5 1L8 7.5H1L4.5 1Z"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
        10 of 16 patterns never attempted
      </motion.div>
    </div>
  );
}

// ─── Pain card — typewriter on the headline ───────────────────────────────────
const PAIN_POINTS = [
  {
    id: "spreadsheet",
    tag: "01 — THE GRIND",
    headline: "You've solved it before.\nYou can't solve it now.",
    body: "You grind 200 problems. You feel ready. Then the interviewer asks Two Sum II and your mind goes blank — because you solved it 3 weeks ago and never looked at it again. Raw volume without retention is just expensive practice.",
    visual: <SpreadsheetChaos />,
    accent: "var(--hard)",
  },
  {
    id: "repetition",
    tag: "02 — THE FORGETTING",
    headline: "The Ebbinghaus curve\nis eating your prep.",
    body: "Without review, you forget 70% of a solution within 24 hours. Spreadsheets, starred problems, revision folders — none of it fires at the right moment. You review too early or too late, and it barely sticks.",
    visual: <ForgettingCurve />,
    accent: "var(--medium)",
  },
  {
    id: "patterns",
    tag: "03 — THE BLIND SPOT",
    headline: "You're strong on arrays.\nWeak on everything else.",
    body: "You don't know what you don't know. Without pattern tracking, you unknowingly over-index on 3 comfortable tags while leaving 13 others untouched. Interviewers pick exactly the patterns you avoided.",
    visual: <PatternGap />,
    accent: "var(--cf-color)",
  },
];

function PainCard({
  point,
  index,
}: {
  point: (typeof PAIN_POINTS)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.55,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        reduce
          ? {}
          : {
              borderColor: `color-mix(in srgb, ${point.accent} 40%, transparent)`,
            }
      }
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        padding: "28px 28px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        position: "relative",
        overflow: "hidden",
        transition: "border-color var(--transition-base)",
        cursor: "default",
      }}
    >
      {/* Corner glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 180,
          height: 180,
          background: `radial-gradient(circle at 0% 0%, color-mix(in srgb, ${point.accent} 10%, transparent) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Tag */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: point.accent,
          position: "relative",
          zIndex: 1,
        }}
      >
        {point.tag}
      </div>

      {/* Headline with typewriter */}
      <h3
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "clamp(18px, 2vw, 22px)",
          fontWeight: 700,
          letterSpacing: "-0.025em",
          color: "var(--text-primary)",
          lineHeight: 1.25,
          margin: 0,
          position: "relative",
          zIndex: 1,
          // Reserve height so layout doesn't shift as text types in
          minHeight: "2.6em",
        }}
      >
        <Typewriter
          text={point.headline}
          trigger={inView}
          charDelay={26}
          newlinePause={450}
          startDelay={index * 100 + 180}
        />
      </h3>

      {/* Body — fades in after typewriter finishes (approx) */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{
          duration: 0.5,
          // Rough delay: startDelay + chars * charDelay + newlinePause
          delay:
            (index * 100 +
              180 +
              point.headline.replace("\n", "").length * 26 +
              450) /
            1000,
        }}
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          color: "var(--text-secondary)",
          lineHeight: 1.7,
          margin: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {point.body}
      </motion.p>

      {/* Visual */}
      <div style={{ position: "relative", zIndex: 1 }}>{point.visual}</div>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function Problem() {
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  return (
    <>
      <style>{`
        .problem-section {
          padding: 100px clamp(16px, 4vw, 40px) 80px;
          position: relative;
        }
        .problem-grid {
          max-width: 1100px;
          margin: 56px auto 0;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px)  { .problem-grid { grid-template-columns: 1fr; max-width: 600px; } }
        @media (min-width: 901px) and (max-width: 1100px) { .problem-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>

      <section
        className="problem-section"
        id="problem"
        aria-label="The problem"
      >
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 20,
                height: 1,
                background: "var(--border-strong)",
              }}
            />
            The problem
            <div
              style={{
                width: 20,
                height: 1,
                background: "var(--border-strong)",
              }}
            />
          </div>

          <h2
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(26px, 3.5vw, 40px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
              lineHeight: 1.15,
              margin: "0 auto",
              maxWidth: 560,
            }}
          >
            Grinding problems isn't the problem.{" "}
            <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
              Forgetting them is.
            </span>
          </h2>

          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(13px, 1.5vw, 15px)",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              maxWidth: 480,
              margin: "16px auto 0",
            }}
          >
            Three reasons why engineers who grind 200 problems still blank in
            interviews.
          </p>
        </motion.div>

        <div className="problem-grid">
          {PAIN_POINTS.map((point, i) => (
            <PainCard key={point.id} point={point} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
