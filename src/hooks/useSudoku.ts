import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { generatePuzzle } from '../utils/generator'
import { loadGame, saveGame } from '../utils/storage'
import type { Board, Difficulty } from '../utils/types'

export interface CellPosition {
  row: number
  col: number
}

const POINTS_PER_CORRECT_ENTRY = 145
const MAX_MISTAKES = 3

export type Notes = number[][][]

export type HintGrid = boolean[][]

interface Snapshot {
  board: Board
  notes: Notes
  hints: HintGrid
  score: number
  mistakes: number
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
  return {
    board: cloneBoard(s.board),
    notes: cloneNotes(s.notes),
    hints: cloneHints(s.hints),
    score: s.score,
    mistakes: s.mistakes,
  }
}

export function useSudoku(initialDifficulty: Difficulty = 'medium') {
  const [initial] = useState(() => {
    const saved = loadGame()
    const savedGame =
      saved &&
      typeof saved === 'object' &&
      'difficulty' in saved &&
      'puzzle' in saved &&
      'solution' in saved &&
      'board' in saved &&
      'notes' in saved &&
      'hints' in saved
        ? (saved as {
            difficulty: Difficulty
            puzzle: Board
            solution: Board
            board: Board
            notes: Notes
            hints: HintGrid
            seconds?: number
            hintsUsed?: number
            score?: number
            mistakes?: number
          })
        : null

    if (savedGame) {
      return {
        difficulty: savedGame.difficulty,
        puzzle: savedGame.puzzle,
        solution: savedGame.solution,
        board: savedGame.board,
        notes: savedGame.notes,
        hints: savedGame.hints,
        seconds: savedGame.seconds ?? 0,
        hintsUsed: savedGame.hintsUsed ?? 0,
        score: savedGame.score ?? 0,
        mistakes: savedGame.mistakes ?? 0,
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
      score: 0,
      mistakes: 0,
    }
  })

  const [difficulty, setDifficulty] = useState<Difficulty>(initial.difficulty)
  const [{ puzzle, solution }, setGame] = useState({ puzzle: initial.puzzle, solution: initial.solution })

  const [state, setState] = useState<Snapshot>({
    board: initial.board,
    notes: initial.notes,
    hints: initial.hints,
    score: initial.score,
    mistakes: initial.mistakes,
  })
  const { board, notes, hints, score, mistakes } = state

  const [selected, setSelected] = useState<CellPosition | null>(null)
  const [isNotesMode, setIsNotesMode] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(initial.hintsUsed)

  const [celebrate, setCelebrate] = useState<CellPosition | null>(null)

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

  /** A cell is "incorrect" if it's filled with a value that doesn't match the true solution. */
  const isIncorrect = useCallback(
    (row: number, col: number) => {
      const value = board[row][col]
      if (value === 0) return false
      return value !== solution[row][col]
    },
    [board, solution],
  )

  const isSolved = useMemo(() => {
    return (
      board.every((row) => row.every((v) => v !== 0)) &&
      !board.some((row, r) => row.some((_, c) => isIncorrect(r, c)))
    )
  }, [board, isIncorrect])

  const isGameOver = mistakes >= MAX_MISTAKES

  useEffect(() => {
    if (isFirstTimerRun.current) {
      isFirstTimerRun.current = false // don't reset on mount, just keep any restored time
    } else {
      setSeconds(0)
    }
    if (isSolved) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [gameId])

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

  const pushHistory = useCallback((current: Snapshot) => {
    setHistory((prev) => [...prev, current])
    setFuture([])
  }, [])

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

      setState({ board, notes: nextNotes, hints, score, mistakes })
    },
    [selected, isLocked, board, notes, hints, score, mistakes, state, pushHistory],
  )

  const setValue = useCallback(
    (value: number) => {
      if (isGameOver || isSolved) return
      if (isNotesMode) {
        toggleNote(value)
        return
      }
      if (!selected) return
      const { row, col } = selected
      if (isLocked(row, col)) return
      if (board[row][col] === value) return // no op

      pushHistory(state)
      const nextBoard = cloneBoard(board)
      nextBoard[row][col] = value
      const nextNotes = cloneNotes(notes)
      nextNotes[row][col] = [] // filling a cell clears its own pencil marks

      const isCorrect = value === solution[row][col]
      const nextScore = isCorrect ? score + POINTS_PER_CORRECT_ENTRY : score
      const nextMistakes = isCorrect ? mistakes : Math.min(mistakes + 1, MAX_MISTAKES)

      setState({ board: nextBoard, notes: nextNotes, hints, score: nextScore, mistakes: nextMistakes })
      setCelebrate(isCorrect ? { row, col } : null)
    },
    [
      isGameOver,
      isSolved,
      isNotesMode,
      toggleNote,
      selected,
      isLocked,
      board,
      notes,
      hints,
      score,
      mistakes,
      solution,
      state,
      pushHistory,
    ],
  )

  const clearCell = useCallback(() => {
    if (isGameOver || isSolved) return
    if (!selected) return
    const { row, col } = selected
    if (isLocked(row, col)) return
    if (board[row][col] === 0 && notes[row][col].length === 0) return // already empty

    pushHistory(state)
    const nextBoard = cloneBoard(board)
    nextBoard[row][col] = 0
    const nextNotes = cloneNotes(notes)
    nextNotes[row][col] = []

    setState({ board: nextBoard, notes: nextNotes, hints, score, mistakes })
    setCelebrate(null)
  }, [isGameOver, isSolved, selected, isLocked, board, notes, hints, score, mistakes, state, pushHistory])

  const useHint = useCallback(() => {
    if (isGameOver || isSolved) return
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

    setState({ board: nextBoard, notes: nextNotes, hints: nextHints, score, mistakes })
    setSelected(target)
    setHintsUsed((n) => n + 1)
    setCelebrate(target)
  }, [isGameOver, isSolved, selected, isLocked, board, notes, hints, score, mistakes, solution, state, pushHistory])

  const undo = useCallback(() => {
    if (isGameOver) return
    setHistory((prevHistory) => {
      if (prevHistory.length === 0) return prevHistory
      const last = prevHistory[prevHistory.length - 1]
      setFuture((prevFuture) => [cloneSnapshot(state), ...prevFuture])
      setState(last)
      return prevHistory.slice(0, -1)
    })
    setCelebrate(null)
  }, [isGameOver, state])

  const redo = useCallback(() => {
    if (isGameOver) return
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture
      const next = prevFuture[0]
      setHistory((prevHistory) => [...prevHistory, cloneSnapshot(state)])
      setState(next)
      return prevFuture.slice(1)
    })
    setCelebrate(null)
  }, [isGameOver, state])

  const canUndo = history.length > 0 && !isGameOver
  const canRedo = future.length > 0 && !isGameOver

  const newGame = useCallback(
    (nextDifficulty: Difficulty = difficulty) => {
      const game = generatePuzzle(nextDifficulty)
      setDifficulty(nextDifficulty)
      setGame(game)
      setState({
        board: cloneBoard(game.puzzle),
        notes: createEmptyNotes(),
        hints: createEmptyHints(),
        score: 0,
        mistakes: 0,
      })
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
    score,
    mistakes,
    maxMistakes: MAX_MISTAKES,
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
  }
}