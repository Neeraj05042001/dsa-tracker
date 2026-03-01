import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  // These are set by Supabase after OAuth completes
  const code = searchParams.get("code");

  // This is what we set in the login page's redirectTo option
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  if (code) {
    const supabase = await createSupabaseServerClient();

    // Exchange the temporary OAuth code for a real session
    // Supabase sets the session cookie automatically here
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Success — send them where they were trying to go
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // Something went wrong — send to login with error flag
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}