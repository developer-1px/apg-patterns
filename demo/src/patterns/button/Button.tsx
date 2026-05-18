import { useButtonPattern, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src'
import { ds } from '../../shared/designSystem'

const buttonClass = ds.button

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
