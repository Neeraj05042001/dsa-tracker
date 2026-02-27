import { Topbar } from "@/components/layout/Topbar";
import { getRevisionDue, getRevisionList, getUpcomingRevisions } from "@/lib/queries";
import { RevisionClient } from "@/components/revision/RevisionClient";

export default async function RevisionPage() {
  const [dueSM2, flagged, upcoming] = await Promise.all([
    getRevisionDue(),
    getRevisionList(),
    getUpcomingRevisions(14),
  ]);

  return (
    <>
      <Topbar
        title="Revision"
        subtitle="Active recall — attempt each problem before revealing your notes"
      />
      <div className="dashboard-content">
        <RevisionClient dueSM2={dueSM2} flagged={flagged} upcoming={upcoming} />
      </div>
    </>
  );
}

export const metadata = {
  title: "Revision — DSA Tracker",
};