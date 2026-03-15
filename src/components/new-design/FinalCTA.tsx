"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";

const GDRIVE_LINK = "https://drive.google.com/drive/folders/1Qw2aYu2_Em0Pu_cMUhMcKGiPvjiQcsY7?usp=sharing";

// ─── Floating review cards — the "what you get" proof ────────────────────────
const REVIEW_CARDS = [
  {
    problem: "Two Sum",
    tag: "Hash Map",
    platform: "LC",
    platformColor: "var(--lc-color)",
    platformMuted: "var(--lc-muted)",
    conf: 3,
    confColor: "var(--accent)",
    due: "In 15 days",
    dueColor: "var(--accent)",
  },
  {
    problem: "Course Schedule",
    tag: "Topological Sort",
    platform: "LC",
    platformColor: "var(--lc-color)",
    platformMuted: "var(--lc-muted)",
    conf: 1,
    confColor: "var(--hard)",
    due: "Tomorrow",
    dueColor: "var(--hard)",
  },
  {
    problem: "Beautiful Matrix",
    tag: "Dynamic Prog.",
    platform: "CF",
    platformColor: "var(--cf-color)",
    platformMuted: "var(--cf-muted)",
    conf: 2,
    confColor: "var(--medium)",
    due: "In 6 days",
    dueColor: "var(--medium)",
  },
];

function ReviewCard({
  card,
  style,
  delay,
  inView,
}: {
  card: (typeof REVIEW_CARDS)[number];
  style: React.CSSProperties;
  delay: number;
  inView: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 20, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "absolute",
        ...style,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-mid)",
        borderRadius: "var(--radius-lg)",
        padding: "12px 14px",
        width: 200,
        boxShadow: "0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px var(--border-subtle)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 5, flexShrink: 0,
          background: card.platformMuted,
          border: `1px solid color-mix(in srgb, ${card.platformColor} 30%, transparent)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 700, color: card.platformColor }}>
            {card.platform}
          </span>
        </div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, color: "var(--text-primary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {card.problem}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>
          {card.tag}
        </span>
        <div style={{ display: "flex", gap: 2 }}>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: "50%",
              background: i < card.conf ? card.confColor : "var(--border-mid)",
            }} />
          ))}
        </div>
      </div>

      <div style={{
        marginTop: 8,
        display: "flex", alignItems: "center", gap: 5,
        padding: "4px 8px",
        background: `color-mix(in srgb, ${card.dueColor} 8%, transparent)`,
        border: `1px solid color-mix(in srgb, ${card.dueColor} 20%, transparent)`,
        borderRadius: "var(--radius-sm)",
      }}>
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <circle cx="4" cy="4" r="3.5" stroke={card.dueColor} strokeWidth="1" />
          <path d="M4 2v2.5l1.5 1" stroke={card.dueColor} strokeWidth="1" strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: card.dueColor }}>
          {card.due}
        </span>
      </div>
    </motion.div>
  );
}

// ─── FinalCTA ─────────────────────────────────────────────────────────────────
export default function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();

  return (
    <>
      <style>{`
        .finalcta-section {
          padding: 80px clamp(16px, 4vw, 40px) 100px;
          position: relative;
          overflow: hidden;
        }

        /* ── Container ── */
        .finalcta-container {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }

        /* Teal gradient top border */
        .finalcta-container::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            color-mix(in srgb, var(--accent) 60%, transparent) 30%,
            var(--accent) 50%,
            color-mix(in srgb, var(--accent) 60%, transparent) 70%,
            transparent 100%
          );
          z-index: 2;
        }

        /* ── Inner layout ── */
        .finalcta-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          min-height: 380px;
        }

        /* ── Left: copy ── */
        .finalcta-left {
          padding: 64px 56px 64px 56px;
          position: relative;
          z-index: 1;
        }

        /* ── Right: visual ── */
        .finalcta-right {
          position: relative;
          height: 380px;
          overflow: hidden;
          background: color-mix(in srgb, var(--bg-elevated) 60%, transparent);
          border-left: 1px solid var(--border-subtle);
        }

        /* Radial glow inside right panel */
        .finalcta-right::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at 50% 50%,
            rgba(0,212,170,0.08) 0%,
            transparent 65%
          );
          pointer-events: none;
        }

        /* ── CTA buttons ── */
        .finalcta-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 24px;
          border-radius: var(--radius-md);
          background: var(--accent);
          color: #0d0d0f;
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: all var(--transition-fast);
          cursor: pointer;
          border: none;
          white-space: nowrap;
        }
        .finalcta-primary:hover {
          background: var(--accent-hover);
          box-shadow: var(--shadow-accent);
          transform: translateY(-1px);
        }

        .finalcta-secondary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 12px 20px;
          border-radius: var(--radius-md);
          background: transparent;
          border: 1px solid var(--border-mid);
          color: var(--text-secondary);
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }
        .finalcta-secondary:hover {
          background: var(--bg-hover);
          border-color: var(--border-strong);
          color: var(--text-primary);
        }

        /* ── Responsive ── */
        @media (max-width: 800px) {
          .finalcta-inner {
            grid-template-columns: 1fr;
            min-height: unset;
          }
          .finalcta-right {
            height: 260px;
            border-left: none;
            border-top: 1px solid var(--border-subtle);
          }
          .finalcta-left {
            padding: 40px 28px;
          }
        }
      `}</style>

      <section className="finalcta-section" aria-label="Final call to action">
        <motion.div
          ref={ref}
          className="finalcta-container"
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: "var(--bg-surface)" }}
        >
          <div className="finalcta-inner">

            {/* ── Left: Copy ──────────────────────────────── */}
            <div className="finalcta-left">

              {/* Label */}
              <motion.div
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "var(--accent)", marginBottom: 20,
                }}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "var(--accent)",
                  boxShadow: "0 0 8px var(--accent)",
                  animation: reduce ? "none" : "cta-pulse 2s ease-in-out infinite",
                }} />
                Start retaining today
                <style>{`
                  @keyframes cta-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%       { opacity: 0.5; transform: scale(0.75); }
                  }
                `}</style>
              </motion.div>

              {/* Headline */}
              <motion.h2
                initial={{ opacity: 0, y: reduce ? 0 : 14 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.18 }}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(26px, 3vw, 38px)",
                  fontWeight: 700, letterSpacing: "-0.03em",
                  color: "var(--text-primary)", lineHeight: 1.15,
                  margin: "0 0 14px",
                }}
              >
                Stop solving problems<br />
                you've already solved.
              </motion.h2>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.26 }}
                style={{
                  fontFamily: "var(--font-sans)", fontSize: 14,
                  color: "var(--text-secondary)", lineHeight: 1.7,
                  margin: "0 0 32px", maxWidth: 380,
                }}
              >
                Install Memoize, solve your next problem, and let the algorithm
                remember it for you. It takes 2 minutes to set up and zero
                effort to maintain.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.33 }}
                style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}
              >
                <a href={GDRIVE_LINK} target="_blank" rel="noopener noreferrer" className="finalcta-primary">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="2.6" fill="currentColor" />
                    <path d="M7 4.4H12.5C11.6 2.6 9.5 1.4 7 1.4C4.5 1.4 2.4 2.6 1.5 4.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M2.4 5.5L5.2 9.8C5.7 10.6 6.3 11.2 7 11.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M11.6 5.5L8.8 9.8C8.3 10.6 7.7 11.2 7 11.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  Add to Chrome — Free
                </a>
                <Link href="/login" className="finalcta-secondary">
                  Open Dashboard
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </motion.div>

              {/* Microcopy */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.5 }}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  marginTop: 18, flexWrap: "wrap",
                }}
              >
                {["No credit card", "Manual install via chrome://extensions", "GitHub & Google auth"].map((item, i, arr) => (
                  <span key={item} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent)", opacity: 0.6, display: "inline-block", flexShrink: 0 }} />
                      {item}
                    </span>
                    {i < arr.length - 1 && (
                      <span style={{ width: 1, height: 10, background: "var(--border-subtle)", display: "inline-block" }} />
                    )}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* ── Right: Floating review cards ────────────── */}
            <div className="finalcta-right">
              {/* Center glow */}
              <div style={{
                position: "absolute", inset: 0,
                background: "radial-gradient(ellipse at 50% 50%, rgba(0,212,170,0.06) 0%, transparent 60%)",
                pointerEvents: "none",
              }} />

              {/* Dot grid inside right panel */}
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "radial-gradient(circle, rgba(0,212,170,0.12) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
                maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
                pointerEvents: "none",
              }} />

              {/* Cards */}
              {REVIEW_CARDS.map((card, i) => (
                <motion.div
                  key={card.problem}
                  animate={reduce ? {} : { y: [0, -(4 + i * 2), 0] }}
                  transition={{
                    duration: 4 + i * 0.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.6,
                  }}
                  style={{ position: "absolute", ...cardPositions[i] }}
                >
                  <ReviewCard
                    card={card}
                    style={{}}
                    delay={0.3 + i * 0.12}
                    inView={inView}
                  />
                </motion.div>
              ))}

              {/* "Your queue" label */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.8 }}
                style={{
                  position: "absolute", bottom: 20, left: "50%",
                  transform: "translateX(-50%)",
                  fontFamily: "var(--font-mono)", fontSize: 9,
                  color: "var(--text-muted)",
                  display: "flex", alignItems: "center", gap: 5,
                  whiteSpace: "nowrap",
                }}
              >
                <div style={{ width: 16, height: 1, background: "var(--border-mid)" }} />
                your revision queue, scheduled automatically
                <div style={{ width: 16, height: 1, background: "var(--border-mid)" }} />
              </motion.div>
            </div>

          </div>
        </motion.div>
      </section>
    </>
  );
}

// ─── Card positions ───────────────────────────────────────────────────────────
const cardPositions: React.CSSProperties[] = [
  { top: "10%",  left: "8%"  },
  { top: "36%",  left: "38%" },
  { top: "62%",  left: "10%" },
];