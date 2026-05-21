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
import type { Key, PatternData, PatternOptions } from '../schema'
import { defineKeyToken, resolveKeyToken } from './keyTokenRegistry'
import { resolveAriaSource, resolveNavigationTarget, resolveStateProjection, resolveVisibleOrder, unknownTokenError } from './kernelResolvers'
import { evaluatePredicate } from './predicateEvaluation'
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
  type AriaSourceResolver,
  type NavigationTargetContext,
  type NavigationTargetResolver,
  type PredicateResolver,
  type StateProjectionResolver,
  type VisibleOrderResolver,
} from './kernelRegistries'
export { resolveEventTemplate } from './patternEventTemplate'
export { createParentByKey } from './patternRelations'
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
  unknownTokenError,
  evaluatePredicate,
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
