// ==================== CF GROUPS — DB QUERIES ====================
// Follows exact same patterns as queries.ts:
// createSupabaseServerClient → query → if (error) throw

import { createSupabaseServerClient } from "@/lib/supabase";
import type { CfGroup, CfGroupProblem, CfSyncStatus } from "@/types";
import type { ScrapedGroup } from "@/lib/cf-scraper";

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getUserCfAuth(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await (supabase as any)
    .from("user_cf_auth")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return data as import("@/types").UserCfAuth | null;
}

export async function getCfGroups(userId: string): Promise<CfGroup[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("cf_groups")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to fetch CF groups: ${error.message}`);
  return (data ?? []) as CfGroup[];
}

export async function getCfGroupProblems(
  groupId: string,
  userId: string,
): Promise<CfGroupProblem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("cf_group_problems")
    .select("*")
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .order("contest_id", { ascending: true })
    .order("problem_index", { ascending: true });

  if (error)
    throw new Error(`Failed to fetch group problems: ${error.message}`);
  return (data ?? []) as CfGroupProblem[];
}

// ── Write ─────────────────────────────────────────────────────────────────────

/**
 * Persists all scraped group data for a user.
 * Upserts groups + problems, updates aggregate stats.
 */
export async function persistScrapedGroups(
  userId: string,
  groups: ScrapedGroup[],
): Promise<{ groupsSaved: number; problemsSaved: number }> {
  const supabase = await createSupabaseServerClient();
  let groupsSaved = 0;
  let problemsSaved = 0;

  for (const group of groups) {
    // 1. Upsert group row
    const { data: groupRow, error: groupError } = await (supabase as any)
      .from("cf_groups")
      .upsert(
        {
          user_id: userId,
          group_code: group.code,
          group_name: group.name,
          group_url: group.url,
          sync_status: "success",
          last_synced: new Date().toISOString(),
        },
        { onConflict: "user_id,group_code" },
      )
      .select("id")
      .single();

    if (groupError) {
      console.error(
        `[CF Queries] Failed to upsert group ${group.code}:`,
        groupError.message,
      );
      continue;
    }

    const groupId = groupRow.id;
    groupsSaved++;

    // 2. Upsert all problems in this group
    const allProblems = group.contests.flatMap((contest) =>
      contest.problems.map((problem) => ({
        group_id: groupId,
        user_id: userId,
        contest_id: contest.id,
        problem_index: problem.index,
        problem_name: problem.name,
        problem_url: problem.url,
        cf_rating: problem.cfRating,
        cf_status: problem.status,
        solved_at: problem.solvedAt,
      })),
    );

    if (allProblems.length > 0) {
      // Upsert in batches of 50 to avoid payload limits
      for (let i = 0; i < allProblems.length; i += 50) {
        const batch = allProblems.slice(i, i + 50);
        const { error: problemsError } = await (supabase as any)
          .from("cf_group_problems")
          .upsert(batch, { onConflict: "group_id,contest_id,problem_index" });

        if (problemsError) {
          console.error(
            `[CF Queries] Failed to upsert problems batch:`,
            problemsError.message,
          );
        } else {
          problemsSaved += batch.length;
        }
      }
    }

    // 3. Update aggregate stats on the group row
    const total = allProblems.length;
    const solved = allProblems.filter((p) => p.cf_status === "solved").length;
    const attempted = allProblems.filter(
      (p) => p.cf_status === "attempted",
    ).length;
    const todo = total - solved - attempted;
    const progress = total > 0 ? Math.round((solved / total) * 100) : 0;

    await (supabase as any)
      .from("cf_groups")
      .update({
        total_problems: total,
        solved_count: solved,
        attempted_count: attempted,
        todo_count: todo,
        progress_pct: progress,
      })
      .eq("id", groupId);
  }

  return { groupsSaved, problemsSaved };
}

/**
 * Update sync status on a group (e.g. 'running', 'failed', 'rate_limited').
 */
export async function updateGroupSyncStatus(
  userId: string,
  groupCode: string,
  status: CfSyncStatus,
) {
  const supabase = await createSupabaseServerClient();
  await (supabase as any)
    .from("cf_groups")
    .update({ sync_status: status })
    .eq("user_id", userId)
    .eq("group_code", groupCode);
}

/**
 * Mark CF session as invalid after repeated failures.
 */
export async function invalidateCfSession(userId: string) {
  const supabase = await createSupabaseServerClient();
  await (supabase as any)
    .from("user_cf_auth")
    .update({
      is_session_valid: false,
      consecutive_failures: 3,
    })
    .eq("user_id", userId);
}

/**
 * Increment failure counter. Invalidate after 3 consecutive failures.
 */
export async function incrementSyncFailure(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data } = await (supabase as any)
  .from('user_cf_auth')
  .select('consecutive_failures')
  .eq('user_id', userId)
  .single()

  const failures = (data?.consecutive_failures ?? 0) + 1;

  await (supabase as any)
    .from("user_cf_auth")
    .update({
      consecutive_failures: failures,
      is_session_valid: failures < 3,
      last_sync_attempt: new Date().toISOString(),
    })
    .eq("user_id", userId);
}

/**
 * Reset failure counter after a successful sync.
 */
export async function resetSyncFailures(userId: string) {
  const supabase = await createSupabaseServerClient();
  await (supabase as any)
    .from("user_cf_auth")
    .update({
      consecutive_failures: 0,
      is_session_valid: true,
      last_sync_attempt: new Date().toISOString(),
    })
    .eq("user_id", userId);
}

/**
 * Log a sync attempt to cf_sync_log.
 */
export async function logSyncAttempt(entry: {
  user_id: string;
  triggered_by: "manual" | "cron" | "extension";
  status: "success" | "failed" | "rate_limited" | "partial";
  groups_synced: number;
  problems_synced: number;
  error_message?: string;
  duration_ms: number;
}) {
  const supabase = await createSupabaseServerClient();
  await (supabase as any).from("cf_sync_log").insert(entry);
}

/**
 * Get all users due for background cron sync.
 * Due = never synced OR last_synced > 6 hours ago AND session is valid.
 */
export async function getUsersDueForSync(): Promise<
  Array<{
    user_id: string;
    cf_handle: string;
    encrypted_session: string;
  }>
> {
  const supabase = await createSupabaseServerClient();
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("user_cf_auth")
    .select("user_id, cf_handle, encrypted_session")
    .eq("is_session_valid", true)
    .or(`last_sync_attempt.is.null,last_sync_attempt.lte.${sixHoursAgo}`);

  if (error) {
    console.error("[CF Queries] getUsersDueForSync error:", error.message);
    return [];
  }

  return data ?? [];
}
