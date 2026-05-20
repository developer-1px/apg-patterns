import { matchesShortcut, type KeyInput } from '../../internal/keyboard'
import type { Key, KeyboardBinding, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { evaluatePredicate, resolveEventTemplate } from '../../kernel/patternKernel'
import { treeviewDefinition } from './definition'

export interface ResolvedKeyboardBinding {
  preventDefault: boolean
  events: readonly PatternEvent[]
}

export function resolveTreeKeyboardBinding({
  input,
  activeKey,
  data,
  options,
  keyboard = treeviewDefinition.keyboard,
}: {
  input: KeyInput
  activeKey: Key
  data: PatternData
  options: PatternOptions
  keyboard?: readonly KeyboardBinding[]
}): ResolvedKeyboardBinding | null {
  for (const binding of keyboard) {
    if (!matchesShortcut(input, binding.shortcut)) continue
    for (const item of binding.cases) {
      if (item.case === 'otherwise' || item.case === 'always' || evaluatePredicate(item.when, { data, options, activeKey })) {
        return {
          preventDefault: binding.preventDefault ?? false,
          events: item.events.flatMap((template) => resolveEventTemplate(template, activeKey, data)),
        }
      }
    }
  }

  return null
}
