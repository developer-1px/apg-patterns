import type { Key, PatternData } from '../schema'
import {
  ariaSourceRegistry,
  navigationTargetRegistry,
  stateProjectionRegistry,
  visibleOrderRegistry,
  type NavigationTargetContext,
} from './kernelRegistries'
import type { PatternRuntimeContext } from './patternKernel'

function unknownTokenError(category: string, token: string): Error {
  return new Error(`[apg-pattern] unknown ${category} token: "${token}" — register via define${category[0].toUpperCase()}${category.slice(1)}()`)
}

export function resolveAriaSource(name: string, ctx: PatternRuntimeContext): unknown {
  const resolver = ariaSourceRegistry.get(name)
  if (!resolver) throw unknownTokenError('ariaSource', name)
  return resolver(ctx)
}

export function resolveStateProjection(from: string, ctx: PatternRuntimeContext): unknown {
  const resolver = stateProjectionRegistry.get(from)
  if (!resolver) throw unknownTokenError('stateProjection', from)
  return resolver(ctx)
}

export function resolveVisibleOrder(visibleOrder: { kind: string } & Record<string, unknown>, data: PatternData): readonly Key[] {
  const resolver = visibleOrderRegistry.get(visibleOrder.kind)
  if (!resolver) throw unknownTokenError('visibleOrder', visibleOrder.kind)
  return resolver(visibleOrder, data)
}

export function resolveNavigationTarget(
  target: { kind: string; key?: string } & Record<string, unknown>,
  ctx: NavigationTargetContext,
): Key | null {
  const resolver = navigationTargetRegistry.get(target.kind)
  if (!resolver) throw unknownTokenError('navigationTarget', target.kind)
  return resolver(target, ctx)
}
