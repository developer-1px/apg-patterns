import { matchesShortcut, type KeyInput } from '@interactive-os/keyboard'
import { PatternDataSchema, PatternDefinitionSchema, PatternOptionsSchema, type Key, type PatternData, type PatternEvent, type PatternOptions, type PatternDefinition, type AriaProjection, type FocusProjection } from '../schema'
import {
  resolveAriaSource,
  resolveStateProjection,
  resolveVisibleOrder,
  evaluatePredicate,
  resolveEventTemplate,
  createParentByKey,
  type PatternRuntimeContext,
} from './patternKernel'
import { resolvePartEventBindings, withDefaultReason } from './domEventBindings'
export { defineDomEvent, defineDomEventHandlerProp } from './domEventBindings'

export type SlotProps = Record<string, unknown>

export interface PatternRuntime<TData extends PatternData = PatternData> {
  definition: PatternDefinition
  data: TData
  options: PatternOptions
  visibleKeys: readonly Key[]
  /** Root part 의 slot props. onKeyDown handler 자동 포함. */
  getRootProps(): SlotProps
  /** Item part 의 slot props. key 필수. */
  getItemProps(partName: string, key: Key): SlotProps
  /** Deprecated: getRootProps()/getItemProps() 를 직접 사용하라. */
  getPartProps(partName: string, key?: Key): SlotProps
  getRootKeyboardHandler(): (event: KeyInput & { preventDefault?: () => void }) => void
  resolveKeyboardBinding(input: KeyInput, activeKey: Key): { events: readonly PatternEvent[]; preventDefault: boolean } | null
  getItemState(key: Key, partName: string): Record<string, unknown>
  keyToElementId(key: Key): string
  emit(event: PatternEvent): void
}

export interface CreatePatternRuntimeInput {
  definition: PatternDefinition
  data: PatternData
  options?: PatternOptions
  onEvent: (event: PatternEvent) => void
  keyToElementId?: (key: Key) => string
}

export function createPatternRuntime<TData extends PatternData = PatternData>(input: Omit<CreatePatternRuntimeInput, 'data'> & { data: TData }): PatternRuntime<TData> {
  // 진입 시점 fail-fast — schema 위반을 boundary 에서 잡는다.
  const definition = PatternDefinitionSchema.parse(input.definition)
  const data = PatternDataSchema.parse(input.data) as TData
  const options = PatternOptionsSchema.parse(input.options ?? {})
  const { onEvent } = input
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

  const emit = (event: PatternEvent) => {
    onEvent(event)
  }

  const resolveKeyboardBinding = (input: KeyInput, activeKey: Key) => {
    for (const binding of definition.keyboard) {
      if (!matchesShortcut(input, binding.shortcut)) continue
      for (const item of binding.cases) {
        const ctx = { data, options, activeKey, parentByKey }
        const matches = item.case === 'otherwise' || item.case === 'always' || evaluatePredicate(item.when, ctx)
        if (!matches) continue
        return {
          preventDefault: binding.preventDefault ?? false,
          events: item.events.flatMap((t) => resolveEventTemplate(t, activeKey, data, undefined, ctx)),
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
    for (const next of result.events) emit(withDefaultReason(next, 'keyboard'))
  }

  const getPartProps = (partName: string, key?: Key): SlotProps => {
    const part = definition.parts[partName]
    if (!part) throw new Error(`[apg-pattern] unknown part "${partName}" in definition "${definition.apgPattern}"`)
    if (key !== undefined && !(key in data.items)) throw new Error(`Unknown item key: ${key}`)
    const ctx = context(key)
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

  const rootPartName = Object.keys(definition.parts).find((name) => definition.parts[name]?.role === definition.rootRole)
  const getRootProps = (): SlotProps => {
    if (!rootPartName) throw new Error(`[apg-pattern] no part with role "${definition.rootRole}" found — definition.parts 중 root role 과 일치하는 부품이 없음.`)
    return getPartProps(rootPartName)
  }
  const getItemProps = (partName: string, key: Key): SlotProps => getPartProps(partName, key)

  return { definition, data, options, visibleKeys, getRootProps, getItemProps, getPartProps, getRootKeyboardHandler, resolveKeyboardBinding, getItemState, keyToElementId, emit }
}

function resolveAriaProjections(projections: readonly AriaProjection[], ctx: PatternRuntimeContext): SlotProps {
  const out: SlotProps = {}
  for (const projection of projections) {
    if (projection.when && !evaluatePredicate(projection.when, ctx)) continue
    const value = resolveAriaSource(projection.from, ctx)
    // undefined 만 suppress — false 는 그대로 emit (ARIA 명시적 "false" 의무).
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

function compactProps(props: SlotProps): SlotProps {
  return Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined))
}
