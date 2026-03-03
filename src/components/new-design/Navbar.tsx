"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";

const GDRIVE_LINK = "https://drive.google.com/your-zip-link-here";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
];

function MemoizeLogo() {
  return (
    <Link href="/" aria-label="Memoize home"
      style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
    >
      <div style={{
        width: 32, height: 32,
        borderRadius: "var(--radius-md)",
        background: "var(--accent-muted)",
        border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        transition: "box-shadow var(--transition-fast)",
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 5L1 8L3 11" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 5L15 8L13 11" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 3L6 13" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <span style={{
        fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 16,
        letterSpacing: "-0.02em", color: "var(--text-primary)",
      }}>
        Memoize
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color var(--transition-fast);
        }
        .nav-link:hover { color: var(--text-primary); }

        .nav-mobile-item {
          display: block;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all var(--transition-fast);
        }
        .nav-mobile-item:hover {
          color: var(--text-primary);
          background: var(--bg-hover);
        }
      `}</style>

      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: 60,
        display: "flex", alignItems: "center",
        paddingLeft: "clamp(16px, 4vw, 40px)",
        paddingRight: "clamp(16px, 4vw, 40px)",
        background: scrolled
          ? "color-mix(in srgb, var(--bg-base) 88%, transparent)"
          : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border-subtle)" : "1px solid transparent",
        transition: shouldReduceMotion
          ? "none"
          : "background var(--transition-slow), border-color var(--transition-slow)",
      }}>

        <MemoizeLogo />

        {/* Desktop nav — hidden below 768px */}
        <nav className="nav-desktop" style={{ gap: 28, marginLeft: 36 }} aria-label="Primary navigation">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">{link.label}</a>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Desktop CTAs — hidden below 768px */}
        <div className="nav-ctas" style={{ alignItems: "center", gap: 10 }}>
          <Link href="/login" className="btn btn-ghost" style={{ fontSize: 13, padding: "6px 14px" }}>
            Sign in
          </Link>
          <a href={GDRIVE_LINK} target="_blank" rel="noopener noreferrer"
            className="btn btn-primary" style={{ fontSize: 13, padding: "6px 16px", gap: 7 }}>
            <ChromeIcon />
            Add to Chrome — Free
          </a>
        </div>

        {/* Mobile hamburger — hidden above 768px */}
        <button
          className="nav-mobile-btn btn-icon"
          style={{ marginLeft: 8 }}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{
          position: "fixed", top: 60, left: 0, right: 0, zIndex: 49,
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "16px clamp(16px, 4vw, 40px) 20px",
          display: "flex", flexDirection: "column", gap: 4,
          animation: shouldReduceMotion ? "none" : "fadeIn var(--transition-base) both",
        }}>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="nav-mobile-item"
              onClick={() => setMobileOpen(false)}>
              {link.label}
            </a>
          ))}
          <div style={{ height: 1, background: "var(--border-subtle)", margin: "8px 0" }} />
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
        </div>
      )}
    </>
  );
}

function ChromeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="2.6" fill="currentColor" />
      <path d="M7 4.4H12.5C11.6 2.6 9.5 1.4 7 1.4C4.5 1.4 2.4 2.6 1.5 4.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2.4 5.5L5.2 9.8C5.7 10.6 6.3 11.2 7 11.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M11.6 5.5L8.8 9.8C8.3 10.6 7.7 11.2 7 11.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4.5H14M2 8H14M2 11.5H14" stroke="var(--text-primary)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 3L13 13M13 3L3 13" stroke="var(--text-primary)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}