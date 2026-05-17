import type { KeyboardEvent, MouseEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import { handlePatternTrapFocus, usePatternEffects } from '../../adapters/reactPatternEffects'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { alertDialogDefinition } from './definition'

export interface ReactAlertDialogRuntime {
  open: boolean
  triggerProps: ReactPatternProps
  overlayProps: ReactPatternProps
  dialogProps: ReactPatternProps
  confirmProps: ReactPatternProps
  cancelProps: ReactPatternProps
  labelOf(key: Key): string
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useAlertDialogPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactAlertDialogRuntime {
  const runtimeOptions = options ?? (((data.state as { options?: PatternOptions } | undefined)?.options ?? {}) as PatternOptions)
  const keyToElementId = (key: Key) => `${runtimeOptions.elementIdPrefix ?? 'alertdialog-'}${key}`
  const runtime = createPatternRuntime({ definition: alertDialogDefinition, data, options: runtimeOptions, onEvent, keyToElementId })
  const rootKeyDown = runtime.getRootKeyboardHandler()

  usePatternEffects({ definition: alertDialogDefinition, data: runtime.data, keyToElementId })

  return {
    open: data.state?.expandedKeys?.includes('trigger') ?? false,
    get triggerProps() {
      return runtime.getPartProps('trigger', 'trigger') as ReactPatternProps
    },
    overlayProps: {
      'data-testid': 'alertdialog-overlay',
      onClick: (event: MouseEvent<HTMLElement>) => {
        if (event.target === event.currentTarget) event.preventDefault()
      },
    } as ReactPatternProps,
    get dialogProps() {
      return {
        ...(runtime.getPartProps('dialog', 'dialog') as ReactPatternProps),
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          if (event.key === 'Escape') onEvent({ type: 'activate', key: 'cancel' })
          rootKeyDown(event)
          handlePatternTrapFocus({ event, definition: alertDialogDefinition, data, keyToElementId })
        },
      } as ReactPatternProps
    },
    get confirmProps() {
      const props = runtime.getPartProps('confirm', 'confirm') as ReactPatternProps
      return {
        ...props,
        onClick: (event: MouseEvent<HTMLElement>) => {
          props.onClick?.(event)
          onEvent({ type: 'activate', key: 'confirm' })
        },
      }
    },
    get cancelProps() {
      const props = runtime.getPartProps('cancel', 'cancel') as ReactPatternProps
      return {
        ...props,
        onClick: (event: MouseEvent<HTMLElement>) => {
          props.onClick?.(event)
          onEvent({ type: 'activate', key: 'cancel' })
        },
      }
    },
    labelOf: (key) => data.items[key]?.label ?? key,
    get ids() {
      return { forKey: keyToElementId }
    },
    keyToElementId,
  }
}
