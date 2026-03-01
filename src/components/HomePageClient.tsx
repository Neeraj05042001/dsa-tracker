"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ─── Auth user shape passed from server ───────────────────────
interface NavUser {
  name: string;
  email: string;
  avatar_url?: string;
}

// ─── Scroll reveal hook ───────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Animated counter ─────────────────────────────────────────────────────────

function Counter({ to, duration = 1400, suffix = "" }: { to: number; duration?: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, to, duration]);

  return <span ref={ref}>{val}{suffix}</span>;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const IcoChrome = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
    <line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/>
    <line x1="10.88" y1="21.94" x2="15.46" y2="14"/>
  </svg>
);

const IcoArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const IcoZap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IcoBrain = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.44-2.1 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 9.5 2Z"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.44-2.1 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2Z"/>
  </svg>
);

const IcoChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);

const IcoRepeat = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

const IcoCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IcoGithub = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

// ─── Mini Dashboard Preview (hero visual) ─────────────────────────────────────

function MiniDashboard() {
  const problems = [
    { name: "Two Sum", diff: "easy", pattern: "Two Pointers", conf: 3 },
    { name: "Longest Substring", diff: "medium", pattern: "Sliding Window", conf: 2 },
    { name: "Median of Arrays", diff: "hard", pattern: "Binary Search", conf: 1 },
    { name: "Valid Parentheses", diff: "easy", pattern: "Stack", conf: 3 },
  ];

  const diffColor = (d: string) =>
    d === "easy" ? "#4ade80" : d === "medium" ? "#facc15" : "#f87171";

  const heatData = Array.from({ length: 52 }, (_, i) =>
    i >= 48 ? (i === 49 || i === 50 || i === 51 ? Math.floor(Math.random() * 4 + 1) : 0) : 0
  );

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-mid)",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,170,0.08)",
      width: "100%",
      maxWidth: 480,
      fontSize: 12,
    }}>
      {/* Mini topbar */}
      <div style={{
        padding: "10px 16px",
        background: "var(--bg-elevated)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#f87171","#facc15","#4ade80"].map((c,i) => (
            <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.7 }} />
          ))}
        </div>
        <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4, fontFamily: "var(--font-mono)" }}>
          dsa-tracker.app/dashboard
        </span>
      </div>

      {/* Stats strip */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 1,
        background: "var(--border-subtle)",
      }}>
        {[
          { label: "Total Solved", value: "14", color: "var(--accent)" },
          { label: "Avg Confidence", value: "73%", color: "var(--easy)" },
          { label: "Streak", value: "3 days", color: "#f97316" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            padding: "12px 14px",
            background: "var(--bg-surface)",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}>
            <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", fontWeight: 600 }}>
              {label}
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-mono)", color }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Mini heatmap */}
      <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", fontWeight: 600, marginBottom: 6 }}>
          Activity
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {heatData.map((v, i) => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: 1.5,
              background: v === 0 ? "var(--bg-elevated)"
                : v === 1 ? "rgba(0,212,170,0.25)"
                : v === 2 ? "rgba(0,212,170,0.45)"
                : v === 3 ? "rgba(0,212,170,0.65)"
                : "var(--accent)",
            }} />
          ))}
        </div>
      </div>

      {/* Mini problem list */}
      <div style={{ padding: "8px 0" }}>
        {problems.map((p, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "7px 14px",
            borderLeft: `2px solid ${p.conf === 3 ? "transparent" : p.conf === 1 ? "#f87171" : "#facc15"}`,
          }}>
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: diffColor(p.diff),
              background: `color-mix(in srgb, ${diffColor(p.diff)} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${diffColor(p.diff)} 22%, transparent)`,
              borderRadius: 999, padding: "1px 6px",
              textTransform: "capitalize",
            }}>{p.diff}</span>
            <span style={{ flex: 1, fontSize: 11, color: "var(--text-primary)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {p.name}
            </span>
            <span style={{ fontSize: 10, color: "var(--accent)", background: "var(--accent-muted)", borderRadius: 999, padding: "1px 7px", whiteSpace: "nowrap" }}>
              {p.pattern}
            </span>
            <div style={{ display: "flex", gap: 2 }}>
              {[0,1,2].map(j => (
                <div key={j} style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: j < p.conf ? (p.conf === 3 ? "#4ade80" : p.conf === 2 ? "#facc15" : "#f87171") : "var(--border-mid)",
                }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar — revision due */}
      <div style={{
        padding: "10px 14px",
        background: "color-mix(in srgb, var(--medium) 8%, var(--bg-elevated))",
        borderTop: "1px solid color-mix(in srgb, var(--medium) 18%, transparent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 10, color: "var(--medium)", fontWeight: 600 }}>
          2 problems due for revision today
        </span>
        <span style={{ fontSize: 10, color: "var(--accent)", fontWeight: 600, cursor: "pointer" }}>
          Review now →
        </span>
      </div>
    </div>
  );
}

// ─── Section wrapper with reveal ──────────────────────────────────────────────

function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function HomePage({ user }: { user?: NavUser }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ══════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════ */}
      <nav style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 24px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(13,13,15,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border-subtle)" : "1px solid transparent",
        transition: "background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(0,212,170,0.35)",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d0d0f" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            DSA Tracker
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[
            { href: "#features", label: "Features" },
            { href: "#how-it-works", label: "How it works" },
          ].map(({ href, label }) => (
            <a key={href} href={href} style={{
              fontSize: 13, fontWeight: 500,
              color: "var(--text-muted)",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: "var(--radius-md)",
              transition: "color 0.15s, background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-hover)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}>
              {label}
            </a>
          ))}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center",
              color: "var(--text-muted)", padding: "6px 8px",
              borderRadius: "var(--radius-md)",
              transition: "color 0.15s",
              textDecoration: "none",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
          >
            <IcoGithub />
          </a>
          {user ? (
            /* ── Logged in: avatar pill + sign out ── */
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Link
                href="/dashboard"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "5px 12px 5px 6px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-mid)",
                  borderRadius: "var(--radius-pill)",
                  textDecoration: "none",
                }}
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    width={24}
                    height={24}
                    style={{ borderRadius: "50%", objectFit: "cover", border: "1.5px solid var(--border-mid)" }}
                  />
                ) : (
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: "var(--accent-muted)",
                    border: "1.5px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: "var(--accent)",
                    fontFamily: "var(--font-mono)", flexShrink: 0,
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span style={{
                  fontSize: 13, fontWeight: 600, color: "var(--text-primary)",
                  maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {user.name}
                </span>
              </Link>
              <form action="/auth/signout" method="POST">
                <button type="submit" style={{
                  fontSize: 12, fontWeight: 500, color: "var(--text-muted)",
                  background: "none", border: "none", cursor: "pointer",
                  padding: "6px 8px", borderRadius: "var(--radius-md)",
                }}>
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            /* ── Logged out: Open Dashboard button ── */
            <Link href="/dashboard" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 16px",
              background: "var(--accent)", color: "#0d0d0f",
              borderRadius: "var(--radius-md)",
              fontSize: 13, fontWeight: 600,
              textDecoration: "none",
              transition: "background 0.15s, box-shadow 0.15s, transform 0.15s",
              boxShadow: "0 0 0 0 rgba(0,212,170,0)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "var(--accent-hover)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(0,212,170,0.35)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "var(--accent)";
              e.currentTarget.style.boxShadow = "0 0 0 0 rgba(0,212,170,0)";
              e.currentTarget.style.transform = "translateY(0)";
            }}>
              Open Dashboard
            </Link>
          )}
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "100px 24px 80px",
        position: "relative",
        overflow: "hidden",
        maxWidth: 1200,
        margin: "0 auto",
      }}>
        {/* Background grid */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 100%)",
        }} />

        {/* Accent glow blobs */}
        <div style={{
          position: "absolute", top: "20%", left: "10%", width: 500, height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)",
          filter: "blur(40px)", zIndex: 0, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "30%", right: "5%", width: 400, height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
          filter: "blur(40px)", zIndex: 0, pointerEvents: "none",
        }} />

        {/* Content */}
        <div style={{
          position: "relative", zIndex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
          width: "100%",
        }}>
          {/* Left — text */}
          <div>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 12px 5px 8px",
              background: "var(--accent-muted)",
              border: "1px solid rgba(0,212,170,0.25)",
              borderRadius: 999,
              marginBottom: 28,
              animation: "fadeIn 0.6s both",
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 5,
                background: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <IcoChrome />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>
                Chrome Extension + Web Dashboard
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "var(--text-primary)",
              marginBottom: 20,
              animation: "fadeIn 0.6s 100ms both",
            }}>
              Stop letting solved{" "}
              <span style={{
                color: "var(--accent)",
                textShadow: "0 0 30px rgba(0,212,170,0.4)",
              }}>
                problems
              </span>
              {" "}go to waste.
            </h1>

            {/* Sub */}
            <p style={{
              fontSize: 17,
              lineHeight: 1.65,
              color: "var(--text-secondary)",
              marginBottom: 36,
              maxWidth: 460,
              animation: "fadeIn 0.6s 200ms both",
            }}>
              DSA Tracker auto-captures every LeetCode & Codeforces solve,
              schedules smart spaced reviews, and shows exactly what to fix
              before your next interview.
            </p>

            {/* CTAs */}
            <div style={{
              display: "flex", gap: 12, flexWrap: "wrap",
              animation: "fadeIn 0.6s 300ms both",
            }}>
              <a
                href="#"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "13px 24px",
                  background: "var(--accent)",
                  color: "#0d0d0f",
                  borderRadius: "var(--radius-md)",
                  fontSize: 14, fontWeight: 700,
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 24px rgba(0,212,170,0.3)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "var(--accent-hover)";
                  e.currentTarget.style.boxShadow = "0 6px 32px rgba(0,212,170,0.45)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "var(--accent)";
                  e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,212,170,0.3)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <IcoChrome /> Add to Chrome — Free
              </a>
              <Link href="/dashboard" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "13px 24px",
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
                borderRadius: "var(--radius-md)",
                fontSize: 14, fontWeight: 600,
                textDecoration: "none",
                border: "1px solid var(--border-mid)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "var(--bg-hover)";
                e.currentTarget.style.borderColor = "var(--border-strong)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "var(--bg-elevated)";
                e.currentTarget.style.borderColor = "var(--border-mid)";
              }}>
                Open Dashboard <IcoArrow />
              </Link>
            </div>

            {/* Trust signals */}
            <div style={{
              display: "flex", alignItems: "center", gap: 20,
              marginTop: 36,
              animation: "fadeIn 0.6s 400ms both",
            }}>
              {[
                "No account needed to start",
                "LeetCode & Codeforces",
                "100% free",
              ].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%",
                    background: "var(--accent-muted)",
                    border: "1px solid rgba(0,212,170,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <IcoCheck />
                  </div>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — mini dashboard */}
          <div style={{
            animation: "fadeIn 0.8s 200ms both",
            display: "flex",
            justifyContent: "center",
          }}>
            <div style={{ position: "relative" }}>
              {/* Glow behind card */}
              <div style={{
                position: "absolute", inset: -30,
                background: "radial-gradient(circle, rgba(0,212,170,0.1) 0%, transparent 70%)",
                filter: "blur(20px)",
                pointerEvents: "none",
              }} />
              <MiniDashboard />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════ */}
      <div style={{
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
        padding: "32px 24px",
      }}>
        <div style={{
          maxWidth: 1000,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0,
        }}>
          {[
            { value: 0, suffix: "+", label: "Problems tracked", display: "1k+" },
            { value: 0, suffix: "", label: "Supported platforms", display: "2" },
            { value: 0, suffix: "", label: "Algorithm patterns", display: "16" },
            { value: 0, suffix: "", label: "Minutes to set up", display: "< 2" },
          ].map(({ label, display }, i) => (
            <div key={label} style={{
              textAlign: "center",
              padding: "0 24px",
              borderRight: i < 3 ? "1px solid var(--border-subtle)" : "none",
            }}>
              <Reveal delay={i * 80}>
                <div style={{
                  fontSize: 32, fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  color: "var(--accent)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                  marginBottom: 6,
                }}>
                  {display}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                  {label}
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          PROBLEM → SOLUTION
      ══════════════════════════════════════════ */}
      <section style={{ padding: "100px 24px", maxWidth: 1000, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{
              display: "inline-block",
              fontSize: 11, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em",
              color: "var(--hard)",
              background: "var(--hard-muted)",
              border: "1px solid color-mix(in srgb, var(--hard) 25%, transparent)",
              borderRadius: 999, padding: "4px 12px",
              marginBottom: 20,
            }}>
              The Problem
            </div>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "var(--text-primary)",
              lineHeight: 1.2,
              marginBottom: 16,
            }}>
              You're solving problems.<br />You're not retaining them.
            </h2>
            <p style={{
              fontSize: 16, color: "var(--text-secondary)",
              lineHeight: 1.65, maxWidth: 520, margin: "0 auto",
            }}>
              Most engineers grind 200+ problems before interviews, but struggle to recall
              approaches they solved weeks ago. The issue isn't effort — it's the system.
            </p>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            {
              icon: "📋",
              title: "Spreadsheet chaos",
              body: "Manually logging problems into Google Sheets. Half the metadata is missing. You stop doing it after week 2.",
              color: "var(--hard)",
            },
            {
              icon: "🔁",
              title: "No spaced repetition",
              body: "You solved a problem once in January. Now it's March. You have no idea if you still remember the approach.",
              color: "var(--medium)",
            },
            {
              icon: "🎯",
              title: "No pattern awareness",
              body: "You've done 50 problems but don't realize you've never touched BFS, DFS, or Dynamic Programming.",
              color: "#f97316",
            },
          ].map(({ icon, title, body, color }, i) => (
            <Reveal key={title} delay={i * 100}>
              <div style={{
                padding: "24px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 14,
                borderTop: `2px solid ${color}`,
                height: "100%",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.3)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.boxShadow = "none";
              }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                  {title}
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0 }}>
                  {body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how-it-works" style={{
        padding: "80px 24px",
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{
                display: "inline-block",
                fontSize: 11, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em",
                color: "var(--accent)",
                background: "var(--accent-muted)",
                border: "1px solid rgba(0,212,170,0.25)",
                borderRadius: 999, padding: "4px 12px",
                marginBottom: 20,
              }}>
                How It Works
              </div>
              <h2 style={{
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 700, letterSpacing: "-0.025em",
                color: "var(--text-primary)", lineHeight: 1.2,
              }}>
                From submission to mastery in 3 steps
              </h2>
            </div>
          </Reveal>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0,
            position: "relative",
          }}>
            {/* Connecting line */}
            <div style={{
              position: "absolute",
              top: 28, left: "calc(16.67% + 28px)",
              width: "calc(66.67% - 56px)",
              height: 1,
              background: "linear-gradient(90deg, var(--accent) 0%, rgba(0,212,170,0.3) 50%, var(--accent) 100%)",
              zIndex: 0,
            }} />

            {[
              {
                step: "01",
                icon: <IcoZap />,
                title: "Solve & auto-capture",
                body: "Accept a submission on LeetCode or Codeforces. The extension detects it and auto-fills all metadata — name, difficulty, tags, runtime, memory.",
              },
              {
                step: "02",
                icon: <IcoBrain />,
                title: "Add your context",
                body: "Rate your confidence, note your approach, flag for revision. Takes 10 seconds. The extension popup makes it instant.",
              },
              {
                step: "03",
                icon: <IcoRepeat />,
                title: "Review at the right time",
                body: "The SM-2 algorithm schedules reviews before you forget. Your revision queue tells you exactly what to practice today.",
              },
            ].map(({ step, icon, title, body }, i) => (
              <Reveal key={step} delay={i * 120}>
                <div style={{
                  padding: "0 32px",
                  textAlign: "center",
                  position: "relative",
                  zIndex: 1,
                }}>
                  {/* Step circle */}
                  <div style={{
                    width: 56, height: 56,
                    borderRadius: "50%",
                    background: "var(--bg-base)",
                    border: "2px solid var(--accent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 20px",
                    color: "var(--accent)",
                    boxShadow: "0 0 20px rgba(0,212,170,0.2)",
                    position: "relative",
                  }}>
                    {icon}
                    <span style={{
                      position: "absolute", top: -8, right: -8,
                      fontSize: 9, fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      color: "var(--accent)",
                      background: "var(--bg-base)",
                      border: "1px solid var(--accent)",
                      borderRadius: 999,
                      padding: "1px 5px",
                    }}>{step}</span>
                  </div>
                  <h3 style={{
                    fontSize: 15, fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 10,
                  }}>{title}</h3>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65, margin: 0 }}>
                    {body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section id="features" style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{
              display: "inline-block",
              fontSize: 11, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em",
              color: "var(--accent)",
              background: "var(--accent-muted)",
              border: "1px solid rgba(0,212,170,0.25)",
              borderRadius: 999, padding: "4px 12px",
              marginBottom: 20,
            }}>
              Features
            </div>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 700, letterSpacing: "-0.025em",
              color: "var(--text-primary)", lineHeight: 1.2, marginBottom: 14,
            }}>
              Everything you need to master DSA
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", maxWidth: 480, margin: "0 auto" }}>
              Built specifically for engineers preparing for technical interviews.
            </p>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {[
            {
              icon: <IcoZap />,
              color: "var(--accent)",
              title: "Auto-capture from LeetCode & Codeforces",
              body: "The Chrome extension detects accepted submissions and auto-fills problem name, difficulty, tags, language, runtime, and memory. Zero manual work.",
              tags: ["Chrome Extension", "Auto-detect", "Both platforms"],
            },
            {
              icon: <IcoRepeat />,
              color: "#a78bfa",
              title: "SM-2 Spaced Repetition Scheduling",
              body: "The proven SuperMemo 2 algorithm calculates the exact right time to review each problem — so you review just before you'd forget, maximising retention.",
              tags: ["SM-2 Algorithm", "Smart scheduling", "Retention science"],
            },
            {
              icon: <IcoChart />,
              color: "var(--easy)",
              title: "Readiness Score & Analytics",
              body: "A composite score across consistency, difficulty spread, average confidence, and revision discipline. Know exactly how interview-ready you are at a glance.",
              tags: ["Readiness score", "4 dimensions", "Trend tracking"],
            },
            {
              icon: <IcoBrain />,
              color: "var(--medium)",
              title: "Pattern Coverage Map",
              body: "See which algorithm patterns you've mastered and which you've never touched. Sliding Window, BFS, DFS, DP, Backtracking — 16 foundational patterns tracked.",
              tags: ["16 patterns", "Gap analysis", "Focus areas"],
            },
          ].map(({ icon, color, title, body, tags }, i) => (
            <Reveal key={title} delay={i * 80}>
              <div style={{
                padding: "28px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: 14,
                height: "100%",
                transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `color-mix(in srgb, ${color} 30%, transparent)`;
                e.currentTarget.style.boxShadow = `0 8px 40px rgba(0,0,0,0.35)`;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}>
                {/* Glow */}
                <div style={{
                  position: "absolute", top: -30, right: -30,
                  width: 120, height: 120, borderRadius: "50%",
                  background: color, opacity: 0.05, filter: "blur(30px)",
                  pointerEvents: "none",
                }} />

                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `color-mix(in srgb, ${color} 12%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${color} 22%, transparent)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color, marginBottom: 18,
                }}>
                  {icon}
                </div>

                <h3 style={{
                  fontSize: 15, fontWeight: 700,
                  color: "var(--text-primary)", marginBottom: 10,
                  letterSpacing: "-0.01em",
                }}>{title}</h3>
                <p style={{
                  fontSize: 13, color: "var(--text-secondary)",
                  lineHeight: 1.65, marginBottom: 20,
                }}>{body}</p>

                {/* Tags */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: 11, fontWeight: 500,
                      color: "var(--text-muted)",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 999, padding: "2px 8px",
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ANALYTICS PREVIEW
      ══════════════════════════════════════════ */}
      <section style={{
        padding: "80px 24px",
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}>
            {/* Left — text */}
            <Reveal>
              <div>
                <div style={{
                  display: "inline-block",
                  fontSize: 11, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.1em",
                  color: "var(--accent)",
                  background: "var(--accent-muted)",
                  border: "1px solid rgba(0,212,170,0.25)",
                  borderRadius: 999, padding: "4px 12px",
                  marginBottom: 20,
                }}>
                  Analytics
                </div>
                <h2 style={{
                  fontSize: "clamp(26px, 3.5vw, 38px)",
                  fontWeight: 700, letterSpacing: "-0.025em",
                  color: "var(--text-primary)", lineHeight: 1.2, marginBottom: 16,
                }}>
                  Know exactly how interview-ready you are
                </h2>
                <p style={{
                  fontSize: 15, color: "var(--text-secondary)",
                  lineHeight: 1.65, marginBottom: 28,
                }}>
                  A composite readiness score built from four weighted signals — 
                  practice consistency, difficulty spread, average recall confidence,
                  and revision discipline. Not vanity metrics — actionable intelligence.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "Consistency", sublabel: "Active days in last 14", color: "var(--hard)", pct: 21 },
                    { label: "Difficulty Spread", sublabel: "% medium/hard problems", color: "var(--easy)", pct: 72 },
                    { label: "Avg Confidence", sublabel: "Across all solved problems", color: "var(--easy)", pct: 73 },
                    { label: "Revision Discipline", sublabel: "On-time review rate", color: "var(--accent)", pct: 57 },
                  ].map(({ label, sublabel, color, pct }, i) => (
                    <Reveal key={label} delay={i * 60}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{label}</span>
                            <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>{sublabel}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", color }}>
                            {pct}
                          </span>
                        </div>
                        <div style={{
                          height: 4, background: "var(--bg-elevated)",
                          borderRadius: 999, overflow: "hidden",
                        }}>
                          <div style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: color,
                            borderRadius: 999,
                            transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
                          }} />
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Right — readiness score circle */}
            <Reveal delay={200}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 28,
              }}>
                {/* Score donut */}
                <div style={{
                  position: "relative",
                  width: 200, height: 200,
                  flexShrink: 0,
                }}>
                  <svg viewBox="0 0 140 140" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                    <circle cx="70" cy="70" r="56" fill="none" stroke="var(--bg-elevated)" strokeWidth="12" />
                    <circle cx="70" cy="70" r="56" fill="none" stroke="var(--accent)"
                      strokeWidth="12" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.56)}`}
                      style={{ filter: "drop-shadow(0 0 8px rgba(0,212,170,0.4))", transition: "stroke-dashoffset 1.2s ease" }}
                    />
                  </svg>
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{
                      fontSize: 42, fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      color: "var(--accent)", lineHeight: 1,
                    }}>56</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>/ 100</span>
                    <span style={{
                      marginTop: 8, fontSize: 11, fontWeight: 700,
                      color: "var(--medium)",
                      background: "var(--medium-muted)",
                      border: "1px solid rgba(250,204,21,0.25)",
                      borderRadius: 999, padding: "2px 8px",
                    }}>Needs Work</span>
                  </div>
                </div>

                {/* Focus area hint */}
                <div style={{
                  width: "100%", maxWidth: 280,
                  padding: "16px 18px",
                  background: "var(--bg-elevated)",
                  border: "1px solid color-mix(in srgb, var(--medium) 22%, var(--border-subtle))",
                  borderRadius: 12,
                  display: "flex", alignItems: "flex-start", gap: 12,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: "var(--medium-muted)",
                    border: "1px solid rgba(250,204,21,0.22)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--medium)", marginTop: 1,
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>
                      Focus area detected
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      Your <span style={{ color: "var(--medium)", fontWeight: 600 }}>Sliding Window</span> confidence is lowest.
                      Practice 2 more problems this week.
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section style={{
        padding: "120px 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 400,
          background: "radial-gradient(ellipse, rgba(0,212,170,0.08) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none",
        }} />

        <Reveal>
          <div style={{ position: "relative", zIndex: 1, maxWidth: 560, margin: "0 auto" }}>
            <h2 style={{
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 700, letterSpacing: "-0.03em",
              color: "var(--text-primary)", lineHeight: 1.15,
              marginBottom: 16,
            }}>
              Start tracking smarter today.
            </h2>
            <p style={{
              fontSize: 16, color: "var(--text-secondary)",
              lineHeight: 1.65, marginBottom: 36,
            }}>
              Install the extension, solve your next problem, and watch everything
              track automatically. No setup. No friction.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="#"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "14px 28px",
                  background: "var(--accent)", color: "#0d0d0f",
                  borderRadius: "var(--radius-md)",
                  fontSize: 14, fontWeight: 700,
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 32px rgba(0,212,170,0.35)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "var(--accent-hover)";
                  e.currentTarget.style.boxShadow = "0 8px 40px rgba(0,212,170,0.5)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "var(--accent)";
                  e.currentTarget.style.boxShadow = "0 4px 32px rgba(0,212,170,0.35)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <IcoChrome /> Add to Chrome — Free
              </a>
              <Link href="/dashboard" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 28px",
                background: "transparent", color: "var(--text-primary)",
                borderRadius: "var(--radius-md)",
                fontSize: 14, fontWeight: 600,
                textDecoration: "none",
                border: "1px solid var(--border-mid)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "var(--bg-elevated)";
                e.currentTarget.style.borderColor = "var(--border-strong)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "var(--border-mid)";
              }}>
                Open Dashboard <IcoArrow />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "32px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: 1100,
        margin: "0 auto",
        flexWrap: "wrap",
        gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: "var(--accent-muted)",
            border: "1px solid rgba(0,212,170,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--accent)",
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>
            DSA Tracker
          </span>
          <span style={{ fontSize: 12, color: "var(--text-subtle)", marginLeft: 8 }}>
            — Built for engineers who take preparation seriously
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {["Features", "Dashboard", "GitHub"].map(label => (
            <a key={label} href="#" style={{
              fontSize: 12, color: "var(--text-muted)",
              textDecoration: "none", transition: "color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
              {label}
            </a>
          ))}
        </div>
      </footer>

    </div>
  );
}