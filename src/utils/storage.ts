import type { Board, Difficulty } from './types'
import { ALL_DIFFICULTIES } from './types'

const STORAGE_KEY = 'sudoku-save-v1'

export interface GameSave {
  version: 1
  difficulty: Difficulty
  puzzle: Board
  solution: Board
  board: Board
  notes: number[][][]
  hints: boolean[][]
  seconds: number
  hintsUsed: number
}

function isBoard(value: unknown): value is Board {
  return (
    Array.isArray(value) &&
    value.length === 9 &&
    value.every((row) => Array.isArray(row) && row.length === 9 && row.every((v) => typeof v === 'number'))
  )
}

function isNotesGrid(value: unknown): value is number[][][] {
  return (
    Array.isArray(value) &&
    value.length === 9 &&
    value.every(
      (row) =>
        Array.isArray(row) &&
        row.length === 9 &&
        row.every((cell) => Array.isArray(cell) && cell.every((n) => typeof n === 'number')),
    )
  )
}

function isHintGrid(value: unknown): value is boolean[][] {
  return (
    Array.isArray(value) &&
    value.length === 9 &&
    value.every((row) => Array.isArray(row) && row.length === 9 && row.every((v) => typeof v === 'boolean'))
  )
}

/** Validates that parsed JSON actually matches the shape we expect before trusting it. */
function isValidSave(value: unknown): value is GameSave {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>

  return (
    v.version === 1 &&
    typeof v.difficulty === 'string' &&
    (ALL_DIFFICULTIES as string[]).includes(v.difficulty) &&
    isBoard(v.puzzle) &&
    isBoard(v.solution) &&
    isBoard(v.board) &&
    isNotesGrid(v.notes) &&
    isHintGrid(v.hints) &&
    typeof v.seconds === 'number' &&
    typeof v.hintsUsed === 'number'
  )
}

/** Persists the current game state. Fails silently (e.g. private browsing, storage disabled). */
export function saveGame(save: GameSave): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save))
  } catch {
    // Not critical if this fails - the game just won't resume after a refresh.
  }
}

/** Loads and validates a previously saved game. Returns null if none exists or it's corrupted. */
export function loadGame(): GameSave | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return isValidSave(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function clearSavedGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}