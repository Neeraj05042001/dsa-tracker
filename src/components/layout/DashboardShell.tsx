"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sidebar, type SidebarUser } from "@/components/layout/Sidebar";

// ─── Breakpoints ──────────────────────────────────────────────────────────────
const BP_MOBILE = 768;
const BP_TABLET = 1024;

function useBreakpoint() {
  const [bp, setBp] = useState<"mobile" | "tablet" | "desktop">("desktop");
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w < BP_MOBILE)      setBp("mobile");
      else if (w < BP_TABLET) setBp("tablet");
      else                    setBp("desktop");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return bp;
}

// ─── Mobile topbar ────────────────────────────────────────────────────────────
function MobileTopbar({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 50,
      height: 54,
      background: "color-mix(in srgb, var(--bg-surface) 92%, transparent)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border-subtle)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      paddingLeft: 16, paddingRight: 14,
    }}>
      {/* Logo — left */}
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: "var(--accent-muted)",
          border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M3 5L1 8L3 11"    stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 5L15 8L13 11" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 3L6 13"        stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <span style={{
          fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 15,
          color: "var(--text-primary)", letterSpacing: "-0.02em",
        }}>Memoize</span>
      </div>

      {/* Hamburger — right */}
      <button
        onClick={onMenuOpen}
        aria-label="Open navigation"
        style={{
          width: 36, height: 36,
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-mid)",
          background: "var(--bg-elevated)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h12M2 12h12"
            stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────
// Separate component — mounts only when open.
// Backdrop listener is added via native addEventListener inside a setTimeout(fn, 0),
// which pushes attachment to the next macrotask — after the opening tap has
// completely finished propagating. No synthetic event can interfere.
function MobileDrawer({
  onClose,
  revisionDueCount,
  user,
}: {
  onClose: () => void;
  revisionDueCount: number;
  user?: SidebarUser;
}) {
  const reduce = useReducedMotion();
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = backdropRef.current;
    let timer: ReturnType<typeof setTimeout>;
    let handler: ((e: MouseEvent) => void) | null = null;

    // setTimeout(fn, 0) pushes listener attachment to the NEXT macrotask.
    // The browser guarantees the current macrotask (the tap + all its
    // propagating events: touchstart, touchend, pointerdown, pointerup, click)
    // fully completes before any macrotask in the queue runs.
    // So by the time this handler is attached, the opening tap is 100% done.
    timer = setTimeout(() => {
      handler = (e: MouseEvent) => {
        // Guard: only close if the click landed on the backdrop itself,
        // not bubbled up from inside the drawer
        if (e.target === el) onClose();
      };
      el?.addEventListener("click", handler);
    }, 0);

    return () => {
      clearTimeout(timer);
      if (handler && el) el.removeEventListener("click", handler);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        ref={backdropRef}
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduce ? 0 : 0.18, ease: "easeOut" }}
        style={{
          position: "fixed", inset: 0, zIndex: 60,
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      {/* Drawer panel */}
      <motion.div
        key="drawer"
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={reduce
          ? { duration: 0 }
          : { type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0,
          width: "min(280px, 85vw)",
          zIndex: 70,
          boxShadow: "6px 0 40px rgba(0,0,0,0.6), 1px 0 0 var(--border-subtle)",
          borderRadius: "0 20px 20px 0",
          overflow: "hidden",
        }}
      >
        <Sidebar
          collapsed={false}
          onCollapsedChange={() => {}}
          revisionDueCount={revisionDueCount}
          user={user}
          isMobileDrawer
          onMobileClose={onClose}
        />
      </motion.div>
    </>
  );
}

// ─── Main shell ───────────────────────────────────────────────────────────────
interface DashboardShellProps {
  children: React.ReactNode;
  user?: SidebarUser;
  revisionDueCount?: number;
}

export function DashboardShell({ children, user, revisionDueCount = 0 }: DashboardShellProps) {
  const bp = useBreakpoint();
  const reduce = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const initialBpSet = useRef(false);

  const closeMobile = () => setMobileOpen(false);

  // Auto-collapse on tablet, expand on desktop
  useEffect(() => {
    if (initialBpSet.current) return;
    if (bp === "tablet")       { setCollapsed(true);  initialBpSet.current = true; }
    else if (bp === "desktop") { setCollapsed(false); initialBpSet.current = true; }
  }, [bp]);

  // Close drawer when viewport grows past mobile
  useEffect(() => { if (bp !== "mobile") setMobileOpen(false); }, [bp]);

  // ESC key closes drawer
  useEffect(() => {
    if (!mobileOpen) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") closeMobile(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileOpen]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (bp === "mobile") document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, bp]);

  const sidebarMargin =
    bp === "mobile" ? 0
    : collapsed     ? "var(--sidebar-width-collapsed)"
    :                 "var(--sidebar-width)";

  return (
    <>
      <style>{`
        @media (max-width: 1024px) and (min-width: 768px) {
          .dashboard-content { padding: 20px !important; }
          .dashboard-grid-2  { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 767px) {
          .dashboard-content     { padding: 16px !important; }
          .dashboard-grid-2,
          .dashboard-grid-4,
          .dashboard-grid-3      { grid-template-columns: 1fr !important; }
          .topbar-search         { display: none !important; }
          .stat-cards-grid       { grid-template-columns: 1fr 1fr !important; }
          .table-col-hide-mobile { display: none !important; }
        }
        @media (max-width: 400px) {
          .stat-cards-grid   { grid-template-columns: 1fr !important; }
          .dashboard-content { padding: 12px !important; }
        }
      `}</style>

      <div className="dashboard-shell">

        {/* Mobile drawer */}
        {bp === "mobile" && (
          <AnimatePresence>
            {mobileOpen && (
              <MobileDrawer
                key="mobile-drawer"
                onClose={closeMobile}
                revisionDueCount={revisionDueCount}
                user={user}
              />
            )}
          </AnimatePresence>
        )}

        {/* Desktop / tablet fixed sidebar */}
        {bp !== "mobile" && (
          <Sidebar
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            revisionDueCount={revisionDueCount}
            user={user}
          />
        )}

        {/* Main content */}
        <main
          className="dashboard-main"
          style={{
            marginLeft: sidebarMargin,
            transition: reduce ? "none" : "margin-left 0.28s cubic-bezier(0.22,1,0.36,1)",
            minWidth: 0, flex: 1, display: "flex", flexDirection: "column",
          }}
        >
          {bp === "mobile" && <MobileTopbar onMenuOpen={() => setMobileOpen(true)} />}
          {children}
        </main>
      </div>
    </>
  );
}