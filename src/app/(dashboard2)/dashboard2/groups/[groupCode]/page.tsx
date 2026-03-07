import { createSupabaseServerClient } from "@/lib/supabase";
import { getCfGroups, getCfGroupProblems } from "@/lib/cf-queries";
// import { GroupDetailClient } from "@/components/new-design/dashboard/cf/GroupDetailClient";
// import { Topbar } from "@/components/layout/Topbar";
import { GroupDetailClient } from "@/components/new-responsive-dashboard/cf/GroupDetailClient";
import { Topbar } from "@/components/new-responsive-dashboard/overview/Topbar";
import { notFound } from "next/navigation";

interface PageProps {
  params: { groupCode: string };
  searchParams: { contest?: string };
}

export default async function GroupDetailPage({ params, searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const groups = await getCfGroups(user.id);
  const group = groups.find(g => g.group_code === params.groupCode);
  if (!group) return notFound();

  const problems = await getCfGroupProblems(group.id, user.id);

  return (
    <>
      <Topbar
        title={group.group_name}
        subtitle={`${group.solved_count}/${group.total_problems} solved · ${group.progress_pct}% complete`}
      />
      <div className="dashboard-content">
        <GroupDetailClient
          group={group}
          problems={problems}
          selectedContestId={searchParams.contest ?? null}
        />
      </div>
    </>
  );
}