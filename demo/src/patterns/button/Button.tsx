import { useButtonPattern, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src/react'
import { ds } from '../../shared/designSystem'

interface ButtonProps {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
}

export function Button({ data, onEvent, options }: ButtonProps) {
  const button = useButtonPattern(data, onEvent, options)
  if (!button.key) return null
  return (
    <button {...button.rootProps} className={ds.button}>
      {button.label}
    </button>
  )
}
