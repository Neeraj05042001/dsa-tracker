import { Topbar } from "@/components/layout/Topbar";
import { StatCard } from "@/components/stats/StatCard";
import { getDashboardStats } from "@/lib/queries";
import { DifficultyDonut } from "@/components/charts/DifficultyDonut";
import { SolvedOverTime } from "@/components/charts/SolvedOverTime";
import { HorizontalBars } from "@/components/charts/HorizontalBars";
import { SolveHelpBreakdown } from "@/components/charts/SolveHelpBreakdown";
import { PlatformSplit } from "@/components/charts/PlatformSplit";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IcoTarget() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  );
}
function IcoTrend() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  );
}
function IcoCalendar() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
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

// ─── Chart section wrapper ────────────────────────────────────────────────────
// Server-renderable shell — client chart components mount inside

function ChartCard({
  title,
  delay,
  children,
  accent,
  fullWidth = false,
}: {
  title: string;
  delay: number;
  children: React.ReactNode;
  accent?: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: "20px 24px",
        animationDelay: `${delay}ms`,
        position: "relative",
        overflow: "hidden",
        gridColumn: fullWidth ? "1 / -1" : undefined,
      }}
    >
      {accent && (
        <div style={{
          position: "absolute", top: -24, right: -24,
          width: 90, height: 90, borderRadius: "50%",
          background: accent, opacity: 0.05, filter: "blur(24px)",
          pointerEvents: "none",
        }} />
      )}
      <div className="text-section-header" style={{ marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

// ─── Confidence bar (server-safe display) ─────────────────────────────────────
// Simple visual only — no animation needed here, StatCard handles the number

function ConfidenceDisplay({ avg }: { avg: number }) {
  const pct = Math.round(avg * 100);
  const color = avg >= 0.7 ? "var(--easy)" : avg >= 0.4 ? "var(--medium)" : "var(--hard)";
  const label = avg >= 0.7 ? "Strong" : avg >= 0.4 ? "Building" : "Early stage";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color }}>
          {pct}%
        </span>
      </div>
      <div style={{
        height: 4,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 2,
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: 2,
          boxShadow: `0 0 6px color-mix(in srgb, ${color} 60%, transparent)`,
        }} />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
  const stats = await getDashboardStats();

  const confidencePct = Math.round(stats.avg_confidence * 100);

  return (
    <>
      <Topbar
        title="Analytics"
        subtitle="Your full performance breakdown"
      />

      <div className="dashboard-content">

        {/* ── Row 1: Stat cards ── */}
        <div
          className="stagger"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <StatCard
            label="Total Solved"
            value={stats.solved}
            icon={<IcoTarget />}
            delay={0}
            sublabel={`${stats.total} tracked total`}
          />
          <StatCard
            label="This Week"
            value={stats.total_this_week}
            icon={<IcoTrend />}
            accent="var(--easy)"
            delay={60}
            sublabel={`${stats.total_this_month} this month`}
          />
          <StatCard
            label="Best Streak"
            value={stats.longest_streak}
            icon={<IcoFlame />}
            accent="#f97316"
            suffix=" days"
            delay={120}
            sublabel={`Current: ${stats.current_streak}d`}
          />
          <StatCard
            label="Avg Confidence"
            value={confidencePct}
            icon={<IcoCalendar />}
            accent={
              stats.avg_confidence >= 0.7 ? "var(--easy)"
              : stats.avg_confidence >= 0.4 ? "var(--medium)"
              : "var(--hard)"
            }
            suffix="%"
            delay={180}
            sublabel={
              stats.avg_confidence >= 0.7 ? "Strong recall"
              : stats.avg_confidence >= 0.4 ? "Building up"
              : "Keep going"
            }
          />
        </div>

        {/* ── Row 2: Difficulty | Solve Help | Platform ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <ChartCard title="Difficulty Breakdown" delay={250} accent="var(--accent)">
            <DifficultyDonut data={stats.by_difficulty} delay={250} />
          </ChartCard>

          <ChartCard title="How You Solved" delay={310} accent="var(--easy)">
            <SolveHelpBreakdown data={stats.by_solve_help} delay={310} />
          </ChartCard>

          <ChartCard title="Platform Split" delay={370}>
            <PlatformSplit platforms={stats.by_platform} delay={370} />
          </ChartCard>
        </div>

        {/* ── Row 3: 30-day chart (full width) ── */}
        <div style={{ marginBottom: 16 }}>
          <ChartCard title="Solved — Last 30 Days" delay={430} accent="var(--accent)" fullWidth>
            <SolvedOverTime data={stats.daily_activity} delay={430} />
          </ChartCard>
        </div>

        {/* ── Row 4: Tags | Patterns ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}>
          <ChartCard title="Tag Strength" delay={490} accent="var(--accent)">
            {stats.by_tag.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>
                No tags tracked yet.
              </p>
            ) : (
              <>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 14px 0" }}>
                  Bar length = volume · Color = avg confidence
                </p>
                <HorizontalBars
                  items={stats.by_tag.map(t => ({
                    label: t.tag,
                    count: t.count,
                    avgConfidence: t.avg_confidence,
                  }))}
                  delay={490}
                  colorMode="confidence"
                />
              </>
            )}
          </ChartCard>

          <ChartCard title="Pattern Strength" delay={540} accent="var(--medium)">
            {stats.by_pattern.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>
                No patterns tracked yet.
              </p>
            ) : (
              <>
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 14px 0" }}>
                  Bar length = volume · Color = avg confidence
                </p>
                <HorizontalBars
                  items={stats.by_pattern.map(p => ({
                    label: p.pattern,
                    count: p.count,
                    avgConfidence: p.avg_confidence,
                  }))}
                  delay={540}
                  colorMode="confidence"
                />
              </>
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