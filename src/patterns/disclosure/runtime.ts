import {
  createPatternRuntime,
  type PatternRuntime,
  type SlotProps,
} from '../../kernel/patternRuntime'
import type { KeyInput } from '../../internal/keyboard'
import {
  PatternDataSchema,
  PatternEventSchema,
  PatternOptionsSchema,
  type Key,
  type PatternData,
  type PatternEvent,
  type PatternOptions,
} from '../../schema'
import { disclosureDefinition } from './definition'
import { createDisclosureElementId, getDisclosureKeys, isDisclosureExpanded } from './disclosureRuntimeKeys'
export { reduceDisclosureData } from './disclosureReducer'

export interface DisclosureRuntime {
  definition: typeof disclosureDefinition
  data: PatternData
  options: PatternOptions
  triggerKey: Key | null
  panelKey: Key | null
  expanded: boolean
  getTriggerProps(): SlotProps
  getPanelProps(): SlotProps
  getRootKeyboardHandler(): (event: KeyInput & { preventDefault?: () => void }) => void
  emit(event: PatternEvent): void
}

export interface CreateDisclosureRuntimeInput {
  data: unknown
  onEvent: (event: PatternEvent) => void
  options?: unknown
}

export function createDisclosureRuntime(input: CreateDisclosureRuntimeInput): DisclosureRuntime {
  const data = PatternDataSchema.parse(input.data)
  const options = PatternOptionsSchema.parse(input.options ?? {})
  const emit = (event: PatternEvent) => input.onEvent(PatternEventSchema.parse(event))
  const runtime = createPatternRuntime({
    definition: disclosureDefinition,
    data,
    options,
    keyToElementId: (key) => createDisclosureElementId(options.elementIdPrefix ?? 'disclosure-', key),
    onEvent: emit,
  }) as PatternRuntime

  const { triggerKey, panelKey } = getDisclosureKeys(data)
  const expanded = isDisclosureExpanded(data, triggerKey)

  return {
    definition: disclosureDefinition,
    data,
    options,
    triggerKey,
    panelKey,
    expanded,
    getTriggerProps: () => (triggerKey ? runtime.getPartProps('trigger', triggerKey) : {}),
    getPanelProps: () => (panelKey ? runtime.getPartProps('panel', panelKey) : {}),
    getRootKeyboardHandler: () => runtime.getRootKeyboardHandler(),
    emit,
  }
}
