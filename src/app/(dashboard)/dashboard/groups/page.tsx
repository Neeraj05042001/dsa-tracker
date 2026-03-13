import { createSupabaseServerClient } from "@/lib/supabase";
import {
  getCfGroups,
  getCfGroupProblems,
  getUserCfAuth,
} from "@/lib/cf-queries";
// import { GroupsClient } from "@/components/new-responsive-dashboard/cf/GroupsClient";
// import { GroupsClient } from "@/components/new-design/dashboard/cf/GroupsClient";
import { GroupsClient } from "@/components/new-responsive-dashboard/cf/GroupsClient";
import { Topbar } from "@/components/new-responsive-dashboard/overview/Topbar";

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

  return (
    <>
      <Topbar
        title="CF Groups"
       
        subtitle={`${groupsWithProblems.reduce((s, g) => s + g.problems.filter((p) => p.cf_status === "solved").length, 0)}/${groupsWithProblems.reduce((s, g) => s + g.problems.length, 0)} solved`}
      />
      <div className="dashboard-content">
        <GroupsClient
          groups={groupsWithProblems}
          cfAuth={cfAuth}
          lastSynced={lastSynced}
          userId={user.id}
        />
      </div>
    </>
  );
}
