import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  const url = new URL(request.url);
  const loginUrl = new URL("/login", url.origin);
  return NextResponse.redirect(loginUrl, { status: 302 });
}