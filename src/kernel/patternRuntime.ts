import type { KeyInput } from '@interactive-os/keyboard'
import { PatternDataSchema, PatternDefinitionSchema, PatternOptionsSchema, type Key, type PatternData, type PatternEvent, type PatternOptions, type PatternDefinition } from '../schema'
import {
  resolveVisibleOrder,
  createParentByKey,
  type PatternRuntimeContext,
} from './patternKernel'
import { resolveRuntimePartProps } from './runtimePartProps'
import { resolveRuntimeItemState } from './runtimeItemState'
import { createRootKeyboardHandler } from './rootKeyboardHandler'
import { resolveRuntimeKeyboardBinding } from './runtimeKeyboard'
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
    if (!rootPartName) throw new Error(`[apg-pattern] no part with role "${definition.rootRole}" found — definition.parts 중 root role 과 일치하는 부품이 없음.`)
    return getPartProps(rootPartName)
  }
  const getItemProps = (partName: string, key: Key): SlotProps => getPartProps(partName, key)

  return { definition, data, options, visibleKeys, getRootProps, getItemProps, getPartProps, getRootKeyboardHandler, resolveKeyboardBinding, getItemState, keyToElementId, emit }
}
