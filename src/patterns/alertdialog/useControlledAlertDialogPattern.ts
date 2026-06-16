import type { KeyboardEvent, MouseEvent } from 'react'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { usePatternElementId } from '../../adapters/reactDomIds'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import {
  emitControlledDialogClose,
  handleControlledDialogKeyDown,
  useControlledDialogFocus,
  type ReactControlledDialogConfig,
} from '../dialog/controlledDialog'
import { alertDialogDefinition } from './definition'
import { getAlertDialogRuntimeKeys } from './alertDialogRuntimeKeys'

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
  const keys = getAlertDialogRuntimeKeys(data)
  const dialogKey = keys.dialogKey ?? 'dialog'
  const close = (reason: 'keyboard' | 'pointer' | 'external' = 'external') => {
    emitControlledDialogClose({ config, reason, key: dialogKey })
  }

  useControlledDialogFocus({
    open: config.open,
    data,
    keyToElementId,
    dialogKey,
    initialFocusKey: config.initialFocusKey,
    restoreFocusTo: config.restoreFocusTo,
  })

  return {
    open: config.open,
    overlayProps: controlledAlertDialogOverlayProps,
    get dialogProps() {
      return createControlledAlertDialogProps({ runtime, open: config.open, keyToElementId, dialogKey, onEvent: config.onEvent, close })
    },
    get titleProps() {
      return keys.titleKey ? reactProps(runtime.getPartProps('title', keys.titleKey)) : {}
    },
    get descriptionProps() {
      return keys.descriptionKey ? reactProps(runtime.getPartProps('description', keys.descriptionKey)) : {}
    },
    get confirmProps() {
      return keys.confirmKey ? createControlledAlertDialogActionProps({ runtime, part: 'confirm', key: keys.confirmKey, onEvent: config.onEvent, close }) : {}
    },
    get cancelProps() {
      return keys.cancelKey ? createControlledAlertDialogActionProps({ runtime, part: 'cancel', key: keys.cancelKey, onEvent: config.onEvent, close }) : {}
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
  dialogKey,
  onEvent,
  close,
}: {
  runtime: PatternRuntime
  open: boolean
  keyToElementId(key: Key): string
  dialogKey: Key
  onEvent?: (event: PatternEvent) => void
  close(reason: 'keyboard'): void
}): ReactPatternProps {
  return reactProps({
    ...runtime.getPartProps('dialog', dialogKey),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => handleControlledDialogKeyDown({
      event,
      open,
      keyToElementId,
      dialogKey,
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
  key,
  onEvent,
  close,
}: {
  runtime: PatternRuntime
  part: 'confirm' | 'cancel'
  key: Key
  onEvent?: (event: PatternEvent) => void
  close(reason: 'pointer'): void
}): ReactPatternProps {
  const props = reactProps(runtime.getPartProps(part, key))
  return {
    ...props,
    onClick: () => {
      onEvent?.({ type: 'activate', key, meta: { reason: 'pointer' } })
      close('pointer')
    },
  }
}
