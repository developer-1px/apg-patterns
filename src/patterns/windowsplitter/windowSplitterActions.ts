import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternValueStepDirection } from '../../schema'

export function createWindowSplitterActions({
  key,
  runtime,
}: {
  key: Key | null
  runtime: PatternRuntime<PatternData>
}): {
  focus(): void
  step(direction: PatternValueStepDirection): void
  collapse(): void
} {
  return {
    focus: () => {
      if (key) runtime.emit({ type: 'focus', key })
    },
    step: (direction: PatternValueStepDirection) => {
      if (key) runtime.emit({ type: 'valueStep', key, direction })
    },
    collapse: () => {
      if (key) runtime.emit({ type: 'collapse', key })
    },
  }
}
