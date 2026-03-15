

import { Topbar } from "@/components/new-responsive-dashboard/overview/Topbar";
import { StatCard } from "@/components/new-responsive-dashboard/analytics/charts/StatCard";
import { getDashboardStats } from "@/lib/queries";
import { DifficultyDonut } from "@/components/new-responsive-dashboard/analytics/charts/DifficultyDonut";
import { HorizontalBars } from "@/components/new-responsive-dashboard/analytics/charts/HorizontalBars";
import { SolveHelpBreakdown } from "@/components/new-responsive-dashboard/analytics/charts/SolveHelpBreakdown";
import { SolvedOverTime } from "@/components/new-responsive-dashboard/analytics/charts/SolvedOverTime";
import { ReadinessHero } from "@/components/new-responsive-dashboard/analytics/charts/ReadinessHero";
import { InterviewMode } from "@/components/new-responsive-dashboard/analytics/charts/InterviewMode";
import { FocusAreas } from "@/components/new-responsive-dashboard/analytics/charts/FocusAreas";
import { PlatformSplit } from "@/components/new-responsive-dashboard/analytics/charts/PlatformSplit";
import { PatternCoverageGrid } from "@/components/new-responsive-dashboard/analytics/charts/PatternCoverageGrid";
import { AnalyticsPageClient } from "@/components/new-responsive-dashboard/analytics/AnalyticsClient";
function IcoCode() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
function IcoConf() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
function IcoRevision() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}
function IcoFlame() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  accent,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div
      className="card"
      style={{ padding: "22px 24px", position: "relative", overflow: "hidden" }}
    >
      {accent && (
        <div
          style={{
            position: "absolute",
            top: -24,
            right: -24,
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: accent,
            opacity: 0.05,
            filter: "blur(24px)",
            pointerEvents: "none",
          }}
        />
      )}
      <div style={{ marginBottom: subtitle ? 4 : 16 }}>
        <div className="text-section-header">{title}</div>
        {subtitle && (
          <p
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              margin: "3px 0 14px",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function computeReadinessScore(
  stats: Awaited<ReturnType<typeof getDashboardStats>>,
): number {
  const total = stats.total;
  const last14 = stats.daily_activity.slice(-14);
  const activeDays = last14.filter(
    (d: { count: number }) => d.count > 0,
  ).length;
  const consistency = Math.min(100, Math.round((activeDays / 14) * 100));
  const medHard = stats.by_difficulty.medium + stats.by_difficulty.hard;
  const diffSpread =
    total === 0 ? 0 : Math.min(100, Math.round((medHard / total) * 100 * 1.43));
  const confScore = Math.round(stats.avg_confidence * 100);
  const revDiscipline =
    total === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            (1 - stats.needs_revision_count / Math.max(total, 1)) * 100,
          ),
        );
  return Math.round(
    consistency * 0.25 +
      diffSpread * 0.25 +
      confScore * 0.25 +
      revDiscipline * 0.25,
  );
}

export default async function AnalyticsPage() {
  const stats = await getDashboardStats();
  const readinessScore = computeReadinessScore(stats);
  const confidencePct = Math.round(stats.avg_confidence * 100);
  const revisionHealth =
    stats.total === 0
      ? 100
      : Math.round((1 - stats.needs_revision_count / stats.total) * 100);
  const activePlatforms = stats.by_platform.filter((p) => p.total > 0);
  const showPlatformSplit = activePlatforms.length > 0;
  const bottomRowCols =
    showPlatformSplit && activePlatforms.length > 1 ? "1fr 1fr 1fr" : "1fr 1fr";

  // Last 7 days activity for sparklines
  const last7 = stats.daily_activity
    .slice(-7)
    .map((d: { count: number }) => d.count);

  return (
    <>
      <Topbar title="Analytics" subtitle="Your full performance breakdown" />
      <div className="dashboard-content">
        <AnalyticsPageClient>
          {/* ── 1. Readiness hero ── */}
          <div data-section="0" style={{ marginBottom: 16 }}>
            <ReadinessHero stats={stats} delay={0} />
          </div>

          {/* ── 2. Interview Mode ── */}
          <div data-section="1" style={{ marginBottom: 16 }}>
            <InterviewMode stats={stats} readinessScore={readinessScore} />
          </div>

          {/* ── 3. Focus Areas ── */}
          <div data-section="2" style={{ marginBottom: 20 }}>
            <FocusAreas
              patterns={stats.by_pattern}
              tags={stats.by_tag}
              delay={200}
            />
          </div>

          {/* ── 4. Stat strip ── */}
          <div
            data-section="3"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 14,
              marginBottom: 16,
            }}
          >
            <StatCard
              label="Total Solved"
              value={stats.solved}
              icon={<IcoCode />}
              delay={0}
              sublabel={`${stats.total} tracked total`}
              sparkline={last7}
            />
            <StatCard
              label="Avg Confidence"
              value={confidencePct}
              icon={<IcoConf />}
              accent={
                stats.avg_confidence >= 0.7
                  ? "var(--easy)"
                  : stats.avg_confidence >= 0.4
                    ? "var(--medium)"
                    : "var(--hard)"
              }
              suffix="%"
              delay={60}
              sublabel={
                stats.avg_confidence === 0
                  ? "No data yet"
                  : stats.avg_confidence >= 0.7
                    ? "Strong recall"
                    : stats.avg_confidence >= 0.4
                      ? "Building up"
                      : "Keep practising"
              }
            />
            <StatCard
              label="Revision Health"
              value={revisionHealth}
              icon={<IcoRevision />}
              accent={
                revisionHealth >= 80
                  ? "var(--easy)"
                  : revisionHealth >= 50
                    ? "var(--medium)"
                    : "var(--hard)"
              }
              suffix="%"
              delay={120}
              sublabel={`${stats.needs_revision_count} flagged for review`}
            />
            <StatCard
              label="Current Streak"
              value={stats.current_streak}
              icon={<IcoFlame />}
              accent="#f97316"
              suffix=" days"
              delay={180}
              sublabel={`Best: ${stats.longest_streak} days`}
              dimWhenZero
              sparkline={last7}
            />
          </div>

          {/* ── 5. Solved over time ── */}
          <div data-section="4" style={{ marginBottom: 16 }}>
            <ChartCard title="Solved — Last 30 Days" accent="var(--accent)">
              <SolvedOverTime data={stats.daily_activity} delay={460} />
            </ChartCard>
          </div>

          {/* ── 6. Difficulty | Solve Help | Platform ── */}
          <div
            data-section="5"
            style={{
              display: "grid",
              gridTemplateColumns: bottomRowCols,
              gap: 14,
              marginBottom: 14,
            }}
          >
            <ChartCard title="Difficulty Breakdown" accent="var(--accent)">
              <DifficultyDonut data={stats.by_difficulty} delay={500} />
            </ChartCard>
            <ChartCard title="How You Solved" accent="var(--easy)">
              <SolveHelpBreakdown data={stats.by_solve_help} delay={550} />
            </ChartCard>
            {showPlatformSplit && activePlatforms.length > 1 && (
              <ChartCard title="Platform Split">
                <PlatformSplit platforms={activePlatforms} delay={600} />
              </ChartCard>
            )}
          </div>

          {/* ── 7. Tag Strength + Pattern Coverage ── */}
          <div
            data-section="6"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <ChartCard
              title="Tag Strength"
              subtitle="Bar length = volume · Color = avg confidence"
              accent="var(--accent)"
            >
              {stats.by_tag.length === 0 ? (
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    fontStyle: "italic",
                    margin: 0,
                  }}
                >
                  No tags tracked yet.
                </p>
              ) : (
                <HorizontalBars
                  items={stats.by_tag.map((t) => ({
                    label: t.tag,
                    count: t.count,
                    avgConfidence: t.avg_confidence,
                  }))}
                  delay={640}
                  colorMode="confidence"
                />
              )}
            </ChartCard>
            <ChartCard
              title="Pattern Coverage"
              subtitle="All patterns · Grey = not yet attempted"
              accent="var(--medium)"
            >
              <PatternCoverageGrid patterns={stats.by_pattern} delay={680} />
            </ChartCard>
          </div>
        </AnalyticsPageClient>
      </div>
    </>
  );
}

export const metadata = { title: "Analytics — DSA Tracker" };
