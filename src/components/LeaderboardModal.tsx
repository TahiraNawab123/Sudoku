import { useEffect, useState } from 'react'
import { fetchTopScores, type LeaderboardEntry } from '../utils/leaderboard'
import { ALL_DIFFICULTIES, type Difficulty } from '../utils/types'
import { formatTime } from '../utils/formatTime'

interface LeaderboardModalProps {
  initialDifficulty: Difficulty
  onClose: () => void
}

function LeaderboardModal({ initialDifficulty, onClose }: LeaderboardModalProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchTopScores(difficulty, 10).then((result) => {
      if (cancelled) return
      setEntries(result.entries)
      setError(result.error)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [difficulty])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-board">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">🏆 Leaderboard</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-ink/40 hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {ALL_DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={[
                'rounded-full border px-3 py-1 text-xs capitalize transition-colors',
                d === difficulty
                  ? 'border-accent bg-accent text-white'
                  : 'border-grid/30 bg-paper text-ink/70 hover:border-accent/50',
              ].join(' ')}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="mt-4 max-h-80 overflow-y-auto">
          {loading ? (
            <p className="py-8 text-center text-sm text-ink/50">Loading…</p>
          ) : error ? (
            <p className="py-8 text-center text-sm text-ink/50">{error}</p>
          ) : entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink/50">
              No scores yet for {difficulty}. Be the first!
            </p>
          ) : (
            <ol className="flex flex-col divide-y divide-grid/10">
              {entries.map((entry, i) => (
                <li key={entry.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-5 shrink-0 text-right font-mono text-ink/40">{i + 1}</span>
                    <span className="font-medium text-ink">{entry.username}</span>
                  </div>
                  <div className="flex items-center gap-3 text-ink/60">
                    <span className="font-mono">{formatTime(entry.timeSeconds)}</span>
                    <span className="font-semibold text-accent">{entry.score} pts</span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeaderboardModal