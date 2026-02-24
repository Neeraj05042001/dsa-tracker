import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ExtensionPayload, Difficulty } from '@/types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

function normalizeDifficulty(
  difficulty: string | null | undefined,
  cfRating: number | null | undefined
): Difficulty | null {
  if (cfRating) {
    if (cfRating < 1200) return 'easy'
    if (cfRating < 1900) return 'medium'
    return 'hard'
  }
  if (!difficulty) return null
  const d = difficulty.toLowerCase().trim()
  if (d === 'easy') return 'easy'
  if (d === 'medium') return 'medium'
  if (d === 'hard') return 'hard'
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body: ExtensionPayload = await request.json()
    console.log('[API] Received from extension:', body)

    // ==================== VALIDATE ====================
    if (!body.problem_name?.trim()) {
      return NextResponse.json(
        { success: false, message: 'problem_name is required' },
        { status: 400, headers: corsHeaders }
      )
    }
    if (!body.platform) {
      return NextResponse.json(
        { success: false, message: 'platform is required' },
        { status: 400, headers: corsHeaders }
      )
    }
    if (!body.problem_key) {
      return NextResponse.json(
        { success: false, message: 'problem_key is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // ==================== NORMALIZE ====================
    const normalizedDifficulty = normalizeDifficulty(body.difficulty, body.cf_rating)

    const problemData = {
      problem_name: body.problem_name.trim(),
      platform: body.platform,
      problem_key: body.problem_key,
      problem_url: body.problem_url || null,
      difficulty: normalizedDifficulty,
      cf_rating: body.cf_rating || null,
      tags: body.tags || [],
      user_difficulty: body.user_difficulty || null,
      status: body.status || 'solved',
      needs_revision: body.needs_revision || false,

      // New fields
      approach: body.approach?.trim() || null,
      mistakes: body.mistakes?.trim() || null,
      solve_help: body.solve_help || null,
      time_taken: body.time_taken || null,
      confidence: body.confidence || null,
      pattern: body.pattern || null,
      similar_problems: body.similar_problems?.trim() || null,

      // Submission details
      language: body.language || null,
      runtime: body.runtime || null,
      memory: body.memory || null,
      submission_url: body.submission_url || null,
      solved_at: body.solved_at || new Date().toISOString(),
    }

    // ==================== UPSERT ====================
    const { data: existing } = await supabase
      .from('problems')
      .select('id, problem_key')
      .eq('problem_key', body.problem_key)
      .single()

    let data, error

    if (existing) {
      console.log('[API] Updating existing problem:', body.problem_key)
      ;({ data, error } = await supabase
        .from('problems')
        .update({ ...problemData, updated_at: new Date().toISOString() } as any)
        .eq('problem_key', body.problem_key)
        .select()
        .single())
    } else {
      console.log('[API] Inserting new problem:', body.problem_key)
      ;({ data, error } = await supabase
        .from('problems')
        .insert(problemData as any)
        .select()
        .single())
    }

    if (error) {
      console.error('[API] Supabase error:', error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400, headers: corsHeaders }
      )
    }

    // ==================== LOG HISTORY ====================
    if (body.submission_id || body.status) {
      await supabase.from('submission_history').insert({
        problem_key: body.problem_key,
        platform: body.platform,
        submission_id: body.submission_id || null,
        status: body.status || null,
        language: body.language || null,
        runtime: body.runtime || null,
        memory: body.memory || null,
        submitted_at: body.solved_at || new Date().toISOString(),
      } as any)
    }

    console.log('[API] Success:', data)

    return NextResponse.json(
      {
        success: true,
        message: existing ? 'Problem updated' : 'Problem added',
        problem: data,
      },
      { status: 201, headers: corsHeaders }
    )

  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}