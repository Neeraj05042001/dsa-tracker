"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

// ── Icons (inline SVG — no extra dependency) ──────────────────
function IconHome({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}
function IconList({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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
function IconRefresh({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
function IconChart({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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
function IconGroups({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}
function IconChevronLeft({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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
function IconSun({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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
function IconMoon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

// ── Nav config ─────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: IconHome },
  { href: "/dashboard/problems", label: "Problems", icon: IconList },
  {
    href: "/dashboard/revision",
    label: "Revision",
    icon: IconRefresh,
    badge: true,
  },
  { href: "/dashboard/analytics", label: "Analytics", icon: IconChart },
  { href: "/dashboard/groups", label: "CF Groups", icon: IconGroups },
];

// ── Logo mark ──────────────────────────────────────────────────
function LogoMark() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "var(--accent-muted)",
        border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    </div>
  );
}

// ── Sign-out icon ──────────────────────────────────────────────
function IconLogOut({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

// ── Main Sidebar ───────────────────────────────────────────────
interface SidebarUser {
  name: string;
  email: string;
  avatar_url?: string;
}

interface SidebarProps {
  revisionDueCount?: number;
  user?: SidebarUser;
}

export function Sidebar({ revisionDueCount = 0, user }: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`sidebar${collapsed ? " collapsed" : ""}`}
      style={{ userSelect: "none" }}
    >
      {/* ── Logo ── */}
      <Link href="/">
        <div
          style={{
            padding: "16px 14px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: "1px solid var(--border-subtle)",
            minHeight: 56,
          }}
        >
          <LogoMark />
          {!collapsed && (
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
              }}
            >
              Memoize
              {/* tagline */}
              <span style={{
                fontSize: 10,
                color: "var(--text-muted)",
                fontWeight: 400,
                letterSpacing: "0.01em",
                display: "block",
                marginTop: 1,
              }}>
                Solve once. Master forever.
              </span>
            </span>
          )}
        </div>
      </Link>

      {/* ── Nav ── */}
      <nav
        style={{
          padding: "10px 8px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {!collapsed && (
          <span
            className="text-section-header"
            style={{ padding: "8px 8px 6px" }}
          >
            Menu
          </span>
        )}

        {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-nav-item${isActive ? " active" : ""}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={17} />
              {!collapsed && <span style={{ flex: 1 }}>{label}</span>}

              {/* Revision due badge */}
              {badge && revisionDueCount > 0 && !collapsed && (
                <span
                  style={{
                    background: "var(--hard)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "1px 6px",
                    borderRadius: "var(--radius-pill)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {revisionDueCount > 99 ? "99+" : revisionDueCount}
                </span>
              )}
              {badge && revisionDueCount > 0 && collapsed && (
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--hard)",
                    border: "1.5px solid var(--bg-surface)",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom controls ── */}
      <div
        style={{
          padding: "10px 8px 16px",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {/* ── User card ── */}
        {user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: collapsed ? "6px 4px" : "8px 10px",
              borderRadius: "var(--radius-md)",
              marginBottom: 4,
              justifyContent: collapsed ? "center" : "flex-start",
            }}
          >
            {/* Avatar */}
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                width={28}
                height={28}
                style={{
                  borderRadius: "50%",
                  flexShrink: 0,
                  border: "1.5px solid var(--border-mid)",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--accent-muted)",
                  border:
                    "1.5px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--accent)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Name + email */}
            {!collapsed && (
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {user.email}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sign-out */}
        {user && (
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="sidebar-nav-item"
              style={{
                border: "none",
                background: "none",
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                color: "var(--text-muted)",
              }}
              title={collapsed ? "Sign out" : undefined}
            >
              <IconLogOut size={17} />
              {!collapsed && <span style={{ fontSize: 13 }}>Sign out</span>}
            </button>
          </form>
        )}

        {/* Extension status */}
        {!collapsed && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: "var(--radius-md)",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--easy)",
                boxShadow: "0 0 6px var(--easy)",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Extension active
            </span>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="sidebar-nav-item"
          style={{
            border: "none",
            background: "none",
            width: "100%",
            textAlign: "left",
            cursor: "pointer",
          }}
          title={
            collapsed
              ? theme === "dark"
                ? "Light mode"
                : "Dark mode"
              : undefined
          }
        >
          {theme === "dark" ? <IconSun size={17} /> : <IconMoon size={17} />}
          {!collapsed && (
            <span style={{ fontSize: 13 }}>
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          )}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-nav-item"
          style={{
            border: "none",
            background: "none",
            width: "100%",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              display: "flex",
              transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform var(--transition-base)",
            }}
          >
            <IconChevronLeft size={17} />
          </span>
          {!collapsed && <span style={{ fontSize: 13 }}>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}


