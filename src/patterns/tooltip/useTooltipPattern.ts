import type { KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { reactKeyInput, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { tooltipDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

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
  const keyToElementId = usePatternElementId(options, 'tooltip-')
  const runtime = createPatternRuntime({
    definition: tooltipDefinition,
    data,
    options: options ?? {},
    onEvent,
    keyToElementId,
  })
  const triggerKey = data.relations?.rootKeys?.[0] ?? null
  const tooltipKey = triggerKey ? data.relations?.controlsByKey?.[triggerKey]?.[0] ?? null : null

  return {
    get triggerProps() {
      if (!triggerKey) return {}
      const rootKeyDown = runtime.getRootKeyboardHandler()
      const { onKeyDown: _onKeyDown, ...props } = reactProps(runtime.getPartProps('trigger', triggerKey))
      return reactProps({
        ...props,
        type: 'button',
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => rootKeyDown(reactKeyInput(event)),
      })
    },
    get tooltipProps() {
      return tooltipKey ? reactProps(runtime.getPartProps('tooltip', tooltipKey)) : {}
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
