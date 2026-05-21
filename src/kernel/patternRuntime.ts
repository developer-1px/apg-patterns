import type { KeyInput } from '../internal/keyboard'
import { PatternDataSchema, PatternDefinitionSchema, PatternOptionsSchema, type Key, type PatternData, type PatternEvent, type PatternOptions, type PatternDefinition } from '../schema'
import {
  resolveVisibleOrder,
  createParentByKey,
  resolveStateProjection,
  type PatternRuntimeContext,
} from './patternKernel'
import { resolveRuntimePartProps } from './runtimePartProps'
import { resolveRuntimeKeyboardBinding, type RuntimeKeyboardBindingResult } from './runtimeKeyboard'
import { createElementId } from './domIds'
import { withDefaultReason } from './domEventBindings'
export { defineDomEvent } from './domEventBindings'

export type SlotProps = Record<string, unknown>

export interface PatternRuntime<TData extends PatternData = PatternData> {
  definition: PatternDefinition
  data: TData
  options: PatternOptions
  visibleKeys: readonly Key[]
  /** Slot props for the root part, including the generated onKeyDown handler. */
  getRootProps(): SlotProps
  /** Slot props for an item part. Requires an item key. */
  getItemProps(partName: string, key: Key): SlotProps
  /** Slot props for any named part. */
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
  // Fail fast at the runtime boundary so schema violations are localized.
  const definition = PatternDefinitionSchema.parse(input.definition)
  const data = PatternDataSchema.parse(input.data) as TData
  const options = PatternOptionsSchema.parse(input.options ?? {})
  const { onEvent } = input
  const visibleKeys = resolveVisibleOrder(definition.navigation.visibleOrder, data)
  const parentByKey = createParentByKey(data)
  const keyToElementId = input.keyToElementId ?? ((k: Key) => createElementId('apg-', k))

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

  const resolveKeyboardBinding = (input: KeyInput, activeKey: Key) => resolveRuntimeKeyboardBinding({ definition, data, options, parentByKey, input, activeKey })

  const getRootKeyboardHandler = () => createRootKeyboardHandler({ data, visibleKeys, emit, resolveKeyboardBinding })

  const getPartProps = (partName: string, key?: Key): SlotProps => {
    return resolveRuntimePartProps({ definition, data, partName, key, keyToElementId, context, emit, getRootKeyboardHandler })
  }

  const getItemState = (key: Key, partName: string): Record<string, unknown> => {
    return resolveRuntimeItemState({ definition, partName, key, context })
  }

  const rootPartName = Object.keys(definition.parts).find((name) => definition.parts[name]?.role === definition.rootRole)
  const getRootProps = (): SlotProps => {
    if (!rootPartName) throw new Error(`[apg-pattern] no part with role "${definition.rootRole}" found in definition.parts.`)
    return getPartProps(rootPartName)
  }
  const getItemProps = (partName: string, key: Key): SlotProps => getPartProps(partName, key)

  return { definition, data, options, visibleKeys, getRootProps, getItemProps, getPartProps, getRootKeyboardHandler, resolveKeyboardBinding, getItemState, keyToElementId, emit }
}

function createRootKeyboardHandler({
  data,
  visibleKeys,
  emit,
  resolveKeyboardBinding,
}: {
  data: PatternData
  visibleKeys: readonly Key[]
  emit: (event: PatternEvent) => void
  resolveKeyboardBinding: (input: KeyInput, activeKey: Key) => RuntimeKeyboardBindingResult | null
}) {
  return (event: KeyInput & { preventDefault?: () => void }) => {
    const active = data.state?.activeKey ?? visibleKeys[0]
    if (!active) return

    const result = resolveKeyboardBinding(event, active)
    if (!result) return

    if (result.preventDefault) event.preventDefault?.()
    for (const next of result.events) emit(withDefaultReason(next, 'keyboard'))
  }
}

function resolveRuntimeItemState({
  definition,
  partName,
  key,
  context,
}: {
  definition: PatternDefinition
  partName: string
  key: Key
  context(key?: Key): PatternRuntimeContext
}): Record<string, unknown> {
  const part = definition.parts[partName]
  if (!part) return {}
  const ctx = context(key)
  const out: Record<string, unknown> = {}
  for (const projection of part.state ?? []) {
    out[projection.name] = resolveStateProjection(projection.from, ctx)
  }
  return out
}
