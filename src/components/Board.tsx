import Cell from './Cell'
import type { CellPosition, Notes } from '../hooks/useSudoku'
import type { Board as BoardType } from '../utils/types'

interface BoardProps {
  board: BoardType
  notes: Notes
  selected: CellPosition | null
  isGiven: (row: number, col: number) => boolean
  isHint: (row: number, col: number) => boolean
  isIncorrect: (row: number, col: number) => boolean
  isCelebrating: (row: number, col: number) => boolean
  onSelect: (row: number, col: number) => void
}

function isPeerOf(selected: CellPosition | null, row: number, col: number): boolean {
  if (!selected) return false
  if (selected.row === row && selected.col === col) return false

  const sameRow = selected.row === row
  const sameCol = selected.col === col
  const sameBox =
    Math.floor(selected.row / 3) === Math.floor(row / 3) &&
    Math.floor(selected.col / 3) === Math.floor(col / 3)

  return sameRow || sameCol || sameBox
}

function Board({ board, notes, selected, isGiven, isHint, isIncorrect, isCelebrating, onSelect }: BoardProps) {
  const selectedValue = selected ? board[selected.row][selected.col] : 0

  return (
    <div className="rounded-2xl bg-surface p-2.5 shadow-board sm:p-3.5">
      <div className="grid w-full max-w-[min(88vw,32rem)] grid-cols-9 border-2 border-grid/70">
        {board.map((rowValues, row) =>
          rowValues.map((value, col) => (
            <Cell
              key={`${row}-${col}`}
              value={value}
              row={row}
              col={col}
              notes={notes[row][col]}
              isGiven={isGiven(row, col)}
              isHint={isHint(row, col)}
              isSelected={selected?.row === row && selected?.col === col}
              isPeer={isPeerOf(selected, row, col)}
              isSameValue={selectedValue !== 0 && value === selectedValue}
              hasConflict={isIncorrect(row, col)}
              isCelebrating={isCelebrating(row, col)}
              onSelect={onSelect}
            />
          )),
        )}
      </div>
    </div>
  )
}

export default Board