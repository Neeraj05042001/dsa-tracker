"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProblemStats } from "@/types";

interface InterviewModeProps {
  stats: ProblemStats;
  readinessScore: number;
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function getMinDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function getDailyTarget(daysLeft: number, overdueCount: number, totalProblems: number): number {
  if (daysLeft <= 0) return 0;
  const baseLoad = Math.max(overdueCount, Math.ceil(totalProblems * 0.1));
  return Math.max(1, Math.ceil(baseLoad / Math.min(daysLeft, 30)));
}

function getOnTrackStatus(readinessScore: number, daysLeft: number): { status: string; label: string; color: string } {
  if (readinessScore >= 75 || (readinessScore >= 60 && daysLeft > 21)) {
    return { status: "on_track", label: "On Track", color: "var(--easy)" };
  }
  if (readinessScore >= 40 && daysLeft > 10) {
    return { status: "at_risk", label: "At Risk", color: "var(--medium)" };
  }
  return { status: "critical", label: "Needs Attention", color: "var(--hard)" };
}

// ─── Collapsed banner ─────────────────────────────────────────────────────────

function SetDatePrompt({ onSet }: { onSet: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        gap: 16, flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <motion.div
          whileHover={{ scale: 1.1, rotate: -5 }}
          style={{
            width: 32, height: 32, borderRadius: "var(--radius-md)",
            background: "var(--accent-muted)",
            border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--accent)", flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </motion.div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Preparing for an interview?</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>
            Set a target date and we'll plan your revision schedule automatically.
          </div>
        </div>
      </div>
      <motion.button
        onClick={onSet}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="btn btn-ghost"
        style={{ fontSize: 12, padding: "6px 14px", whiteSpace: "nowrap" }}
      >
        Set interview date →
      </motion.button>
    </motion.div>
  );
}

// ─── Active countdown ─────────────────────────────────────────────────────────

function ActiveMode({ targetDate, stats, readinessScore, onClear }: {
  targetDate: string; stats: ProblemStats; readinessScore: number; onClear: () => void;
}) {
  const days = daysUntil(targetDate);
  const { label, color } = getOnTrackStatus(readinessScore, days);
  const dailyTarget = getDailyTarget(days, stats.needs_revision_count, stats.total);
  const formattedDate = new Date(targetDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  if (days < 0) {
    return (
      <div style={{ padding: "16px 20px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Interview date passed. How did it go?</span>
        <button onClick={onClear} style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>Clear date</button>
      </div>
    );
  }

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0.22, 1, 0.36, 1] }}
      style={{
        padding: "20px 24px",
        position: "relative", overflow: "hidden",
        background: `color-mix(in srgb, ${color} 3%, var(--bg-surface))`,
        borderColor: `color-mix(in srgb, ${color} 18%, var(--border-subtle))`,
      }}
    >
      {/* Breathing ambient */}
      <motion.div
        animate={{ opacity: [0.05, 0.10, 0.05], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: -30, right: -30,
          width: 130, height: 130, borderRadius: "50%",
          background: color, filter: "blur(32px)", pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", position: "relative" }}>
        {/* Day counter — pulses every 4s */}
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            background: "var(--bg-elevated)",
            border: `1px solid color-mix(in srgb, ${color} 28%, var(--border-subtle))`,
            borderRadius: "var(--radius-md)", padding: "12px 20px",
            flexShrink: 0, minWidth: 80,
            boxShadow: `0 0 20px color-mix(in srgb, ${color} 12%, transparent)`,
          }}
        >
          <motion.span
            key={days}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ fontFamily: "var(--font-mono)", fontSize: 38, fontWeight: 700, color, lineHeight: 1, letterSpacing: "-0.02em" }}
          >
            {days}
          </motion.span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>days left</span>
        </motion.div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Interview Mode</span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                fontSize: 10, fontWeight: 700, color,
                background: `color-mix(in srgb, ${color} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
                borderRadius: "var(--radius-pill)", padding: "2px 7px",
              }}
            >
              {label}
            </motion.span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>Target: {formattedDate}</div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "Daily target", value: `${dailyTarget} review${dailyTarget !== 1 ? "s" : ""}`, color: "var(--text-primary)" },
              { label: "Overdue", value: String(stats.needs_revision_count), color: stats.needs_revision_count > 0 ? "var(--hard)" : "var(--easy)" },
              { label: "Readiness", value: `${readinessScore}/100`, color },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                style={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, color: "var(--text-muted)" }}>{stat.label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: stat.color }}>{stat.value}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <button
          onClick={onClear}
          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 11, alignSelf: "flex-start", transition: "color 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          ✕ clear
        </button>
      </div>
    </motion.div>
  );
}

// ─── Date picker modal ────────────────────────────────────────────────────────

function DateModal({ onConfirm, onDismiss }: { onConfirm: (date: string) => void; onDismiss: () => void }) {
  const [value, setValue] = useState("");

  return (
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)", zIndex: 50,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-mid)",
            borderRadius: "var(--radius-lg)", padding: "28px 32px",
            width: "min(420px, 90vw)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          }}
        >
          <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Set interview date</h3>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
            We'll use this to calculate your daily revision budget and keep your readiness score on track. You can change or remove this anytime.
          </p>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 8 }}>
              Target date
            </label>
            <input
              type="date" value={value} min={getMinDate()} onChange={e => setValue(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", background: "var(--bg-base)", border: "1px solid var(--border-mid)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: 14, fontFamily: "var(--font-mono)", outline: "none", boxSizing: "border-box" }}
              onFocus={e => (e.target.style.borderColor = "var(--accent)")}
              onBlur={e => (e.target.style.borderColor = "var(--border-mid)")}
            />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onDismiss} className="btn btn-ghost" style={{ fontSize: 13, padding: "8px 16px" }}>Maybe later</motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => value && onConfirm(value)} disabled={!value}
              className="btn btn-primary"
              style={{ fontSize: 13, padding: "8px 16px", opacity: value ? 1 : 0.4, cursor: value ? "pointer" : "not-allowed" }}
            >
              Set date
            </motion.button>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "dsa_interview_target_date";

export function InterviewMode({ stats, readinessScore }: InterviewModeProps) {
  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setTargetDate(stored);
  }, []);

  if (!mounted) return null;

  const handleConfirm = (date: string) => {
    localStorage.setItem(STORAGE_KEY, date);
    setTargetDate(date);
    setShowModal(false);
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTargetDate(null);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {targetDate ? (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ActiveMode targetDate={targetDate} stats={stats} readinessScore={readinessScore} onClear={handleClear} />
          </motion.div>
        ) : (
          <motion.div key="prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SetDatePrompt onSet={() => setShowModal(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      {showModal && <DateModal onConfirm={handleConfirm} onDismiss={() => setShowModal(false)} />}
    </>
  );
}