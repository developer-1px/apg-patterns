import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react'
import type { ListboxSelectionContext } from './listboxTypes'

export function useListboxMultiSelect({
  data,
  visibleKeys,
  selectedKeys,
  anchorKey,
  isMulti,
  onEvent,
}: ListboxSelectionContext) {
  const handleOptionClick = (event: ReactMouseEvent, key: string) => {
    if (data.state?.disabledKeys?.includes(key)) return
    if (!isMulti) return
    event.preventDefault()
    event.stopPropagation()

    if (event.shiftKey && anchorKey) {
      const range = rangeBetween(visibleKeys, anchorKey, key)
      if (range) onEvent({ type: 'select', keys: range, anchorKey, extentKey: key })
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

  const handleKeyDown = (event: ReactKeyboardEvent): boolean => {
    if (!isMulti) return false

    if ((event.ctrlKey || event.metaKey) && (event.key === 'a' || event.key === 'A')) {
      event.preventDefault()
      const allSelected = visibleKeys.length > 0 && visibleKeys.every((key) => selectedKeys.includes(key))
      onEvent({
        type: 'select',
        keys: allSelected ? [] : [...visibleKeys],
        anchorKey: visibleKeys[0] ?? null,
        extentKey: visibleKeys[visibleKeys.length - 1] ?? null,
      })
      return true
    }

    if (event.shiftKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault()
      const active = data.state?.activeKey
      if (!active) return true
      const nextKey = stepKey(visibleKeys, active, event.key === 'ArrowDown' ? 1 : -1)
      if (!nextKey) return true
      const anchor = anchorKey ?? active
      const range = rangeBetween(visibleKeys, anchor, nextKey)
      if (range) onEvent({ type: 'select', keys: range, anchorKey: anchor, extentKey: nextKey })
      return true
    }

    if (event.ctrlKey && event.shiftKey && (event.key === 'Home' || event.key === 'End')) {
      event.preventDefault()
      const active = data.state?.activeKey
      if (!active) return true
      const target = visibleKeys[event.key === 'Home' ? 0 : visibleKeys.length - 1]
      if (!target) return true
      const range = rangeBetween(visibleKeys, active, target)
      if (range) onEvent({ type: 'select', keys: range, anchorKey: active, extentKey: target })
      return true
    }

    return false
  }

  return { handleOptionClick, handleKeyDown }
}

function stepKey(keys: readonly string[], active: string, step: 1 | -1): string | null {
  const nextIndex = keys.indexOf(active) + step
  return nextIndex < 0 || nextIndex >= keys.length ? null : keys[nextIndex]!
}

function rangeBetween(keys: readonly string[], from: string, to: string): string[] | null {
  const start = keys.indexOf(from)
  const end = keys.indexOf(to)
  if (start === -1 || end === -1) return null
  const [lo, hi] = start < end ? [start, end] : [end, start]
  return keys.slice(lo, hi + 1)
}
