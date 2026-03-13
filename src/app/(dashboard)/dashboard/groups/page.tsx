import { createSupabaseServerClient } from "@/lib/supabase";
import { Topbar } from "@/components/layout/Topbar";
import { getCfGroups, getCfGroupProblems, getUserCfAuth } from "@/lib/cf-queries";

// import { GroupsClient } from "@/components/new-design/dashboard/cf/GroupsClient";
import { GroupsClient } from "@/components/new-responsive-dashboard/cf/GroupsClient";
import type { CfGroup, CfGroupProblem, UserCfAuth } from "@/types";

export default async function GroupsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch CF auth + groups in parallel
  const [cfAuth, groups] = await Promise.all([
    getUserCfAuth(user.id),
    getCfGroups(user.id),
  ]);

  // Fetch problems for all groups in parallel
  const groupsWithProblems = await Promise.all(
    groups.map(async (group) => {
      const problems = await getCfGroupProblems(group.id, user.id);
      return { ...group, problems };
    })
  );

  // Last synced from most recent group
  const lastSynced = groups.reduce<string | null>((latest, g) => {
    if (!g.last_synced) return latest;
    if (!latest) return g.last_synced;
    return g.last_synced > latest ? g.last_synced : latest;
  }, null);

  const totalProblems = groups.reduce((sum, g) => sum + (g.total_problems ?? 0), 0);
  const totalSolved   = groups.reduce((sum, g) => sum + (g.solved_count ?? 0), 0);

  const subtitle = groups.length > 0
    ? `${groups.length} group${groups.length !== 1 ? "s" : ""} · ${totalSolved}/${totalProblems} solved`
    : "Connect your Codeforces account to sync groups";

  return (
    <>
      <Topbar title="CF Groups" subtitle={subtitle} />
      <div className="dashboard-content">
        <GroupsClient
          groups={groupsWithProblems}
          cfAuth={cfAuth as UserCfAuth | null}
          lastSynced={lastSynced}
          userId={user.id}
        />
      </div>
    </>
  );
}



