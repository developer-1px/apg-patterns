import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { tooltipDefinition } from './definition'
import { createTooltipActions } from './tooltipActions'
import { getTooltipLabel, getTooltipRuntimeState } from './tooltipRuntimeState'
import { createTooltipTriggerProps } from './tooltipTriggerProps'

export interface ReactTooltipRuntime {
  triggerProps: ReactPatternProps
  tooltipProps: ReactPatternProps
  triggerKey: Key | null
  tooltipKey: Key | null
  triggerLabel: string
  tooltipLabel: string
  state: {
    open: boolean
  }
  actions: {
    open(): void
    close(): void
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useTooltipPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactTooltipRuntime {
  const runtime = createPatternRuntime({
    definition: tooltipDefinition,
    data,
    options: options ?? {},
    onEvent,
    keyToElementId: (key) => `${key}`,
  })
  const triggerKey = data.relations?.rootKeys?.[0] ?? null
  const tooltipKey = triggerKey ? data.relations?.controlsByKey?.[triggerKey]?.[0] ?? null : null

  return {
    get triggerProps() {
      return createTooltipTriggerProps(runtime, triggerKey)
    },
    get tooltipProps() {
      return tooltipKey ? reactProps(runtime.getPartProps('tooltip', tooltipKey)) : {}
    },
    triggerKey,
    tooltipKey,
    get triggerLabel() {
      return getTooltipLabel(data, triggerKey)
    },
    get tooltipLabel() {
      return getTooltipLabel(data, tooltipKey)
    },
    get state() {
      return getTooltipRuntimeState(data, triggerKey)
    },
    get actions() {
      return createTooltipActions(runtime, triggerKey)
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}
