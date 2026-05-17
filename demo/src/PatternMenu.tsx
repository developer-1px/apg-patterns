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
      className="mt-3 grid gap-1 outline-none focus:outline focus:outline-2 focus:outline-zinc-500 dark:focus:outline-zinc-400"
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
          className="h-8 rounded-md px-2 text-left text-sm text-zinc-700 aria-selected:bg-zinc-100 aria-selected:text-zinc-950 hover:bg-zinc-50 dark:text-zinc-300 dark:aria-selected:bg-zinc-800 dark:aria-selected:text-zinc-50 dark:hover:bg-zinc-900"
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
