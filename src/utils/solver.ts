import type { Board } from './types'

const SIZE = 9
const BOX_SIZE = 3

/**
 * Returns true if placing `value` at (row, col) doesn't break Sudoku rules,
 * given the board's current state (ignoring what's currently at row/col itself).
 */
export function isValidPlacement(
  board: Board,
  row: number,
  col: number,
  value: number,
): boolean {
  for (let i = 0; i < SIZE; i++) {
    if (i !== col && board[row][i] === value) return false
    if (i !== row && board[i][col] === value) return false
  }

  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE
  for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
    for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
      if ((r !== row || c !== col) && board[r][c] === value) return false
    }
  }

  return true
}

/** Finds the next empty cell (value 0). Returns null if the board is full. */
function findEmptyCell(board: Board): [number, number] | null {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (board[row][col] === 0) return [row, col]
    }
  }
  return null
}

/** Fisher-Yates shuffle. Used so generated solutions vary between calls. */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Solves the board in place via backtracking.
 * If `randomizeOrder` is true, candidate numbers are tried in random order —
 * used when generating a fresh solved board so results aren't always identical.
 * Returns true if a solution was found.
 */
export function solveBoard(board: Board, randomizeOrder = false): boolean {
  const empty = findEmptyCell(board)
  if (!empty) return true // no empty cells left -> solved

  const [row, col] = empty
  const candidates = randomizeOrder
    ? shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
    : [1, 2, 3, 4, 5, 6, 7, 8, 9]

  for (const value of candidates) {
    if (isValidPlacement(board, row, col, value)) {
      board[row][col] = value
      if (solveBoard(board, randomizeOrder)) return true
      board[row][col] = 0 // backtrack
    }
  }

  return false
}

/**
 * Counts how many solutions a board has, stopping early once `limit` is
 * reached. Used to confirm a generated puzzle has exactly one solution —
 * we don't need the exact count, just whether it's 0, 1, or "more than 1".
 */
export function countSolutions(board: Board, limit = 2): number {
  let count = 0

  function backtrack(b: Board): void {
    if (count >= limit) return

    const empty = findEmptyCell(b)
    if (!empty) {
      count++
      return
    }

    const [row, col] = empty
    for (let value = 1; value <= 9; value++) {
      if (count >= limit) return
      if (isValidPlacement(b, row, col, value)) {
        b[row][col] = value
        backtrack(b)
        b[row][col] = 0
      }
    }
  }

  // Work on a copy so the caller's board isn't mutated.
  backtrack(board.map((r) => [...r]))
  return count
}

/** Returns true if the board has exactly one solution. */
export function hasUniqueSolution(board: Board): boolean {
  return countSolutions(board, 2) === 1
}

export function solve(board: Board): Board | null {
  const copy = board.map((r) => [...r])
  return solveBoard(copy) ? copy : null
}

/** Checks whether the player's current board state has no rule violations (ignores empty cells). */
export function isBoardValid(board: Board): boolean {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const value = board[row][col]
      if (value !== 0 && !isValidPlacement(board, row, col, value)) {
        return false
      }
    }
  }
  return true
}