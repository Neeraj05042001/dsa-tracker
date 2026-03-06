import { createSupabaseServerClient } from "@/lib/supabase";
import { DashboardShell } from "@/components/layout/DashboardShell";
// import DashboardShell from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sidebarUser = user
    ? {
        name:
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "User",
        email: user.email ?? "",
        avatar_url: user.user_metadata?.avatar_url ?? undefined,
      }
    : undefined;

  return (
    <DashboardShell user={sidebarUser} revisionDueCount={0}>
      {children}
    </DashboardShell>
  );
}