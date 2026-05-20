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
import type { KeyInput, ModifierKeyName } from '../internal/keyboard'
import type { Key, PatternData, PatternOptions } from '../schema'
import { defineKeyToken, hasKeyToken, resolveKeyToken } from './keyTokenRegistry'
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
  hasKeyToken,
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

// KeyInput 재export — root onKeyDown handler 의 입력 형이 외부에서 보이도록.
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

export const hasAriaSource = isRegisteredAriaSource
export const hasNavigationTarget = isRegisteredNavigationTarget
export const hasPredicate = (kind: string) => isRegisteredPredicate(kind)
export const hasVisibleOrder = isRegisteredVisibleOrder
