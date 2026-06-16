import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import type { ReactSpinbuttonRenderItem, SpinbuttonData } from './spinbuttonRenderItem'
import { useSpinbuttonPattern } from './useSpinbuttonPattern'

type SpinbuttonDataItem = PatternItem & {
  valuemin?: number
  valuemax?: number
}

type DivProps = ComponentPropsWithoutRef<'div'>

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
    { ...spinbutton.rootProps, className } as DivProps,
    spinbutton.renderItems.map((item) =>
      createElement('div', { key: item.key } as DivProps & { key: Key }, [
        createElement('button', { key: `${item.key}-decrement`, ...item.decrementButtonProps } as ComponentPropsWithoutRef<'button'>, '-'),
        createElement('div', { key: `${item.key}-spinbutton`, ...item.spinbuttonProps } as DivProps, renderSpinbutton?.(item, data.items[item.key]) ?? `${item.label} ${item.value}`),
        createElement('button', { key: `${item.key}-increment`, ...item.incrementButtonProps } as ComponentPropsWithoutRef<'button'>, '+'),
      ]),
    ),
  )
}
