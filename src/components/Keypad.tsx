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
    <div className="grid w-full max-w-xl grid-cols-5 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-2.5">
      {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => {

const isComplete = counts[n] >= 9
        return (
          <button
            key={n}
            type="button"
            disabled={isComplete}
            onClick={() => onNumber(n)}
            aria-label={`Enter ${n}`}
            className={[
              'flex h-12 w-full items-center justify-center rounded-xl border text-lg font-medium transition-all sm:size-12',
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
        className="col-span-2 flex h-12 items-center justify-center rounded-xl border border-grid/15 bg-surface px-3.5 text-sm font-medium text-ink/70 shadow-sm transition-all hover:border-accent/40 hover:bg-accentSoft active:scale-95 sm:col-span-1 sm:h-12"
      >
        Erase
      </button>
    </div>
  )
}

export default Keypad
