import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(request: NextRequest) {
  try {
    const { problem_key, updates } = await request.json();

    if (!problem_key) {
      return NextResponse.json({ success: false, message: "problem_key required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("problems")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("problem_key", problem_key)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, problem: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}