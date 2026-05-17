import { useButtonPattern, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src'

const buttonClass =
  'inline-flex h-8 items-center rounded bg-zinc-100 px-3 text-sm text-zinc-800 outline-none hover:bg-zinc-200 focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus:outline-zinc-500'

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
