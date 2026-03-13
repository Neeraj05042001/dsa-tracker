// ==================== CF PUSH GROUPS ====================
// Receives pre-scraped group data from the extension content script.
// No cookie/session handling — scraping is done client-side.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase";
import {
  persistScrapedGroups,
  resetSyncFailures,
  logSyncAttempt,
} from "@/lib/cf-queries";
import { enrichContestRatings } from "@/lib/cf-enrich";
import type { ScrapedGroup } from "@/lib/cf-scraper";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

    // ── Validate body ─────────────────────────────────────────────
    const body = await request.json();
    const groups: ScrapedGroup[] = body.groups;

    if (!Array.isArray(groups)) {
      return NextResponse.json(
        { success: false, message: "groups must be an array" },
        { status: 400, headers: corsHeaders },
      );
    }

    if (groups.length === 0) {
      return NextResponse.json(
        { success: false, message: "No groups to save" },
        { status: 400, headers: corsHeaders },
      );
    }

    // ── Persist ───────────────────────────────────────────────────
    console.log(
      `[CF Push Groups] Saving ${groups.length} groups for ${user.email}`,
    );

    const { groupsSaved, problemsSaved } = await persistScrapedGroups(
      user.id,
      groups,
    );


    // Fire-and-forget rating enrichment — runs after persist, doesn't delay response
    const uniqueContestIds = [
      ...new Set(
        groups.flatMap(g => g.contests.map(c => c.id))
      )
    ];
    enrichContestRatings(user.id, uniqueContestIds).catch(e =>
      console.error("[CF Push Groups] Enrichment error:", e.message)
    );

    await resetSyncFailures(user.id);

    await logSyncAttempt({
      user_id: user.id,
      triggered_by: "extension",
      status: "success",
      groups_synced: groupsSaved,
      problems_synced: problemsSaved,
      duration_ms: Date.now() - startTime,
    });

    console.log(
      `[CF Push Groups] Done for ${user.email}: ${groupsSaved} groups, ${problemsSaved} problems in ${Date.now() - startTime}ms`,
    );

    return NextResponse.json(
      {
        success: true,
        groups_synced: groupsSaved,
        problems_synced: problemsSaved,
        message: `Synced ${groupsSaved} group${groupsSaved !== 1 ? "s" : ""} and ${problemsSaved} problems.`,
      },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    const err = error as Error;
    console.error("[CF Push Groups] Unexpected error:", err.message);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500, headers: corsHeaders },
    );
  }
}