"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Problem } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RevisionClientProps {
  dueSM2: Problem[];
  flagged: Problem[];
  upcoming: Problem[];
}

type Tab = "sm2" | "flagged";
type SM2Quality = 0 | 2 | 4 | 5;

interface SM2Result {
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReview: string;
}

// ─── Global keyframes ─────────────────────────────────────────────────────────

const GLOBAL_STYLES = `
  @keyframes cardEnter {
    from { opacity: 0; transform: translateY(16px) scale(0.99); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
  @keyframes cardExit {
    from { opacity: 1; transform: translateY(0)   scale(1);    }
    to   { opacity: 0; transform: translateY(-12px) scale(0.98); }
  }
  @keyframes revealExpand {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  @keyframes popIn {
    0%   { transform: scale(0.4); opacity: 0; }
    70%  { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1);   opacity: 1; }
  }
  @keyframes ringGrow {
    from { stroke-dashoffset: 220; }
    to   { stroke-dashoffset: var(--target-offset); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }
  @keyframes gradeFlash {
    0%   { transform: scale(1);    }
    40%  { transform: scale(0.94); }
    70%  { transform: scale(1.04); }
    100% { transform: scale(1);    }
  }
  @keyframes queueSlideOut {
    from { opacity: 1; transform: translateX(0)    scale(1);    max-height: 56px; margin-bottom: 6px; }
    to   { opacity: 0; transform: translateX(12px) scale(0.96); max-height: 0;    margin-bottom: 0;  }
  }
  @keyframes confettiFall {
    0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
    100% { transform: translateY(80px)  rotate(360deg); opacity: 0; }
  }
  @keyframes streakPop {
    0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
    60%  { transform: scale(1.15) rotate(3deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
`;

// ─── SM2 ──────────────────────────────────────────────────────────────────────

function runSM2(problem: Problem, quality: SM2Quality): SM2Result {
  let { sm2_interval, sm2_ease_factor, sm2_repetitions } = problem;

  if (quality < 3) {
    // Failed — reset to beginning
    sm2_repetitions = 0;
    sm2_interval = 1;
  } else {
    if (sm2_repetitions === 0) {
      // First review — quality determines starting interval
      // Again/Hard already handled above; Good → 1d, Easy → 3d
      sm2_interval = quality === 5 ? 3 : 1;
    } else if (sm2_repetitions === 1) {
      // Second review — Good → 6d, Easy → 10d
      sm2_interval = quality === 5 ? 10 : 6;
    } else {
      // Subsequent — multiply by ease factor, Easy gets a bonus
      const bonus = quality === 5 ? 1.15 : 1;
      sm2_interval = Math.round(sm2_interval * sm2_ease_factor * bonus);
    }
    sm2_repetitions += 1;
  }

  // Update ease factor
  sm2_ease_factor = Math.max(
    1.3,
    sm2_ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02),
  );

  const next = new Date();
  next.setDate(next.getDate() + sm2_interval);
  return {
    interval: sm2_interval,
    easeFactor: parseFloat(sm2_ease_factor.toFixed(2)),
    repetitions: sm2_repetitions,
    nextReview: next.toISOString().split("T")[0],
  };
}

function previewNextReview(problem: Problem, quality: SM2Quality): string {
  const { interval } = runSM2(problem, quality);
  if (interval === 1) return "tomorrow";
  if (interval < 7) return `in ${interval} days`;
  if (interval < 14) return "in 1 week";
  if (interval < 30) return `in ${Math.round(interval / 7)} weeks`;
  return `in ${Math.round(interval / 30)} months`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPattern(p: string | null): string {
  if (!p) return "";
  return p
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function effectiveDifficulty(p: Problem): string | null {
  return p.difficulty ?? p.user_difficulty ?? null;
}

function daysOverdue(p: Problem): number | null {
  if (!p.sm2_next_review) return null;
  const diff = Math.floor(
    (Date.now() - new Date(p.sm2_next_review).getTime()) / 86400000,
  );
  return diff > 0 ? diff : null;
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function DiffBadge({ difficulty }: { difficulty: string | null }) {
  if (!difficulty) return null;
  const cls =
    difficulty === "easy"
      ? "badge badge-easy"
      : difficulty === "medium"
        ? "badge badge-medium"
        : "badge badge-hard";
  return (
    <span className={cls}>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
}

function PlatBadge({ platform }: { platform: string }) {
  const cls =
    platform === "leetcode"
      ? "badge badge-lc"
      : platform === "codeforces"
        ? "badge badge-cf"
        : "badge";
  const label =
    platform === "leetcode"
      ? "LeetCode"
      : platform === "codeforces"
        ? "Codeforces"
        : platform;
  return <span className={cls}>{label}</span>;
}

// ─── Grade Button — Framer Motion, premium tactile feel ──────────────────────

const EASY_CONFETTI_COLORS = [
  "var(--easy)",
  "var(--accent)",
  "#ffffff",
  "#bbf7d0",
  "#6ee7b7",
];

function EasyConfettiBurst() {
  const dots = Array.from({ length: 6 }, (_, i) => ({
    x: (Math.random() - 0.5) * 80,
    y: (Math.random() - 0.5) * 70 - 20,
    color: EASY_CONFETTI_COLORS[i % EASY_CONFETTI_COLORS.length],
    delay: i * 0.04,
  }));
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 10,
      }}
    >
      {dots.map((d, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          animate={{ opacity: 0, scale: 0.3, x: d.x, y: d.y }}
          transition={{ duration: 0.55, delay: d.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: d.color,
            marginTop: -3.5,
            marginLeft: -3.5,
          }}
        />
      ))}
    </div>
  );
}

function GradeButton({
  label,
  sublabel,
  color,
  preview,
  shortcut,
  onClick,
  disabled,
  isEasy = false,
}: {
  label: string;
  sublabel: string;
  color: string;
  preview: string;
  shortcut: string;
  onClick: () => void;
  disabled?: boolean;
  isEasy?: boolean;
}) {
  const [burst, setBurst] = useState(false);

  function handleClick() {
    if (disabled) return;
    if (isEasy) {
      setBurst(true);
      setTimeout(() => setBurst(false), 700);
    }
    onClick();
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      whileHover={
        !disabled
          ? {
              y: -3,
              scale: 1.02,
              boxShadow: `0 10px 28px color-mix(in srgb, ${color} 30%, transparent)`,
            }
          : {}
      }
      whileTap={!disabled ? { scale: 0.96, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      style={{
        position: "relative",
        flex: 1,
        minHeight: 108,
        padding: "16px 10px 14px",
        background: `color-mix(in srgb, ${color} 10%, var(--bg-elevated))`,
        border: `1px solid color-mix(in srgb, ${color} 22%, transparent)`,
        /* colored top strip */
        borderTop: `3px solid ${color}`,
        borderRadius: "var(--radius-lg)",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        outline: "none",
        opacity: disabled ? 0.45 : 1,
        overflow: "visible",
      }}
    >
      {/* Burst ring on click */}
      <AnimatePresence>
        {burst && (
          <motion.div
            key="ring"
            initial={{ opacity: 0.7, scale: 1 }}
            animate={{ opacity: 0, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "var(--radius-lg)",
              border: `2px solid ${color}`,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* Easy confetti dots */}
      <AnimatePresence>
        {burst && isEasy && <EasyConfettiBurst key="confetti" />}
      </AnimatePresence>

      {/* Keyboard shortcut badge */}
      <div
        style={{
          position: "absolute",
          top: 7,
          right: 8,
          fontSize: 9,
          fontFamily: "var(--font-mono)",
          fontWeight: 600,
          color: "var(--text-muted)",
          background: "var(--bg-hover)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 4,
          padding: "1px 5px",
          lineHeight: 1.5,
        }}
      >
        {shortcut}
      </div>

      {/* Label */}
      <span
        style={{
          fontSize: 15,
          fontWeight: 700,
          color,
          letterSpacing: "0.01em",
          lineHeight: 1,
        }}
      >
        {label}
      </span>

      {/* Sublabel — equal prominence to label */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "var(--text-secondary)",
          lineHeight: 1,
        }}
      >
        {sublabel}
      </span>

      {/* Interval chip — the key scheduling info */}
      <div
        style={{
          marginTop: 4,
          padding: "3px 10px",
          background: `color-mix(in srgb, ${color} 14%, transparent)`,
          border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`,
          borderRadius: "var(--radius-pill)",
          fontSize: 12,
          fontWeight: 700,
          color,
          fontFamily: "var(--font-mono)",
          lineHeight: 1,
        }}
      >
        {preview}
      </div>
    </motion.button>
  );
}

// ─── Queue item — with exit animation ────────────────────────────────────────

function QueueItem({
  problem,
  index,
  isActive,
  isExiting,
  onClick,
}: {
  problem: Problem;
  index: number;
  isActive: boolean;
  isExiting?: boolean;
  onClick: () => void;
}) {
  const overdue = daysOverdue(problem);
  const overdueColor = overdue && overdue > 2 ? "var(--hard)" : "var(--medium)";

  return (
    <div
      style={{
        animation: isExiting
          ? "queueSlideOut 0.3s ease forwards"
          : "fadeUp 0.2s ease both",
        animationDelay: isExiting ? "0ms" : `${index * 30}ms`,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <motion.button
        onClick={onClick}
        whileHover={!isActive ? { x: 2 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          paddingLeft: isActive ? 10 : 12,
          background: isActive
            ? "color-mix(in srgb, var(--accent) 10%, transparent)"
            : "transparent",
          border: "1px solid transparent",
          borderColor: isActive
            ? "color-mix(in srgb, var(--accent) 25%, transparent)"
            : "transparent",
          borderLeft: isActive
            ? "2px solid var(--accent)"
            : "2px solid transparent",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          textAlign: "left",
          outline: "none",
          marginBottom: 4,
          boxShadow: isActive
            ? "0 0 16px color-mix(in srgb, var(--accent) 12%, transparent) inset"
            : "none",
          transition: "background 0.12s, border-color 0.12s, box-shadow 0.15s",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.background = "var(--bg-hover)";
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = "transparent";
        }}
      >
        {/* Index number */}
        <span
          style={{
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            color: isActive ? "var(--accent)" : "var(--text-muted)",
            minWidth: 14,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {index + 1}
        </span>

        {/* Problem name */}
        <span
          style={{
            flex: 1,
            fontSize: 12,
            color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
            fontWeight: isActive ? 600 : 400,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {problem.problem_name}
        </span>

        {/* Right side: diff badge + overdue chip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            flexShrink: 0,
          }}
        >
          <DiffBadge difficulty={effectiveDifficulty(problem)} />
          {overdue && (
            <motion.span
              animate={{ opacity: [0.65, 1, 0.65] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              style={{
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                color: overdueColor,
                background: `color-mix(in srgb, ${overdueColor} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${overdueColor} 22%, transparent)`,
                borderRadius: "var(--radius-pill)",
                padding: "1px 5px",
                fontWeight: 700,
              }}
            >
              {overdue}d
            </motion.span>
          )}
        </div>
      </motion.button>
    </div>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressNodes({
  done,
  total,
  overdueCount,
}: {
  done: number;
  total: number;
  overdueCount: number;
}) {
  const showDots = total <= 20;
  return (
    <div style={{ flex: 1 }}>
      {showDots ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 5,
            alignItems: "center",
            marginBottom: 7,
          }}
        >
          {Array.from({ length: total }).map((_, i) => {
            const isDone = i < done;
            const isCurrent = i === done;
            return (
              <div key={i} style={{ position: "relative", flexShrink: 0 }}>
                {isCurrent ? (
                  <div style={{ position: "relative", width: 10, height: 10 }}>
                    <motion.div
                      animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut",
                      }}
                      style={{
                        position: "absolute",
                        inset: -3,
                        borderRadius: "50%",
                        border: "1.5px solid var(--accent)",
                      }}
                    />
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "var(--accent)",
                        boxShadow:
                          "0 0 8px color-mix(in srgb, var(--accent) 70%, transparent)",
                      }}
                    />
                  </div>
                ) : (
                  <motion.div
                    animate={{ scale: isDone ? [1.4, 1] : 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: isDone
                        ? "var(--accent)"
                        : "var(--border-mid)",
                      boxShadow: isDone
                        ? "0 0 5px color-mix(in srgb, var(--accent) 40%, transparent)"
                        : "none",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            height: 5,
            background: "var(--border-subtle)",
            borderRadius: "var(--radius-pill)",
            overflow: "hidden",
            marginBottom: 7,
          }}
        >
          <motion.div
            animate={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            style={{
              height: "100%",
              background:
                "linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 70%, var(--easy)))",
              borderRadius: "var(--radius-pill)",
              boxShadow:
                "0 0 8px color-mix(in srgb, var(--accent) 40%, transparent)",
            }}
          />
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
        }}
      >
        <span>
          <span style={{ color: "var(--accent)", fontWeight: 700 }}>
            {done}
          </span>
          <span style={{ color: "var(--text-muted)" }}> done</span>
        </span>
        <span style={{ color: "var(--border-mid)" }}>·</span>
        <span style={{ color: "var(--text-muted)" }}>
          {total - done} remaining
        </span>
        {overdueCount > 0 && (
          <>
            <span style={{ color: "var(--border-mid)" }}>·</span>
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: "easeInOut",
              }}
              style={{
                color: overdueCount > 2 ? "var(--hard)" : "var(--medium)",
                fontWeight: 600,
              }}
            >
              {overdueCount} overdue
            </motion.span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── OLD ProgressRing — replaced, keeping stub to avoid reference errors ─────

function ProgressRing({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? done / total : 0;
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ - pct * circ;

  return (
    <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
      <svg width="48" height="48" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth="3"
        />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.5s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            color: "var(--text-primary)",
            lineHeight: 1,
          }}
        >
          {done}
        </span>
        <span
          style={{ fontSize: 8, color: "var(--text-muted)", lineHeight: 1 }}
        >
          /{total}
        </span>
      </div>
    </div>
  );
}

// ─── Confetti burst (done state) ─────────────────────────────────────────────

function Confetti() {
  const pieces = Array.from({ length: 18 }, (_, i) => ({
    x: 40 + Math.random() * 20,
    color: ["var(--accent)", "var(--easy)", "var(--medium)", "#fff"][i % 4],
    delay: Math.random() * 0.4,
    dur: 0.7 + Math.random() * 0.5,
    size: 4 + Math.random() * 4,
  }));
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 120,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {pieces.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x + (i % 3) * 8}%`,
            top: 0,
            width: p.size,
            height: p.size,
            borderRadius: i % 2 === 0 ? "50%" : "2px",
            background: p.color,
            animation: `confettiFall ${p.dur}s ease ${p.delay}s both`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Focus Card ───────────────────────────────────────────────────────────────

function FocusCard({
  problem,
  onGrade,
  onSkip,
  queueIndex,
  queueTotal,
  overdueCount,
  exiting,
  disabled,
  streakCount,
}: {
  problem: Problem;
  onGrade: (q: SM2Quality) => void;
  onSkip: () => void;
  queueIndex: number;
  queueTotal: number;
  overdueCount: number;
  exiting: boolean;
  disabled?: boolean;
  streakCount: number;
}) {
  const [revealed, setRevealed] = useState(false);

  const diff = effectiveDifficulty(problem);
  const overdue = daysOverdue(problem);

  const grades: {
    label: string;
    sublabel: string;
    color: string;
    quality: SM2Quality;
    shortcut: string;
    isEasy?: boolean;
  }[] = [
    {
      label: "Again",
      sublabel: "Blackout",
      color: "var(--hard)",
      quality: 0,
      shortcut: "1",
    },
    {
      label: "Hard",
      sublabel: "Struggled",
      color: "var(--medium)",
      quality: 2,
      shortcut: "2",
    },
    {
      label: "Good",
      sublabel: "Recalled",
      color: "var(--accent)",
      quality: 4,
      shortcut: "3",
    },
    {
      label: "Easy",
      sublabel: "Perfect",
      color: "var(--easy)",
      quality: 5,
      shortcut: "4",
      isEasy: true,
    },
  ];

  // Keyboard shortcuts — only active after reveal
  useEffect(() => {
    if (!revealed) return;
    function handler(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      const map: Record<string, SM2Quality> = {
        "1": 0,
        "2": 2,
        "3": 4,
        "4": 5,
      };
      if (e.key in map) onGrade(map[e.key as keyof typeof map]);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [revealed, onGrade]);

  return (
    <div
      className="card"
      style={{
        padding: "20px 24px",
        animation: exiting
          ? "cardExit 0.25s ease forwards"
          : "cardEnter 0.35s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* Progress row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div style={{ flex: 1 }}>
          <ProgressNodes
            done={queueIndex}
            total={queueTotal}
            overdueCount={overdueCount}
          />
        </div>

        {/* Streak badge — appears after 3 consecutive Good/Easy */}
        <AnimatePresence>
          {streakCount >= 3 && (
            <motion.div
              key="streak"
              initial={{ opacity: 0, scale: 0.7, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: -4 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                background:
                  "color-mix(in srgb, var(--medium) 12%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--medium) 28%, transparent)",
                borderRadius: "var(--radius-pill)",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 13 }}>🔥</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--medium)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {streakCount} in a row
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={onSkip}
          whileHover={{ color: "var(--text-secondary)" }}
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            background: "none",
            border: "1px solid transparent",
            borderRadius: "var(--radius-pill)",
            cursor: "pointer",
            padding: "4px 10px",
            transition: "border-color 0.12s",
            outline: "none",
            flexShrink: 0,
            marginTop: 2,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderColor = "var(--border-subtle)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = "transparent")
          }
        >
          Skip →
        </motion.button>
      </div>

      {/* Problem header */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 10,
          }}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: 0,
              lineHeight: 1.3,
              flex: 1,
            }}
          >
            {problem.problem_name}
          </h2>
          {problem.problem_url && (
            <a
              href={problem.problem_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "var(--text-muted)",
                textDecoration: "none",
                flexShrink: 0,
                marginTop: 4,
                padding: "4px 8px",
                border: "1px solid transparent",
                borderRadius: "var(--radius-md)",
                transition: "all 0.12s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent)";
                e.currentTarget.style.borderColor =
                  "color-mix(in srgb, var(--accent) 30%, transparent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Open
            </a>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <PlatBadge platform={problem.platform} />
          <DiffBadge difficulty={diff} />
          {problem.pattern && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--accent)",
                background: "var(--accent-muted)",
                border:
                  "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
                borderRadius: "var(--radius-pill)",
                padding: "2px 8px",
              }}
            >
              {formatPattern(problem.pattern)}
            </span>
          )}
          {overdue && (
            <span
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "var(--hard)",
                background: "color-mix(in srgb, var(--hard) 10%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--hard) 20%, transparent)",
                borderRadius: "var(--radius-pill)",
                padding: "2px 8px",
                animation: "pulse 2s ease infinite",
              }}
            >
              {overdue}d overdue
            </span>
          )}
          {problem.tags?.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                color: "var(--text-muted)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-pill)",
                padding: "2px 7px",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          height: 1,
          background: "var(--border-subtle)",
          marginBottom: 20,
        }}
      />

      {/* Active recall section */}
      <AnimatePresence mode="wait">
        {!revealed ? (
          /* ── Before reveal: frosted glass with dot grid ── */
          <motion.div
            key="before"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "relative",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-mid)",
              borderRadius: "var(--radius-md)",
              padding: "22px 22px 20px",
              marginBottom: 20,
              overflow: "hidden",
              minHeight: 120,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: 14,
            }}
          >
            {/* Subtle dot grid overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
                borderRadius: "var(--radius-md)",
              }}
            />

            <p
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                margin: 0,
                fontStyle: "italic",
                lineHeight: 1.65,
                position: "relative",
                zIndex: 1,
              }}
            >
              Try to recall the solution approach before revealing your notes.
            </p>

            {/* Glowing Reveal button */}
            <motion.button
              onClick={() => setRevealed(true)}
              whileHover={{
                boxShadow:
                  "0 0 22px color-mix(in srgb, var(--accent) 28%, transparent)",
                borderColor:
                  "color-mix(in srgb, var(--accent) 55%, transparent)",
                background:
                  "color-mix(in srgb, var(--accent) 14%, transparent)",
              }}
              whileTap={{ scale: 0.96 }}
              animate={{
                boxShadow: [
                  "0 0 0px color-mix(in srgb, var(--accent) 0%, transparent)",
                  "0 0 16px color-mix(in srgb, var(--accent) 20%, transparent)",
                  "0 0 0px color-mix(in srgb, var(--accent) 0%, transparent)",
                ],
              }}
              transition={{
                boxShadow: { repeat: Infinity, duration: 3, ease: "easeInOut" },
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 20px",
                background: "color-mix(in srgb, var(--accent) 8%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                borderRadius: "var(--radius-md)",
                color: "var(--accent)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                outline: "none",
                position: "relative",
                zIndex: 1,
                transition: "background 0.15s, border-color 0.15s",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Reveal notes
            </motion.button>
          </motion.div>
        ) : (
          /* ── After reveal: sectioned notes ── */
          <motion.div
            key="after"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              marginBottom: 20,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {/* Approach block */}
            <div
              style={{
                background:
                  "color-mix(in srgb, var(--accent) 4%, var(--bg-elevated))",
                border: "1px solid var(--border-subtle)",
                borderLeft: "3px solid var(--accent)",
                borderRadius: "var(--radius-md)",
                padding: "12px 16px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.07em",
                  color: "var(--accent)",
                  marginBottom: 8,
                }}
              >
                Approach
              </div>
              {problem.approach ? (
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    margin: 0,
                    lineHeight: 1.75,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {problem.approach}
                </p>
              ) : (
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    margin: 0,
                    fontStyle: "italic",
                  }}
                >
                  None noted.{" "}
                  <Link
                    href={`/dashboard/problems/${problem.problem_key}`}
                    style={{ color: "var(--accent)" }}
                  >
                    Add one →
                  </Link>
                </p>
              )}
            </div>

            {/* Mistakes block — only if content */}
            {problem.mistakes && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.08 }}
                style={{
                  background:
                    "color-mix(in srgb, var(--hard) 5%, var(--bg-elevated))",
                  border:
                    "1px solid color-mix(in srgb, var(--hard) 18%, var(--border-subtle))",
                  borderLeft: "3px solid var(--hard)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px 16px",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.07em",
                    color: "var(--hard)",
                    marginBottom: 8,
                  }}
                >
                  Mistakes / Gotchas
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    margin: 0,
                    lineHeight: 1.75,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {problem.mistakes}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SM2 meta — 3 stat cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          {
            label: "DUE",
            value: formatDate(problem.sm2_next_review),
            color: "var(--text-secondary)",
          },
          {
            label: "REPS",
            value: String(problem.sm2_repetitions ?? 0),
            color:
              (problem.sm2_repetitions ?? 0) > 0
                ? "var(--accent)"
                : "var(--text-muted)",
          },
          {
            label: "EASE",
            value: problem.sm2_ease_factor?.toFixed(2) ?? "—",
            color: !problem.sm2_ease_factor
              ? "var(--text-muted)"
              : problem.sm2_ease_factor >= 2.5
                ? "var(--easy)"
                : problem.sm2_ease_factor >= 2.0
                  ? "var(--medium)"
                  : "var(--hard)",
            title: "Ease factor — lower means harder to remember",
          },
        ].map((cell) => (
          <div
            key={cell.label}
            title={cell.title}
            style={{
              flex: 1,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "8px 14px",
              cursor: cell.title ? "help" : "default",
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase" as const,
                letterSpacing: "0.07em",
                color: "var(--text-muted)",
                marginBottom: 5,
              }}
            >
              {cell.label}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                color: cell.color,
                lineHeight: 1,
              }}
            >
              {cell.value}
            </span>
          </div>
        ))}
      </div>

      {/* Grade buttons */}
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--text-muted)",
            marginBottom: 10,
          }}
        >
          How did it go?
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {grades.map((g) => (
            <GradeButton
              key={g.label}
              label={g.label}
              sublabel={g.sublabel}
              color={g.color}
              shortcut={g.shortcut}
              isEasy={g.isEasy}
              preview={previewNextReview(problem, g.quality)}
              onClick={() => onGrade(g.quality)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Empty / Done states ──────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
        gap: 14,
        textAlign: "center",
        animation: "fadeUp 0.4s ease",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "color-mix(in srgb, var(--easy) 10%, transparent)",
          border: "1px solid color-mix(in srgb, var(--easy) 25%, transparent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "popIn 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--easy)"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <span
        style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}
      >
        {tab === "sm2" ? "All caught up!" : "Nothing flagged"}
      </span>
      <span
        style={{
          fontSize: 13,
          color: "var(--text-muted)",
          maxWidth: 300,
          lineHeight: 1.6,
        }}
      >
        {tab === "sm2"
          ? "No SM2 reviews due today. Check back tomorrow or solve new problems."
          : "Mark problems as 'Needs Revision' on the detail page to add them here."}
      </span>
      {tab === "sm2" && (
        <Link
          href="/dashboard/problems"
          className="btn btn-ghost"
          style={{ marginTop: 4, fontSize: 13 }}
        >
          Browse problems →
        </Link>
      )}
    </div>
  );
}

interface SessionResult {
  quality: SM2Quality;
  problemName: string;
}

function DoneState({
  results,
  onReset,
  flaggedCount,
}: {
  results: SessionResult[];
  onReset: () => void;
  flaggedCount: number;
}) {
  const total = results.length;
  const counts = { again: 0, hard: 0, good: 0, easy: 0 };
  for (const r of results) {
    if (r.quality === 0) counts.again++;
    else if (r.quality === 2) counts.hard++;
    else if (r.quality === 4) counts.good++;
    else if (r.quality === 5) counts.easy++;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        padding: "48px 24px",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      <Confetti />

      {/* Checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "color-mix(in srgb, var(--accent) 12%, transparent)",
          border:
            "2px solid color-mix(in srgb, var(--accent) 35%, transparent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow:
            "0 0 40px color-mix(in srgb, var(--accent) 25%, transparent)",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 6,
            letterSpacing: "-0.01em",
          }}
        >
          Session Complete!
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          You reviewed{" "}
          <span
            style={{
              color: "var(--accent)",
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
            }}
          >
            {total}
          </span>{" "}
          problem{total !== 1 ? "s" : ""}
        </div>
      </motion.div>

      {/* Rating breakdown — 4 stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.35 }}
        style={{ display: "flex", gap: 8, width: "100%", maxWidth: 480 }}
      >
        {(
          [
            { label: "Again", count: counts.again, color: "var(--hard)" },
            { label: "Hard", count: counts.hard, color: "var(--medium)" },
            { label: "Good", count: counts.good, color: "var(--accent)" },
            { label: "Easy", count: counts.easy, color: "var(--easy)" },
          ] as const
        ).map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.06, duration: 0.3 }}
            style={{
              flex: 1,
              background: `color-mix(in srgb, ${s.color} 8%, var(--bg-elevated))`,
              border: `1px solid color-mix(in srgb, ${s.color} 20%, transparent)`,
              borderTop: `2px solid ${s.color}`,
              borderRadius: "var(--radius-md)",
              padding: "10px 8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                color: s.color,
                lineHeight: 1,
              }}
            >
              {s.count}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase" as const,
                letterSpacing: "0.05em",
              }}
            >
              {s.label}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Streak badge */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 16,
          delay: 0.55,
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 18px",
          background: "color-mix(in srgb, var(--medium) 10%, transparent)",
          border:
            "1px solid color-mix(in srgb, var(--medium) 25%, transparent)",
          borderRadius: "var(--radius-pill)",
        }}
      >
        <span style={{ fontSize: 15 }}>🔥</span>
        <span style={{ fontSize: 13, color: "var(--medium)", fontWeight: 600 }}>
          Keep the streak going!
        </span>
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65, duration: 0.3 }}
        style={{ display: "flex", gap: 10, marginTop: 4 }}
      >
        <button
          onClick={onReset}
          className="btn btn-ghost"
          style={{ fontSize: 13 }}
        >
          Review again
        </button>
        {flaggedCount > 0 && (
          <button
            onClick={() => {
              /* tab switch handled outside */
            }}
            className="btn btn-ghost"
            style={{ fontSize: 13 }}
          >
            Review flagged ({flaggedCount})
          </button>
        )}
        <Link
          href="/dashboard"
          className="btn btn-primary"
          style={{ fontSize: 13 }}
        >
          Back to overview
        </Link>
      </motion.div>
    </motion.div>
  );
}

// ─── Upcoming Schedule ────────────────────────────────────────────────────────

function UpcomingSchedule({ problems }: { problems: Problem[] }) {
  const [open, setOpen] = useState(false);

  // Group by date
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const groups: {
    dateStr: string;
    label: string;
    sublabel: string;
    isToday: boolean;
    isTomorrow: boolean;
    problems: Problem[];
  }[] = [];

  const map = new Map<string, Problem[]>();
  for (const p of problems) {
    if (!p.sm2_next_review) continue;
    const key = p.sm2_next_review.split("T")[0];
    const arr = map.get(key) ?? [];
    arr.push(p);
    map.set(key, arr);
  }

  // Build next 14 days
  for (let i = 1; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const probs = map.get(dateStr) ?? [];
    if (probs.length === 0) continue;

    const isTomorrow = i === 1;
    const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
    const dateLabel = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    groups.push({
      dateStr,
      label: isTomorrow ? "Tomorrow" : weekday,
      sublabel: dateLabel,
      isToday: false,
      isTomorrow,
      problems: probs,
    });
  }

  const totalUpcoming = problems.length;

  // Load bar — max width maps to heaviest day
  const maxDay = Math.max(...groups.map((g) => g.problems.length), 1);

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {/* Header — always visible, click to toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          outline: "none",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: "var(--text-muted)",
            }}
          >
            Upcoming Schedule
          </span>
          {totalUpcoming > 0 && (
            <span
              style={{
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                color: "var(--accent)",
                background: "var(--accent-muted)",
                border:
                  "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
                borderRadius: "var(--radius-pill)",
                padding: "1px 7px",
              }}
            >
              {totalUpcoming}
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Mini spark — 7 day bars */}
          {!open && groups.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 2,
                height: 16,
              }}
            >
              {groups.slice(0, 7).map((g, i) => (
                <div
                  key={g.dateStr}
                  style={{
                    width: 4,
                    height: `${Math.max((g.problems.length / maxDay) * 100, 20)}%`,
                    background: g.isTomorrow
                      ? "var(--accent)"
                      : `color-mix(in srgb, var(--accent) ${40 + i * 8}%, var(--border-mid))`,
                    borderRadius: "1px 1px 0 0",
                    transition: "height 0.3s ease",
                  }}
                />
              ))}
            </div>
          )}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
            style={{
              transition: "transform 0.2s ease",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Expandable body */}
      {open && (
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            padding: "16px 20px",
            animation: "revealExpand 0.25s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {groups.length === 0 ? (
            <p
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                margin: 0,
                textAlign: "center",
                padding: "16px 0",
              }}
            >
              No reviews scheduled in the next 14 days.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {groups.map((g, gi) => (
                <div
                  key={g.dateStr}
                  style={{
                    display: "block",
                    gap: 0,
                    paddingBottom: gi < groups.length - 1 ? 8 : 0,
                    marginBottom: gi < groups.length - 1 ? 8 : 0,
                    borderBottom:
                      gi < groups.length - 1
                        ? "1px solid var(--border-subtle)"
                        : "none",
                    animation: `fadeUp 0.2s ease ${gi * 40}ms both`,
                  }}
                >
                  {/* Date pill — compact inline */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                    }}
                  >
                    {/* Date label */}
                    <div
                      style={{
                        flexShrink: 0,
                        width: 72,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: g.isTomorrow ? 700 : 500,
                          color: g.isTomorrow
                            ? "var(--accent)"
                            : "var(--text-secondary)",
                          lineHeight: 1.2,
                        }}
                      >
                        {g.label}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          fontFamily: "var(--font-mono)",
                          color: "var(--text-muted)",
                          marginTop: 1,
                        }}
                      >
                        {g.sublabel}
                      </div>
                    </div>

                    {/* Load bar */}
                    <div
                      style={{
                        width: 32,
                        height: 3,
                        background: "var(--border-subtle)",
                        borderRadius: "var(--radius-pill)",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${(g.problems.length / maxDay) * 100}%`,
                          background: g.isTomorrow
                            ? "var(--accent)"
                            : "var(--border-mid)",
                          borderRadius: "var(--radius-pill)",
                          transition: "width 0.5s cubic-bezier(0.16,1,0.3,1)",
                        }}
                      />
                    </div>

                    {/* Problem chips — horizontal scroll if many */}
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        overflow: "hidden",
                        flexWrap: "wrap",
                      }}
                    >
                      {g.problems.map((p) => {
                        const diff = p.difficulty ?? p.user_difficulty ?? null;
                        const diffColor =
                          diff === "easy"
                            ? "var(--easy)"
                            : diff === "medium"
                              ? "var(--medium)"
                              : diff === "hard"
                                ? "var(--hard)"
                                : "var(--text-muted)";
                        return (
                          <div
                            key={p.problem_key}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "4px 10px",
                              background: "var(--bg-elevated)",
                              border: "1px solid var(--border-subtle)",
                              borderRadius: "var(--radius-pill)",
                              minWidth: 0,
                            }}
                          >
                            {/* Diff dot */}
                            {diff && (
                              <div
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  background: diffColor,
                                  flexShrink: 0,
                                }}
                              />
                            )}
                            <span
                              style={{
                                fontSize: 11,
                                color: "var(--text-primary)",
                                fontWeight: 500,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 180,
                              }}
                            >
                              {p.problem_name}
                            </span>
                            {p.pattern && (
                              <span
                                style={{
                                  fontSize: 10,
                                  color: "var(--text-muted)",
                                  fontFamily: "var(--font-mono)",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                ·{" "}
                                {p.pattern
                                  .split(/[_]+/)
                                  .map(
                                    (w: string) =>
                                      w.charAt(0).toUpperCase() + w.slice(1),
                                  )
                                  .join(" ")}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Count badge — right aligned */}
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: 10,
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        color: g.isTomorrow
                          ? "var(--accent)"
                          : "var(--text-muted)",
                        background: g.isTomorrow
                          ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                          : "var(--bg-elevated)",
                        border: `1px solid ${
                          g.isTomorrow
                            ? "color-mix(in srgb, var(--accent) 25%, transparent)"
                            : "var(--border-subtle)"
                        }`,
                        borderRadius: "var(--radius-pill)",
                        padding: "2px 7px",
                      }}
                    >
                      {g.problems.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function RevisionClient({
  dueSM2,
  flagged,
  upcoming,
}: RevisionClientProps) {
  const [tab, setTab] = useState<Tab>("sm2");
  const [sm2Queue, setSm2Queue] = useState<Problem[]>(dueSM2);
  const [flagQueue, setFlagQueue] = useState<Problem[]>(flagged);
  const [activeIdx, setActiveIdx] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exitingKey, setExitingKey] = useState<string | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [sessionResults, setSessionResults] = useState<SessionResult[]>([]);

  const queue = tab === "sm2" ? sm2Queue : flagQueue;
  const setQueue = tab === "sm2" ? setSm2Queue : setFlagQueue;
  const current = queue[activeIdx] ?? null;

  async function handleGrade(quality: SM2Quality) {
    if (!current || saving) return;
    setSaving(true);
    setError(null);
    setExitingKey(current.problem_key);

    const result = runSM2(current, quality);

    try {
      const res = await fetch("/api/problems/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_key: current.problem_key,
          updates: {
            sm2_interval: result.interval,
            sm2_ease_factor: result.easeFactor,
            sm2_repetitions: result.repetitions,
            sm2_next_review: result.nextReview,
            needs_revision: quality >= 3 ? false : current.needs_revision,
          },
        }),
      });
      if (!res.ok) throw new Error("Save failed");
    } catch {
      setError("Failed to save. Progress may not be recorded.");
    }

    // Wait for exit animation
    setTimeout(() => {
      setExitingKey(null);
      setSaving(false);
      setDoneCount((c) => c + 1);
      setSessionResults((prev) => [
        ...prev,
        { quality, problemName: current.problem_name },
      ]);
      // Streak: increment on Good/Easy (4,5), reset on Again/Hard (0,2)
      setStreakCount((s) => (quality >= 4 ? s + 1 : 0));
      const remaining = queue.filter((_, i) => i !== activeIdx);
      setQueue(remaining);
      if (remaining.length === 0) {
        setSessionDone(true);
        setActiveIdx(0);
      } else {
        setActiveIdx(Math.min(activeIdx, remaining.length - 1));
      }
    }, 250);
  }

  function handleSkip() {
    if (!current) return;
    const reordered = [...queue.filter((_, i) => i !== activeIdx), current];
    setQueue(reordered);
    setActiveIdx(Math.min(activeIdx, reordered.length - 1));
  }

  function handleReset() {
    setSm2Queue(dueSM2);
    setFlagQueue(flagged);
    setActiveIdx(0);
    setDoneCount(0);
    setSessionDone(false);
    setError(null);
    setExitingKey(null);
    setStreakCount(0);
    setSessionResults([]);
  }

  const totalSM2 = dueSM2.length;
  const totalFlagged = flagged.length;

  return (
    <div>
      <style>{GLOBAL_STYLES}</style>

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 20,
        }}
      >
        {(
          [
            { key: "sm2", label: "SM2 Due", count: totalSM2 },
            { key: "flagged", label: "Flagged", count: totalFlagged },
          ] as const
        ).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => {
              setTab(key);
              setActiveIdx(0);
              setSessionDone(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "7px 14px",
              background:
                tab === key
                  ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                  : "transparent",
              border: `1px solid ${tab === key ? "var(--accent)" : "var(--border-subtle)"}`,
              borderRadius: "var(--radius-pill)",
              color: tab === key ? "var(--accent)" : "var(--text-muted)",
              fontSize: 13,
              fontWeight: tab === key ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s",
              outline: "none",
            }}
          >
            {label}
            {count > 0 && (
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  color: tab === key ? "var(--accent)" : "var(--text-muted)",
                  background:
                    tab === key
                      ? "color-mix(in srgb, var(--accent) 15%, transparent)"
                      : "var(--bg-elevated)",
                  border: `1px solid ${
                    tab === key
                      ? "color-mix(in srgb, var(--accent) 30%, transparent)"
                      : "var(--border-subtle)"
                  }`,
                  borderRadius: "var(--radius-pill)",
                  padding: "1px 7px",
                  lineHeight: 1.6,
                }}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "10px 14px",
            background: "color-mix(in srgb, var(--hard) 10%, transparent)",
            border:
              "1px solid color-mix(in srgb, var(--hard) 25%, transparent)",
            borderRadius: "var(--radius-md)",
            color: "var(--hard)",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {/* Content */}
      {sessionDone ? (
        <DoneState
          results={sessionResults}
          onReset={handleReset}
          flaggedCount={flagged.length}
        />
      ) : queue.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 288px",
            gap: 16,
            alignItems: "start",
          }}
        >
          {current && (
            <FocusCard
              key={current.problem_key}
              problem={current}
              onGrade={handleGrade}
              onSkip={handleSkip}
              queueIndex={doneCount}
              queueTotal={queue.length + doneCount}
              overdueCount={queue.filter((p) => daysOverdue(p) !== null).length}
              exiting={exitingKey === current.problem_key}
              disabled={saving}
              streakCount={streakCount}
            />
          )}

          {/* Queue sidebar */}
          <div
            className="card"
            style={{
              padding: 0,
              position: "sticky",
              top: 16,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--text-muted)",
                      marginBottom: 2,
                    }}
                  >
                    Up Next
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {queue.length} remaining
                  </div>
                </div>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background:
                      "color-mix(in srgb, var(--accent) 10%, transparent)",
                    border:
                      "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      color: "var(--accent)",
                    }}
                  >
                    {queue.length}
                  </span>
                </div>
              </div>

              {/* Difficulty distribution strip */}
              {queue.length > 0 &&
                (() => {
                  const easy = queue.filter(
                    (p) => effectiveDifficulty(p) === "easy",
                  ).length;
                  const medium = queue.filter(
                    (p) => effectiveDifficulty(p) === "medium",
                  ).length;
                  const hard = queue.filter(
                    (p) => effectiveDifficulty(p) === "hard",
                  ).length;
                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      {easy > 0 && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 10,
                            color: "var(--text-muted)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "var(--easy)",
                              display: "inline-block",
                            }}
                          />
                          {easy}
                        </span>
                      )}
                      {medium > 0 && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 10,
                            color: "var(--text-muted)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "var(--medium)",
                              display: "inline-block",
                            }}
                          />
                          {medium}
                        </span>
                      )}
                      {hard > 0 && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 10,
                            color: "var(--text-muted)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "var(--hard)",
                              display: "inline-block",
                            }}
                          />
                          {hard}
                        </span>
                      )}
                    </div>
                  );
                })()}
            </div>
            {/* Queue items */}
            <div style={{ padding: "10px 10px" }}>
              {queue.map((p, i) => (
                <QueueItem
                  key={p.problem_key}
                  problem={p}
                  index={i}
                  isActive={i === activeIdx}
                  isExiting={exitingKey === p.problem_key}
                  onClick={() => setActiveIdx(i)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming schedule — always visible below */}
      {upcoming.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <UpcomingSchedule problems={upcoming} />
        </div>
      )}
    </div>
  );
}
