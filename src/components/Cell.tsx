interface CellProps {
  value: number
  row: number
  col: number
  isGiven: boolean
  isSelected: boolean
  isPeer: boolean
  isSameValue: boolean
  hasConflict: boolean
  onSelect: (row: number, col: number) => void
}

function Cell({
  value,
  row,
  col,
  isGiven,
  isSelected,
  isPeer,
  isSameValue,
  hasConflict,
  onSelect,
}: CellProps) {
  // Thicker borders every 3 cells to mark the 3x3 boxes.
  const borderTop = row % 3 === 0 ? 'border-t-2' : 'border-t'
  const borderLeft = col % 3 === 0 ? 'border-l-2' : 'border-l'
  const borderRight = col === 8 ? 'border-r-2' : ''
  const borderBottom = row === 8 ? 'border-b-2' : ''

  let background = 'bg-paper'
  if (isSelected) background = 'bg-accent/25'
  else if (isSameValue && value !== 0) background = 'bg-accent/15'
  else if (isPeer) background = 'bg-accentSoft'

  const textColor = hasConflict
    ? 'text-red-600'
    : isGiven
      ? 'text-ink'
      : 'text-accent'

  return (
    <button
      type="button"
      onClick={() => onSelect(row, col)}
      aria-label={`Row ${row + 1}, column ${col + 1}${value ? `, value ${value}` : ', empty'}`}
      className={[
        'flex aspect-square w-full items-center justify-center',
        'font-body text-lg sm:text-xl',
        'border-grid/40 transition-colors duration-100',
        borderTop,
        borderLeft,
        borderRight,
        borderBottom,
        background,
        textColor,
        isGiven ? 'font-semibold' : 'font-normal',
      ].join(' ')}
    >
      {value !== 0 ? value : ''}
    </button>
  )
}

export default Cell