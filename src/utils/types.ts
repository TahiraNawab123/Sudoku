/**
 * A Sudoku board is a 9x9 grid. Empty cells are represented by 0.
 */
export type Board = number[][]

export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'

/** Single source of truth for difficulty order, used by every UI that lists difficulties. */
export const ALL_DIFFICULTIES: Difficulty[] = ['beginner', 'easy', 'medium', 'hard', 'expert']

/** Number of filled (given) cells removed for each difficulty. Out of 81 total cells. */
export const DIFFICULTY_CLUES: Record<Difficulty, number> = {
  beginner: 50, // very easy, most of the board already filled in
  easy: 40,
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

/** Points awarded for each correct entry. */
export const POINTS_PER_CORRECT = 145

/** Number of wrong entries allowed before the game ends. */
export const MAX_MISTAKES = 3