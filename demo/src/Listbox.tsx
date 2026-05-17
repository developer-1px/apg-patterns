import { useLayoutEffect, useRef } from 'react'
import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react'
import { createPatternRuntime, listboxDefinition, type PatternData, type PatternEvent, type PatternOptions } from '../../src'

type Props = HTMLAttributes<HTMLElement>

export interface ListboxGroup {
  groupKey: string
  groupLabel: string
  optionKeys: readonly string[]
}

export function Listbox({
  data,
  onEvent,
  options,
  groups,
  scrollable,
  ariaLabelledBy,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  /** APG grouped variant — renders role="group" wrappers around options. */
  groups?: readonly ListboxGroup[]
  /** APG scrollable variant — caps height + overflow-y. */
  scrollable?: boolean
  ariaLabelledBy?: string
}) {
  const runtime = createPatternRuntime({
    definition: listboxDefinition,
    data,
    options: { focusStrategy: 'rovingTabIndex', selectionMode: 'single', ...options },
    onEvent,
    keyToElementId: (key) => `option-${key}`,
  })

  useLayoutEffect(() => {
    const activeKey = data.state?.activeKey
    if (!activeKey) return
    document.getElementById(`option-${CSS.escape(activeKey)}`)?.focus({ preventScroll: true })
  }, [data.state?.activeKey])

  // ── Type-ahead (APG: printable character search) ──
  const typeaheadRef = useRef<{ query: string; timer: number | null }>({ query: '', timer: null })
  const visibleKeys = data.relations?.rootKeys ?? []
  const handleTypeahead = (char: string) => {
    const lower = char.toLowerCase()
    const state = typeaheadRef.current
    state.query += lower
    if (state.timer !== null) window.clearTimeout(state.timer)
    state.timer = window.setTimeout(() => {
      state.query = ''
      state.timer = null
    }, 500)
    const query = state.query
    const start = data.state?.activeKey ? visibleKeys.indexOf(data.state.activeKey) : -1
    const ordered = [...visibleKeys.slice(start + 1), ...visibleKeys.slice(0, start + 1)]
    const match = ordered.find((k) => {
      const item = data.items[k]
      const text = (item?.textValue ?? item?.label ?? '').toLowerCase()
      return text.startsWith(query)
    })
    if (match) onEvent({ type: 'focus', key: match })
  }

  // ── Multi-select click model (APG: Shift+Click = range, Ctrl/Cmd+Click = toggle) ──
  const selectionMode = options?.selectionMode ?? 'single'
  const isMulti = selectionMode === 'multiple'
  const selectedKeys = data.state?.selectedKeys ?? []
  const anchorKey = data.state?.anchorKey ?? data.state?.activeKey ?? null
  const handleOptionClick = (event: ReactMouseEvent, key: string) => {
    if (data.state?.disabledKeys?.includes(key)) return
    if (!isMulti) return // fall through to runtime click handler
    event.preventDefault()
    event.stopPropagation()
    if (event.shiftKey && anchorKey) {
      const start = visibleKeys.indexOf(anchorKey)
      const end = visibleKeys.indexOf(key)
      if (start !== -1 && end !== -1) {
        const [lo, hi] = start < end ? [start, end] : [end, start]
        const range = visibleKeys.slice(lo, hi + 1)
        onEvent({ type: 'select', keys: range, anchorKey, extentKey: key })
      }
      return
    }
    if (event.ctrlKey || event.metaKey) {
      const next = new Set(selectedKeys)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      onEvent({ type: 'select', keys: [...next], anchorKey: key, extentKey: key })
      return
    }
    onEvent({ type: 'select', keys: [key], anchorKey: key, extentKey: key })
  }

  // ── Root keyboard wrapper — adds typeahead + multi-select Shift+Arrow / Ctrl+A ──
  const rootProps = runtime.getPartProps('listbox') as Props
  const baseKeyDown = rootProps.onKeyDown as ((e: ReactKeyboardEvent) => void) | undefined
  const handleKeyDown = (event: ReactKeyboardEvent) => {
    const printable = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && /\S/.test(event.key)
    if (printable && event.key !== ' ') {
      event.preventDefault()
      handleTypeahead(event.key)
      return
    }
    if (isMulti) {
      // Ctrl/Cmd+A — select all (toggle to none if already all selected)
      if ((event.ctrlKey || event.metaKey) && (event.key === 'a' || event.key === 'A')) {
        event.preventDefault()
        const allSelected = visibleKeys.length > 0 && visibleKeys.every((k) => selectedKeys.includes(k))
        const next = allSelected ? [] : [...visibleKeys]
        onEvent({ type: 'select', keys: next, anchorKey: visibleKeys[0] ?? null, extentKey: visibleKeys[visibleKeys.length - 1] ?? null })
        return
      }
      // Shift+ArrowDown/Up — extend selection
      if (event.shiftKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
        event.preventDefault()
        const active = data.state?.activeKey
        if (!active) return
        const dir = event.key === 'ArrowDown' ? 1 : -1
        const idx = visibleKeys.indexOf(active)
        const nextIdx = idx + dir
        if (nextIdx < 0 || nextIdx >= visibleKeys.length) return
        const target = visibleKeys[nextIdx]!
        const anchor = anchorKey ?? active
        const aIdx = visibleKeys.indexOf(anchor)
        const [lo, hi] = aIdx < nextIdx ? [aIdx, nextIdx] : [nextIdx, aIdx]
        onEvent({ type: 'select', keys: visibleKeys.slice(lo, hi + 1), anchorKey: anchor, extentKey: target })
        return
      }
      // Ctrl+Shift+Home / Ctrl+Shift+End — extend to start / end
      if (event.ctrlKey && event.shiftKey && (event.key === 'Home' || event.key === 'End')) {
        event.preventDefault()
        const active = data.state?.activeKey
        if (!active) return
        const aIdx = visibleKeys.indexOf(active)
        if (aIdx === -1) return
        const target = event.key === 'Home' ? 0 : visibleKeys.length - 1
        const [lo, hi] = aIdx < target ? [aIdx, target] : [target, aIdx]
        onEvent({ type: 'select', keys: visibleKeys.slice(lo, hi + 1), anchorKey: active, extentKey: visibleKeys[target] })
        return
      }
    }
    baseKeyDown?.(event)
  }

  const renderOption = (key: string, posIndex?: number, setSize?: number) => {
    const optionProps = runtime.getPartProps('option', key) as Props
    const state = runtime.getItemState(key, 'option')
    // 멀티셀렉트일 때 runtime 의 기본 onClick(단일 select) 를 가로채 우리 핸들러로 대체.
    const onClickOverride = isMulti
      ? (event: ReactMouseEvent) => handleOptionClick(event, key)
      : (optionProps.onClick as ((event: ReactMouseEvent) => void) | undefined)
    return (
      <div
        key={key}
        {...optionProps}
        onClick={onClickOverride}
        aria-posinset={posIndex}
        aria-setsize={setSize}
        data-active={state.active ? '' : undefined}
        className="min-h-8 rounded px-2 py-1.5 text-sm text-zinc-800 outline-none aria-disabled:text-zinc-400 aria-selected:bg-zinc-100 aria-selected:text-zinc-950 data-active:bg-zinc-50 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-300 dark:aria-disabled:text-zinc-600 dark:aria-selected:bg-zinc-900 dark:aria-selected:text-zinc-50 dark:data-active:bg-zinc-900 dark:focus:outline-zinc-500"
      >
        {data.items[key]?.label}
      </div>
    )
  }

  const containerClass = [
    'grid max-w-sm gap-0.5 bg-white py-1 outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-950 dark:focus:outline-zinc-500',
    scrollable ? 'max-h-48 overflow-y-auto' : '',
  ]
    .filter(Boolean)
    .join(' ')

  if (groups && groups.length > 0) {
    const setSize = visibleKeys.length
    let runningIndex = 0
    return (
      <div {...rootProps} onKeyDown={handleKeyDown} aria-labelledby={ariaLabelledBy} className={containerClass}>
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
      </div>
    )
  }

  return (
    <div {...rootProps} onKeyDown={handleKeyDown} aria-labelledby={ariaLabelledBy} className={containerClass}>
      {visibleKeys.map((key) => renderOption(key))}
    </div>
  )
}
