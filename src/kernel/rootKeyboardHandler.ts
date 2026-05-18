import type { KeyInput } from '@interactive-os/keyboard'
import type { Key, PatternData, PatternEvent } from '../schema'
import { withDefaultReason } from './domEventBindings'
import type { RuntimeKeyboardBindingResult } from './runtimeKeyboard'

export interface RootKeyboardHandlerInput {
  data: PatternData
  visibleKeys: readonly Key[]
  emit: (event: PatternEvent) => void
  resolveKeyboardBinding: (input: KeyInput, activeKey: Key) => RuntimeKeyboardBindingResult | null
}

export function createRootKeyboardHandler({ data, visibleKeys, emit, resolveKeyboardBinding }: RootKeyboardHandlerInput) {
  return (event: KeyInput & { preventDefault?: () => void }) => {
    const active = data.state?.activeKey ?? visibleKeys[0]
    if (!active) return

    const result = resolveKeyboardBinding(event, active)
    if (!result) return

    if (result.preventDefault) event.preventDefault?.()
    for (const next of result.events) emit(withDefaultReason(next, 'keyboard'))
  }
}
