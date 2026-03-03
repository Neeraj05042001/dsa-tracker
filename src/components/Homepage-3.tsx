"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
// import { createClient } from '@/lib/supabase'
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

interface User {
  email?: string | null;
  user_metadata?: { avatar_url?: string; full_name?: string; name?: string };
}
interface Props {
  user: User | null;
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Counter({
  to,
  suffix = "",
  prefix = "",
}: {
  to: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= to) {
        setCount(to);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 28);
    return () => clearInterval(timer);
  }, [inView, to]);
  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

function DashboardMockup() {
  const rows = [
    {
      title: "Two Sum",
      pl: "LC",
      diff: "Easy",
      dc: "#22c55e",
      tag: "Hash Map",
      dots: [1, 1, 1],
    },
    {
      title: "Longest Substring",
      pl: "LC",
      diff: "Medium",
      dc: "#f59e0b",
      tag: "Sliding Window",
      dots: [1, 1, 0],
    },
    {
      title: "Merge Intervals",
      pl: "LC",
      diff: "Medium",
      dc: "#f59e0b",
      tag: "Sorting",
      dots: [1, 0, 0],
    },
    {
      title: "Valid Parentheses",
      pl: "LC",
      diff: "Easy",
      dc: "#22c55e",
      tag: "Stack",
      dots: [1, 1, 1],
    },
  ];
  return (
    <div
      style={{
        background: "#111118",
        borderRadius: 14,
        width: "100%",
        maxWidth: 580,
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "#0d0d14",
          borderRadius: "14px 14px 0 0",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {["#ff5f56", "#ffbd2e", "#27c93f"].map((c, i) => (
            <div
              key={i}
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
            maxWidth: 220,
            margin: "0 auto",
            textAlign: "center",
            fontSize: 11,
            color: "#52525b",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 5,
            padding: "3px 10px",
          }}
        >
          memoize-navy.vercel.app/dashboard
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {[
          ["TOTAL SOLVED", "21", "#00d4aa"],
          ["AVG CONFIDENCE", "73%", "#f59e0b"],
          ["STREAK", "4 days", "#f97316"],
        ].map(([l, v, c], i) => (
          <div
            key={i}
            style={{
              padding: "12px 16px",
              borderRight:
                i < 2 ? "1px solid rgba(255,255,255,0.06)" : undefined,
            }}
          >
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.08em",
                color: "#52525b",
                fontWeight: 500,
                marginBottom: 3,
              }}
            >
              {l}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: c,
                fontFamily: "Syne,sans-serif",
              }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>
      {rows.map((r, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.08 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "9px 16px",
            borderBottom:
              i < rows.length - 1
                ? "1px solid rgba(255,255,255,0.04)"
                : undefined,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                padding: "2px 5px",
                borderRadius: 4,
                background: "rgba(0,212,170,0.1)",
                color: "#00d4aa",
              }}
            >
              {r.pl}
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                padding: "2px 6px",
                borderRadius: 4,
                background: "rgba(255,255,255,0.06)",
                color: r.dc,
              }}
            >
              {r.diff}
            </span>
            <span style={{ fontSize: 12, color: "#e4e4e7", fontWeight: 500 }}>
              {r.title}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                fontSize: 11,
                color: "#52525b",
                background: "rgba(255,255,255,0.04)",
                padding: "2px 8px",
                borderRadius: 4,
              }}
            >
              {r.tag}
            </span>
            <div style={{ display: "flex", gap: 3 }}>
              {r.dots.map((d, j) => (
                <div
                  key={j}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: d ? "#00d4aa" : "rgba(255,255,255,0.1)",
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75 }}
        style={{
          padding: "10px 16px",
          background: "rgba(0,212,170,0.06)",
          borderTop: "1px solid rgba(0,212,170,0.14)",
          borderRadius: "0 0 14px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 12, color: "#00d4aa", fontWeight: 500 }}>
          3 problems due for revision today
        </span>
        <span style={{ fontSize: 11, color: "rgba(0,212,170,0.6)" }}>
          Open queue →
        </span>
      </motion.div>
    </div>
  );
}

function ExtensionPopup() {
  return (
    <div
      style={{
        width: 256,
        background: "#111118",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 5,
              background: "linear-gradient(135deg,#00d4aa,#00b894)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 800,
              color: "#09090f",
              fontFamily: "Syne,sans-serif",
            }}
          >
            M
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#f4f4f5",
              fontFamily: "Syne,sans-serif",
            }}
          >
            Memoize
          </span>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#22c55e",
            letterSpacing: "0.05em",
          }}
        >
          ● ACCEPTED
        </span>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ marginBottom: 10 }}>
          <div
            style={{
              fontSize: 9,
              color: "#52525b",
              marginBottom: 4,
              letterSpacing: "0.07em",
              fontWeight: 600,
            }}
          >
            PROBLEM NAME
          </div>
          <div
            style={{
              padding: "7px 10px",
              borderRadius: 6,
              fontSize: 12,
              color: "#e4e4e7",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            Two Sum
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 9,
                color: "#52525b",
                marginBottom: 4,
                letterSpacing: "0.07em",
                fontWeight: 600,
              }}
            >
              PLATFORM
            </div>
            <div
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                fontSize: 11,
                color: "#e4e4e7",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.07)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              LeetCode <span style={{ color: "#52525b" }}>▾</span>
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 9,
                color: "#52525b",
                marginBottom: 4,
                letterSpacing: "0.07em",
                fontWeight: 600,
              }}
            >
              DIFFICULTY
            </div>
            <div style={{ display: "flex", gap: 3 }}>
              {["Easy", "Med", "Hard"].map((d, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "4px 2px",
                    borderRadius: 5,
                    fontSize: 9,
                    fontWeight: 600,
                    background:
                      i === 0
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(255,255,255,0.04)",
                    border: `1px solid ${i === 0 ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.07)"}`,
                    color: i === 0 ? "#22c55e" : "#52525b",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 9,
                color: "#52525b",
                letterSpacing: "0.07em",
                fontWeight: 600,
              }}
            >
              TAGS
            </span>
            <span
              style={{
                fontSize: 8,
                padding: "1px 5px",
                borderRadius: 3,
                background: "rgba(0,212,170,0.1)",
                color: "#00d4aa",
                fontWeight: 600,
              }}
            >
              AUTO-FILLED
            </span>
          </div>
          <div
            style={{
              padding: "7px 10px",
              borderRadius: 6,
              fontSize: 11,
              color: "#52525b",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            Array, Hash Map
          </div>
        </div>
        <div
          style={{
            padding: 9,
            borderRadius: 7,
            textAlign: "center",
            background: "linear-gradient(135deg,#00d4aa,#00b894)",
            fontSize: 12,
            fontWeight: 700,
            color: "#09090f",
            cursor: "pointer",
            fontFamily: "Syne,sans-serif",
          }}
        >
          Add to Tracker →
        </div>
      </div>
    </div>
  );
}

export default function HomePageClient({ user }: Props) {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const handleSignOut = async () => {
    // const supabase = createClient()
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  const GDRIVE_LINK = "https://drive.google.com/your-link-here"; // ← replace this

  const displayName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.user_metadata?.name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; background: #09090f; color: #f4f4f5; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #09090f; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        .f-d { font-family: 'Syne', sans-serif; }
        .grid-bg::before { content:''; position:absolute; inset:0; pointer-events:none; z-index:0;
          background-image: linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 52px 52px; }
        .hero-glow::after { content:''; position:absolute; top:-150px; left:50%; transform:translateX(-50%);
          width:900px; height:600px; pointer-events:none;
          background:radial-gradient(ellipse at center, rgba(0,212,170,0.09) 0%, transparent 65%); }
        .chip { display:inline-flex; align-items:center; gap:7px; font-family:'Syne',sans-serif; font-size:11px; font-weight:600;
          letter-spacing:0.09em; text-transform:uppercase; color:#00d4aa; padding:5px 13px; border-radius:20px;
          background:rgba(0,212,170,0.07); border:1px solid rgba(0,212,170,0.16); }
        .btn-p { display:inline-flex; align-items:center; gap:8px; padding:12px 26px; border-radius:10px;
          font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#09090f; text-decoration:none;
          background:linear-gradient(135deg,#00d4aa 0%,#00b894 100%); border:none; cursor:pointer;
          transition:all 0.2s ease; }
        .btn-p:hover { transform:translateY(-2px); box-shadow:0 10px 32px rgba(0,212,170,0.28); }
        .btn-p:active { transform:translateY(0); }
        .btn-s { display:inline-flex; align-items:center; gap:8px; padding:12px 26px; border-radius:10px;
          font-family:'Syne',sans-serif; font-size:14px; font-weight:600; color:#e4e4e7; text-decoration:none;
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); cursor:pointer; transition:all 0.2s ease; }
        .btn-s:hover { background:rgba(255,255,255,0.09); border-color:rgba(255,255,255,0.18); transform:translateY(-2px); }
        .nav-a { font-size:13px; color:#71717a; text-decoration:none; padding:6px 12px; transition:color 0.18s ease; }
        .nav-a:hover { color:#f4f4f5; }
        .divider { height:1px; background:rgba(255,255,255,0.06); }
        .card { padding:28px; border-radius:14px; border:1px solid rgba(255,255,255,0.07); background:rgba(255,255,255,0.02);
          transition:all 0.28s cubic-bezier(0.16,1,0.3,1); }
        .card:hover { border-color:rgba(0,212,170,0.2); transform:translateY(-4px); background:rgba(0,212,170,0.02); }
        @media (max-width:768px) {
          .two-col { grid-template-columns:1fr !important; }
          .four-col { grid-template-columns:1fr 1fr !important; }
          .hide-m { display:none !important; }
        }
      `}</style>

      <div
        style={{
          background: "#09090f",
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        {/* NAVBAR */}
        <motion.nav
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            borderBottom:
              scrollY > 20
                ? "1px solid rgba(255,255,255,0.06)"
                : "1px solid transparent",
            backdropFilter: scrollY > 20 ? "blur(24px) saturate(180%)" : "none",
            background: scrollY > 20 ? "rgba(9,9,15,0.92)" : "transparent",
            transition: "all 0.3s ease",
          }}
        >
          <div
            style={{
              maxWidth: 1180,
              margin: "0 auto",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 62,
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
                  borderRadius: 9,
                  background: "linear-gradient(135deg,#00d4aa,#00b894)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#09090f",
                  fontFamily: "Syne,sans-serif",
                  boxShadow: "0 4px 14px rgba(0,212,170,0.22)",
                }}
              >
                M
              </div>
              <span
                className="f-d"
                style={{ fontWeight: 700, fontSize: 17, color: "#f4f4f5" }}
              >
                Memoize
              </span>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <a href="#features" className="nav-a hide-m">
                Features
              </a>
              <a href="#how-it-works" className="nav-a hide-m">
                How it works
              </a>
              <div
                style={{
                  width: 1,
                  height: 18,
                  background: "rgba(255,255,255,0.1)",
                  margin: "0 4px",
                }}
                className="hide-m"
              />
              <a
                href={GDRIVE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "Syne,sans-serif",
                  color: "#00d4aa",
                  textDecoration: "none",
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "rgba(0,212,170,0.07)",
                  border: "1px solid rgba(0,212,170,0.16)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(0,212,170,0.13)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(0,212,170,0.07)")
                }
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Extension
              </a>
              {user ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Link
                    href="/dashboard"
                    className="btn-p"
                    style={{ padding: "7px 16px", fontSize: 13 }}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    title="Sign out"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <img
                      src={
                        user.user_metadata?.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=00d4aa&color=09090f&bold=true`
                      }
                      alt={displayName}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        border: "2px solid rgba(0,212,170,0.3)",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="btn-p"
                  style={{ padding: "7px 18px", fontSize: 13 }}
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </motion.nav>

        {/* HERO */}
        <section
          className="grid-bg hero-glow"
          style={{
            position: "relative",
            paddingTop: 164,
            paddingBottom: 80,
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 28,
              }}
            >
              <span className="chip">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                Chrome Extension + Web Dashboard · 100% Free
              </span>
            </motion.div>

            <motion.h1
              className="f-d"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                fontSize: "clamp(42px,7vw,76px)",
                fontWeight: 800,
                lineHeight: 1.06,
                letterSpacing: "-0.03em",
                color: "#f4f4f5",
                maxWidth: 820,
                margin: "0 auto 18px",
                padding: "0 24px",
              }}
            >
              Your LeetCode grind
              <br />
              <span style={{ color: "#00d4aa" }}>shouldn't go to waste.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.32,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                fontSize: 16,
                color: "#71717a",
                maxWidth: 490,
                margin: "0 auto 36px",
                lineHeight: 1.72,
                padding: "0 24px",
              }}
            >
              Auto-captures every LeetCode & Codeforces solve. Schedules smart
              reviews with SM-2. You walk into interviews remembering
              everything.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.46,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 22,
                padding: "0 24px",
              }}
            >
              <motion.a
                whileTap={{ scale: 0.97 }}
                href={GDRIVE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-p"
                style={{ fontSize: 15, padding: "13px 28px" }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Add to Chrome — Free
              </motion.a>
              <motion.div whileTap={{ scale: 0.97 }}>
                <Link
                  href={user ? "/dashboard" : "/login"}
                  className="btn-s"
                  style={{ fontSize: 15, padding: "13px 28px" }}
                >
                  Open Dashboard →
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.62 }}
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 24,
                marginBottom: 64,
                flexWrap: "wrap",
                padding: "0 24px",
              }}
            >
              {[
                "No account needed to start",
                "LeetCode & Codeforces",
                "Zero manual work",
              ].map((t, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 12,
                    color: "#52525b",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    fill="none"
                    stroke="#00d4aa"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {t}
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.58,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "0 24px",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  width: 640,
                  height: 320,
                  background:
                    "radial-gradient(ellipse, rgba(0,212,170,0.07) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <DashboardMockup />
            </motion.div>
          </div>
        </section>

        {/* STATS */}
        <div className="divider" />
        <section style={{ padding: "32px 24px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div
              className="four-col"
              style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}
            >
              {[
                { to: 21, s: "+", p: "", l: "Problems tracked" },
                { to: 2, s: "", p: "", l: "Platforms supported" },
                { to: 16, s: "", p: "", l: "Algorithm patterns" },
                { to: 2, s: " min", p: "<", l: "Minutes to set up" },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "16px 8px",
                      borderRight:
                        i < 3 ? "1px solid rgba(255,255,255,0.06)" : undefined,
                    }}
                  >
                    <div
                      className="f-d"
                      style={{
                        fontSize: 30,
                        fontWeight: 800,
                        color: "#00d4aa",
                        lineHeight: 1,
                        marginBottom: 5,
                      }}
                    >
                      <Counter to={s.to} suffix={s.s} prefix={s.p} />
                    </div>
                    <div style={{ fontSize: 12, color: "#52525b" }}>{s.l}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        <div className="divider" />

        {/* THE PROBLEM */}
        <section
          style={{ padding: "96px 24px", maxWidth: 1100, margin: "0 auto" }}
        >
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <Reveal>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                <span className="chip">The Problem</span>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <h2
                className="f-d"
                style={{ fontSize:'clamp(24px, 3vw, 38px)', fontWeight:800, lineHeight:1.15, letterSpacing:'-0.015em', color:'#f4f4f5', marginBottom:14 }}
              >
                You're solving problems.
                <br />
                <span style={{ color: "#71717a" }}>
                  You're not retaining them.
                </span>
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <p
                style={{
                  fontSize: 15,
                  color: "#71717a",
                  maxWidth: 480,
                  margin: "0 auto",
                  lineHeight: 1.72,
                }}
              >
                Most engineers grind 200+ problems before interviews — but
                struggle to recall approaches they solved weeks ago. The issue
                isn't effort. It's the system.
              </p>
            </Reveal>
          </div>
          <div
            className="two-col"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 16,
            }}
          >
            {[
              {
                icon: "📋",
                title: "Spreadsheet chaos",
                desc: "Manually logging problems into Google Sheets. Half the metadata is missing. You stop doing it after week 2.",
                color: "#ef4444",
              },
              {
                icon: "🔁",
                title: "No spaced repetition",
                desc: "You solved a problem in January. Now it's March. You have no idea if you still remember the approach.",
                color: "#f59e0b",
              },
              {
                icon: "🗺️",
                title: "No pattern awareness",
                desc: "You've done 50 problems but don't realize you've never touched BFS, DFS, or Dynamic Programming.",
                color: "#8b5cf6",
              },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <motion.div
                  className="card"
                  whileHover={{ y: -4 }}
                  style={{ position: "relative", overflow: "hidden" }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: `linear-gradient(90deg,${c.color}66,transparent)`,
                    }}
                  />
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 11,
                      background: `${c.color}14`,
                      border: `1px solid ${c.color}24`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      marginBottom: 16,
                    }}
                  >
                    {c.icon}
                  </div>
                  <div
                    className="f-d"
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#f4f4f5",
                      marginBottom: 8,
                    }}
                  >
                    {c.title}
                  </div>
                  <div
                    style={{ fontSize: 13, color: "#71717a", lineHeight: 1.65 }}
                  >
                    {c.desc}
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" style={{ padding: "96px 24px" }}>
          <div
            className="divider"
            style={{ maxWidth: 1100, margin: "0 auto 96px" }}
          />
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <Reveal>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <span className="chip">How it works</span>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <h2
                  className="f-d"
                  style={{
                    fontSize: "clamp(28px,4.5vw,46px)",
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: "-0.025em",
                    color: "#f4f4f5",
                  }}
                >
                  From submission to mastery
                  <br />
                  in <span style={{ color: "#00d4aa" }}>3 steps.</span>
                </h2>
              </Reveal>
            </div>
            <div
              className="two-col"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 80,
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 40 }}
              >
                {[
                  {
                    n: "1",
                    icon: "⚡",
                    title: "Solve & auto-capture",
                    desc: "Accept a submission on LeetCode or Codeforces. The extension detects it and auto-fills name, difficulty, tags, runtime, and memory. Zero manual work.",
                  },
                  {
                    n: "2",
                    icon: "🎯",
                    title: "Add your context",
                    desc: "Rate your confidence, note your approach, flag for revision. Takes 10 seconds inside the popup — while the solve is still fresh.",
                  },
                  {
                    n: "3",
                    icon: "🔁",
                    title: "Review at the right time",
                    desc: "SM-2 calculates exactly when you're about to forget. Your daily queue tells you precisely what to practice. No guessing, no wasted reviews.",
                  },
                ].map((s, i) => (
                  <Reveal key={i} delay={i * 0.1}>
                    <div
                      style={{
                        display: "flex",
                        gap: 18,
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 11,
                          background: "rgba(0,212,170,0.08)",
                          border: "1px solid rgba(0,212,170,0.18)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 20,
                          flexShrink: 0,
                        }}
                      >
                        {s.icon}
                      </div>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 6,
                          }}
                        >
                          <span
                            className="f-d"
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#00d4aa",
                              letterSpacing: "0.1em",
                            }}
                          >
                            0{s.n}
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: 1,
                              background: "rgba(0,212,170,0.13)",
                            }}
                          />
                        </div>
                        <div
                          className="f-d"
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#f4f4f5",
                            marginBottom: 6,
                          }}
                        >
                          {s.title}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#71717a",
                            lineHeight: 1.65,
                          }}
                        >
                          {s.desc}
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
              <Reveal delay={0.15}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        position: "absolute",
                        inset: "-40px",
                        background:
                          "radial-gradient(ellipse, rgba(0,212,170,0.08) 0%, transparent 70%)",
                        pointerEvents: "none",
                      }}
                    />
                    <motion.div
                      animate={{ y: [0, -7, 0] }}
                      transition={{
                        duration: 4.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <ExtensionPopup />
                    </motion.div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" style={{ padding: "96px 24px" }}>
          <div
            className="divider"
            style={{ maxWidth: 1100, margin: "0 auto 96px" }}
          />
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <Reveal>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <span className="chip">Features</span>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <h2
                  className="f-d"
                  style={{
                    fontSize: "clamp(28px,4.5vw,46px)",
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: "-0.025em",
                    color: "#f4f4f5",
                    marginBottom: 12,
                  }}
                >
                  Everything you need to
                  <br />
                  <span style={{ color: "#00d4aa" }}>master DSA.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.15}>
                <p
                  style={{
                    fontSize: 15,
                    color: "#71717a",
                    maxWidth: 420,
                    margin: "0 auto",
                    lineHeight: 1.7,
                  }}
                >
                  Built specifically for engineers preparing for technical
                  interviews.
                </p>
              </Reveal>
            </div>
            <div
              className="two-col"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {[
                {
                  icon: "⚡",
                  title: "Auto-capture from LeetCode & Codeforces",
                  desc: "The Chrome extension detects accepted submissions and auto-fills problem name, difficulty, tags, language, runtime, and memory. Zero manual work.",
                  color: "#00d4aa",
                  tags: ["Chrome Extension", "Auto-detect", "Both platforms"],
                  glow: "rgba(0,212,170,0.06)",
                },
                {
                  icon: "🔁",
                  title: "SM-2 Spaced Repetition Scheduling",
                  desc: "The proven SuperMemo 2 algorithm calculates the exact right time to review each problem — so you review just before you'd forget, maximising retention.",
                  color: "#a855f7",
                  tags: [
                    "SM-2 Algorithm",
                    "Smart scheduling",
                    "Retention science",
                  ],
                  glow: "rgba(168,85,247,0.05)",
                },
                {
                  icon: "📊",
                  title: "Readiness Score & Analytics",
                  desc: "A composite score across consistency, difficulty spread, average confidence, and revision discipline. Know exactly how interview-ready you are at a glance.",
                  color: "#f59e0b",
                  tags: ["Readiness score", "4 dimensions", "Trend tracking"],
                  glow: "rgba(245,158,11,0.05)",
                },
                {
                  icon: "🗺️",
                  title: "Pattern Coverage Map",
                  desc: "See which algorithm patterns you've mastered and which you've never touched. 16 foundational patterns tracked — Sliding Window, BFS, DFS, DP, Backtracking.",
                  color: "#22c55e",
                  tags: ["16 patterns", "Gap analysis", "Focus areas"],
                  glow: "rgba(34,197,94,0.05)",
                },
              ].map((f, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <motion.div
                    className="card"
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      minHeight: 220,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: 200,
                        height: 200,
                        background: `radial-gradient(ellipse at top right, ${f.glow} 0%, transparent 70%)`,
                        pointerEvents: "none",
                      }}
                    />
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 11,
                        background: `${f.color}14`,
                        border: `1px solid ${f.color}24`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                        marginBottom: 18,
                      }}
                    >
                      {f.icon}
                    </div>
                    <div
                      className="f-d"
                      style={{
                        fontSize: 17,
                        fontWeight: 700,
                        color: "#f4f4f5",
                        marginBottom: 10,
                      }}
                    >
                      {f.title}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#71717a",
                        lineHeight: 1.65,
                        marginBottom: 14,
                      }}
                    >
                      {f.desc}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {f.tags.map((t, j) => (
                        <span
                          key={j}
                          style={{
                            fontSize: 11,
                            padding: "3px 9px",
                            borderRadius: 6,
                            background: "rgba(255,255,255,0.05)",
                            color: "#71717a",
                            border: "1px solid rgba(255,255,255,0.07)",
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ANALYTICS */}
        <section style={{ padding: "96px 24px" }}>
          <div
            className="divider"
            style={{ maxWidth: 1100, margin: "0 auto 96px" }}
          />
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div
              className="two-col"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 80,
                alignItems: "center",
              }}
            >
              <div>
                <Reveal>
                  <div style={{ marginBottom: 20 }}>
                    <span className="chip">Analytics</span>
                  </div>
                </Reveal>
                <Reveal delay={0.1}>
                  <h2
                    className="f-d"
                    style={{
                      fontSize: "clamp(26px,4vw,42px)",
                      fontWeight: 800,
                      lineHeight: 1.1,
                      letterSpacing: "-0.025em",
                      color: "#f4f4f5",
                      marginBottom: 14,
                    }}
                  >
                    Know exactly how
                    <br />
                    <span style={{ color: "#00d4aa" }}>
                      interview-ready
                    </span>{" "}
                    you are.
                  </h2>
                </Reveal>
                <Reveal delay={0.15}>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#71717a",
                      lineHeight: 1.75,
                      marginBottom: 32,
                    }}
                  >
                    A composite readiness score built from four weighted signals
                    — practice consistency, difficulty spread, average recall
                    confidence, and revision discipline. Not vanity metrics —
                    actionable intelligence.
                  </p>
                </Reveal>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 20 }}
                >
                  {[
                    {
                      label: "Consistency",
                      sub: "Active days in last 14",
                      score: 21,
                      color: "#ef4444",
                      pct: 21,
                    },
                    {
                      label: "Difficulty Spread",
                      sub: "% medium/hard problems",
                      score: 72,
                      color: "#00d4aa",
                      pct: 72,
                    },
                    {
                      label: "Avg Confidence",
                      sub: "Across all solved problems",
                      score: 73,
                      color: "#00d4aa",
                      pct: 73,
                    },
                    {
                      label: "Revision Discipline",
                      sub: "On-time review rate",
                      score: 57,
                      color: "#f59e0b",
                      pct: 57,
                    },
                  ].map((r, i) => (
                    <Reveal key={i} delay={0.2 + i * 0.06}>
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 6,
                          }}
                        >
                          <div>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#e4e4e7",
                              }}
                            >
                              {r.label}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                color: "#52525b",
                                marginLeft: 8,
                              }}
                            >
                              {r.sub}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: r.color,
                            }}
                          >
                            {r.score}
                          </span>
                        </div>
                        <div
                          style={{
                            height: 4,
                            borderRadius: 2,
                            background: "rgba(255,255,255,0.07)",
                            overflow: "hidden",
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${r.pct}%` }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.8,
                              delay: 0.3 + i * 0.06,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            style={{
                              height: "100%",
                              borderRadius: 2,
                              background: r.color,
                            }}
                          />
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
              <Reveal delay={0.2}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 18,
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: 200,
                      height: 200,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      width="200"
                      height="200"
                      style={{
                        position: "absolute",
                        transform: "rotate(-90deg)",
                      }}
                    >
                      <circle
                        cx="100"
                        cy="100"
                        r="82"
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="10"
                      />
                      <motion.circle
                        cx="100"
                        cy="100"
                        r="82"
                        fill="none"
                        stroke="#00d4aa"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 82}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 82 }}
                        whileInView={{
                          strokeDashoffset: 2 * Math.PI * 82 * 0.44,
                        }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 1.2,
                          delay: 0.3,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        style={{
                          filter: "drop-shadow(0 0 8px rgba(0,212,170,0.4))",
                        }}
                      />
                    </svg>
                    <div style={{ textAlign: "center", zIndex: 1 }}>
                      <div
                        className="f-d"
                        style={{
                          fontSize: 44,
                          fontWeight: 800,
                          color: "#00d4aa",
                          lineHeight: 1,
                        }}
                      >
                        56
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#52525b",
                          marginBottom: 6,
                        }}
                      >
                        / 100
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#f59e0b",
                          background: "rgba(245,158,11,0.1)",
                          padding: "2px 10px",
                          borderRadius: 4,
                          border: "1px solid rgba(245,158,11,0.2)",
                        }}
                      >
                        Needs Work
                      </div>
                    </div>
                  </div>
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                    style={{
                      padding: "16px 20px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.03)",
                      maxWidth: 260,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: "rgba(245,158,11,0.1)",
                          border: "1px solid rgba(245,158,11,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        💡
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#e4e4e7",
                            marginBottom: 4,
                          }}
                        >
                          Focus area detected
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#71717a",
                            lineHeight: 1.6,
                          }}
                        >
                          Your{" "}
                          <span style={{ color: "#00d4aa", fontWeight: 600 }}>
                            Sliding Window
                          </span>{" "}
                          confidence is lowest. Practice 2 more problems this
                          week.
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{ padding: "96px 24px" }}>
          <div
            className="divider"
            style={{ maxWidth: 1100, margin: "0 auto 96px" }}
          />
          <Reveal>
            <div
              style={{
                maxWidth: 680,
                margin: "0 auto",
                textAlign: "center",
                padding: "60px 40px",
                borderRadius: 20,
                border: "1px solid rgba(0,212,170,0.12)",
                background: "rgba(0,212,170,0.03)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -60,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 400,
                  height: 300,
                  background:
                    "radial-gradient(ellipse, rgba(0,212,170,0.09) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  className="f-d"
                  style={{
                    fontSize: "clamp(26px,4vw,40px)",
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: "-0.025em",
                    color: "#f4f4f5",
                    marginBottom: 14,
                  }}
                >
                  Start tracking smarter
                  <br />
                  <span style={{ color: "#00d4aa" }}>today.</span>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "#71717a",
                    lineHeight: 1.75,
                    marginBottom: 30,
                    maxWidth: 420,
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  Install the extension, solve your next problem, and watch
                  everything track automatically. No setup. No friction.
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={GDRIVE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-p"
                    style={{ fontSize: 15, padding: "13px 28px" }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Add to Chrome — Free
                  </motion.a>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={user ? "/dashboard" : "/login"}
                      className="btn-s"
                      style={{ fontSize: 15, padding: "13px 28px" }}
                    >
                      Open Dashboard →
                    </Link>
                  </motion.div>
                </div>
                <div style={{ marginTop: 18, fontSize: 12, color: "#3f3f46" }}>
                  No account needed · Works on LeetCode & Codeforces
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* FOOTER */}
        <footer
          style={{
            padding: "36px 24px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
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
              gap: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: "linear-gradient(135deg,#00d4aa,#00b894)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#09090f",
                  fontFamily: "Syne,sans-serif",
                }}
              >
                M
              </div>
              <span
                className="f-d"
                style={{ fontWeight: 700, fontSize: 14, color: "#52525b" }}
              >
                Memoize
              </span>
              <span style={{ fontSize: 12, color: "#3f3f46" }}>
                — Solve once. Master forever.
              </span>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              <a
                href="#features"
                style={{
                  fontSize: 12,
                  color: "#52525b",
                  textDecoration: "none",
                }}
              >
                Features
              </a>
              <Link
                href="/dashboard"
                style={{
                  fontSize: 12,
                  color: "#52525b",
                  textDecoration: "none",
                }}
              >
                Dashboard
              </Link>
              <a
                href={GDRIVE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12,
                  color: "#52525b",
                  textDecoration: "none",
                }}
              >
                Download Extension
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
