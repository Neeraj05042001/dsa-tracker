"use client";

import { motion } from "framer-motion";

interface TopbarProps {
  title: string;
  subtitle?: string;
  weekCount?: number;
}

function IconSearch({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

export function Topbar({ title, subtitle, weekCount = 0 }: TopbarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="topbar"
    >
      {/* Page title */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <h1 style={{
          fontSize: 16,
          fontWeight: 600,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          fontFamily: "var(--font-sans)",
        }}>
          {title}
        </h1>

        {subtitle && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {weekCount > 0 && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 20 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {/* Pulsing dot */}
                <motion.span
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    display: "inline-block",
                    boxShadow: "0 0 6px var(--accent)",
                  }}
                />
              </motion.span>
            )}
            <span style={{
              fontSize: 12,
              color: weekCount > 0 ? "var(--text-secondary)" : "var(--text-muted)",
              fontFamily: "var(--font-sans)",
            }}>
              {weekCount > 0 ? (
                <>
                  <span style={{
                    color: "var(--accent)",
                    fontWeight: 600,
                    fontFamily: "var(--font-mono)",
                  }}>
                    {weekCount}
                  </span>
                  {" "}problem{weekCount !== 1 ? "s" : ""} solved this week
                </>
              ) : subtitle}
            </span>
          </div>
        )}
      </div>

      {/* Search button */}
      <motion.button
        whileHover={{
          borderColor: "color-mix(in srgb, var(--accent) 35%, transparent)",
          boxShadow: "0 0 0 3px color-mix(in srgb, var(--accent) 8%, transparent)",
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          borderRadius: "var(--radius-md)",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-subtle)",
          color: "var(--text-muted)",
          fontSize: 13,
          cursor: "pointer",
          minWidth: 180,
          fontFamily: "var(--font-sans)",
          transition: "color 0.15s",
        }}
      >
        <IconSearch />
        <span style={{ flex: 1, textAlign: "left" }}>Search problems...</span>
        <kbd style={{
          fontSize: 10,
          padding: "1px 5px",
          borderRadius: 4,
          background: "var(--bg-hover)",
          border: "1px solid var(--border-mid)",
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
        }}>
          ⌘K
        </kbd>
      </motion.button>
    </motion.header>
  );
}