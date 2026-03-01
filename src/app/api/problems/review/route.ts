import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    // ── Auth ───────────────────────────────────────────────────────
    const token = req.headers.get("Authorization")?.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authedClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    );

    const { data: { user }, error: authError } = await authedClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Body ───────────────────────────────────────────────────────
    const body = await req.json();
    const {
      problem_key,
      sm2_interval,
      sm2_repetitions,
      sm2_ease_factor,
      sm2_next_review,
      confidence,
      needs_revision,
    } = body;

    if (!problem_key) {
      return NextResponse.json({ error: "Missing problem_key" }, { status: 400 });
    }

    // ── Update — RLS ensures user can only update own problems ─────
    const { error } = await authedClient
      .from("problems")
      .update({
        sm2_interval,
        sm2_repetitions,
        sm2_ease_factor,
        sm2_next_review,
        confidence,
        needs_revision,
        updated_at: new Date().toISOString(),
      })
      .eq("problem_key", problem_key)
      .eq("user_id", user.id);

    if (error) {
      console.error("SM2 update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Review API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}