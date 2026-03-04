"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, useReducedMotion, animate } from "framer-motion";

// ─── Animated number ──────────────────────────────────────────────────────────
function AnimatedNumber({ to, duration = 1.2, delay = 0 }: { to: number; duration?: number; delay?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (reduce) { setVal(to); return; }
    const controls = animate(0, to, {
      duration, delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration, delay, reduce]);

  return <span ref={ref}>{val}</span>;
}

// ─── Circular gauge ───────────────────────────────────────────────────────────
function ReadinessGauge({ inView }: { inView: boolean }) {
  const reduce = useReducedMotion();
  const score = 69;
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference * (1 - score / 100);
  const shimmers = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{
        position: "absolute", inset: -24,
        background: "radial-gradient(circle, rgba(0,212,170,0.12) 0%, transparent 65%)",
        borderRadius: "50%", pointerEvents: "none",
        animation: reduce ? "none" : "gauge-breathe 4s ease-in-out infinite",
      }} />

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "relative", zIndex: 1 }}>
        {shimmers.map((i) => {
          const angle = (i / shimmers.length) * 360;
          const r2 = radius + 16;
          const x = cx + r2 * Math.cos((angle - 90) * Math.PI / 180);
          const y = cy + r2 * Math.sin((angle - 90) * Math.PI / 180);
          return (
            <motion.circle key={i} cx={x} cy={y} r="1.5" fill="var(--border-subtle)"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: [0, 0.6, 0] } : {}}
              transition={{ duration: 2.4, delay: i * 0.15 + 0.5, repeat: Infinity, ease: "easeInOut" }}
            />
          );
        })}

        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--bg-elevated)" strokeWidth="12" />

        {Array.from({ length: 20 }, (_, i) => {
          const angle = (i / 20) * 360 - 90;
          const inner = radius - 7, outer = radius + 7;
          const x1 = cx + inner * Math.cos(angle * Math.PI / 180);
          const y1 = cy + inner * Math.sin(angle * Math.PI / 180);
          const x2 = cx + outer * Math.cos(angle * Math.PI / 180);
          const y2 = cy + outer * Math.sin(angle * Math.PI / 180);
          const filled = i < Math.round((score / 100) * 20);
          return (
            <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={filled ? "var(--accent)" : "var(--bg-elevated)"}
              strokeWidth="3" strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.2, delay: 0.3 + i * 0.04 }}
            />
          );
        })}

        <motion.circle
          cx={cx} cy={cy} r={radius} fill="none"
          stroke="var(--accent)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={inView ? { strokeDashoffset: targetOffset } : { strokeDashoffset: circumference }}
          transition={{ duration: 1.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ filter: "drop-shadow(0 0 8px rgba(0,212,170,0.5))" }}
        />

        <foreignObject x={cx - 52} y={cy - 44} width="104" height="88">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 38, fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.05em", lineHeight: 1 }}>
              {inView ? <AnimatedNumber to={score} duration={1.2} delay={0.3} /> : 0}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>/ 100</div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.35, delay: 1.2, ease: "backOut" }}
              style={{
                marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
                color: "var(--accent)", background: "var(--accent-muted)",
                border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                borderRadius: "var(--radius-pill)", padding: "3px 10px",
                letterSpacing: "0.06em", textTransform: "uppercase" as const,
              }}
            >On Track</motion.div>
          </div>
        </foreignObject>
      </svg>

      <style>{`
        @keyframes gauge-breathe {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}

// ─── Score sparkline ──────────────────────────────────────────────────────────
function ScoreSparkline({ inView }: { inView: boolean }) {
  const reduce = useReducedMotion();
  const lineRef = useRef<SVGPathElement>(null);

  const scores = [58, 59, 61, 60, 64, 66, 69];
  const W = 520, H = 60;
  const minS = 55, maxS = 72;

  const toX = (i: number) => 6 + (i / (scores.length - 1)) * (W - 12);
  const toY = (v: number) => H - 4 - ((v - minS) / (maxS - minS)) * (H - 14);

  const pathD = scores.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");
  const areaD = pathD + ` L${toX(scores.length - 1)},${H} L${toX(0)},${H} Z`;

  useEffect(() => {
    if (!inView || reduce) return;
    const el = lineRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    const start = performance.now() + 200;
    const dur = 1200;
    const tick = (now: number) => {
      const t = Math.min(Math.max(0, now - start) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3);
      el.style.strokeDashoffset = `${len * (1 - e)}`;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, reduce]);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: "visible", display: "block" }}>
        <defs>
          <linearGradient id="spark-area-v2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--accent)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"    />
          </linearGradient>
        </defs>

        {/* Reference lines */}
        {[60, 65, 70].map((v) => {
          const y = toY(v);
          return (
            <g key={v}>
              <line x1={4} y1={y} x2={W - 4} y2={y}
                stroke="var(--border-subtle)" strokeWidth="0.5" strokeDasharray="3 4" />
              <text x="2" y={y + 3} fontSize="8" fill="var(--text-subtle)"
                textAnchor="start" fontFamily="var(--font-mono)">{v}</text>
            </g>
          );
        })}

        {/* Area */}
        <motion.path d={areaD} fill="url(#spark-area-v2)"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.0 }}
        />

        {/* Line — self-draws */}
        <path ref={lineRef} d={pathD} fill="none"
          stroke="var(--accent)" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{
            strokeDasharray: reduce ? "none" : "9999",
            strokeDashoffset: reduce ? "0" : "9999",
            filter: "drop-shadow(0 0 4px rgba(0,212,170,0.5))",
          }}
        />

        {/* Dots */}
        {scores.map((v, i) => {
          const isLast = i === scores.length - 1;
          return (
            <motion.circle key={i} cx={toX(i)} cy={toY(v)} r={isLast ? 4 : 2.5}
              fill={isLast ? "var(--accent)" : "var(--bg-surface)"}
              stroke="var(--accent)" strokeWidth={isLast ? 0 : 1.5}
              initial={{ scale: 0, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.25, delay: 0.9 + i * 0.06, ease: "backOut" }}
              style={{
                transformOrigin: `${toX(i)}px ${toY(v)}px`,
                filter: isLast ? "drop-shadow(0 0 5px rgba(0,212,170,0.8))" : "none",
              }}
            />
          );
        })}

        {/* Score label on last dot */}
        <motion.text x={toX(scores.length - 1)} y={toY(69) - 9}
          fontSize="8.5" fill="var(--accent)" textAnchor="middle"
          fontFamily="var(--font-mono)" fontWeight="600"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 1.5 }}
        >69</motion.text>
      </svg>

      {/* X-axis day labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {["Feb 19", "Feb 22", "Feb 25", "Feb 28", "Mar 1", "Mar 3", "Today"].map((d) => (
          <span key={d} style={{
            fontFamily: "var(--font-mono)", fontSize: 8,
            color: d === "Today" ? "var(--accent)" : "var(--text-subtle)",
            fontWeight: d === "Today" ? 600 : 400,
          }}>{d}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Signal bars ──────────────────────────────────────────────────────────────
const SIGNALS = [
  { label: "Consistency",         value: 50, score: 50, color: "var(--accent)",  detail: "7 of last 14 days active"        },
  { label: "Difficulty Spread",   value: 95, score: 95, color: "var(--accent)",  detail: "14 medium/hard of 21 total"      },
  { label: "Avg Confidence",      value: 72, score: 72, color: "var(--medium)",  detail: "72% across all solved problems"  },
  { label: "Revision Discipline", value: 57, score: 57, color: "var(--medium)",  detail: "9 problems flagged for review"   },
];

function SignalBars({ inView }: { inView: boolean }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const reduce = useReducedMotion();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {SIGNALS.map((sig, i) => (
        <motion.div
          key={sig.label}
          initial={{ opacity: 0, x: reduce ? 0 : -16 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          onMouseEnter={() => setHoveredIdx(i)}
          onMouseLeave={() => setHoveredIdx(null)}
          style={{
            padding: "14px 16px",
            borderRadius: "var(--radius-md)",
            background: hoveredIdx === i ? "var(--bg-elevated)" : "transparent",
            transition: "background var(--transition-fast)",
            cursor: "default",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                {sig.label}
              </div>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={hoveredIdx === i ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                  {sig.detail}
                </div>
              </motion.div>
            </div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700,
              letterSpacing: "-0.04em", color: sig.color, lineHeight: 1,
              minWidth: 36, textAlign: "right" as const,
            }}>
              {inView ? <AnimatedNumber to={sig.score} duration={0.9} delay={0.2 + i * 0.1} /> : 0}
            </div>
          </div>

          <div style={{ height: 5, background: "var(--bg-elevated)", borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={inView ? { width: `${sig.value}%` } : { width: 0 }}
              transition={{ duration: 1.0, delay: 0.25 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                height: "100%", borderRadius: "var(--radius-pill)",
                background: hoveredIdx === i
                  ? `linear-gradient(90deg, ${sig.color}, color-mix(in srgb, ${sig.color} 60%, #00e8c4))`
                  : sig.color,
                boxShadow: hoveredIdx === i ? `0 0 8px color-mix(in srgb, ${sig.color} 40%, transparent)` : "none",
                transition: "background var(--transition-fast), box-shadow var(--transition-fast)",
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function AnalyticsPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  return (
    <>
      <style>{`
        .analytics-section {
          padding: 100px clamp(16px, 4vw, 40px) 80px;
          position: relative;
          overflow: hidden;
        }

        /* ── Dot grid — full section background ── */
        .analytics-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(
            circle,
            rgba(0,212,170,0.18) 1px,
            transparent 1px
          );
          background-size: 28px 28px;
          pointer-events: none;
          /* Fade out at top and bottom edges — keeps it from feeling wallpaper-y */
          mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            black 12%,
            black 88%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            black 12%,
            black 88%,
            transparent 100%
          );
        }

        /* ── Teal ambient glow — bottom left ── */
        .analytics-section::after {
          content: "";
          position: absolute;
          bottom: -60px; left: -60px;
          width: 480px; height: 480px;
          background: radial-gradient(circle, rgba(0,212,170,0.07) 0%, transparent 65%);
          pointer-events: none;
        }

        .analytics-inner {
          max-width: 1100px;
          margin: 60px auto 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .analytics-left {
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }

        .analytics-left-header {
          padding: 20px 20px 16px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .analytics-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 28px;
        }

        .analytics-rec {
          width: 100%;
          padding: 16px 20px;
          background: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        /* Section title z-index above dot grid */
        .analytics-title-wrap {
          position: relative;
          z-index: 1;
          text-align: center;
        }

        @media (max-width: 860px) {
          .analytics-inner { grid-template-columns: 1fr; gap: 32px; }
          .analytics-right  { order: -1; }
        }
      `}</style>

      <section className="analytics-section" aria-label="Analytics preview">

        {/* Section header */}
        <motion.div
          ref={titleRef}
          className="analytics-title-wrap"
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--text-muted)", marginBottom: 16,
          }}>
            <div style={{ width: 20, height: 1, background: "var(--border-strong)" }} />
            Analytics
            <div style={{ width: 20, height: 1, background: "var(--border-strong)" }} />
          </div>

          <h2 style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(26px, 3.5vw, 40px)",
            fontWeight: 700, letterSpacing: "-0.03em",
            color: "var(--text-primary)", lineHeight: 1.15,
            margin: "0 auto", maxWidth: 560,
          }}>
            Know if you're ready.{" "}
            <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
              Not just how many you've solved.
            </span>
          </h2>

          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(13px, 1.5vw, 15px)",
            color: "var(--text-secondary)", lineHeight: 1.7,
            maxWidth: 480, margin: "16px auto 0",
          }}>
            Your readiness score combines four signals into one honest number — so you
            stop guessing and start knowing.
          </p>
        </motion.div>

        {/* Split layout */}
        <div ref={sectionRef} className="analytics-inner">

          {/* ── Left: Signal bars + sparkline ───────────────── */}
          <motion.div
            className="analytics-left"
            initial={{ opacity: 0, x: reduce ? 0 : -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Card header */}
            <div className="analytics-left-header">
              <div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  Readiness Score
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>
                  Four weighted signals, each worth 25 points
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <motion.div
                  animate={reduce ? {} : { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--easy)" }}
                />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>live</span>
              </div>
            </div>

            {/* Signal bars */}
            <div style={{ padding: "4px 0" }}>
              <SignalBars inView={inView} />
            </div>

            {/* Score history sparkline */}
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
              style={{
                borderTop: "1px solid var(--border-subtle)",
                padding: "16px 20px 14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
                  letterSpacing: "0.08em", textTransform: "uppercase" as const,
                  color: "var(--text-muted)",
                }}>Score history</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)", fontWeight: 600 }}>+11</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>last 14 days</span>
                </div>
              </div>
              <ScoreSparkline inView={inView} />
            </motion.div>

            {/* Footer nudge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 1.0 }}
              style={{
                padding: "12px 16px",
                borderTop: "1px solid var(--border-subtle)",
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--bg-elevated)",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="5.5" stroke="var(--medium)" strokeWidth="1.2" />
                <path d="M6.5 4v3.5" stroke="var(--medium)" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="6.5" cy="9.5" r="0.6" fill="var(--medium)" />
              </svg>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
                Good momentum — push harder on medium/hard problems
              </span>
            </motion.div>
          </motion.div>

          {/* ── Right: Gauge + recommendation ───────────────── */}
          <motion.div
            className="analytics-right"
            initial={{ opacity: 0, x: reduce ? 0 : 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={reduce ? {} : { y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <ReadinessGauge inView={inView} />
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.6 }}
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, width: "100%" }}
            >
              {[
                { label: "Problems",  value: 21, suffix: "",  color: "var(--accent)"  },
                { label: "Avg conf.", value: 72, suffix: "%", color: "var(--medium)"  },
                { label: "Streak",    value: 4,  suffix: "d", color: "#f97316"        },
              ].map((stat, i) => (
                <div key={stat.label} className="card" style={{ padding: "12px 14px", textAlign: "center" as const }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: stat.color, letterSpacing: "-0.04em", lineHeight: 1 }}>
                    {inView ? <AnimatedNumber to={stat.value} duration={0.9} delay={0.5 + i * 0.1} /> : 0}
                    {stat.suffix}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Recommendation card */}
            <motion.div
              className="analytics-rec"
              initial={{ opacity: 0, y: reduce ? 0 : 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.75 }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: "var(--radius-md)", flexShrink: 0,
                background: "color-mix(in srgb, var(--medium) 12%, transparent)",
                border: "1px solid color-mix(in srgb, var(--medium) 25%, transparent)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v4l2.5 2.5" stroke="var(--medium)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="7" cy="7" r="5.5" stroke="var(--medium)" strokeWidth="1.4" />
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                  Focus area: Dynamic Programming
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", lineHeight: 1.55 }}>
                  0 problems attempted · weakest pattern by confidence. Review before your next interview.
                </div>
              </div>
            </motion.div>

            {/* CTA link */}
            <motion.a
              href="/dashboard/analytics"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.9 }}
              whileHover={reduce ? {} : { gap: "9px" } as never}
              style={{
                fontFamily: "var(--font-mono)", fontSize: 11,
                color: "var(--accent)", textDecoration: "none",
                display: "flex", alignItems: "center", gap: 5,
                transition: "gap var(--transition-fast)",
              }}
            >
              See your full analytics dashboard
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.a>
          </motion.div>

        </div>
      </section>
    </>
  );
}


// "use client";

// import { useRef, useState, useEffect } from "react";
// import { motion, useInView, useReducedMotion, animate } from "framer-motion";

// // ─── Animated number ──────────────────────────────────────────────────────────
// function AnimatedNumber({
//   to,
//   duration = 1.2,
//   delay = 0,
// }: {
//   to: number;
//   duration?: number;
//   delay?: number;
// }) {
//   const [val, setVal] = useState(0);
//   const ref = useRef<HTMLSpanElement>(null);
//   const inView = useInView(ref, { once: true, margin: "-60px" });
//   const reduce = useReducedMotion();

//   useEffect(() => {
//     if (!inView) return;
//     if (reduce) { setVal(to); return; }
//     const c = animate(0, to, {
//       duration, delay,
//       ease: [0.22, 1, 0.36, 1],
//       onUpdate: (v) => setVal(Math.round(v)),
//     });
//     return () => c.stop();
//   }, [inView, to, duration, delay, reduce]);

//   return <span ref={ref}>{val}</span>;
// }

// // ─── Premium gauge ────────────────────────────────────────────────────────────
// function PremiumGauge({ inView }: { inView: boolean }) {
//   const reduce = useReducedMotion();
//   const score = 69;
//   const SIZE = 260;
//   const cx = SIZE / 2, cy = SIZE / 2;
//   const R = {
//     outer:  104,
//     arc:     92,
//     mid:     80,
//     inner:   62,
//     pulse:  112,
//   };

//   const circ = (r: number) => 2 * Math.PI * r;
//   const offset = (r: number, pct: number) => circ(r) * (1 - pct / 100);

//   // 24 tick marks around the outer ring
//   const ticks = Array.from({ length: 24 }, (_, i) => i);
//   const filled = Math.round((score / 100) * 24);

//   return (
//     <div style={{ position: "relative", width: SIZE, height: SIZE }}>

//       {/* Layered glow halos */}
//       {[140, 100, 70].map((size, i) => (
//         <motion.div
//           key={i}
//           style={{
//             position: "absolute",
//             top: "50%", left: "50%",
//             transform: "translate(-50%,-50%)",
//             width: size, height: size,
//             borderRadius: "50%",
//             background: `radial-gradient(circle, rgba(0,212,170,${0.14 - i * 0.04}) 0%, transparent 70%)`,
//             pointerEvents: "none",
//           }}
//           animate={reduce ? {} : {
//             scale: [1, 1 + i * 0.03 + 0.02, 1],
//             opacity: [0.7, 1, 0.7],
//           }}
//           transition={{
//             duration: 3 + i * 0.8,
//             repeat: Infinity,
//             ease: "easeInOut",
//             delay: i * 0.4,
//           }}
//         />
//       ))}

//       <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ position: "relative", zIndex: 1, overflow: "visible" }}>
//         <defs>
//           {/* Gradient arc: teal → cyan */}
//           <linearGradient id="arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
//             <stop offset="0%"   stopColor="#00d4aa" />
//             <stop offset="60%"  stopColor="#00e8c4" />
//             <stop offset="100%" stopColor="#00d4aa" stopOpacity="0.6" />
//           </linearGradient>
//           {/* Glow filter */}
//           <filter id="arc-glow" x="-20%" y="-20%" width="140%" height="140%">
//             <feGaussianBlur stdDeviation="3" result="blur" />
//             <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
//           </filter>
//           {/* Soft inner glow */}
//           <filter id="inner-glow">
//             <feGaussianBlur stdDeviation="6" result="blur" />
//             <feComposite in="SourceGraphic" in2="blur" operator="over" />
//           </filter>
//         </defs>

//         {/* ── Outermost subtle ring ── */}
//         <circle cx={cx} cy={cy} r={R.outer + 8}
//           fill="none" stroke="var(--border-subtle)" strokeWidth="0.5" />

//         {/* ── Pulsing ring ── */}
//         <motion.circle
//           cx={cx} cy={cy} r={R.pulse}
//           fill="none"
//           stroke="color-mix(in srgb, var(--accent) 15%, transparent)"
//           strokeWidth="1"
//           animate={reduce ? {} : { r: [R.pulse, R.pulse + 4, R.pulse], opacity: [0.4, 0.1, 0.4] }}
//           transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
//         />

//         {/* ── Track ring ── */}
//         <circle cx={cx} cy={cy} r={R.arc}
//           fill="none"
//           stroke="var(--bg-elevated)"
//           strokeWidth="14"
//         />

//         {/* ── Background arc fill (very subtle) ── */}
//         <circle cx={cx} cy={cy} r={R.arc}
//           fill="none"
//           stroke="color-mix(in srgb, var(--accent) 5%, transparent)"
//           strokeWidth="14"
//         />

//         {/* ── Progress arc — gradient ── */}
//         <motion.circle
//           cx={cx} cy={cy} r={R.arc}
//           fill="none"
//           stroke="url(#arc-grad)"
//           strokeWidth="14"
//           strokeLinecap="round"
//           strokeDasharray={circ(R.arc)}
//           initial={{ strokeDashoffset: circ(R.arc) }}
//           animate={inView ? { strokeDashoffset: offset(R.arc, score) } : { strokeDashoffset: circ(R.arc) }}
//           transition={{ duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
//           transform={`rotate(-90 ${cx} ${cy})`}
//           filter="url(#arc-glow)"
//         />

//         {/* ── Segment ticks outside arc ── */}
//         {ticks.map((i) => {
//           const angle = (i / ticks.length) * 360 - 90;
//           const r1 = R.outer + 1, r2 = R.outer + 7;
//           const x1 = cx + r1 * Math.cos(angle * Math.PI / 180);
//           const y1 = cy + r1 * Math.sin(angle * Math.PI / 180);
//           const x2 = cx + r2 * Math.cos(angle * Math.PI / 180);
//           const y2 = cy + r2 * Math.sin(angle * Math.PI / 180);
//           return (
//             <motion.line
//               key={i}
//               x1={x1} y1={y1} x2={x2} y2={y2}
//               stroke={i < filled ? "var(--accent)" : "var(--border-subtle)"}
//               strokeWidth={i < filled ? "2" : "1"}
//               strokeLinecap="round"
//               initial={{ opacity: 0 }}
//               animate={inView ? { opacity: 1 } : {}}
//               transition={{ duration: 0.15, delay: 0.4 + i * 0.03 }}
//             />
//           );
//         })}

//         {/* ── Middle concentric ring ── */}
//         <circle cx={cx} cy={cy} r={R.mid}
//           fill="none"
//           stroke="var(--border-subtle)"
//           strokeWidth="1"
//           strokeDasharray="2 4"
//         />

//         {/* ── Inner filled circle ── */}
//         <circle cx={cx} cy={cy} r={R.inner}
//           fill="color-mix(in srgb, var(--bg-base) 95%, var(--accent) 5%)"
//         />

//         {/* ── Arc endpoint dot ── */}
//         {(() => {
//           const angle = (score / 100) * 360 - 90;
//           const x = cx + R.arc * Math.cos(angle * Math.PI / 180);
//           const y = cy + R.arc * Math.sin(angle * Math.PI / 180);
//           return (
//             <motion.circle
//               cx={x} cy={y} r="7"
//               fill="var(--accent)"
//               initial={{ scale: 0, opacity: 0 }}
//               animate={inView ? { scale: 1, opacity: 1 } : {}}
//               transition={{ duration: 0.35, delay: 1.5, ease: "backOut" }}
//               style={{ transformOrigin: `${x}px ${y}px`, filter: "drop-shadow(0 0 6px rgba(0,212,170,0.8))" }}
//             />
//           );
//         })()}

//         {/* ── Center content via foreignObject ── */}
//         <foreignObject x={cx - 58} y={cy - 56} width="116" height="112">
//           <div style={{
//             display: "flex", flexDirection: "column",
//             alignItems: "center", justifyContent: "center",
//             height: "100%",
//           }}>
//             {/* Score label */}
//             <div style={{
//               fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
//               letterSpacing: "0.12em", textTransform: "uppercase",
//               color: "var(--text-muted)", marginBottom: 4,
//             }}>READINESS</div>

//             {/* Score number */}
//             <div style={{
//               fontFamily: "var(--font-mono)",
//               fontSize: 46,
//               fontWeight: 700,
//               letterSpacing: "-0.06em",
//               color: "var(--accent)",
//               lineHeight: 1,
//               textShadow: "0 0 24px rgba(0,212,170,0.4)",
//             }}>
//               {inView ? <AnimatedNumber to={score} duration={1.4} delay={0.3} /> : 0}
//             </div>

//             <div style={{
//               fontFamily: "var(--font-mono)", fontSize: 11,
//               color: "var(--text-muted)", marginTop: 2,
//             }}>/ 100</div>

//             {/* Status */}
//             <motion.div
//               initial={{ opacity: 0, y: 4 }}
//               animate={inView ? { opacity: 1, y: 0 } : {}}
//               transition={{ duration: 0.35, delay: 1.4, ease: "backOut" }}
//               style={{
//                 marginTop: 10,
//                 fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
//                 color: "var(--accent)",
//                 background: "var(--accent-muted)",
//                 border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
//                 borderRadius: "var(--radius-pill)",
//                 padding: "3px 12px",
//                 letterSpacing: "0.08em",
//                 textTransform: "uppercase",
//               }}
//             >
//               On Track
//             </motion.div>
//           </div>
//         </foreignObject>
//       </svg>
//     </div>
//   );
// }

// // ─── Signal bars ──────────────────────────────────────────────────────────────
// const SIGNALS = [
//   { label: "Consistency",          value: 50, color: "var(--accent)",  detail: "7 of last 14 days active"       },
//   { label: "Difficulty Spread",    value: 95, color: "var(--accent)",  detail: "14 medium/hard of 21 total"     },
//   { label: "Avg Confidence",       value: 72, color: "var(--medium)",  detail: "72% across all solved problems" },
//   { label: "Revision Discipline",  value: 57, color: "var(--medium)",  detail: "9 problems flagged for review"  },
// ];

// function SignalBars({ inView }: { inView: boolean }) {
//   const [hovered, setHovered] = useState<number | null>(null);
//   const reduce = useReducedMotion();

//   return (
//     <div>
//       {SIGNALS.map((sig, i) => (
//         <motion.div
//           key={sig.label}
//           initial={{ opacity: 0, x: reduce ? 0 : -16 }}
//           animate={inView ? { opacity: 1, x: 0 } : {}}
//           transition={{ duration: 0.45, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
//           onMouseEnter={() => setHovered(i)}
//           onMouseLeave={() => setHovered(null)}
//           style={{
//             padding: "14px 20px",
//             borderBottom: i < SIGNALS.length - 1 ? "1px solid var(--border-subtle)" : "none",
//             background: hovered === i ? "color-mix(in srgb, var(--bg-elevated) 60%, transparent)" : "transparent",
//             transition: "background var(--transition-fast)",
//             cursor: "default",
//           }}
//         >
//           <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
//             <div>
//               <div style={{
//                 fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
//                 color: "var(--text-primary)", letterSpacing: "-0.01em",
//               }}>{sig.label}</div>
//               <motion.div
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={hovered === i ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
//                 transition={{ duration: 0.18 }}
//                 style={{ overflow: "hidden" }}
//               >
//                 <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>
//                   {sig.detail}
//                 </div>
//               </motion.div>
//             </div>
//             <div style={{
//               fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700,
//               letterSpacing: "-0.04em", color: sig.color, lineHeight: 1,
//             }}>
//               {inView ? <AnimatedNumber to={sig.value} duration={0.9} delay={0.2 + i * 0.1} /> : 0}
//             </div>
//           </div>

//           {/* Bar */}
//           <div style={{ height: 4, background: "var(--bg-elevated)", borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
//             <motion.div
//               initial={{ width: 0 }}
//               animate={inView ? { width: `${sig.value}%` } : { width: 0 }}
//               transition={{ duration: 1.0, delay: 0.25 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
//               style={{
//                 height: "100%", borderRadius: "var(--radius-pill)",
//                 background: hovered === i
//                   ? `linear-gradient(90deg, ${sig.color}, color-mix(in srgb, ${sig.color} 60%, #00e8c4))`
//                   : sig.color,
//                 boxShadow: hovered === i ? `0 0 10px color-mix(in srgb, ${sig.color} 50%, transparent)` : "none",
//                 transition: "background var(--transition-fast), box-shadow var(--transition-fast)",
//               }}
//             />
//           </div>
//         </motion.div>
//       ))}
//     </div>
//   );
// }

// // ─── Section ──────────────────────────────────────────────────────────────────
// export default function AnalyticsPreview() {
//   const sectionRef = useRef<HTMLDivElement>(null);
//   const inView = useInView(sectionRef, { once: true, margin: "-80px" });
//   const titleRef = useRef<HTMLDivElement>(null);
//   const titleInView = useInView(titleRef, { once: true, margin: "-60px" });
//   const reduce = useReducedMotion();

//   return (
//     <>
//       <style>{`
//         /* ── Outer section wrapper ── */
//         .analytics-outer {
//           padding: 80px clamp(16px, 4vw, 40px);
//           position: relative;
//         }

//         /* ── Elevated container — this IS the section ── */
//         .analytics-container {
//           max-width: 1100px;
//           margin: 0 auto;
//           background: var(--bg-surface);
//           border: 1px solid var(--border-mid);
//           border-radius: var(--radius-xl);
//           overflow: hidden;
//           position: relative;
//         }

//         /* Teal gradient top border */
//         .analytics-container::before {
//           content: "";
//           position: absolute;
//           top: 0; left: 0; right: 0;
//           height: 1px;
//           background: linear-gradient(
//             90deg,
//             transparent 0%,
//             color-mix(in srgb, var(--accent) 50%, transparent) 35%,
//             color-mix(in srgb, var(--accent) 80%, transparent) 50%,
//             color-mix(in srgb, var(--accent) 50%, transparent) 65%,
//             transparent 100%
//           );
//           z-index: 2;
//         }

//         /* Deep ambient glow inside the container */
//         .analytics-container::after {
//           content: "";
//           position: absolute;
//           top: -60px; left: 50%; transform: translateX(-50%);
//           width: 600px; height: 300px;
//           background: radial-gradient(ellipse, rgba(0,212,170,0.07) 0%, transparent 70%);
//           pointer-events: none;
//           z-index: 0;
//         }

//         /* ── Header inside container ── */
//         .analytics-header {
//           padding: 40px 48px 36px;
//           border-bottom: 1px solid var(--border-subtle);
//           display: flex;
//           align-items: flex-end;
//           justify-content: space-between;
//           gap: 24px;
//           position: relative;
//           z-index: 1;
//         }

//         /* ── Body grid ── */
//         .analytics-body {
//           display: grid;
//           grid-template-columns: 1fr 1.1fr;
//           position: relative;
//           z-index: 1;
//         }

//         /* Left column: signals */
//         .analytics-signals {
//           border-right: 1px solid var(--border-subtle);
//         }

//         /* Right column: gauge + extras */
//         .analytics-gauge-col {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           padding: 48px 40px;
//           gap: 28px;
//           background: color-mix(in srgb, var(--bg-elevated) 40%, transparent);
//           position: relative;
//           overflow: hidden;
//         }

//         /* Subtle radial in the gauge column */
//         .analytics-gauge-col::before {
//           content: "";
//           position: absolute;
//           inset: 0;
//           background: radial-gradient(ellipse at 50% 40%, rgba(0,212,170,0.05) 0%, transparent 65%);
//           pointer-events: none;
//         }

//         /* ── Responsive ── */
//         @media (max-width: 860px) {
//           .analytics-header { padding: 28px 24px 24px; flex-direction: column; align-items: flex-start; }
//           .analytics-body   { grid-template-columns: 1fr; }
//           .analytics-signals { border-right: none; border-bottom: 1px solid var(--border-subtle); }
//           .analytics-gauge-col { padding: 36px 24px; }
//         }

//         @media (max-width: 480px) {
//           .analytics-outer { padding: 60px 16px; }
//         }
//       `}</style>

//       <div className="analytics-outer">
//         <div ref={sectionRef} className="analytics-container">

//           {/* ── Header ──────────────────────────────────────── */}
//           <motion.div
//             ref={titleRef}
//             className="analytics-header"
//             initial={{ opacity: 0, y: reduce ? 0 : 16 }}
//             animate={titleInView ? { opacity: 1, y: 0 } : {}}
//             transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
//           >
//             <div>
//               <div style={{
//                 display: "inline-flex", alignItems: "center", gap: 7,
//                 fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
//                 letterSpacing: "0.12em", textTransform: "uppercase",
//                 color: "var(--text-muted)", marginBottom: 14,
//               }}>
//                 <div style={{ width: 16, height: 1, background: "var(--border-strong)" }} />
//                 Analytics
//               </div>

//               <h2 style={{
//                 fontFamily: "var(--font-sans)",
//                 fontSize: "clamp(22px, 3vw, 36px)",
//                 fontWeight: 700, letterSpacing: "-0.03em",
//                 color: "var(--text-primary)", lineHeight: 1.15,
//                 margin: 0, maxWidth: 480,
//               }}>
//                 Know if you're ready.{" "}
//                 <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
//                   Not just how many you've solved.
//                 </span>
//               </h2>

//               <p style={{
//                 fontFamily: "var(--font-sans)", fontSize: 14,
//                 color: "var(--text-secondary)", lineHeight: 1.7,
//                 maxWidth: 420, margin: "14px 0 0",
//               }}>
//                 Four signals combined into one honest score. Consistency, difficulty spread,
//                 confidence, and revision discipline — updated after every solve.
//               </p>
//             </div>

//             {/* Live badge */}
//             <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", background: "var(--accent-muted)", border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)", borderRadius: "var(--radius-pill)" }}>
//               <motion.div
//                 animate={reduce ? {} : { scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
//                 transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
//                 style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 6px var(--accent)" }}
//               />
//               <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.05em" }}>
//                 Live score
//               </span>
//             </div>
//           </motion.div>

//           {/* ── Body ────────────────────────────────────────── */}
//           <div className="analytics-body">

//             {/* Left: Signal bars */}
//             <motion.div
//               className="analytics-signals"
//               initial={{ opacity: 0, x: reduce ? 0 : -20 }}
//               animate={inView ? { opacity: 1, x: 0 } : {}}
//               transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
//             >
//               {/* Signals header */}
//               <div style={{
//                 padding: "16px 20px 12px",
//                 borderBottom: "1px solid var(--border-subtle)",
//                 display: "flex", alignItems: "center", justifyContent: "space-between",
//               }}>
//                 <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>
//                   Signal breakdown
//                 </span>
//                 <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-subtle)" }}>
//                   25pts each
//                 </span>
//               </div>

//               <SignalBars inView={inView} />

//               {/* Footer nudge */}
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={inView ? { opacity: 1 } : {}}
//                 transition={{ duration: 0.4, delay: 0.9 }}
//                 style={{
//                   padding: "14px 20px",
//                   borderTop: "1px solid var(--border-subtle)",
//                   display: "flex", alignItems: "center", gap: 8,
//                   background: "color-mix(in srgb, var(--medium) 5%, transparent)",
//                 }}
//               >
//                 <div style={{
//                   width: 24, height: 24, borderRadius: "var(--radius-md)", flexShrink: 0,
//                   background: "color-mix(in srgb, var(--medium) 12%, transparent)",
//                   border: "1px solid color-mix(in srgb, var(--medium) 25%, transparent)",
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                 }}>
//                   <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
//                     <circle cx="5.5" cy="5.5" r="4.5" stroke="var(--medium)" strokeWidth="1.1" />
//                     <path d="M5.5 3.5v2.5" stroke="var(--medium)" strokeWidth="1.1" strokeLinecap="round" />
//                     <circle cx="5.5" cy="8" r="0.5" fill="var(--medium)" />
//                   </svg>
//                 </div>
//                 <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", lineHeight: 1.5 }}>
//                   Push harder on medium/hard — difficulty spread is your strongest signal.
//                 </span>
//               </motion.div>
//             </motion.div>

//             {/* Right: Gauge column */}
//             <motion.div
//               className="analytics-gauge-col"
//               initial={{ opacity: 0, x: reduce ? 0 : 20 }}
//               animate={inView ? { opacity: 1, x: 0 } : {}}
//               transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
//             >
//               {/* Floating gauge */}
//               <motion.div
//                 animate={reduce ? {} : { y: [0, -7, 0] }}
//                 transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
//                 style={{ position: "relative", zIndex: 1 }}
//               >
//                 <PremiumGauge inView={inView} />
//               </motion.div>

//               {/* Mini stat row */}
//               <motion.div
//                 initial={{ opacity: 0, y: reduce ? 0 : 10 }}
//                 animate={inView ? { opacity: 1, y: 0 } : {}}
//                 transition={{ duration: 0.4, delay: 0.65 }}
//                 style={{
//                   display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
//                   gap: 8, width: "100%", position: "relative", zIndex: 1,
//                 }}
//               >
//                 {[
//                   { label: "Solved",    value: 21, suffix: "",  color: "var(--accent)"  },
//                   { label: "Avg conf.", value: 72, suffix: "%", color: "var(--medium)"  },
//                   { label: "Streak",   value: 4,  suffix: "d", color: "#f97316"         },
//                 ].map((stat, i) => (
//                   <div key={stat.label} style={{
//                     padding: "12px 10px", textAlign: "center" as const,
//                     background: "var(--bg-surface)",
//                     border: "1px solid var(--border-subtle)",
//                     borderRadius: "var(--radius-md)",
//                     transition: "border-color var(--transition-fast)",
//                   }}>
//                     <div style={{
//                       fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700,
//                       color: stat.color, letterSpacing: "-0.04em", lineHeight: 1,
//                     }}>
//                       {inView ? <AnimatedNumber to={stat.value} duration={0.9} delay={0.6 + i * 0.1} /> : 0}
//                       {stat.suffix}
//                     </div>
//                     <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", marginTop: 4 }}>
//                       {stat.label}
//                     </div>
//                   </div>
//                 ))}
//               </motion.div>

//               {/* Focus recommendation */}
//               <motion.div
//                 initial={{ opacity: 0, y: reduce ? 0 : 8 }}
//                 animate={inView ? { opacity: 1, y: 0 } : {}}
//                 transition={{ duration: 0.4, delay: 0.8 }}
//                 style={{
//                   width: "100%",
//                   padding: "14px 16px",
//                   background: "var(--bg-surface)",
//                   border: "1px solid var(--border-subtle)",
//                   borderRadius: "var(--radius-lg)",
//                   display: "flex", alignItems: "flex-start", gap: 10,
//                   position: "relative", zIndex: 1,
//                 }}
//               >
//                 <div style={{
//                   width: 28, height: 28, borderRadius: "var(--radius-md)", flexShrink: 0,
//                   background: "color-mix(in srgb, var(--hard) 10%, transparent)",
//                   border: "1px solid color-mix(in srgb, var(--hard) 25%, transparent)",
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                 }}>
//                   <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//                     <path d="M6 1L11 10H1L6 1Z" stroke="var(--hard)" strokeWidth="1.2" strokeLinejoin="round" />
//                     <path d="M6 4.5v2.5" stroke="var(--hard)" strokeWidth="1.2" strokeLinecap="round" />
//                     <circle cx="6" cy="8.5" r="0.5" fill="var(--hard)" />
//                   </svg>
//                 </div>
//                 <div>
//                   <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>
//                     Focus: Dynamic Programming
//                   </div>
//                   <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", lineHeight: 1.55 }}>
//                     0 problems attempted · weakest untouched pattern
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Link */}
//               <motion.a
//                 href="/dashboard/analytics"
//                 initial={{ opacity: 0 }}
//                 animate={inView ? { opacity: 1 } : {}}
//                 transition={{ duration: 0.4, delay: 0.95 }}
//                 whileHover={reduce ? {} : { gap: "10px" } as never}
//                 style={{
//                   fontFamily: "var(--font-mono)", fontSize: 11,
//                   color: "var(--accent)", textDecoration: "none",
//                   display: "flex", alignItems: "center", gap: 5,
//                   transition: "gap var(--transition-fast)",
//                   position: "relative", zIndex: 1,
//                 }}
//               >
//                 See full analytics dashboard
//                 <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//                   <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
//                 </svg>
//               </motion.a>
//             </motion.div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }



// "use client";

// import { useRef, useState, useEffect } from "react";
// import { motion, useInView, useReducedMotion, animate } from "framer-motion";

// // ─── Animated number ──────────────────────────────────────────────────────────
// function AnimatedNumber({
//   to,
//   duration = 1.2,
//   delay = 0,
// }: {
//   to: number;
//   duration?: number;
//   delay?: number;
// }) {
//   const [val, setVal] = useState(0);
//   const ref = useRef<HTMLSpanElement>(null);
//   const inView = useInView(ref, { once: true, margin: "-60px" });
//   const reduce = useReducedMotion();

//   useEffect(() => {
//     if (!inView) return;
//     if (reduce) { setVal(to); return; }
//     const c = animate(0, to, {
//       duration, delay,
//       ease: [0.22, 1, 0.36, 1],
//       onUpdate: (v) => setVal(Math.round(v)),
//     });
//     return () => c.stop();
//   }, [inView, to, duration, delay, reduce]);

//   return <span ref={ref}>{val}</span>;
// }

// // ─── Premium gauge ────────────────────────────────────────────────────────────
// function PremiumGauge({ inView }: { inView: boolean }) {
//   const reduce = useReducedMotion();
//   const score = 69;
//   const SIZE = 260;
//   const cx = SIZE / 2, cy = SIZE / 2;
//   const R = {
//     outer:  104,
//     arc:     92,
//     mid:     80,
//     inner:   62,
//     pulse:  112,
//   };

//   const circ = (r: number) => 2 * Math.PI * r;
//   const offset = (r: number, pct: number) => circ(r) * (1 - pct / 100);

//   // 24 tick marks around the outer ring
//   const ticks = Array.from({ length: 24 }, (_, i) => i);
//   const filled = Math.round((score / 100) * 24);

//   return (
//     <div style={{ position: "relative", width: SIZE, height: SIZE }}>

//       {/* Layered glow halos */}
//       {[140, 100, 70].map((size, i) => (
//         <motion.div
//           key={i}
//           style={{
//             position: "absolute",
//             top: "50%", left: "50%",
//             transform: "translate(-50%,-50%)",
//             width: size, height: size,
//             borderRadius: "50%",
//             background: `radial-gradient(circle, rgba(0,212,170,${0.14 - i * 0.04}) 0%, transparent 70%)`,
//             pointerEvents: "none",
//           }}
//           animate={reduce ? {} : {
//             scale: [1, 1 + i * 0.03 + 0.02, 1],
//             opacity: [0.7, 1, 0.7],
//           }}
//           transition={{
//             duration: 3 + i * 0.8,
//             repeat: Infinity,
//             ease: "easeInOut",
//             delay: i * 0.4,
//           }}
//         />
//       ))}

//       <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ position: "relative", zIndex: 1, overflow: "visible" }}>
//         <defs>
//           {/* Gradient arc: teal → cyan */}
//           <linearGradient id="arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
//             <stop offset="0%"   stopColor="#00d4aa" />
//             <stop offset="60%"  stopColor="#00e8c4" />
//             <stop offset="100%" stopColor="#00d4aa" stopOpacity="0.6" />
//           </linearGradient>
//           {/* Glow filter */}
//           <filter id="arc-glow" x="-20%" y="-20%" width="140%" height="140%">
//             <feGaussianBlur stdDeviation="3" result="blur" />
//             <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
//           </filter>
//           {/* Soft inner glow */}
//           <filter id="inner-glow">
//             <feGaussianBlur stdDeviation="6" result="blur" />
//             <feComposite in="SourceGraphic" in2="blur" operator="over" />
//           </filter>
//         </defs>

//         {/* ── Outermost subtle ring ── */}
//         <circle cx={cx} cy={cy} r={R.outer + 8}
//           fill="none" stroke="var(--border-subtle)" strokeWidth="0.5" />

//         {/* ── Pulsing ring ── */}
//         <motion.circle
//           cx={cx} cy={cy} r={R.pulse}
//           fill="none"
//           stroke="color-mix(in srgb, var(--accent) 15%, transparent)"
//           strokeWidth="1"
//           animate={reduce ? {} : { r: [R.pulse, R.pulse + 4, R.pulse], opacity: [0.4, 0.1, 0.4] }}
//           transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
//         />

//         {/* ── Track ring ── */}
//         <circle cx={cx} cy={cy} r={R.arc}
//           fill="none"
//           stroke="var(--bg-elevated)"
//           strokeWidth="14"
//         />

//         {/* ── Background arc fill (very subtle) ── */}
//         <circle cx={cx} cy={cy} r={R.arc}
//           fill="none"
//           stroke="color-mix(in srgb, var(--accent) 5%, transparent)"
//           strokeWidth="14"
//         />

//         {/* ── Progress arc — gradient ── */}
//         <motion.circle
//           cx={cx} cy={cy} r={R.arc}
//           fill="none"
//           stroke="url(#arc-grad)"
//           strokeWidth="14"
//           strokeLinecap="round"
//           strokeDasharray={circ(R.arc)}
//           initial={{ strokeDashoffset: circ(R.arc) }}
//           animate={inView ? { strokeDashoffset: offset(R.arc, score) } : { strokeDashoffset: circ(R.arc) }}
//           transition={{ duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
//           transform={`rotate(-90 ${cx} ${cy})`}
//           filter="url(#arc-glow)"
//         />

//         {/* ── Segment ticks outside arc ── */}
//         {ticks.map((i) => {
//           const angle = (i / ticks.length) * 360 - 90;
//           const r1 = R.outer + 1, r2 = R.outer + 7;
//           const x1 = cx + r1 * Math.cos(angle * Math.PI / 180);
//           const y1 = cy + r1 * Math.sin(angle * Math.PI / 180);
//           const x2 = cx + r2 * Math.cos(angle * Math.PI / 180);
//           const y2 = cy + r2 * Math.sin(angle * Math.PI / 180);
//           return (
//             <motion.line
//               key={i}
//               x1={x1} y1={y1} x2={x2} y2={y2}
//               stroke={i < filled ? "var(--accent)" : "var(--border-subtle)"}
//               strokeWidth={i < filled ? "2" : "1"}
//               strokeLinecap="round"
//               initial={{ opacity: 0 }}
//               animate={inView ? { opacity: 1 } : {}}
//               transition={{ duration: 0.15, delay: 0.4 + i * 0.03 }}
//             />
//           );
//         })}

//         {/* ── Middle concentric ring ── */}
//         <circle cx={cx} cy={cy} r={R.mid}
//           fill="none"
//           stroke="var(--border-subtle)"
//           strokeWidth="1"
//           strokeDasharray="2 4"
//         />

//         {/* ── Inner filled circle ── */}
//         <circle cx={cx} cy={cy} r={R.inner}
//           fill="color-mix(in srgb, var(--bg-base) 95%, var(--accent) 5%)"
//         />

//         {/* ── Arc endpoint dot ── */}
//         {(() => {
//           const angle = (score / 100) * 360 - 90;
//           const x = cx + R.arc * Math.cos(angle * Math.PI / 180);
//           const y = cy + R.arc * Math.sin(angle * Math.PI / 180);
//           return (
//             <motion.circle
//               cx={x} cy={y} r="7"
//               fill="var(--accent)"
//               initial={{ scale: 0, opacity: 0 }}
//               animate={inView ? { scale: 1, opacity: 1 } : {}}
//               transition={{ duration: 0.35, delay: 1.5, ease: "backOut" }}
//               style={{ transformOrigin: `${x}px ${y}px`, filter: "drop-shadow(0 0 6px rgba(0,212,170,0.8))" }}
//             />
//           );
//         })()}

//         {/* ── Center content via foreignObject ── */}
//         <foreignObject x={cx - 58} y={cy - 56} width="116" height="112">
//           <div style={{
//             display: "flex", flexDirection: "column",
//             alignItems: "center", justifyContent: "center",
//             height: "100%",
//           }}>
//             {/* Score label */}
//             <div style={{
//               fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
//               letterSpacing: "0.12em", textTransform: "uppercase",
//               color: "var(--text-muted)", marginBottom: 4,
//             }}>READINESS</div>

//             {/* Score number */}
//             <div style={{
//               fontFamily: "var(--font-mono)",
//               fontSize: 46,
//               fontWeight: 700,
//               letterSpacing: "-0.06em",
//               color: "var(--accent)",
//               lineHeight: 1,
//               textShadow: "0 0 24px rgba(0,212,170,0.4)",
//             }}>
//               {inView ? <AnimatedNumber to={score} duration={1.4} delay={0.3} /> : 0}
//             </div>

//             <div style={{
//               fontFamily: "var(--font-mono)", fontSize: 11,
//               color: "var(--text-muted)", marginTop: 2,
//             }}>/ 100</div>

//             {/* Status */}
//             <motion.div
//               initial={{ opacity: 0, y: 4 }}
//               animate={inView ? { opacity: 1, y: 0 } : {}}
//               transition={{ duration: 0.35, delay: 1.4, ease: "backOut" }}
//               style={{
//                 marginTop: 10,
//                 fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
//                 color: "var(--accent)",
//                 background: "var(--accent-muted)",
//                 border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
//                 borderRadius: "var(--radius-pill)",
//                 padding: "3px 12px",
//                 letterSpacing: "0.08em",
//                 textTransform: "uppercase",
//               }}
//             >
//               On Track
//             </motion.div>
//           </div>
//         </foreignObject>
//       </svg>
//     </div>
//   );
// }

// // ─── Score sparkline ──────────────────────────────────────────────────────────
// function ScoreSparkline({ inView }: { inView: boolean }) {
//   const reduce = useReducedMotion();
//   const lineRef = useRef<SVGPathElement>(null);

//   // 7 data points — score trending upward over 14 days
//   const scores = [58, 59, 61, 60, 64, 66, 69];
//   const W = 520, H = 60;
//   const minS = 55, maxS = 72;
//   const pad = { left: 4, right: 4 };

//   const toX = (i: number) =>
//     pad.left + (i / (scores.length - 1)) * (W - pad.left - pad.right);
//   const toY = (v: number) =>
//     H - 4 - ((v - minS) / (maxS - minS)) * (H - 12);

//   const pathD = scores
//     .map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`)
//     .join(" ");

//   const areaD =
//     pathD +
//     ` L${toX(scores.length - 1)},${H} L${toX(0)},${H} Z`;

//   useEffect(() => {
//     if (!inView || reduce) return;
//     const el = lineRef.current;
//     if (!el) return;
//     const len = el.getTotalLength();
//     el.style.strokeDasharray = `${len}`;
//     el.style.strokeDashoffset = `${len}`;
//     const start = performance.now() + 200;
//     const dur = 1200;
//     const tick = (now: number) => {
//       const t = Math.min(Math.max(0, now - start) / dur, 1);
//       const e = 1 - Math.pow(1 - t, 3);
//       el.style.strokeDashoffset = `${len * (1 - e)}`;
//       if (t < 1) requestAnimationFrame(tick);
//     };
//     requestAnimationFrame(tick);
//   }, [inView, reduce]);

//   return (
//     <div style={{ position: "relative" }}>
//       <svg
//         viewBox={`0 0 ${W} ${H}`}
//         width="100%"
//         style={{ overflow: "visible", display: "block" }}
//       >
//         <defs>
//           <linearGradient id="spark-area" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="0%"   stopColor="var(--accent)" stopOpacity="0.18" />
//             <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"    />
//           </linearGradient>
//         </defs>

//         {/* Horizontal reference lines */}
//         {[60, 65, 70].map((v) => {
//           const y = toY(v);
//           return (
//             <g key={v}>
//               <line
//                 x1={pad.left} y1={y} x2={W - pad.right} y2={y}
//                 stroke="var(--border-subtle)" strokeWidth="0.5"
//                 strokeDasharray="3 4"
//               />
//               <text
//                 x={pad.left - 2} y={y + 3}
//                 fontSize="8" fill="var(--text-subtle)"
//                 textAnchor="end" fontFamily="var(--font-mono)"
//               >{v}</text>
//             </g>
//           );
//         })}

//         {/* Area fill — fades in after line draws */}
//         <motion.path
//           d={areaD}
//           fill="url(#spark-area)"
//           initial={{ opacity: 0 }}
//           animate={inView ? { opacity: 1 } : {}}
//           transition={{ duration: 0.6, delay: 1.0 }}
//         />

//         {/* Line — draws on scroll */}
//         <path
//           ref={lineRef}
//           d={pathD}
//           fill="none"
//           stroke="var(--accent)"
//           strokeWidth="2"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           style={{
//             strokeDasharray: reduce ? "none" : "9999",
//             strokeDashoffset: reduce ? "0" : "9999",
//             filter: "drop-shadow(0 0 4px rgba(0,212,170,0.5))",
//           }}
//         />

//         {/* Data point dots — appear after line */}
//         {scores.map((v, i) => {
//           const isLast = i === scores.length - 1;
//           return (
//             <motion.circle
//               key={i}
//               cx={toX(i)} cy={toY(v)} r={isLast ? 4 : 2.5}
//               fill={isLast ? "var(--accent)" : "var(--bg-surface)"}
//               stroke="var(--accent)"
//               strokeWidth={isLast ? 0 : 1.5}
//               initial={{ scale: 0, opacity: 0 }}
//               animate={inView ? { scale: 1, opacity: 1 } : {}}
//               transition={{
//                 duration: 0.25,
//                 delay: 0.9 + i * 0.06,
//                 ease: "backOut",
//               }}
//               style={{
//                 transformOrigin: `${toX(i)}px ${toY(v)}px`,
//                 filter: isLast ? "drop-shadow(0 0 5px rgba(0,212,170,0.8))" : "none",
//               }}
//             />
//           );
//         })}

//         {/* "Today" label above last dot */}
//         <motion.text
//           x={toX(scores.length - 1)}
//           y={toY(69) - 9}
//           fontSize="8.5"
//           fill="var(--accent)"
//           textAnchor="middle"
//           fontFamily="var(--font-mono)"
//           fontWeight="600"
//           initial={{ opacity: 0 }}
//           animate={inView ? { opacity: 1 } : {}}
//           transition={{ duration: 0.3, delay: 1.5 }}
//         >
//           69
//         </motion.text>
//       </svg>
//     </div>
//   );
// }

// // ─── Signal bars ──────────────────────────────────────────────────────────────
// const SIGNALS = [
//   { label: "Consistency",          value: 50, color: "var(--accent)",  detail: "7 of last 14 days active"       },
//   { label: "Difficulty Spread",    value: 95, color: "var(--accent)",  detail: "14 medium/hard of 21 total"     },
//   { label: "Avg Confidence",       value: 72, color: "var(--medium)",  detail: "72% across all solved problems" },
//   { label: "Revision Discipline",  value: 57, color: "var(--medium)",  detail: "9 problems flagged for review"  },
// ];

// function SignalBars({ inView }: { inView: boolean }) {
//   const [hovered, setHovered] = useState<number | null>(null);
//   const reduce = useReducedMotion();

//   return (
//     <div>
//       {SIGNALS.map((sig, i) => (
//         <motion.div
//           key={sig.label}
//           initial={{ opacity: 0, x: reduce ? 0 : -16 }}
//           animate={inView ? { opacity: 1, x: 0 } : {}}
//           transition={{ duration: 0.45, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
//           onMouseEnter={() => setHovered(i)}
//           onMouseLeave={() => setHovered(null)}
//           style={{
//             padding: "14px 20px",
//             borderBottom: i < SIGNALS.length - 1 ? "1px solid var(--border-subtle)" : "none",
//             background: hovered === i ? "color-mix(in srgb, var(--bg-elevated) 60%, transparent)" : "transparent",
//             transition: "background var(--transition-fast)",
//             cursor: "default",
//           }}
//         >
//           <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
//             <div>
//               <div style={{
//                 fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
//                 color: "var(--text-primary)", letterSpacing: "-0.01em",
//               }}>{sig.label}</div>
//               <motion.div
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={hovered === i ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
//                 transition={{ duration: 0.18 }}
//                 style={{ overflow: "hidden" }}
//               >
//                 <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>
//                   {sig.detail}
//                 </div>
//               </motion.div>
//             </div>
//             <div style={{
//               fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700,
//               letterSpacing: "-0.04em", color: sig.color, lineHeight: 1,
//             }}>
//               {inView ? <AnimatedNumber to={sig.value} duration={0.9} delay={0.2 + i * 0.1} /> : 0}
//             </div>
//           </div>

//           {/* Bar */}
//           <div style={{ height: 4, background: "var(--bg-elevated)", borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
//             <motion.div
//               initial={{ width: 0 }}
//               animate={inView ? { width: `${sig.value}%` } : { width: 0 }}
//               transition={{ duration: 1.0, delay: 0.25 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
//               style={{
//                 height: "100%", borderRadius: "var(--radius-pill)",
//                 background: hovered === i
//                   ? `linear-gradient(90deg, ${sig.color}, color-mix(in srgb, ${sig.color} 60%, #00e8c4))`
//                   : sig.color,
//                 boxShadow: hovered === i ? `0 0 10px color-mix(in srgb, ${sig.color} 50%, transparent)` : "none",
//                 transition: "background var(--transition-fast), box-shadow var(--transition-fast)",
//               }}
//             />
//           </div>
//         </motion.div>
//       ))}
//     </div>
//   );
// }

// // ─── Section ──────────────────────────────────────────────────────────────────
// export default function AnalyticsPreview() {
//   const sectionRef = useRef<HTMLDivElement>(null);
//   const inView = useInView(sectionRef, { once: true, margin: "-80px" });
//   const titleRef = useRef<HTMLDivElement>(null);
//   const titleInView = useInView(titleRef, { once: true, margin: "-60px" });
//   const reduce = useReducedMotion();

//   return (
//     <>
//       <style>{`
//         /* ── Outer section wrapper ── */
//         .analytics-outer {
//           padding: 80px clamp(16px, 4vw, 40px);
//           position: relative;
//         }

//         /* ── Elevated container — this IS the section ── */
//         .analytics-container {
//           max-width: 1100px;
//           margin: 0 auto;
//           background: var(--bg-surface);
//           border: 1px solid var(--border-mid);
//           border-radius: var(--radius-xl);
//           overflow: hidden;
//           position: relative;
//         }

//         /* Teal gradient top border */
//         .analytics-container::before {
//           content: "";
//           position: absolute;
//           top: 0; left: 0; right: 0;
//           height: 1px;
//           background: linear-gradient(
//             90deg,
//             transparent 0%,
//             color-mix(in srgb, var(--accent) 50%, transparent) 35%,
//             color-mix(in srgb, var(--accent) 80%, transparent) 50%,
//             color-mix(in srgb, var(--accent) 50%, transparent) 65%,
//             transparent 100%
//           );
//           z-index: 2;
//         }

//         /* Deep ambient glow inside the container */
//         .analytics-container::after {
//           content: "";
//           position: absolute;
//           top: -60px; left: 50%; transform: translateX(-50%);
//           width: 600px; height: 300px;
//           background: radial-gradient(ellipse, rgba(0,212,170,0.07) 0%, transparent 70%);
//           pointer-events: none;
//           z-index: 0;
//         }

//         /* ── Header inside container ── */
//         .analytics-header {
//           padding: 40px 48px 36px;
//           border-bottom: 1px solid var(--border-subtle);
//           display: flex;
//           align-items: flex-end;
//           justify-content: space-between;
//           gap: 24px;
//           position: relative;
//           z-index: 1;
//         }

//         /* ── Body grid ── */
//         .analytics-body {
//           display: grid;
//           grid-template-columns: 1fr 1.1fr;
//           position: relative;
//           z-index: 1;
//         }

//         /* Left column: signals */
//         .analytics-signals {
//           border-right: 1px solid var(--border-subtle);
//         }

//         /* Right column: gauge + extras */
//         .analytics-gauge-col {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           padding: 48px 40px;
//           gap: 28px;
//           background: color-mix(in srgb, var(--bg-elevated) 40%, transparent);
//           position: relative;
//           overflow: hidden;
//         }

//         /* Subtle radial in the gauge column */
//         .analytics-gauge-col::before {
//           content: "";
//           position: absolute;
//           inset: 0;
//           background: radial-gradient(ellipse at 50% 40%, rgba(0,212,170,0.05) 0%, transparent 65%);
//           pointer-events: none;
//         }

//         /* ── Responsive ── */
//         @media (max-width: 860px) {
//           .analytics-header { padding: 28px 24px 24px; flex-direction: column; align-items: flex-start; }
//           .analytics-body   { grid-template-columns: 1fr; }
//           .analytics-signals { border-right: none; border-bottom: 1px solid var(--border-subtle); }
//           .analytics-gauge-col { padding: 36px 24px; }
//         }

//         @media (max-width: 480px) {
//           .analytics-outer { padding: 60px 16px; }
//         }
//       `}</style>

//       <div className="analytics-outer">
//         <div ref={sectionRef} className="analytics-container">

//           {/* ── Header ──────────────────────────────────────── */}
//           <motion.div
//             ref={titleRef}
//             className="analytics-header"
//             initial={{ opacity: 0, y: reduce ? 0 : 16 }}
//             animate={titleInView ? { opacity: 1, y: 0 } : {}}
//             transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
//           >
//             <div>
//               <div style={{
//                 display: "inline-flex", alignItems: "center", gap: 7,
//                 fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
//                 letterSpacing: "0.12em", textTransform: "uppercase",
//                 color: "var(--text-muted)", marginBottom: 14,
//               }}>
//                 <div style={{ width: 16, height: 1, background: "var(--border-strong)" }} />
//                 Analytics
//               </div>

//               <h2 style={{
//                 fontFamily: "var(--font-sans)",
//                 fontSize: "clamp(22px, 3vw, 36px)",
//                 fontWeight: 700, letterSpacing: "-0.03em",
//                 color: "var(--text-primary)", lineHeight: 1.15,
//                 margin: 0, maxWidth: 480,
//               }}>
//                 Know if you're ready.{" "}
//                 <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
//                   Not just how many you've solved.
//                 </span>
//               </h2>

//               <p style={{
//                 fontFamily: "var(--font-sans)", fontSize: 14,
//                 color: "var(--text-secondary)", lineHeight: 1.7,
//                 maxWidth: 420, margin: "14px 0 0",
//               }}>
//                 Four signals combined into one honest score. Consistency, difficulty spread,
//                 confidence, and revision discipline — updated after every solve.
//               </p>
//             </div>

//             {/* Live badge */}
//             <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", background: "var(--accent-muted)", border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)", borderRadius: "var(--radius-pill)" }}>
//               <motion.div
//                 animate={reduce ? {} : { scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
//                 transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
//                 style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 6px var(--accent)" }}
//               />
//               <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.05em" }}>
//                 Live score
//               </span>
//             </div>
//           </motion.div>

//           {/* ── Body ────────────────────────────────────────── */}
//           <div className="analytics-body">

//             {/* Left: Signal bars */}
//             <motion.div
//               className="analytics-signals"
//               initial={{ opacity: 0, x: reduce ? 0 : -20 }}
//               animate={inView ? { opacity: 1, x: 0 } : {}}
//               transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
//             >
//               {/* Signals header */}
//               <div style={{
//                 padding: "16px 20px 12px",
//                 borderBottom: "1px solid var(--border-subtle)",
//                 display: "flex", alignItems: "center", justifyContent: "space-between",
//               }}>
//                 <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>
//                   Signal breakdown
//                 </span>
//                 <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-subtle)" }}>
//                   25pts each
//                 </span>
//               </div>

//               <SignalBars inView={inView} />

//               {/* Score history sparkline */}
//               <motion.div
//                 initial={{ opacity: 0, y: reduce ? 0 : 10 }}
//                 animate={inView ? { opacity: 1, y: 0 } : {}}
//                 transition={{ duration: 0.5, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
//                 style={{
//                   borderTop: "1px solid var(--border-subtle)",
//                   padding: "18px 20px 16px",
//                 }}
//               >
//                 <div style={{
//                   display: "flex", alignItems: "center",
//                   justifyContent: "space-between", marginBottom: 14,
//                 }}>
//                   <span style={{
//                     fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
//                     letterSpacing: "0.08em", textTransform: "uppercase" as const,
//                     color: "var(--text-muted)",
//                   }}>
//                     Score history
//                   </span>
//                   <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
//                     <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)" }}>+11</span>
//                     <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>last 14 days</span>
//                   </div>
//                 </div>

//                 <ScoreSparkline inView={inView} />

//                 {/* Day labels */}
//                 <div style={{
//                   display: "flex", justifyContent: "space-between",
//                   marginTop: 6, paddingLeft: 2, paddingRight: 2,
//                 }}>
//                   {["Feb 19", "Feb 22", "Feb 25", "Feb 28", "Mar 1", "Mar 3", "Today"].map((d) => (
//                     <span key={d} style={{
//                       fontFamily: "var(--font-mono)", fontSize: 8,
//                       color: d === "Today" ? "var(--accent)" : "var(--text-subtle)",
//                       fontWeight: d === "Today" ? 600 : 400,
//                     }}>{d}</span>
//                   ))}
//                 </div>
//               </motion.div>

//               {/* Footer nudge */}
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={inView ? { opacity: 1 } : {}}
//                 transition={{ duration: 0.4, delay: 1.0 }}
//                 style={{
//                   padding: "14px 20px",
//                   borderTop: "1px solid var(--border-subtle)",
//                   display: "flex", alignItems: "center", gap: 8,
//                   background: "color-mix(in srgb, var(--medium) 5%, transparent)",
//                 }}
//               >
//                 <div style={{
//                   width: 24, height: 24, borderRadius: "var(--radius-md)", flexShrink: 0,
//                   background: "color-mix(in srgb, var(--medium) 12%, transparent)",
//                   border: "1px solid color-mix(in srgb, var(--medium) 25%, transparent)",
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                 }}>
//                   <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
//                     <circle cx="5.5" cy="5.5" r="4.5" stroke="var(--medium)" strokeWidth="1.1" />
//                     <path d="M5.5 3.5v2.5" stroke="var(--medium)" strokeWidth="1.1" strokeLinecap="round" />
//                     <circle cx="5.5" cy="8" r="0.5" fill="var(--medium)" />
//                   </svg>
//                 </div>
//                 <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", lineHeight: 1.5 }}>
//                   Push harder on medium/hard — difficulty spread is your strongest signal.
//                 </span>
//               </motion.div>
//             </motion.div>

//             {/* Right: Gauge column */}
//             <motion.div
//               className="analytics-gauge-col"
//               initial={{ opacity: 0, x: reduce ? 0 : 20 }}
//               animate={inView ? { opacity: 1, x: 0 } : {}}
//               transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
//             >
//               {/* Floating gauge */}
//               <motion.div
//                 animate={reduce ? {} : { y: [0, -7, 0] }}
//                 transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
//                 style={{ position: "relative", zIndex: 1 }}
//               >
//                 <PremiumGauge inView={inView} />
//               </motion.div>

//               {/* Mini stat row */}
//               <motion.div
//                 initial={{ opacity: 0, y: reduce ? 0 : 10 }}
//                 animate={inView ? { opacity: 1, y: 0 } : {}}
//                 transition={{ duration: 0.4, delay: 0.65 }}
//                 style={{
//                   display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
//                   gap: 8, width: "100%", position: "relative", zIndex: 1,
//                 }}
//               >
//                 {[
//                   { label: "Solved",    value: 21, suffix: "",  color: "var(--accent)"  },
//                   { label: "Avg conf.", value: 72, suffix: "%", color: "var(--medium)"  },
//                   { label: "Streak",   value: 4,  suffix: "d", color: "#f97316"         },
//                 ].map((stat, i) => (
//                   <div key={stat.label} style={{
//                     padding: "12px 10px", textAlign: "center" as const,
//                     background: "var(--bg-surface)",
//                     border: "1px solid var(--border-subtle)",
//                     borderRadius: "var(--radius-md)",
//                     transition: "border-color var(--transition-fast)",
//                   }}>
//                     <div style={{
//                       fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700,
//                       color: stat.color, letterSpacing: "-0.04em", lineHeight: 1,
//                     }}>
//                       {inView ? <AnimatedNumber to={stat.value} duration={0.9} delay={0.6 + i * 0.1} /> : 0}
//                       {stat.suffix}
//                     </div>
//                     <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", marginTop: 4 }}>
//                       {stat.label}
//                     </div>
//                   </div>
//                 ))}
//               </motion.div>

//               {/* Focus recommendation */}
//               <motion.div
//                 initial={{ opacity: 0, y: reduce ? 0 : 8 }}
//                 animate={inView ? { opacity: 1, y: 0 } : {}}
//                 transition={{ duration: 0.4, delay: 0.8 }}
//                 style={{
//                   width: "100%",
//                   padding: "14px 16px",
//                   background: "var(--bg-surface)",
//                   border: "1px solid var(--border-subtle)",
//                   borderRadius: "var(--radius-lg)",
//                   display: "flex", alignItems: "flex-start", gap: 10,
//                   position: "relative", zIndex: 1,
//                 }}
//               >
//                 <div style={{
//                   width: 28, height: 28, borderRadius: "var(--radius-md)", flexShrink: 0,
//                   background: "color-mix(in srgb, var(--hard) 10%, transparent)",
//                   border: "1px solid color-mix(in srgb, var(--hard) 25%, transparent)",
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                 }}>
//                   <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//                     <path d="M6 1L11 10H1L6 1Z" stroke="var(--hard)" strokeWidth="1.2" strokeLinejoin="round" />
//                     <path d="M6 4.5v2.5" stroke="var(--hard)" strokeWidth="1.2" strokeLinecap="round" />
//                     <circle cx="6" cy="8.5" r="0.5" fill="var(--hard)" />
//                   </svg>
//                 </div>
//                 <div>
//                   <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>
//                     Focus: Dynamic Programming
//                   </div>
//                   <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", lineHeight: 1.55 }}>
//                     0 problems attempted · weakest untouched pattern
//                   </div>
//                 </div>
//               </motion.div>

//               {/* Link */}
//               <motion.a
//                 href="/dashboard/analytics"
//                 initial={{ opacity: 0 }}
//                 animate={inView ? { opacity: 1 } : {}}
//                 transition={{ duration: 0.4, delay: 0.95 }}
//                 whileHover={reduce ? {} : { gap: "10px" } as never}
//                 style={{
//                   fontFamily: "var(--font-mono)", fontSize: 11,
//                   color: "var(--accent)", textDecoration: "none",
//                   display: "flex", alignItems: "center", gap: 5,
//                   transition: "gap var(--transition-fast)",
//                   position: "relative", zIndex: 1,
//                 }}
//               >
//                 See full analytics dashboard
//                 <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
//                   <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
//                 </svg>
//               </motion.a>
//             </motion.div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }



