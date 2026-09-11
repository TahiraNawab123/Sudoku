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
    <div className="flex min-h-screen flex-col items-center gap-6 px-4 py-8 sm:py-10">
      {/* Minimal top-right nav - small and out of the way, doesn't compete with the title */}
       <div className="flex w-full max-w-5xl justify-end gap-4 text-sm text-ink/50">        <button type="button" onClick={() => setShowLeaderboard(true)} className="hover:text-accent">
          🏆 Leaderboard
        </button>
        {auth.user ? (
          <button type="button" onClick={() => auth.signOut()} className="hover:text-accent">
            {auth.username ?? 'Account'} · Sign out
          </button>
        ) : (
          <button type="button" onClick={() => setShowAuthModal(true)} className="font-medium text-accent hover:underline">
            Sign in
          </button>
        )}
      </div>

      {/* Hero: the game's identity, front and center */}
      <header className="text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">Sudoku</h1>
        <p className="mt-1 text-sm text-ink/50">
          Click a cell, then type a number or use the keypad below.
        </p>
      </header>

      {/* Difficulty + live status, as light individual pills rather than one boxed unit */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {ALL_DIFFICULTIES.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => newGame(d)}
            className={[
              'rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors',
              d === difficulty
                ? 'border-accent bg-accent text-white shadow-sm'
                : 'border-grid/15 bg-surface text-ink/60 shadow-sm hover:border-accent/40 hover:text-ink',
            ].join(' ')}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
        <span
          className="rounded-full border border-grid/15 bg-surface px-3 py-1 font-mono tabular-nums text-ink/60 shadow-sm"
          aria-label="Elapsed time"
        >
          ⏱ {formatTime(seconds)}
        </span>
        <span
          className="inline-flex items-center gap-1 rounded-full border border-accent/20 bg-accentSoft px-3 py-1 font-medium text-accent shadow-sm"
          aria-label="Score"
        >
          ⭐ {score}
        </span>
        <span
          className={[
            'inline-flex items-center gap-1 rounded-full border px-3 py-1 font-medium shadow-sm',
            mistakes > 0 ? 'border-red-200 bg-red-50 text-red-600' : 'border-grid/15 bg-surface text-ink/50',
          ].join(' ')}
          aria-label="Mistakes"
        >
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

      {/* Action toolbar - individual light pills, matching the difficulty row's visual weight */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className={[
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            canUndo
              ? 'border-grid/15 bg-surface text-ink/70 shadow-sm hover:border-accent/40 hover:bg-accentSoft'
              : 'cursor-not-allowed border-grid/10 bg-surface/60 text-ink/30',
          ].join(' ')}
        >
          ↩ Undo
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          className={[
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            canRedo
              ? 'border-grid/15 bg-surface text-ink/70 shadow-sm hover:border-accent/40 hover:bg-accentSoft'
              : 'cursor-not-allowed border-grid/10 bg-surface/60 text-ink/30',
          ].join(' ')}
        >
          ↪ Redo
        </button>
        <button
          type="button"
          onClick={toggleNotesMode}
          aria-pressed={isNotesMode}
          className={[
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            isNotesMode
              ? 'border-accent bg-accent text-white shadow-sm'
              : 'border-grid/15 bg-surface text-ink/70 shadow-sm hover:border-accent/40 hover:bg-accentSoft',
          ].join(' ')}
        >
          ✏️ Notes {isNotesMode ? 'On' : 'Off'}
        </button>
        <button
          type="button"
          onClick={useHint}
          className="rounded-full border border-grid/15 bg-surface px-4 py-1.5 text-sm font-medium text-ink/70 shadow-sm transition-colors hover:border-accent/40 hover:bg-accentSoft"
        >
          💡 Hint {hintsUsed > 0 ? `(${hintsUsed})` : ''}
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