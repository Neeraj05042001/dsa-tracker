"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useTransition,
  Suspense,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Problem, SortField, SortDirection, TableSortState } from "@/types";
import {
  FilterBar,
  FilterState,
  FILTER_DEFAULTS,
} from "@/components/new-responsive-dashboard/problems/FilterBar";
import { ProblemTable } from "@/components/new-responsive-dashboard/problems/ProblemTable";
import { ProblemCardGrid } from "@/components/new-responsive-dashboard/problems/ProblemCard";
import { ProblemDrawer } from "@/components/new-responsive-dashboard/problems/ProblemDrawer";
import { Topbar } from "@/components/new-responsive-dashboard/overview/Topbar";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

// Difficulty sort order helper
const DIFF_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
const CONF_ORDER: Record<string, number> = { low: 0, medium: 1, high: 2 };

// ─── URL ↔ Filter helpers ─────────────────────────────────────────────────────

function filtersToParams(
  filters: FilterState,
  page: number,
  sort: TableSortState,
): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.platform !== "all") p.set("platform", filters.platform);
  if (filters.difficulty !== "all") p.set("difficulty", filters.difficulty);
  if (filters.status !== "all") p.set("status", filters.status);
  if (filters.confidence !== "all") p.set("confidence", filters.confidence);
  if (filters.pattern !== "all") p.set("pattern", filters.pattern);
  if (filters.tags.length > 0) p.set("tags", filters.tags.join(","));
  if (filters.needs_revision) p.set("revision", "1");
  if (filters.search.trim()) p.set("q", filters.search.trim());
  if (sort.field !== "solved_at" || sort.direction !== "desc") {
    p.set("sort", `${sort.field}_${sort.direction}`);
  }
  if (page > 1) p.set("page", String(page));
  return p;
}

function paramsToFilters(params: URLSearchParams): FilterState {
  const tags = params.get("tags");
  return {
    platform: (params.get("platform") as FilterState["platform"]) ?? "all",
    difficulty:
      (params.get("difficulty") as FilterState["difficulty"]) ?? "all",
    status: (params.get("status") as FilterState["status"]) ?? "all",
    confidence:
      (params.get("confidence") as FilterState["confidence"]) ?? "all",
    pattern: params.get("pattern") ?? "all",
    tags: tags ? tags.split(",").filter(Boolean) : [],
    needs_revision: params.get("revision") === "1",
    search: params.get("q") ?? "",
  };
}

function paramsToSort(params: URLSearchParams): TableSortState {
  const raw = params.get("sort") ?? "solved_at_desc";
  const lastUnderscore = raw.lastIndexOf("_");
  const field = raw.slice(0, lastUnderscore) as SortField;
  const direction = raw.slice(lastUnderscore + 1) as SortDirection;
  const validFields: SortField[] = [
    "solved_at",
    "problem_name",
    "difficulty",
    "confidence",
    "sm2_next_review",
  ];
  return {
    field: validFields.includes(field) ? field : "solved_at",
    direction: direction === "asc" ? "asc" : "desc",
  };
}

// ─── Client-side filter + sort ────────────────────────────────────────────────

function applyFilters(problems: Problem[], filters: FilterState): Problem[] {
  return problems.filter((p) => {
    if (filters.platform !== "all" && p.platform !== filters.platform)
      return false;

    const diff = p.difficulty ?? p.user_difficulty ?? null;
    if (filters.difficulty !== "all" && diff !== filters.difficulty)
      return false;

    if (filters.status !== "all" && p.status !== filters.status) return false;

    if (filters.confidence !== "all" && p.confidence !== filters.confidence)
      return false;

    if (filters.pattern !== "all" && p.pattern !== filters.pattern)
      return false;

    if (filters.tags.length > 0) {
      const pTags = p.tags ?? [];
      if (!filters.tags.some((t) => pTags.includes(t))) return false;
    }

    if (filters.needs_revision && !p.needs_revision) return false;

    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      if (!p.problem_name.toLowerCase().includes(q)) return false;
    }

    return true;
  });
}

function applySort(problems: Problem[], sort: TableSortState): Problem[] {
  const sorted = [...problems];
  const { field, direction } = sort;
  const mul = direction === "asc" ? 1 : -1;

  sorted.sort((a, b) => {
    switch (field) {
      case "problem_name":
        return mul * a.problem_name.localeCompare(b.problem_name);

      case "difficulty": {
        const da = DIFF_ORDER[a.difficulty ?? a.user_difficulty ?? ""] ?? 3;
        const db = DIFF_ORDER[b.difficulty ?? b.user_difficulty ?? ""] ?? 3;
        return mul * (da - db);
      }

      case "confidence": {
        const ca = CONF_ORDER[a.confidence ?? ""] ?? -1;
        const cb = CONF_ORDER[b.confidence ?? ""] ?? -1;
        return mul * (ca - cb);
      }

      case "sm2_next_review": {
        const ra = a.sm2_next_review ?? "9999-99-99";
        const rb = b.sm2_next_review ?? "9999-99-99";
        return mul * ra.localeCompare(rb);
      }

      case "solved_at":
      default: {
        const sa = a.solved_at ?? "0000-00-00";
        const sb = b.solved_at ?? "0000-00-00";
        return mul * sa.localeCompare(sb);
      }
    }
  });
  return sorted;
}

// ─── View mode persistence ────────────────────────────────────────────────────

function getStoredViewMode(): "table" | "card" {
  if (typeof window === "undefined") return "table";
  return (
    (localStorage.getItem("problems_view_mode") as "table" | "card") ?? "table"
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  isFiltered,
  onClear,
}: {
  isFiltered: boolean;
  onClear: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        gap: 16,
        color: "var(--text-muted)",
        textAlign: "center",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-mid)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--text-secondary)",
          }}
        >
          {isFiltered ? "No problems match these filters" : "No problems yet"}
        </span>
        <span style={{ fontSize: 13 }}>
          {isFiltered
            ? "Try adjusting your filters or clearing them to see all problems."
            : "Solve a problem and submit it via the extension to get started."}
        </span>
      </div>

      {isFiltered && (
        <button
          type="button"
          onClick={onClear}
          className="btn btn-ghost"
          style={{ marginTop: 4 }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 16,
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      {/* Count */}
      <span
        style={{
          fontSize: 12,
          fontFamily: "var(--font-mono)",
          color: "var(--text-muted)",
        }}
      >
        {from}–{to} of {total}
      </span>

      {/* Page buttons */}
      <div style={{ display: "flex", gap: 4 }}>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-mid)",
            background: "transparent",
            color: page === 1 ? "var(--text-muted)" : "var(--text-secondary)",
            cursor: page === 1 ? "not-allowed" : "pointer",
            opacity: page === 1 ? 0.4 : 1,
            transition: "all 0.12s ease",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Page number pills */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((n) => {
            // Show: first, last, current ±1, and ellipsis sentinels
            return n === 1 || n === totalPages || Math.abs(n - page) <= 1;
          })
          .reduce<(number | "...")[]>((acc, n, idx, arr) => {
            if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("...");
            acc.push(n);
            return acc;
          }, [])
          .map((n, idx) =>
            n === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  color: "var(--text-muted)",
                }}
              >
                …
              </span>
            ) : (
              <button
                key={n}
                type="button"
                onClick={() => onPageChange(n as number)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${page === n ? "var(--accent)" : "var(--border-mid)"}`,
                  background:
                    page === n ? "var(--accent-muted)" : "transparent",
                  color: page === n ? "var(--accent)" : "var(--text-secondary)",
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  fontWeight: page === n ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.12s ease",
                }}
              >
                {n}
              </button>
            ),
          )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-mid)",
            background: "transparent",
            color:
              page === totalPages
                ? "var(--text-muted)"
                : "var(--text-secondary)",
            cursor: page === totalPages ? "not-allowed" : "pointer",
            opacity: page === totalPages ? 0.4 : 1,
            transition: "all 0.12s ease",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

interface ProblemsClientProps {
  initialProblems: Problem[];
  needsRevisionCount: number;
}

function ProblemsInner({
  initialProblems,
  needsRevisionCount,
}: ProblemsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // ── Initialise from URL params ──
  const [filters, setFilters] = useState<FilterState>(() =>
    paramsToFilters(searchParams),
  );
  const [sort, setSort] = useState<TableSortState>(() =>
    paramsToSort(searchParams),
  );
  const [page, setPage] = useState(() => {
    const p = parseInt(searchParams.get("page") ?? "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });

  // ── View mode (persisted in localStorage) ──
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  useEffect(() => {
    setViewMode(getStoredViewMode());
  }, []);

  // ── Drawer state ──
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerProblem, setDrawerProblem] = useState<Problem | null>(null);

  // ── Derived: available patterns + tags ──
  const availablePatterns = useMemo(() => {
    const set = new Set<string>();
    for (const p of initialProblems) if (p.pattern) set.add(p.pattern);
    return Array.from(set).sort();
  }, [initialProblems]);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of initialProblems) for (const t of p.tags ?? []) set.add(t);
    return Array.from(set).sort();
  }, [initialProblems]);

  // ── Derived: filtered + sorted + paginated ──
  const filtered = useMemo(
    () => applyFilters(initialProblems, filters),
    [initialProblems, filters],
  );

  const sorted = useMemo(() => applySort(filtered, sort), [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [sorted, safePage],
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

  // ── URL sync ──
  const syncURL = useCallback(
    (newFilters: FilterState, newPage: number, newSort: TableSortState) => {
      const params = filtersToParams(newFilters, newPage, newSort);
      const qs = params.toString();
      startTransition(() => {
        router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
      });
    },
    [router, pathname],
  );

  // ── Handlers ──
  const handleFiltersChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      setPage(1);
      syncURL(newFilters, 1, sort);
    },
    [sort, syncURL],
  );

  const handleSort = useCallback(
    (field: SortField) => {
      const newSort: TableSortState = {
        field,
        direction:
          sort.field === field && sort.direction === "desc" ? "asc" : "desc",
      };
      setSort(newSort);
      setPage(1);
      syncURL(filters, 1, newSort);
    },
    [sort, filters, syncURL],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      syncURL(filters, newPage, sort);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [filters, sort, syncURL],
  );

  const handleViewModeChange = useCallback((mode: "table" | "card") => {
    setViewMode(mode);
    localStorage.setItem("problems_view_mode", mode);
  }, []);

  const handleRowClick = useCallback((problem: Problem) => {
    setDrawerProblem(problem);
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    // Keep drawerProblem in state briefly so closing animation is smooth
    setTimeout(() => setDrawerProblem(null), 350);
  }, []);

  return (
    <>
      <Topbar
        title="Problems"
        subtitle={`${initialProblems.length} tracked across platforms`}
      />

      {/* ── Filter bar ── */}
      <div style={{ marginBottom: 20 }}>
        <FilterBar
          filters={filters}
          onChange={handleFiltersChange}
          availablePatterns={availablePatterns}
          availableTags={availableTags}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          totalCount={initialProblems.length}
          filteredCount={filtered.length}
          needsRevisionCount={needsRevisionCount}
        />
      </div>

      {/* ── Table / card view ── */}
      {paginated.length === 0 && !isPending ? (
        <EmptyState
          isFiltered={isFiltered}
          onClear={() => handleFiltersChange({ ...FILTER_DEFAULTS })}
        />
      ) : viewMode === "table" ? (
        <ProblemTable
          problems={paginated}
          sort={sort}
          onSort={handleSort}
          onRowClick={handleRowClick}
          isLoading={isPending}
        />
      ) : (
        <ProblemCardGrid
          problems={paginated}
          onCardClick={handleRowClick}
          isLoading={isPending}
        />
      )}

      {/* ── Pagination ── */}
      {!isPending && paginated.length > 0 && (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          total={sorted.length}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
        />
      )}

      {/* ── Drawer ── */}
      <ProblemDrawer
        problem={drawerProblem}
        open={drawerOpen}
        onClose={handleDrawerClose}
      />
    </>
  );
}

// Public export — wraps inner component in Suspense so useSearchParams()
// is correctly caught by the boundary (required by Next.js App Router)
export function ProblemsClient({
  initialProblems,
  needsRevisionCount,
}: ProblemsClientProps) {
  return (
    <Suspense>
      <ProblemsInner initialProblems={initialProblems} needsRevisionCount={needsRevisionCount}/>
    </Suspense>
  );
}