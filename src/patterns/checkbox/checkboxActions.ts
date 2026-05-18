import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData } from '../../schema'

export function createCheckboxActions(runtime: PatternRuntime<PatternData>): {
  focus(key: Key): void
  check(key: Key, checked: boolean | 'mixed'): void
} {
  return {
    focus: (key: Key) => runtime.emit({ type: 'focus', key }),
    check: (key: Key, checked: boolean | 'mixed') => runtime.emit({ type: 'check', key, checked }),
  }
}
