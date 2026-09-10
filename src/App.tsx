import { useEffect, useRef, useState } from 'react'
import Board from './components/Board'
import GameOverModal from './components/GameOverModal'
import Keypad from './components/Keypad'
import WinModal from './components/WinModal'
import AuthModal from './components/AuthModal'
import LeaderboardModal from './components/LeaderboardModal'
import { useSudoku } from './hooks/useSudoku'
import { useAuth } from './hooks/useAuth'
import { submitScore } from './utils/leaderboard'
import { formatTime } from './utils/formatTime'
import { ALL_DIFFICULTIES } from './utils/types'

function App() {
  const {
    board,
    notes,
    difficulty,
    selected,
    seconds,
    isNotesMode,
    hintsUsed,
    score,
    mistakes,
    maxMistakes,
    isGiven,
    isHint,
    isIncorrect,
    isCelebrating,
    isSolved,
    isGameOver,
    canUndo,
    canRedo,
    selectCell,
    setValue,
    clearCell,
    toggleNotesMode,
    useHint,
    undo,
    redo,
    newGame,
  } = useSudoku('medium')

  const auth = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const hasSubmittedRef = useRef(false)

  // Automatically submit the score to the leaderboard once, right when a puzzle is solved
  // (only if the person is logged in). Resets whenever a new puzzle starts.
  useEffect(() => {
    if (!isSolved) {
      hasSubmittedRef.current = false
      setSubmitStatus('idle')
      return
    }
    if (hasSubmittedRef.current || !auth.user) return

    hasSubmittedRef.current = true
    setSubmitStatus('submitting')
    submitScore({
      userId: auth.user.id,
      difficulty,
      score,
      timeSeconds: seconds,
      mistakes,
    }).then((result) => {
      setSubmitStatus(result.error ? 'error' : 'done')
    })
  }, [isSolved, auth.user, difficulty, score, seconds, mistakes])

  // Physical keyboard support: 1-9 to fill/note, Backspace/Delete/0 to clear,
  // Ctrl/Cmd+Z to undo, Ctrl/Cmd+Shift+Z (or Ctrl+Y) to redo, N to toggle notes mode.
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
      if (!isModifierHeld && e.key.toLowerCase() === 'n') {
        toggleNotesMode()
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
  }, [setValue, clearCell, undo, redo, toggleNotesMode])

  return (
    <div className="flex min-h-screen flex-col items-center gap-5 px-4 py-6 sm:py-10">
      {/* Slim top bar: identity on the left, account/leaderboard on the right */}
      <div className="flex w-full max-w-2xl items-center justify-between">
        <h1 className="font-display text-lg font-semibold text-ink">Sudoku</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLeaderboard(true)}
            className="rounded-full px-3 py-1.5 text-sm text-ink/60 hover:bg-accentSoft hover:text-ink"
          >
            🏆 Leaderboard
          </button>
          {auth.user ? (
            <button
              type="button"
              onClick={() => auth.signOut()}
              className="rounded-full px-3 py-1.5 text-sm text-ink/60 hover:bg-accentSoft hover:text-ink"
            >
              {auth.username ?? 'Account'} · Sign out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent/90"
            >
              Sign in
            </button>
          )}
        </div>
      </div>

      {/* Difficulty: a true segmented control, sized to its content, not stretched */}
      <div className="inline-flex rounded-full border border-grid/10 bg-surface p-1 shadow-toolbar">
        {ALL_DIFFICULTIES.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => newGame(d)}
            className={[
              'rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors sm:px-4',
              d === difficulty ? 'bg-accent text-white' : 'text-ink/60 hover:text-ink',
            ].join(' ')}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Live game status, grouped as one unit rather than scattered */}
      <div className="flex items-center gap-4 rounded-full border border-grid/10 bg-surface px-5 py-2 text-sm shadow-toolbar sm:gap-6">
        <span className="flex items-center gap-1.5 font-mono tabular-nums text-ink/70" aria-label="Elapsed time">
          ⏱ {formatTime(seconds)}
        </span>
        <span className="h-4 w-px bg-grid/15" aria-hidden="true" />
        <span className="flex items-center gap-1.5 font-medium text-ink/70" aria-label="Score">
          ⭐ {score}
        </span>
        <span className="h-4 w-px bg-grid/15" aria-hidden="true" />
        <span className="flex items-center gap-1.5 font-medium text-ink/70" aria-label="Mistakes">
          ❌ {mistakes}/{maxMistakes}
        </span>
      </div>

      <Board
        board={board}
        notes={notes}
        selected={selected}
        isGiven={isGiven}
        isHint={isHint}
        isIncorrect={isIncorrect}
        isCelebrating={isCelebrating}
        onSelect={selectCell}
      />

      {/* Compact action toolbar - visually secondary to the keypad below it */}
      <div className="flex items-center gap-1 rounded-2xl border border-grid/10 bg-surface p-1.5 shadow-toolbar">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          title="Undo"
          className={[
            'flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-colors',
            canUndo ? 'text-ink/70 hover:bg-accentSoft' : 'cursor-not-allowed text-ink/20',
          ].join(' ')}
        >
          ↩ <span className="hidden sm:inline">Undo</span>
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          title="Redo"
          className={[
            'flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-colors',
            canRedo ? 'text-ink/70 hover:bg-accentSoft' : 'cursor-not-allowed text-ink/20',
          ].join(' ')}
        >
          ↪ <span className="hidden sm:inline">Redo</span>
        </button>
        <button
          type="button"
          onClick={toggleNotesMode}
          aria-pressed={isNotesMode}
          title="Notes"
          className={[
            'flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-colors',
            isNotesMode ? 'bg-accent text-white' : 'text-ink/70 hover:bg-accentSoft',
          ].join(' ')}
        >
          ✏️ <span className="hidden sm:inline">Notes</span>
        </button>
        <button
          type="button"
          onClick={useHint}
          title="Hint"
          className="flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-ink/70 transition-colors hover:bg-accentSoft"
        >
          💡 <span className="hidden sm:inline">Hint{hintsUsed > 0 ? ` (${hintsUsed})` : ''}</span>
        </button>
      </div>

      <Keypad board={board} onNumber={setValue} onErase={clearCell} />

      {isSolved && !isGameOver && (
        <WinModal
          seconds={seconds}
          difficulty={difficulty}
          hintsUsed={hintsUsed}
          onNewGame={newGame}
          isLoggedIn={Boolean(auth.user)}
          submitStatus={submitStatus}
          onSignIn={() => setShowAuthModal(true)}
        />
      )}

      {isGameOver && (
        <GameOverModal
          seconds={seconds}
          difficulty={difficulty}
          score={score}
          mistakes={mistakes}
          maxMistakes={maxMistakes}
          onNewGame={newGame}
        />
      )}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {showLeaderboard && (
        <LeaderboardModal
          initialDifficulty={difficulty}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  )
}

export default App