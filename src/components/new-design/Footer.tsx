"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";

interface NavLink {
  label: string;
  href: string;
  external?: boolean;
  mono?: boolean;
}

const GDRIVE_LINK = "https://drive.google.com/drive/folders/1xnCqLaypRuXp37GQ9MEBD8lRkIiPM1bf?usp=sharing";

const NAV_LINKS: { group: string; links: NavLink[] }[] = [
  {
    group: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Analytics", href: "#analytics" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    group: "Install",
    links: [
      { label: "Add to Chrome", href: GDRIVE_LINK, external: true },
      { label: "chrome://extensions", href: "chrome://extensions", mono: true },
      { label: "GitHub", href: "https://github.com", external: true },
    ],
  },
];

export default function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();

  return (
    <>
      <style>{`
        /* ── Shell ───────────────────────────────────────────── */
        .footer {
          position: relative;
          border-top: 1px solid var(--border-subtle);
          /* bottom padding 0 — wordmark bleeds to edge */
          padding: 60px clamp(16px, 4vw, 40px) 0;
          overflow: hidden;
        }

        /* Teal gradient accent line along top border */
        .footer::before {
          content: "";
          position: absolute;
          top: -1px; left: 0; right: 0; height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            color-mix(in srgb, var(--accent) 35%, transparent) 30%,
            color-mix(in srgb, var(--accent) 55%, transparent) 50%,
            color-mix(in srgb, var(--accent) 35%, transparent) 70%,
            transparent 100%
          );
        }

        .footer-inner {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* ── Top grid ────────────────────────────────────────── */
        .footer-top {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 0.8fr;
          gap: 48px;
          padding-bottom: 48px;
          border-bottom: 1px solid var(--border-subtle);
          align-items: start;
        }

        /* ── Brand ───────────────────────────────────────────── */
        .footer-brand { display: flex; flex-direction: column; gap: 14px; }

        .footer-logo {
          display: flex; align-items: center; gap: 9px;
          text-decoration: none; width: fit-content;
        }

        /* ── Nav groups ──────────────────────────────────────── */
        .footer-group-label {
          font-family: var(--font-mono);
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--text-muted); margin-bottom: 14px;
        }

        .footer-link {
          display: flex; align-items: center; gap: 5px;
          font-family: var(--font-sans); font-size: 13px;
          color: var(--text-secondary); text-decoration: none;
          transition: color var(--transition-fast);
          margin-bottom: 10px; width: fit-content;
        }
        .footer-link:hover { color: var(--text-primary); }
        .footer-link.mono  { font-family: var(--font-mono); font-size: 11px; }

        /* ── Auth button ─────────────────────────────────────── */
        .footer-auth-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-mid);
          background: transparent;
          color: var(--text-secondary);
          font-family: var(--font-sans); font-size: 13px; font-weight: 500;
          text-decoration: none;
          transition: all var(--transition-fast);
          white-space: nowrap; width: fit-content;
        }
        .footer-auth-btn:hover {
          background: var(--bg-hover);
          border-color: var(--accent);
          color: var(--accent);
        }

        /* ── Bottom bar ──────────────────────────────────────── */
        .footer-bottom {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 20px 0 24px;
          gap: 16px; flex-wrap: wrap;
        }

        /* ─────────────────────────────────────────────────────── */
        /* Glowing stroke wordmark                                 */
        /*                                                         */
        /* Technique:                                              */
        /*  - color: transparent + -webkit-text-stroke for outline */
        /*  - layered text-shadow creates a teal bloom around      */
        /*    the stroke edges — near glow (tight), mid glow,      */
        /*    far ambient bloom                                     */
        /*  - mask fades top→bottom so letters dissolve into page  */
        /* ─────────────────────────────────────────────────────── */
        .footer-wordmark {
          display: block;
          text-align: center;
          font-family: var(--font-sans);
          font-size: clamp(48px, 13vw, 170px);
          font-weight: 800;
          letter-spacing: -0.04em;
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
          line-height: 0.88;
          /* Stroke — teal, moderately visible */
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(0, 212, 170, 0.32);
          text-stroke:         1.5px rgba(0, 212, 170, 0.32);
          /* Layered glow on the stroke edges */
          text-shadow:
            0 0  6px rgba(0, 212, 170, 0.20),
            0 0 16px rgba(0, 212, 170, 0.12),
            0 0 40px rgba(0, 212, 170, 0.06);
          /* Fade: fully visible at top, gone before bottom edge */
          -webkit-mask-image: linear-gradient(
            to bottom,
            rgba(0,0,0,0.85) 0%,
            rgba(0,0,0,0.40) 50%,
            transparent       100%
          );
          mask-image: linear-gradient(
            to bottom,
            rgba(0,0,0,0.85) 0%,
            rgba(0,0,0,0.40) 50%,
            transparent       100%
          );
          position: relative;
          z-index: 0;
          /* Pull up slightly so letters touch the bottom bar */
          margin-top: -6px;
        }

        /* ── Responsive ──────────────────────────────────────── */

        /* Tablet (≤900px): 2-col grid, brand spans full, account hidden */

        @media (max-width: 1024px) {
  .footer-top {
    grid-template-columns: 1fr 1fr;
    gap: 36px;
  }
  .footer-brand  { grid-column: 1 / -1; }
  .footer-account { display: none; }
}
        @media (max-width: 900px) {
          .footer-top {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
          .footer-brand   { grid-column: 1 / -1; }
          .footer-account { display: none; }
          .footer-wordmark {
            -webkit-text-stroke-width: 1.2px;
            text-stroke-width: 1.2px;
          }
        }

        @media (max-width: 768px) {
  .footer-status { display: none; }
}

        /* Mobile (≤520px): single col, nav groups hidden, just brand + CTA */
        @media (max-width: 520px) {
          .footer-top {
            grid-template-columns: 1fr;
            gap: 24px;
            padding-bottom: 28px;
             border-bottom: none;
            
          }
          .footer-nav-group { display: none; }
          .footer-bottom    { flex-direction: column; align-items: flex-start; gap: 8px; }
          .footer-status    { display: none; }
          .footer-wordmark  {
            font-size: clamp(52px, 16vw, 90px);
            -webkit-text-stroke-width: 1px;
            text-stroke-width: 1px;
          }
        }
      `}</style>

      <footer className="footer" aria-label="Site footer">
        <motion.div
          ref={ref}
          className="footer-inner"
          initial={{ opacity: 0, y: reduce ? 0 : 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── Top ───────────────────────────────────────────── */}
          <div className="footer-top">
            {/* Brand */}
            <div className="footer-brand">
              <Link href="/" className="footer-logo">
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    flexShrink: 0,
                    background: "var(--accent-muted)",
                    border:
                      "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 5L1 8L3 11"
                      stroke="var(--accent)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13 5L15 8L13 11"
                      stroke="var(--accent)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 3L6 13"
                      stroke="var(--accent)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.2,
                    }}
                  >
                    Memoize
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      color: "var(--text-muted)",
                      marginTop: 1,
                    }}
                  >
                    Solve once. Remember forever.
                  </div>
                </div>
              </Link>

              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  color: "var(--text-muted)",
                  lineHeight: 1.65,
                  margin: 0,
                  maxWidth: 240,
                }}
              >
                SM-2 spaced repetition for engineers grinding FAANG interviews.
                Auto-captures. Schedules. Never forgets.
              </p>

              {/* Platform chips */}
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  {
                    label: "LeetCode",
                    color: "var(--lc-color)",
                    muted: "var(--lc-muted)",
                  },
                  {
                    label: "Codeforces",
                    color: "var(--cf-color)",
                    muted: "var(--cf-muted)",
                  },
                ].map((p) => (
                  <div
                    key={p.label}
                    style={{
                      padding: "3px 9px",
                      borderRadius: "var(--radius-pill)",
                      background: p.muted,
                      border: `1px solid color-mix(in srgb, ${p.color} 25%, transparent)`,
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      fontWeight: 600,
                      color: p.color,
                    }}
                  >
                    {p.label}
                  </div>
                ))}
              </div>

              {/* Primary CTA */}
              <a
                href={GDRIVE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "9px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--accent)",
                  color: "#0d0d0f",
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "none",
                  transition: "all var(--transition-fast)",
                  alignSelf: "flex-start",
                  marginTop: 4,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "var(--accent-hover)";
                  el.style.transform = "translateY(-1px)";
                  el.style.boxShadow = "var(--shadow-accent)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "var(--accent)";
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                }}
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="2.6" fill="currentColor" />
                  <path
                    d="M7 4.4H12.5C11.6 2.6 9.5 1.4 7 1.4C4.5 1.4 2.4 2.6 1.5 4.4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M2.4 5.5L5.2 9.8C5.7 10.6 6.3 11.2 7 11.4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M11.6 5.5L8.8 9.8C8.3 10.6 7.7 11.2 7 11.4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                Add to Chrome — Free
              </a>
            </div>

            {/* Nav groups */}
            {NAV_LINKS.map((group, gi) => (
              <motion.div
                key={group.group}
                className="footer-nav-group"
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 + gi * 0.07 }}
              >
                <div className="footer-group-label">{group.group}</div>
                {group.links.map((link) =>
                  link.external ? (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`footer-link${link.mono ? " mono" : ""}`}
                    >
                      {link.label}
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M2 2h6v6M8 2L2 8"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={`footer-link${(link as any).mono ? " mono" : ""}`}
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </motion.div>
            ))}

            {/* Account — single button */}
            <motion.div
              className="footer-account"
              initial={{ opacity: 0, y: reduce ? 0 : 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.24 }}
            >
              <div className="footer-group-label">Account</div>
              <Link href="/login" className="footer-auth-btn">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle
                    cx="6.5"
                    cy="4.5"
                    r="2.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M1.5 11.5c0-2.2 2.2-4 5-4s5 1.8 5 4"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                Sign in / Sign up
              </Link>
            </motion.div>
          </div>

          {/* ── Bottom bar ─────────────────────────────────────── */}
          <motion.div
            className="footer-bottom"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--text-subtle)",
              }}
            >
              © {new Date().getFullYear()} Memoize · Built for engineers, by
              engineers.
            </div>

            {/* Status row — hidden on mobile */}
            <div
              className="footer-status"
              style={{ display: "flex", alignItems: "center", gap: 16 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <motion.div
                  animate={
                    reduce ? {} : { scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }
                  }
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--easy)",
                    boxShadow: "0 0 5px var(--easy)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-subtle)",
                  }}
                >
                  All systems operational
                </span>
              </div>
              <div
                style={{
                  width: 1,
                  height: 12,
                  background: "var(--border-subtle)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-subtle)",
                }}
              >
                v0.1.0-beta
              </span>
              <div
                style={{
                  width: 1,
                  height: 12,
                  background: "var(--border-subtle)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-subtle)",
                }}
              >
                SM-2 · Wozniak, 1987
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Glowing stroke wordmark ──────────────────────────── */}
        <motion.div
          className="footer-wordmark"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          Memoize
        </motion.div>
      </footer>
    </>
  );
}
