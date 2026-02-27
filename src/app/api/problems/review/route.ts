import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      problem_key,
      rating,
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

    const supabase = createClient();

    const { error } = await supabase
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
      .eq("problem_key", problem_key);

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