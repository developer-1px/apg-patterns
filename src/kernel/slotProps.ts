import type { AriaProjection, FocusProjection } from '../schema'
import { evaluatePredicate, resolveAriaSource, type PatternRuntimeContext } from './patternKernel'
import type { SlotProps } from './patternRuntime'

export function resolveAriaProjections(projections: readonly AriaProjection[], ctx: PatternRuntimeContext): SlotProps {
  const out: SlotProps = {}
  for (const projection of projections) {
    if (projection.when && !evaluatePredicate(projection.when, ctx)) continue
    const value = resolveAriaSource(projection.from, ctx)
    // Suppress only undefined; explicit ARIA false values must still be emitted.
    if (value !== undefined) out[projection.attribute] = value
  }
  return out
}

export function resolveFocusProjection(focus: FocusProjection | undefined, ctx: PatternRuntimeContext): SlotProps {
  if (!focus?.tabIndex || !evaluatePredicate(focus.tabIndex.when, ctx)) return {}
  const active = ctx.key != null && ctx.activeKey === ctx.key
  const value = focus.tabIndex.value ?? (active ? focus.tabIndex.active : focus.tabIndex.inactive)
  return value === undefined ? {} : { tabIndex: value }
}

export function compactProps(props: SlotProps): SlotProps {
  return Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined))
}
