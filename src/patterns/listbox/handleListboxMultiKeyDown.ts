import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { withDefaultReason } from '../../kernel/domEventBindings'
import { rangeBetween, stepKey } from './listboxMultiSelectionRange'

export function handleListboxMultiKeyDown(runtime: PatternRuntime, event: Parameters<NonNullable<ReactPatternProps['onKeyDown']>>[0]): boolean {
  if (runtime.options.selectionMode !== 'multiple') return false

  const visibleKeys = runtime.visibleKeys
  const selectedKeys = runtime.data.state?.selectedKeys ?? []
  const anchorKey = runtime.data.state?.anchorKey ?? runtime.data.state?.activeKey ?? null

  if ((event.ctrlKey || event.metaKey) && (event.key === 'a' || event.key === 'A')) {
    event.preventDefault()
    const allSelected = visibleKeys.length > 0 && visibleKeys.every((key) => selectedKeys.includes(key))
    runtime.emit(withDefaultReason({
      type: 'select',
      keys: allSelected ? [] : [...visibleKeys],
      anchorKey: visibleKeys[0] ?? null,
      extentKey: visibleKeys[visibleKeys.length - 1] ?? null,
    }, 'keyboard'))
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
    if (range) runtime.emit(withDefaultReason({ type: 'select', keys: range, anchorKey: anchor, extentKey: nextKey }, 'keyboard'))
    return true
  }

  if (event.ctrlKey && event.shiftKey && (event.key === 'Home' || event.key === 'End')) {
    event.preventDefault()
    const active = runtime.data.state?.activeKey
    if (!active) return true
    const target = visibleKeys[event.key === 'Home' ? 0 : visibleKeys.length - 1]
    if (!target) return true
    const range = rangeBetween(visibleKeys, active, target)
    if (range) runtime.emit(withDefaultReason({ type: 'select', keys: range, anchorKey: active, extentKey: target }, 'keyboard'))
    return true
  }

  return false
}
