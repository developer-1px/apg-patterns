import { patternItems, type PatternKey } from './patterns'

export function PatternMenu({ value, onChange }: { value: PatternKey; onChange: (value: PatternKey) => void }) {
  const index = patternItems.findIndex((item) => item.key === value)
  const move = (delta: number) => {
    const next = patternItems[Math.max(0, Math.min(patternItems.length - 1, index + delta))]
    if (next) onChange(next.key)
  }

  return (
    <div
      role="listbox"
      aria-label="APG patterns"
      aria-activedescendant={`pattern-${value}`}
      tabIndex={0}
      className="mt-3 grid gap-0.5 outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:focus:outline-zinc-500"
      onKeyDown={(event) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          move(1)
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault()
          move(-1)
        }
        if (event.key === 'Home') {
          event.preventDefault()
          onChange(patternItems[0].key)
        }
        if (event.key === 'End') {
          event.preventDefault()
          onChange(patternItems[patternItems.length - 1].key)
        }
      }}
    >
      {patternItems.map((item) => (
        <button
          id={`pattern-${item.key}`}
          key={item.key}
          type="button"
          role="option"
          aria-selected={item.key === value}
          className="h-7 rounded px-2 text-left text-sm text-zinc-500 hover:bg-zinc-100 aria-selected:bg-zinc-900 aria-selected:text-white dark:text-zinc-500 dark:hover:bg-zinc-900 dark:aria-selected:bg-zinc-100 dark:aria-selected:text-zinc-950"
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
