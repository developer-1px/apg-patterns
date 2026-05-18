import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent } from '../../schema'

export interface MenuButtonPropsInput {
  runtime: PatternRuntime
  data: PatternData
  triggerKey: Key | null
  itemKeys: readonly Key[]
  onEvent: (event: PatternEvent) => void
}
