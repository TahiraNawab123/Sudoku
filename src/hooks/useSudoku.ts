import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { generatePuzzle } from '../utils/generator'
import { isValidPlacement } from '../utils/solver'
import { loadGame, saveGame } from '../utils/storage'
import type { Board, Difficulty } from '../utils/types'

export interface CellPosition {
  row: number
  col: number
}

/** notes[row][col] is a sorted list of candidate numbers (1-9) pencilled into that cell. */
export type Notes = number[][][]

/** hints[row][col] is true if that cell's value was revealed via the Hint button. */
export type HintGrid = boolean[][]

interface Snapshot {
  board: Board
  notes: Notes
  hints: HintGrid
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row])
}

function createEmptyNotes(): Notes {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []))
}

function cloneNotes(notes: Notes): Notes {
  return notes.map((row) => row.map((cellNotes) => [...cellNotes]))
}

function createEmptyHints(): HintGrid {
  return Array.from({ length: 9 }, () => Array(9).fill(false))
}

function cloneHints(hints: HintGrid): HintGrid {
  return hints.map((row) => [...row])
}

function cloneSnapshot(s: Snapshot): Snapshot {
  return { board: cloneBoard(s.board), notes: cloneNotes(s.notes), hints: cloneHints(s.hints) }
}

export function useSudoku(initialDifficulty: Difficulty = 'medium') {
  // Computed once, on first render only: either a previously saved game, or a fresh puzzle.
  const [initial] = useState(() => {
    const saved = loadGame()
    if (saved) {
      return {
        difficulty: saved.difficulty,
        puzzle: saved.puzzle,
        solution: saved.solution,
        board: saved.board,
        notes: saved.notes,
        hints: saved.hints,
        seconds: saved.seconds,
        hintsUsed: saved.hintsUsed,
      }
    }
    const game = generatePuzzle(initialDifficulty)
    return {
      difficulty: initialDifficulty,
      puzzle: game.puzzle,
      solution: game.solution,
      board: cloneBoard(game.puzzle),
      notes: createEmptyNotes(),
      hints: createEmptyHints(),
      seconds: 0,
      hintsUsed: 0,
    }
  })

  const [difficulty, setDifficulty] = useState<Difficulty>(initial.difficulty)
  const [{ puzzle, solution }, setGame] = useState({ puzzle: initial.puzzle, solution: initial.solution })

  const [state, setState] = useState<Snapshot>({
    board: initial.board,
    notes: initial.notes,
    hints: initial.hints,
  })
  const { board, notes, hints } = state

  const [selected, setSelected] = useState<CellPosition | null>(null)
  const [isNotesMode, setIsNotesMode] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(initial.hintsUsed)

  /** The cell that most recently received a correct entry - briefly animated, then cleared. */
  const [celebrate, setCelebrate] = useState<CellPosition | null>(null)

  // Undo/redo: `history` holds past snapshots (most recent last), `future` holds undone ones.
  const [history, setHistory] = useState<Snapshot[]>([])
  const [future, setFuture] = useState<Snapshot[]>([])

  // Timer.
  const [seconds, setSeconds] = useState(initial.seconds)
  const [gameId, setGameId] = useState(0)
  const isFirstTimerRun = useRef(true)

  /** Original puzzle clues - never editable. */
  const isGiven = useCallback(
    (row: number, col: number) => puzzle[row][col] !== 0,
    [puzzle],
  )

  /** Cells revealed via the Hint button - locked just like givens. */
  const isHint = useCallback((row: number, col: number) => hints[row][col], [hints])

  const isLocked = useCallback(
    (row: number, col: number) => isGiven(row, col) || isHint(row, col),
    [isGiven, isHint],
  )

  const hasConflict = useCallback(
    (row: number, col: number) => {
      const value = board[row][col]
      if (value === 0) return false
      return !isValidPlacement(board, row, col, value)
    },
    [board],
  )

  const isSolved = useMemo(() => {
    return (
      board.every((row) => row.every((v) => v !== 0)) &&
      !board.some((row, r) => row.some((_, c) => hasConflict(r, c)))
    )
  }, [board, hasConflict])

  useEffect(() => {
    if (isFirstTimerRun.current) {
      isFirstTimerRun.current = false // don't reset on mount - keep any restored time
    } else {
      setSeconds(0)
    }
    if (isSolved) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId])

  // Auto-clear the "correct entry" celebration shortly after it starts.
  useEffect(() => {
    if (!celebrate) return
    const id = setTimeout(() => setCelebrate(null), 450)
    return () => clearTimeout(id)
  }, [celebrate])

  // Persist progress so refreshing the page resumes the same game.
  useEffect(() => {
    saveGame({
      version: 1,
      difficulty,
      puzzle,
      solution,
      board,
      notes,
      hints,
      seconds,
      hintsUsed,
    })
  }, [difficulty, puzzle, solution, board, notes, hints, seconds, hintsUsed])

  const selectCell = useCallback((row: number, col: number) => {
    setSelected({ row, col })
  }, [])

  const toggleNotesMode = useCallback(() => setIsNotesMode((v) => !v), [])

  /** Pushes the current snapshot onto history and clears the redo stack. Call before any edit. */
  const pushHistory = useCallback((current: Snapshot) => {
    setHistory((prev) => [...prev, current])
    setFuture([])
  }, [])

  /** Toggles a candidate number in the selected cell's pencil-mark notes. */
  const toggleNote = useCallback(
    (value: number) => {
      if (!selected) return
      const { row, col } = selected
      if (isLocked(row, col) || board[row][col] !== 0) return

      pushHistory(state)
      const nextNotes = cloneNotes(notes)
      const cellNotes = nextNotes[row][col]
      const idx = cellNotes.indexOf(value)
      if (idx === -1) cellNotes.push(value)
      else cellNotes.splice(idx, 1)
      cellNotes.sort((a, b) => a - b)

      setState({ board, notes: nextNotes, hints })
    },
    [selected, isLocked, board, notes, hints, state, pushHistory],
  )

  /** Writes a value (1-9) into the selected cell — or toggles a note, if notes mode is on. */
  const setValue = useCallback(
    (value: number) => {
      if (isNotesMode) {
        toggleNote(value)
        return
      }
      if (!selected) return
      const { row, col } = selected
      if (isLocked(row, col)) return
      if (board[row][col] === value) return // no-op

      pushHistory(state)
      const nextBoard = cloneBoard(board)
      nextBoard[row][col] = value
      const nextNotes = cloneNotes(notes)
      nextNotes[row][col] = [] // filling a cell clears its own pencil marks

      setState({ board: nextBoard, notes: nextNotes, hints })
      setCelebrate(value === solution[row][col] ? { row, col } : null)
    },
    [isNotesMode, toggleNote, selected, isLocked, board, notes, hints, solution, state, pushHistory],
  )

  /** Clears the selected cell's value and notes, if it's editable. */
  const clearCell = useCallback(() => {
    if (!selected) return
    const { row, col } = selected
    if (isLocked(row, col)) return
    if (board[row][col] === 0 && notes[row][col].length === 0) return // already empty

    pushHistory(state)
    const nextBoard = cloneBoard(board)
    nextBoard[row][col] = 0
    const nextNotes = cloneNotes(notes)
    nextNotes[row][col] = []

    setState({ board: nextBoard, notes: nextNotes, hints })
    setCelebrate(null)
  }, [selected, isLocked, board, notes, hints, state, pushHistory])

  /**
   * Reveals the correct value for the selected cell (or a random empty cell,
   * if nothing usable is selected), locking it like a given cell.
   */
  const useHint = useCallback(() => {
    let target = selected
    if (!target || isLocked(target.row, target.col) || board[target.row][target.col] !== 0) {
      const emptyCells: CellPosition[] = []
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c] === 0) emptyCells.push({ row: r, col: c })
        }
      }
      if (emptyCells.length === 0) return // board already full
      target = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    }

    const { row, col } = target
    pushHistory(state)
    const nextBoard = cloneBoard(board)
    nextBoard[row][col] = solution[row][col]
    const nextNotes = cloneNotes(notes)
    nextNotes[row][col] = []
    const nextHints = cloneHints(hints)
    nextHints[row][col] = true

    setState({ board: nextBoard, notes: nextNotes, hints: nextHints })
    setSelected(target)
    setHintsUsed((n) => n + 1)
    setCelebrate(target)
  }, [selected, isLocked, board, notes, hints, solution, state, pushHistory])

  const undo = useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.length === 0) return prevHistory
      const last = prevHistory[prevHistory.length - 1]
      setFuture((prevFuture) => [cloneSnapshot(state), ...prevFuture])
      setState(last)
      return prevHistory.slice(0, -1)
    })
    setCelebrate(null)
  }, [state])

  const redo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture
      const next = prevFuture[0]
      setHistory((prevHistory) => [...prevHistory, cloneSnapshot(state)])
      setState(next)
      return prevFuture.slice(1)
    })
    setCelebrate(null)
  }, [state])

  const canUndo = history.length > 0
  const canRedo = future.length > 0

  const newGame = useCallback(
    (nextDifficulty: Difficulty = difficulty) => {
      const game = generatePuzzle(nextDifficulty)
      setDifficulty(nextDifficulty)
      setGame(game)
      setState({ board: cloneBoard(game.puzzle), notes: createEmptyNotes(), hints: createEmptyHints() })
      setSelected(null)
      setIsNotesMode(false)
      setCelebrate(null)
      setHistory([])
      setFuture([])
      setHintsUsed(0)
      setGameId((id) => id + 1)
    },
    [difficulty],
  )

  const isCelebrating = useCallback(
    (row: number, col: number) => celebrate?.row === row && celebrate?.col === col,
    [celebrate],
  )

  return {
    board,
    notes,
    solution,
    difficulty,
    selected,
    seconds,
    isNotesMode,
    hintsUsed,
    isGiven,
    isHint,
    hasConflict,
    isCelebrating,
    isSolved,
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
  }
}