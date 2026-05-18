import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData } from '../../schema'

export function createAlertActions(runtime: PatternRuntime<PatternData>, key: Key | null): {
  dismiss(): void
} {
  return {
    dismiss: () => {
      if (key) runtime.emit({ type: 'dismiss', key })
    },
  }
}
