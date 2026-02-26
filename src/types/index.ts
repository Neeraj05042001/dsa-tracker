// // ==================== DATABASE TYPES ====================

// export type Platform = 'leetcode' | 'codeforces' | 'other'
// export type Difficulty = 'easy' | 'medium' | 'hard'
// export type Status = 'solved' | 'attempted'
// export type SolveHelp = 'no_help' | 'hints' | 'saw_solution'
// export type TimeTaken = '<15' | '15-30' | '30-60' | '>60'
// export type Confidence = 'low' | 'medium' | 'high'

// export interface Problem {
//   id: string
//   problem_name: string
//   platform: Platform
//   problem_key: string
//   problem_url: string | null
//   difficulty: Difficulty | null
//   cf_rating: number | null
//   tags: string[]
//   user_difficulty: Difficulty | null
//   status: Status
//   needs_revision: boolean
//   approach: string | null
//   mistakes: string | null
//   solve_help: SolveHelp | null
//   time_taken: TimeTaken | null
//   confidence: Confidence | null
//   pattern: string | null
//   similar_problems: string | null
//   language: string | null
//   runtime: string | null
//   memory: string | null
//   submission_url: string | null
//   solved_at: string | null
//   created_at: string
//   updated_at: string
// }

// export interface SubmissionHistory {
//   id: string
//   problem_key: string
//   platform: Platform
//   submission_id: string | null
//   status: string | null
//   language: string | null
//   runtime: string | null
//   memory: string | null
//   submitted_at: string | null
//   created_at: string
// }

// // ==================== API TYPES ====================

// export interface ExtensionPayload {
//   // Required
//   problem_name: string
//   platform: Platform
//   problem_key: string
//   status: Status

//   // Problem details
//   problem_url?: string | null
//   difficulty?: string | null
//   cf_rating?: number | null
//   tags?: string[]
//   language?: string | null
//   runtime?: string | null
//   memory?: string | null
//   submission_id?: string | null
//   submission_url?: string | null
//   solved_at?: string | null

//   // User manual entries from popup
//   user_difficulty?: Difficulty | null
//   needs_revision?: boolean
//   approach?: string | null
//   mistakes?: string | null
//   solve_help?: SolveHelp | null
//   time_taken?: TimeTaken | null
//   confidence?: Confidence | null
//   pattern?: string | null
//   similar_problems?: string | null
// }

// export interface APIResponse {
//   success: boolean
//   message: string
//   problem?: Problem
//   error?: string
// }


// ==================== DATABASE PRIMITIVE TYPES ====================

export type Platform = 'leetcode' | 'codeforces' | 'other'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type Status = 'solved' | 'attempted'
export type SolveHelp = 'no_help' | 'hints' | 'saw_solution'
export type TimeTaken = '<15' | '15-30' | '30-60' | '>60'
export type Confidence = 'low' | 'medium' | 'high'

// ==================== CORE DATABASE TYPES ====================

export interface Problem {
  id: string
  problem_name: string
  platform: Platform
  problem_key: string
  problem_url: string | null
  difficulty: Difficulty | null
  cf_rating: number | null
  tags: string[]
  user_difficulty: Difficulty | null
  status: Status
  needs_revision: boolean
  approach: string | null
  mistakes: string | null
  solve_help: SolveHelp | null
  time_taken: TimeTaken | null
  confidence: Confidence | null
  pattern: string | null
  similar_problems: string | null
  language: string | null
  runtime: string | null
  memory: string | null
  submission_url: string | null
  solved_at: string | null
  created_at: string
  updated_at: string

  // SM2 Spaced Repetition fields (added in Step 0 migration)
  sm2_interval: number        // days until next review (default: 1)
  sm2_ease_factor: number     // difficulty multiplier (default: 2.5)
  sm2_repetitions: number     // how many times reviewed (default: 0)
  sm2_next_review: string | null // ISO date string for next due review
}

export interface SubmissionHistory {
  id: string
  problem_key: string
  platform: Platform
  submission_id: string | null
  status: string | null
  language: string | null
  runtime: string | null
  memory: string | null
  submitted_at: string | null
  created_at: string
}

// ==================== API TYPES ====================

export interface ExtensionPayload {
  // Required
  problem_name: string
  platform: Platform
  problem_key: string
  status: Status

  // Problem details
  problem_url?: string | null
  difficulty?: string | null
  cf_rating?: number | null
  tags?: string[]
  language?: string | null
  runtime?: string | null
  memory?: string | null
  submission_id?: string | null
  submission_url?: string | null
  solved_at?: string | null

  // User manual entries from popup
  user_difficulty?: Difficulty | null
  needs_revision?: boolean
  approach?: string | null
  mistakes?: string | null
  solve_help?: SolveHelp | null
  time_taken?: TimeTaken | null
  confidence?: Confidence | null
  pattern?: string | null
  similar_problems?: string | null
}

export interface APIResponse {
  success: boolean
  message: string
  problem?: Problem
  error?: string
}

// ==================== DASHBOARD — FILTER TYPES ====================

export interface ProblemFilters {
  platform: Platform | 'all'
  difficulty: Difficulty | 'all'
  status: Status | 'all'
  pattern: string | 'all'
  tags: string[]                 // multi-select, empty = no filter
  needs_revision: boolean | null // null = no filter, true = only revision
  solve_help: SolveHelp | 'all'
  confidence: Confidence | 'all'
  search: string                 // free text search on problem_name
}

export const DEFAULT_FILTERS: ProblemFilters = {
  platform: 'all',
  difficulty: 'all',
  status: 'all',
  pattern: 'all',
  tags: [],
  needs_revision: null,
  solve_help: 'all',
  confidence: 'all',
  search: '',
}

// ==================== DASHBOARD — STATS TYPES ====================

export interface PlatformStats {
  platform: Platform
  total: number
  solved: number
  attempted: number
  easy: number
  medium: number
  hard: number
}

export interface DifficultyBreakdown {
  easy: number
  medium: number
  hard: number
  unknown: number // problems with no difficulty set (e.g. CF group contests)
}

export interface TagStat {
  tag: string
  count: number
  avg_confidence: number       // 0–1 normalized (low=0.2, medium=0.5, high=1.0)
  low_confidence_count: number // how many problems in this tag are low confidence
}

export interface SolveHelpBreakdown {
  no_help: number
  hints: number
  saw_solution: number
}

export interface PatternStat {
  pattern: string
  count: number
  avg_confidence: number
}

export interface DailyActivity {
  date: string  // ISO date string 'YYYY-MM-DD'
  count: number // problems solved that day
}

export interface ProblemStats {
  total: number
  solved: number
  attempted: number
  needs_revision_count: number
  by_platform: PlatformStats[]
  by_difficulty: DifficultyBreakdown
  by_solve_help: SolveHelpBreakdown
  by_tag: TagStat[]
  by_pattern: PatternStat[]
  daily_activity: DailyActivity[] // last 365 days for heatmap
  current_streak: number          // consecutive days with at least 1 solve
  longest_streak: number
  avg_confidence: number          // 0–1 normalized
  total_this_week: number
  total_this_month: number
}

// ==================== DASHBOARD — READINESS SCORE ====================

// Score is 0–100. Broken into 4 weighted components.
export interface ReadinessScore {
  total: number             // final 0–100 score

  // Sub-scores (each 0–100 before weighting)
  consistency: number       // solved in last 14 of 14 days → 100
  difficulty_spread: number // % of medium+hard vs total (target: 70%+)
  confidence_avg: number    // avg confidence across all problems
  revision_discipline: number // % of due-for-revision problems reviewed on time

  // Human-readable verdict based on total score
  verdict: 'Excellent' | 'On Track' | 'Needs Work' | 'Getting Started'
  verdict_detail: string    // one-line explanation e.g. "Review backlog building up"
}

// Helper to compute verdict from score
export function getReadinessVerdict(score: number): ReadinessScore['verdict'] {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'On Track'
  if (score >= 30) return 'Needs Work'
  return 'Getting Started'
}

// Helper to map confidence string to normalized 0–1 number
export function confidenceToScore(confidence: Confidence | null): number {
  if (!confidence) return 0
  const map: Record<Confidence, number> = {
    low: 0.2,
    medium: 0.5,
    high: 1.0,
  }
  return map[confidence]
}

// Helper to map confidence string to SM2 quality score (0–5)
export function confidenceToSM2Quality(confidence: Confidence | null): number {
  if (!confidence) return 0
  const map: Record<Confidence, number> = {
    low: 2,    // remembered with difficulty
    medium: 3, // remembered with some effort
    high: 5,   // perfect recall
  }
  return map[confidence]
}

// ==================== DASHBOARD — SM2 ALGORITHM ====================

export interface SM2Input {
  quality: number        // 0–5 score from confidence
  repetitions: number    // current sm2_repetitions
  ease_factor: number    // current sm2_ease_factor
  interval: number       // current sm2_interval
}

export interface SM2Output {
  repetitions: number
  ease_factor: number
  interval: number
  next_review: string    // ISO date string
}

// Pure SM2 calculation — no side effects, fully testable
export function calculateSM2(input: SM2Input): SM2Output {
  const { quality, repetitions, ease_factor, interval } = input

  let new_repetitions: number
  let new_interval: number
  let new_ease_factor: number

  if (quality < 3) {
    // Failed recall — reset
    new_repetitions = 0
    new_interval = 1
    new_ease_factor = Math.max(1.3, ease_factor - 0.2)
  } else {
    // Successful recall
    new_repetitions = repetitions + 1
    new_ease_factor = Math.max(
      1.3,
      ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    )

    if (repetitions === 0) new_interval = 1
    else if (repetitions === 1) new_interval = 6
    else new_interval = Math.round(interval * new_ease_factor)
  }

  const next_review = new Date()
  next_review.setDate(next_review.getDate() + new_interval)

  return {
    repetitions: new_repetitions,
    ease_factor: new_ease_factor,
    interval: new_interval,
    next_review: next_review.toISOString().split('T')[0],
  }
}

// ==================== DASHBOARD — UI STATE TYPES ====================

export type ViewMode = 'table' | 'card'
export type SortField = 'solved_at' | 'problem_name' | 'difficulty' | 'confidence' | 'sm2_next_review'
export type SortDirection = 'asc' | 'desc'

export interface TableSortState {
  field: SortField
  direction: SortDirection
}

export interface DrawerState {
  open: boolean
  problem: Problem | null
}

// ==================== DASHBOARD — PATTERNS CONSTANT ====================
// Single source of truth — matches extension popup chips exactly

export const PROBLEM_PATTERNS = [
  'Sliding Window',
  'Two Pointers',
  'Binary Search',
  'BFS',
  'DFS',
  'DP',
  'Greedy',
  'Backtracking',
  'Top K',
  'Merge Intervals',
  'Bit Manip',
  'Math',
  'Other',
] as const

export type ProblemPattern = typeof PROBLEM_PATTERNS[number]