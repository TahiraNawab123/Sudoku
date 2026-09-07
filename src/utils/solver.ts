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

/**
 * Returns a fully solved copy of the board, or null if unsolvable.
 * Does not mutate the input board.
 */
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

/** Candidate numbers (1-9) still legal for an empty cell, given the board's current state. */
function getCandidates(board: Board, row: number, col: number): Set<number> {
  const used = new Set<number>()
  for (let i = 0; i < SIZE; i++) {
    used.add(board[row][i])
    used.add(board[i][col])
  }
  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE
  for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
    for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
      used.add(board[r][c])
    }
  }

  const candidates = new Set<number>()
  for (let v = 1; v <= 9; v++) {
    if (!used.has(v)) candidates.add(v)
  }
  return candidates
}

/** All 27 units (9 rows, 9 columns, 9 boxes) as lists of [row, col] coordinates. */
function allUnits(): [number, number][][] {
  const units: [number, number][][] = []

  for (let r = 0; r < SIZE; r++) {
    units.push(Array.from({ length: SIZE }, (_, c) => [r, c]))
  }
  for (let c = 0; c < SIZE; c++) {
    units.push(Array.from({ length: SIZE }, (_, r) => [r, c]))
  }
  for (let boxRow = 0; boxRow < SIZE; boxRow += BOX_SIZE) {
    for (let boxCol = 0; boxCol < SIZE; boxCol += BOX_SIZE) {
      const cells: [number, number][] = []
      for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
        for (let c = boxCol; c < boxCol + BOX_SIZE; c++) cells.push([r, c])
      }
      units.push(cells)
    }
  }

  return units
}

/**
 * Tries to fully solve the board using only two beginner-level techniques:
 * "naked singles" (a cell has exactly one legal candidate) and "hidden singles"
 * (a candidate value fits in exactly one cell within a row/column/box). No
 * guessing or backtracking. Returns true only if this alone solves the whole
 * board - used to guarantee Beginner puzzles never require advanced deduction.
 */
export function solvableWithBasicLogic(board: Board): boolean {
  const b = board.map((r) => [...r])
  const units = allUnits()
  let progress = true

  while (progress) {
    progress = false

    // Naked singles.
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE; col++) {
        if (b[row][col] !== 0) continue
        const candidates = getCandidates(b, row, col)
        if (candidates.size === 1) {
          b[row][col] = [...candidates][0]
          progress = true
        }
      }
    }

    // Hidden singles.
    for (const unit of units) {
      for (let value = 1; value <= 9; value++) {
        const spots = unit.filter(([r, c]) => b[r][c] === 0 && getCandidates(b, r, c).has(value))
        if (spots.length === 1) {
          const [r, c] = spots[0]
          b[r][c] = value
          progress = true
        }
      }
    }
  }

  return b.every((row) => row.every((v) => v !== 0))
}