// ── CF Sync Diagnostics ───────────────────────────────────────────────────────
// Hit this route in the browser to get a full health report of the sync pipeline.
//
// Usage:
//   localhost:3000/api/cf/sync-debug          (dev)
//   memoize-navy.vercel.app/api/cf/sync-debug  (prod)
//
// Returns JSON with pass/fail + error detail for each stage.

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getCfGroups, getUserCfAuth } from "@/lib/cf-queries";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────

type CheckResult = {
  ok:      boolean;
  label:   string;
  detail?: string;
  data?:   unknown;
};

async function check(
  label: string,
  fn: () => Promise<unknown>,
): Promise<CheckResult> {
  try {
    const data = await fn();
    return { ok: true, label, data };
  } catch (err) {
    return {
      ok:     false,
      label,
      detail: (err as Error).message ?? String(err),
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export async function GET() {
  const results: CheckResult[] = [];
  let userId: string | null = null;

  // ── 1. Auth ────────────────────────────────────────────────────────────────
  const authResult = await check("Auth — Supabase session", async () => {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error(error?.message ?? "No user session found");
    userId = user.id;
    return { user_id: user.id, email: user.email };
  });
  results.push(authResult);

  if (!authResult.ok || !userId) {
    return respond(results, "Auth failed — cannot continue");
  }

  // ── 2. CF Auth record ──────────────────────────────────────────────────────
  const cfAuthResult = await check("CF Auth — handle stored in DB", async () => {
    const cfAuth = await getUserCfAuth(userId!);
    if (!cfAuth) throw new Error("No row in user_cf_auth table. User has never synced.");
    if (!cfAuth.cf_handle) throw new Error("cf_handle is empty");
    return {
      cf_handle:         cfAuth.cf_handle,
      is_session_valid:  cfAuth.is_session_valid,
      last_sync_attempt: cfAuth.last_sync_attempt,
      failures:          cfAuth.consecutive_failures,
    };
  });
  results.push(cfAuthResult);

  // ── 3. DB read — groups ────────────────────────────────────────────────────
  const groupsResult = await check("DB — cf_groups readable", async () => {
    const groups = await getCfGroups(userId!);
    if (groups.length === 0) throw new Error("No groups in DB — never synced or sync saved nothing");
    return groups.map(g => ({
      code:           g.group_code,
      name:           g.group_name,
      total_problems: g.total_problems,
      solved:         g.solved_count,
      last_synced:    g.last_synced,
      sync_status:    g.sync_status,
    }));
  });
  results.push(groupsResult);

  // ── 4. DB read — problems ──────────────────────────────────────────────────
  const problemsResult = await check("DB — cf_group_problems readable", async () => {
    const supabase = await createSupabaseServerClient();
    const { data, error, count } = await (supabase as any)
      .from("cf_group_problems")
      .select("id, contest_id, contest_name, cf_rating, cf_status", { count: "exact" })
      .eq("user_id", userId)
      .limit(5);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error("No problems in DB");

    const nullRatings  = data.filter((p: any) => !p.cf_rating).length;
    const nullNames    = data.filter((p: any) => !p.contest_name || p.contest_name.startsWith("Contest ")).length;

    return {
      total_problems:     count,
      sample:             data.slice(0, 3),
      null_ratings_in_sample: nullRatings,
      fallback_names_in_sample: nullNames,
    };
  });
  results.push(problemsResult);

  // ── 5. CF API reachability ─────────────────────────────────────────────────
  const cfApiResult = await check("CF API — contest.standings reachable", async () => {
    // Use contest 667712 (Contest - I from your group) as a canary
    const url = "https://codeforces.com/api/contest.standings?contestId=667712&from=1&count=1";
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.status !== "OK") throw new Error(`CF API returned: ${json.comment ?? json.status}`);
    const problems = json.result?.problems ?? [];
    return {
      status:    json.status,
      problems:  problems.map((p: any) => ({ index: p.index, name: p.name, rating: p.rating })),
    };
  });
  results.push(cfApiResult);

  // ── 6. Competitor API reachability ─────────────────────────────────────────
  const peerApiResult = await check("Peer API — cf-group-stats.onrender.com reachable", async () => {
    const cfHandle = (cfAuthResult.data as any)?.cf_handle ?? "tourist";
    const url = `https://cf-group-stats.onrender.com/api/group-summary?groupId=4vcXCPx8NY&username=${cfHandle}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`HTTP ${res.status} — server may be cold-starting (free tier)`);
    const json = await res.json();
    return {
      recommended_problems: json.recommended_problems?.length ?? 0,
      submissionTimestamps: json.submissionTimestamps?.length ?? 0,
    };
  });
  results.push(peerApiResult);

  // ── 7. push-groups endpoint ────────────────────────────────────────────────
  const pushResult = await check("Push-groups route — OPTIONS preflight", async () => {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/cf/push-groups`, { method: "OPTIONS" });
    if (!res.ok) throw new Error(`OPTIONS returned ${res.status}`);
    const cors = res.headers.get("access-control-allow-origin");
    if (!cors) throw new Error("CORS headers missing — extension will be blocked");
    return { cors_origin: cors, status: res.status };
  });
  results.push(pushResult);

  // ── 8. enrich-ratings dry run ──────────────────────────────────────────────
  const enrichResult = await check("CF Ratings — enrichable contest IDs", async () => {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await (supabase as any)
      .from("cf_group_problems")
      .select("contest_id")
      .eq("user_id", userId)
      .is("cf_rating", null);

    if (error) throw new Error(error.message);

    const nullRatingContestIds = [...new Set((data ?? []).map((r: any) => r.contest_id))] as string[];

    if (nullRatingContestIds.length === 0) {
      return { message: "All problems already have ratings — nothing to enrich" };
    }

    return {
      contests_needing_enrichment: nullRatingContestIds.length,
      contest_ids:                 nullRatingContestIds,
      note: "Run a sync to trigger enrichment for these",
    };
  });
  results.push(enrichResult);

  return respond(results);
}

// ─────────────────────────────────────────────────────────────────────────────

function respond(results: CheckResult[], earlyStopReason?: string) {
  const passing = results.filter(r => r.ok).length;
  const failing = results.filter(r => !r.ok).length;
  const overall = failing === 0 ? "✅ All checks passed" : `❌ ${failing} check${failing > 1 ? "s" : ""} failed`;

  return NextResponse.json(
    {
      overall,
      passed: passing,
      failed: failing,
      early_stop: earlyStopReason ?? null,
      checks: results.map(r => ({
        status: r.ok ? "✅ PASS" : "❌ FAIL",
        label:  r.label,
        ...(r.ok    ? { data:   r.data   } : {}),
        ...(r.detail ? { error: r.detail } : {}),
      })),
      timestamp: new Date().toISOString(),
    },
    {
      status: failing > 0 ? 207 : 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}