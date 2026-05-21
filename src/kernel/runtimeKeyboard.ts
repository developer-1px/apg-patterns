import { matchesApgShortcut, type KeyInput } from '../internal/keyboard'
import type { Key, PatternData, PatternDefinition, PatternEvent, PatternOptions } from '../schema'
import { evaluatePredicate, resolveEventTemplate } from './patternKernel'

interface RuntimeKeyboardInput {
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
    if (!matchesApgShortcut(input, binding.shortcut)) continue

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
