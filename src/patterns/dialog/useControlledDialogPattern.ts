import type { KeyboardEvent, MouseEvent } from 'react'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { usePatternElementId } from '../../adapters/reactDomIds'
import { registerKernelBuiltins } from '../../kernel/kernelBuiltins'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { dialogDefinition } from './definition'
import {
  dialogKey,
  emitControlledDialogClose,
  handleControlledDialogKeyDown,
  useControlledDialogFocus,
  type ReactControlledDialogConfig,
} from './controlledDialog'

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
    get overlayProps() {
      return createControlledDialogOverlayProps({ runtime, close })
    },
    get dialogProps() {
      return createControlledDialogProps({ runtime, open: config.open, keyToElementId, close })
    },
    get titleProps() {
      return reactProps(runtime.getPartProps('title', 'title'))
    },
    get descriptionProps() {
      return reactProps(runtime.getPartProps('description', 'description'))
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
  runtime: ReturnType<typeof createPatternRuntime>
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
  close,
}: {
  runtime: ReturnType<typeof createPatternRuntime>
  open: boolean
  keyToElementId(key: Key): string
  close(reason: 'keyboard'): void
}): ReactPatternProps {
  return reactProps({
    ...runtime.getPartProps('dialog', dialogKey()),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => handleControlledDialogKeyDown({
      event,
      open,
      keyToElementId,
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
  runtime: ReturnType<typeof createPatternRuntime>
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
