import type { TreeviewSlotProps } from './runtime'
import type { ReactTreeviewProps } from '../../adapters/reactTypes'

export function adaptTreeviewProps(props: TreeviewSlotProps): ReactTreeviewProps {
  return props as ReactTreeviewProps
}

export function adaptTreeviewIndicatorProps(props: TreeviewSlotProps): ReactTreeviewProps {
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
  } as ReactTreeviewProps
}
