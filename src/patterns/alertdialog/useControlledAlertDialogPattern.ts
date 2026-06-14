import type { KeyboardEvent, MouseEvent } from 'react'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { usePatternElementId } from '../../adapters/reactDomIds'
import { registerKernelBuiltins } from '../../kernel/kernelBuiltins'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import {
  dialogKey,
  emitControlledDialogClose,
  handleControlledDialogKeyDown,
  useControlledDialogFocus,
  type ReactControlledDialogConfig,
} from '../dialog/controlledDialog'
import { alertDialogDefinition } from './definition'

registerKernelBuiltins()

export type { ReactControlledDialogConfig, ReactControlledDialogOpenChangeMeta, ReactDialogFocusTarget } from '../dialog/controlledDialog'

export interface ReactControlledAlertDialogRuntime {
  open: boolean
  overlayProps: ReactPatternProps
  dialogProps: ReactPatternProps
  titleProps: ReactPatternProps
  descriptionProps: ReactPatternProps
  confirmProps: ReactPatternProps
  cancelProps: ReactPatternProps
  close(reason?: 'keyboard' | 'pointer' | 'external'): void
  labelOf(key: Key): string
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useControlledAlertDialogPattern(
  data: PatternData,
  config: ReactControlledDialogConfig,
  options?: PatternOptions,
): ReactControlledAlertDialogRuntime {
  const runtimeOptions = options ?? {}
  const keyToElementId = usePatternElementId(runtimeOptions, 'alertdialog-')
  const runtime = createPatternRuntime({
    definition: alertDialogDefinition,
    data,
    options: runtimeOptions,
    onEvent: config.onEvent ?? (() => undefined),
    keyToElementId,
  })
  const close = (reason: 'keyboard' | 'pointer' | 'external' = 'external') => {
    emitControlledDialogClose({ config, reason })
  }

  useControlledDialogFocus({
    open: config.open,
    data,
    keyToElementId,
    initialFocusKey: config.initialFocusKey,
    restoreFocusTo: config.restoreFocusTo,
  })

  return {
    open: config.open,
    overlayProps: controlledAlertDialogOverlayProps,
    get dialogProps() {
      return createControlledAlertDialogProps({ runtime, open: config.open, keyToElementId, onEvent: config.onEvent, close })
    },
    get titleProps() {
      return reactProps({ id: keyToElementId('title') })
    },
    get descriptionProps() {
      return reactProps({ id: keyToElementId('description') })
    },
    get confirmProps() {
      return createControlledAlertDialogActionProps({ runtime, part: 'confirm', onEvent: config.onEvent, close })
    },
    get cancelProps() {
      return createControlledAlertDialogActionProps({ runtime, part: 'cancel', onEvent: config.onEvent, close })
    },
    close,
    labelOf: (key) => data.items[key]?.label ?? key,
    get ids() {
      return { forKey: keyToElementId }
    },
    keyToElementId,
  }
}

const controlledAlertDialogOverlayProps = reactProps({
  'data-testid': 'alertdialog-overlay',
  onClick: (event: MouseEvent<HTMLElement>) => {
    if (event.target === event.currentTarget) event.preventDefault()
  },
})

function createControlledAlertDialogProps({
  runtime,
  open,
  keyToElementId,
  onEvent,
  close,
}: {
  runtime: ReturnType<typeof createPatternRuntime>
  open: boolean
  keyToElementId(key: Key): string
  onEvent?: (event: PatternEvent) => void
  close(reason: 'keyboard'): void
}): ReactPatternProps {
  return reactProps({
    ...runtime.getPartProps('dialog', dialogKey()),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => handleControlledDialogKeyDown({
      event,
      open,
      keyToElementId,
      onClose: (reason) => {
        onEvent?.({ type: 'activate', key: 'cancel', meta: { reason } })
        close(reason)
      },
    }),
    tabIndex: -1,
  })
}

function createControlledAlertDialogActionProps({
  runtime,
  part,
  onEvent,
  close,
}: {
  runtime: ReturnType<typeof createPatternRuntime>
  part: 'confirm' | 'cancel'
  onEvent?: (event: PatternEvent) => void
  close(reason: 'pointer'): void
}): ReactPatternProps {
  const props = reactProps(runtime.getPartProps(part, part))
  return {
    ...props,
    onClick: () => {
      onEvent?.({ type: 'activate', key: part, meta: { reason: 'pointer' } })
      close('pointer')
    },
  }
}
