import { useButtonPattern, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src'

const buttonClass =
  'inline-flex h-8 items-center rounded-xl bg-zinc-100/80 px-3 text-sm font-medium text-zinc-800 shadow-sm outline-none transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 aria-pressed:bg-zinc-900 aria-pressed:text-white dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:bg-white/[0.08] dark:aria-pressed:bg-zinc-100 dark:aria-pressed:text-zinc-950 dark:focus-visible:outline-zinc-500'

export interface ButtonProps {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
}

export function Button({ data, onEvent, options }: ButtonProps) {
  const button = useButtonPattern(data, onEvent, options)
  if (!button.key) return null
  return (
    <button {...button.rootProps} className={buttonClass}>
      {button.label}
    </button>
  )
}
