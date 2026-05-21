import type { KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import { handlePatternTrapFocus, usePatternEffects } from '../../adapters/reactPatternEffects'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { reactKeyInput, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { dialogDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

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
  const runtimeOptions = options ?? {}
  const keyToElementId = usePatternElementId(runtimeOptions, 'dialog-')
  const runtime = createPatternRuntime({ definition: dialogDefinition, data, options: runtimeOptions, onEvent, keyToElementId })

  usePatternEffects({ definition: dialogDefinition, data: runtime.data, keyToElementId })

  return {
    open: data.state?.expandedKeys?.includes('trigger') ?? false,
    get triggerProps() {
      return reactProps(runtime.getPartProps('trigger', 'trigger'))
    },
    get overlayProps() {
      return reactProps(runtime.getPartProps('overlay'))
    },
    get dialogProps() {
      return createDialogProps({ runtime, data, keyToElementId })
    },
    get titleProps() {
      return reactProps(runtime.getPartProps('title', 'title'))
    },
    get descriptionProps() {
      return reactProps(runtime.getPartProps('description', 'description'))
    },
    get cancelProps() {
      return reactProps(runtime.getPartProps('cancel', 'cancel'))
    },
    get submitProps() {
      return reactProps(runtime.getPartProps('submit', 'submit'))
    },
    labelOf: (key) => data.items[key]?.label ?? key,
    get ids() {
      return { forKey: keyToElementId }
    },
    keyToElementId,
  }
}

function createDialogProps({
  runtime,
  data,
  keyToElementId,
}: {
  runtime: ReturnType<typeof createPatternRuntime>
  data: PatternData
  keyToElementId: (key: Key) => string
}): ReactPatternProps {
  const rootKeyDown = runtime.getRootKeyboardHandler()
  return reactProps({
    ...runtime.getPartProps('dialog', 'dialog'),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      rootKeyDown(reactKeyInput(event))
      handlePatternTrapFocus({ event, definition: dialogDefinition, data, keyToElementId })
    },
    tabIndex: -1,
  })
}
