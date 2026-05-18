import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData } from '../../schema'

export function createRadioGroupActions(runtime: PatternRuntime<PatternData>): {
  focus(key: Key): void
  select(key: Key): void
} {
  return {
    focus: (key: Key) => runtime.emit({ type: 'focus', key }),
    select: (key: Key) => runtime.emit({ type: 'select', keys: [key], anchorKey: key, extentKey: key }),
  }
}
