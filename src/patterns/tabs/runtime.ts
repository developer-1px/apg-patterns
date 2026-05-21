import {
  createPatternRuntime,
  type CreatePatternRuntimeInput,
  type PatternRuntime,
  type SlotProps,
} from '../../kernel/patternRuntime'
import { PatternDataSchema, PatternEventSchema, PatternOptionsSchema, type Key, type PatternData, type PatternEvent, type PatternOptions } from '../../schema'
import { tabsDefinition } from './definition'
import { createElementId } from '../../kernel/domIds'
export { reduceTabsData } from './tabsReducer'

export interface TabsRuntime {
  definition: typeof tabsDefinition
  data: PatternData
  options: PatternOptions
  tabs: readonly Key[]
  selectedKey: Key | null
  selectedPanelKey: Key | null
  getTablistProps(): SlotProps
  getTabProps(key: Key): SlotProps
  getTabPanelProps(key: Key): SlotProps
  emit(event: PatternEvent): void
}

interface CreateTabsRuntimeInput {
  data: unknown
  onEvent: (event: PatternEvent) => void
  options?: unknown
  runtime?: PatternRuntime
}

const defaultOptions = {
  orientation: 'horizontal',
  activationMode: 'automatic',
} satisfies PatternOptions

export function createTabsRuntime(input: CreateTabsRuntimeInput): TabsRuntime {
  const data = PatternDataSchema.parse(input.data)
  const options = { ...defaultOptions, ...PatternOptionsSchema.parse(input.options ?? {}) }
  const emit = (event: PatternEvent) => input.onEvent(PatternEventSchema.parse(event))
  const runtime = input.runtime ?? createPatternRuntime({
    definition: tabsDefinition,
    data,
    options,
    keyToElementId: (key) => createTabsElementId(options.elementIdPrefix ?? 'tab-', key),
    onEvent: emit,
  } satisfies CreatePatternRuntimeInput) as PatternRuntime

  const selectedKey = data.state?.selectedKeys?.[0] ?? data.state?.activeKey ?? runtime.visibleKeys[0] ?? null
  const selectedPanelKey = selectedKey ? data.relations?.controlsByKey?.[selectedKey]?.[0] ?? null : null

  return {
    definition: tabsDefinition,
    data,
    options,
    get tabs() {
      return runtime.visibleKeys
    },
    selectedKey,
    selectedPanelKey,
    getTablistProps: () => runtime.getPartProps('tablist'),
    getTabProps: (key) => runtime.getPartProps('tab', key),
    getTabPanelProps: (key) => runtime.getPartProps('tabpanel', key),
    emit: runtime.emit,
  }
}

function createTabsElementId(prefix: string, key: Key) {
  return createElementId(prefix, key)
}
