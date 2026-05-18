import { matchesShortcut, type KeyInput } from '@interactive-os/keyboard'
import type { Key, PatternData, PatternDefinition, PatternEvent, PatternOptions } from '../schema'
import { withDefaultReason } from './domEventBindings'
import { evaluatePredicate, resolveEventTemplate } from './patternKernel'

export interface RuntimeKeyboardInput {
  definition: PatternDefinition
  data: PatternData
  options: PatternOptions
  parentByKey: ReadonlyMap<Key, Key>
  input: KeyInput
  activeKey: Key
}

export interface RuntimeKeyboardBindingResult {
  events: readonly PatternEvent[]
  preventDefault: boolean
}

export function resolveRuntimeKeyboardBinding({
  definition,
  data,
  options,
  parentByKey,
  input,
  activeKey,
}: RuntimeKeyboardInput): RuntimeKeyboardBindingResult | null {
  for (const binding of definition.keyboard) {
    if (!matchesShortcut(input, binding.shortcut)) continue

    for (const item of binding.cases) {
      const ctx = { data, options, activeKey, parentByKey }
      const matches = item.case === 'otherwise' || item.case === 'always' || evaluatePredicate(item.when, ctx)
      if (!matches) continue

      return {
        preventDefault: binding.preventDefault ?? false,
        events: item.events.flatMap((template) => resolveEventTemplate(template, activeKey, data, undefined, ctx)),
      }
    }
  }

  return null
}

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
