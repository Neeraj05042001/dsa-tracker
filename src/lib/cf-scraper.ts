// ==================== CF SCRAPER ====================
// Scrapes Codeforces group data using JSESSIONID + cf_clearance cookies.
// HTML scraping: group list, contest list, problem list.
// API calls:     user.status (submission verdicts — more reliable than HTML).

const CF_BASE = "https://codeforces.com";
const REQUEST_DELAY_MS = 1500;
const GROUP_DELAY_MS = 3000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 8000;

// ── Public result types ───────────────────────────────────────────────────────

export interface ScrapedProblem {
  index: string;
  name: string;
  url: string;
  cfRating: number | null;
  status: "solved" | "attempted" | "todo";
  solvedAt: string | null;
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
  partial: boolean;
  rateLimited: boolean;
  groups: ScrapedGroup[];
  totalProblems: number;
  error?: string;
}

// ── Main entry point ──────────────────────────────────────────────────────────

export async function scrapeUserGroups(
  handle: string,
  jsessionid: string,
  cfClearance = "",
): Promise<ScraperResult> {
  const groups: ScrapedGroup[] = [];
  let totalProblems = 0;

  try {
    const groupCodes = await fetchUserGroupCodes(handle, jsessionid, cfClearance);
    if (groupCodes.length === 0) {
      return { success: true, partial: false, rateLimited: false, groups: [], totalProblems: 0 };
    }

    const userSubmissions = await fetchUserSubmissions(handle);

    for (let i = 0; i < groupCodes.length; i++) {
      const { code, name, url } = groupCodes[i];

      try {
        const contests = await scrapeGroupContests(code, jsessionid, cfClearance, userSubmissions);
        groups.push({ code, name, url, contests });
        totalProblems += contests.reduce((sum, c) => sum + c.problems.length, 0);

        if (i < groupCodes.length - 1) await sleep(GROUP_DELAY_MS);
      } catch (err) {
        const error = err as Error;
        if (error.message?.includes("RATE_LIMITED")) {
          return {
            success: true,
            partial: true,
            rateLimited: true,
            groups,
            totalProblems,
            error: `Rate limited after ${groups.length} groups.`,
          };
        }
        console.error(`[CF Scraper] Failed group ${code}:`, error.message);
      }
    }

    return { success: true, partial: false, rateLimited: false, groups, totalProblems };
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

// ── Fetch group codes ─────────────────────────────────────────────────────────

async function fetchUserGroupCodes(
  handle: string,
  jsessionid: string,
  cfClearance: string,
): Promise<Array<{ code: string; name: string; url: string }>> {
  const url = `${CF_BASE}/groups/with/${handle}`;
  const html = await cfFetch(url, jsessionid, cfClearance);
  return parseGroupList(html);
}

// ── Scrape all contests in a group ────────────────────────────────────────────

async function scrapeGroupContests(
  groupCode: string,
  jsessionid: string,
  cfClearance: string,
  userSubmissions: UserSubmission[],
): Promise<ScrapedContest[]> {
  const url = `${CF_BASE}/group/${groupCode}/contests`;
  const html = await cfFetch(url, jsessionid, cfClearance);
  const contestIds = parseContestList(html);

  console.log(`[CF Scraper] Group ${groupCode}: found ${contestIds.length} contests`);

  const contests: ScrapedContest[] = [];

  for (let i = 0; i < contestIds.length; i++) {
    const { id, name } = contestIds[i];
    await sleep(REQUEST_DELAY_MS);

    const problemsHtml = await cfFetch(
      `${CF_BASE}/group/${groupCode}/contest/${id}/problems`,
      jsessionid,
      cfClearance,
    );
    const rawProblems = parseProblemList(problemsHtml, groupCode, id);
    const problems = rawProblems.map((p) => resolveStatus(p, groupCode, id, userSubmissions));

    console.log(`[CF Scraper] Contest ${id} "${name}": ${problems.length} problems`);
    contests.push({ id, name, problems });
  }

  return contests;
}

// ── CF API: user submissions ──────────────────────────────────────────────────

interface UserSubmission {
  contestId: number;
  problem: { index: string; name: string; rating?: number };
  verdict: string;
  creationTime: number;
}

async function fetchUserSubmissions(handle: string): Promise<UserSubmission[]> {
  try {
    const url = `${CF_BASE}/api/user.status?handle=${handle}&count=500`;
    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!response.ok) return [];
    const data = await response.json();
    if (data.status !== "OK") return [];
    return data.result as UserSubmission[];
  } catch {
    return [];
  }
}

// ── Resolve solve status ──────────────────────────────────────────────────────

function resolveStatus(
  problem: Omit<ScrapedProblem, "status" | "solvedAt">,
  groupCode: string,
  contestId: string,
  submissions: UserSubmission[],
): ScrapedProblem {
  const matching = submissions.filter(
    (s) => String(s.contestId) === String(contestId) && s.problem.index === problem.index,
  );

  if (matching.length === 0) return { ...problem, status: "todo", solvedAt: null };

  const accepted = matching.find((s) => s.verdict === "OK");
  if (accepted) {
    return {
      ...problem,
      status: "solved",
      solvedAt: new Date(accepted.creationTime * 1000).toISOString(),
    };
  }

  return { ...problem, status: "attempted", solvedAt: null };
}

// ── HTML Parsers ──────────────────────────────────────────────────────────────

function parseGroupList(html: string): Array<{ code: string; name: string; url: string }> {
  const groups: Array<{ code: string; name: string; url: string }> = [];
  const namePattern = /<a[^>]+href="\/group\/([A-Za-z0-9]+)"[^>]*>([^<]+)<\/a>/g;
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = namePattern.exec(html)) !== null) {
    const code = match[1];
    const name = match[2].trim();
    if (!seen.has(code) && name && code.length >= 6) {
      seen.add(code);
      groups.push({ code, name, url: `${CF_BASE}/group/${code}/contests` });
    }
  }

  console.log(`[CF Scraper] Found ${groups.length} groups:`, groups.map(g => g.name));
  return groups;
}

function parseContestList(html: string): Array<{ id: string; name: string }> {
  const contests: Array<{ id: string; name: string }> = [];
  const pattern = /href="\/group\/[A-Za-z0-9]+\/contest\/(\d+)"[^>]*>([^<]+)<\/a>/g;
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
  const problems: Array<Omit<ScrapedProblem, "status" | "solvedAt">> = [];
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
        cfRating: null,
      });
    }
  }

  return problems;
}

// ── HTTP fetch with retry ─────────────────────────────────────────────────────

async function cfFetch(
  url: string,
  jsessionid: string,
  cfClearance: string,
  attempt = 1,
): Promise<string> {
  try {
    // Build cookie string — include cf_clearance if available
    const cookieParts = [`JSESSIONID=${jsessionid}`];
    if (cfClearance) cookieParts.push(`cf_clearance=${cfClearance}`);
    const cookieHeader = cookieParts.join("; ");

    const response = await fetch(url, {
      headers: {
        Cookie: cookieHeader,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://codeforces.com",
      },
      redirect: "follow",
    });

    if (response.status === 429) throw new Error("RATE_LIMITED");

    const finalUrl = response.url;
    if (finalUrl.includes("/enter") || finalUrl.includes("/login")) {
      throw new Error("SESSION_EXPIRED");
    }

    if (response.status >= 500) {
      if (attempt <= MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
        return cfFetch(url, jsessionid, cfClearance, attempt + 1);
      }
      throw new Error(`CF server error ${response.status} after ${MAX_RETRIES} retries`);
    }

    if (!response.ok) throw new Error(`CF returned ${response.status} for ${url}`);

    return response.text();
  } catch (err) {
    const error = err as Error;
    if (error.message === "RATE_LIMITED" || error.message === "SESSION_EXPIRED") throw error;
    if (attempt <= MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS * attempt);
      return cfFetch(url, jsessionid, cfClearance, attempt + 1);
    }
    throw error;
  }
}

// ── Utility ───────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}