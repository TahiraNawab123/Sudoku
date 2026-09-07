import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import type { Difficulty } from './types'

export interface LeaderboardEntry {
  id: string
  username: string
  difficulty: Difficulty
  score: number
  timeSeconds: number
  mistakes: number
  createdAt: string
}

interface SubmitResult {
  error: string | null
}

/** Submits a completed game's score under the currently logged-in user. */
export async function submitScore(params: {
  userId: string
  difficulty: Difficulty
  score: number
  timeSeconds: number
  mistakes: number
}): Promise<SubmitResult> {
  if (!isSupabaseConfigured) return { error: 'Leaderboard is not configured yet.' }

  const { error } = await supabase.from('leaderboard_entries').insert({
    user_id: params.userId,
    difficulty: params.difficulty,
    score: params.score,
    time_seconds: params.timeSeconds,
    mistakes: params.mistakes,
  })

  if (error) return { error: error.message }
  return { error: null }
}

/** Fetches the top N scores for a difficulty, highest score first (ties broken by fastest time). */
export async function fetchTopScores(
  difficulty: Difficulty,
  limit = 10,
): Promise<{ entries: LeaderboardEntry[]; error: string | null }> {
  if (!isSupabaseConfigured) return { entries: [], error: 'Leaderboard is not configured yet.' }

  const { data, error } = await supabase
    .from('leaderboard_entries')
    .select('id, difficulty, score, time_seconds, mistakes, created_at, profiles(username)')
    .eq('difficulty', difficulty)
    .order('score', { ascending: false })
    .order('time_seconds', { ascending: true })
    .limit(limit)

  if (error) return { entries: [], error: error.message }

  const entries: LeaderboardEntry[] = (data ?? []).map((row) => {
    // Supabase's generated types can represent a to-one join as an array; handle both shapes.
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
    return {
      id: row.id,
      username: profile?.username ?? 'Anonymous',
      difficulty: row.difficulty as Difficulty,
      score: row.score,
      timeSeconds: row.time_seconds,
      mistakes: row.mistakes,
      createdAt: row.created_at,
    }
  })

  return { entries, error: null }
}