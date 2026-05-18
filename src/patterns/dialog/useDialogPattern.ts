import { createPatternRuntime } from '../../kernel/patternRuntime'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import type { Key, PatternDataWithOptions, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { dialogDefinition } from './definition'
import { createDialogProps } from './dialogProps'

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

export function useDialogPattern(data: PatternDataWithOptions, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactDialogRuntime {
  const runtimeOptions = options ?? data.state?.options ?? {}
  const keyToElementId = (key: Key) => key === 'dialog' ? 'dialog-panel' : `${runtimeOptions.elementIdPrefix ?? 'dialog-'}${key}`
  const runtime = createPatternRuntime({ definition: dialogDefinition, data, options: runtimeOptions, onEvent, keyToElementId })

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
      return createDialogProps({ runtime, data, keyToElementId })
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
