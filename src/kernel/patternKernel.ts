/**
 * Pattern Kernel - generic APG pattern mechanisms.
 *
 * Boundary split:
 *   - inside: registries, resolver dispatch, and fallbacks in this file
 *   - outside: each pattern definition registers its own token resolvers
 *
 * Unknown tokens fail at resolve time with diagnostic errors. The schema stays
 * extensible instead of closing every token set as an enum.
 *
 * Built-in vocabulary registration lives in kernelBuiltins.ts, runtime factory
 * logic in patternRuntime.ts, and reducer logic in patternReducer.ts.
 */
import type { KeyInput, ModifierKeyName } from '../internal/keyboard'
import type { Key, PatternData, PatternOptions, Predicate } from '../schema'
import { defineKeyToken, resolveKeyToken } from './keyTokenRegistry'
import { resolveAriaSource, resolveNavigationTarget, resolveStateProjection, resolveVisibleOrder } from './kernelResolvers'
import {
  defineAriaSource,
  defineNavigationTarget,
  definePredicate,
  defineStateProjection,
  defineVisibleOrder,
  isRegisteredAriaSource,
  isRegisteredNavigationTarget,
  isRegisteredPredicate,
  isRegisteredStateProjection,
  isRegisteredVisibleOrder,
  predicateRegistry,
  type AriaSourceResolver,
  type NavigationTargetContext,
  type NavigationTargetResolver,
  type PredicateResolver,
  type StateProjectionResolver,
  type VisibleOrderResolver,
} from './kernelRegistries'
export { resolveEventTemplate } from './patternEventTemplate'
export {
  defineAriaSource,
  defineNavigationTarget,
  definePredicate,
  defineStateProjection,
  defineVisibleOrder,
  isRegisteredAriaSource,
  isRegisteredNavigationTarget,
  isRegisteredPredicate,
  isRegisteredStateProjection,
  isRegisteredVisibleOrder,
  defineKeyToken,
  resolveKeyToken,
  resolveAriaSource,
  resolveNavigationTarget,
  resolveStateProjection,
  resolveVisibleOrder,
}
export type {
  AriaSourceResolver,
  NavigationTargetContext,
  NavigationTargetResolver,
  PredicateResolver,
  StateProjectionResolver,
  VisibleOrderResolver,
}

// Re-export KeyInput so root onKeyDown handler input is public.
export type { KeyInput, ModifierKeyName }

// ─────────────────────────────────────────────────────────────
// Resolver context
// ─────────────────────────────────────────────────────────────

export interface PatternRuntimeContext {
  data: PatternData
  options?: PatternOptions
  key?: Key
  activeKey: Key | null
  keyToElementId?: (key: Key) => string
  parentByKey?: ReadonlyMap<Key, Key>
}

export function createParentByKey(data: PatternData): ReadonlyMap<Key, Key> {
  const parentByKey = new Map<Key, Key>()
  for (const [parent, children] of Object.entries(data.relations?.childrenByKey ?? {})) {
    for (const child of children) parentByKey.set(child, parent)
  }
  return parentByKey
}

export function evaluatePredicate(predicate: Predicate, ctx: PatternRuntimeContext): boolean {
  if (predicate.kind === 'always') return true
  if (predicate.kind === 'not') return !evaluatePredicate(predicate.predicate, ctx)
  if (predicate.kind === 'all') return predicate.predicates.every((p) => evaluatePredicate(p, ctx))
  if (predicate.kind === 'any') return predicate.predicates.some((p) => evaluatePredicate(p, ctx))
  const resolver = predicateRegistry.get(predicate.kind)
  if (!resolver) throw new Error(`[apg-pattern] unknown predicate token: "${predicate.kind}" — register via definePredicate()`)
  return resolver(predicate, ctx)
}
