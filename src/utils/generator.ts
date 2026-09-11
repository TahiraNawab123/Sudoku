import { hasUniqueSolution, solvableWithBasicLogic, solveBoard } from './solver'
import { DIFFICULTY_CLUES, type Board, type Difficulty, type Puzzle } from './types'

const SIZE = 9
const TOTAL_CELLS = SIZE * SIZE

function createEmptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
}

function shuffledIndices(): number[] {
  const indices = Array.from({ length: TOTAL_CELLS }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
}

export function generateSolvedBoard(): Board {
  const board = createEmptyBoard()
  solveBoard(board, true) // randomizeOrder=true so results vary between calls
  return board
}


function carvePuzzle(solved: Board, targetClues: number): Board {
  const puzzle = solved.map((row) => [...row])
  let cluesRemaining = TOTAL_CELLS

  for (const index of shuffledIndices()) {
    if (cluesRemaining <= targetClues) break

    const row = Math.floor(index / SIZE)
    const col = index % SIZE
    if (puzzle[row][col] === 0) continue

    const backup = puzzle[row][col]
    puzzle[row][col] = 0

    if (hasUniqueSolution(puzzle)) {
      cluesRemaining--
    } else {
      puzzle[row][col] = backup // removing this cell created ambiguity, put it back
    }
  }

  return puzzle
}

/**
 * Same as carvePuzzle, but additionally requires that the puzzle remain
 * solvable using only basic logic (naked/hidden singles) after every
 * removal - guaranteeing a genuinely beginner-friendly puzzle with no
 * guessing required anywhere, even if that means keeping a few extra clues
 * beyond the target.
 */
function carvePuzzleLogical(solved: Board, targetClues: number): Board {
  const puzzle = solved.map((row) => [...row])
  let cluesRemaining = TOTAL_CELLS

  for (const index of shuffledIndices()) {
    if (cluesRemaining <= targetClues) break

    const row = Math.floor(index / SIZE)
    const col = index % SIZE
    if (puzzle[row][col] === 0) continue

    const backup = puzzle[row][col]
    puzzle[row][col] = 0

    if (hasUniqueSolution(puzzle) && solvableWithBasicLogic(puzzle)) {
      cluesRemaining--
    } else {
      puzzle[row][col] = backup
    }
  }

  return puzzle
}

/** Generates a new puzzle (and its solution) for the given difficulty. */
export function generatePuzzle(difficulty: Difficulty): Puzzle {
  const solution = generateSolvedBoard()
  const targetClues = DIFFICULTY_CLUES[difficulty]
  const puzzle =
    difficulty === 'beginner'
      ? carvePuzzleLogical(solution, targetClues)
      : carvePuzzle(solution, targetClues)

  return { puzzle, solution, difficulty }
}