import { createSupabaseServerClient } from "@/lib/supabase";
import HomePageClient from "@/components/HomePageClient-6";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memoize — Spaced repetition for your LeetCode grind",
  description:
    "Auto-captures your LeetCode and Codeforces submissions and schedules reviews using the SM-2 algorithm. Solve once. Remember forever.",
  openGraph: {
    title: "Memoize — Spaced repetition for your LeetCode grind",
    description:
      "Stop forgetting problems you've already solved. Memoize auto-captures submissions and schedules reviews so you retain everything.",
    type: "website",
  },
};

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const navUser = user
    ? {
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "User",
        email: user.email ?? "",
        avatar_url: user.user_metadata?.avatar_url as string | undefined,
      }
    : null;

  return <HomePageClient user={navUser} />;
}