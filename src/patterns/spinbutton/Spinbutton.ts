import { createElement, type ReactNode } from 'react'
import type { Key, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useSpinbuttonPattern, type ReactSpinbuttonRenderItem, type SpinbuttonData } from './useSpinbuttonPattern'

type SpinbuttonDataItem = PatternItem & {
  valuemin?: number
  valuemax?: number
}

export interface SpinbuttonProps<TItem extends SpinbuttonDataItem = SpinbuttonDataItem> {
  data: SpinbuttonData & { items: Record<Key, TItem> }
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderSpinbutton?: (item: ReactSpinbuttonRenderItem, dataItem: TItem) => ReactNode
}

export function Spinbutton<TItem extends SpinbuttonDataItem = SpinbuttonDataItem>({ data, onEvent, options, className, renderSpinbutton }: SpinbuttonProps<TItem>) {
  const spinbutton = useSpinbuttonPattern(data, onEvent, options)

  return createElement(
    'div',
    { ...spinbutton.rootProps, className },
    spinbutton.renderItems.map((item) =>
      createElement('div', { key: item.key },
        createElement('button', item.decrementButtonProps, '-'),
        createElement('div', item.spinbuttonProps, renderSpinbutton?.(item, data.items[item.key]) ?? `${item.label} ${item.value}`),
        createElement('button', item.incrementButtonProps, '+'),
      ),
    ),
  )
}
