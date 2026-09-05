import { formatTime } from '../utils/formatTime'
import { ALL_DIFFICULTIES, type Difficulty } from '../utils/types'

interface WinModalProps {
  seconds: number
  difficulty: Difficulty
  hintsUsed: number
  onNewGame: (difficulty: Difficulty) => void
}

function WinModal({ seconds, difficulty, hintsUsed, onNewGame }: WinModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-paper p-8 text-center shadow-2xl">
        <p className="text-4xl">🎉</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Puzzle solved!</h2>

        <dl className="mx-auto mt-5 flex max-w-[14rem] flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink/60">Difficulty</dt>
            <dd className="font-medium capitalize text-ink">{difficulty}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/60">Time</dt>
            <dd className="font-mono font-medium text-ink">{formatTime(seconds)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/60">Hints used</dt>
            <dd className="font-medium text-ink">{hintsUsed}</dd>
          </div>
        </dl>

        <p className="mt-6 text-xs font-medium uppercase tracking-wide text-ink/40">
          Play again
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {ALL_DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onNewGame(d)}
              className={[
                'rounded-full border px-3 py-1.5 text-sm capitalize transition-colors',
                d === difficulty
                  ? 'border-accent bg-accent text-white'
                  : 'border-grid/30 bg-paper text-ink/70 hover:border-accent/50',
              ].join(' ')}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WinModal