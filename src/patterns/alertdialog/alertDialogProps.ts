import type { KeyboardEvent, MouseEvent } from 'react'
import { handlePatternTrapFocus } from '../../adapters/reactPatternEffects'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent } from '../../schema'
import { reactKeyInput, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { alertDialogDefinition } from './definition'

export const alertDialogOverlayProps = reactProps({
  'data-testid': 'alertdialog-overlay',
  onClick: (event: MouseEvent<HTMLElement>) => {
    if (event.target === event.currentTarget) event.preventDefault()
  },
})

export function createAlertDialogDialogProps({
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

export function createAlertDialogActionProps({
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
