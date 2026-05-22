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
import type { EventTemplate, Key, PatternData, PatternEvent, PatternOptions, Predicate } from '../schema'
import {
  ariaSourceRegistry,
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
  navigationTargetRegistry,
  predicateRegistry,
  stateProjectionRegistry,
  type AriaSourceResolver,
  type NavigationTargetContext,
  type NavigationTargetResolver,
  type PredicateResolver,
  type StateProjectionResolver,
  type VisibleOrderResolver,
  visibleOrderRegistry,
} from './kernelRegistries'
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
  resolveEventTemplate,
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

type KeyTokenResolver = (key: Key | undefined | null, activeKey: Key | undefined | null, ctx?: PatternRuntimeContext) => Key | null | undefined

const keyTokenRegistry = new Map<string, KeyTokenResolver>([
  ['$key', (key) => key ?? null],
  ['$activeKey', (_key, activeKey) => activeKey ?? null],
  ['$anchorKey', (_key, _activeKey, ctx) => ctx?.data.state?.anchorKey ?? null],
  ['$extentKey', (_key, _activeKey, ctx) => ctx?.data.state?.extentKey ?? null],
])

const defineKeyToken = (token: string, resolve: KeyTokenResolver) => void keyTokenRegistry.set(token, resolve)

function resolveKeyToken(token: string, key: Key | undefined | null, activeKey: Key | undefined | null, ctx?: PatternRuntimeContext): Key {
  const resolver = keyTokenRegistry.get(token)
  if (!resolver) throw new Error(`[apg-pattern] unknown keyToken token: "${token}" — register via defineKeyToken()`)
  const resolved = resolver(key, activeKey, ctx)
  if (!resolved) throw new Error(`Cannot resolve key token: ${token}`)
  return resolved
}

function unknownTokenError(category: string, token: string): Error {
  return new Error(`[apg-pattern] unknown ${category} token: "${token}" — register via define${category[0].toUpperCase()}${category.slice(1)}()`)
}

function resolveAriaSource(name: string, ctx: PatternRuntimeContext): unknown {
  const resolver = ariaSourceRegistry.get(name)
  if (!resolver) throw unknownTokenError('ariaSource', name)
  return resolver(ctx)
}

function resolveStateProjection(from: string, ctx: PatternRuntimeContext): unknown {
  const resolver = stateProjectionRegistry.get(from)
  if (!resolver) throw unknownTokenError('stateProjection', from)
  return resolver(ctx)
}

function resolveVisibleOrder(visibleOrder: { kind: string } & Record<string, unknown>, data: PatternData): readonly Key[] {
  const resolver = visibleOrderRegistry.get(visibleOrder.kind)
  if (!resolver) throw unknownTokenError('visibleOrder', visibleOrder.kind)
  return resolver(visibleOrder, data)
}

function resolveNavigationTarget(
  target: { kind: string; key?: string } & Record<string, unknown>,
  ctx: NavigationTargetContext,
): Key | null {
  const resolver = navigationTargetRegistry.get(target.kind)
  if (!resolver) throw unknownTokenError('navigationTarget', target.kind)
  return resolver(target, ctx)
}

function resolveEventTemplate(
  template: EventTemplate,
  activeKey: Key,
  data: PatternData,
  keyContext?: Key,
  ctx?: PatternRuntimeContext,
): readonly PatternEvent[] {
  if (template.type === 'navigate') return [{ type: 'navigate', direction: template.direction }]
  if (template.type === 'selectAll') return [{ type: 'selectAll' }]
  if (template.type === 'selectColumn') return [{ type: 'selectColumn' }]
  if (template.type === 'selectRow') return [{ type: 'selectRow' }]
  if (template.type === 'extendSelection') return [{ type: 'extendSelection', direction: template.direction }]
  if (template.type === 'expandActiveRow') return [{ type: 'expandActiveRow', expanded: template.expanded }]
  if (template.type === 'inputValue') {
    const key = template.key ? resolveKeyToken(template.key, keyContext, activeKey, ctx) : undefined
    return [{ type: 'inputValue', ...(key ? { key } : {}), value: template.value ?? '', ...(template.inline !== undefined ? { inline: template.inline } : {}) }]
  }
  if (template.type === 'commitValue') {
    const key = template.key ? resolveKeyToken(template.key, keyContext, activeKey, ctx) : undefined
    return [{ type: 'commitValue', ...(key ? { key } : {}), value: template.value ?? '' }]
  }
  if (template.type === 'typeahead') return [{ type: 'typeahead', query: template.query }]
  if (template.type === 'dismiss') {
    const key = template.key ? resolveKeyToken(template.key, keyContext, activeKey, ctx) : undefined
    return [{ type: 'dismiss', ...(key ? { key } : {}) }]
  }
  if (template.type === 'reorder') {
    const key = template.key ? resolveKeyToken(template.key, keyContext, activeKey, ctx) : undefined
    return [{ type: 'reorder', ...(key ? { key } : {}), keys: template.keys }]
  }
  if (template.type === 'remove') {
    const key = template.key ? resolveKeyToken(template.key, keyContext, activeKey, ctx) : undefined
    return [{ type: 'remove', ...(key ? { key } : {}), keys: template.keys, activeKey: template.activeKey, selectedKeys: template.selectedKeys }]
  }
  if (template.type === 'editEnd') {
    const key = template.key ? resolveKeyToken(template.key, keyContext, activeKey, ctx) : undefined
    return [{ type: 'editEnd', ...(key ? { key } : {}) }]
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
  if (template.type === 'valueStep') return [{ type: 'valueStep', key, direction: template.direction }]
  if (template.type === 'collapse') return [{ type: 'collapse', key }]
  if (template.type === 'close') return [{ type: 'close', key }]
  if (template.type === 'sort') return [{ type: 'sort', key, sort: template.sort }]
  if (template.type === 'editStart') return [{ type: 'editStart', key, ...(template.value !== undefined ? { value: template.value } : {}) }]
  if (template.type === 'editDraft') return [{ type: 'editDraft', key, value: template.value }]
  return []
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
