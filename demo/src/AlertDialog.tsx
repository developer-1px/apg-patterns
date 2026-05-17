import { type HTMLAttributes, type KeyboardEvent, type MouseEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { createPatternRuntime, handlePatternTrapFocus, usePatternEffects, type Key, type PatternData, type PatternEvent } from '../../src'
import { alertDialogDefinition } from '../../src/patterns/alertdialog/definition'

export interface AlertDialogProps {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}

const keyToElementId = (key: Key) => `alertdialog-${key}`

export function AlertDialog({ data, onEvent }: AlertDialogProps) {
  const runtime = createPatternRuntime({ definition: alertDialogDefinition, data, options: {}, onEvent, keyToElementId })
  const open = data.state?.expandedKeys?.includes('trigger') ?? false
  const rootKeyDown = runtime.getRootKeyboardHandler()
  usePatternEffects({ definition: alertDialogDefinition, data, keyToElementId })

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      onEvent({ type: 'extension', name: 'alertDialogCancel', key: 'cancel' })
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
                  onEvent({ type: 'extension', name: 'alertDialogConfirm', key: 'confirm' })
                }}
              >
                {labelOf('confirm')}
              </button>
              <button
                {...cancelProps}
                type="button"
                onClick={(event) => {
                  cancelProps.onClick?.(event)
                  onEvent({ type: 'extension', name: 'alertDialogCancel', key: 'cancel' })
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
