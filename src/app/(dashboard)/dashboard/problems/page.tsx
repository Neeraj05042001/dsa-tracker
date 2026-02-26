import { ProblemsClient } from "@/components/problems/ProblemsClient";
import { getDashboardStats, getProblems } from "@/lib/queries";

export default async function ProblemsPage() {
  const [{ problems }, stats] = await Promise.all([
    getProblems({}, 1, 10_000),
    getDashboardStats(),
  ]);

  return (
    <div className="dashboard-content">
      <ProblemsClient
        initialProblems={problems}
        needsRevisionCount={stats.needs_revision_count}
      />
    </div>
  );
}
