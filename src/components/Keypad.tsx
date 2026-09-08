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
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-surface p-2.5 shadow-toolbar">
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
              'flex h-12 w-12 items-center justify-center rounded-xl text-xl font-medium transition-all sm:h-14 sm:w-14',
              isComplete
                ? 'cursor-not-allowed text-ink/15'
                : 'bg-paper text-ink shadow-sm hover:bg-accentSoft active:scale-95',
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
        className="flex h-12 items-center justify-center rounded-xl bg-paper px-4 text-sm font-medium text-ink/70 shadow-sm transition-all hover:bg-accentSoft active:scale-95 sm:h-14"
      >
        Erase
      </button>
    </div>
  )
}

export default Keypad