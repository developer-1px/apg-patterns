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
import type { EventTemplate, Key, PatternData, PatternEvent, PatternOptions, Predicate } from '../schema'

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
  target: { kind: string; key?: '$key' | '$activeKey' } & Record<string, unknown>,
  ctx: NavigationTargetContext,
) => Key | null

// ─────────────────────────────────────────────────────────────
// Registries
// ─────────────────────────────────────────────────────────────

const ariaSourceRegistry = new Map<string, AriaSourceResolver>()
const stateProjectionRegistry = new Map<string, StateProjectionResolver>()
const predicateRegistry = new Map<string, PredicateResolver>()
const visibleOrderRegistry = new Map<string, VisibleOrderResolver>()
const navigationTargetRegistry = new Map<string, NavigationTargetResolver>()

// ─────────────────────────────────────────────────────────────
// Define API — 패턴은 자기 토큰을 자기 정의 옆에서 등록한다.
// ─────────────────────────────────────────────────────────────

// 동일 이름으로 "다른" resolver 가 등록되면 fragmentation 경고.
// 같은 함수 객체로 재등록(HMR / 모듈 재평가)은 silent pass.
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

// Registry 상태를 schema refinement 가 조회할 수 있도록 노출.
export const isRegisteredAriaSource = (name: string) => ariaSourceRegistry.has(name)
export const isRegisteredStateProjection = (from: string) => stateProjectionRegistry.has(from)
export const isRegisteredVisibleOrder = (kind: string) => visibleOrderRegistry.has(kind)
export const isRegisteredNavigationTarget = (kind: string) => navigationTargetRegistry.has(kind)

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
  target: { kind: string; key?: '$key' | '$activeKey' } & Record<string, unknown>,
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
  if (predicate.kind === 'extension') {
    const resolver = predicateRegistry.get(predicate.name)
    if (!resolver) throw unknownTokenError('predicate', predicate.name)
    return resolver(predicate, ctx)
  }
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

// ─────────────────────────────────────────────────────────────
// Event template + parent map — generic
// ─────────────────────────────────────────────────────────────

export function resolveEventTemplate(
  template: EventTemplate,
  activeKey: Key,
  data: PatternData,
  keyContext?: Key,
  ctx?: PatternRuntimeContext,
): readonly PatternEvent[] {
  if (template.type === 'navigate') return [{ type: 'navigate', direction: template.direction }]
  if (template.type === 'typeahead') return [{ type: 'typeahead', query: template.query }]
  if (template.type === 'dismiss') {
    const key = template.key ? resolveKeyToken(template.key, keyContext, activeKey, ctx) : undefined
    return [{ type: 'dismiss', ...(key ? { key } : {}) }]
  }
  if (template.type === 'extension') {
    const key = template.key ? resolveKeyToken(template.key, keyContext, activeKey, ctx) : undefined
    return [{ type: 'extension', name: template.name, ...(key ? { key } : {}), ...(template.payload ? { payload: template.payload } : {}) }]
  }
  const key = resolveKeyToken(template.key, keyContext, activeKey, ctx)
  if (template.type === 'focus') return [{ type: 'focus', key }]
  if (template.type === 'activate') return [{ type: 'activate', key }]
  if (template.type === 'select') return [{ type: 'select', keys: [key], anchorKey: key, extentKey: key }]
  if (template.type === 'expand') {
    const expanded = template.expanded ?? !(data.state?.expandedKeys?.includes(key) ?? false)
    return [{ type: 'expand', key, expanded }]
  }
  if (template.type === 'check') return [{ type: 'check', key, checked: template.checked ?? true }]
  if (template.type === 'press') return [{ type: 'press', key, pressed: template.pressed }]
  if (template.type === 'value') return [{ type: 'value', key, value: template.value }]
  return []
}

export function createParentByKey(data: PatternData): ReadonlyMap<Key, Key> {
  const parentByKey = new Map<Key, Key>()
  for (const [parent, children] of Object.entries(data.relations?.childrenByKey ?? {})) {
    for (const child of children) parentByKey.set(child, parent)
  }
  return parentByKey
}
