import type { KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import { handlePatternTrapFocus } from '../../adapters/reactPatternEffects'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { dialogDefinition } from './definition'

export interface ReactDialogRuntime {
  open: boolean
  triggerProps: ReactPatternProps
  overlayProps: ReactPatternProps
  dialogProps: ReactPatternProps
  titleProps: ReactPatternProps
  descriptionProps: ReactPatternProps
  cancelProps: ReactPatternProps
  submitProps: ReactPatternProps
  labelOf(key: Key): string
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useDialogPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactDialogRuntime {
  const runtimeOptions = options ?? (((data.state as { options?: PatternOptions } | undefined)?.options ?? {}) as PatternOptions)
  const keyToElementId = (key: Key) => key === 'dialog' ? 'dialog-panel' : `${runtimeOptions.elementIdPrefix ?? 'dialog-'}${key}`
  const runtime = createPatternRuntime({ definition: dialogDefinition, data, options: runtimeOptions, onEvent, keyToElementId })
  const rootKeyDown = runtime.getRootKeyboardHandler()

  usePatternEffects({ definition: dialogDefinition, data: runtime.data, keyToElementId })

  return {
    open: data.state?.expandedKeys?.includes('trigger') ?? false,
    get triggerProps() {
      return runtime.getPartProps('trigger', 'trigger') as ReactPatternProps
    },
    get overlayProps() {
      return runtime.getPartProps('overlay') as ReactPatternProps
    },
    get dialogProps() {
      return {
        ...(runtime.getPartProps('dialog', 'dialog') as ReactPatternProps),
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          rootKeyDown(event)
          handlePatternTrapFocus({ event, definition: dialogDefinition, data, keyToElementId })
        },
        tabIndex: -1,
      } as ReactPatternProps
    },
    get titleProps() {
      return runtime.getPartProps('title', 'title') as ReactPatternProps
    },
    get descriptionProps() {
      return runtime.getPartProps('description', 'description') as ReactPatternProps
    },
    get cancelProps() {
      return runtime.getPartProps('cancel', 'cancel') as ReactPatternProps
    },
    get submitProps() {
      return runtime.getPartProps('submit', 'submit') as ReactPatternProps
    },
    labelOf: (key) => data.items[key]?.label ?? key,
    get ids() {
      return { forKey: keyToElementId }
    },
    keyToElementId,
  }
}
