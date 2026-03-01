import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

export async function PATCH(request: NextRequest) {
  try {
    // ── Auth ─────────────────────────────────────────────────────
    const token = request.headers.get("Authorization")?.replace("Bearer ", "").trim();

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const authedClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } },
    );

    const { data: { user }, error: authError } = await authedClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // ── Update ───────────────────────────────────────────────────
    const { problem_key, updates } = await request.json();

    if (!problem_key) {
      return NextResponse.json({ success: false, message: "problem_key required" }, { status: 400 });
    }

    const { data, error } = await authedClient
      .from("problems")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("problem_key", problem_key)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, problem: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}