import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData } from '../../schema'

export function createTooltipActions(runtime: PatternRuntime<PatternData>, triggerKey: Key | null): {
  open(): void
  close(): void
} {
  return {
    open: () => {
      if (triggerKey) runtime.emit({ type: 'expand', key: triggerKey, expanded: true })
    },
    close: () => {
      if (triggerKey) runtime.emit({ type: 'expand', key: triggerKey, expanded: false })
    },
  }
}
