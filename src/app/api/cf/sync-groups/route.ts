// ==================== CF SYNC GROUPS ====================
// Orchestrates: auth → throttle check → decrypt session →
//               scrape CF → persist to DB → log result

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase";
import { decryptSession } from "@/lib/cf-encrypt";
import { scrapeUserGroups } from "@/lib/cf-scraper";
import {
  getUserCfAuth,
  persistScrapedGroups,
  resetSyncFailures,
  incrementSyncFailure,
  invalidateCfSession,
  logSyncAttempt,
} from "@/lib/cf-queries";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const MANUAL_SYNC_THROTTLE_MS = 15 * 60 * 1000; // 15 minutes

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // ── Auth — support both Bearer token and cookies ──────────────
    let authedClient;
    const token = request.headers
      .get("Authorization")
      ?.replace("Bearer ", "")
      .trim();

    if (token) {
      authedClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } },
      );
    } else {
      authedClient = await createSupabaseServerClient();
    }

    const {
      data: { user },
      error: authError,
    } = await authedClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders },
      );
    }

    // ── Parse body ────────────────────────────────────────────────
    const body = await request.json().catch(() => ({}));
    const triggeredBy: "manual" | "cron" | "extension" =
      body.triggered_by ?? "manual";

    // ── Get CF auth for this user ─────────────────────────────────
    const cfAuth = (await getUserCfAuth(user.id)) as
      | import("@/types").UserCfAuth
      | null;

    if (!cfAuth) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No Codeforces account connected. Use the extension to connect.",
        },
        { status: 400, headers: corsHeaders },
      );
    }

    if (!cfAuth.is_session_valid) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Codeforces session expired. Open extension on codeforces.com to reconnect.",
        },
        { status: 400, headers: corsHeaders },
      );
    }

    // ── Throttle check for manual syncs ──────────────────────────
    if (triggeredBy === "manual" && cfAuth.last_sync_attempt) {
      const lastSync = new Date(cfAuth.last_sync_attempt).getTime();
      const msSinceLast = Date.now() - lastSync;

      if (msSinceLast < MANUAL_SYNC_THROTTLE_MS) {
        const waitMin = Math.ceil(
          (MANUAL_SYNC_THROTTLE_MS - msSinceLast) / 60000,
        );
        return NextResponse.json(
          {
            success: false,
            message: `Synced recently. Please wait ${waitMin} more minute${waitMin > 1 ? "s" : ""}.`,
            throttled: true,
          },
          { status: 429, headers: corsHeaders },
        );
      }
    }

    // ── Decrypt session ───────────────────────────────────────────
    const jsessionid = decryptSession(cfAuth.encrypted_session);
    if (!jsessionid) {
      await invalidateCfSession(user.id);
      return NextResponse.json(
        {
          success: false,
          message: "Session decryption failed. Please reconnect via extension.",
        },
        { status: 500, headers: corsHeaders },
      );
    }

    // ── Scrape CF ─────────────────────────────────────────────────
    console.log(`[CF Sync] Starting sync for ${cfAuth.cf_handle}`);

    // Parse JSON session payload (contains jsessionid + cf_clearance)
    let jsessionidFinal = jsessionid;
    let cfClearance = "";
    try {
      const sessionData = JSON.parse(jsessionid);
      jsessionidFinal = sessionData.jsessionid;
      cfClearance = sessionData.cf_clearance || "";
    } catch {
      // Legacy: plain jsessionid string (no cf_clearance)
      jsessionidFinal = jsessionid;
    }

    const scrapeResult = await scrapeUserGroups(
      cfAuth.cf_handle,
      jsessionidFinal,
      cfClearance,
    );

    // ── Handle session expired during scrape ──────────────────────
    if (scrapeResult.error === "SESSION_EXPIRED") {
      await incrementSyncFailure(user.id);
      await logSyncAttempt({
        user_id: user.id,
        triggered_by: triggeredBy,
        status: "failed",
        groups_synced: 0,
        problems_synced: 0,
        error_message: "Session expired",
        duration_ms: Date.now() - startTime,
      });
      return NextResponse.json(
        {
          success: false,
          message:
            "Codeforces session expired. Open extension on codeforces.com to reconnect.",
        },
        { status: 401, headers: corsHeaders },
      );
    }

    // ── Persist whatever was scraped (even if partial) ────────────
    let groupsSaved = 0;
    let problemsSaved = 0;

    if (scrapeResult.groups.length > 0) {
      const saved = await persistScrapedGroups(user.id, scrapeResult.groups);
      groupsSaved = saved.groupsSaved;
      problemsSaved = saved.problemsSaved;
    }

    // ── Update auth record ────────────────────────────────────────
    if (scrapeResult.success || scrapeResult.partial) {
      await resetSyncFailures(user.id);
    } else {
      await incrementSyncFailure(user.id);
    }

    // ── Log the sync ──────────────────────────────────────────────
    await logSyncAttempt({
      user_id: user.id,
      triggered_by: triggeredBy,
      status: scrapeResult.partial
        ? "partial"
        : scrapeResult.rateLimited
          ? "rate_limited"
          : scrapeResult.success
            ? "success"
            : "failed",
      groups_synced: groupsSaved,
      problems_synced: problemsSaved,
      error_message: scrapeResult.error ?? undefined,
      duration_ms: Date.now() - startTime,
    });

    console.log(
      `[CF Sync] Done for ${cfAuth.cf_handle}: ` +
        `${groupsSaved} groups, ${problemsSaved} problems in ${Date.now() - startTime}ms`,
    );

    // ── Respond ───────────────────────────────────────────────────
    return NextResponse.json(
      {
        success: true,
        partial: scrapeResult.partial,
        rate_limited: scrapeResult.rateLimited,
        groups_synced: groupsSaved,
        problems_synced: problemsSaved,
        message: scrapeResult.partial
          ? `Partially synced (${groupsSaved} groups). CF rate-limited — rest will sync in ~30 min.`
          : `Synced ${groupsSaved} group${groupsSaved !== 1 ? "s" : ""} and ${problemsSaved} problems.`,
      },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    const err = error as Error;
    console.error("[CF Sync] Unexpected error:", err.message);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500, headers: corsHeaders },
    );
  }
}
