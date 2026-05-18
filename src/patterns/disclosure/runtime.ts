import {
  createPatternRuntime,
  type CreatePatternRuntimeInput,
  type PatternRuntime,
  type SlotProps,
} from '../../kernel/patternRuntime'
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
  getRootKeyboardHandler(): (event: any) => void
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

  const triggerKey = data.relations?.rootKeys?.[0] ?? null
  const panelKey = triggerKey ? data.relations?.controlsByKey?.[triggerKey]?.[0] ?? null : null
  const expanded = triggerKey ? data.state?.expandedKeys?.includes(triggerKey) ?? false : false

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

function createDisclosureElementId(prefix: string, key: Key) {
  return `${prefix}${key.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}`
}
