import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import type { Key } from '../../schema'
import { rangeBetween } from './listboxMultiSelectionRange'

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
