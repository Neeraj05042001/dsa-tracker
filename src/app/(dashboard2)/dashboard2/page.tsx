
import { Topbar } from "@/components/new-responsive-dashboard/overview/Topbar";
import { StatCard } from "@/components/new-responsive-dashboard/overview/StatCard";
import { ActivityHeatmap } from "@/components/new-responsive-dashboard/overview/ActivityHeatMap";
import { RecentlySolved } from "@/components/new-responsive-dashboard/overview/RecentlySolved";
import { RevisionDue } from "@/components/new-responsive-dashboard/overview/RevisionDue";

import { getDashboardStats, getRecentProblems, getRevisionDue } from "@/lib/queries";



// Total Solved — teal (brand)
function IconCode() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  );
}

// LeetCode — brand orange #f89f1b
function IconLC() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
  );
}

// Codeforces — brand blue #3b82f6
function IconCF() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="6" height="18" rx="1"/>
      <rect x="9" y="8" width="6" height="13" rx="1"/>
      <rect x="16" y="13" width="6" height="8" rx="1"/>
    </svg>
  );
}

// Streak — ember/amber gradient stop color
function IconFlame() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  );
}

export default async function DashboardPage() {
  const [stats, recentProblems, revisionDue] = await Promise.all([
    getDashboardStats(),
    getRecentProblems(5),
    getRevisionDue(),
  ]);

  const lcStats = stats.by_platform.find(p => p.platform === "leetcode");
  const cfStats = stats.by_platform.find(p => p.platform === "codeforces");

  return (
    <>
      <Topbar
        title="Overview"
        subtitle={`${stats.total_this_week} problem${stats.total_this_week !== 1 ? "s" : ""} solved this week`}
        weekCount={stats.total_this_week}
      />

      <div className="dashboard-content">

        {/* ── 1. Stat strip ── */}
        <div
          className="stat-cards-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 18 }}
        >
          {/* Total — teal brand */}
          <StatCard
            label="Total Solved"
            value={stats.solved}
            icon={<IconCode />}
            delay={0}
            sublabel={`${stats.attempted} attempted`}
          />

          {/* LeetCode — LC orange */}
          <StatCard
            label="LeetCode"
            value={lcStats?.solved ?? 0}
            icon={<IconLC />}
            accent="#f89f1b"
            delay={80}
            sublabel={`${lcStats?.easy ?? 0}E · ${lcStats?.medium ?? 0}M · ${lcStats?.hard ?? 0}H`}
          />

          {/* Codeforces — CF blue */}
          <StatCard
            label="Codeforces"
            value={cfStats?.solved ?? 0}
            icon={<IconCF />}
            accent="#3b82f6"
            delay={160}
            sublabel={`${cfStats?.total ?? 0} total`}
          />

          {/* Streak — ember amber, dims when zero */}
          <StatCard
            label="Current Streak"
            value={stats.current_streak}
            icon={<IconFlame />}
            accent="#f97316"
            delay={240}
            suffix=" days"
            sublabel={`Best: ${stats.longest_streak} days`}
            dimWhenZero
          />
        </div>

        {/* ── 2. Action panels — above fold, most actionable first ── */}
        <div
          className="dashboard-grid-2"
          style={{ display: "grid", gridTemplateColumns: "55fr 45fr", gap: 14, marginBottom: 18 }}
        >
          <RevisionDue problems={revisionDue} />
          <RecentlySolved problems={recentProblems} />
        </div>

        {/* ── 3. Heatmap — historical, below fold ── */}
        <ActivityHeatmap
          data={stats.daily_activity}
          totalThisYear={stats.total}
        />

      </div>
    </>
  );
}