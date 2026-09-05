import { useCallback, useEffect, useMemo, useState } from 'react'
import { generatePuzzle } from '../utils/generator'
import { isValidPlacement } from '../utils/solver'
import type { Board, Difficulty } from '../utils/types'

export interface CellPosition {
  row: number
  col: number
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row])
}

export function useSudoku(initialDifficulty: Difficulty = 'medium') {
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty)
  const [{ puzzle, solution }, setGame] = useState(() => generatePuzzle(initialDifficulty))
  const [board, setBoard] = useState<Board>(() => cloneBoard(puzzle))
  const [selected, setSelected] = useState<CellPosition | null>(null)

  // Undo/redo: `history` holds past board states (most recent last),
  // `future` holds states we've undone past (for redo).
  const [history, setHistory] = useState<Board[]>([])
  const [future, setFuture] = useState<Board[]>([])

  // Timer: `seconds` counts up while the puzzle isn't solved.
  // `gameId` bumps on every new game so the timer effect resets.
  const [seconds, setSeconds] = useState(0)
  const [gameId, setGameId] = useState(0)

  /** Given cells (the original clues) can never be edited or overwritten. */
  const isGiven = useCallback(
    (row: number, col: number) => puzzle[row][col] !== 0,
    [puzzle],
  )

  /** A cell "conflicts" if its value breaks Sudoku rules against the current board. */
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

  // Tick the timer every second, but stop once the puzzle is solved.
  useEffect(() => {
    setSeconds(0)
    if (isSolved) return

    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId])

  const selectCell = useCallback((row: number, col: number) => {
    setSelected({ row, col })
  }, [])

  /** Pushes the current board onto history and clears the redo stack. Call before any edit. */
  const pushHistory = useCallback((current: Board) => {
    setHistory((prev) => [...prev, current])
    setFuture([])
  }, [])

  /** Writes a value (1-9) into the currently selected cell, if it's editable. */
  const setValue = useCallback(
    (value: number) => {
      if (!selected) return
      const { row, col } = selected
      if (isGiven(row, col)) return
      if (board[row][col] === value) return // no-op, don't pollute history

      pushHistory(board)
      const next = cloneBoard(board)
      next[row][col] = value
      setBoard(next)
    },
    [selected, isGiven, board, pushHistory],
  )

  /** Clears the currently selected cell, if it's editable. */
  const clearCell = useCallback(() => {
    if (!selected) return
    const { row, col } = selected
    if (isGiven(row, col)) return
    if (board[row][col] === 0) return // already empty, no-op

    pushHistory(board)
    const next = cloneBoard(board)
    next[row][col] = 0
    setBoard(next)
  }, [selected, isGiven, board, pushHistory])

  /** Reverts to the previous board state, if any. */
  const undo = useCallback(() => {
    setHistory((prevHistory) => {
      if (prevHistory.length === 0) return prevHistory
      const last = prevHistory[prevHistory.length - 1]
      setFuture((prevFuture) => [board, ...prevFuture])
      setBoard(last)
      return prevHistory.slice(0, -1)
    })
  }, [board])

  /** Re-applies a board state that was previously undone, if any. */
  const redo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture
      const next = prevFuture[0]
      setHistory((prevHistory) => [...prevHistory, board])
      setBoard(next)
      return prevFuture.slice(1)
    })
  }, [board])

  const canUndo = history.length > 0
  const canRedo = future.length > 0

  /** Starts a fresh puzzle, optionally at a new difficulty. */
  const newGame = useCallback(
    (nextDifficulty: Difficulty = difficulty) => {
      const game = generatePuzzle(nextDifficulty)
      setDifficulty(nextDifficulty)
      setGame(game)
      setBoard(cloneBoard(game.puzzle))
      setSelected(null)
      setHistory([])
      setFuture([])
      setGameId((id) => id + 1)
    },
    [difficulty],
  )

  return {
    board,
    solution,
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
  }
}