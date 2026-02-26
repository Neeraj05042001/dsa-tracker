


import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/stats/StatCard";
import { getDashboardStats } from "@/lib/queries";
import { DifficultyDonut } from "@/components/charts/DifficultyDonut";
import { HorizontalBars } from "@/components/charts/HorizontalBars";
import { SolveHelpBreakdown } from "@/components/charts/SolveHelpBreakdown";
import { SolvedOverTime } from "@/components/charts/SolvedOverTime";
import { ReadinessHero } from "@/components/charts/ReadinessHero";
import { InterviewMode } from "@/components/charts/InterviewMode";
import { FocusAreas } from "@/components/charts/FocusAreas";
import { PlatformSplit } from "@/components/charts/PlatformSplit";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IcoCode() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  );
}
function IcoConf() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}
function IcoRevision() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  );
}
function IcoFlame() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  );
}

// ─── Chart card wrapper ───────────────────────────────────────────────────────

function ChartCard({
  title,
  subtitle,
  delay,
  children,
  accent,
}: {
  title: string;
  subtitle?: string;
  delay: number;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: "22px 24px",
        animationDelay: `${delay}ms`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {accent && (
        <div style={{
          position: "absolute", top: -24, right: -24,
          width: 90, height: 90, borderRadius: "50%",
          background: accent, opacity: 0.05,
          filter: "blur(24px)", pointerEvents: "none",
        }} />
      )}
      <div style={{ marginBottom: subtitle ? 4 : 16 }}>
        <div className="text-section-header">{title}</div>
        {subtitle && (
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "3px 0 14px" }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Readiness score helper (mirrors ReadinessHero logic) ─────────────────────

function computeReadinessScore(stats: Awaited<ReturnType<typeof getDashboardStats>>): number {
  const total = stats.total;
  const last14 = stats.daily_activity.slice(-14);
  const activeDays = last14.filter((d: { count: number }) => d.count > 0).length;
  const consistency = Math.min(100, Math.round((activeDays / 14) * 100));
  const medHard = stats.by_difficulty.medium + stats.by_difficulty.hard;
  const diffSpread = total === 0 ? 0 : Math.min(100, Math.round((medHard / total) * 100 * 1.43));
  const confScore = Math.round(stats.avg_confidence * 100);
  const revDiscipline = total === 0 ? 0
    : Math.min(100, Math.round((1 - stats.needs_revision_count / Math.max(total, 1)) * 100));
  return Math.round(consistency * 0.25 + diffSpread * 0.25 + confScore * 0.25 + revDiscipline * 0.25);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
  const stats = await getDashboardStats();

  const readinessScore = computeReadinessScore(stats);
  const confidencePct = Math.round(stats.avg_confidence * 100);
  const revisionHealth = stats.total === 0 ? 100
    : Math.round((1 - stats.needs_revision_count / stats.total) * 100);

  // Only show platforms the user has actually used
  const activePlatforms = stats.by_platform.filter(p => p.total > 0);
  const showPlatformSplit = activePlatforms.length > 0;
  // Use 3-col if multiple platforms, 2-col if only one
  const bottomRowCols = showPlatformSplit && activePlatforms.length > 1
    ? "1fr 1fr 1fr"
    : "1fr 1fr";

  return (
    <>
      <Topbar
        title="Analytics"
        subtitle="Your full performance breakdown"
      />

      <div className="dashboard-content">

        {/* ── 1. Readiness hero ── */}
        <div style={{ marginBottom: 16 }}>
          <ReadinessHero stats={stats} delay={0} />
        </div>

        {/* ── 2. Interview Mode — opt-in ── */}
        <div style={{ marginBottom: 16 }}>
          <InterviewMode stats={stats} readinessScore={readinessScore} />
        </div>

        {/* ── 3. Focus Areas — actionable ── */}
        <div style={{ marginBottom: 20 }}>
          <FocusAreas
            patterns={stats.by_pattern}
            tags={stats.by_tag}
            delay={200}
          />
        </div>

        {/* ── 4. Stat strip ── */}
        <div
          className="stagger"
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
            delay={240}
            sublabel={`${stats.total} tracked total`}
          />
          <StatCard
            label="Avg Confidence"
            value={confidencePct}
            icon={<IcoConf />}
            accent={
              stats.avg_confidence >= 0.7 ? "var(--easy)"
              : stats.avg_confidence >= 0.4 ? "var(--medium)"
              : "var(--hard)"
            }
            suffix="%"
            delay={300}
            sublabel={
              stats.avg_confidence >= 0.7 ? "Strong recall"
              : stats.avg_confidence >= 0.4 ? "Building up"
              : "Keep practising"
            }
          />
          <StatCard
            label="Revision Health"
            value={revisionHealth}
            icon={<IcoRevision />}
            accent={
              revisionHealth >= 80 ? "var(--easy)"
              : revisionHealth >= 50 ? "var(--medium)"
              : "var(--hard)"
            }
            suffix="%"
            delay={360}
            sublabel={`${stats.needs_revision_count} flagged for review`}
          />
          <StatCard
            label="Current Streak"
            value={stats.current_streak}
            icon={<IcoFlame />}
            accent="#f97316"
            suffix=" days"
            delay={420}
            sublabel={`Best: ${stats.longest_streak} days`}
          />
        </div>

        {/* ── 5. Solved over time — full width, activity history ── */}
        <div style={{ marginBottom: 16 }}>
          <ChartCard
            title="Solved — Last 30 Days"
            delay={460}
            accent="var(--accent)"
          >
            <SolvedOverTime data={stats.daily_activity} delay={460} />
          </ChartCard>
        </div>

        {/* ── 6. Difficulty | Solve Help | Platform (active only) ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: bottomRowCols,
          gap: 14,
          marginBottom: 14,
        }}>
          <ChartCard title="Difficulty Breakdown" delay={500} accent="var(--accent)">
            <DifficultyDonut data={stats.by_difficulty} delay={500} />
          </ChartCard>

          <ChartCard title="How You Solved" delay={550} accent="var(--easy)">
            <SolveHelpBreakdown data={stats.by_solve_help} delay={550} />
          </ChartCard>

          {showPlatformSplit && activePlatforms.length > 1 && (
            <ChartCard title="Platform Split" delay={600}>
              <PlatformSplit platforms={activePlatforms} delay={600} />
            </ChartCard>
          )}
        </div>

        {/* ── 7. Tag + Pattern strength ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <ChartCard
            title="Tag Strength"
            subtitle="Bar length = volume · Color = avg confidence"
            delay={640}
            accent="var(--accent)"
          >
            {stats.by_tag.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>
                No tags tracked yet.
              </p>
            ) : (
              <HorizontalBars
                items={stats.by_tag.map(t => ({
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
            title="Pattern Strength"
            subtitle="Bar length = volume · Color = avg confidence"
            delay={680}
            accent="var(--medium)"
          >
            {stats.by_pattern.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>
                No patterns tracked yet.
              </p>
            ) : (
              <HorizontalBars
                items={stats.by_pattern.map(p => ({
                  label: p.pattern,
                  count: p.count,
                  avgConfidence: p.avg_confidence,
                }))}
                delay={680}
                colorMode="confidence"
              />
            )}
          </ChartCard>
        </div>

      </div>
    </>
  );
}

export const metadata = {
  title: "Analytics — DSA Tracker",
};