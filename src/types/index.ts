// ==================== DATABASE TYPES ====================

export type Platform = 'leetcode' | 'codeforces' | 'other'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type Status = 'solved' | 'attempted'
export type SolveHelp = 'no_help' | 'hints' | 'saw_solution'
export type TimeTaken = '<15' | '15-30' | '30-60' | '>60'
export type Confidence = 'low' | 'medium' | 'high'

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