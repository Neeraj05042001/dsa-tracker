"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion, motion, AnimatePresence } from "framer-motion";
import type { NavUser } from "@/components/HomePageClient-6";

const GDRIVE_LINK = "https://drive.google.com/your-zip-link-here";

const NAV_LINKS = [
  { label: "Features",     href: "#features"    },
  { label: "How it works", href: "#how-it-works" },
];

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ user, size = 30 }: { user: NavUser; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const initials = user.name
    .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "var(--accent-muted)",
      border: "1.5px solid color-mix(in srgb, var(--accent) 40%, transparent)",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
      boxShadow: "0 0 0 2px color-mix(in srgb, var(--accent) 12%, transparent)",
    }}>
      {user.avatar_url && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatar_url} alt={user.name}
          onError={() => setImgError(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: size * 0.36,
          fontWeight: 700, color: "var(--accent)",
          letterSpacing: "-0.02em", lineHeight: 1,
        }}>{initials}</span>
      )}
    </div>
  );
}

// ─── Profile dropdown ─────────────────────────────────────────────────────────
function ProfileDropdown({ user, onClose }: { user: NavUser; onClose: () => void }) {
  const reduce = useReducedMotion();

  const menuItems = [
    {
      label: "Dashboard", href: "/dashboard",
      icon: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><rect x="7.5" y="1" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="7.5" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/><rect x="7.5" y="7.5" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.2"/></svg>,
    },
    {
      label: "My Problems", href: "/dashboard/problems",
      icon: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3h9M2 6.5h6M2 10h7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
    },
    {
      label: "Revision Queue", href: "/dashboard/revision",
      icon: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6.5 3.5v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    },
    {
      label: "Analytics", href: "/dashboard/analytics",
      icon: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 10.5L4.5 7l3 2 3.5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: reduce ? 0 : -4, scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "absolute", top: "calc(100% + 10px)", right: 0,
        width: 240,
        background: "var(--bg-surface)",
        border: "1px solid var(--border-mid)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px var(--border-subtle)",
        overflow: "hidden", zIndex: 100,
      }}
    >
      {/* Teal top accent */}
      <div style={{
        height: 2,
        background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
      }} />

      {/* User info */}
      <div style={{
        padding: "14px 16px", borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <Avatar user={user} size={36} />
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
            color: "var(--text-primary)", letterSpacing: "-0.01em",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{user.name}</div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{user.email}</div>
        </div>
      </div>

      {/* Menu items */}
      <div style={{ padding: "6px" }}>
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={onClose}
            style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "9px 10px", borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-sans)", fontSize: 13,
              color: "var(--text-secondary)", textDecoration: "none",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "var(--bg-hover)";
              el.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "transparent";
              el.style.color = "var(--text-secondary)";
            }}
          >
            <span style={{ color: "var(--text-muted)", flexShrink: 0 }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* Sign out */}
      <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "6px" }}>
        <Link href="/auth/signout" onClick={onClose}
          style={{
            display: "flex", alignItems: "center", gap: 9,
            padding: "9px 10px", borderRadius: "var(--radius-md)",
            fontFamily: "var(--font-sans)", fontSize: 13,
            color: "var(--text-muted)", textDecoration: "none",
            transition: "all var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "color-mix(in srgb, var(--hard) 8%, transparent)";
            el.style.color = "var(--hard)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "transparent";
            el.style.color = "var(--text-muted)";
          }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M5 2H2.5A1.5 1.5 0 001 3.5v6A1.5 1.5 0 002.5 11H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M8.5 9L12 6.5 8.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 6.5H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Sign out
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function MemoizeLogo() {
  return (
    <Link href="/" aria-label="Memoize home"
      style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
      <div style={{
        width: 32, height: 32, borderRadius: "var(--radius-md)",
        background: "var(--accent-muted)",
        border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        transition: "box-shadow var(--transition-fast)",
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 5L1 8L3 11"   stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13 5L15 8L13 11" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 3L6 13"       stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </div>
      <span style={{
        fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 16,
        letterSpacing: "-0.02em", color: "var(--text-primary)",
      }}>Memoize</span>
    </Link>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
interface NavbarProps { user?: NavUser | null; }

export default function Navbar({ user }: NavbarProps) {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen,   setDropOpen]   = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const reduce  = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!dropOpen) return;
    const onDown = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        setDropOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [dropOpen]);

  return (
    <>
      <style>{`
        .nav-desktop    { display: none !important; }
        .nav-ctas       { display: none !important; }
        .nav-mobile-btn { display: flex !important; }

        @media (min-width: 768px) {
          .nav-desktop    { display: flex !important; }
          .nav-ctas       { display: flex !important; }
          .nav-mobile-btn { display: none !important; }
        }

        .nav-link {
          font-family: var(--font-sans); font-size: 13px; font-weight: 500;
          color: var(--text-secondary); text-decoration: none;
          transition: color var(--transition-fast);
        }
        .nav-link:hover { color: var(--text-primary); }

        .nav-mobile-item {
          display: block; padding: 10px 12px; border-radius: var(--radius-md);
          font-family: var(--font-sans); font-size: 14px; font-weight: 500;
          color: var(--text-secondary); text-decoration: none;
          transition: all var(--transition-fast);
        }
        .nav-mobile-item:hover { color: var(--text-primary); background: var(--bg-hover); }

        .nav-avatar-btn {
          display: flex; align-items: center; gap: 7px;
          background: transparent; border: none; cursor: pointer;
          padding: 4px 8px 4px 4px; border-radius: var(--radius-pill);
          transition: background var(--transition-fast);
        }
        .nav-avatar-btn:hover { background: var(--bg-hover); }

        .nav-chevron { color: var(--text-muted); transition: transform var(--transition-fast); }
        .nav-chevron.open { transform: rotate(180deg); }
      `}</style>

      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 60,
        display: "flex", alignItems: "center",
        paddingLeft: "clamp(16px, 4vw, 40px)", paddingRight: "clamp(16px, 4vw, 40px)",
        background: scrolled ? "color-mix(in srgb, var(--bg-base) 88%, transparent)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border-subtle)" : "1px solid transparent",
        transition: reduce ? "none" : "background var(--transition-slow), border-color var(--transition-slow)",
      }}>

        <MemoizeLogo />

        <nav className="nav-desktop" style={{ gap: 28, marginLeft: 36 }}>
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav-link">{l.label}</a>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Desktop right */}
        <div className="nav-ctas" style={{ alignItems: "center", gap: 10 }}>
          {user ? (
            <div ref={dropRef} style={{ position: "relative" }}>
              <button
                className="nav-avatar-btn"
                onClick={() => setDropOpen((v) => !v)}
                aria-label="Profile menu" aria-expanded={dropOpen}
              >
                <Avatar user={user} size={30} />
                <span style={{
                  fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500,
                  color: "var(--text-primary)", maxWidth: 120,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{user.name.split(" ")[0]}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                  className={`nav-chevron${dropOpen ? " open" : ""}`}>
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <AnimatePresence>
                {dropOpen && <ProfileDropdown user={user} onClose={() => setDropOpen(false)} />}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost" style={{ fontSize: 13, padding: "6px 14px" }}>
                Sign in
              </Link>
              <a href={GDRIVE_LINK} target="_blank" rel="noopener noreferrer"
                className="btn btn-primary" style={{ fontSize: 13, padding: "6px 16px", gap: 7 }}>
                <ChromeIcon />
                Add to Chrome — Free
              </a>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="nav-mobile-btn btn-icon" style={{ marginLeft: 8 }}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}>
          {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{
          position: "fixed", top: 60, left: 0, right: 0, zIndex: 49,
          background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)",
          padding: "16px clamp(16px, 4vw, 40px) 20px",
          display: "flex", flexDirection: "column", gap: 4,
          animation: reduce ? "none" : "fadeIn var(--transition-base) both",
        }}>
          {/* Signed-in user row */}
          {user && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", marginBottom: 4,
              background: "var(--bg-elevated)", borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
            }}>
              <Avatar user={user} size={32} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.name}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.email}
                </div>
              </div>
            </div>
          )}

          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav-mobile-item"
              onClick={() => setMobileOpen(false)}>{l.label}</a>
          ))}

          <div style={{ height: 1, background: "var(--border-subtle)", margin: "8px 0" }} />

          {user ? (
            <>
              <Link href="/dashboard" className="nav-mobile-item" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <Link href="/auth/signout" className="nav-mobile-item"
                style={{ color: "var(--hard)" } as React.CSSProperties}
                onClick={() => setMobileOpen(false)}>
                Sign out
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost"
                style={{ justifyContent: "center", fontSize: 14 }}
                onClick={() => setMobileOpen(false)}>
                Sign in
              </Link>
              <a href={GDRIVE_LINK} target="_blank" rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ justifyContent: "center", fontSize: 14, marginTop: 4, gap: 7 }}
                onClick={() => setMobileOpen(false)}>
                <ChromeIcon />
                Add to Chrome — Free
              </a>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function ChromeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="2.6" fill="currentColor"/>
      <path d="M7 4.4H12.5C11.6 2.6 9.5 1.4 7 1.4C4.5 1.4 2.4 2.6 1.5 4.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M2.4 5.5L5.2 9.8C5.7 10.6 6.3 11.2 7 11.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M11.6 5.5L8.8 9.8C8.3 10.6 7.7 11.2 7 11.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function HamburgerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4.5H14M2 8H14M2 11.5H14" stroke="var(--text-primary)" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 3L13 13M13 3L3 13" stroke="var(--text-primary)" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}