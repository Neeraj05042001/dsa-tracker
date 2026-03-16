"use client";

import { useReducedMotion, motion } from "framer-motion";
import Link from "next/link";

const GDRIVE_LINK = "https://drive.google.com/drive/folders/1xnCqLaypRuXp37GQ9MEBD8lRkIiPM1bf?usp=sharing";

// ─── Motion helpers ───────────────────────────────────────────────────────────
function FadeUp({
  children,
  delay = 0,
  className,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: reduce ? 0 : 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────
function DashboardMockup() {
  const reduce = useReducedMotion();

  const recentProblems = [
    { title: "Container With Most Water", platform: "LC", diff: "Medium", tag: "sliding_window", time: "4m ago" },
    { title: "Remove Nth Node From End of List", platform: "LC", diff: "Medium", tag: "bit_manipulation", time: "1d ago" },
    { title: "3Sum Closest", platform: "LC", diff: "Medium", tag: "dfs", time: "2d ago" },
  ];

  const revisionItems = [
    { title: "Palindrome Number", tag: "two_pointers", dots: 1 },
    { title: "4Sum", tag: "merge_intervals", dots: 2 },
    { title: "Zigzag Conversion", tag: "sliding_window", dots: 1 },
  ];

  // Mini heatmap data — 10 cols × 5 rows, mostly empty with a few lit cells
  const heatmap = Array.from({ length: 50 }, (_, i) =>
    [2, 7, 12, 18, 24, 25, 31, 37, 43, 44, 48, 49].includes(i) ? 1 : 0
  );

  return (
    <motion.div
      animate={reduce ? {} : { y: [0, -7, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: "100%", maxWidth: 900, margin: "0 auto", position: "relative" }}
    >
      {/* Glow beneath mockup */}
      <div style={{
        position: "absolute",
        bottom: -40, left: "10%", right: "10%",
        height: 120,
        background: "radial-gradient(ellipse, rgba(0,212,170,0.18) 0%, transparent 70%)",
        filter: "blur(20px)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Browser chrome */}
      <div style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-mid)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px var(--border-subtle)",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Browser top bar */}
        <div style={{
          height: 38,
          background: "var(--bg-base)",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          paddingLeft: 14,
          gap: 6,
        }}>
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840" }} />
          <div style={{
            flex: 1, maxWidth: 280, height: 22, margin: "0 auto",
            background: "var(--bg-elevated)",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--border-subtle)",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 6,
          }}>
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
              <circle cx="4.5" cy="4.5" r="4" stroke="var(--text-muted)" strokeWidth="1" />
              <path d="M4.5 2.5v2l1.5 1" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)" }}>
              memoize-navy.vercel.app/dashboard
            </span>
          </div>
        </div>

        {/* Dashboard body */}
        <div style={{ display: "flex", height: 420 }}>

          {/* Sidebar */}
          <div style={{
            width: 180,
            background: "var(--bg-surface)",
            borderRight: "1px solid var(--border-subtle)",
            display: "flex", flexDirection: "column",
            padding: "14px 10px",
            gap: 2,
            flexShrink: 0,
          }}>
            {/* Logo in sidebar */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", marginBottom: 10 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: "var(--accent-muted)",
                border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <path d="M3 5L1 8L3 11" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13 5L15 8L13 11" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 3L6 13" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2 }}>Memoize</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", lineHeight: 1.2 }}>Solve once.</div>
              </div>
            </div>

            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", color: "var(--text-muted)", textTransform: "uppercase", padding: "0 8px", marginBottom: 4 }}>MENU</div>

            {[
              { label: "Overview", active: true, icon: "⊞" },
              { label: "Problems", active: false, icon: "≡" },
              { label: "Revision", active: false, icon: "↻" },
              { label: "Analytics", active: false, icon: "↗" },
            ].map((item) => (
              <div key={item.label} className="sidebar-nav-item" style={{
                background: item.active ? "var(--accent-muted)" : "transparent",
                color: item.active ? "var(--accent)" : "var(--text-muted)",
                boxShadow: item.active ? "inset 0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent)" : "none",
                fontSize: 11,
              }}>
                {item.label}
                {item.label === "Revision" && (
                  <span style={{
                    marginLeft: "auto", background: "var(--accent)", color: "#0d0d0f",
                    borderRadius: "var(--radius-pill)", fontSize: 9, fontWeight: 700,
                    padding: "1px 5px", fontFamily: "var(--font-mono)",
                  }}>9</span>
                )}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div style={{ flex: 1, overflow: "hidden", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12, background: "var(--bg-base)" }}>

            {/* Page header */}
            <div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Overview</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>16 problems solved this week</div>
            </div>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {[
                { label: "TOTAL SOLVED", value: "21", sub: "0 attempted", color: "var(--accent)" },
                { label: "LEETCODE", value: "14", sub: "3E · 10M · 1H", color: "var(--lc-color)" },
                { label: "CODEFORCES", value: "7", sub: "7 total", color: "var(--cf-color)" },
                { label: "STREAK", value: "4", sub: "Best: 4 days", color: "#f97316" },
              ].map((card) => (
                <div key={card.label} className="card" style={{ padding: "10px 11px" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 600, letterSpacing: "0.09em", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>{card.label}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: card.color, lineHeight: 1, letterSpacing: "-0.02em" }}>{card.value}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", marginTop: 3 }}>{card.sub}</div>
                </div>
              ))}
            </div>

            {/* Activity heatmap */}
            <div className="card" style={{ padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text-muted)" }}>ACTIVITY</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>21 problems this year</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(25, 1fr)", gap: 2 }}>
                {heatmap.map((active, i) => (
                  <div key={i} style={{
                    aspectRatio: "1",
                    borderRadius: 2,
                    background: active ? "var(--accent)" : "var(--bg-elevated)",
                    opacity: active ? 0.85 : 1,
                  }} />
                ))}
              </div>
            </div>

            {/* Bottom 2 cols */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flex: 1, minHeight: 0 }}>

              {/* Recently solved */}
              <div className="card" style={{ padding: "10px 12px", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text-muted)" }}>RECENTLY SOLVED</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)" }}>View all →</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {recentProblems.map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-subtle)", width: 10 }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                        <div style={{ display: "flex", gap: 4, marginTop: 2, alignItems: "center" }}>
                          <span className="badge" style={{
                            background: p.platform === "LC" ? "var(--lc-muted)" : "var(--cf-muted)",
                            color: p.platform === "LC" ? "var(--lc-color)" : "var(--cf-color)",
                            fontSize: 8, padding: "1px 5px",
                          }}>{p.platform}</span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>{p.tag}</span>
                        </div>
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-subtle)", flexShrink: 0 }}>{p.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Due for revision */}
              <div className="card" style={{ padding: "10px 12px", overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text-muted)" }}>DUE FOR REVISION</div>
                    <span style={{ background: "var(--hard-muted)", color: "var(--hard)", borderRadius: "var(--radius-pill)", fontSize: 8, fontWeight: 700, padding: "1px 5px", fontFamily: "var(--font-mono)" }}>9</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--accent)" }}>Open queue →</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {revisionItems.map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 3, height: 28, borderRadius: 2, background: i === 0 ? "var(--hard)" : i === 1 ? "var(--medium)" : "var(--hard)", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", marginTop: 1 }}>{r.tag}</div>
                      </div>
                      <div style={{ display: "flex", gap: 2 }}>
                        {Array.from({ length: 3 }, (_, di) => (
                          <div key={di} style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: di < r.dots ? (r.dots === 1 ? "var(--hard)" : "var(--medium)") : "var(--border-mid)",
                          }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <>
      <style>{`
        .hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: 120px;
          padding-bottom: 80px;
          padding-left: clamp(16px, 4vw, 40px);
          padding-right: clamp(16px, 4vw, 40px);
          overflow: hidden;
        }

        .hero-label {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 12px;
          border-radius: var(--radius-pill);
          border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
          background: var(--accent-muted);
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 500;
          color: var(--accent);
          letter-spacing: 0.02em;
          margin-bottom: 24px;
        }

        .hero-headline {
          font-family: var(--font-sans);
          font-size: clamp(32px, 5.5vw, 62px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.08;
          color: var(--text-primary);
          text-align: center;
          max-width: 780px;
          margin: 0 auto;
        }

        .hero-headline em {
          font-style: normal;
          color: var(--accent);
        }

        .hero-sub {
          font-family: var(--font-sans);
          font-size: clamp(14px, 1.8vw, 17px);
          font-weight: 400;
          color: var(--text-secondary);
          line-height: 1.65;
          text-align: center;
          max-width: 520px;
          margin: 20px auto 0;
        }

        .hero-ctas {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 32px;
          flex-wrap: wrap;
        }

        .hero-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          border-radius: var(--radius-md);
          background: var(--accent);
          color: #0d0d0f;
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: all var(--transition-fast);
          white-space: nowrap;
          cursor: pointer;
          border: none;
        }
        .hero-cta-primary:hover {
          background: var(--accent-hover);
          box-shadow: var(--shadow-accent);
          transform: translateY(-1px);
        }

        .hero-cta-secondary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 11px 20px;
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
        .hero-cta-secondary:hover {
          background: var(--bg-hover);
          border-color: var(--border-strong);
          color: var(--text-primary);
        }

        .hero-microcopy {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
          text-align: center;
          margin-top: 12px;
        }

        .hero-trust {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-top: 28px;
          flex-wrap: wrap;
        }

        .hero-trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
        }

        .hero-trust-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--accent);
          opacity: 0.7;
          flex-shrink: 0;
        }

        .hero-trust-divider {
          width: 1px;
          height: 12px;
          background: var(--border-subtle);
        }

        .hero-mockup-wrapper {
          width: 100%;
          max-width: 960px;
          margin: 52px auto 0;
          padding: 0;
        }

        /* Hide full mockup on small screens, show simplified */
        .mockup-desktop { display: block; }
        .mockup-mobile  { display: none; }

        @media (max-width: 640px) {
          .hero-section { padding-top: 100px; }
          .mockup-desktop { display: none; }
          .mockup-mobile  { display: block; }
          .hero-trust-divider { display: none; }
          .hero-trust { gap: 12px; }
        }
      `}</style>

      <section className="hero-section" aria-label="Hero">

        {/* ── Radial background glow ──────────────────────────── */}
        <div style={{
          position: "absolute",
          top: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "min(900px, 120vw)",
          height: 500,
          background: "radial-gradient(ellipse at 50% 0%, rgba(0,212,170,0.10) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
        }} />

        {/* ── Subtle dot grid ─────────────────────────────────── */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
          zIndex: 0,
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 100%)",
        }} />

        {/* ── Content ─────────────────────────────────────────── */}
        <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

          {/* Label */}
          <FadeUp delay={0.05}>
            <div className="hero-label">
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 6px var(--accent)" }} />
              SM-2 spaced repetition · LeetCode · Codeforces
            </div>
          </FadeUp>

          {/* Headline */}
          <FadeUp delay={0.12}>
            <h1 className="hero-headline">
              Solve 200 problems.<br />
              <em>Remember</em> all 200.
            </h1>
          </FadeUp>

          {/* Sub */}
          <FadeUp delay={0.2}>
            <p className="hero-sub">
              Memoize auto-captures every accepted submission and uses the SM-2 algorithm to schedule reviews at the exact moment you'd forget — so your prep compounds instead of leaking.
            </p>
          </FadeUp>

          {/* CTAs */}
          <FadeUp delay={0.28}>
            <div className="hero-ctas">
              <a href={GDRIVE_LINK} target="_blank" rel="noopener noreferrer" className="hero-cta-primary">
                <ChromeIcon size={15} />
                Add to Chrome — Free
              </a>
              <Link href="/dashboard" className="hero-cta-secondary">
                Open Dashboard
                <ArrowIcon />
              </Link>
            </div>
            <p className="hero-microcopy">
              Manual install via chrome://extensions · GitHub or Google sign-in · No credit card
            </p>
          </FadeUp>

          {/* Trust strip */}
          <FadeUp delay={0.35}>
            <div className="hero-trust">
              {[
                "No manual logging ever",
                "Installs in ~2 minutes",
                "Free forever",
                "GitHub & Google auth",
              ].map((item, i, arr) => (
                <span key={item} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <span className="hero-trust-item">
                    <span className="hero-trust-dot" />
                    {item}
                  </span>
                  {i < arr.length - 1 && <span className="hero-trust-divider" />}
                </span>
              ))}
            </div>
          </FadeUp>

          {/* Dashboard mockup */}
          <FadeUp delay={0.45} style={{ width: "100%" }}>
            <div className="hero-mockup-wrapper">
              {/* Desktop: full dashboard */}
              <div className="mockup-desktop">
                <DashboardMockup />
              </div>
              {/* Mobile: simplified stat cards only */}
              <div className="mockup-mobile">
                <MobileMockup />
              </div>
            </div>
          </FadeUp>

        </div>
      </section>
    </>
  );
}

// ─── Mobile simplified mockup ─────────────────────────────────────────────────
function MobileMockup() {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-mid)",
      borderRadius: "var(--radius-xl)",
      overflow: "hidden",
      boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
    }}>
      {/* Browser bar */}
      <div style={{
        height: 32, background: "var(--bg-base)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", paddingLeft: 12, gap: 5,
      }}>
        {["#ff5f57", "#ffbd2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
        ))}
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", marginLeft: 8 }}>
          memoize-navy.vercel.app
        </div>
      </div>
      {/* Mini stat cards */}
      <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          { label: "TOTAL SOLVED", value: "21", color: "var(--accent)" },
          { label: "LEETCODE", value: "14", color: "var(--lc-color)" },
          { label: "CODEFORCES", value: "7", color: "var(--cf-color)" },
          { label: "STREAK", value: "4 days", color: "#f97316" },
        ].map((card) => (
          <div key={card.label} className="card" style={{ padding: "10px 12px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: card.color, letterSpacing: "-0.02em", lineHeight: 1 }}>{card.value}</div>
          </div>
        ))}
        {/* Revision due badge */}
        <div className="card" style={{ padding: "10px 12px", gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>DUE FOR REVISION</div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--text-secondary)" }}>Palindrome Number · 4Sum · Zigzag...</div>
          </div>
          <span style={{ background: "var(--hard-muted)", color: "var(--hard)", borderRadius: "var(--radius-pill)", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, padding: "3px 10px" }}>9</span>
        </div>
      </div>
    </div>
  );
}

// ─── Icon helpers ─────────────────────────────────────────────────────────────
function ChromeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="2.6" fill="currentColor" />
      <path d="M7 4.4H12.5C11.6 2.6 9.5 1.4 7 1.4C4.5 1.4 2.4 2.6 1.5 4.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2.4 5.5L5.2 9.8C5.7 10.6 6.3 11.2 7 11.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M11.6 5.5L8.8 9.8C8.3 10.6 7.7 11.2 7 11.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M2.5 6.5H10.5M7 3L10.5 6.5L7 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}