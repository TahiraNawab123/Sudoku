/**
 * A Sudoku board is a 9x9 grid. Empty cells are represented by 0.
 */
export type Board = number[][]

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'

/** Number of filled (given) cells removed for each difficulty. Out of 81 total cells. */
export const DIFFICULTY_CLUES: Record<Difficulty, number> = {
  easy: 40, // 40 clues left on the board
  medium: 32,
  hard: 28,
  expert: 24,
}

export interface Puzzle {
  /** The puzzle as shown to the player, 0 = empty cell. */
  puzzle: Board
  /** The fully solved board, used for validation/hints. */
  solution: Board
  difficulty: Difficulty
}