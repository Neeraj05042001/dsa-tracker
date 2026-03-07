
import { Topbar } from "@/components/new-responsive-dashboard/overview/Topbar";
import { getAllProblems } from "@/lib/queries";


import { AnalyticsClient } from "@/components/new-responsive-dashboard/analytics/AnalyticsClient";

export default async function AnalyticsPage() {
  const problems = await getAllProblems()

  return (
    <>
      <Topbar
        title="Analytics"
        subtitle="Your interview readiness at a glance"
      />
      <div className="dashboard-content">
        <AnalyticsClient problems={problems} />
      </div>
    </>
  );
}

export const metadata = {
  title: "Analytics — Memoize",
};