import { Topbar } from "@/components/layout/Topbar";
import { getDashboardStats } from "@/lib/queries";
import { AnalyticsClient } from "@/components/analytics/Analyticsclient";

export default async function AnalyticsPage() {
  const stats = await getDashboardStats();

  return (
    <>
      <Topbar
        title="Analytics"
        subtitle="Understand your strengths, weaknesses, and progress"
      />
      <div className="dashboard-content">
        <AnalyticsClient stats={stats} />
      </div>
    </>
  );
}

export const metadata = {
  title: "Analytics — DSA Tracker",
};