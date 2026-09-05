import { useEffect } from 'react'
import Board from './components/Board'
import { useSudoku } from './hooks/useSudoku'
import type { Difficulty } from './utils/types'

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert']

function App() {
  const {
    board,
    difficulty,
    selected,
    isGiven,
    hasConflict,
    isSolved,
    selectCell,
    setValue,
    clearCell,
    newGame,
  } = useSudoku('medium')

  // Physical keyboard support: 1-9 to fill, Backspace/Delete/0 to clear.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key >= '1' && e.key <= '9') {
        setValue(Number(e.key))
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        clearCell()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setValue, clearCell])

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 px-4 py-10">
      <header className="text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
          Sudoku
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Click a cell, then type a number (1–9) on your keyboard.
        </p>
      </header>

      <div className="flex gap-2">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => newGame(d)}
            className={[
              'rounded-full border px-4 py-1.5 text-sm capitalize transition-colors',
              d === difficulty
                ? 'border-accent bg-accent text-white'
                : 'border-grid/30 bg-paper text-ink/70 hover:border-accent/50',
            ].join(' ')}
          >
            {d}
          </button>
        ))}
      </div>

      <Board
        board={board}
        selected={selected}
        isGiven={isGiven}
        hasConflict={hasConflict}
        onSelect={selectCell}
      />

      {isSolved && (
        <p className="font-display text-xl font-semibold text-accent">
          🎉 Solved! Nice work.
        </p>
      )}

      <button
        type="button"
        onClick={() => newGame()}
        className="text-sm text-ink/60 underline underline-offset-4 hover:text-accent"
      >
        New game
      </button>
    </div>
  )
}

export default App