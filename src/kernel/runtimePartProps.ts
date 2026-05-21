import type { AriaProjection, FocusProjection, Key, PatternData, PatternDefinition, PatternEvent } from '../schema'
import type { SlotProps } from './patternRuntime'
import { resolvePartEventBindings } from './domEventBindings'
import { evaluatePredicate, resolveAriaSource, type PatternRuntimeContext } from './patternKernel'

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

function resolveAriaProjections(projections: readonly AriaProjection[], ctx: PatternRuntimeContext): SlotProps {
  const out: SlotProps = {}
  for (const projection of projections) {
    if (projection.when && !evaluatePredicate(projection.when, ctx)) continue
    const value = resolveAriaSource(projection.from, ctx)
    // Suppress only undefined; explicit ARIA false values must still be emitted.
    if (value !== undefined) out[projection.attribute] = value
  }
  return out
}

function resolveFocusProjection(focus: FocusProjection | undefined, ctx: PatternRuntimeContext): SlotProps {
  if (!focus?.tabIndex || !evaluatePredicate(focus.tabIndex.when, ctx)) return {}
  const active = ctx.key != null && ctx.activeKey === ctx.key
  const value = focus.tabIndex.value ?? (active ? focus.tabIndex.active : focus.tabIndex.inactive)
  return value === undefined ? {} : { tabIndex: value }
}

function compactProps(props: SlotProps): SlotProps {
  return Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined))
}
