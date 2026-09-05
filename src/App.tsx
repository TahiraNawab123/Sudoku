import { useEffect } from 'react'
import Board from './components/Board'
import Keypad from './components/Keypad'
import { useSudoku } from './hooks/useSudoku'
import { formatTime } from './utils/formatTime'
import type { Difficulty } from './utils/types'

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert']

function App() {
  const {
    board,
    difficulty,
    selected,
    seconds,
    isGiven,
    hasConflict,
    isSolved,
    canUndo,
    canRedo,
    selectCell,
    setValue,
    clearCell,
    undo,
    redo,
    newGame,
  } = useSudoku('medium')

  // Physical keyboard support: 1-9 to fill, Backspace/Delete/0 to clear,
  // Ctrl/Cmd+Z to undo, Ctrl/Cmd+Shift+Z (or Ctrl+Y) to redo.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isModifierHeld = e.metaKey || e.ctrlKey

      if (isModifierHeld && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        return
      }
      if (isModifierHeld && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
        return
      }

      if (e.key >= '1' && e.key <= '9') {
        setValue(Number(e.key))
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        clearCell()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setValue, clearCell, undo, redo])

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 px-4 py-10">
      <header className="text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
          Sudoku
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Click a cell, then type a number or use the keypad below.
        </p>
      </header>

      <div className="flex items-center gap-4">
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

        <span className="font-mono text-sm tabular-nums text-ink/60" aria-label="Elapsed time">
          ⏱ {formatTime(seconds)}
        </span>
      </div>

      <Board
        board={board}
        selected={selected}
        isGiven={isGiven}
        hasConflict={hasConflict}
        onSelect={selectCell}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className={[
            'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
            canUndo
              ? 'border-grid/30 text-ink/70 hover:border-accent hover:bg-accentSoft'
              : 'cursor-not-allowed border-grid/10 text-ink/20',
          ].join(' ')}
        >
          ↩ Undo
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          className={[
            'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
            canRedo
              ? 'border-grid/30 text-ink/70 hover:border-accent hover:bg-accentSoft'
              : 'cursor-not-allowed border-grid/10 text-ink/20',
          ].join(' ')}
        >
          ↪ Redo
        </button>
      </div>

      <Keypad board={board} onNumber={setValue} onErase={clearCell} />

      {isSolved && (
        <p className="font-display text-xl font-semibold text-accent">
          🎉 Solved in {formatTime(seconds)}! Nice work.
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