import type { Board } from '../utils/types'

interface KeypadProps {
  board: Board
  onNumber: (value: number) => void
  onErase: () => void
}

/** Counts how many times each digit 1-9 currently appears on the board. */
function countDigits(board: Board): Record<number, number> {
  const counts: Record<number, number> = {}
  for (let n = 1; n <= 9; n++) counts[n] = 0
  for (const row of board) {
    for (const value of row) {
      if (value !== 0) counts[value]++
    }
  }
  return counts
}

function Keypad({ board, onNumber, onErase }: KeypadProps) {
  const counts = countDigits(board)

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => {
        // A digit is "complete" once it's been placed 9 times — all its slots are filled.
        const isComplete = counts[n] >= 9
        return (
          <button
            key={n}
            type="button"
            disabled={isComplete}
            onClick={() => onNumber(n)}
            aria-label={`Enter ${n}`}
            className={[
              'flex h-11 w-11 items-center justify-center rounded-xl border text-lg font-medium transition-all sm:h-12 sm:w-12',
              isComplete
                ? 'cursor-not-allowed border-grid/10 text-ink/15'
                : 'border-grid/15 bg-surface text-ink shadow-sm hover:border-accent/40 hover:bg-accentSoft active:scale-95',
            ].join(' ')}
          >
            {n}
          </button>
        )
      })}

      <button
        type="button"
        onClick={onErase}
        aria-label="Erase selected cell"
        className="flex h-11 items-center justify-center rounded-xl border border-grid/15 bg-surface px-3.5 text-sm font-medium text-ink/70 shadow-sm transition-all hover:border-accent/40 hover:bg-accentSoft active:scale-95 sm:h-12"
      >
        Erase
      </button>
    </div>
  )
}

export default Keypad