interface CellProps {
  value: number
  row: number
  col: number
  notes: number[]
  isGiven: boolean
  isHint: boolean
  isSelected: boolean
  isPeer: boolean
  isSameValue: boolean
  isIncorrect: boolean
  isCelebrating: boolean
  onSelect: (row: number, col: number) => void
}

function Cell({
  value,
  row,
  col,
  notes,
  isGiven,
  isHint,
  isSelected,
  isPeer,
  isSameValue,
  isIncorrect,
  isCelebrating,
  onSelect,
}: CellProps) {
  // Thicker, medium-gray borders mark the 3x3 boxes; thin, faint borders mark individual cells.
  const borderTop = row % 3 === 0 ? 'border-t-2 border-t-grid/50' : 'border-t border-t-grid/12'
  const borderLeft = col % 3 === 0 ? 'border-l-2 border-l-grid/50' : 'border-l border-l-grid/12'
  const borderRight = col === 8 ? 'border-r-2 border-r-grid/50' : ''
  const borderBottom = row === 8 ? 'border-b-2 border-b-grid/50' : ''

  let background = 'bg-surface'
  if (isSelected) background = 'bg-accent/25'
  else if (isSameValue && value !== 0) background = 'bg-accent/15'
  else if (isPeer) background = 'bg-accentSoft'

  const textColor = isIncorrect
    ? 'text-red-600'
    : isHint
      ? 'text-blue-600'
      : isGiven
        ? 'text-ink'
        : 'text-accent'

  return (
    <button
      type="button"
      onClick={() => onSelect(row, col)}
      aria-label={`Row ${row + 1}, column ${col + 1}${value ? `, value ${value}` : ', empty'}`}
      className={[
        'relative flex aspect-square w-full items-center justify-center',
        'font-body text-xl sm:text-3xl',
        'transition-colors duration-100',
        borderTop,
        borderLeft,
        borderRight,
        borderBottom,
        background,
        textColor,
        isGiven || isHint ? 'font-semibold' : 'font-normal',
        isCelebrating ? 'z-10 animate-cellPop ring-2 ring-inset ring-accent' : '',
      ].join(' ')}
    >
      {value !== 0 ? (
        value
      ) : notes.length > 0 ? (
        <span className="grid h-full w-full grid-cols-3 grid-rows-3 p-0.5">
          {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
            <span
              key={n}
              className="flex items-center justify-center text-[10px] leading-none text-ink/45 sm:text-xs"
            >
              {notes.includes(n) ? n : ''}
            </span>
          ))}
        </span>
      ) : null}
    </button>
  )
}

export default Cell