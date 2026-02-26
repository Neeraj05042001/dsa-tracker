"use client";

import { useCallback, useRef, useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterState {
  platform: "all" | "leetcode" | "codeforces";
  difficulty: "all" | "easy" | "medium" | "hard";
  status: "all" | "solved" | "attempted";
  confidence: "all" | "low" | "medium" | "high";
  pattern: string; // "all" or a pattern string
  tags: string[];
  needs_revision: boolean;
  search: string;
}

export const FILTER_DEFAULTS: FilterState = {
  platform: "all",
  difficulty: "all",
  status: "all",
  confidence: "all",
  pattern: "all",
  tags: [],
  needs_revision: false,
  search: "",
};

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availablePatterns: string[];
  availableTags: string[];
  viewMode: "table" | "card";
  onViewModeChange: (mode: "table" | "card") => void;
  totalCount: number;
  filteredCount: number;
  needsRevisionCount?: number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`chip${active ? " chip-active" : ""}`}
      type="button"
    >
      {children}
    </button>
  );
}

function TagsDropdown({
  availableTags,
  selectedTags,
  onChange,
}: {
  availableTags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const hasSelected = selectedTags.length > 0;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          height: 28,
          padding: "0 10px",
          borderRadius: "var(--radius-pill)",
          border: `1px solid ${hasSelected ? "var(--accent)" : "var(--border-mid)"}`,
          background: hasSelected ? "var(--accent-muted)" : "transparent",
          color: hasSelected ? "var(--accent)" : "var(--text-secondary)",
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "all 0.15s ease",
        }}
      >
        Tags
        {hasSelected && (
          <span
            style={{
              background: "var(--accent)",
              color: "var(--bg-base)",
              borderRadius: "var(--radius-pill)",
              fontSize: 10,
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              padding: "0 5px",
              lineHeight: "16px",
            }}
          >
            {selectedTags.length}
          </span>
        )}
        {/* Chevron */}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && availableTags.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 50,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-mid)",
            borderRadius: "var(--radius-md)",
            padding: 8,
            minWidth: 180,
            maxHeight: 240,
            overflowY: "auto",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
          }}
        >
          {availableTags.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                style={{
                  padding: "3px 8px",
                  borderRadius: "var(--radius-pill)",
                  border: `1px solid ${active ? "var(--accent)" : "var(--border-subtle)"}`,
                  background: active ? "var(--accent-muted)" : "transparent",
                  color: active ? "var(--accent)" : "var(--text-secondary)",
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.12s ease",
                }}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PatternDropdown({
  availablePatterns,
  value,
  onChange,
}: {
  availablePatterns: string[];
  value: string;
  onChange: (pattern: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = value !== "all";
  const label = isActive ? value : "Pattern";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          height: 28,
          padding: "0 10px",
          borderRadius: "var(--radius-pill)",
          border: `1px solid ${isActive ? "var(--accent)" : "var(--border-mid)"}`,
          background: isActive ? "var(--accent-muted)" : "transparent",
          color: isActive ? "var(--accent)" : "var(--text-secondary)",
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
          whiteSpace: "nowrap",
          maxWidth: 140,
          overflow: "hidden",
          textOverflow: "ellipsis",
          transition: "all 0.15s ease",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && availablePatterns.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 50,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-mid)",
            borderRadius: "var(--radius-md)",
            padding: 4,
            minWidth: 180,
            maxHeight: 240,
            overflowY: "auto",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* All option */}
          <button
            type="button"
            onClick={() => { onChange("all"); setOpen(false); }}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "6px 10px",
              borderRadius: "var(--radius-sm)",
              background: value === "all" ? "var(--accent-muted)" : "transparent",
              color: value === "all" ? "var(--accent)" : "var(--text-secondary)",
              fontSize: 12,
              fontWeight: value === "all" ? 600 : 400,
              cursor: "pointer",
              border: "none",
              transition: "background 0.1s ease",
            }}
          >
            All patterns
          </button>
          {availablePatterns.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => { onChange(p); setOpen(false); }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "6px 10px",
                borderRadius: "var(--radius-sm)",
                background: value === p ? "var(--accent-muted)" : "transparent",
                color: value === p ? "var(--accent)" : "var(--text-secondary)",
                fontSize: 12,
                fontWeight: value === p ? 600 : 400,
                cursor: "pointer",
                border: "none",
                transition: "background 0.1s ease",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── View toggle ──────────────────────────────────────────────────────────────

function ViewToggle({
  mode,
  onChange,
}: {
  mode: "table" | "card";
  onChange: (m: "table" | "card") => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: 2,
        gap: 2,
      }}
    >
      {(["table", "card"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          title={m === "table" ? "Table view" : "Card view"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 24,
            borderRadius: "var(--radius-sm)",
            background: mode === m ? "var(--bg-hover)" : "transparent",
            border: "none",
            color: mode === m ? "var(--text-primary)" : "var(--text-muted)",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {m === "table" ? (
            // List/table icon
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="2.5" />
              <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="2.5" />
              <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="2.5" />
            </svg>
          ) : (
            // Grid/card icon
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Main FilterBar ───────────────────────────────────────────────────────────

export function FilterBar({
  filters,
  onChange,
  availablePatterns,
  availableTags,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
  needsRevisionCount = 0,
}: FilterBarProps) {
  const set = useCallback(
    (partial: Partial<FilterState>) => onChange({ ...filters, ...partial }),
    [filters, onChange]
  );

  const isFiltered =
    filters.platform !== "all" ||
    filters.difficulty !== "all" ||
    filters.status !== "all" ||
    filters.confidence !== "all" ||
    filters.pattern !== "all" ||
    filters.tags.length > 0 ||
    filters.needs_revision ||
    filters.search.trim() !== "";

  const clearAll = () => onChange({ ...FILTER_DEFAULTS });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* ── Row 1: Platform + Difficulty + Status ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        {/* Platform group */}
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: "3px 3px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-pill)",
          }}
        >
          <Chip active={filters.platform === "all"} onClick={() => set({ platform: "all" })}>
            All
          </Chip>
          <Chip
            active={filters.platform === "leetcode"}
            onClick={() => set({ platform: "leetcode" })}
          >
            <span style={{ color: filters.platform === "leetcode" ? "var(--lc-color)" : undefined, display: "flex", alignItems: "center", gap: 4 }}>
              {/* LeetCode dot */}
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--lc-color)",
                display: "inline-block",
                flexShrink: 0,
              }} />
              LeetCode
            </span>
          </Chip>
          <Chip
            active={filters.platform === "codeforces"}
            onClick={() => set({ platform: "codeforces" })}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--cf-color)",
                display: "inline-block",
                flexShrink: 0,
              }} />
              Codeforces
            </span>
          </Chip>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "var(--border-subtle)", flexShrink: 0 }} />

        {/* Difficulty group */}
        <div style={{ display: "flex", gap: 4 }}>
          {(["all", "easy", "medium", "hard"] as const).map((d) => (
            <Chip key={d} active={filters.difficulty === d} onClick={() => set({ difficulty: d })}>
              {d === "all" ? (
                "All"
              ) : (
                <span style={{ color: filters.difficulty === d ? undefined : `var(--${d})` }}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </span>
              )}
            </Chip>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "var(--border-subtle)", flexShrink: 0 }} />

        {/* Status group */}
        <div style={{ display: "flex", gap: 4 }}>
          {(["all", "solved", "attempted"] as const).map((s) => (
            <Chip key={s} active={filters.status === s} onClick={() => set({ status: s })}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </Chip>
          ))}
        </div>
      </div>

      {/* ── Row 2: Pattern, Tags, Revision toggle, Search, View toggle ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {/* Pattern dropdown */}
        {availablePatterns.length > 0 && (
          <PatternDropdown
            availablePatterns={availablePatterns}
            value={filters.pattern}
            onChange={(pattern) => set({ pattern })}
          />
        )}

        {/* Tags dropdown */}
        {availableTags.length > 0 && (
          <TagsDropdown
            availableTags={availableTags}
            selectedTags={filters.tags}
            onChange={(tags) => set({ tags })}
          />
        )}

        {/* Needs revision toggle */}
        <button
          type="button"
          onClick={() => set({ needs_revision: !filters.needs_revision })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            height: 28,
            padding: "0 10px",
            borderRadius: "var(--radius-pill)",
            border: `1px solid ${filters.needs_revision ? "color-mix(in srgb, var(--medium) 50%, transparent)" : "var(--border-mid)"}`,
            background: filters.needs_revision ? "color-mix(in srgb, var(--medium) 12%, transparent)" : "transparent",
            color: filters.needs_revision ? "var(--medium)" : "var(--text-secondary)",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.15s ease",
          }}
        >
          {/* Refresh icon */}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Needs Revision
          {needsRevisionCount > 0 && (
            <span
              style={{
                background: filters.needs_revision ? "var(--medium)" : "color-mix(in srgb, var(--medium) 20%, transparent)",
                color: filters.needs_revision ? "var(--bg-base)" : "var(--medium)",
                borderRadius: "var(--radius-pill)",
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                padding: "0 5px",
                lineHeight: "16px",
                minWidth: 16,
                textAlign: "center",
              }}
            >
              {needsRevisionCount}
            </span>
          )}
        </button>

        {/* Search input */}
        <div
          style={{
            flex: 1,
            minWidth: 180,
            maxWidth: 280,
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              position: "absolute",
              left: 9,
              color: "var(--text-muted)",
              pointerEvents: "none",
              flexShrink: 0,
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search problems…"
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            style={{
              width: "100%",
              height: 28,
              padding: "0 10px 0 28px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-pill)",
              color: "var(--text-primary)",
              fontSize: 12,
              outline: "none",
              transition: "border-color 0.15s ease",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => set({ search: "" })}
              style={{
                position: "absolute",
                right: 8,
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Result count */}
        <span
          style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: "var(--text-muted)",
            whiteSpace: "nowrap",
          }}
        >
          {isFiltered ? (
            <>{filteredCount} <span style={{ opacity: 0.5 }}>/ {totalCount}</span></>
          ) : (
            <>{totalCount} problems</>
          )}
        </span>

        {/* Clear filters */}
        {isFiltered && (
          <button
            type="button"
            onClick={clearAll}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              height: 28,
              padding: "0 10px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--border-mid)",
              background: "transparent",
              color: "var(--text-muted)",
              fontSize: 11,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.borderColor = "var(--border-mid)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.borderColor = "var(--border-mid)";
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Clear
          </button>
        )}

        {/* View toggle */}
        <ViewToggle mode={viewMode} onChange={onViewModeChange} />
      </div>
    </div>
  );
}