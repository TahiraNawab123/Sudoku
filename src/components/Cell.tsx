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
  
  const borderTop = row % 3 === 0 ? 'border-t-2' : 'border-t'
  const borderLeft = col % 3 === 0 ? 'border-l-2' : 'border-l'
  const borderRight = col === 8 ? 'border-r-2' : ''
  const borderBottom = row === 8 ? 'border-b-2' : ''

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
        'font-body text-xl sm:text-2xl lg:text-[1.7rem]',
        'border-grid/25 transition-colors duration-100',
        borderTop,
        borderLeft,
        borderRight,
        borderBottom,
        background,
        textColor,

        isGiven || isHint ? 'font-medium' : 'font-normal',
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
