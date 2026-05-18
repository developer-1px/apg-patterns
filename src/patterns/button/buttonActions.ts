import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData } from '../../schema'

export function createButtonActions(runtime: PatternRuntime<PatternData>, key: Key | null): {
  focus(): void
  press(pressed: boolean): void
  activate(): void
} {
  return {
    focus: () => {
      if (key) runtime.emit({ type: 'focus', key })
    },
    press: (nextPressed: boolean) => {
      if (key) runtime.emit({ type: 'press', key, pressed: nextPressed })
    },
    activate: () => {
      if (key) runtime.emit({ type: 'activate', key })
    },
  }
}
