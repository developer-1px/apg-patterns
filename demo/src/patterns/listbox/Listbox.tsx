import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useListboxPattern, type PatternData, type PatternEvent, type PatternOptions, type ReactListboxRenderItem } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'

type ListboxGroup = {
  groupKey: string
  groupLabel: string
  optionKeys: readonly string[]
}

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
    cx('grid max-w-sm gap-0.5 rounded-md border border-zinc-200 p-1 ui-focus:outline-offset-4 dark:border-white/10', ds.focusRing),
    scrollable ? 'max-h-48 overflow-y-auto' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div {...listbox.rootProps} ref={rootRef} aria-labelledby={ariaLabelledBy} className={containerClass}>
      <ListboxContent groups={groups} visibleKeys={visibleKeys} renderOption={renderOption} />
    </div>
  )
}

function ListboxOption({
  item,
  isMulti,
  posIndex,
  setSize,
}: {
  item: ReactListboxRenderItem
  isMulti: boolean
  posIndex?: number
  setSize?: number
}) {
  return (
    <div
      key={item.key}
      {...item.optionProps}
      aria-posinset={posIndex}
      aria-setsize={setSize}
      data-active={item.state.active ? '' : undefined}
      data-multiselectable={isMulti ? '' : undefined}
      className={ds.listOption}
    >
      {item.label}
    </div>
  )
}

function ListboxContent({
  groups,
  visibleKeys,
  renderOption,
}: {
  groups: readonly ListboxGroup[]
  visibleKeys: readonly string[]
  renderOption(key: string, posIndex?: number, setSize?: number): ReactNode
}) {
  if (groups.length === 0) return <>{visibleKeys.map((key) => renderOption(key))}</>

  const setSize = visibleKeys.length
  let runningIndex = 0
  return (
    <>
      {groups.map((group) => {
        const labelId = `group-${group.groupKey}-label`
        return (
          <div key={group.groupKey} role="group" aria-labelledby={labelId} className="mt-1 first:mt-0">
            <div id={labelId} className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {group.groupLabel}
            </div>
            {group.optionKeys.map((key) => {
              runningIndex += 1
              return renderOption(key, runningIndex, setSize)
            })}
          </div>
        )
      })}
    </>
  )
}
