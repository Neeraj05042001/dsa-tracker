"use client";

import { useRef, useEffect, useState } from "react";
import { useInView, useReducedMotion, motion, animate } from "framer-motion";

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({
  to,
  suffix = "",
  duration = 1.6,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (reduce) { setDisplay(to); return; }
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  return <span ref={ref}>{display}{suffix}</span>;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const STATS = [
  {
    value: 200,
    suffix: "+",
    label: "Problems tracked",
    sublabel: "LeetCode & Codeforces combined",
    growing: true,
  },
  {
    value: 2,
    suffix: "",
    label: "Platforms",
    sublabel: "LeetCode · Codeforces",
    growing: false,
  },
  {
    value: 16,
    suffix: "",
    label: "DSA patterns",
    sublabel: "Foundations to advanced",
    growing: false,
  },
  {
    value: 2,
    suffix: " min",
    label: "To set up",
    sublabel: "Install, sign in, start solving",
    growing: false,
  },
];

// ─── StatsStrip ───────────────────────────────────────────────────────────────
export default function StatsStrip() {
  const reduce = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapperRef, { once: true, margin: "-60px" });

  return (
    <>
      <style>{`
        /* ── Layout ── */
        .stats-strip {
          position: relative;
          padding: 0 clamp(16px, 4vw, 40px);
        }

        /* ── Spinning border wrapper ── */
        .stats-border-ring {
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
          border-radius: var(--radius-xl);
          padding: 1.5px;           /* thickness of the animated border */
          overflow: hidden;
        }

        /* The rotating conic gradient that creates the "trailing light" effect */
        .stats-border-ring::before {
          content: "";
          position: absolute;
          /* Extend well outside to ensure full coverage when rotating */
          inset: -100%;
          background: conic-gradient(
            from 0deg,
            transparent       0%,
            transparent       55%,
            rgba(0,212,170,0.0)  58%,
            rgba(0,212,170,0.5)  68%,
            rgba(0,212,170,1.0)  75%,
            rgba(0,212,170,0.5)  82%,
            rgba(0,212,170,0.0)  88%,
            transparent       100%
          );
          animation: ${reduce ? "none" : "stats-spin 5s linear infinite"};
          will-change: transform;
        }

        @keyframes stats-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Card sits on top of the border ring ── */
        .stats-inner {
          position: relative;
          z-index: 1;
          border-radius: calc(var(--radius-xl) - 1.5px);
          background: var(--bg-surface);
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          overflow: hidden;
        }

        /* ── Cells ── */
        .stat-cell {
          padding: 32px 28px;
          position: relative;
          cursor: default;
        }

        /* Vertical divider — right edge of every cell except last */
        .stat-cell:not(:last-child)::after {
          content: "";
          position: absolute;
          right: 0; top: 20%; bottom: 20%;
          width: 1px;
          background: var(--border-subtle);
        }

        /* ── Value ── */
        .stat-value {
          font-family: var(--font-mono);
          font-size: clamp(30px, 3.2vw, 44px);
          font-weight: 700;
          letter-spacing: -0.04em;
          color: var(--text-primary);
          line-height: 1;
          margin-bottom: 8px;
          display: block;
          transition: text-shadow var(--transition-fast);
        }

        /* First stat value in accent colour */
        .stat-value-accent {
          color: var(--accent);
        }

        /* Hover: glow on value only — doesn't touch cell edges */
        .stat-cell:hover .stat-value {
          text-shadow: 0 0 20px rgba(0, 212, 170, 0.35);
        }
        .stat-cell:hover .stat-value-accent {
          text-shadow: 0 0 24px rgba(0, 212, 170, 0.55);
        }

        /* A very subtle teal bottom-indicator on hover — contained, clean */
        .stat-hover-indicator {
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 1.5px;
          background: var(--accent);
          border-radius: var(--radius-pill);
          opacity: 0;
          transform: scaleX(0.4);
          transition: opacity var(--transition-base), transform var(--transition-base);
        }
        .stat-cell:hover .stat-hover-indicator {
          opacity: 0.6;
          transform: scaleX(1);
        }

        /* ── Label & sublabel ── */
        .stat-label {
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
          margin-bottom: 4px;
        }

        .stat-sublabel {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        /* ── Growing badge ── */
        .stat-growing-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 8px;
          padding: 3px 8px;
          border-radius: var(--radius-pill);
          background: var(--accent-muted);
          border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 500;
          color: var(--accent);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        /* Pulsing dot inside badge */
        .growing-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--accent);
          animation: ${reduce ? "none" : "growing-pulse 2s ease-in-out infinite"};
          flex-shrink: 0;
        }

        @keyframes growing-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .stats-inner {
            grid-template-columns: repeat(2, 1fr);
          }
          .stat-cell {
            padding: 22px 20px;
          }
          .stat-cell:nth-child(2)::after,
          .stat-cell:nth-child(4)::after {
            display: none;
          }
          .stat-cell:nth-child(1),
          .stat-cell:nth-child(2) {
            border-bottom: 1px solid var(--border-subtle);
          }
        }

        @media (min-width: 641px) and (max-width: 900px) {
          .stats-inner {
            grid-template-columns: repeat(2, 1fr);
          }
          .stat-cell:nth-child(2)::after,
          .stat-cell:nth-child(4)::after {
            display: none;
          }
          .stat-cell:nth-child(1),
          .stat-cell:nth-child(2) {
            border-bottom: 1px solid var(--border-subtle);
          }
        }
      `}</style>

      <section className="stats-strip" aria-label="Key statistics">
        <div ref={wrapperRef} className="stats-border-ring">
          <div className="stats-inner">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="stat-cell"
                initial={{ opacity: 0, y: reduce ? 0 : 14 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: i * 0.09,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {/* Hover bottom indicator */}
                <div className="stat-hover-indicator" aria-hidden="true" />

                {/* Value */}
                <span className="stat-value">
                  <span className={i === 0 ? "stat-value-accent" : ""}>
                    <Counter
                      to={stat.value}
                      suffix={stat.suffix}
                      duration={1.4 + i * 0.1}
                    />
                  </span>
                </span>

                {/* Label */}
                <div className="stat-label">{stat.label}</div>

                {/* Sublabel */}
                <div className="stat-sublabel">{stat.sublabel}</div>

                {/* Growing badge — first stat only */}
                {stat.growing && (
                  <div className="stat-growing-badge" aria-label="growing metric">
                    <div className="growing-dot" aria-hidden="true" />
                    growing
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}