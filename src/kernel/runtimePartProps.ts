import type { Key, PatternData, PatternDefinition, PatternEvent } from '../schema'
import type { SlotProps } from './patternRuntime'
import { resolvePartEventBindings } from './domEventBindings'
import type { PatternRuntimeContext } from './patternKernel'
import { compactProps, resolveAriaProjections, resolveFocusProjection } from './slotProps'

export function resolveRuntimePartProps({
  definition,
  data,
  partName,
  key,
  keyToElementId,
  context,
  emit,
  getRootKeyboardHandler,
}: {
  definition: PatternDefinition
  data: PatternData
  partName: string
  key?: Key
  keyToElementId(key: Key): string
  context(key?: Key): PatternRuntimeContext
  emit(event: PatternEvent): void
  getRootKeyboardHandler(): SlotProps['onKeyDown']
}): SlotProps {
  const part = definition.parts[partName]
  if (!part) throw new Error(`[apg-pattern] unknown part "${partName}" in definition "${definition.apgPattern}"`)
  if (key !== undefined && !(key in data.items)) throw new Error(`Unknown item key: ${key}`)
  const ctx = context(key)
  const isRoot = part.role === definition.rootRole && key === undefined
  const props: SlotProps = {
    role: part.role,
    ...(key !== undefined ? { id: keyToElementId(key) } : {}),
    ...resolveAriaProjections(part.aria ?? [], ctx),
    ...resolveFocusProjection(part.focus, ctx),
    ...resolvePartEventBindings(part.events ?? [], ctx, emit),
    ...(isRoot ? { onKeyDown: getRootKeyboardHandler() } : {}),
  }
  return compactProps(props)
}
