// ==================== CF SCRAPER ====================
// Scrapes Codeforces group data using JSESSIONID cookie.
// HTML scraping: group list, contest list, problem list.
// API calls:     user.status (submission verdicts — more reliable than HTML).

const CF_BASE = "https://codeforces.com";
const REQUEST_DELAY_MS = 1500; // between individual requests
const GROUP_DELAY_MS = 3000; // extra pause between groups
const MAX_RETRIES = 2; // retry count on 5xx errors
const RETRY_DELAY_MS = 8000; // wait before retry

// ── Public result types ───────────────────────────────────────────────────────

export interface ScrapedProblem {
  index: string; // 'A', 'B', 'C1'
  name: string;
  url: string;
  cfRating: number | null;
  status: "solved" | "attempted" | "todo";
  solvedAt: string | null; // ISO string if solved
}

export interface ScrapedContest {
  id: string;
  name: string;
  problems: ScrapedProblem[];
}

export interface ScrapedGroup {
  code: string;
  name: string;
  url: string;
  contests: ScrapedContest[];
}

export interface ScraperResult {
  success: boolean;
  partial: boolean; // true if CF rate-limited mid-way
  rateLimited: boolean;
  groups: ScrapedGroup[];
  totalProblems: number;
  error?: string;
}

// ── Main entry point ──────────────────────────────────────────────────────────

/**
 * Full sync for a user. Scrapes all groups, contests, problems, and
 * cross-references with user.status API for solve status.
 */
export async function scrapeUserGroups(
  handle: string,
  jsessionid: string,
): Promise<ScraperResult> {
  const groups: ScrapedGroup[] = [];
  let totalProblems = 0;

  try {
    // 1. Get list of groups the user is in
    const groupCodes = await fetchUserGroupCodes(handle, jsessionid);
    if (groupCodes.length === 0) {
      return {
        success: true,
        partial: false,
        rateLimited: false,
        groups: [],
        totalProblems: 0,
      };
    }

    // 2. Get all user's CF submissions (one API call covers everything including groups)
    const userSubmissions = await fetchUserSubmissions(handle);

    // 3. For each group, scrape contests + problems
    for (let i = 0; i < groupCodes.length; i++) {
      const { code, name, url } = groupCodes[i];

      try {
        const contests = await scrapeGroupContests(
          code,
          jsessionid,
          userSubmissions,
        );
        groups.push({ code, name, url, contests });
        totalProblems += contests.reduce(
          (sum, c) => sum + c.problems.length,
          0,
        );

        // Pause between groups to avoid rate limiting
        if (i < groupCodes.length - 1) await sleep(GROUP_DELAY_MS);
      } catch (err) {
        const error = err as Error;
        // If rate limited mid-way — save what we have, return partial
        if (error.message?.includes("RATE_LIMITED")) {
          return {
            success: true,
            partial: true,
            rateLimited: true,
            groups,
            totalProblems,
            error: `Rate limited after ${groups.length} groups. Remaining will sync later.`,
          };
        }
        // For other errors on a single group — log and continue
        console.error(`[CF Scraper] Failed group ${code}:`, error.message);
      }
    }

    return {
      success: true,
      partial: false,
      rateLimited: false,
      groups,
      totalProblems,
    };
  } catch (err) {
    const error = err as Error;
    return {
      success: false,
      partial: false,
      rateLimited: error.message?.includes("RATE_LIMITED"),
      groups,
      totalProblems,
      error: error.message,
    };
  }
}

// ── Fetch group codes for a user ──────────────────────────────────────────────

async function fetchUserGroupCodes(
  handle: string,
  jsessionid: string,
): Promise<Array<{ code: string; name: string; url: string }>> {
  const url = `${CF_BASE}/groups/with/${handle}`;
  const html = await cfFetch(url, jsessionid);
  return parseGroupList(html);
}

// ── Scrape all contests in a group ────────────────────────────────────────────

async function scrapeGroupContests(
  groupCode: string,
  jsessionid: string,
  userSubmissions: UserSubmission[],
): Promise<ScrapedContest[]> {
  const url = `${CF_BASE}/group/${groupCode}/contests`;
  const html = await cfFetch(url, jsessionid);
  const contestIds = parseContestList(html);
  const contests: ScrapedContest[] = [];

  for (let i = 0; i < contestIds.length; i++) {
    const { id, name } = contestIds[i];

    await sleep(REQUEST_DELAY_MS);

    const problemsHtml = await cfFetch(
      `${CF_BASE}/group/${groupCode}/contest/${id}/problems`,
      jsessionid,
    );
    const rawProblems = parseProblemList(problemsHtml, groupCode, id);

    // Cross-reference with user submissions to set solve status
    const problems = rawProblems.map((p) =>
      resolveStatus(p, groupCode, id, userSubmissions),
    );

    contests.push({ id, name, problems });
  }

  return contests;
}

// ── CF API: fetch all user submissions (includes group contests) ──────────────

interface UserSubmission {
  contestId: number;
  problem: { index: string; name: string; rating?: number };
  verdict: string;
  creationTime: number; // unix timestamp
}

async function fetchUserSubmissions(handle: string): Promise<UserSubmission[]> {
  try {
    const url = `${CF_BASE}/api/user.status?handle=${handle}&count=500`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!response.ok) return [];

    const data = await response.json();
    if (data.status !== "OK") return [];

    return data.result as UserSubmission[];
  } catch {
    return []; // Submissions are best-effort — don't fail the whole sync
  }
}

// ── Resolve solve status from submissions ─────────────────────────────────────

function resolveStatus(
  problem: Omit<ScrapedProblem, "status" | "solvedAt">,
  groupCode: string,
  contestId: string,
  submissions: UserSubmission[],
): ScrapedProblem {
  // Find submissions for this specific contest + problem index
  const matching = submissions.filter(
    (s) =>
      String(s.contestId) === String(contestId) &&
      s.problem.index === problem.index,
  );

  if (matching.length === 0) {
    return { ...problem, status: "todo", solvedAt: null };
  }

  const accepted = matching.find((s) => s.verdict === "OK");
  if (accepted) {
    return {
      ...problem,
      status: "solved",
      solvedAt: new Date(accepted.creationTime * 1000).toISOString(),
    };
  }

  // Has submissions but none accepted
  return { ...problem, status: "attempted", solvedAt: null };
}

// ── HTML Parsers ──────────────────────────────────────────────────────────────
// These are isolated here so they're easy to update if CF changes markup.

function parseGroupList(
  html: string,
): Array<{ code: string; name: string; url: string }> {
  console.log(
    "[CF Debug] Group page HTML snippet:",
    html.substring(15000, 20000)
  );
  const groups: Array<{ code: string; name: string; url: string }> = [];

  // CF group links look like: href="/group/XXXXX" or href="/group/XXXXX/contests"
  // Group code is alphanumeric, typically 10 chars
  const linkPattern = /href="\/group\/([A-Za-z0-9]+)(?:\/[^"]*)?"/g;
  const namePattern =
    /<a[^>]+href="\/group\/([A-Za-z0-9]+)"[^>]*>([^<]+)<\/a>/g;

  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = namePattern.exec(html)) !== null) {
    const code = match[1];
    const name = match[2].trim();

    if (!seen.has(code) && name && code.length >= 6) {
      seen.add(code);
      groups.push({
        code,
        name,
        url: `${CF_BASE}/group/${code}/contests`,
      });
    }
  }

  return groups;
}

function parseContestList(html: string): Array<{ id: string; name: string }> {
  console.log(
    "[CF Debug] Group page HTML snippet:",
    html.substring(15000, 20000),
  );
  const contests: Array<{ id: string; name: string }> = [];

  // Contest links: /group/XXXXX/contest/123456
  const pattern =
    /href="\/group\/[A-Za-z0-9]+\/contest\/(\d+)"[^>]*>([^<]+)<\/a>/g;
  const seen = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    const id = match[1];
    const name = match[2].trim();
    if (!seen.has(id) && name) {
      seen.add(id);
      contests.push({ id, name });
    }
  }

  return contests;
}

function parseProblemList(
  html: string,
  groupCode: string,
  contestId: string,
): Array<Omit<ScrapedProblem, "status" | "solvedAt">> {
  console.log(
    "[CF Debug] Group page HTML snippet:",
    html.substring(15000, 20000),
  );
  const problems: Array<Omit<ScrapedProblem, "status" | "solvedAt">> = [];

  // Problem rows in CF: /group/XXXXX/contest/123/problem/A
  const pattern =
    /href="\/group\/[A-Za-z0-9]+\/contest\/\d+\/problem\/([A-Z][0-9]?)"[^>]*>([^<]+)<\/a>/g;
  const seen = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    const index = match[1];
    const name = match[2].trim();

    if (!seen.has(index) && name) {
      seen.add(index);
      problems.push({
        index,
        name,
        url: `${CF_BASE}/group/${groupCode}/contest/${contestId}/problem/${index}`,
        cfRating: null, // Group contest problems rarely have ratings
      });
    }
  }

  return problems;
}

// ── HTTP fetch with retry + rate limit detection ──────────────────────────────

async function cfFetch(
  url: string,
  jsessionid: string,
  attempt = 1,
): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        Cookie: `JSESSIONID=${jsessionid}`,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
        Referer: "https://codeforces.com",
      },
      redirect: "follow",
    });

    // Rate limited
    if (response.status === 429) {
      throw new Error("RATE_LIMITED");
    }

    // CF redirects to login page when session is invalid
    const finalUrl = response.url;
    if (finalUrl.includes("/enter") || finalUrl.includes("/login")) {
      throw new Error("SESSION_EXPIRED");
    }

    // Server error — retry with backoff
    if (response.status >= 500) {
      if (attempt <= MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
        return cfFetch(url, jsessionid, attempt + 1);
      }
      throw new Error(
        `CF server error ${response.status} after ${MAX_RETRIES} retries`,
      );
    }

    if (!response.ok) {
      throw new Error(`CF returned ${response.status} for ${url}`);
    }

    return response.text();
  } catch (err) {
    const error = err as Error;
    // Don't retry on known errors
    if (
      error.message === "RATE_LIMITED" ||
      error.message === "SESSION_EXPIRED"
    ) {
      throw error;
    }
    // Network error — retry
    if (attempt <= MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS * attempt);
      return cfFetch(url, jsessionid, attempt + 1);
    }
    throw error;
  }
}

// ── Utility ───────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
