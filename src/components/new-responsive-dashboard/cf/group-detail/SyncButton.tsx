"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning" | "info";

interface ToastData {
  id:      number;
  type:    ToastType;
  title:   string;
  message: string;
}

type SyncState = "idle" | "loading" | "success" | "error";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────

const D = {
  teal:  "#00d4aa",
  amber: "#fbbf24",
  red:   "#f87171",
  green: "#4ade80",
  muted: "var(--text-muted, #52525b)",
  mono:  "var(--font-mono, 'JetBrains Mono', monospace)",
  sans:  "var(--font-sans, system-ui, sans-serif)",
} as const;

const TYPE_CONFIG: Record<ToastType, { color: string; bg: string; border: string }> = {
  success: { color: D.green, bg: "rgba(74,222,128,0.07)",   border: "rgba(74,222,128,0.22)"  },
  error:   { color: D.red,   bg: "rgba(248,113,113,0.07)",  border: "rgba(248,113,113,0.22)" },
  warning: { color: D.amber, bg: "rgba(251,191,36,0.07)",   border: "rgba(251,191,36,0.22)"  },
  info:    { color: D.teal,  bg: "rgba(0,212,170,0.07)",    border: "rgba(0,212,170,0.22)"   },
};

// ─────────────────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────────────────

function ToastItem({
  toast,
  onDismiss,
}: {
  toast:     ToastData;
  onDismiss: (id: number) => void;
}) {
  const { color, bg, border } = TYPE_CONFIG[toast.type];

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  const Icon = () => {
    if (toast.type === "success") return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
    if (toast.type === "warning") return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
    // error + info
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      onClick={() => onDismiss(toast.id)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        padding: "12px 14px",
        background: "var(--bg-elevated, #16161a)",
        border: `1px solid ${border}`,
        borderRadius: 12,
        boxShadow: `0 10px 36px rgba(0,0,0,0.55), 0 0 0 1px ${border}`,
        minWidth: 268, maxWidth: 330,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Left accent */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: 3, background: color,
        borderRadius: "12px 0 0 12px",
      }} />

      {/* Depleting progress bar */}
      <motion.div
        initial={{ scaleX: 1 }} animate={{ scaleX: 0 }}
        transition={{ duration: 4, ease: "linear" }}
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: 2, background: color, opacity: 0.25,
          transformOrigin: "left",
        }}
      />

      {/* Icon */}
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: bg, border: `1px solid ${border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color, flexShrink: 0, marginLeft: 4,
      }}>
        <Icon />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, fontWeight: 700,
          color: "var(--text-primary, #f4f4f5)",
          lineHeight: 1.3, fontFamily: D.sans,
        }}>
          {toast.title}
        </div>
        <div style={{
          fontSize: 11, color: D.muted,
          marginTop: 2, lineHeight: 1.5,
          fontFamily: D.sans,
        }}>
          {toast.message}
        </div>
      </div>

      {/* Dismiss */}
      <button
        onClick={e => { e.stopPropagation(); onDismiss(toast.id); }}
        style={{
          background: "none", border: "none",
          color: D.muted, cursor: "pointer",
          padding: 2, display: "flex", flexShrink: 0,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </motion.div>
  );
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts:    ToastData[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div style={{
      position: "fixed",
      bottom: 24, right: 24,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      pointerEvents: "none",
    }}>
      <AnimatePresence mode="popLayout">
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: "all" }}>
            <ToastItem toast={t} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPIN ICON
// ─────────────────────────────────────────────────────────────────────────────

function SpinIcon() {
  return (
    <motion.svg
      width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      style={{ flexShrink: 0 }}
    >
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </motion.svg>
  );
}

function SyncIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
      style={{ flexShrink: 0 }}>
      <polyline points="1 4 1 10 7 10" />
      <polyline points="23 20 23 14 17 14" />
      <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export function SyncButton() {
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [toasts, setToasts]       = useState<ToastData[]>([]);

  const addToast = useCallback((t: Omit<ToastData, "id">) => {
    setToasts(prev => [...prev, { ...t, id: Date.now() }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleSync = useCallback(async () => {
    if (syncState === "loading") return;

    setSyncState("loading");

    try {
      const res = await fetch("/api/cf/sync-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ triggered_by: "manual" }),
      });

      const data = await res.json();

      // ── 429 throttled ─────────────────────────────────────────
      if (res.status === 429) {
        setSyncState("idle");
        addToast({
          type:    "warning",
          title:   "Sync throttled",
          message: data.message ?? "Please wait before syncing again.",
        });
        return;
      }

      // ── 400 no CF account ─────────────────────────────────────
      if (res.status === 400 && !data.success) {
        setSyncState("error");
        addToast({
          type:    "error",
          title:   "No CF account connected",
          message: "Use the Memoize extension to connect your Codeforces account.",
        });
        setTimeout(() => setSyncState("idle"), 2500);
        return;
      }

      // ── 401 session expired ───────────────────────────────────
      if (res.status === 401) {
        setSyncState("error");
        addToast({
          type:    "error",
          title:   "Session expired",
          message: "Open the extension on codeforces.com to reconnect.",
        });
        setTimeout(() => setSyncState("idle"), 2500);
        return;
      }

      // ── Other failures ────────────────────────────────────────
      if (!data.success) {
        setSyncState("error");
        addToast({
          type:    "error",
          title:   "Sync failed",
          message: data.message ?? "Something went wrong. Try again.",
        });
        setTimeout(() => setSyncState("idle"), 2500);
        return;
      }

      // ── Partial (CF rate-limited mid-sync) ────────────────────
      if (data.partial || data.rate_limited) {
        setSyncState("success");
        addToast({
          type:    "warning",
          title:   "Partial sync",
          message: data.message ?? `${data.groups_synced} group(s) synced. CF rate-limited — rest will update in ~30 min.`,
        });
        setTimeout(() => {
          setSyncState("idle");
          window.location.reload();
        }, 2000);
        return;
      }

      // ── Full success ──────────────────────────────────────────
      setSyncState("success");
      addToast({
        type:    "success",
        title:   "Sync complete",
        message: data.message ?? `${data.groups_synced} group(s) · ${data.problems_synced} problems updated.`,
      });

      // Reload after a beat so user sees the toast first
      setTimeout(() => {
        setSyncState("idle");
        window.location.reload();
      }, 1400);

    } catch {
      setSyncState("error");
      addToast({
        type:    "error",
        title:   "Network error",
        message: "Could not reach the server. Check your connection.",
      });
      setTimeout(() => setSyncState("idle"), 2500);
    }
  }, [syncState, addToast]);

  // ── Button appearance by state ─────────────────────────────────────────────
  const buttonConfig = {
    idle: {
      label:  "Sync Now",
      icon:   <SyncIcon />,
      bg:     "rgba(0,212,170,0.1)",
      border: "rgba(0,212,170,0.22)",
      color:  D.teal,
      cursor: "pointer",
    },
    loading: {
      label:  "Syncing…",
      icon:   <SpinIcon />,
      bg:     "rgba(0,212,170,0.07)",
      border: "rgba(0,212,170,0.15)",
      color:  "rgba(0,212,170,0.7)",
      cursor: "not-allowed",
    },
    success: {
      label:  "Synced",
      icon:   <CheckIcon />,
      bg:     "rgba(74,222,128,0.1)",
      border: "rgba(74,222,128,0.22)",
      color:  D.green,
      cursor: "default",
    },
    error: {
      label:  "Failed",
      icon:   (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ),
      bg:     "rgba(248,113,113,0.1)",
      border: "rgba(248,113,113,0.22)",
      color:  D.red,
      cursor: "default",
    },
  }[syncState];

  return (
    <>
      <motion.button
        onClick={handleSync}
        disabled={syncState === "loading"}
        whileHover={syncState === "idle" ? { scale: 1.03 } : {}}
        whileTap={syncState === "idle"   ? { scale: 0.97 } : {}}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        style={{
          display:        "flex",
          alignItems:     "center",
          gap:            6,
          padding:        "5px 12px",
          borderRadius:   7,
          border:         `1px solid ${buttonConfig.border}`,
          background:     buttonConfig.bg,
          color:          buttonConfig.color,
          fontSize:       11,
          fontWeight:     600,
          fontFamily:     D.sans,
          cursor:         buttonConfig.cursor,
          whiteSpace:     "nowrap",
          transition:     "background 0.15s, border-color 0.15s, color 0.15s",
          userSelect:     "none",
          outline:        "none",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={syncState + "-icon"}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.12 }}
            style={{ display: "flex", alignItems: "center" }}
          >
            {buttonConfig.icon}
          </motion.span>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.span
            key={syncState + "-label"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
          >
            {buttonConfig.label}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}