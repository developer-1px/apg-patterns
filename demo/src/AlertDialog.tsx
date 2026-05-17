import { useReducer, type HTMLAttributes, type KeyboardEvent, type MouseEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { createPatternRuntime, reducePatternData, type Key, type PatternData, type PatternEvent } from '../../src'
import { alertDialogDefinition } from '../../src/patterns/alertdialog/definition'
import { initialAlertDialogData } from './alertdialogData'
import { handlePatternTrapFocus, usePatternEffects } from './patternEffects'

export interface AlertDialogProps {
  data?: PatternData
  onConfirm?: () => void
  onCancel?: () => void
}

const keyToElementId = (key: Key) => `alertdialog-${key}`

export function AlertDialog({ data: initialData = initialAlertDialogData, onConfirm, onCancel }: AlertDialogProps) {
  const [data, dispatch] = useReducer(
    (current: PatternData, event: PatternEvent) => reducePatternData(alertDialogDefinition, current, event),
    initialData,
  )
  const runtime = createPatternRuntime({ definition: alertDialogDefinition, data, options: {}, onEvent: dispatch, keyToElementId })
  const open = data.state?.expandedKeys?.includes('trigger') ?? false
  const rootKeyDown = runtime.getRootKeyboardHandler()
  usePatternEffects({ definition: alertDialogDefinition, data, keyToElementId })

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      onCancel?.()
    }
    rootKeyDown(event as unknown as KeyInput & { preventDefault?: () => void })
    handlePatternTrapFocus({ event, definition: alertDialogDefinition, data, keyToElementId })
  }

  const stopOverlay = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      // overlay click does NOT close per APG alertdialog (modal demands explicit choice)
      event.preventDefault()
    }
  }
  const labelOf = (key: string) => data.items[key]?.label ?? key
  const confirmProps = runtime.getPartProps('confirm', 'confirm') as HTMLAttributes<HTMLButtonElement>
  const cancelProps = runtime.getPartProps('cancel', 'cancel') as HTMLAttributes<HTMLButtonElement>

  return (
    <div>
      <button
        {...runtime.getPartProps('trigger', 'trigger')}
        type="button"
      >
        {labelOf('trigger')}
      </button>
      {open ? (
        <div
          data-testid="alertdialog-overlay"
          onClick={stopOverlay}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)' }}
        >
          <div
            {...runtime.getPartProps('dialog', 'dialog')}
            onKeyDown={handleKeyDown}
          >
            <h2 id={keyToElementId('title')}>{labelOf('title')}</h2>
            <p id={keyToElementId('description')}>{labelOf('description')}</p>
            <div>
              <button
                {...confirmProps}
                type="button"
                onClick={(event) => {
                  confirmProps.onClick?.(event)
                  onConfirm?.()
                }}
              >
                {labelOf('confirm')}
              </button>
              <button
                {...cancelProps}
                type="button"
                onClick={(event) => {
                  cancelProps.onClick?.(event)
                  onCancel?.()
                }}
              >
                {labelOf('cancel')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
