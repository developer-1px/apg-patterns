import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { PatternDataWithOptions, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useWindowSplitterPattern } from './useWindowSplitterPattern'

type WindowSplitterDataItem = PatternItem & {
  content?: string
}

type DivProps = ComponentPropsWithoutRef<'div'>

export interface WindowSplitterProps<TItem extends WindowSplitterDataItem = WindowSplitterDataItem> {
  data: PatternDataWithOptions<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderControlledPane?: (item: TItem | undefined) => ReactNode
}

export function WindowSplitter<TItem extends WindowSplitterDataItem = WindowSplitterDataItem>({
  data,
  onEvent,
  options,
  className,
  renderControlledPane,
}: WindowSplitterProps<TItem>) {
  const splitter = useWindowSplitterPattern(data, onEvent, options)
  const controlledItem = splitter.controlledKey ? data.items[splitter.controlledKey] : undefined

  return createElement('div', { ...splitter.rootProps, className } as DivProps, [
    splitter.controlledKey
      ? createElement(
          'div',
          { key: 'controlled', id: splitter.ids.forKey(splitter.controlledKey) } as DivProps,
          renderControlledPane?.(controlledItem) ?? controlledItem?.content ?? controlledItem?.label,
        )
      : null,
    createElement('div', { key: 'separator', ...splitter.separatorProps } as DivProps, data.items[splitter.key ?? '']?.label ?? ''),
  ])
}
