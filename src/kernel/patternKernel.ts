/**
 * Pattern Kernel — APG 패턴의 generic 메커니즘.
 *
 * 안/밖 분리:
 *   - 안: registry + resolver 디스패치 + fallback (이 파일)
 *   - 밖: 각 패턴 정의 파일에서 자기 토큰의 resolver 를 register* 로 등록
 *
 * 등록되지 않은 토큰은 resolve 시점에 진단 에러로 throw — schema 가 enum 으로
 * 닫지 않은 대신 runtime 단일 지점에서 잡는다.
 *
 * 기본 어휘 등록은 kernelBuiltins.ts, runtime factory 는 patternRuntime.ts,
 * reducer 는 patternReducer.ts 로 분리되어 있다.
 */
import type { KeyInput } from '@interactive-os/keyboard'
import type { Key, PatternData, PatternOptions, Predicate } from '../schema'
import {
  ariaSourceRegistry,
  defineAriaSource,
  defineNavigationTarget,
  definePredicate,
  defineStateProjection,
  defineVisibleOrder,
  isRegisteredAriaSource,
  isRegisteredNavigationTarget,
  isRegisteredStateProjection,
  isRegisteredVisibleOrder,
  navigationTargetRegistry,
  predicateRegistry,
  stateProjectionRegistry,
  visibleOrderRegistry,
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
  isRegisteredStateProjection,
  isRegisteredVisibleOrder,
}
export type {
  AriaSourceResolver,
  NavigationTargetContext,
  NavigationTargetResolver,
  PredicateResolver,
  StateProjectionResolver,
  VisibleOrderResolver,
}

// KeyInput 재export — root onKeyDown handler 의 입력 형이 외부에서 보이도록.
export type { KeyInput }

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

// ─────────────────────────────────────────────────────────────
// Resolve helpers — runtime 의 분기 함수를 대체
// ─────────────────────────────────────────────────────────────

export function unknownTokenError(category: string, token: string): Error {
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

export function evaluatePredicate(predicate: Predicate, ctx: PatternRuntimeContext): boolean {
  // 핵심 결합자(not/all/any/always)는 kernel 자체가 안다 — 패턴 무관 조합기.
  if (predicate.kind === 'always') return true
  if (predicate.kind === 'not') return !evaluatePredicate(predicate.predicate, ctx)
  if (predicate.kind === 'all') return predicate.predicates.every((p) => evaluatePredicate(p, ctx))
  if (predicate.kind === 'any') return predicate.predicates.some((p) => evaluatePredicate(p, ctx))
  const resolver = predicateRegistry.get(predicate.kind)
  if (!resolver) throw unknownTokenError('predicate', predicate.kind)
  return resolver(predicate, ctx)
}

// KeyToken registry — '$key'/'$activeKey' 는 기본 등록, 패턴별($anchorKey 등)은 defineKeyToken 으로 확장.
type KeyTokenResolver = (key: Key | undefined | null, activeKey: Key | undefined | null, ctx?: PatternRuntimeContext) => Key | null | undefined
const keyTokenRegistry = new Map<string, KeyTokenResolver>([
  ['$key', (key) => key ?? null],
  ['$activeKey', (_key, activeKey) => activeKey ?? null],
  ['$anchorKey', (_key, _activeKey, ctx) => ctx?.data.state?.anchorKey ?? null],
  ['$extentKey', (_key, _activeKey, ctx) => ctx?.data.state?.extentKey ?? null],
])
export const defineKeyToken = (token: string, resolve: KeyTokenResolver) => void keyTokenRegistry.set(token, resolve)
export const hasAriaSource = isRegisteredAriaSource
export const hasKeyToken = (token: string) => keyTokenRegistry.has(token)
export const hasNavigationTarget = isRegisteredNavigationTarget
export const hasPredicate = (kind: string) => predicateRegistry.has(kind)
export const hasVisibleOrder = isRegisteredVisibleOrder

export function resolveKeyToken(token: string, key: Key | undefined | null, activeKey: Key | undefined | null, ctx?: PatternRuntimeContext): Key {
  const resolver = keyTokenRegistry.get(token)
  if (!resolver) throw unknownTokenError('keyToken', token)
  const resolved = resolver(key, activeKey, ctx)
  if (!resolved) throw new Error(`Cannot resolve key token: ${token}`)
  return resolved
}
