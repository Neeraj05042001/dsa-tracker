"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterState {
  platform: "all" | "leetcode" | "codeforces";
  difficulty: "all" | "easy" | "medium" | "hard";
  status: "all" | "solved" | "attempted";
  confidence: "all" | "low" | "medium" | "high";
  pattern: string;
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

// ─── Sliding-pill chip group ──────────────────────────────────────────────────
// Uses Framer layoutId so the active background physically slides between chips.

function ChipGroup<T extends string>({
  groupId,
  options,
  value,
  onChange,
}: {
  groupId: string;
  options: { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-pill)",
        padding: 3,
        gap: 2,
        flexShrink: 0,
      }}
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <motion.button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            whileTap={{ scale: 0.94 }}
            style={{
              position: "relative",
              padding: "3px 10px",
              borderRadius: "var(--radius-pill)",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "var(--text-primary)" : "var(--text-muted)",
              transition: "color 0.18s",
              whiteSpace: "nowrap",
              zIndex: 0,
            }}
          >
            {/* Sliding background pill */}
            {isActive && (
              <motion.span
                layoutId={`chip-pill-${groupId}`}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "var(--radius-pill)",
                  background: "var(--bg-hover)",
                  border: "1px solid var(--border-mid)",
                  zIndex: -1,
                }}
              />
            )}
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Dropdown shell ───────────────────────────────────────────────────────────

function useOutsideClick(
  ref: React.RefObject<HTMLDivElement | null>,
  cb: () => void,
) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

function DropdownTrigger({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        height: 30,
        padding: "0 11px",
        borderRadius: "var(--radius-pill)",
        border: `1px solid ${active ? "color-mix(in srgb, var(--accent) 45%, transparent)" : "var(--border-mid)"}`,
        background: active
          ? "color-mix(in srgb, var(--accent) 8%, transparent)"
          : "var(--bg-elevated)",
        color: active ? "var(--accent)" : "var(--text-secondary)",
        fontSize: 12,
        fontWeight: active ? 600 : 500,
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
    >
      {children}
    </motion.button>
  );
}

function DropdownPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        left: 0,
        zIndex: 60,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-mid)",
        borderRadius: "var(--radius-md)",
        boxShadow:
          "0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
        minWidth: 200,
        maxHeight: 260,
        overflowY: "auto",
      }}
    >
      {children}
    </motion.div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.svg
      width="9"
      height="9"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.18 }}
    >
      <polyline points="6 9 12 15 18 9" />
    </motion.svg>
  );
}

// ─── Pattern dropdown ─────────────────────────────────────────────────────────

function PatternDropdown({
  availablePatterns,
  value,
  onChange,
}: {
  availablePatterns: string[];
  value: string;
  onChange: (p: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setOpen(false));
  const isActive = value !== "all";

  const displayLabel = isActive
    ? value
        .split(/[_\s]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Pattern";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <DropdownTrigger active={isActive} onClick={() => setOpen((o) => !o)}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <span
          style={{
            maxWidth: 110,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {displayLabel}
        </span>
        <ChevronIcon open={open} />
      </DropdownTrigger>

      <AnimatePresence>
        {open && (
          <DropdownPanel>
            <div style={{ padding: 4 }}>
              {[
                { value: "all", label: "All patterns" },
                ...availablePatterns.map((p) => ({ value: p, label: p })),
              ].map((opt) => {
                const isSelected = value === opt.value;
                const formattedLabel =
                  opt.value === "all"
                    ? "All patterns"
                    : opt.value
                        .split(/[_\s]+/)
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ");
                return (
                  <motion.button
                    key={opt.value}
                    type="button"
                    whileHover={{ x: 2 }}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      textAlign: "left",
                      padding: "7px 12px",
                      background: isSelected
                        ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                        : "transparent",
                      color: isSelected
                        ? "var(--accent)"
                        : "var(--text-secondary)",
                      fontSize: 12,
                      fontWeight: isSelected ? 600 : 400,
                      cursor: "pointer",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      transition: "background 0.1s",
                    }}
                  >
                    {isSelected && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    <span style={{ marginLeft: isSelected ? 0 : 18 }}>
                      {formattedLabel}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </DropdownPanel>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Tags dropdown ────────────────────────────────────────────────────────────

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
  useOutsideClick(ref, () => setOpen(false));
  const hasSelected = selectedTags.length > 0;

  const toggle = (tag: string) =>
    onChange(
      selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag],
    );

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <DropdownTrigger active={hasSelected} onClick={() => setOpen((o) => !o)}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
        Tags
        {hasSelected && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
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
          </motion.span>
        )}
        <ChevronIcon open={open} />
      </DropdownTrigger>

      <AnimatePresence>
        {open && (
          <DropdownPanel>
            <div
              style={{ padding: 8, display: "flex", flexWrap: "wrap", gap: 5 }}
            >
              {availableTags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <motion.button
                    key={tag}
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => toggle(tag)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "var(--radius-pill)",
                      border: `1px solid ${active ? "var(--accent)" : "var(--border-subtle)"}`,
                      background: active
                        ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                        : "var(--bg-hover)",
                      color: active ? "var(--accent)" : "var(--text-secondary)",
                      fontSize: 11,
                      fontWeight: active ? 600 : 400,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.12s",
                    }}
                  >
                    {tag}
                  </motion.button>
                );
              })}
            </div>
          </DropdownPanel>
        )}
      </AnimatePresence>
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
        flexShrink: 0,
      }}
    >
      {(["table", "card"] as const).map((m) => (
        <motion.button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          title={m === "table" ? "Table view" : "Card view"}
          whileTap={{ scale: 0.9 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 26,
            borderRadius: "var(--radius-sm)",
            background: mode === m ? "var(--bg-hover)" : "transparent",
            border: "none",
            color: mode === m ? "var(--text-primary)" : "var(--text-muted)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {m === "table" ? (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="2.5" />
              <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="2.5" />
              <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="2.5" />
            </svg>
          ) : (
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          )}
        </motion.button>
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
    [filters, onChange],
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

  const platformOptions = [
    { value: "all" as const, label: "All" },
    {
      value: "leetcode" as const,
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--lc-color)",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          LeetCode
        </span>
      ),
    },
    {
      value: "codeforces" as const,
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--cf-color)",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          Codeforces
        </span>
      ),
    },
  ];

  const difficultyOptions = [
    { value: "all" as const, label: "All" },
    {
      value: "easy" as const,
      label: (
        <span
          style={{
            color: filters.difficulty === "easy" ? undefined : "var(--easy)",
          }}
        >
          Easy
        </span>
      ),
    },
    {
      value: "medium" as const,
      label: (
        <span
          style={{
            color:
              filters.difficulty === "medium" ? undefined : "var(--medium)",
          }}
        >
          Medium
        </span>
      ),
    },
    {
      value: "hard" as const,
      label: (
        <span
          style={{
            color: filters.difficulty === "hard" ? undefined : "var(--hard)",
          }}
        >
          Hard
        </span>
      ),
    },
  ];

  const statusOptions = [
    { value: "all" as const, label: "All" },
    { value: "solved" as const, label: "Solved" },
    { value: "attempted" as const, label: "Attempted" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      {/* ── Row 1: Platform · Difficulty · Status ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        <ChipGroup
          groupId="platform"
          options={platformOptions}
          value={filters.platform}
          onChange={(v) => set({ platform: v })}
        />

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 20,
            background: "var(--border-subtle)",
            flexShrink: 0,
          }}
        />

        <ChipGroup
          groupId="difficulty"
          options={difficultyOptions}
          value={filters.difficulty}
          onChange={(v) => set({ difficulty: v })}
        />

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 20,
            background: "var(--border-subtle)",
            flexShrink: 0,
          }}
        />

        <ChipGroup
          groupId="status"
          options={statusOptions}
          value={filters.status}
          onChange={(v) => set({ status: v })}
        />
      </div>

      {/* ── Row 2: Dropdowns + search + controls ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
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

        {/* Needs Revision toggle */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => set({ needs_revision: !filters.needs_revision })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            height: 30,
            padding: "0 11px",
            borderRadius: "var(--radius-pill)",
            border: `1px solid ${
              filters.needs_revision
                ? "color-mix(in srgb, var(--medium) 55%, transparent)"
                : "var(--border-mid)"
            }`,
            background: filters.needs_revision
              ? "color-mix(in srgb, var(--medium) 10%, transparent)"
              : "var(--bg-elevated)",
            color: filters.needs_revision
              ? "var(--medium)"
              : "var(--text-secondary)",
            fontSize: 12,
            fontWeight: filters.needs_revision ? 600 : 500,
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.15s",
            flexShrink: 0,
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Revision
          <AnimatePresence>
            {needsRevisionCount > 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                style={{
                  background: filters.needs_revision
                    ? "var(--medium)"
                    : "color-mix(in srgb, var(--medium) 22%, transparent)",
                  color: filters.needs_revision
                    ? "var(--bg-base)"
                    : "var(--medium)",
                  borderRadius: "var(--radius-pill)",
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  padding: "0 5px",
                  lineHeight: "16px",
                  minWidth: 18,
                  textAlign: "center" as const,
                }}
              >
                {needsRevisionCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Spacer */}
        <div style={{ flex: 1, minWidth: 8 }} />

        {/* Count */}
        <span
          style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: "var(--text-muted)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {isFiltered ? (
            <>
              <span style={{ color: "var(--text-secondary)" }}>
                {filteredCount}
              </span>{" "}
              <span style={{ opacity: 0.45 }}>/ {totalCount}</span>
            </>
          ) : (
            <>
              <span style={{ color: "var(--text-secondary)" }}>
                {totalCount}
              </span>{" "}
              problems
            </>
          )}
        </span>

        {/* Clear */}
        <AnimatePresence>
          {isFiltered && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8, x: 6 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 6 }}
              transition={{ duration: 0.15 }}
              whileTap={{ scale: 0.92 }}
              onClick={clearAll}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                height: 30,
                padding: "0 10px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border-mid)",
                background: "transparent",
                color: "var(--text-muted)",
                fontSize: 11,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "color 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              <svg
                width="9"
                height="9"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Clear
            </motion.button>
          )}
        </AnimatePresence>

        {/* Search */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            width: 200,
            flexShrink: 0,
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              position: "absolute",
              left: 10,
              color: "var(--text-muted)",
              pointerEvents: "none",
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
              height: 30,
              padding: filters.search ? "0 30px 0 30px" : "0 12px 0 30px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-pill)",
              color: "var(--text-primary)",
              fontSize: 12,
              outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--accent)";
              e.target.style.boxShadow =
                "0 0 0 3px color-mix(in srgb, var(--accent) 12%, transparent)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border-subtle)";
              e.target.style.boxShadow = "none";
            }}
          />
          <AnimatePresence>
            {filters.search && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                onClick={() => set({ search: "" })}
                style={{
                  position: "absolute",
                  right: 9,
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* View toggle */}
        <ViewToggle mode={viewMode} onChange={onViewModeChange} />
      </div>
    </motion.div>
  );
}
