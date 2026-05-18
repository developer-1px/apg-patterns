import { createPatternRuntime } from '../../kernel/patternRuntime'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import type { Key, PatternDataWithOptions, PatternEvent, PatternOptions } from '../../schema'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { alertDialogOverlayProps, createAlertDialogActionProps, createAlertDialogDialogProps } from './alertDialogProps'
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

export function useAlertDialogPattern(data: PatternDataWithOptions, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactAlertDialogRuntime {
  const runtimeOptions = options ?? data.state?.options ?? {}
  const keyToElementId = (key: Key) => `${runtimeOptions.elementIdPrefix ?? 'alertdialog-'}${key}`
  const runtime = createPatternRuntime({ definition: alertDialogDefinition, data, options: runtimeOptions, onEvent, keyToElementId })

  usePatternEffects({ definition: alertDialogDefinition, data: runtime.data, keyToElementId })

  return {
    open: data.state?.expandedKeys?.includes('trigger') ?? false,
    get triggerProps() {
      return reactProps(runtime.getPartProps('trigger', 'trigger'))
    },
    overlayProps: alertDialogOverlayProps,
    get dialogProps() {
      return createAlertDialogDialogProps({ runtime, data, onEvent, keyToElementId })
    },
    get confirmProps() {
      return createAlertDialogActionProps({ runtime, part: 'confirm', onEvent })
    },
    get cancelProps() {
      return createAlertDialogActionProps({ runtime, part: 'cancel', onEvent })
    },
    labelOf: (key) => data.items[key]?.label ?? key,
    get ids() {
      return { forKey: keyToElementId }
    },
    keyToElementId,
  }
}
