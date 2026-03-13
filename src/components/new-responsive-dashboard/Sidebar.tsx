"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTheme } from "@/components/providers/ThemeProvider";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SidebarUser {
  name: string;
  email: string;
  avatar_url?: string;
}

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (v: boolean) => void;
  revisionDueCount?: number;
  user?: SidebarUser;
  /** True when rendered inside the mobile slide-in drawer */
  isMobileDrawer?: boolean;
  onMobileClose?: () => void;
}

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: "/dashboard",           label: "Overview",  Icon: IconHome    },
  { href: "/dashboard/problems",  label: "Problems",  Icon: IconList    },
  { href: "/dashboard/revision",  label: "Revision",  Icon: IconRefresh, badge: true },
  { href: "/dashboard/analytics", label: "Analytics", Icon: IconChart   },
  { href: "/dashboard/groups",    label: "CF Groups", Icon: IconGroups  },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
function IconHome() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}
function IconList() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="3" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="3" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="3" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconRefresh() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
function IconGroups() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function IconSun() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
function IconMoon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}
function IconLogOut() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function IconChevronLeft() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
function IconChevronUp() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 15l-6-6-6 6" />
    </svg>
  );
}
function IconClose() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

// ─── Tooltip for icon rail ────────────────────────────────────────────────────
function RailTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    timer.current = setTimeout(() => setVisible(true), 280);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setVisible(false);
  };

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "absolute",
              left: "calc(100% + 10px)",
              top: "50%",
              transform: "translateY(-50%)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-mid)",
              borderRadius: "var(--radius-sm)",
              padding: "5px 10px",
              fontFamily: "var(--font-sans)",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--text-secondary)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              zIndex: 200,
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
            }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function UserAvatar({ user, size = 28 }: { user: SidebarUser; size?: number }) {
  const [err, setErr] = useState(false);
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (user.avatar_url && !err) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          flexShrink: 0,
          overflow: "hidden",
          border:
            "1.5px solid color-mix(in srgb, var(--accent) 35%, transparent)",
        }}
      >
        <Image
          src={user.avatar_url}
          alt={user.name}
          width={size}
          height={size}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
          onError={() => setErr(true)}
        />
      </div>
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: "var(--accent-muted)",
        border:
          "1.5px solid color-mix(in srgb, var(--accent) 35%, transparent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-mono)",
        fontSize: size * 0.36,
        fontWeight: 700,
        color: "var(--accent)",
      }}
    >
      {initials}
    </div>
  );
}

// ─── User popover ─────────────────────────────────────────────────────────────
function UserPopover({
  user,
  onClose,
}: {
  user: SidebarUser;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: reduce ? 0 : 8, scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "absolute",
        bottom: "calc(100% + 8px)",
        left: 8,
        right: 8,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-mid)",
        borderRadius: "var(--radius-lg)",
        boxShadow:
          "0 -8px 32px rgba(0,0,0,0.5), 0 0 0 1px var(--border-subtle)",
        overflow: "hidden",
        zIndex: 100,
      }}
    >
      <div
        style={{
          height: 2,
          background:
            "linear-gradient(90deg, transparent, var(--accent), transparent)",
        }}
      />
      <div
        style={{
          padding: "12px 14px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <UserAvatar user={user} size={32} />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.name}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--text-muted)",
              marginTop: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.email}
          </div>
        </div>
      </div>
      <div style={{ padding: "6px" }}>
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              width: "100%",
              padding: "8px 10px",
              borderRadius: "var(--radius-md)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              color: "var(--text-muted)",
              transition: "all var(--transition-fast)",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background =
                "color-mix(in srgb, var(--hard) 8%, transparent)";
              el.style.color = "var(--hard)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "transparent";
              el.style.color = "var(--text-muted)";
            }}
          >
            <IconLogOut />
            Sign out
          </button>
        </form>
      </div>
    </motion.div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export function Sidebar({
  collapsed,
  onCollapsedChange,
  revisionDueCount = 0,
  user,
  isMobileDrawer = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [_internalCollapsed, _setInternalCollapsed] = useState(false);
  const isCollapsedControlled = collapsed !== undefined;
  const effectiveCollapsed = isCollapsedControlled
    ? collapsed
    : _internalCollapsed;
  const setCollapsed = (v: boolean) => {
    if (onCollapsedChange) onCollapsedChange(v);
    else _setInternalCollapsed(v);
  };
  const isCollapsed = isMobileDrawer ? false : effectiveCollapsed;
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!popoverOpen) return;
    const onDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node))
        setPopoverOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [popoverOpen]);

  // Close popover + drawer on route change — skip on first mount
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    setPopoverOpen(false);
    if (isMobileDrawer && onMobileClose) onMobileClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <style>{`
        /* Override the heavy active state from globals.css */
        .sidebar-nav-item {
          padding: 10px 14px !important;
          font-size: 14px !important;
        }
        .sidebar-nav-item.active,
        .sidebar-nav-item.active:hover,
        .sidebar-nav-item.active:focus {
          background: var(--bg-elevated) !important;
          color: var(--text-primary) !important;
          box-shadow: none !important;
          font-weight: 600 !important;
        }
        .sidebar-nav-item.active::before,
        .sidebar-nav-item.active::after { content: none !important; background: none !important; }

        .sb-secondary {
          display: flex; align-items: center; gap: 10px;
          padding: 7px 12px; border-radius: var(--radius-md);
          border: none; background: none; width: 100%; text-align: left;
          cursor: pointer;
          font-family: var(--font-sans); font-size: 13px;
          color: var(--text-muted);
          transition: all var(--transition-fast);
          white-space: nowrap; overflow: hidden;
        }
        .sb-secondary:hover { background: var(--bg-hover); color: var(--text-secondary); }

        .sb-user-row {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: var(--radius-md);
          cursor: pointer; width: 100%; border: none; background: none; text-align: left;
          transition: background var(--transition-fast);
        }
        .sb-user-row:hover { background: var(--bg-hover); }

        .sb-divider { height: 1px; background: var(--border-subtle); margin: 4px 12px; }
      `}</style>

      <aside
        className={`sidebar${isCollapsed ? " collapsed" : ""}`}
        style={{
          userSelect: "none",
          // Mobile drawer: always full width, no fixed positioning (handled by DashboardShell)
          ...(isMobileDrawer && { position: "relative", height: "100vh" }),
        }}
      >
        {/* ── Logo + mobile close ──────────────────────────── */}
        <div
          style={{
            padding: "12px 14px",
            minHeight: 56,
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid var(--border-subtle)",
            gap: 10,
          }}
        >
          <Link
            href="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flex: 1,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                flexShrink: 0,
                background: "var(--accent-muted)",
                border:
                  "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 5L1 8L3 11"
                  stroke="var(--accent)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13 5L15 8L13 11"
                  stroke="var(--accent)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 3L6 13"
                  stroke="var(--accent)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  style={{ overflow: "hidden", minWidth: 0 }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.02em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Memoize
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      color: "var(--text-muted)",
                      marginTop: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Solve once. Master forever.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {/* Close button — mobile drawer only */}
          {isMobileDrawer && (
            <button
              onClick={onMobileClose}
              aria-label="Close navigation"
              style={{
                width: 30,
                height: 30,
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-elevated)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                color: "var(--text-muted)",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--border-mid)";
                el.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--border-subtle)";
                el.style.color = "var(--text-muted)";
              }}
            >
              <IconClose />
            </button>
          )}
        </div>

        {/* ── Nav ─────────────────────────────────────────── */}
        <nav
          style={{
            padding: "10px 8px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {NAV_ITEMS.map(({ href, label, Icon, badge }) => {
            const normalizedPath = pathname.replace(/\/$/, "");
            const isActive =
              href === "/dashboard"
                ? normalizedPath === "/dashboard"
                : normalizedPath === href ||
                  normalizedPath.startsWith(href + "/");

            const item = (
              <Link
                key={href}
                href={href}
                className={`sidebar-nav-item${isActive ? " active" : ""}`}
                style={{ justifyContent: isCollapsed ? "center" : undefined }}
              >
                {/* Sliding active bg */}
                {isActive && (
                  <motion.span
                    layoutId="sb-active-bg"
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "var(--radius-md)",
                      background:
                        "color-mix(in srgb, var(--accent) 10%, transparent)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                {/* 3px bar */}
                {isActive && (
                  <motion.span
                    layoutId="sb-active-bar"
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "20%",
                      bottom: "20%",
                      width: 3,
                      borderRadius: "0 2px 2px 0",
                      background: "var(--accent)",
                      boxShadow:
                        "0 0 8px color-mix(in srgb, var(--accent) 60%, transparent)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}

                {/* Icon */}
                <span
                  style={{
                    color: isActive ? "var(--accent)" : "var(--text-muted)",
                    position: "relative",
                    zIndex: 1,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    transition: "color var(--transition-fast)",
                  }}
                >
                  <Icon />
                </span>

                {/* Label */}
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.18, ease: "easeInOut" }}
                      style={{
                        flex: 1,
                        overflow: "hidden",
                        fontFamily: "var(--font-sans)",
                        fontSize: 14,
                        fontWeight: isActive ? 600 : 500,
                        color: isActive
                          ? "var(--text-primary)"
                          : "var(--text-secondary)",
                        whiteSpace: "nowrap",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Teal badge — expanded */}
                <AnimatePresence initial={false}>
                  {badge && revisionDueCount > 0 && !isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                      style={{
                        background: "var(--accent-muted)",
                        color: "var(--accent)",
                        border:
                          "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: "var(--radius-pill)",
                        fontFamily: "var(--font-mono)",
                        position: "relative",
                        zIndex: 1,
                        flexShrink: 0,
                      }}
                    >
                      {revisionDueCount > 99 ? "99+" : revisionDueCount}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Dot — collapsed only */}
                {badge && revisionDueCount > 0 && isCollapsed && (
                  <span
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--accent)",
                      border: "1.5px solid var(--bg-surface)",
                    }}
                  />
                )}
              </Link>
            );

            return isCollapsed ? (
              <RailTooltip key={href} label={label}>
                {item}
              </RailTooltip>
            ) : (
              <span key={href}>{item}</span>
            );
          })}
        </nav>

        {/* ── Bottom ──────────────────────────────────────── */}
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            padding: "8px 8px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {/* Extension status */}
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: "var(--radius-md)",
                  marginBottom: 2,
                }}
              >
                <motion.span
                  animate={
                    reduce ? {} : { scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }
                  }
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--easy)",
                    boxShadow: "0 0 6px var(--easy)",
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Extension active
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Theme toggle */}
          {isCollapsed ? (
            <RailTooltip label={theme === "dark" ? "Light mode" : "Dark mode"}>
              <button
                onClick={toggleTheme}
                className="sidebar-nav-item"
                style={{ justifyContent: "center", padding: "8px" }}
              >
                {theme === "dark" ? <IconSun /> : <IconMoon />}
              </button>
            </RailTooltip>
          ) : (
            <button onClick={toggleTheme} className="sidebar-nav-item">
              {theme === "dark" ? <IconSun /> : <IconMoon />}
              <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
            </button>
          )}

          {/* Collapse toggle — desktop/tablet only, not in mobile drawer */}
          {!isMobileDrawer &&
            (isCollapsed ? (
              <RailTooltip label="Expand sidebar">
                <button
                  onClick={() => setCollapsed(false)}
                  className="sidebar-nav-item"
                  style={{ justifyContent: "center", padding: "8px" }}
                >
                  <span
                    style={{ display: "flex", transform: "rotate(180deg)" }}
                  >
                    <IconChevronLeft />
                  </span>
                </button>
              </RailTooltip>
            ) : (
              <button
                onClick={() => setCollapsed(true)}
                className="sidebar-nav-item"
              >
                <IconChevronLeft />
                <span>Collapse</span>
              </button>
            ))}

          <div className="sb-divider" />

          {/* User row */}
          {user && (
            <div ref={popoverRef} style={{ position: "relative" }}>
              <AnimatePresence>
                {popoverOpen && (
                  <UserPopover
                    user={user}
                    onClose={() => setPopoverOpen(false)}
                  />
                )}
              </AnimatePresence>
              <button
                className="sb-user-row"
                onClick={() => setPopoverOpen((v) => !v)}
                aria-label="Account menu"
                style={{ justifyContent: isCollapsed ? "center" : undefined }}
              >
                <UserAvatar user={user} size={28} />
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.18, ease: "easeInOut" }}
                      style={{ flex: 1, minWidth: 0, overflow: "hidden" }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "var(--text-muted)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginTop: 1,
                        }}
                      >
                        {user.email}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, rotate: popoverOpen ? 0 : 180 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <IconChevronUp />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
