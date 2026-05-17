import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { reactKeyInput, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { tooltipDefinition } from './definition'

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
  const rootKeyDown = runtime.getRootKeyboardHandler()

  return {
    get triggerProps() {
      if (!triggerKey) return {}
      const { onKeyDown: _onKeyDown, ...props } = runtime.getPartProps('trigger', triggerKey) as ReactPatternProps
      return {
        ...props,
        type: 'button',
        onKeyDown: (event) => rootKeyDown(reactKeyInput(event)),
      } as ReactPatternProps
    },
    get tooltipProps() {
      return tooltipKey ? runtime.getPartProps('tooltip', tooltipKey) as ReactPatternProps : {}
    },
    triggerKey,
    tooltipKey,
    get triggerLabel() {
      return triggerKey ? data.items[triggerKey]?.label ?? triggerKey : ''
    },
    get tooltipLabel() {
      return tooltipKey ? data.items[tooltipKey]?.label ?? tooltipKey : ''
    },
    get state() {
      return {
        open: triggerKey ? data.state?.expandedKeys?.includes(triggerKey) ?? false : false,
      }
    },
    get actions() {
      return {
        open: () => {
          if (triggerKey) runtime.emit({ type: 'expand', key: triggerKey, expanded: true })
        },
        close: () => {
          if (triggerKey) runtime.emit({ type: 'expand', key: triggerKey, expanded: false })
        },
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}
