"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";

// ─── Extension popup mockup ───────────────────────────────────────────────────
// Cycles through 3 states matching the real extension screenshots:
// State 0 — Problem info (auto-filled)
// State 1 — Confidence / pattern (user fills)
// State 2 — Notes + "Add to Tracker" confirmation

type PopupState = 0 | 1 | 2;

const CHIP_STYLE = (active: boolean, color = "var(--accent)") => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "4px 10px",
  borderRadius: "var(--radius-pill)" as const,
  border: `1px solid ${active ? color : "var(--border-mid)"}`,
  background: active ? `color-mix(in srgb, ${color} 14%, transparent)` : "transparent",
  color: active ? color : "var(--text-muted)",
  fontFamily: "var(--font-mono)" as const,
  fontSize: 10,
  cursor: "default",
  transition: "all var(--transition-fast)",
  whiteSpace: "nowrap" as const,
});

function ExtensionPopup({ activeStep }: { activeStep: number }) {
  const [popupState, setPopupState] = useState<PopupState>(0);
  const reduce = useReducedMotion();

  // Auto-advance through states when the section is active
  useEffect(() => {
    if (reduce) return;
    const timings: number[] = [2200, 2400, 2600];
    const timer = setTimeout(() => {
      setPopupState((s) => ((s + 1) % 3) as PopupState);
    }, timings[popupState]);
    return () => clearTimeout(timer);
  }, [popupState, reduce]);

  return (
    <div style={{
      width: "100%",
      maxWidth: 320,
      background: "#111116",
      border: "1px solid var(--border-mid)",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px var(--border-subtle)",
      fontFamily: "var(--font-sans)",
    }}>
      {/* Title bar */}
      <div style={{
        height: 36,
        background: "var(--bg-base)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center",
        paddingLeft: 10, paddingRight: 10,
        gap: 7,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: "var(--accent-muted)",
          border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M3 5L1 8L3 11" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 5L15 8L13 11" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 3L6 13" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>Memoize</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2h8v8" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" /><path d="M10 2L2 10" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" /></svg>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>

      {/* Accepted banner */}
      <div style={{ padding: "12px 14px 10px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--easy)", boxShadow: "0 0 6px var(--easy)" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "var(--easy)", textTransform: "uppercase" }}>Accepted</span>
            </div>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
              Container With Most Water
            </div>
            <div style={{ display: "flex", gap: 5, marginTop: 5, alignItems: "center" }}>
              <span style={{ ...CHIP_STYLE(true, "var(--medium)"), fontSize: 9, padding: "2px 7px" }}>Medium</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>Array  +2</span>
            </div>
          </div>
          {/* LC badge */}
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: "var(--lc-muted)",
            border: "1px solid color-mix(in srgb, var(--lc-color) 30%, transparent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--lc-color)" }}>LC</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--border-subtle)", margin: "0 14px" }} />

      {/* Animated content area */}
      <div style={{ minHeight: 220, position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          {popupState === 0 && <PopupStateInfo key="info" />}
          {popupState === 1 && <PopupStateConfidence key="confidence" />}
          {popupState === 2 && <PopupStateNotes key="notes" />}
        </AnimatePresence>
      </div>

      {/* Footer: runtime + CTA */}
      <div style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "10px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--bg-base)",
      }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)" }}>
          1 ms · 59.9 MB · javascript
        </span>
        <button style={{
          background: popupState === 2 ? "var(--easy)" : "var(--accent)",
          color: "#0d0d0f",
          border: "none", borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700,
          padding: "6px 12px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 5,
          transition: "all var(--transition-fast)",
          boxShadow: popupState === 2 ? "0 0 12px rgba(74,222,128,0.35)" : "none",
        }}>
          {popupState === 2 ? "✓ Added!" : "Add to Tracker →"}
        </button>
      </div>
    </div>
  );
}

const slideVariants = {
  enter:  { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0  },
  exit:   { opacity: 0, y: -8 },
};
const slideTransition = { duration: 0.28, ease: [0.22, 1, 0.36, 1] };

function PopupStateInfo() {
  return (
    <motion.div
      variants={slideVariants} initial="enter" animate="center" exit="exit"
      transition={slideTransition}
      style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}
    >
      <SectionLabel>Problem Info</SectionLabel>
      <Field label="PROBLEM NAME">
        <div style={fieldValueStyle}>Container With Most Water</div>
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <Field label="PLATFORM">
          <div style={{ ...fieldValueStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            LeetCode
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M2 3.5l2.5 2.5L7 3.5" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" /></svg>
          </div>
        </Field>
        <Field label="DIFFICULTY">
          <div style={{ display: "flex", gap: 4 }}>
            {["Easy", "Medium", "Hard"].map((d) => (
              <div key={d} style={{
                ...CHIP_STYLE(d === "Medium", d === "Medium" ? "var(--medium)" : undefined),
                fontSize: 9, padding: "2px 6px",
              }}>{d}</div>
            ))}
          </div>
        </Field>
      </div>
      <Field label={<span>TAGS <span style={{ color: "var(--accent)", fontSize: 8, marginLeft: 4, fontFamily: "var(--font-mono)", background: "var(--accent-muted)", padding: "1px 5px", borderRadius: 4 }}>AUTO-FILLED</span></span>}>
        <div style={fieldValueStyle}>Array, Two Pointers, Greedy</div>
      </Field>
    </motion.div>
  );
}

function PopupStateConfidence() {
  return (
    <motion.div
      variants={slideVariants} initial="enter" animate="center" exit="exit"
      transition={slideTransition}
      style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}
    >
      <SectionLabel>How did it go?</SectionLabel>
      <Field label="STATUS">
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { label: "✓ Solved", active: true },
            { label: "~ Attempted", active: false },
          ].map((s) => (
            <div key={s.label} style={{
              flex: 1, textAlign: "center" as const,
              padding: "5px 0",
              borderRadius: "var(--radius-md)",
              background: s.active ? "var(--accent-muted)" : "var(--bg-elevated)",
              border: `1px solid ${s.active ? "var(--accent)" : "var(--border-mid)"}`,
              color: s.active ? "var(--accent)" : "var(--text-muted)",
              fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
            }}>{s.label}</div>
          ))}
        </div>
      </Field>
      <Field label="FELT LIKE">
        <div style={{ display: "flex", gap: 5 }}>
          {[
            { label: "Easy", color: "var(--easy)", active: false },
            { label: "Medium", color: "var(--medium)", active: false },
            { label: "Hard", color: "var(--hard)", active: true },
          ].map((d) => (
            <div key={d.label} style={{ ...CHIP_STYLE(d.active, d.color), fontSize: 9, padding: "3px 8px" }}>{d.label}</div>
          ))}
        </div>
      </Field>
      <Field label="CONFIDENCE TO SOLVE AGAIN">
        <div style={{ display: "flex", gap: 5 }}>
          {["Low", "Medium", "High"].map((c) => (
            <div key={c} style={{ ...CHIP_STYLE(c === "Medium", "var(--accent)"), fontSize: 9, padding: "3px 8px" }}>{c}</div>
          ))}
        </div>
      </Field>
      <Field label="PROBLEM PATTERN">
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const }}>
          {["Sliding Window", "Two Pointers", "Binary Search"].map((p) => (
            <div key={p} style={{ ...CHIP_STYLE(p === "Sliding Window", "var(--accent)"), fontSize: 9, padding: "3px 8px" }}>{p}</div>
          ))}
        </div>
      </Field>
    </motion.div>
  );
}

function PopupStateNotes() {
  return (
    <motion.div
      variants={slideVariants} initial="enter" animate="center" exit="exit"
      transition={slideTransition}
      style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}
    >
      {/* Revision flag */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 10px",
        borderRadius: "var(--radius-md)",
        background: "var(--accent-muted)",
        border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2v9M2 2h7l-1.5 3L9 8H2" stroke="var(--accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--accent)", fontWeight: 500, flex: 1 }}>Mark for interview revision</span>
        <div style={{ width: 16, height: 16, borderRadius: 4, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2.5 2.5 4-4" stroke="#0d0d0f" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>

      <Field label="YOUR APPROACH / IDEA">
        <div style={{ ...fieldValueStyle, minHeight: 36, color: "var(--text-secondary)" }}>Calculate area each step</div>
      </Field>
      <Field label="MISTAKES / WHAT WENT WRONG">
        <div style={{ ...fieldValueStyle, minHeight: 36, color: "var(--text-secondary)" }}>Forgetting area update</div>
      </Field>
    </motion.div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────
const fieldValueStyle: React.CSSProperties = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-sm)",
  padding: "6px 9px",
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  color: "var(--text-primary)",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
      letterSpacing: "0.1em", textTransform: "uppercase" as const,
      color: "var(--text-muted)",
    }}>{children}</div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--text-muted)" }}>{label}</div>
      {children}
    </div>
  );
}

// ─── Steps data ───────────────────────────────────────────────────────────────
const STEPS = [
  {
    number: "01",
    title: "Solve on LeetCode or Codeforces",
    body: "Submit your solution as usual. The moment it's accepted, the extension detects it automatically — no copy-pasting, no tab-switching.",
    tag: "Auto-detected",
    tagColor: "var(--accent)",
    detail: "Platform, difficulty, tags, runtime, and memory are all pulled in without you touching anything.",
  },
  {
    number: "02",
    title: "Rate it honestly. Takes 20 seconds.",
    body: "A popup appears. You pick how it felt (Easy/Medium/Hard), your confidence to solve it again, the pattern it used, and optionally add a quick note on your approach.",
    tag: "Manual install required",
    tagColor: "var(--medium)",
    detail: "The extension installs via chrome://extensions → Load unpacked. No Chrome Web Store yet — takes about 2 minutes once.",
  },
  {
    number: "03",
    title: "Dashboard tells you exactly what to review and when.",
    body: "SM-2 calculates your next review date based on your confidence rating. Problems you're shaky on come back tomorrow. Strong ones return in weeks.",
    tag: "SM-2 algorithm",
    tagColor: "var(--cf-color)",
    detail: "Interval grows exponentially: 1 day → 6 days → 15 days → ... You only review what's about to decay.",
  },
];

// ─── Step row ─────────────────────────────────────────────────────────────────
function StepRow({
  step,
  index,
  isActive,
  onClick,
}: {
  step: (typeof STEPS)[number];
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: reduce ? 0 : -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      style={{
        display: "flex",
        gap: 20,
        padding: "20px 20px",
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${isActive ? "color-mix(in srgb, var(--accent) 30%, transparent)" : "var(--border-subtle)"}`,
        background: isActive ? "var(--accent-muted)" : "transparent",
        cursor: "pointer",
        transition: "all var(--transition-base)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Active left bar */}
      {isActive && (
        <motion.div
          layoutId="step-active-bar"
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: 3,
            background: "var(--accent)",
            borderRadius: "0 var(--radius-pill) var(--radius-pill) 0",
            boxShadow: "0 0 8px var(--accent-glow)",
          }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        />
      )}

      {/* Number */}
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: "-0.04em",
        color: isActive ? "var(--accent)" : "var(--text-subtle)",
        lineHeight: 1,
        flexShrink: 0,
        marginTop: 2,
        transition: "color var(--transition-base)",
        minWidth: 32,
      }}>
        {step.number}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
          <h3 style={{
            fontFamily: "var(--font-sans)",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
            margin: 0, lineHeight: 1.3,
            transition: "color var(--transition-base)",
          }}>
            {step.title}
          </h3>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
            letterSpacing: "0.06em", textTransform: "uppercase" as const,
            color: step.tagColor,
            background: `color-mix(in srgb, ${step.tagColor} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${step.tagColor} 25%, transparent)`,
            borderRadius: "var(--radius-pill)",
            padding: "2px 7px", flexShrink: 0,
          }}>
            {step.tag}
          </span>
        </div>

        <p style={{
          fontFamily: "var(--font-sans)", fontSize: 13,
          color: "var(--text-secondary)", lineHeight: 1.65,
          margin: 0,
        }}>
          {step.body}
        </p>

        {/* Detail — only visible when active */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 10 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 11,
                color: "var(--text-muted)", lineHeight: 1.6,
                padding: "8px 12px",
                background: "var(--bg-elevated)",
                borderRadius: "var(--radius-md)",
                borderLeft: `2px solid ${step.tagColor}`,
              }}>
                {step.detail}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const reduce = useReducedMotion();
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-60px" });

  // Auto-advance active step
  useEffect(() => {
    if (reduce) return;
    const timer = setTimeout(() => {
      setActiveStep((s) => (s + 1) % 3);
    }, 4800);
    return () => clearTimeout(timer);
  }, [activeStep, reduce]);

  return (
    <>
      <style>{`
        .hiw-section {
          padding: 100px clamp(16px, 4vw, 40px) 80px;
          position: relative;
          overflow: hidden;
        }

        /* Subtle background teal radial */
        .hiw-section::before {
          content: "";
          position: absolute;
          bottom: -100px; right: -100px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(0,212,170,0.04) 0%, transparent 65%);
          pointer-events: none;
        }

        .hiw-inner {
          max-width: 1100px;
          margin: 56px auto 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .hiw-steps {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hiw-visual {
          display: flex;
          justify-content: center;
          align-items: center;
          position: sticky;
          top: 100px;
        }

        /* On mobile: stack, visual goes on top */
        @media (max-width: 860px) {
          .hiw-inner {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .hiw-visual {
            position: static;
            order: -1;
          }
        }
      `}</style>

      <section className="hiw-section" id="how-it-works" aria-label="How it works">

        {/* Section header */}
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center" }}
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--text-muted)", marginBottom: 16,
          }}>
            <div style={{ width: 20, height: 1, background: "var(--border-strong)" }} />
            How it works
            <div style={{ width: 20, height: 1, background: "var(--border-strong)" }} />
          </div>

          <h2 style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(26px, 3.5vw, 40px)",
            fontWeight: 700, letterSpacing: "-0.03em",
            color: "var(--text-primary)", lineHeight: 1.15,
            margin: "0 auto", maxWidth: 520,
          }}>
            Zero new habits.{" "}
            <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
              Just solve — Memoize handles the rest.
            </span>
          </h2>

          <p style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(13px, 1.5vw, 15px)",
            color: "var(--text-secondary)", lineHeight: 1.7,
            maxWidth: 440, margin: "16px auto 0",
          }}>
            Three steps. The first is automatic. The second takes 20 seconds. The third runs in the background forever.
          </p>
        </motion.div>

        <div className="hiw-inner">

          {/* Steps */}
          <div className="hiw-steps">
            {STEPS.map((step, i) => (
              <StepRow
                key={step.number}
                step={step}
                index={i}
                isActive={activeStep === i}
                onClick={() => setActiveStep(i)}
              />
            ))}

            {/* Step progress dots */}
            <div style={{ display: "flex", gap: 6, paddingLeft: 52, marginTop: 4 }}>
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  aria-label={`Go to step ${i + 1}`}
                  style={{
                    width: activeStep === i ? 18 : 6,
                    height: 6,
                    borderRadius: "var(--radius-pill)",
                    background: activeStep === i ? "var(--accent)" : "var(--border-mid)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all var(--transition-base)",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Floating extension popup visual */}
          <div className="hiw-visual">
            <motion.div
              animate={reduce ? {} : { y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: "100%", maxWidth: 320, position: "relative" }}
            >
              {/* Glow behind popup */}
              <div style={{
                position: "absolute",
                bottom: -30, left: "5%", right: "5%",
                height: 80,
                background: "radial-gradient(ellipse, rgba(0,212,170,0.15) 0%, transparent 70%)",
                filter: "blur(16px)",
                pointerEvents: "none",
                zIndex: 0,
              }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <ExtensionPopup activeStep={activeStep} />
              </div>
            </motion.div>
          </div>

        </div>
      </section>
    </>
  );
}