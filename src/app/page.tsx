import { createSupabaseServerClient } from "@/lib/supabase";
// import HomePageClient from "@/components/HomePageClientss";
// import HomePageClient from "@/components/HomePageClient";
// import HomePageClient from "@/components/Homepage-3";
// import HomePageClient from "@/components/HomepageClient-4";
import HomePageClient from "@/components/HomePageClient-6";

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
    : undefined;

  return <HomePageClient user={navUser} />;
}