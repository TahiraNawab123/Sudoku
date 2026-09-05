import { useCallback, useMemo, useState } from 'react'
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
    return board.every((row) => row.every((v) => v !== 0)) && !board.some((row, r) =>
      row.some((_, c) => hasConflict(r, c)),
    )
  }, [board, hasConflict])

  const selectCell = useCallback((row: number, col: number) => {
    setSelected({ row, col })
  }, [])

  /** Writes a value (1-9) into the currently selected cell, if it's editable. */
  const setValue = useCallback(
    (value: number) => {
      if (!selected) return
      const { row, col } = selected
      if (isGiven(row, col)) return

      setBoard((prev) => {
        const next = cloneBoard(prev)
        next[row][col] = value
        return next
      })
    },
    [selected, isGiven],
  )

  /** Clears the currently selected cell, if it's editable. */
  const clearCell = useCallback(() => {
    if (!selected) return
    const { row, col } = selected
    if (isGiven(row, col)) return

    setBoard((prev) => {
      const next = cloneBoard(prev)
      next[row][col] = 0
      return next
    })
  }, [selected, isGiven])

  /** Starts a fresh puzzle, optionally at a new difficulty. */
  const newGame = useCallback((nextDifficulty: Difficulty = difficulty) => {
    const game = generatePuzzle(nextDifficulty)
    setDifficulty(nextDifficulty)
    setGame(game)
    setBoard(cloneBoard(game.puzzle))
    setSelected(null)
  }, [difficulty])

  return {
    board,
    solution,
    difficulty,
    selected,
    isGiven,
    hasConflict,
    isSolved,
    selectCell,
    setValue,
    clearCell,
    newGame,
  }
}