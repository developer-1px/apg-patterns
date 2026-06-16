import type { KeyboardEvent, MouseEvent } from 'react'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import { withDefaultReason } from '../../kernel/domEventBindings'
import { handlePatternTrapFocus, usePatternEffects } from '../../adapters/reactPatternEffects'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { reactKeyInput, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { alertDialogDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'
import { getAlertDialogRuntimeKeys } from './alertDialogRuntimeKeys'

export interface ReactAlertDialogRuntime {
  open: boolean
  triggerProps: ReactPatternProps
  overlayProps: ReactPatternProps
  dialogProps: ReactPatternProps
  titleProps: ReactPatternProps
  descriptionProps: ReactPatternProps
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
  const keys = getAlertDialogRuntimeKeys(data)

  usePatternEffects({ definition: alertDialogDefinition, data: runtime.data, keyToElementId })

  return {
    open: keys.triggerKey ? data.state?.expandedKeys?.includes(keys.triggerKey) ?? false : false,
    get triggerProps() {
      return keys.triggerKey ? reactProps(runtime.getPartProps('trigger', keys.triggerKey)) : {}
    },
    overlayProps: alertDialogOverlayProps,
    get dialogProps() {
      return keys.dialogKey ? createAlertDialogDialogProps({ runtime, data, onEvent, keyToElementId, dialogKey: keys.dialogKey }) : {}
    },
    get titleProps() {
      return keys.titleKey ? reactProps(runtime.getPartProps('title', keys.titleKey)) : {}
    },
    get descriptionProps() {
      return keys.descriptionKey ? reactProps(runtime.getPartProps('description', keys.descriptionKey)) : {}
    },
    get confirmProps() {
      return keys.confirmKey ? createAlertDialogActionProps({ runtime, part: 'confirm', key: keys.confirmKey, onEvent }) : {}
    },
    get cancelProps() {
      return keys.cancelKey ? createAlertDialogActionProps({ runtime, part: 'cancel', key: keys.cancelKey, onEvent }) : {}
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
  dialogKey,
}: {
  runtime: PatternRuntime
  data: PatternData
  onEvent: (event: PatternEvent) => void
  keyToElementId: (key: Key) => string
  dialogKey: Key
}): ReactPatternProps {
  const rootKeyDown = runtime.getRootKeyboardHandler()
  return reactProps({
    ...runtime.getPartProps('dialog', dialogKey),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Escape') onEvent(withDefaultReason({ type: 'activate', key: 'cancel' }, 'keyboard'))
      rootKeyDown(reactKeyInput(event))
      handlePatternTrapFocus({ event, definition: alertDialogDefinition, data, keyToElementId })
    },
  })
}

function createAlertDialogActionProps({
  runtime,
  part,
  key,
  onEvent,
}: {
  runtime: PatternRuntime
  part: 'confirm' | 'cancel'
  key: Key
  onEvent: (event: PatternEvent) => void
}): ReactPatternProps {
  const props = reactProps(runtime.getPartProps(part, key))
  return {
    ...props,
    onClick: (event: MouseEvent<HTMLElement>) => {
      onEvent(withDefaultReason({ type: 'activate', key }, 'pointer'))
      props.onClick?.(event)
    },
  }
}
