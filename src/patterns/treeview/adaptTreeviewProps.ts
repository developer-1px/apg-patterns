import type { SlotProps } from '../../kernel/patternRuntime'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'

export function adaptTreeviewProps(props: SlotProps): ReactPatternProps {
  return props as ReactPatternProps
}

export function adaptTreeviewIndicatorProps(props: SlotProps): ReactPatternProps {
  const reactProps = adaptTreeviewProps(props)
  const onClick = reactProps.onClick
  return {
    ...reactProps,
    type: 'button',
    tabIndex: -1,
    onClick: (event) => {
      event.stopPropagation()
      onClick?.(event)
    },
  } as ReactPatternProps
}
