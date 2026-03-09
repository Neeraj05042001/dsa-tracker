// ── CF Rating Enrichment ──────────────────────────────────────────────────────
// Fetches problem ratings from the CF public API for each contest ID
// and updates cf_group_problems.cf_rating where currently NULL.
//
// CF API endpoint (no auth required):
//   https://codeforces.com/api/contest.standings?contestId=ID&from=1&count=1
//
// NOTE: Private group-only contests return status:"FAILED" — handled gracefully.

import { createSupabaseServerClient } from "@/lib/supabase";

const CF_API   = "https://codeforces.com/api/contest.standings";
const DELAY_MS = 500; // Respect CF rate limit (5 req/s max)

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

type CFStandingsResponse = {
  status: "OK" | "FAILED";
  result?: {
    problems: Array<{
      index:  string;
      name:   string;
      rating?: number;
    }>;
  };
  comment?: string;
};

export async function enrichContestRatings(
  userId: string,
  contestIds: string[],
): Promise<{ enriched: number; skipped: number }> {
  if (contestIds.length === 0) return { enriched: 0, skipped: 0 };

  const supabase   = await createSupabaseServerClient();
  let enriched     = 0;
  let skipped      = 0;

  for (const contestId of contestIds) {
    await sleep(DELAY_MS);

    try {
      const url = `${CF_API}?contestId=${contestId}&from=1&count=1&showUnofficial=false`;
      const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h

      if (!res.ok) {
        console.warn(`[CF Enrich] HTTP ${res.status} for contest ${contestId}`);
        skipped++;
        continue;
      }

      const json: CFStandingsResponse = await res.json();

      if (json.status !== "OK" || !json.result?.problems?.length) {
        // Private/group-only contest — CF returns FAILED, skip silently
        console.log(`[CF Enrich] Contest ${contestId} skipped: ${json.comment ?? "no data"}`);
        skipped++;
        continue;
      }

      // Build index → rating map for this contest
      const ratingMap = new Map<string, number>();
      for (const p of json.result.problems) {
        if (p.rating) ratingMap.set(p.index, p.rating);
      }

      if (ratingMap.size === 0) {
        skipped++;
        continue;
      }

      // Batch update — one update per problem index that has a rating
      for (const [index, rating] of ratingMap) {
        const { error } = await (supabase as any)
          .from("cf_group_problems")
          .update({ cf_rating: rating })
          .eq("user_id", userId)
          .eq("contest_id", contestId)
          .eq("problem_index", index)
          .is("cf_rating", null); // Only update if still null — never overwrite manual edits

        if (error) {
          console.error(`[CF Enrich] Update failed for ${contestId}/${index}:`, error.message);
        } else {
          enriched++;
        }
      }

      console.log(`[CF Enrich] Contest ${contestId}: ${ratingMap.size} ratings applied`);
    } catch (err) {
      console.error(`[CF Enrich] Error for contest ${contestId}:`, (err as Error).message);
      skipped++;
    }
  }

  console.log(`[CF Enrich] Complete: ${enriched} enriched, ${skipped} skipped`);
  return { enriched, skipped };
}