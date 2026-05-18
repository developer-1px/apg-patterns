import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData } from '../../schema'

export function createLinkActions(runtime: PatternRuntime<PatternData>, key: Key | null): {
  activate(): void
} {
  return {
    activate: () => {
      if (key) runtime.emit({ type: 'activate', key })
    },
  }
}
