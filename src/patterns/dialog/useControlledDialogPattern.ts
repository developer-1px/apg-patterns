import type { KeyboardEvent, MouseEvent } from 'react'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { usePatternElementId } from '../../adapters/reactDomIds'
import { registerKernelBuiltins } from '../../kernel/kernelBuiltins'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { dialogDefinition } from './definition'
import {
  emitControlledDialogClose,
  handleControlledDialogKeyDown,
  useControlledDialogFocus,
  type ReactControlledDialogConfig,
} from './controlledDialog'
import { getDialogRuntimeKeys } from './dialogRuntimeKeys'

registerKernelBuiltins()

export type { ReactControlledDialogConfig, ReactControlledDialogOpenChangeMeta, ReactDialogFocusTarget } from './controlledDialog'

export interface ReactControlledDialogRuntime {
  open: boolean
  overlayProps: ReactPatternProps
  dialogProps: ReactPatternProps
  titleProps: ReactPatternProps
  descriptionProps: ReactPatternProps
  cancelProps: ReactPatternProps
  submitProps: ReactPatternProps
  close(reason?: 'keyboard' | 'pointer' | 'external'): void
  labelOf(key: Key): string
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useControlledDialogPattern(
  data: PatternData,
  config: ReactControlledDialogConfig,
  options?: PatternOptions,
): ReactControlledDialogRuntime {
  const runtimeOptions = options ?? {}
  const keyToElementId = usePatternElementId(runtimeOptions, 'dialog-')
  const runtime = createPatternRuntime({
    definition: dialogDefinition,
    data,
    options: runtimeOptions,
    onEvent: config.onEvent ?? (() => undefined),
    keyToElementId,
  })
  const keys = getDialogRuntimeKeys(data)
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
    get overlayProps() {
      return createControlledDialogOverlayProps({ runtime, close })
    },
    get dialogProps() {
      return createControlledDialogProps({ runtime, open: config.open, keyToElementId, dialogKey, close })
    },
    get titleProps() {
      return keys.titleKey ? reactProps(runtime.getPartProps('title', keys.titleKey)) : {}
    },
    get descriptionProps() {
      return keys.descriptionKey ? reactProps(runtime.getPartProps('description', keys.descriptionKey)) : {}
    },
    get cancelProps() {
      return createControlledDialogActionProps({ runtime, part: 'cancel', action: 'dismiss', close })
    },
    get submitProps() {
      return createControlledDialogActionProps({ runtime, part: 'submit', action: 'activate', onEvent: config.onEvent, close })
    },
    close,
    labelOf: (key) => data.items[key]?.label ?? key,
    get ids() {
      return { forKey: keyToElementId }
    },
    keyToElementId,
  }
}

function createControlledDialogOverlayProps({
  runtime,
  close,
}: {
  runtime: PatternRuntime
  close(reason: 'pointer'): void
}): ReactPatternProps {
  const props = reactProps(runtime.getPartProps('overlay'))
  return {
    ...props,
    onMouseDown: (event: MouseEvent<HTMLElement>) => {
      if (event.target === event.currentTarget) close('pointer')
    },
  }
}

function createControlledDialogProps({
  runtime,
  open,
  keyToElementId,
  dialogKey,
  close,
}: {
  runtime: PatternRuntime
  open: boolean
  keyToElementId(key: Key): string
  dialogKey: Key
  close(reason: 'keyboard'): void
}): ReactPatternProps {
  return reactProps({
    ...runtime.getPartProps('dialog', dialogKey),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => handleControlledDialogKeyDown({
      event,
      open,
      keyToElementId,
      dialogKey,
      onClose: close,
    }),
    tabIndex: -1,
  })
}

function createControlledDialogActionProps({
  runtime,
  part,
  action,
  onEvent,
  close,
}: {
  runtime: PatternRuntime
  part: 'cancel' | 'submit'
  action: 'dismiss' | 'activate'
  onEvent?: (event: PatternEvent) => void
  close(reason: 'pointer'): void
}): ReactPatternProps {
  const props = reactProps(runtime.getPartProps(part, part))
  return {
    ...props,
    onClick: () => {
      if (action === 'activate') onEvent?.({ type: 'activate', key: part, meta: { reason: 'pointer' } })
      close('pointer')
    },
  }
}
