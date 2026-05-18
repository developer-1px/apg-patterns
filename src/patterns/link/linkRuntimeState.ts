import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData } from '../../schema'

export function getLinkRuntimeState(runtime: PatternRuntime<PatternData>, key: Key | null): {
  active: boolean
  disabled: boolean
} {
  const state = key ? runtime.getItemState(key, 'link') : {}
  return {
    active: Boolean(state.active),
    disabled: Boolean(state.disabled),
  }
}
