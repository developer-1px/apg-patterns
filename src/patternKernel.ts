/**
 * Pattern Kernel — APG 패턴의 generic 메커니즘.
 *
 * 안/밖 분리:
 *   - 안: registry + resolver 디스패치 + fallback (이 파일)
 *   - 밖: 각 패턴 정의 파일에서 자기 토큰의 resolver 를 register* 로 등록
 *
 * 등록되지 않은 토큰은 resolve 시점에 진단 에러로 throw — schema 가 enum 으로 닫지 않은 대신
 * runtime 단일 지점에서 잡는다.
 */
import type { KeyInput } from '@interactive-os/keyboard'
import { PatternDataSchema, PatternOptionsSchema, type Key, type PatternData, type PatternEvent, type PatternOptions, type Predicate } from './schema'
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

// 중복 등록 감지 — 동일 이름으로 "다른" resolver 가 등록되면 fragmentation 경고.
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
// — 정의 parse 시점에 미등록 토큰을 차단해 LLM 발명 fragmentation 의 1차 방어선.
export const isRegisteredAriaSource = (name: string) => ariaSourceRegistry.has(name)
export const isRegisteredStateProjection = (from: string) => stateProjectionRegistry.has(from)
export const isRegisteredVisibleOrder = (kind: string) => visibleOrderRegistry.has(kind)
export const isRegisteredNavigationTarget = (kind: string) => navigationTargetRegistry.has(kind)

// ─────────────────────────────────────────────────────────────
// Resolve helpers — runtime 의 분기 함수를 대체
// ─────────────────────────────────────────────────────────────

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

export function dispatchNavigationTarget(
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
    // {kind:'extension', name:'foo'} 는 definePredicate('foo', …) 으로 등록된 resolver 를 찾는다.
    // prefix 없는 lookup — 등록 키와 발화 키 모양이 일치하도록.
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

export function resolveKeyToken(token: string, key: Key | undefined | null, activeKey: Key | undefined | null, ctx?: PatternRuntimeContext): Key {
  const resolver = keyTokenRegistry.get(token)
  if (!resolver) throw unknownTokenError('keyToken', token)
  const resolved = resolver(key, activeKey, ctx)
  if (!resolved) throw new Error(`Cannot resolve key token: ${token}`)
  return resolved
}

// ─────────────────────────────────────────────────────────────
// Kernel 기본 어휘 등록 — 패턴 무관 공통 토큰
// (특정 패턴(treeview)만 쓰는 토큰은 각 패턴 정의 파일에서 등록)
// ─────────────────────────────────────────────────────────────

// AriaSource — common
defineAriaSource('refs.label', (ctx) => ctx.data.refs?.label)
defineAriaSource('refs.labelledBy', (ctx) => ctx.data.refs?.labelledBy)
defineAriaSource('options.orientation', (ctx) => ctx.options?.orientation)
defineAriaSource('options.selectionMode.multiple', (ctx) => (ctx.options?.selectionMode === 'multiple' ? true : undefined))
defineAriaSource('state.activeKey.elementId', (ctx) => (ctx.activeKey && ctx.keyToElementId ? ctx.keyToElementId(ctx.activeKey) : undefined))
defineAriaSource('items.label', (ctx) => (ctx.key ? ctx.data.items[ctx.key]?.label : undefined))
defineAriaSource('items.labelledBy', (ctx) => (ctx.key ? ctx.data.items[ctx.key]?.labelledBy : undefined))
defineAriaSource('relations.controlsByKey', (ctx) => {
  const controlledKey = ctx.key ? ctx.data.relations?.controlsByKey?.[ctx.key]?.[0] : undefined
  return controlledKey ? (ctx.keyToElementId?.(controlledKey) ?? controlledKey) : undefined
})
defineAriaSource('relations.ownerByKey', (ctx) => {
  const ownerKey = ctx.key ? ctx.data.relations?.ownerByKey?.[ctx.key] : undefined
  return ownerKey ? (ctx.keyToElementId?.(ownerKey) ?? ownerKey) : undefined
})
// aria-selected 는 ARIA spec 상 selectable 항목에서 explicit true/false 가 요구된다.
// key 가 없으면 undefined (root part 에는 attribute 자체 미발화), 있으면 boolean.
defineAriaSource('state.selectedKeys', (ctx) => (ctx.key ? ctx.data.state?.selectedKeys?.includes(ctx.key) ?? false : undefined))
// aria-disabled 는 omit-when-false 가 표준 — 비활성일 때만 true.
defineAriaSource('state.disabledKeys', (ctx) => (ctx.key && ctx.data.state?.disabledKeys?.includes(ctx.key)) || undefined)
defineAriaSource('state.expandedKeys', (ctx) => (ctx.key ? ctx.data.state?.expandedKeys?.includes(ctx.key) ?? false : undefined))
defineAriaSource('state.checkedByKey', (ctx) => (ctx.key ? ctx.data.state?.checkedByKey?.[ctx.key] : undefined))
defineAriaSource('state.pressedByKey', (ctx) => (ctx.key ? ctx.data.state?.pressedByKey?.[ctx.key] : undefined))
defineAriaSource('state.currentByKey', (ctx) => (ctx.key ? ctx.data.state?.currentByKey?.[ctx.key] : undefined))
defineAriaSource('state.invalidByKey', (ctx) => (ctx.key ? ctx.data.state?.invalidByKey?.[ctx.key] : undefined))
defineAriaSource('state.requiredKeys', (ctx) => (ctx.key && ctx.data.state?.requiredKeys?.includes(ctx.key)) || undefined)
defineAriaSource('state.busyKeys', (ctx) => (ctx.key && ctx.data.state?.busyKeys?.includes(ctx.key)) || undefined)
defineAriaSource('state.modalKeys', (ctx) => (ctx.key && ctx.data.state?.modalKeys?.includes(ctx.key)) || undefined)
defineAriaSource('state.levelByKey', (ctx) => (ctx.key ? ctx.data.state?.levelByKey?.[ctx.key] : undefined))
defineAriaSource('state.posInSetByKey', (ctx) => (ctx.key ? ctx.data.state?.posInSetByKey?.[ctx.key] : undefined))
defineAriaSource('state.setSizeByKey', (ctx) => (ctx.key ? ctx.data.state?.setSizeByKey?.[ctx.key] : undefined))
defineAriaSource('state.rowIndexByKey', (ctx) => (ctx.key ? ctx.data.state?.rowIndexByKey?.[ctx.key] : undefined))
defineAriaSource('state.columnIndexByKey', (ctx) => (ctx.key ? ctx.data.state?.columnIndexByKey?.[ctx.key] : undefined))
defineAriaSource('state.sortByKey', (ctx) => (ctx.key ? ctx.data.state?.sortByKey?.[ctx.key] : undefined))
defineAriaSource('state.valueByKey', (ctx) => (ctx.key ? ctx.data.state?.valueByKey?.[ctx.key] : undefined))
defineAriaSource('state.rangeValueByKey.min', (ctx) => (ctx.key ? ctx.data.state?.rangeValueByKey?.[ctx.key]?.min : undefined))
defineAriaSource('state.rangeValueByKey.max', (ctx) => (ctx.key ? ctx.data.state?.rangeValueByKey?.[ctx.key]?.max : undefined))
defineAriaSource('state.rangeValueByKey.now', (ctx) => (ctx.key ? ctx.data.state?.rangeValueByKey?.[ctx.key]?.now : undefined))
defineAriaSource('state.rangeValueByKey.text', (ctx) => (ctx.key ? ctx.data.state?.rangeValueByKey?.[ctx.key]?.text : undefined))

// StateProjection — common
defineStateProjection('state.activeKey', (ctx) => ctx.key != null && ctx.activeKey === ctx.key)
defineStateProjection('state.selectedKeys', (ctx) => (ctx.key ? ctx.data.state?.selectedKeys?.includes(ctx.key) ?? false : false))
defineStateProjection('state.disabledKeys', (ctx) => (ctx.key ? ctx.data.state?.disabledKeys?.includes(ctx.key) ?? false : false))
defineStateProjection('state.expandedKeys', (ctx) => (ctx.key ? ctx.data.state?.expandedKeys?.includes(ctx.key) ?? false : false))
defineStateProjection('state.checkedByKey', (ctx) => (ctx.key ? ctx.data.state?.checkedByKey?.[ctx.key] : undefined))
defineStateProjection('state.pressedByKey', (ctx) => (ctx.key ? ctx.data.state?.pressedByKey?.[ctx.key] : undefined))
defineStateProjection('state.currentByKey', (ctx) => (ctx.key ? ctx.data.state?.currentByKey?.[ctx.key] : undefined))
defineStateProjection('state.valueByKey', (ctx) => (ctx.key ? ctx.data.state?.valueByKey?.[ctx.key] : undefined))

// Predicate — common leaf kinds
definePredicate('hasActiveKey', (_p, ctx) => Boolean(ctx.activeKey))
definePredicate('optionEquals', (p, ctx) => {
  if (p.kind !== 'optionEquals') return false
  // PatternOptionsSchema 가 passthrough — 임의 옵션 이름을 직접 record 접근.
  return (ctx.options as Record<string, unknown> | undefined)?.[p.option] === p.value
})
definePredicate('hasChildren', (p, ctx) => {
  if (p.kind !== 'hasChildren') return false
  const key = resolveKeyToken(p.key, ctx.key, ctx.activeKey)
  return (ctx.data.relations?.childrenByKey?.[key]?.length ?? 0) > 0
})
definePredicate('isExpanded', (p, ctx) => {
  if (p.kind !== 'isExpanded') return false
  const key = resolveKeyToken(p.key, ctx.key, ctx.activeKey)
  return ctx.data.state?.expandedKeys?.includes(key) ?? false
})
definePredicate('isDisabled', (p, ctx) => {
  if (p.kind !== 'isDisabled') return false
  const key = resolveKeyToken(p.key, ctx.key, ctx.activeKey)
  return ctx.data.state?.disabledKeys?.includes(key) ?? false
})

// VisibleOrder — kernel 기본 'flat' (relations.rootKeys 평면 순회).
// listbox/slider/tabs 등 평면 패턴은 자기 별칭을 만들지 말고 이것을 재사용한다.
defineVisibleOrder('flat', (_v, data) => data.relations?.rootKeys ?? [])

// ─────────────────────────────────────────────────────────────
// Event template + part events — generic
// ─────────────────────────────────────────────────────────────

import type { EventTemplate } from './schema'

export function resolveEventTemplate(
  template: EventTemplate,
  activeKey: Key,
  data: PatternData,
  keyContext?: Key,
): readonly PatternEvent[] {
  if (template.type === 'navigate') return [{ type: 'navigate', direction: template.direction }]
  if (template.type === 'typeahead') return [{ type: 'typeahead', query: template.query }]
  if (template.type === 'dismiss') {
    const key = template.key ? resolveKeyToken(template.key, keyContext, activeKey) : undefined
    return [{ type: 'dismiss', ...(key ? { key } : {}) }]
  }
  if (template.type === 'extension') {
    const key = template.key ? resolveKeyToken(template.key, keyContext, activeKey) : undefined
    return [{ type: 'extension', name: template.name, ...(key ? { key } : {}), ...(template.payload ? { payload: template.payload } : {}) }]
  }
  const key = resolveKeyToken(template.key, keyContext, activeKey)
  if (template.type === 'focus') return [{ type: 'focus', key }]
  if (template.type === 'activate') return [{ type: 'activate', key }]
  if (template.type === 'select') return [{ type: 'select', keys: [key], anchorKey: key, extentKey: key }]
  if (template.type === 'expand') {
    const expanded = template.expanded ?? !(data.state?.expandedKeys?.includes(key) ?? false)
    return [{ type: 'expand', key, expanded }]
  }
  if (template.type === 'open') return [{ type: 'open', key, open: template.open ?? true }]
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

// ─────────────────────────────────────────────────────────────
// Generic pattern runtime — 임의 PatternDefinition 에 동작하는 슬롯 조립기.
// 패턴 무관 — definition.parts 의 어떤 part 든 props 를 만들어준다.
// ─────────────────────────────────────────────────────────────

import { matchesShortcut } from '@interactive-os/keyboard'
import type { PatternDefinition, PartEventBinding, AriaProjection, FocusProjection } from './schema'

export type SlotProps = Record<string, unknown>

export interface PatternRuntime {
  definition: PatternDefinition
  data: PatternData
  options: PatternOptions
  visibleKeys: readonly Key[]
  /** Root part(role === definition.rootRole) 의 slot props. onKeyDown 핸들러가 자동 포함된다. */
  getRootProps(): SlotProps
  /** Item part(treeitem/option/gridcell 등) 의 slot props. key 필수. */
  getItemProps(partName: string, key: Key): SlotProps
  /** Deprecated: getRootProps()/getItemProps() 를 직접 사용하라. key === undefined → root, 아니면 item. */
  getPartProps(partName: string, key?: Key): SlotProps
  getRootKeyboardHandler(): (event: KeyInput & { preventDefault?: () => void }) => void
  resolveKeyboardBinding(input: KeyInput, activeKey: Key): { events: readonly PatternEvent[]; preventDefault: boolean } | null
  getItemState(key: Key, partName: string): Record<string, unknown>
  emit(event: PatternEvent): void
}

export interface CreatePatternRuntimeInput {
  definition: PatternDefinition
  data: PatternData
  options: PatternOptions
  onEvent: (event: PatternEvent) => void
  onDataChange?: (data: PatternData, event: PatternEvent) => void
  keyToElementId?: (key: Key) => string
}

export function createPatternRuntime(input: CreatePatternRuntimeInput): PatternRuntime {
  // 진입 시점 fail-fast — schema 위반(미상 필드/잘못된 형)을 deep error 가 아니라 boundary 에서 잡는다.
  // input 의 정적 타입이 이미 narrow 해도 실수/런타임 데이터는 검증한다.
  const data = PatternDataSchema.parse(input.data)
  const options = PatternOptionsSchema.parse(input.options ?? {})
  const { definition, onEvent, onDataChange } = input
  const visibleKeys = resolveVisibleOrder(definition.navigation.visibleOrder, data)
  const parentByKey = createParentByKey(data)
  const keyToElementId = input.keyToElementId ?? ((k: Key) => `${k}`)

  const context = (key?: Key): PatternRuntimeContext => ({
    data,
    options,
    key,
    activeKey: data.state?.activeKey ?? visibleKeys[0] ?? null,
    keyToElementId,
    parentByKey,
  })

  const apply = (event: PatternEvent) => reducePatternData(definition, data, event)

  const emit = (event: PatternEvent) => {
    onEvent(event)
    onDataChange?.(apply(event), event)
  }

  const resolveKeyboardBinding = (input: KeyInput, activeKey: Key) => {
    for (const binding of definition.keyboard) {
      if (!matchesShortcut(input, binding.shortcut)) continue
      for (const item of binding.cases) {
        const matches = item.case === 'otherwise' || item.case === 'always' || evaluatePredicate(item.when, { data, options, activeKey })
        if (!matches) continue
        return {
          preventDefault: binding.preventDefault ?? false,
          events: item.events.flatMap((t) => resolveEventTemplate(t, activeKey, data)),
        }
      }
    }
    return null
  }

  const getRootKeyboardHandler = () => (event: KeyInput & { preventDefault?: () => void }) => {
    const active = data.state?.activeKey ?? visibleKeys[0]
    if (!active) return
    const result = resolveKeyboardBinding(event, active)
    if (!result) return
    if (result.preventDefault) event.preventDefault?.()
    for (const next of result.events) emit(next)
  }

  const getPartProps = (partName: string, key?: Key): SlotProps => {
    const part = definition.parts[partName]
    if (!part) throw new Error(`[apg-pattern] unknown part "${partName}" in definition "${definition.apgPattern}"`)
    if (key !== undefined && !(key in data.items)) throw new Error(`Unknown item key: ${key}`)
    const ctx = context(key)
    // Root part(role === definition.rootRole) 에는 keyboard handler 를 자동 주입.
    // 사용자가 <ul {...getPartProps('listbox')}> 만 해도 키보드가 동작하도록 — getRootKeyboardHandler() 별도 호출 불필요.
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

  const getItemState = (key: Key, partName: string): Record<string, unknown> => {
    const part = definition.parts[partName]
    if (!part) return {}
    const ctx = context(key)
    const out: Record<string, unknown> = {}
    for (const projection of part.state ?? []) {
      out[projection.name] = resolveStateProjection(projection.from, ctx)
    }
    return out
  }

  // Root part = role === definition.rootRole 인 part name 을 찾는다.
  const rootPartName = Object.keys(definition.parts).find((name) => definition.parts[name]?.role === definition.rootRole)
  const getRootProps = (): SlotProps => {
    if (!rootPartName) throw new Error(`[apg-pattern] no part with role "${definition.rootRole}" found — definition.parts 중 root role 과 일치하는 부품이 없음.`)
    return getPartProps(rootPartName)
  }
  const getItemProps = (partName: string, key: Key): SlotProps => getPartProps(partName, key)

  return { definition, data, options, visibleKeys, getRootProps, getItemProps, getPartProps, getRootKeyboardHandler, resolveKeyboardBinding, getItemState, emit }
}

export function reducePatternData(definition: PatternDefinition, data: PatternData, event: PatternEvent): PatternData {
  if (event.type === 'focus') return withActiveKey(data, event.key)

  if (event.type === 'navigate') {
    const visibleKeys = resolveVisibleOrder(definition.navigation.visibleOrder, data)
    const activeKey = data.state?.activeKey ?? visibleKeys[0]
    if (!activeKey) return data
    const target = definition.navigation.targets[event.direction]
    if (!target) {
      throw new Error(
        `[apg-pattern] navigate(direction="${event.direction}") emitted but definition.navigation.targets["${event.direction}"] is missing — register a target or fix the keyboard binding.`,
      )
    }
    const nextKey = dispatchNavigationTarget(target, {
      activeKey,
      data,
      parentByKey: createParentByKey(data),
      visibleKeys,
    })
    return nextKey ? withActiveKey(data, nextKey) : data
  }

  if (event.type === 'select') {
    return {
      ...data,
      state: {
        ...data.state,
        activeKey: event.extentKey ?? event.anchorKey ?? event.keys[0] ?? data.state?.activeKey,
        selectedKeys: [...event.keys],
        anchorKey: event.anchorKey,
        extentKey: event.extentKey,
      },
    }
  }

  if (event.type === 'expand') {
    const expanded = new Set(data.state?.expandedKeys ?? [])
    if (event.expanded) expanded.add(event.key)
    else expanded.delete(event.key)
    return { ...data, state: { ...data.state, activeKey: event.key, expandedKeys: [...expanded] } }
  }

  if (event.type === 'check') {
    return { ...data, state: { ...data.state, checkedByKey: { ...data.state?.checkedByKey, [event.key]: event.checked } } }
  }

  if (event.type === 'press') {
    return { ...data, state: { ...data.state, pressedByKey: { ...data.state?.pressedByKey, [event.key]: event.pressed ?? true } } }
  }

  if (event.type === 'value') {
    return { ...data, state: { ...data.state, valueByKey: { ...data.state?.valueByKey, [event.key]: event.value } } }
  }

  // 'open' 은 'expand' 의 별칭으로 처리한다 — 둘 다 expandedKeys 를 갱신.
  // (그렇지 않으면 schema 통과하지만 state 미반영 silent bug.)
  if (event.type === 'open') {
    const expanded = new Set(data.state?.expandedKeys ?? [])
    if (event.open) expanded.add(event.key)
    else expanded.delete(event.key)
    return { ...data, state: { ...data.state, expandedKeys: [...expanded] } }
  }

  // 'activate' 와 'typeahead'/'dismiss'/'extension' 는 outbound-only signal —
  // kernel reducer 가 state 를 갱신하지 않는다. 호출자가 상위 store/effect 에서 처리해야 한다.
  // (silent no-op 처럼 보이지만 의도된 동작 — JSDoc/문서로 알린다.)
  return data
}

function withActiveKey(data: PatternData, activeKey: Key): PatternData {
  return { ...data, state: { ...data.state, activeKey } }
}

function resolveAriaProjections(projections: readonly AriaProjection[], ctx: PatternRuntimeContext): SlotProps {
  const out: SlotProps = {}
  for (const projection of projections) {
    if (projection.when && !evaluatePredicate(projection.when, ctx)) continue
    const value = resolveAriaSource(projection.from, ctx)
    // undefined 만 suppress — false 는 그대로 emit (ARIA 의 명시적 "false" 의무: aria-expanded/aria-checked/aria-pressed/aria-selected).
    // 보이고 싶지 않을 때는 source resolver 가 undefined 를 반환하거나, projection 에 when 을 걸어야 한다.
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

// DOM event 이름 → React/HTML handler prop 매핑 — 등록 기반.
// 기본 'focus'/'click' 등 외에 패턴별로 defineDomEventHandlerProp 으로 추가 가능.
const domEventHandlerPropRegistry = new Map<string, string>([
  ['focus', 'onFocus'],
  ['blur', 'onBlur'],
  ['click', 'onClick'],
  ['dblclick', 'onDoubleClick'],
  ['keydown', 'onKeyDown'],
  ['keyup', 'onKeyUp'],
  ['input', 'onInput'],
  ['change', 'onChange'],
  ['pointerdown', 'onPointerDown'],
  ['pointerup', 'onPointerUp'],
  ['pointermove', 'onPointerMove'],
  ['mouseenter', 'onMouseEnter'],
  ['mouseleave', 'onMouseLeave'],
])
export const defineDomEventHandlerProp = (eventName: string, handlerProp: string) =>
  void domEventHandlerPropRegistry.set(eventName, handlerProp)

function resolvePartEventBindings(
  bindings: readonly PartEventBinding[],
  ctx: PatternRuntimeContext,
  emit: (event: PatternEvent) => void,
): SlotProps {
  const byEvent = new Map<string, PartEventBinding[]>()
  for (const binding of bindings) {
    const group = byEvent.get(binding.event)
    if (group) group.push(binding)
    else byEvent.set(binding.event, [binding])
  }
  const out: SlotProps = {}
  for (const [eventName, eventBindings] of byEvent) {
    const handlerProp = domEventHandlerPropRegistry.get(eventName)
    if (!handlerProp) throw unknownTokenError('domEvent', eventName)
    out[handlerProp] = () => {
      for (const binding of eventBindings) {
        if (binding.when && !evaluatePredicate(binding.when, ctx)) continue
        const active = ctx.activeKey ?? ctx.key
        if (!active) continue
        for (const event of binding.events.flatMap((t) => resolveEventTemplate(t, active, ctx.data, ctx.key))) emit(event)
      }
    }
  }
  return out
}

function compactProps(props: SlotProps): SlotProps {
  return Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined))
}
