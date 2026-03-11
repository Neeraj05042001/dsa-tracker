import { createSupabaseServerClient } from "@/lib/supabase";
import {
  getCfGroups,
  getCfGroupProblems,
  getUserCfAuth,
} from "@/lib/cf-queries";
// import { GroupsClient, GroupslClient } from "@/components/new-responsive-dashboard/cf/GroupsClient";
// import { GroupsClient } from "@/components/new-design/dashboard/cf/GroupsClient";
import { Topbar } from "@/components/new-responsive-dashboard/overview/Topbar";
import { GroupsClient } from "@/components/new-responsive-dashboard/cf/GroupsClient";

export default async function GroupsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch groups + problems for each group in parallel
  const groups = await getCfGroups(user.id);

  const groupsWithProblems = await Promise.all(
    groups.map(async (group) => {
      const problems = await getCfGroupProblems(group.id, user.id);
      return { ...group, problems };
    }),
  );

  const cfAuth = await getUserCfAuth(user.id);

  // Last synced = most recent sync across all groups
  const lastSynced = groups.reduce(
    (latest, g) => {
      if (!g.last_synced) return latest;
      if (!latest) return g.last_synced;
      return g.last_synced > latest ? g.last_synced : latest;
    },
    null as string | null,
  );

  // Compute these before the return
const totalSolved    = groupsWithProblems.reduce((s, g) => s + g.solved_count, 0);
const totalProblems  = groupsWithProblems.reduce((s, g) => s + g.total_problems, 0);

const overallPct     = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;
function formatTimeAgo(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (m < 1) return "just now";
  if (h < 1) return `${m}m ago`;
  if (d < 1) return `${h}h ago`;
  return `${d}d ago`;
}



  return (
    <>
      {/* <Topbar
        title="CF Groups"
       
        subtitle={`${groupsWithProblems.reduce((s, g) => s + g.problems.filter((p) => p.cf_status === "solved").length, 0)}/${groupsWithProblems.reduce((s, g) => s + g.problems.length, 0)} solved`}
      /> */}

      <Topbar
  title="CF Groups"
 subtitle={`${groupsWithProblems.length} group${groupsWithProblems.length !== 1 ? "s" : ""} · ${overallPct}% complete · synced ${formatTimeAgo(lastSynced)}`}
/>
      <div className="dashboard-content">
        {/* <GroupsClient
          groups={groupsWithProblems}
          cfAuth={cfAuth}
          lastSynced={lastSynced}
          userId={user.id}
        /> */}
        <GroupsClient  groups={groupsWithProblems}
          cfAuth={cfAuth}
          lastSynced={lastSynced}
          userId={user.id}/>
      </div>
    </>
  );
}
