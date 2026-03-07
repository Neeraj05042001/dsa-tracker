import { createSupabaseServerClient } from "@/lib/supabase";
import {
  Problem,
  Platform,
  ProblemStats,
  DailyActivity,
  PlatformStats,
  DifficultyBreakdown,
  SolveHelpBreakdown,
  TagStat,
  PatternStat,
  ProblemFilters,
  confidenceToScore,
} from "@/types";

// ============================================================
// OVERVIEW / STATS QUERIES
// ============================================================

/**
 * Fetch all stats needed for the Overview page in one efficient call.
 * Pulls all problems once and computes everything client-side.
 */
export async function getDashboardStats(): Promise<ProblemStats> {
  const supabase = await createSupabaseServerClient();
  const { data: problemsRaw, error } = await supabase
    .from("problems")
    .select("*")
    .order("solved_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch stats: ${error.message}`);
  const problems = problemsRaw as Problem[] | null;
  if (!problems || problems.length === 0) return emptyStats();

  const solved = problems.filter((p) => p.status === "solved");
  const total = problems.length;

  // ── Platform breakdown ─────────────────────────────────────
  const platforms: Platform[] = ["leetcode", "codeforces", "other"];
  const by_platform: PlatformStats[] = platforms.map((platform) => {
    const group = problems.filter((p) => p.platform === platform);
    return {
      platform,
      total: group.length,
      solved: group.filter((p) => p.status === "solved").length,
      attempted: group.filter((p) => p.status === "attempted").length,
      easy: group.filter((p) => (p.difficulty ?? p.user_difficulty) === "easy")
        .length,
      medium: group.filter(
        (p) => (p.difficulty ?? p.user_difficulty) === "medium",
      ).length,
      hard: group.filter((p) => (p.difficulty ?? p.user_difficulty) === "hard")
        .length,
    };
  });

  // ── Difficulty breakdown ───────────────────────────────────
  const by_difficulty: DifficultyBreakdown = {
    easy: problems.filter((p) => (p.difficulty ?? p.user_difficulty) === "easy")
      .length,
    medium: problems.filter(
      (p) => (p.difficulty ?? p.user_difficulty) === "medium",
    ).length,
    hard: problems.filter((p) => (p.difficulty ?? p.user_difficulty) === "hard")
      .length,
    unknown: problems.filter((p) => !p.difficulty && !p.user_difficulty).length,
  };

  // ── Solve help breakdown ───────────────────────────────────
  const by_solve_help: SolveHelpBreakdown = {
    no_help: problems.filter((p) => p.solve_help === "no_help").length,
    hints: problems.filter((p) => p.solve_help === "hints").length,
    saw_solution: problems.filter((p) => p.solve_help === "saw_solution")
      .length,
  };

  // ── Tag stats ──────────────────────────────────────────────
  const tagMap = new Map<
    string,
    { count: number; confidence_sum: number; low_count: number }
  >();
  for (const p of problems) {
    if (!p.tags?.length) continue;
    for (const tag of p.tags) {
      const existing = tagMap.get(tag) ?? {
        count: 0,
        confidence_sum: 0,
        low_count: 0,
      };
      existing.count += 1;
      existing.confidence_sum += confidenceToScore(p.confidence);
      if (p.confidence === "low") existing.low_count += 1;
      tagMap.set(tag, existing);
    }
  }
  const by_tag: TagStat[] = Array.from(tagMap.entries())
    .map(([tag, { count, confidence_sum, low_count }]) => ({
      tag,
      count,
      avg_confidence: count > 0 ? confidence_sum / count : 0,
      low_confidence_count: low_count,
    }))
    .sort((a, b) => b.count - a.count);

  // ── Pattern stats ──────────────────────────────────────────
  const patternMap = new Map<
    string,
    { count: number; confidence_sum: number }
  >();
  for (const p of problems) {
    if (!p.pattern) continue;
    const existing = patternMap.get(p.pattern) ?? {
      count: 0,
      confidence_sum: 0,
    };
    existing.count += 1;
    existing.confidence_sum += confidenceToScore(p.confidence);
    patternMap.set(p.pattern, existing);
  }
  const by_pattern: PatternStat[] = Array.from(patternMap.entries())
    .map(([pattern, { count, confidence_sum }]) => ({
      pattern,
      count,
      avg_confidence: count > 0 ? confidence_sum / count : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // ── Daily activity (last 365 days) ─────────────────────────
  const daily_activity = computeDailyActivity(problems);

  // ── Streaks ────────────────────────────────────────────────
  const { current_streak, longest_streak } = computeStreaks(daily_activity);

  // ── Avg confidence ─────────────────────────────────────────
  const confidence_scores = problems
    .map((p) => confidenceToScore(p.confidence))
    .filter((s) => s > 0);
  const avg_confidence =
    confidence_scores.length > 0
      ? confidence_scores.reduce((a, b) => a + b, 0) / confidence_scores.length
      : 0;

  // ── This week / month ──────────────────────────────────────
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(now.getDate() - 30);

  const total_this_week = problems.filter((p) => {
    const d = p.solved_at ? new Date(p.solved_at) : null;
    return d && d >= weekAgo;
  }).length;

  const total_this_month = problems.filter((p) => {
    const d = p.solved_at ? new Date(p.solved_at) : null;
    return d && d >= monthAgo;
  }).length;

  return {
    total,
    solved: solved.length,
    attempted: total - solved.length,
    needs_revision_count: problems.filter((p) => p.needs_revision).length,
    by_platform,
    by_difficulty,
    by_solve_help,
    by_tag,
    by_pattern,
    daily_activity,
    current_streak,
    longest_streak,
    avg_confidence,
    total_this_week,
    total_this_month,
  };
}

// ── Helper: compute daily activity for heatmap ────────────────
function computeDailyActivity(problems: Problem[]): DailyActivity[] {
  const map = new Map<string, number>();
  for (const p of problems) {
    if (!p.solved_at) continue;
    const date = p.solved_at.split("T")[0]; // 'YYYY-MM-DD'
    map.set(date, (map.get(date) ?? 0) + 1);
  }

  // Build full 365-day array
  const result: DailyActivity[] = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const date = d.toISOString().split("T")[0];
    result.push({ date, count: map.get(date) ?? 0 });
  }
  return result;
}

// ── Helper: compute current and longest streaks ───────────────
function computeStreaks(activity: DailyActivity[]): {
  current_streak: number;
  longest_streak: number;
} {
  let current_streak = 0;
  let longest_streak = 0;
  let running = 0;

  // Reverse to start from today
  const reversed = [...activity].reverse();

  for (let i = 0; i < reversed.length; i++) {
    if (reversed[i].count > 0) {
      running += 1;
      if (i === 0 || running > 1) {
        current_streak = running;
      }
      longest_streak = Math.max(longest_streak, running);
    } else {
      if (i === 0) break; // today is empty, streak is 0
      running = 0;
    }
  }

  return { current_streak, longest_streak };
}

// ── Empty stats fallback ──────────────────────────────────────
function emptyStats(): ProblemStats {
  return {
    total: 0,
    solved: 0,
    attempted: 0,
    needs_revision_count: 0,
    by_platform: [],
    by_difficulty: { easy: 0, medium: 0, hard: 0, unknown: 0 },
    by_solve_help: { no_help: 0, hints: 0, saw_solution: 0 },
    by_tag: [],
    by_pattern: [],
    daily_activity: [],
    current_streak: 0,
    longest_streak: 0,
    avg_confidence: 0,
    total_this_week: 0,
    total_this_month: 0,
  };
}

// ============================================================
// PROBLEMS LIST QUERIES
// ============================================================

/**
 * Fetch problems with filters applied server-side.
 * Returns paginated results + total count.
 */
export async function getProblems(
  filters: Partial<ProblemFilters> = {},
  page = 1,
  pageSize = 25,
): Promise<{ problems: Problem[]; total: number }> {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("problems").select("*", { count: "exact" });

  // Apply filters
  if (filters.platform && filters.platform !== "all") {
    query = query.eq("platform", filters.platform);
  }
  if (filters.difficulty && filters.difficulty !== "all") {
    query = query.or(
      `difficulty.eq.${filters.difficulty},user_difficulty.eq.${filters.difficulty}`,
    );
  }
  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.pattern && filters.pattern !== "all") {
    query = query.eq("pattern", filters.pattern);
  }
  if (filters.confidence && filters.confidence !== "all") {
    query = query.eq("confidence", filters.confidence);
  }
  if (filters.solve_help && filters.solve_help !== "all") {
    query = query.eq("solve_help", filters.solve_help);
  }
  if (filters.needs_revision === true) {
    query = query.eq("needs_revision", true);
  }
  if (filters.search && filters.search.trim()) {
    query = query.ilike("problem_name", `%${filters.search.trim()}%`);
  }
  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps("tags", filters.tags);
  }

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.order("solved_at", { ascending: false }).range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to fetch problems: ${error.message}`);

  return { problems: (data ?? []) as Problem[], total: count ?? 0 };
}

/**
 * Fetch a single problem by problem_key.
 */
export async function getProblemByKey(
  problem_key: string,
): Promise<Problem | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("problem_key", problem_key)
    .single();

  if (error) return null;
  return data;
}

// ============================================================
// REVISION QUERIES
// ============================================================

/**
 * Fetch problems due for SM2 revision today.
 * sm2_next_review <= today AND (needs_revision = true OR sm2_next_review is set)
 */
export async function getRevisionDue(): Promise<Problem[]> {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .lte("sm2_next_review", today)
    .not("sm2_next_review", "is", null)
    .order("sm2_next_review", { ascending: true });

  if (error)
    throw new Error(`Failed to fetch revision queue: ${error.message}`);
  return data ?? [];
}

/**
 * Fetch all problems marked needs_revision = true.
 */
export async function getRevisionList(): Promise<Problem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("needs_revision", true)
    .order("solved_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch revision list: ${error.message}`);
  return data ?? [];
}

// ============================================================
// RECENT PROBLEMS
// ============================================================

/**
 * Fetch the N most recently solved problems.
 */
export async function getRecentProblems(limit = 5): Promise<Problem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .eq("status", "solved")
    .order("solved_at", { ascending: false })
    .limit(limit);

  if (error)
    throw new Error(`Failed to fetch recent problems: ${error.message}`);
  return data ?? [];
}

// ============================================================
// SUBMISSION HISTORY
// ============================================================

/**
 * Fetch submission history for a single problem.
 */
export async function getSubmissionHistory(problem_key: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("submission_history")
    .select("*")
    .eq("problem_key", problem_key)
    .order("submitted_at", { ascending: false });

  if (error)
    throw new Error(`Failed to fetch submission history: ${error.message}`);
  return data ?? [];
}

// ============================================================
// UPDATE QUERIES (for Revision page)
// ============================================================

/**
 * Update SM2 state after a revision session.
 * Called when user clicks "I Revised It" on the Revision page.
 */

/**
 * Update any fields on a problem (for inline editing on detail page).
 */

// Fetches all problems due for review today or overdue.
// Sorted: most overdue first, then by lowest ease factor (hardest problems first).

export async function getRevisionQueue(): Promise<Problem[]> {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .lte("sm2_next_review", today) // due today or earlier
    .eq("status", "solved") // only solved problems need revision
    .order("sm2_next_review", { ascending: true }) // most overdue first
    .order("sm2_ease_factor", { ascending: true }); // hardest to recall first

  if (error) {
    console.error("getRevisionQueue error:", error);
    return [];
  }

  return (data ?? []) as Problem[];
}

export async function updateSM2AfterRevision(
  problem_key: string,
  sm2_interval: number,
  sm2_ease_factor: number,
  sm2_repetitions: number,
  sm2_next_review: string,
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await (supabase as any)
    .from("problems")
    .update({
      sm2_interval,
      sm2_ease_factor,
      sm2_repetitions,
      sm2_next_review,
      updated_at: new Date().toISOString(),
    })
    .eq("problem_key", problem_key);

  if (error) throw new Error(`Failed to update SM2: ${error.message}`);
}

/**
 * Update any fields on a problem (for inline editing on detail page).
 */
export async function updateProblem(
  problem_key: string,
  updates: Partial<Problem>,
): Promise<Problem> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await (supabase as any)
    .from("problems")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("problem_key", problem_key)
    .select()
    .single();

  if (error) throw new Error(`Failed to update problem: ${error.message}`);
  return data;
}

/**
 * Fetch problems scheduled for SM2 review in the next N days.
 * Used for the revision schedule view.
 */
export async function getUpcomingRevisions(days = 14): Promise<Problem[]> {
  const supabase = await createSupabaseServerClient();
  const today = new Date();
  const future = new Date(today);
  future.setDate(today.getDate() + days);

  const todayStr = today.toISOString().split("T")[0];
  const futureStr = future.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .gt("sm2_next_review", todayStr) // strictly after today (today = due now)
    .lte("sm2_next_review", futureStr)
    .not("sm2_next_review", "is", null)
    .order("sm2_next_review", { ascending: true });

  if (error)
    throw new Error(`Failed to fetch upcoming revisions: ${error.message}`);
  return data ?? [];
}


// ============================================================
// ANALYTICS QUERIES
// ============================================================

/**
 * Fetch all problems for the current user (used by Analytics page).
 */
export async function getAllProblems(): Promise<Problem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("problems")
    .select("*")
    .order("solved_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch problems: ${error.message}`);
  return (data ?? []) as Problem[];
}