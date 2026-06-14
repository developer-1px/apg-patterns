import type { KeyboardEvent, MouseEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import { handlePatternTrapFocus, usePatternEffects } from '../../adapters/reactPatternEffects'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { reactKeyInput, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { alertDialogDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'
import { registerKernelBuiltins } from '../../kernel/kernelBuiltins'

registerKernelBuiltins()

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
  const runtimeOptions = options ?? {}
  const keyToElementId = usePatternElementId(runtimeOptions, 'alertdialog-')
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

const alertDialogOverlayProps = reactProps({
  'data-testid': 'alertdialog-overlay',
  onClick: (event: MouseEvent<HTMLElement>) => {
    if (event.target === event.currentTarget) event.preventDefault()
  },
})

function createAlertDialogDialogProps({
  runtime,
  data,
  onEvent,
  keyToElementId,
}: {
  runtime: ReturnType<typeof createPatternRuntime>
  data: PatternData
  onEvent: (event: PatternEvent) => void
  keyToElementId: (key: Key) => string
}): ReactPatternProps {
  const rootKeyDown = runtime.getRootKeyboardHandler()
  return reactProps({
    ...runtime.getPartProps('dialog', 'dialog'),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Escape') onEvent({ type: 'activate', key: 'cancel' })
      rootKeyDown(reactKeyInput(event))
      handlePatternTrapFocus({ event, definition: alertDialogDefinition, data, keyToElementId })
    },
  })
}

function createAlertDialogActionProps({
  runtime,
  part,
  onEvent,
}: {
  runtime: ReturnType<typeof createPatternRuntime>
  part: 'confirm' | 'cancel'
  onEvent: (event: PatternEvent) => void
}): ReactPatternProps {
  const props = reactProps(runtime.getPartProps(part, part))
  return {
    ...props,
    onClick: (event: MouseEvent<HTMLElement>) => {
      props.onClick?.(event)
      onEvent({ type: 'activate', key: part })
    },
  }
}
