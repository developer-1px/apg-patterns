import type { KeyboardEvent, MouseEvent } from 'react'
import { handlePatternTrapFocus } from '../../adapters/reactPatternEffects'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternDataWithOptions, PatternEvent } from '../../schema'
import { reactKeyInput, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { alertDialogDefinition } from './definition'

export const alertDialogOverlayProps = {
  'data-testid': 'alertdialog-overlay',
  onClick: (event: MouseEvent<HTMLElement>) => {
    if (event.target === event.currentTarget) event.preventDefault()
  },
} as ReactPatternProps

export function createAlertDialogDialogProps({
  runtime,
  data,
  onEvent,
  keyToElementId,
}: {
  runtime: ReturnType<typeof createPatternRuntime>
  data: PatternDataWithOptions
  onEvent: (event: PatternEvent) => void
  keyToElementId: (key: Key) => string
}): ReactPatternProps {
  const rootKeyDown = runtime.getRootKeyboardHandler()
  return {
    ...(runtime.getPartProps('dialog', 'dialog') as ReactPatternProps),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Escape') onEvent({ type: 'activate', key: 'cancel' })
      rootKeyDown(reactKeyInput(event))
      handlePatternTrapFocus({ event, definition: alertDialogDefinition, data, keyToElementId })
    },
  } as ReactPatternProps
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
  const props = runtime.getPartProps(part, part) as ReactPatternProps
  return {
    ...props,
    onClick: (event: MouseEvent<HTMLElement>) => {
      props.onClick?.(event)
      onEvent({ type: 'activate', key: part })
    },
  }
}
