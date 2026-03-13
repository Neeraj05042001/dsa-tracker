"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ─── Single scroll-observed section ──────────────────────────────────────────

function ObservedSection({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{
        duration: 0.5,
        delay: 0.05 * index, // slight cascade between sections
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Main wrapper ─────────────────────────────────────────────────────────────
// Wraps each [data-section] child in an ObservedSection for scroll entrance

export function AnalyticsPageClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef}>
      {/* Iterate children and wrap each in an ObservedSection */}
      {Array.isArray(children) ? (
        children.map((child, i) => (
          <ObservedSection key={i} index={i}>
            {child}
          </ObservedSection>
        ))
      ) : (
        <ObservedSection index={0}>{children}</ObservedSection>
      )}
    </div>
  );
}
