import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getPostHogClient } from "@/lib/posthog-server";

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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const posthog = getPostHogClient();
        posthog.identify({
          distinctId: user.id,
          properties: {
            email: user.email,
            name: user.user_metadata?.full_name ?? user.user_metadata?.name,
            provider: user.app_metadata?.provider,
          },
        });
        posthog.capture({
          distinctId: user.id,
          event: "user_logged_in",
          properties: {
            provider: user.app_metadata?.provider,
            email: user.email,
          },
        });
        await posthog.shutdown();
      }
      // Success — send them where they were trying to go
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // Something went wrong — send to login with error flag
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}