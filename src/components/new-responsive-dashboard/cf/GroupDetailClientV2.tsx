// "use client";

// import { HeroCard } from "./group-detail/HeroCard";
// // import { ActivityHeatmap } from "./group-detail/ActivityHeatmap";  ← uncomment as we build
// import type { CfGroup, CfGroupProblem } from "@/types";

// export type PeerData = {
//   recommended_problems: Array<{ name: string; link: string; solvedCount: number; status: string }>;
//   submissionTimestamps: number[];
// };

// interface Props {
//   group: CfGroup;
//   problems: CfGroupProblem[];
//   selectedContestId: string | null;
//   peerData: PeerData | null;
//   dueProblems?: string[]; // SM-2 review URLs
// }

// export function GroupDetailClientV2({ group, problems, peerData, dueProblems }: Props) {

//   // ── Derive data shared across sections ──────────────────────────────────
//   const contests = deriveContests(problems);
//   const completedContests = contests.filter(c => c.pct === 100).length;
//   const nextProblem = deriveNextProblem(contests, peerData);

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

//       {/* SECTION 1 — Hero */}
//       <HeroCard
//         group={group}
//         completedContests={completedContests}
//         totalContests={contests.length}
//         nextProblem={nextProblem}
//       />

//       {/* SECTION 2 — Activity Heatmap — uncomment when built */}
//       {/* {peerData && <ActivityHeatmap timestamps={peerData.submissionTimestamps} />} */}

//     </div>
//   );
// }

// // ── Shared derivation helpers (used by multiple sections) ────────────────────

// function indexOrder(idx: string): number {
//   if (!idx) return 999;
//   const letter = idx.charCodeAt(0) - 65;
//   const num = idx.length > 1 ? parseInt(idx.slice(1), 10) || 0 : 0;
//   return letter + num * 26;
// }

// function contestDisplayName(name: string | null | undefined, id: string) {
//   return name?.trim() || `Contest ${id}`;
// }

// export function deriveContests(problems: CfGroupProblem[]) {
//   const map = new Map<string, CfGroupProblem[]>();
//   for (const p of problems) {
//     if (!map.has(p.contest_id)) map.set(p.contest_id, []);
//     map.get(p.contest_id)!.push(p);
//   }
//   return Array.from(map.entries()).map(([id, probs]) => {
//     const solved = probs.filter(p => p.cf_status === "solved").length;
//     const attempted = probs.filter(p => p.cf_status === "attempted").length;
//     const todo = probs.filter(p => p.cf_status === "todo").length;
//     const total = probs.length;
//     const pct = total > 0 ? (solved / total) * 100 : 0;
//     return {
//       id, name: contestDisplayName(probs[0]?.contest_name, id),
//       problems: [...probs].sort((a,b) => indexOrder(a.problem_index) - indexOrder(b.problem_index)),
//       solved, attempted, todo, total, pct
//     };
//   }).sort((a, b) => {
//     if (a.pct > 0 && a.pct < 100 && (b.pct === 0 || b.pct === 100)) return -1;
//     if (b.pct > 0 && b.pct < 100 && (a.pct === 0 || a.pct === 100)) return 1;
//     if (a.pct === 100 && b.pct !== 100) return -1;
//     if (b.pct === 100 && a.pct !== 100) return 1;
//     return b.solved - a.solved;
//   });
// }

// function deriveNextProblem(
//   contests: ReturnType<typeof deriveContests>,
//   peerData: PeerData | null
// ) {
//   const peerMap = new Map<string, number>();
//   if (peerData) for (const rp of peerData.recommended_problems) peerMap.set(rp.link, rp.solvedCount);

//   const incomplete = [...contests].filter(c => c.pct < 100)
//     .sort((a, b) => (b.pct > 0 ? b.pct : -1) - (a.pct > 0 ? a.pct : -1))[0];
//   if (!incomplete) return null;

//   const unsolved = incomplete.problems.filter(p => p.cf_status === "todo");
//   if (!unsolved.length) return null;

//   const first = peerData
//     ? unsolved.sort((a, b) => (peerMap.get(b.problem_url) ?? 0) - (peerMap.get(a.problem_url) ?? 0))[0]
//     : unsolved[0];

//   return { index: first.problem_index, name: first.problem_name, url: first.problem_url, contestName: incomplete.name };
// }

"use client";

import { HeroCard } from "./group-detail/HeroCard";
import { ActivityPulseBar } from "./group-detail/ActivityPulseBar"; // ← move the file here
import type { CfGroup, CfGroupProblem } from "@/types";
import type { DayActivity } from "./group-detail/ActivityPulseBar";

export type PeerData = {
  recommended_problems: Array<{ name: string; link: string; solvedCount: number; status: string }>;
  submissionTimestamps: number[]; // Unix epoch seconds
};

interface Props {
  group: CfGroup;
  problems: CfGroupProblem[];
  selectedContestId: string | null;
  peerData: PeerData | null;
  dueProblems?: string[];
}

// ── Derive DayActivity[] from raw timestamps ─────────────────────────────────
// timestamps are Unix seconds (e.g. 1741392000)
// Groups them by YYYY-MM-DD → count per day
// No difficulty breakdown possible yet (cf_rating / solved_at are NULL in DB)
function deriveActivityData(timestamps: number[]): DayActivity[] {
  const map = new Map<string, number>();
  for (const ts of timestamps) {
    const iso = new Date(ts * 1000).toISOString().slice(0, 10);
    map.set(iso, (map.get(iso) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ─────────────────────────────────────────────────────────────────────────────

export function GroupDetailClientV2({ group, problems, peerData, dueProblems }: Props) {

  const contests          = deriveContests(problems);
  const completedContests = contests.filter(c => c.pct === 100).length;
  const nextProblem       = deriveNextProblem(contests, peerData);

  // Activity data — empty array if peerData unavailable (component handles gracefully)
  const activityData: DayActivity[] = peerData
    ? deriveActivityData(peerData.submissionTimestamps)
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* SECTION 1 — Hero */}
      <HeroCard
        group={group}
        completedContests={completedContests}
        totalContests={contests.length}
        nextProblem={nextProblem}
      />

      {/* SECTION 2 — Activity Pulse Bar
          Shows even if peerData is null — renders as all-empty bars with
          "0 submissions" stats, which is better than hiding the section */}
      <ActivityPulseBar
        data={activityData}
        days={60}
        groupName={group.group_name}
        totalSubmissions={peerData?.submissionTimestamps.length ?? 0}
      />

      {/* SECTION 3+ — Contests, Performance, Problem Table (coming next) */}

    </div>
  );
}

// ── Shared derivation helpers ─────────────────────────────────────────────────

function indexOrder(idx: string): number {
  if (!idx) return 999;
  const letter = idx.charCodeAt(0) - 65;
  const num = idx.length > 1 ? parseInt(idx.slice(1), 10) || 0 : 0;
  return letter + num * 26;
}

function contestDisplayName(name: string | null | undefined, id: string) {
  return name?.trim() || `Contest ${id}`;
}

export function deriveContests(problems: CfGroupProblem[]) {
  const map = new Map<string, CfGroupProblem[]>();
  for (const p of problems) {
    if (!map.has(p.contest_id)) map.set(p.contest_id, []);
    map.get(p.contest_id)!.push(p);
  }
  return Array.from(map.entries()).map(([id, probs]) => {
    const solved    = probs.filter(p => p.cf_status === "solved").length;
    const attempted = probs.filter(p => p.cf_status === "attempted").length;
    const todo      = probs.filter(p => p.cf_status === "todo").length;
    const total     = probs.length;
    const pct       = total > 0 ? (solved / total) * 100 : 0;
    return {
      id,
      name: contestDisplayName(probs[0]?.contest_name, id),
      problems: [...probs].sort((a, b) =>
        indexOrder(a.problem_index) - indexOrder(b.problem_index)
      ),
      solved, attempted, todo, total, pct,
    };
  }).sort((a, b) => {
    if (a.pct > 0 && a.pct < 100 && (b.pct === 0 || b.pct === 100)) return -1;
    if (b.pct > 0 && b.pct < 100 && (a.pct === 0 || a.pct === 100)) return 1;
    if (a.pct === 100 && b.pct !== 100) return -1;
    if (b.pct === 100 && a.pct !== 100) return 1;
    return b.solved - a.solved;
  });
}

function deriveNextProblem(
  contests: ReturnType<typeof deriveContests>,
  peerData: PeerData | null,
) {
  const peerMap = new Map<string, number>();
  if (peerData) {
    for (const rp of peerData.recommended_problems) {
      peerMap.set(rp.link, rp.solvedCount);
    }
  }

  const incomplete = [...contests]
    .filter(c => c.pct < 100)
    .sort((a, b) => (b.pct > 0 ? b.pct : -1) - (a.pct > 0 ? a.pct : -1))[0];

  if (!incomplete) return null;

  const unsolved = incomplete.problems.filter(p => p.cf_status === "todo");
  if (!unsolved.length) return null;

  const first = peerData
    ? unsolved.sort((a, b) =>
        (peerMap.get(b.problem_url) ?? 0) - (peerMap.get(a.problem_url) ?? 0)
      )[0]
    : unsolved[0];

  return {
    index: first.problem_index,
    name: first.problem_name,
    url: first.problem_url,
    contestName: incomplete.name,
  };
}