import { NextRequest, NextResponse } from "next/server";

import {
  ExtensionPayload,
  Difficulty,
  calculateSM2,
  confidenceToSM2Quality,
} from "@/types";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

function normalizeDifficulty(
  difficulty: string | null | undefined,
  cfRating: number | null | undefined,
): Difficulty | null {
  if (cfRating) {
    if (cfRating < 1200) return "easy";
    if (cfRating < 1900) return "medium";
    return "hard";
  }
  if (!difficulty) return null;
  const d = difficulty.toLowerCase().trim();
  if (d === "easy") return "easy";
  if (d === "medium") return "medium";
  if (d === "hard") return "hard";
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // ==================== AUTH ====================
    // Extract JWT from Authorization: Bearer <token> header
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized — no token provided" },
        { status: 401, headers: corsHeaders },
      );
    }

    // Validate the JWT and get the user
    // We create a client authenticated as this user so RLS applies automatically
    const { createClient } = await import("@supabase/supabase-js");
    const authedClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    );

    const {
      data: { user },
      error: authError,
    } = await authedClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized — invalid or expired token" },
        { status: 401, headers: corsHeaders },
      );
    }

    const userId = user.id;
    console.log("[API] Authenticated user:", user.email);

    const body: ExtensionPayload = await request.json();
    console.log("[API] Received from extension:", body);
    

    // ==================== VALIDATE ====================
    if (!body.problem_name?.trim()) {
      return NextResponse.json(
        { success: false, message: "problem_name is required" },
        { status: 400, headers: corsHeaders },
      );
    }
    if (!body.platform) {
      return NextResponse.json(
        { success: false, message: "platform is required" },
        { status: 400, headers: corsHeaders },
      );
    }
    if (!body.problem_key) {
      return NextResponse.json(
        { success: false, message: "problem_key is required" },
        { status: 400, headers: corsHeaders },
      );
    }

    // ==================== NORMALIZE ====================
    const normalizedDifficulty = normalizeDifficulty(
      body.difficulty,
      body.cf_rating,
    );

    const problemData = {
      user_id: userId,
      problem_name: body.problem_name.trim(),
      platform: body.platform,
      problem_key: body.problem_key,
      problem_url: body.problem_url || null,
      difficulty: normalizedDifficulty,
      cf_rating: body.cf_rating || null,
      tags: body.tags || [],
      user_difficulty: body.user_difficulty || null,
      status: body.status || "solved",
      needs_revision: body.needs_revision || false,
      approach: body.approach?.trim() || null,
      mistakes: body.mistakes?.trim() || null,
      solve_help: body.solve_help || null,
      time_taken: body.time_taken || null,
      confidence: body.confidence || null,
      pattern: body.pattern || null,
      similar_problems: body.similar_problems?.trim() || null,
      language: body.language || null,
      runtime: body.runtime || null,
      memory: body.memory || null,
      submission_url: body.submission_url || null,
      solved_at: body.solved_at || new Date().toISOString(),
    };

    // ==================== CHECK EXISTING ====================
    // Fetch existing SM2 state so re-submissions continue the schedule
    // instead of resetting from zero
    const { data: existing } = await authedClient
      .from("problems")
      .select("id, problem_key, sm2_interval, sm2_ease_factor, sm2_repetitions")
      .eq("problem_key", body.problem_key)
      .eq("user_id", userId)
      .single();

    // ==================== CALCULATE SM2 ====================
    // Map confidence chip → SM2 quality score (Low=2, Medium=3, High=5)
    const quality = confidenceToSM2Quality(body.confidence ?? null);

    const sm2Result = calculateSM2({
      quality,
      // If problem exists: continue from current SM2 state
      // If new problem: start from SM2 defaults
      repetitions: existing?.sm2_repetitions ?? 0,
      ease_factor: existing?.sm2_ease_factor ?? 2.5,
      interval: existing?.sm2_interval ?? 1,
    });

    console.log("[API] SM2 calculated:", {
      confidence: body.confidence,
      quality,
      sm2Result,
      isExisting: !!existing,
    });

    // ==================== UPSERT WITH SM2 ====================
    const dataWithSM2 = {
      ...problemData,
      sm2_interval: sm2Result.interval,
      sm2_ease_factor: sm2Result.ease_factor,
      sm2_repetitions: sm2Result.repetitions,
      sm2_next_review: sm2Result.next_review,
    };

    let data, error;

    if (existing) {
      console.log("[API] Updating existing problem:", body.problem_key);
     ({ data, error } = await authedClient
        .from("problems")
        .update({ ...dataWithSM2, updated_at: new Date().toISOString() } as any)
        .eq("problem_key", body.problem_key)
        .eq("user_id", userId)
        .select()
        .single());
    } else {
      console.log("[API] Inserting new problem:", body.problem_key);
      ({ data, error } = await authedClient
        .from("problems")
        .insert(dataWithSM2 as any)
        .select()
        .single());
    }

    if (error) {
      console.error("[API] Supabase error:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400, headers: corsHeaders },
      );
    }

    // ==================== LOG HISTORY ====================
    if (body.submission_id || body.status) {
      await authedClient.from("submission_history").insert({
        user_id: userId,
        problem_key: body.problem_key,
        platform: body.platform,
        submission_id: body.submission_id || null,
        status: body.status || null,
        language: body.language || null,
        runtime: body.runtime || null,
        memory: body.memory || null,
        confidence: body.confidence || null,
        submitted_at: body.solved_at || new Date().toISOString(),
      } as any);
    }

    console.log("[API] Success:", data);

    return NextResponse.json(
      {
        success: true,
        message: existing ? "Problem updated" : "Problem added",
        problem: data,
      },
      { status: 201, headers: corsHeaders },
    );
  } catch (error) {
    const err = error as Error;
    console.error("[API] Unexpected error:", err?.message || error);
    console.error("[API] Stack:", err?.stack);
    return NextResponse.json(
      { success: false, message: err?.message || "Internal server error" },
      { status: 500, headers: corsHeaders },
    );
  }
}