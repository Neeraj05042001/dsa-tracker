import { createSupabaseServerClient } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";

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
    <div className="dashboard-shell">
      {/* Sidebar — fixed left */}
      <Sidebar
        revisionDueCount={0}
        user={sidebarUser}
        collapsed={false}
        onCollapsedChange={() => {}}
      />

      {/* Main content area */}
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
