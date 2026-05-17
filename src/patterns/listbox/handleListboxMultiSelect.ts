import type { Key } from '../../schema'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { ReactPatternProps } from '../../adapters/reactTypes'

export function handleListboxMultiClick(runtime: PatternRuntime, key: Key, event: Parameters<NonNullable<ReactPatternProps['onClick']>>[0]): boolean {
  if (runtime.options.selectionMode !== 'multiple') return false
  if (runtime.data.state?.disabledKeys?.includes(key)) return true
  event.preventDefault()
  event.stopPropagation()

  const visibleKeys = runtime.visibleKeys
  const selectedKeys = runtime.data.state?.selectedKeys ?? []
  const anchorKey = runtime.data.state?.anchorKey ?? runtime.data.state?.activeKey ?? null

  if (event.shiftKey && anchorKey) {
    const range = rangeBetween(visibleKeys, anchorKey, key)
    if (range) runtime.emit({ type: 'select', keys: range, anchorKey, extentKey: key })
    return true
  }

  if (event.ctrlKey || event.metaKey) {
    const next = new Set(selectedKeys)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    runtime.emit({ type: 'select', keys: [...next], anchorKey: key, extentKey: key })
    return true
  }

  runtime.emit({ type: 'select', keys: [key], anchorKey: key, extentKey: key })
  return true
}

export function handleListboxMultiKeyDown(runtime: PatternRuntime, event: Parameters<NonNullable<ReactPatternProps['onKeyDown']>>[0]): boolean {
  if (runtime.options.selectionMode !== 'multiple') return false

  const visibleKeys = runtime.visibleKeys
  const selectedKeys = runtime.data.state?.selectedKeys ?? []
  const anchorKey = runtime.data.state?.anchorKey ?? runtime.data.state?.activeKey ?? null

  if ((event.ctrlKey || event.metaKey) && (event.key === 'a' || event.key === 'A')) {
    event.preventDefault()
    const allSelected = visibleKeys.length > 0 && visibleKeys.every((key) => selectedKeys.includes(key))
    runtime.emit({
      type: 'select',
      keys: allSelected ? [] : [...visibleKeys],
      anchorKey: visibleKeys[0] ?? null,
      extentKey: visibleKeys[visibleKeys.length - 1] ?? null,
    })
    return true
  }

  if (event.shiftKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
    event.preventDefault()
    const active = runtime.data.state?.activeKey
    if (!active) return true
    const nextKey = stepKey(visibleKeys, active, event.key === 'ArrowDown' ? 1 : -1)
    if (!nextKey) return true
    const anchor = anchorKey ?? active
    const range = rangeBetween(visibleKeys, anchor, nextKey)
    if (range) runtime.emit({ type: 'select', keys: range, anchorKey: anchor, extentKey: nextKey })
    return true
  }

  if (event.ctrlKey && event.shiftKey && (event.key === 'Home' || event.key === 'End')) {
    event.preventDefault()
    const active = runtime.data.state?.activeKey
    if (!active) return true
    const target = visibleKeys[event.key === 'Home' ? 0 : visibleKeys.length - 1]
    if (!target) return true
    const range = rangeBetween(visibleKeys, active, target)
    if (range) runtime.emit({ type: 'select', keys: range, anchorKey: active, extentKey: target })
    return true
  }

  return false
}

function stepKey(keys: readonly Key[], active: Key, step: 1 | -1): Key | null {
  const nextIndex = keys.indexOf(active) + step
  return nextIndex < 0 || nextIndex >= keys.length ? null : keys[nextIndex]!
}

function rangeBetween(keys: readonly Key[], from: Key, to: Key): Key[] | null {
  const start = keys.indexOf(from)
  const end = keys.indexOf(to)
  if (start === -1 || end === -1) return null
  const [lo, hi] = start < end ? [start, end] : [end, start]
  return keys.slice(lo, hi + 1)
}
