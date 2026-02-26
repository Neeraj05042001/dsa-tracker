"use client";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

function IconSearch({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="topbar">
      {/* Page title */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        <h1 style={{
          fontSize: 16,
          fontWeight: 600,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
          lineHeight: 1.2,
        }}>
          {title}
        </h1>
        {subtitle && (
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {subtitle}
          </span>
        )}
      </div>

      {/* Search trigger */}
      <button
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
          transition: "all var(--transition-fast)",
          minWidth: 160,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-mid)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-subtle)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
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
      </button>
    </header>
  );
}