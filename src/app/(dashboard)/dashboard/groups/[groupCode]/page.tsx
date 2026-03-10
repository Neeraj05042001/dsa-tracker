import { createSupabaseServerClient } from "@/lib/supabase";
import {
  getCfGroups,
  getCfGroupProblems,
  getUserCfAuth,
} from "@/lib/cf-queries";
import { GroupDetailClient } from "@/components/new-responsive-dashboard/cf/GroupsClient";

// import { GroupDetailClientV2 } from "@/components/new-responsive-dashboard/cf/GroupDetailClientV2";
import { Topbar } from "@/components/new-responsive-dashboard/overview/Topbar";
import { notFound } from "next/navigation";
import type { PeerData } from "@/components/new-responsive-dashboard/cf/GroupDetailClientV2";

interface PageProps {
  params: Promise<{ groupCode: string }>;
  searchParams: Promise<{ contest?: string }>;
}

// ── Competitor API fetch ──────────────────────────────────────────────────────
// Fetches group-level peer stats: recommended problems + submission timestamps.
// Non-fatal — if it fails for any reason we render without peer data.
async function fetchPeerData(
  groupCode: string,
  cfHandle: string,
): Promise<PeerData | null> {
  try {
    const url = `https://cf-group-stats.onrender.com/api/group-summary?groupId=${groupCode}&username=${cfHandle}`;
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour — peer data doesn't change often
    });

    if (!res.ok) return null;

    const json = await res.json();

    // Normalise — the API returns slightly different shapes depending on version
    return {
      recommended_problems: Array.isArray(json.recommended_problems)
        ? json.recommended_problems
        : [],
      submissionTimestamps: Array.isArray(json.submissionTimestamps)
        ? json.submissionTimestamps
        : [],
    } satisfies PeerData;
  } catch {
    // Network error, cold start on Render, etc — degrade gracefully
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export default async function GroupDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { groupCode } = await params;
  const { contest } = await searchParams;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch group row, problems, and CF handle in parallel
  const [groups, cfAuth] = await Promise.all([
    getCfGroups(user.id),
    getUserCfAuth(user.id),
  ]);

  const group = groups.find((g) => g.group_code === groupCode);
  if (!group) return notFound();

  const problems = await getCfGroupProblems(group.id, user.id);

  // Fetch peer data only if we have a CF handle — no handle = no peer data
  const peerData = cfAuth?.cf_handle
    ? await fetchPeerData(groupCode, cfAuth.cf_handle)
    : null;

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
          selectedContestId={contest ?? null}
          
        />

        {/* <GroupDetailClientV2
          group={group}
          problems={problems}
          selectedContestId={contest ?? null}
          peerData={peerData}
        /> */}

        
      </div>
    </>
  );
}
