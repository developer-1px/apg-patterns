import type { Key } from '../../schema'
import type { TreeviewRuntime } from './runtime'

export function createTreeviewReactActions(runtime: TreeviewRuntime): {
  focus(key: Key): void
  select(key: Key): void
  toggle(key: Key): void
} {
  return {
    focus: (key: Key) => runtime.emit({ type: 'focus', key }),
    select: (key: Key) => runtime.emit({ type: 'select', keys: [key], anchorKey: key, extentKey: key }),
    toggle: (key: Key) => runtime.emit({ type: 'expand', key, expanded: !(runtime.data.state?.expandedKeys ?? []).includes(key) }),
  }
}
