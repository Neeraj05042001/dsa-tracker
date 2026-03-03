"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface User {
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

export default function HomePageClient({ user }: { user?: User | null }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.[0]?.toUpperCase() ?? "U");

  return (
    <div
      style={{
        background: "var(--bg-base)",
        minHeight: "100vh",
        fontFamily: "var(--font-sans)",
        color: "var(--text-primary)",
        overflowX: "hidden",
      }}
    >
      {/* DOT GRID BACKGROUND */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* NAVBAR */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 60,
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: scrolled ? "rgba(13,13,15,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(18px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px)" : "none",
          borderBottom: scrolled
            ? "1px solid var(--border-subtle)"
            : "1px solid transparent",
          transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: "var(--accent)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(0,212,170,0.35)",
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0d0d0f"
              strokeWidth="2.8"
              strokeLinecap="round"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "var(--text-primary)",
            }}
          >
            Memoize
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[
            ["Features", "#features"],
            ["How it works", "#how-it-works"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: 8,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              {label}
            </a>
          ))}
          <a
            href="https://github.com/Neeraj05042001/dsa-tracker"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--text-muted)",
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              borderRadius: 8,
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-muted)")
            }
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          {user ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginLeft: 8,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  border: "2px solid var(--accent)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--accent)",
                  background: "var(--accent-muted)",
                }}
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  initials
                )}
              </div>
              <Link
                href="/dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 16px",
                  background: "var(--accent)",
                  color: "#0d0d0f",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--accent-hover)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--accent)";
                  e.currentTarget.style.transform = "none";
                }}
              >
                Open Dashboard
              </Link>
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "7px 12px",
                    borderRadius: 8,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--text-primary)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--text-muted)")
                  }
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              style={{
                marginLeft: 8,
                display: "inline-flex",
                alignItems: "center",
                padding: "7px 18px",
                background: "var(--accent)",
                color: "#0d0d0f",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                boxShadow: "0 0 20px rgba(0,212,170,0.25)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent-hover)";
                e.currentTarget.style.boxShadow =
                  "0 0 28px rgba(0,212,170,0.4)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--accent)";
                e.currentTarget.style.boxShadow =
                  "0 0 20px rgba(0,212,170,0.25)";
                e.currentTarget.style.transform = "none";
              }}
            >
              Get Started Free
            </Link>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 24px 80px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 800,
            height: 500,
            background:
              "radial-gradient(ellipse, rgba(0,212,170,0.07) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 32,
            padding: "6px 16px",
            background: "var(--accent-muted)",
            border: "1px solid rgba(0,212,170,0.28)",
            borderRadius: "var(--radius-pill)",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--accent)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 6px var(--accent)",
            }}
          />
          Chrome Extension + Web Dashboard — 100% Free
        </div>

        <h1
          style={{
            fontSize: "clamp(52px, 7.5vw, 88px)",
            fontWeight: 800,
            letterSpacing: "-0.035em",
            lineHeight: 1.08,
            marginBottom: 24,
            maxWidth: 820,
          }}
        >
          <span style={{ color: "var(--text-primary)", display: "block" }}>
            Solve once.
          </span>
          <span
            style={{
              display: "block",
              background:
                "linear-gradient(130deg, #00d4aa 0%, #00c4e8 55%, #a78bfa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Master forever.
          </span>
        </h1>

        <p
          style={{
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "var(--text-secondary)",
            lineHeight: 1.75,
            maxWidth: 560,
            marginBottom: 44,
          }}
        >
          Memoize auto-captures every LeetCode & Codeforces solve, schedules
          smart spaced reviews using SM-2, and shows your exact interview
          readiness — so nothing falls through the cracks.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 28,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <a
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              padding: "13px 26px",
              background: "var(--accent)",
              color: "#0d0d0f",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              boxShadow: "0 0 28px rgba(0,212,170,0.28)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent-hover)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 32px rgba(0,212,170,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--accent)";
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 0 28px rgba(0,212,170,0.28)";
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <line x1="21.17" y1="8" x2="12" y2="8" />
              <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
              <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
            </svg>
            Add to Chrome — Free
          </a>
          <Link
            href={user ? "/dashboard" : "/login"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 26px",
              background: "transparent",
              color: "var(--text-primary)",
              border: "1px solid var(--border-mid)",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-strong)";
              e.currentTarget.style.background = "var(--bg-elevated)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-mid)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            Open Dashboard
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 72,
          }}
        >
          {[
            "No account needed to start",
            "LeetCode & Codeforces",
            "100% free",
          ].map((text) => (
            <div
              key={text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "var(--text-muted)",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {text}
            </div>
          ))}
        </div>

        {/* DASHBOARD MOCKUP */}
        <div style={{ width: "100%", maxWidth: 940, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              bottom: -60,
              left: "5%",
              right: "5%",
              height: 120,
              background:
                "radial-gradient(ellipse, rgba(0,212,170,0.12) 0%, transparent 70%)",
              filter: "blur(24px)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-mid)",
              borderRadius: 18,
              overflow: "hidden",
              boxShadow:
                "0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{
                padding: "11px 16px",
                background: "var(--bg-elevated)",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", gap: 6 }}>
                {["#ff5f57", "#ffbd2e", "#28c840"].map((c) => (
                  <div
                    key={c}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: c,
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  flex: 1,
                  background: "var(--bg-base)",
                  borderRadius: 6,
                  padding: "4px 14px",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  textAlign: "center",
                  maxWidth: 280,
                  margin: "0 auto",
                }}
              >
                memoize.app/dashboard
              </div>
            </div>
            <div
              style={{
                padding: "20px 24px 24px",
                background: "var(--bg-base)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                {[
                  {
                    label: "Total Solved",
                    value: "47",
                    color: "var(--text-primary)",
                  },
                  {
                    label: "Avg Confidence",
                    value: "73%",
                    color: "var(--accent)",
                  },
                  { label: "Streak", value: "12 days", color: "var(--medium)" },
                  { label: "Readiness", value: "82/100", color: "var(--easy)" },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 10,
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 5,
                      }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: s.color,
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "10px 14px",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Recent Problems
                  </span>
                </div>
                {[
                  {
                    name: "Two Sum",
                    diff: "Easy",
                    diffC: "var(--easy)",
                    diffBg: "rgba(74,222,128,0.1)",
                    pattern: "Two Pointers",
                    conf: 3,
                  },
                  {
                    name: "Longest Substring Without Repeating Characters",
                    diff: "Medium",
                    diffC: "var(--medium)",
                    diffBg: "rgba(250,204,21,0.1)",
                    pattern: "Sliding Window",
                    conf: 2,
                  },
                  {
                    name: "Median of Two Sorted Arrays",
                    diff: "Hard",
                    diffC: "var(--hard)",
                    diffBg: "rgba(248,113,113,0.1)",
                    pattern: "Binary Search",
                    conf: 1,
                  },
                  {
                    name: "Valid Parentheses",
                    diff: "Easy",
                    diffC: "var(--easy)",
                    diffBg: "rgba(74,222,128,0.1)",
                    pattern: "Stack",
                    conf: 3,
                  },
                ].map((p, i) => (
                  <div
                    key={p.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "9px 14px",
                      borderBottom:
                        i < 3 ? "1px solid var(--border-subtle)" : "none",
                    }}
                  >
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 600,
                        background: p.diffBg,
                        color: p.diffC,
                        flexShrink: 0,
                        minWidth: 52,
                        textAlign: "center",
                      }}
                    >
                      {p.diff}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-primary)",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.name}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--text-muted)",
                        background: "var(--bg-elevated)",
                        padding: "2px 8px",
                        borderRadius: 4,
                        flexShrink: 0,
                      }}
                    >
                      {p.pattern}
                    </span>
                    <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                      {[1, 2, 3].map((d) => (
                        <div
                          key={d}
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background:
                              d <= p.conf
                                ? p.conf === 1
                                  ? "var(--hard)"
                                  : p.conf === 2
                                    ? "var(--medium)"
                                    : "var(--easy)"
                                : "var(--border-mid)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    padding: "9px 14px",
                    background: "rgba(0,212,170,0.05)",
                    borderTop: "1px solid rgba(0,212,170,0.12)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--accent)",
                      fontWeight: 500,
                    }}
                  >
                    3 problems due for revision today
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--accent)",
                      cursor: "pointer",
                    }}
                  >
                    Review now →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "28px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
          }}
        >
          {[
            ["1k+", "Problems tracked"],
            ["2", "Platforms supported"],
            ["16", "Algorithm patterns"],
            ["< 2 min", "To get started"],
          ].map(([v, l], i) => (
            <div
              key={l}
              style={{
                textAlign: "center",
                padding: "4px 0",
                borderRight: i < 3 ? "1px solid var(--border-subtle)" : "none",
              }}
            >
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: "var(--accent)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "-0.02em",
                  marginBottom: 4,
                }}
              >
                {v}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* THE PROBLEM — BEFORE / AFTER */}
      <section
        style={{ position: "relative", zIndex: 1, padding: "100px 24px" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <span
              style={{
                display: "inline-block",
                padding: "4px 14px",
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.25)",
                borderRadius: "var(--radius-pill)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--hard)",
              }}
            >
              The Problem
            </span>
          </div>
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(34px, 5vw, 56px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.12,
              marginBottom: 16,
            }}
          >
            You're putting in the hours.
            <br />
            <span style={{ color: "var(--text-muted)" }}>
              The results aren't sticking.
            </span>
          </h2>
          <p
            style={{
              textAlign: "center",
              fontSize: 15,
              color: "var(--text-secondary)",
              maxWidth: 520,
              margin: "0 auto 64px",
              lineHeight: 1.75,
            }}
          >
            Most engineers grind 200+ problems but can't recall approaches they
            solved weeks ago. The issue isn't effort — it's the system.
          </p>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
          >
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid rgba(248,113,113,0.18)",
                borderRadius: 16,
                padding: 32,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background:
                    "linear-gradient(90deg, var(--hard), rgba(248,113,113,0.1))",
                }}
              />
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  background: "rgba(248,113,113,0.1)",
                  border: "1px solid rgba(248,113,113,0.2)",
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--hard)",
                  marginBottom: 24,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Without Memoize
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {[
                  [
                    "Manual spreadsheet logging",
                    "Copying names, links and notes by hand. You stop doing it after week 2.",
                  ],
                  [
                    "No spaced repetition",
                    "You solved it in January. It's March. Zero idea if you still remember the approach.",
                  ],
                  [
                    "Zero pattern visibility",
                    "50 problems done but you've never touched BFS, DFS, or Dynamic Programming.",
                  ],
                  [
                    "Blind interview prep",
                    "No readiness score. No idea what to practise next. Just grinding in the dark.",
                  ],
                ].map(([t, d]) => (
                  <div
                    key={t}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "rgba(248,113,113,0.1)",
                        border: "1px solid rgba(248,113,113,0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--hard)"
                        strokeWidth="3"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          marginBottom: 3,
                        }}
                      >
                        {t}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          lineHeight: 1.65,
                        }}
                      >
                        {d}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid rgba(0,212,170,0.18)",
                borderRadius: 16,
                padding: 32,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background:
                    "linear-gradient(90deg, var(--accent), rgba(0,212,170,0.1))",
                }}
              />
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  background: "var(--accent-muted)",
                  border: "1px solid rgba(0,212,170,0.25)",
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--accent)",
                  marginBottom: 24,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                With Memoize
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {[
                  [
                    "Auto-captured on every solve",
                    "Extension detects your submission and fills everything in. Zero manual work required.",
                  ],
                  [
                    "SM-2 schedules your reviews",
                    "The algorithm tells you exactly when to revisit each problem — just before you forget.",
                  ],
                  [
                    "16-pattern coverage map",
                    "See every pattern you've practised and every gap you need to fill.",
                  ],
                  [
                    "Interview readiness score",
                    "A composite score across 4 signals. Know exactly where you stand.",
                  ],
                ].map(([t, d]) => (
                  <div
                    key={t}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "var(--accent-muted)",
                        border: "1px solid rgba(0,212,170,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          marginBottom: 3,
                        }}
                      >
                        {t}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          lineHeight: 1.65,
                        }}
                      >
                        {d}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        style={{
          position: "relative",
          zIndex: 1,
          padding: "100px 24px",
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span
              style={{
                display: "inline-block",
                padding: "4px 14px",
                background: "var(--accent-muted)",
                border: "1px solid rgba(0,212,170,0.25)",
                borderRadius: "var(--radius-pill)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: 16,
              }}
            >
              How it works
            </span>
            <h2
              style={{
                fontSize: "clamp(30px, 4.5vw, 48px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
              }}
            >
              From submission to mastery
              <br />
              in 3 steps
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 32,
                left: "17%",
                right: "17%",
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, rgba(0,212,170,0.3), transparent)",
              }}
            />
            {[
              {
                num: "01",
                accent: "var(--accent)",
                badge: "Zero manual work",
                icon: (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                ),
                title: "Solve & auto-capture",
                desc: "Accept a submission on LeetCode or Codeforces. The extension detects it and auto-fills name, difficulty, tags, runtime, and memory.",
              },
              {
                num: "02",
                accent: "var(--info)",
                badge: "10 seconds to log",
                icon: (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                ),
                title: "Add your context",
                desc: "Rate confidence, note your approach, tag the pattern. The popup is right there while you're in the zone — takes 10 seconds.",
              },
              {
                num: "03",
                accent: "var(--medium)",
                badge: "SM-2 algorithm",
                icon: (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                  </svg>
                ),
                title: "Review at the right time",
                desc: "SM-2 calculates exactly when to resurface each problem — just before you'd forget. Your queue shows what to practise today.",
              },
            ].map((step) => (
              <div
                key={step.num}
                style={{ padding: "0 32px", textAlign: "center" }}
              >
                <div
                  style={{
                    position: "relative",
                    display: "inline-flex",
                    marginBottom: 28,
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-mid)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: step.accent,
                    }}
                  >
                    {step.icon}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -10,
                      width: 22,
                      height: 22,
                      background: step.accent,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 800,
                      color: "#0d0d0f",
                      fontFamily: "var(--font-mono)",
                      border: "2px solid var(--bg-surface)",
                    }}
                  >
                    {step.num}
                  </div>
                </div>
                <div
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 5,
                    fontSize: 10,
                    fontWeight: 700,
                    color: step.accent,
                    letterSpacing: "0.04em",
                    marginBottom: 14,
                  }}
                >
                  {step.badge}
                </div>
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 12,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    lineHeight: 1.75,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES BENTO */}
      <section
        id="features"
        style={{ position: "relative", zIndex: 1, padding: "100px 24px" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span
              style={{
                display: "inline-block",
                padding: "4px 14px",
                background: "var(--accent-muted)",
                border: "1px solid rgba(0,212,170,0.25)",
                borderRadius: "var(--radius-pill)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent)",
                marginBottom: 16,
              }}
            >
              Features
            </span>
            <h2
              style={{
                fontSize: "clamp(30px, 4.5vw, 48px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                marginBottom: 14,
              }}
            >
              Everything you need
              <br />
              to master DSA
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "var(--text-secondary)",
                maxWidth: 440,
                margin: "0 auto",
              }}
            >
              Built specifically for engineers preparing for technical
              interviews.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
              marginBottom: 16,
            }}
          >
            {/* Auto-capture - wide */}
            <div
              style={{
                gridColumn: "1 / 3",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-mid)",
                borderRadius: 16,
                padding: 32,
                position: "relative",
                overflow: "hidden",
                cursor: "default",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "rgba(0,212,170,0.3)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--border-mid)")
              }
            >
              <div
                style={{
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: 250,
                  height: 250,
                  background:
                    "radial-gradient(circle, rgba(0,212,170,0.06) 0%, transparent 65%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "var(--accent-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                  color: "var(--accent)",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 10,
                  letterSpacing: "-0.015em",
                }}
              >
                Auto-capture from LeetCode & Codeforces
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  lineHeight: 1.75,
                  marginBottom: 20,
                  maxWidth: 460,
                }}
              >
                The Chrome extension detects accepted submissions and auto-fills
                problem name, difficulty, tags, language, runtime, and memory.
                Zero manual entry — just solve and we handle the rest.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Chrome Extension", "Auto-detect", "Both platforms"].map(
                  (t) => (
                    <span
                      key={t}
                      style={{
                        padding: "4px 10px",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 6,
                        fontSize: 11,
                        color: "var(--text-muted)",
                      }}
                    >
                      {t}
                    </span>
                  ),
                )}
              </div>
            </div>

            {/* SM-2 */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-mid)",
                borderRadius: 16,
                padding: 32,
                position: "relative",
                overflow: "hidden",
                cursor: "default",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "rgba(96,165,250,0.3)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--border-mid)")
              }
            >
              <div
                style={{
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: 250,
                  height: 250,
                  background:
                    "radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 65%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(96,165,250,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                  color: "#60a5fa",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 10,
                  letterSpacing: "-0.015em",
                }}
              >
                SM-2 Spaced Repetition
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  lineHeight: 1.75,
                  marginBottom: 20,
                }}
              >
                The proven SuperMemo 2 algorithm schedules reviews exactly when
                you're about to forget — maximising retention with minimal
                effort.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  "SM-2 Algorithm",
                  "Smart scheduling",
                  "Retention science",
                ].map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "4px 10px",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: 6,
                      fontSize: 11,
                      color: "var(--text-muted)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
            }}
          >
            {/* Readiness */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-mid)",
                borderRadius: 16,
                padding: 32,
                position: "relative",
                overflow: "hidden",
                cursor: "default",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "rgba(74,222,128,0.3)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--border-mid)")
              }
            >
              <div
                style={{
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: 250,
                  height: 250,
                  background:
                    "radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 65%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(74,222,128,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                  color: "var(--easy)",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 10,
                  letterSpacing: "-0.015em",
                }}
              >
                Readiness Score & Analytics
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  lineHeight: 1.75,
                  marginBottom: 20,
                }}
              >
                A composite score across consistency, difficulty spread, avg
                confidence, and revision discipline. Not vanity metrics —
                actionable intelligence.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["Readiness score", "4 dimensions", "Trend tracking"].map(
                  (t) => (
                    <span
                      key={t}
                      style={{
                        padding: "4px 10px",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: 6,
                        fontSize: 11,
                        color: "var(--text-muted)",
                      }}
                    >
                      {t}
                    </span>
                  ),
                )}
              </div>
            </div>

            {/* Pattern Coverage - wide */}
            <div
              style={{
                gridColumn: "2 / 4",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-mid)",
                borderRadius: 16,
                padding: 32,
                position: "relative",
                overflow: "hidden",
                cursor: "default",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "rgba(250,204,21,0.3)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--border-mid)")
              }
            >
              <div
                style={{
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: 250,
                  height: 250,
                  background:
                    "radial-gradient(circle, rgba(250,204,21,0.05) 0%, transparent 65%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(250,204,21,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                  color: "var(--medium)",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 10,
                  letterSpacing: "-0.015em",
                }}
              >
                Pattern Coverage Map
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  lineHeight: 1.75,
                  marginBottom: 20,
                  maxWidth: 420,
                }}
              >
                See which algorithm patterns you've mastered and which you've
                never touched. 16 foundational patterns tracked with gap
                analysis and focus recommendations.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {[
                  ["Two Pointers", true],
                  ["Sliding Window", true],
                  ["Binary Search", true],
                  ["BFS", true],
                  ["DFS", false],
                  ["Dynamic Programming", false],
                  ["Greedy", true],
                  ["Backtracking", false],
                  ["Merge Intervals", false],
                  ["Bit Manip", true],
                  ["Top K", false],
                  ["Stack", true],
                ].map(([name, done]) => (
                  <span
                    key={name as string}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 500,
                      background: done
                        ? "var(--accent-muted)"
                        : "var(--bg-elevated)",
                      border: `1px solid ${done ? "rgba(0,212,170,0.3)" : "var(--border-subtle)"}`,
                      color: done ? "var(--accent)" : "var(--text-muted)",
                    }}
                  >
                    {name as string}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOR EVERYONE */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          padding: "100px 24px",
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2
              style={{
                fontSize: "clamp(30px, 4.5vw, 48px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                marginBottom: 14,
              }}
            >
              Built for every stage
              <br />
              of the journey
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "var(--text-secondary)",
                maxWidth: 440,
                margin: "0 auto",
              }}
            >
              Whether you're writing your first loop or grinding for FAANG —
              Memoize meets you where you are.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {[
              {
                label: "Just Starting Out",
                color: "var(--easy)",
                ca: "rgba(74,222,128,0.12)",
                cb: "rgba(74,222,128,0.2)",
                icon: (
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
                title: "Start with clarity",
                tagline: "No more forgetting where you left off.",
                perks: [
                  "Track every problem from day one",
                  "Never lose your approach notes",
                  "Build the habit automatically",
                  "See visible progress from problem #1",
                ],
              },
              {
                label: "Placement Prep",
                color: "var(--medium)",
                ca: "rgba(250,204,21,0.1)",
                cb: "rgba(250,204,21,0.2)",
                icon: (
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                ),
                title: "Prep with precision",
                tagline: "Know where you stand before the interview.",
                perks: [
                  "Readiness score out of 100",
                  "SM-2 ensures nothing gets forgotten",
                  "Focus on your weakest patterns first",
                  "Track confidence per problem",
                ],
              },
              {
                label: "FAANG / Competitive",
                color: "var(--hard)",
                ca: "rgba(248,113,113,0.1)",
                cb: "rgba(248,113,113,0.2)",
                icon: (
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ),
                title: "Grind with insight",
                tagline: "Go beyond the number — optimise your system.",
                perks: [
                  "Deep pattern gap analysis",
                  "Difficulty spread & consistency metrics",
                  "Revision discipline tracking",
                  "Full submission history & trends",
                ],
              },
            ].map((card) => (
              <div
                key={card.label}
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-mid)",
                  borderRadius: 16,
                  padding: 28,
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 48px rgba(0,0,0,0.3)";
                  e.currentTarget.style.borderColor = card.cb;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "var(--border-mid)";
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -30,
                    right: -30,
                    width: 140,
                    height: 140,
                    background: `radial-gradient(circle, ${card.ca} 0%, transparent 70%)`,
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "5px 12px",
                    background: card.ca,
                    border: `1px solid ${card.cb}`,
                    borderRadius: 7,
                    fontSize: 11,
                    fontWeight: 700,
                    color: card.color,
                    marginBottom: 20,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <span style={{ color: card.color }}>{card.icon}</span>
                  {card.label}
                </div>
                <h3
                  style={{
                    fontSize: 19,
                    fontWeight: 700,
                    marginBottom: 6,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginBottom: 20,
                    lineHeight: 1.5,
                    fontStyle: "italic",
                  }}
                >
                  {card.tagline}
                </p>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {card.perks.map((p) => (
                    <div
                      key={p}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: card.ca,
                          border: `1px solid ${card.cb}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        <svg
                          width="7"
                          height="7"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={card.color}
                          strokeWidth="3.5"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          lineHeight: 1.55,
                        }}
                      >
                        {p}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        style={{ position: "relative", zIndex: 1, padding: "120px 24px" }}
      >
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 600,
              height: 300,
              background:
                "radial-gradient(ellipse, rgba(0,212,170,0.07) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 32,
              padding: "6px 16px",
              background: "var(--accent-muted)",
              border: "1px solid rgba(0,212,170,0.25)",
              borderRadius: "var(--radius-pill)",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--accent)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--accent)",
                boxShadow: "0 0 6px var(--accent)",
              }}
            />
            Free forever — no credit card
          </div>
          <h2
            style={{
              fontSize: "clamp(36px, 5.5vw, 60px)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            Your next solve
            <br />
            <span
              style={{
                background:
                  "linear-gradient(130deg, #00d4aa 0%, #00c4e8 55%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              shouldn't be forgotten.
            </span>
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "var(--text-secondary)",
              lineHeight: 1.75,
              marginBottom: 44,
            }}
          >
            Install the extension, solve your next problem, and watch everything
            track automatically. No setup. No friction. No cost.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "15px 30px",
                background: "var(--accent)",
                color: "#0d0d0f",
                borderRadius: 11,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: "none",
                boxShadow: "0 0 36px rgba(0,212,170,0.28)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent-hover)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 10px 40px rgba(0,212,170,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--accent)";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow =
                  "0 0 36px rgba(0,212,170,0.28)";
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="21.17" y1="8" x2="12" y2="8" />
                <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
                <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
              </svg>
              Add to Chrome — Free
            </a>
            <Link
              href={user ? "/dashboard" : "/login"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "15px 30px",
                background: "transparent",
                color: "var(--text-primary)",
                border: "1px solid var(--border-mid)",
                borderRadius: 11,
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-strong)";
                e.currentTarget.style.background = "var(--bg-elevated)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-mid)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              Open Dashboard
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <p
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginTop: 20,
              lineHeight: 1.6,
            }}
          >
            Having trouble signing in? Try switching to mobile data or a
            different network.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid var(--border-subtle)",
          padding: "28px 32px",
          background: "var(--bg-surface)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 24,
                height: 24,
                background: "var(--accent)",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0d0d0f"
                strokeWidth="2.8"
                strokeLinecap="round"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Memoize</span>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              — Solve once. Master forever.
            </span>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {[
              ["Features", "#features"],
              ["How it works", "#how-it-works"],
            ].map(([l, h]) => (
              <a
                key={h}
                href={h}
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--text-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--text-muted)")
                }
              >
                {l}
              </a>
            ))}
            <Link
              href={user ? "/dashboard" : "/login"}
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              Dashboard
            </Link>
            <a
              href="https://github.com/Neeraj05042001/dsa-tracker"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
