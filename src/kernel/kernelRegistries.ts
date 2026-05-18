import type { Key, PatternData, Predicate } from '../schema'
import type { PatternRuntimeContext } from './patternKernel'

export type AriaSourceResolver = (ctx: PatternRuntimeContext) => unknown
export type StateProjectionResolver = (ctx: PatternRuntimeContext) => unknown
export type PredicateResolver = (predicate: Predicate, ctx: PatternRuntimeContext) => boolean
export type VisibleOrderResolver = (visibleOrder: { kind: string } & Record<string, unknown>, data: PatternData) => readonly Key[]
export interface NavigationTargetContext {
  activeKey: Key
  data: PatternData
  parentByKey: ReadonlyMap<Key, Key>
  visibleKeys: readonly Key[]
}
export type NavigationTargetResolver = (
  target: { kind: string; key?: string } & Record<string, unknown>,
  ctx: NavigationTargetContext,
) => Key | null

export const ariaSourceRegistry = new Map<string, AriaSourceResolver>()
export const stateProjectionRegistry = new Map<string, StateProjectionResolver>()
export const predicateRegistry = new Map<string, PredicateResolver>()
export const visibleOrderRegistry = new Map<string, VisibleOrderResolver>()
export const navigationTargetRegistry = new Map<string, NavigationTargetResolver>()

function warnDuplicate(category: string, name: string, existing: unknown, incoming: unknown) {
  if (existing && existing !== incoming) {
    // eslint-disable-next-line no-console
    console.warn(`[apg-pattern] ${category} "${name}" is being re-registered with a different resolver — possible vocabulary fragmentation. Choose one canonical implementation.`)
  }
}

export const defineAriaSource = (name: string, resolve: AriaSourceResolver) => {
  warnDuplicate('ariaSource', name, ariaSourceRegistry.get(name), resolve)
  ariaSourceRegistry.set(name, resolve)
}
export const defineStateProjection = (from: string, resolve: StateProjectionResolver) => {
  warnDuplicate('stateProjection', from, stateProjectionRegistry.get(from), resolve)
  stateProjectionRegistry.set(from, resolve)
}
export const definePredicate = (kind: string, resolve: PredicateResolver) => {
  warnDuplicate('predicate', kind, predicateRegistry.get(kind), resolve)
  predicateRegistry.set(kind, resolve)
}
export const defineVisibleOrder = (kind: string, resolve: VisibleOrderResolver) => {
  warnDuplicate('visibleOrder', kind, visibleOrderRegistry.get(kind), resolve)
  visibleOrderRegistry.set(kind, resolve)
}
export const defineNavigationTarget = (kind: string, resolve: NavigationTargetResolver) => {
  warnDuplicate('navigationTarget', kind, navigationTargetRegistry.get(kind), resolve)
  navigationTargetRegistry.set(kind, resolve)
}

export const isRegisteredAriaSource = (name: string) => ariaSourceRegistry.has(name)
export const isRegisteredStateProjection = (from: string) => stateProjectionRegistry.has(from)
export const isRegisteredPredicate = (kind: string) => predicateRegistry.has(kind)
export const isRegisteredVisibleOrder = (kind: string) => visibleOrderRegistry.has(kind)
export const isRegisteredNavigationTarget = (kind: string) => navigationTargetRegistry.has(kind)
