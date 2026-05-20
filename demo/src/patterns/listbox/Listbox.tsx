import { useLayoutEffect, useRef } from 'react'
import { useListboxPattern, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src'
import { cx, ds } from '../../shared/designSystem'
import { ListboxContent } from './ListboxContent'
import { ListboxOption } from './ListboxOption'
import type { ListboxGroup } from './listboxTypes'

export function Listbox({
  data,
  onEvent,
  options,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
}) {
  const groups = (data.state?.groups as readonly ListboxGroup[] | undefined) ?? []
  const scrollable = data.state?.scrollable === true
  const ariaLabelledBy = typeof data.refs?.labelledBy === 'string' ? data.refs.labelledBy : undefined
  const listbox = useListboxPattern(data, onEvent, options)
  const rootRef = useRef<HTMLDivElement>(null)
  const selectionMode = options?.selectionMode ?? 'single'
  const isMulti = selectionMode === 'multiple'
  const renderItemsByKey = new Map(listbox.renderItems.map((item) => [item.key, item]))
  const visibleKeys = listbox.renderItems.map((item) => item.key)
  const activeKey = listbox.state.activeKey

  useLayoutEffect(() => {
    if (!scrollable || !activeKey) return
    const root = rootRef.current
    const active = document.getElementById(listbox.keyToElementId(activeKey))
    if (!root || !active || !root.contains(active)) return
    if (typeof active.scrollIntoView !== 'function') return
    active.scrollIntoView({ block: 'nearest' })
  }, [activeKey, listbox.keyToElementId, scrollable])

  const renderOption = (key: string, posIndex?: number, setSize?: number) => {
    const item = renderItemsByKey.get(key)
    if (!item) return null
    return (
      <ListboxOption
        key={key}
        item={item}
        isMulti={isMulti}
        posIndex={posIndex}
        setSize={setSize}
      />
    )
  }

  const containerClass = [
    cx('grid max-w-sm gap-0.5 rounded-xl bg-white/82 p-1 shadow-[0_12px_32px_rgba(24,24,27,0.06)] ui-focus:outline-offset-4 dark:bg-white/[0.045] dark:shadow-black/20', ds.focusRing),
    scrollable ? 'max-h-48 overflow-y-auto' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div {...listbox.rootProps} ref={rootRef} aria-labelledby={ariaLabelledBy} className={containerClass}>
      <ListboxContent data={data} groups={groups} visibleKeys={visibleKeys} renderOption={renderOption} />
    </div>
  )
}
