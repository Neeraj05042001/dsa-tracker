"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavUser {
  name: string;
  email: string;
  avatar_url?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const GDRIVE_LINK = "https://drive.google.com/drive/folders/1Qw2aYu2_Em0Pu_cMUhMcKGiPvjiQcsY7?usp=sharing"; // Replace with actual Google Drive zip link

// ─── useInView hook ───────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
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

// ─── Counter ──────────────────────────────────────────────────────────────────
function Counter({ to, duration = 1600, suffix = "", prefix = "" }: {
  to: number; duration?: number; suffix?: string; prefix?: string;
}) {
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
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(eased * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, to, duration]);

  return <span ref={ref}>{prefix}{val}{suffix}</span>;
}

// ─── Reveal wrapper ───────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 32 }: {
  children: React.ReactNode; delay?: number; y?: number;
}) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : `translateY(${y}px)`,
      transition: `opacity 0.7s cubic-bezier(0.25,0.4,0.25,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IcoChrome = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" />
    <line x1="21.17" y1="8" x2="12" y2="8" />
    <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
    <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
  </svg>
);

const IcoArrow = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const IcoCode = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);

const IcoCheck = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IcoGithub = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const IcoZap = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IcoBrain = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.44-2.1 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.44-2.1 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

const IcoTarget = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);

const IcoRepeat = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

// ─── Extension Popup Mockup ───────────────────────────────────────────────────
function ExtensionPopup() {
  return (
    <div style={{
      width: 320,
      background: "var(--bg-surface)",
      border: "1px solid var(--border-mid)",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,212,170,0.12), 0 0 40px rgba(0,212,170,0.06)",
      fontSize: 12,
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px",
        background: "var(--bg-elevated)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: "var(--accent)", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <IcoCode />
          </div>
          <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>Memoize</span>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "3px 8px",
          background: "rgba(74,222,128,0.1)",
          border: "1px solid rgba(74,222,128,0.25)",
          borderRadius: 999,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#4ade80", letterSpacing: "0.04em" }}>ACCEPTED</span>
        </div>
      </div>

      {/* Problem info */}
      <div style={{ padding: "14px 16px 0" }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 10 }}>
          Auto-detected problem
        </div>
        <div style={{
          padding: "10px 12px",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 8, marginBottom: 10,
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 4 }}>
            3. Longest Substring Without Repeating Characters
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{
              fontSize: 10, fontWeight: 600, color: "var(--medium)",
              background: "var(--medium-muted)",
              border: "1px solid rgba(250,204,21,0.2)",
              borderRadius: 999, padding: "1px 7px",
            }}>Medium</span>
            <span style={{
              fontSize: 10, fontWeight: 600, color: "var(--lc-color)",
              background: "var(--lc-muted)",
              borderRadius: 999, padding: "1px 7px",
            }}>LeetCode</span>
            <span style={{
              fontSize: 10, fontWeight: 500, color: "var(--accent)",
              background: "var(--accent-muted)",
              borderRadius: 999, padding: "1px 7px",
            }}>Sliding Window</span>
          </div>
        </div>

        {/* Quick fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[
            { label: "Runtime", value: "76 ms", color: "var(--easy)" },
            { label: "Memory", value: "42.1 MB", color: "var(--accent)" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              padding: "8px 10px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 8,
            }}>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", fontWeight: 600, marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Confidence */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>
            Confidence to solve again?
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["Low", "Medium", "High"].map((label, i) => (
              <div key={label} style={{
                flex: 1, padding: "6px 0", textAlign: "center",
                borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer",
                background: i === 2 ? "var(--accent-muted)" : "var(--bg-elevated)",
                border: `1px solid ${i === 2 ? "rgba(0,212,170,0.4)" : "var(--border-subtle)"}`,
                color: i === 2 ? "var(--accent)" : "var(--text-muted)",
              }}>{label}</div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "0 16px 14px" }}>
        <div style={{
          width: "100%", padding: "11px 0",
          background: "var(--accent)", borderRadius: 8,
          fontSize: 13, fontWeight: 700, color: "#0d0d0f",
          textAlign: "center", cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,212,170,0.3)",
        }}>
          Add to Tracker →
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Mini Preview ────────────────────────────────────────────────────
function DashboardPreview() {
  const problems = [
    { name: "Two Sum", diff: "easy", pattern: "Hash Map", conf: 3, next: "In 12d" },
    { name: "Longest Substring", diff: "medium", pattern: "Sliding Window", conf: 2, next: "Tomorrow" },
    { name: "Median of Arrays", diff: "hard", pattern: "Binary Search", conf: 1, next: "Today" },
    { name: "Valid Parentheses", diff: "easy", pattern: "Stack", conf: 3, next: "In 8d" },
    { name: "LRU Cache", diff: "medium", pattern: "Design", conf: 2, next: "In 2d" },
  ];
  const diffColor = (d: string) =>
    d === "easy" ? "#4ade80" : d === "medium" ? "#facc15" : "#f87171";

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border-mid)",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(0,212,170,0.07)",
      width: "100%",
      fontSize: 12,
    }}>
      {/* Topbar */}
      <div style={{
        padding: "10px 16px",
        background: "var(--bg-elevated)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#f87171", "#facc15", "#4ade80"].map((c, i) => (
            <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.7 }} />
          ))}
        </div>
        <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4, fontFamily: "var(--font-mono)" }}>
          memoize.app/dashboard
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "var(--border-subtle)" }}>
        {[
          { label: "Total Solved", value: "147", color: "var(--accent)" },
          { label: "Avg Confidence", value: "73%", color: "var(--easy)" },
          { label: "Streak", value: "14 days", color: "#f97316" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: "12px 14px", background: "var(--bg-surface)", display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: 17, fontWeight: 700, fontFamily: "var(--font-mono)", color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Revision alert */}
      <div style={{
        margin: "10px 12px",
        padding: "8px 12px",
        background: "color-mix(in srgb, var(--medium) 8%, var(--bg-elevated))",
        border: "1px solid color-mix(in srgb, var(--medium) 22%, transparent)",
        borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--medium)" }} />
          <span style={{ fontSize: 11, color: "var(--medium)", fontWeight: 600 }}>3 problems due for revision today</span>
        </div>
        <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>Review →</span>
      </div>

      {/* Problem list */}
      <div style={{ padding: "0 0 4px" }}>
        <div style={{ padding: "6px 12px", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", fontWeight: 600 }}>
          Recent Problems
        </div>
        {problems.map((p, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 12px",
            borderTop: i === 0 ? "1px solid var(--border-subtle)" : "none",
            borderLeft: `2px solid ${p.conf === 1 ? "#f87171" : p.conf === 2 ? "#facc15" : "transparent"}`,
          }}>
            <span style={{
              fontSize: 9, fontWeight: 700, color: diffColor(p.diff),
              background: `color-mix(in srgb, ${diffColor(p.diff)} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${diffColor(p.diff)} 22%, transparent)`,
              borderRadius: 999, padding: "1px 5px", textTransform: "capitalize", flexShrink: 0,
            }}>{p.diff}</span>
            <span style={{ flex: 1, fontSize: 11, color: "var(--text-primary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {p.name}
            </span>
            <span style={{ fontSize: 9, color: "var(--accent)", background: "var(--accent-muted)", borderRadius: 999, padding: "1px 6px", flexShrink: 0 }}>
              {p.pattern}
            </span>
            <span style={{
              fontSize: 9, fontFamily: "var(--font-mono)", flexShrink: 0,
              color: p.next === "Today" ? "var(--hard)" : p.next === "Tomorrow" ? "var(--medium)" : "var(--text-muted)",
              fontWeight: p.next === "Today" ? 700 : 500,
            }}>{p.next}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePageClient({ user }: { user?: NavUser }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Animated headline — cycle through rotating words
  const rotatingWords = ["You've solved.", "You've grinded.", "You've practiced."];
  const [wordIdx, setWordIdx] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setWordIdx(i => (i + 1) % rotatingWords.length);
        setWordVisible(true);
      }, 350);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const patterns = [
    "Arrays", "Hash Map", "Two Pointers", "Sliding Window",
    "Binary Search", "BFS", "DFS", "Dynamic Programming",
    "Backtracking", "Stack", "Heap", "Graph",
    "Trie", "Greedy", "Divide & Conquer", "Design",
  ];

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ══════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 32px", height: 62,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(13,13,15,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(1.6)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.6)" : "none",
        borderBottom: scrolled ? "1px solid var(--border-subtle)" : "1px solid transparent",
        transition: "background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease",
      }}>
        {/* Logo */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 18px rgba(0,212,170,0.4)",
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d0d0f" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Memoize
          </span>
        </a>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[{ href: "#features", label: "Features" }, { href: "#how-it-works", label: "How it works" }].map(({ href, label }) => (
            <a key={href} href={href} style={{
              fontSize: 13, fontWeight: 500, color: "var(--text-muted)",
              textDecoration: "none", padding: "6px 12px", borderRadius: "var(--radius-md)",
              transition: "color var(--transition-fast), background var(--transition-fast)",
            }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-hover)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}>
              {label}
            </a>
          ))}
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", color: "var(--text-muted)",
            padding: "7px 9px", borderRadius: "var(--radius-md)",
            transition: "color var(--transition-fast), background var(--transition-fast)", textDecoration: "none",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-hover)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}>
            <IcoGithub />
          </a>

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Link href="/dashboard" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "5px 12px 5px 6px",
                background: "var(--bg-elevated)", borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border-mid)", textDecoration: "none",
                transition: "border-color var(--transition-fast), background var(--transition-fast)",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.background = "var(--bg-hover)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-mid)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "var(--accent-muted)", border: "1.5px solid rgba(0,212,170,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, color: "var(--accent)",
                  }}>{user.name.charAt(0).toUpperCase()}</div>
                )}
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.name}
                </span>
              </Link>
              <form action="/auth/signout" method="POST">
                <button type="submit" style={{
                  fontSize: 12, fontWeight: 500, color: "var(--text-muted)",
                  background: "none", border: "none", cursor: "pointer",
                  padding: "6px 8px", borderRadius: "var(--radius-md)",
                  transition: "color var(--transition-fast)",
                }}
                  onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                  onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <a href={GDRIVE_LINK} style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "8px 16px",
              background: "var(--accent)", color: "#0d0d0f",
              borderRadius: "var(--radius-md)", fontSize: 13, fontWeight: 700,
              textDecoration: "none", marginLeft: 4,
              transition: "background var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast)",
              boxShadow: "0 2px 12px rgba(0,212,170,0.25)",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-hover)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,212,170,0.4)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,212,170,0.25)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <IcoChrome /> Add to Chrome
            </a>
          )}
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section style={{
        minHeight: "100vh",
        display: "flex", alignItems: "center",
        padding: "120px 32px 80px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Radial grid */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)
          `,
          backgroundSize: "52px 52px",
          maskImage: "radial-gradient(ellipse 85% 75% at 50% 35%, black 30%, transparent 100%)",
        }} />

        {/* Teal glow — left */}
        <div style={{
          position: "absolute", top: "15%", left: "-5%", width: 600, height: 500,
          background: "radial-gradient(circle, rgba(0,212,170,0.09) 0%, transparent 65%)",
          filter: "blur(48px)", zIndex: 0, pointerEvents: "none",
        }} />
        {/* Blue accent — right */}
        <div style={{
          position: "absolute", top: "35%", right: "-8%", width: 500, height: 450,
          background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 65%)",
          filter: "blur(48px)", zIndex: 0, pointerEvents: "none",
        }} />
        {/* Bottom fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 180,
          background: "linear-gradient(to bottom, transparent, var(--bg-base))",
          zIndex: 1, pointerEvents: "none",
        }} />

        <div style={{
          position: "relative", zIndex: 2,
          maxWidth: 1180, margin: "0 auto", width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 72, alignItems: "center",
        }}>
          {/* Left — copy */}
          <div>
            {/* Eyebrow badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 12px 5px 8px",
              background: "var(--accent-muted)",
              border: "1px solid rgba(0,212,170,0.22)",
              borderRadius: 999, marginBottom: 28,
              animation: "fadeIn 0.6s both",
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: 4,
                background: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <IcoChrome size={10} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.01em" }}>
                Chrome Extension + Web Dashboard
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: "clamp(38px, 4.5vw, 60px)",
              fontWeight: 800, letterSpacing: "-0.035em",
              lineHeight: 1.08, color: "var(--text-primary)",
              marginBottom: 6,
              animation: "fadeIn 0.6s 80ms both",
            }}>
              Stop letting your
            </h1>
            {/* Rotating line */}
            <h1 style={{
              fontSize: "clamp(38px, 4.5vw, 60px)",
              fontWeight: 800, letterSpacing: "-0.035em",
              lineHeight: 1.08, marginBottom: 6,
              animation: "fadeIn 0.6s 80ms both",
              color: "var(--accent)",
              textShadow: "0 0 40px rgba(0,212,170,0.35)",
              minHeight: "1.1em",
              transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)",
              opacity: wordVisible ? 1 : 0,
              transform: wordVisible ? "translateY(0)" : "translateY(8px)",
            }}>
              {rotatingWords[wordIdx]}
            </h1>
            <h1 style={{
              fontSize: "clamp(38px, 4.5vw, 60px)",
              fontWeight: 800, letterSpacing: "-0.035em",
              lineHeight: 1.08, color: "var(--text-primary)",
              marginBottom: 24,
              animation: "fadeIn 0.6s 160ms both",
            }}>
              go to waste.
            </h1>

            <p style={{
              fontSize: 17, lineHeight: 1.7, color: "var(--text-secondary)",
              marginBottom: 36, maxWidth: 440,
              animation: "fadeIn 0.6s 240ms both",
            }}>
              Memoize auto-captures every accepted submission, schedules
              smart spaced reviews, and tells you exactly what to practice
              before your next interview — automatically.
            </p>

            {/* CTAs */}
            <div style={{
              display: "flex", gap: 12, flexWrap: "wrap",
              marginBottom: 28,
              animation: "fadeIn 0.6s 320ms both",
            }}>
              <a href={GDRIVE_LINK} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 26px",
                background: "var(--accent)", color: "#0d0d0f",
                borderRadius: "var(--radius-md)", fontSize: 14, fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 28px rgba(0,212,170,0.35)",
                transition: "all var(--transition-fast)",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-hover)"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(0,212,170,0.5)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.boxShadow = "0 4px 28px rgba(0,212,170,0.35)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <IcoChrome /> Add to Chrome — Free
              </a>
              <Link href="/dashboard" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 24px",
                background: "var(--bg-elevated)", color: "var(--text-primary)",
                borderRadius: "var(--radius-md)", fontSize: 14, fontWeight: 600,
                textDecoration: "none", border: "1px solid var(--border-mid)",
                transition: "all var(--transition-fast)",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.borderColor = "var(--border-mid)"; }}>
                Open Dashboard <IcoArrow />
              </Link>
            </div>

            {/* Trust signals */}
            <div style={{
              display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
              animation: "fadeIn 0.6s 400ms both",
            }}>
              {[
                { icon: <IcoCheck />, text: "100% free forever" },
                { icon: <IcoCheck />, text: "No account needed to start" },
                { icon: <IcoCheck />, text: "LeetCode & Codeforces" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ color: "var(--accent)", display: "flex" }}>{icon}</div>
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dashboard visual */}
          <div style={{ animation: "fadeIn 0.8s 200ms both" }}>
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════ */}
      <section style={{ padding: "0 32px 80px" }}>
        <div style={{
          maxWidth: 1180, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1, background: "var(--border-subtle)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
        }}>
          {[
            { num: 1000, suffix: "+", label: "Problems tracked", sublabel: "and counting" },
            { num: 2, suffix: "", label: "Platforms supported", sublabel: "LeetCode & Codeforces" },
            { num: 16, suffix: "", label: "Algorithm patterns", sublabel: "tracked & mapped" },
            { num: 2, suffix: " min", label: "To set up", sublabel: "start solving, not configuring" },
          ].map(({ num, suffix, label, sublabel }, i) => (
            <Reveal key={label} delay={i * 80}>
              <div style={{
                padding: "32px 28px",
                background: "var(--bg-surface)",
                display: "flex", flexDirection: "column", gap: 4,
              }}>
                <div style={{
                  fontSize: "clamp(28px, 3vw, 42px)",
                  fontWeight: 800, letterSpacing: "-0.04em",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-primary)",
                  lineHeight: 1,
                }}>
                  <Counter to={num} suffix={suffix} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginTop: 6 }}>{label}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{sublabel}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          THE PROBLEM
      ══════════════════════════════════════════ */}
      <section style={{ padding: "80px 32px", position: "relative" }}>
        {/* bg accent */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700, height: 400,
          background: "radial-gradient(ellipse, rgba(248,113,113,0.04) 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none", zIndex: 0,
        }} />

        <div style={{ maxWidth: 1180, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Reveal>
            <div style={{ marginBottom: 64 }}>
              <div style={{
                display: "inline-block", fontSize: 11, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "var(--hard)", marginBottom: 16,
                padding: "4px 10px",
                background: "var(--hard-muted)",
                border: "1px solid rgba(248,113,113,0.2)",
                borderRadius: 999,
              }}>The Problem</div>
              <h2 style={{
                fontSize: "clamp(28px, 3.5vw, 48px)",
                fontWeight: 800, letterSpacing: "-0.03em",
                lineHeight: 1.12, color: "var(--text-primary)",
                maxWidth: 580,
              }}>
                You're putting in the hours.{" "}
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>
                  Your brain isn't keeping up.
                </span>
              </h2>
            </div>
          </Reveal>

          {/* Problem cards — asymmetric layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 16 }}>
            {/* Card 1 — large */}
            <Reveal delay={0}>
              <div style={{
                padding: "36px 32px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-xl)",
                height: "100%",
                transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, marginBottom: 20,
                  background: "var(--hard-muted)",
                  border: "1px solid rgba(248,113,113,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--hard)",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12, letterSpacing: "-0.02em" }}>
                  Manual tracking falls apart by week 2
                </h3>
                <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.68 }}>
                  You open a Google Sheet. You log two problems. Life happens.
                  Three weeks later the spreadsheet has 4 rows and 200 missing solves.
                  Manual logging works until it doesn't — and it always doesn't.
                </p>
              </div>
            </Reveal>

            {/* Cards 2 & 3 — stacked */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Reveal delay={100}>
                <div style={{
                  padding: "28px 24px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-xl)",
                  transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, marginBottom: 16,
                    background: "var(--medium-muted)",
                    border: "1px solid rgba(250,204,21,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--medium)",
                  }}>
                    <IcoRepeat />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10, letterSpacing: "-0.02em" }}>
                    No spaced repetition
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65 }}>
                    You solved Binary Search in January. It's March. You have no idea
                    if you still remember the approach — until the interviewer asks.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={160}>
                <div style={{
                  padding: "28px 24px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-xl)",
                  transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, marginBottom: 16,
                    background: "var(--accent-muted)",
                    border: "1px solid rgba(0,212,170,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--accent)",
                  }}>
                    <IcoTarget />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10, letterSpacing: "-0.02em" }}>
                    Blind spots in your patterns
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65 }}>
                    100 problems done and you've accidentally skipped BFS, Backtracking,
                    and DP entirely. You won't know until the interview reveals it.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Card 4 — stat accent card */}
            <Reveal delay={220}>
              <div style={{
                padding: "28px 24px",
                background: "linear-gradient(135deg, rgba(0,212,170,0.06) 0%, var(--bg-surface) 60%)",
                border: "1px solid rgba(0,212,170,0.15)",
                borderRadius: "var(--radius-xl)",
                height: "100%",
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,212,170,0.3)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(0,212,170,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,212,170,0.15)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 20 }}>
                    The reality
                  </div>
                  <div style={{ fontSize: "clamp(40px, 5vw, 56px)", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)", letterSpacing: "-0.04em", lineHeight: 1 }}>
                    74%
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65, marginTop: 12 }}>
                    of engineers who grind 200+ problems still can't recall
                    solutions they've already solved under interview pressure.
                  </p>
                </div>
                <div style={{
                  marginTop: 24, padding: "12px 14px",
                  background: "var(--accent-muted)",
                  border: "1px solid rgba(0,212,170,0.2)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 13, color: "var(--accent)", fontWeight: 600, lineHeight: 1.5,
                }}>
                  The problem isn't effort — it's the absence of a system.
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <Reveal>
            <div style={{ marginBottom: 64 }}>
              <div style={{
                display: "inline-block", fontSize: 11, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "var(--accent)", marginBottom: 16,
                padding: "4px 10px",
                background: "var(--accent-muted)",
                border: "1px solid rgba(0,212,170,0.2)",
                borderRadius: 999,
              }}>How it works</div>
              <h2 style={{
                fontSize: "clamp(28px, 3.5vw, 48px)",
                fontWeight: 800, letterSpacing: "-0.03em",
                lineHeight: 1.12, color: "var(--text-primary)",
              }}>
                From submission to mastery{" "}
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>in 3 steps.</span>
              </h2>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            {/* Left — steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                {
                  num: "01",
                  title: "Solve & auto-capture",
                  body: "Accept a submission on LeetCode or Codeforces. The Memoize extension detects it instantly and auto-fills all metadata — problem name, difficulty, tags, runtime, memory. Zero manual work.",
                  color: "var(--accent)",
                  colorMuted: "var(--accent-muted)",
                  colorBorder: "rgba(0,212,170,0.2)",
                },
                {
                  num: "02",
                  title: "Add your context (10 seconds)",
                  body: "Rate your confidence, note your approach, flag it for review. The extension popup makes it instant. This is the data that makes spaced repetition actually work for you.",
                  color: "var(--medium)",
                  colorMuted: "var(--medium-muted)",
                  colorBorder: "rgba(250,204,21,0.2)",
                },
                {
                  num: "03",
                  title: "Review at the right time",
                  body: "The SM-2 algorithm schedules each problem for review just before you'd forget it. Your revision queue tells you exactly what to practice today — no guessing, no spreadsheets.",
                  color: "#60a5fa",
                  colorMuted: "rgba(96,165,250,0.1)",
                  colorBorder: "rgba(96,165,250,0.2)",
                },
              ].map(({ num, title, body, color, colorMuted, colorBorder }, i) => (
                <Reveal key={num} delay={i * 100}>
                  <div style={{ display: "flex", gap: 20, padding: "28px 0", borderBottom: i < 2 ? "1px solid var(--border-subtle)" : "none" }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: colorMuted, border: `1px solid ${colorBorder}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color,
                    }}>{num}</div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.01em" }}>
                        {title}
                      </h3>
                      <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.68 }}>
                        {body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}

              {/* Manual install note */}
              <Reveal delay={320}>
                <div style={{
                  marginTop: 24, padding: "16px 18px",
                  background: "color-mix(in srgb, var(--info) 6%, var(--bg-elevated))",
                  border: "1px solid rgba(96,165,250,0.18)",
                  borderRadius: "var(--radius-md)",
                  display: "flex", gap: 12, alignItems: "flex-start",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
                  </svg>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#60a5fa", marginBottom: 3 }}>Manual install (for now)</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                      The extension isn't on the Chrome Web Store yet — install it in under 2 minutes by downloading the zip,
                      unzipping it, and loading it via <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)", fontSize: 12 }}>chrome://extensions</span> → Enable Developer Mode → Load unpacked.
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right — Extension popup */}
            <Reveal delay={100} y={24}>
              <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
                {/* glow behind popup */}
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 340, height: 340,
                  background: "radial-gradient(circle, rgba(0,212,170,0.12) 0%, transparent 70%)",
                  filter: "blur(40px)", pointerEvents: "none",
                }} />
                <div style={{ position: "relative" }}>
                  <ExtensionPopup />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES — BENTO GRID
      ══════════════════════════════════════════ */}
      <section id="features" style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <Reveal>
            <div style={{ marginBottom: 56 }}>
              <div style={{
                display: "inline-block", fontSize: 11, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "var(--text-muted)", marginBottom: 16,
                padding: "4px 10px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-mid)",
                borderRadius: 999,
              }}>Features</div>
              <h2 style={{
                fontSize: "clamp(28px, 3.5vw, 48px)",
                fontWeight: 800, letterSpacing: "-0.03em",
                lineHeight: 1.12, color: "var(--text-primary)",
                maxWidth: 560,
              }}>
                Everything you need to actually{" "}
                <span style={{ color: "var(--accent)" }}>retain</span>
                {" "}what you practice.
              </h2>
            </div>
          </Reveal>

          {/* Bento */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gridTemplateRows: "auto auto", gap: 16 }}>

            {/* Feature 1 — tall left */}
            <Reveal>
              <div style={{
                gridRow: "span 2",
                padding: "32px 28px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-xl)",
                display: "flex", flexDirection: "column",
                height: "100%",
                transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,212,170,0.3)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(0,212,170,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 11, marginBottom: 20,
                  background: "var(--accent-muted)", border: "1px solid rgba(0,212,170,0.22)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)",
                }}>
                  <IcoZap />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10, letterSpacing: "-0.02em" }}>
                  Auto-capture from LeetCode & Codeforces
                </h3>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.68, marginBottom: 24 }}>
                  The Chrome extension detects every accepted submission and auto-fills
                  problem name, difficulty, tags, language, runtime, and memory.
                  Zero manual work — ever.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
                  {["Auto-detect", "Both platforms", "Zero config", "All metadata"].map(tag => (
                    <span key={tag} style={{
                      fontSize: 11, fontWeight: 600, color: "var(--accent)",
                      background: "var(--accent-muted)", borderRadius: 999, padding: "3px 9px",
                    }}>{tag}</span>
                  ))}
                </div>

                {/* Mini visual — submission detection */}
                <div style={{
                  marginTop: 28, padding: "14px",
                  background: "var(--bg-elevated)", borderRadius: 10,
                  border: "1px solid var(--border-subtle)", fontFamily: "var(--font-mono)",
                }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 8 }}>extension.log</div>
                  {[
                    { t: "▶", c: "var(--text-muted)", m: "Watching LeetCode..." },
                    { t: "✓", c: "var(--easy)", m: "Submission accepted" },
                    { t: "→", c: "var(--accent)", m: "Auto-captured: Two Sum" },
                    { t: "→", c: "var(--accent)", m: "Tags: [Array, Hash Map]" },
                    { t: "→", c: "var(--accent)", m: "Runtime: 62ms · 40.2MB" },
                  ].map(({ t, c, m }, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 11, color: c, marginBottom: 3 }}>
                      <span>{t}</span><span style={{ color: "var(--text-secondary)" }}>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Feature 2 */}
            <Reveal delay={80}>
              <div style={{
                padding: "28px 24px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-xl)",
                transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9, marginBottom: 16,
                  background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa",
                }}>
                  <IcoBrain />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.02em" }}>
                  SM-2 Spaced Repetition
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>
                  The proven SuperMemo 2 algorithm calculates the exact right time
                  to review each problem — you review just before you'd forget it.
                </p>
                <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
                  {["SM-2 Algorithm", "Smart scheduling"].map(tag => (
                    <span key={tag} style={{ fontSize: 11, color: "#60a5fa", background: "rgba(96,165,250,0.1)", borderRadius: 999, padding: "2px 8px", fontWeight: 600 }}>{tag}</span>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Feature 3 */}
            <Reveal delay={140}>
              <div style={{
                padding: "28px 24px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-xl)",
                transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9, marginBottom: 16,
                  background: "var(--medium-muted)", border: "1px solid rgba(250,204,21,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "var(--medium)",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, letterSpacing: "-0.02em" }}>
                  Readiness Score
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65 }}>
                  A 0–100 composite score across consistency, difficulty spread,
                  avg confidence, and revision discipline. Know your interview readiness at a glance.
                </p>
              </div>
            </Reveal>

            {/* Feature 4 — wide pattern map */}
            <Reveal delay={200}>
              <div style={{
                gridColumn: "2 / 4",
                padding: "28px 24px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-xl)",
                transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, marginBottom: 12,
                      background: "var(--easy-muted)", border: "1px solid rgba(74,222,128,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center", color: "var(--easy)",
                    }}>
                      <IcoTarget />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, letterSpacing: "-0.02em" }}>
                      Pattern Coverage Map
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 280 }}>
                      See exactly which patterns you've mastered and which you've never touched — across 16 core DSA categories.
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {patterns.map((p, i) => {
                    const mastered = [0, 1, 2, 3, 4, 8, 9].includes(i);
                    const partial = [5, 11].includes(i);
                    return (
                      <span key={p} style={{
                        fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
                        background: mastered ? "var(--easy-muted)" : partial ? "var(--medium-muted)" : "var(--bg-elevated)",
                        border: `1px solid ${mastered ? "rgba(74,222,128,0.22)" : partial ? "rgba(250,204,21,0.22)" : "var(--border-subtle)"}`,
                        color: mastered ? "var(--easy)" : partial ? "var(--medium)" : "var(--text-muted)",
                      }}>{p}</span>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ANALYTICS PREVIEW
      ══════════════════════════════════════════ */}
      <section style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

            {/* Left — copy */}
            <Reveal>
              <div>
                <div style={{
                  display: "inline-block", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "var(--text-muted)", marginBottom: 16,
                  padding: "4px 10px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-mid)",
                  borderRadius: 999,
                }}>Analytics</div>
                <h2 style={{
                  fontSize: "clamp(26px, 3vw, 42px)",
                  fontWeight: 800, letterSpacing: "-0.03em",
                  lineHeight: 1.15, color: "var(--text-primary)",
                  marginBottom: 16,
                }}>
                  Know exactly how{" "}
                  <span style={{ color: "var(--accent)" }}>interview-ready</span>{" "}
                  you are.
                </h2>
                <p style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 32 }}>
                  Your Readiness Score is built from four weighted signals — not vanity metrics.
                  It tells you precisely where to focus your next session.
                </p>

                {/* Score signals */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "Practice Consistency", sublabel: "Active days in last 14", val: 21, color: "var(--accent)" },
                    { label: "Difficulty Spread", sublabel: "% medium + hard problems", val: 72, color: "#60a5fa" },
                    { label: "Avg Confidence", sublabel: "Across all solved problems", val: 73, color: "var(--easy)" },
                    { label: "Revision Discipline", sublabel: "On-time review rate", val: 57, color: "var(--medium)" },
                  ].map(({ label, sublabel, val, color }) => (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{label}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sublabel}</div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-mono)", color }}>{val}</div>
                      </div>
                      <div style={{ height: 4, background: "var(--bg-elevated)", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ width: `${val}%`, height: "100%", background: color, borderRadius: 999, transition: "width 1s cubic-bezier(0.16,1,0.3,1)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Right — readiness gauge */}
            <Reveal delay={120}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
                {/* Score card */}
                <div style={{
                  width: "100%",
                  padding: "40px 32px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-mid)",
                  borderRadius: "var(--radius-xl)",
                  textAlign: "center",
                  boxShadow: "var(--shadow-md)",
                  position: "relative", overflow: "hidden",
                }}>
                  {/* Background glow */}
                  <div style={{
                    position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                    width: 300, height: 200,
                    background: "radial-gradient(ellipse, rgba(0,212,170,0.1) 0%, transparent 70%)",
                    filter: "blur(30px)", pointerEvents: "none",
                  }} />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
                      Readiness Score
                    </div>
                    <div style={{ fontSize: 80, fontWeight: 800, letterSpacing: "-0.05em", fontFamily: "var(--font-mono)", color: "var(--accent)", lineHeight: 1 }}>
                      56
                    </div>
                    <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4, marginBottom: 20 }}>/ 100</div>
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: "var(--medium)",
                      background: "var(--medium-muted)", border: "1px solid rgba(250,204,21,0.25)",
                      borderRadius: 999, padding: "4px 12px",
                    }}>Needs Work</span>
                  </div>
                </div>

                {/* Focus area */}
                <div style={{
                  width: "100%", padding: "18px 20px",
                  background: "var(--bg-elevated)",
                  border: "1px solid color-mix(in srgb, var(--medium) 22%, var(--border-subtle))",
                  borderRadius: "var(--radius-lg)",
                  display: "flex", alignItems: "flex-start", gap: 14,
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    background: "var(--medium-muted)", border: "1px solid rgba(250,204,21,0.22)",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "var(--medium)", marginTop: 1,
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2.5" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Focus area detected</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>
                      Your <span style={{ color: "var(--medium)", fontWeight: 700 }}>Sliding Window</span> confidence is lowest.
                      Practice 2 more problems this week to close the gap.
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
      <section style={{ padding: "80px 32px 120px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: 700, height: 500,
          background: "radial-gradient(ellipse, rgba(0,212,170,0.09) 0%, transparent 65%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />

        <Reveal>
          <div style={{
            maxWidth: 700, margin: "0 auto", textAlign: "center",
            padding: "64px 48px",
            background: "var(--bg-surface)",
            border: "1px solid rgba(0,212,170,0.18)",
            borderRadius: "var(--radius-xl)",
            position: "relative", zIndex: 1,
            boxShadow: "0 0 60px rgba(0,212,170,0.06), var(--shadow-lg)",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "4px 12px",
              background: "var(--accent-muted)",
              border: "1px solid rgba(0,212,170,0.22)",
              borderRadius: 999, marginBottom: 24,
              fontSize: 12, fontWeight: 600, color: "var(--accent)",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />
              Free forever · No account needed to start
            </div>

            <h2 style={{
              fontSize: "clamp(26px, 4vw, 44px)",
              fontWeight: 800, letterSpacing: "-0.03em",
              lineHeight: 1.12, color: "var(--text-primary)", marginBottom: 16,
            }}>
              Your next interview is closer
              <br />than you think.
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 36, maxWidth: 460, margin: "0 auto 36px" }}>
              Install Memoize, solve your next problem, and watch your entire
              history track automatically — with a review queue that keeps you sharp.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
              <a href={GDRIVE_LINK} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "15px 28px",
                background: "var(--accent)", color: "#0d0d0f",
                borderRadius: "var(--radius-md)", fontSize: 15, fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 32px rgba(0,212,170,0.4)",
                transition: "all var(--transition-fast)",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--accent-hover)"; e.currentTarget.style.boxShadow = "0 8px 48px rgba(0,212,170,0.55)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.boxShadow = "0 4px 32px rgba(0,212,170,0.4)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <IcoChrome /> Install the extension — it's free
              </a>
              <Link href="/dashboard" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "15px 24px",
                background: "transparent", color: "var(--text-primary)",
                borderRadius: "var(--radius-md)", fontSize: 15, fontWeight: 600,
                textDecoration: "none", border: "1px solid var(--border-mid)",
                transition: "all var(--transition-fast)",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border-mid)"; }}>
                Open Dashboard <IcoArrow />
              </Link>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-subtle)" }}>
              Takes under 2 minutes · Works on LeetCode & Codeforces · Zero config
            </p>
          </div>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "32px 32px",
      }}>
        <div style={{
          maxWidth: 1180, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7,
              background: "var(--accent-muted)", border: "1px solid rgba(0,212,170,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "-0.01em" }}>Memoize</span>
            <span style={{ fontSize: 12, color: "var(--text-subtle)", marginLeft: 4 }}>— Solve once. Master forever.</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {[
              { label: "Features", href: "#features" },
              { label: "How it works", href: "#how-it-works" },
              { label: "Dashboard", href: "/dashboard" },
              { label: "GitHub", href: "https://github.com" },
            ].map(({ label, href }) => (
              <a key={label} href={href} style={{
                fontSize: 12, color: "var(--text-muted)", textDecoration: "none",
                transition: "color var(--transition-fast)",
              }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}>
                {label}
              </a>
            ))}
          </div>

          <div style={{ fontSize: 12, color: "var(--text-subtle)" }}>
            © {new Date().getFullYear()} Memoize
          </div>
        </div>
      </footer>

    </div>
  );
}