// User type (extends Supabase user)
export type User = {
  id: string
  email: string
  name?: string
  created_at: string
  updated_at: string
}

// Problem type (what we're storing)
export type Problem = {
  id: string
  user_id: string
  problem_name: string
  problem_link?: string
  platform: 'codeforces' | 'leetcode' | 'other'
  difficulty: 'easy' | 'medium' | 'hard'
  user_difficulty: 'easy' | 'medium' | 'hard'
  status: 'attempted' | 'solved'
  needs_revision: boolean
  remarks?: string
  tags: string[]
  solved_date?: string
  created_at: string
  updated_at: string
}

// Difficulty level type
export type DifficultyLevel = 'easy' | 'medium' | 'hard'

// Platform type
export type PlatformType = 'codeforces' | 'leetcode' | 'other'

// Status type
export type StatusType = 'attempted' | 'solved'