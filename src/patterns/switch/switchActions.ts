import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData } from '../../schema'

export function createSwitchActions(runtime: PatternRuntime<PatternData>): {
  focus(key: Key): void
  check(key: Key, checked: boolean): void
} {
  return {
    focus: (key: Key) => runtime.emit({ type: 'focus', key }),
    check: (key: Key, checked: boolean) => runtime.emit({ type: 'check', key, checked }),
  }
}
