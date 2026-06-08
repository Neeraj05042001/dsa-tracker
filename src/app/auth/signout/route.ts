import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: user.id,
      event: "user_signed_out",
      properties: { email: user.email },
    });
    await posthog.shutdown();
  }

  await supabase.auth.signOut();

  const url = new URL(request.url);
  const loginUrl = new URL("/login", url.origin);
  return NextResponse.redirect(loginUrl, { status: 302 });
}