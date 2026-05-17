import { useLayoutEffect, useReducer, type KeyboardEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { createPatternRuntime, reducePatternData, type Key, type PatternData, type PatternEvent } from '../../src'
import { dialogDefinition } from '../../src/patterns/dialog/definition'
import { dialogContent, initialDialogData } from './dialogData'
import { handlePatternTrapFocus, usePatternEffects } from './patternEffects'

const triggerClass =
  'inline-flex h-8 items-center rounded bg-zinc-100 px-3 text-sm text-zinc-800 outline-none hover:bg-zinc-200 focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus:outline-zinc-500'
const overlayClass =
  'fixed inset-0 z-40 bg-black/40'
const panelClass =
  'fixed left-1/2 top-1/2 z-50 w-[28rem] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded bg-white p-5 text-sm text-zinc-800 shadow-lg outline-none dark:bg-zinc-900 dark:text-zinc-200'
const inputClass =
  'h-8 w-full rounded border border-zinc-300 bg-white px-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950'
const buttonClass =
  'inline-flex h-8 items-center rounded bg-zinc-100 px-3 text-sm text-zinc-800 outline-none hover:bg-zinc-200 focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800'

const keyToElementId = (key: Key) => (key === 'dialog' ? 'dialog-panel' : `dialog-${key}`)

export interface DialogProps {
  data?: PatternData
}

export function Dialog({ data: initialData = initialDialogData }: DialogProps = {}) {
  const [data, dispatch] = useReducer(
    (current: PatternData, event: PatternEvent) => reducePatternData(dialogDefinition, current, event),
    initialData,
  )
  const runtime = createPatternRuntime({ definition: dialogDefinition, data, options: {}, onEvent: dispatch, keyToElementId })
  const open = data.state?.expandedKeys?.includes('trigger') ?? false
  const rootKeyDown = runtime.getRootKeyboardHandler()
  usePatternEffects({ definition: dialogDefinition, data, keyToElementId })

  useLayoutEffect(() => {
    if (open) document.getElementById('dialog-street')?.focus({ preventScroll: true })
  }, [open])

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    rootKeyDown(event as unknown as KeyInput & { preventDefault?: () => void })
    handlePatternTrapFocus({ event, definition: dialogDefinition, data, keyToElementId })
  }
  const labelOf = (key: string) => data.items[key]?.label ?? key

  return (
    <div className="grid gap-3">
      <button
        {...runtime.getPartProps('trigger', 'trigger')}
        type="button"
        className={triggerClass}
      >
        {labelOf('trigger')}
      </button>
      {open ? (
        <>
          <div {...runtime.getPartProps('overlay')} className={overlayClass} data-testid="dialog-overlay" />
          <div
            {...runtime.getPartProps('dialog', 'dialog')}
            className={panelClass}
            onKeyDown={onPanelKeyDown}
            tabIndex={-1}
          >
            <h2 {...runtime.getPartProps('title', 'title')} className="mb-1 text-base font-medium">{labelOf('title')}</h2>
            <p {...runtime.getPartProps('description', 'description')} className="mb-4 text-zinc-600 dark:text-zinc-400">{labelOf('description')}</p>
            <div className="grid gap-2">
              {dialogContent.fields.map((field) => (
                <label key={field.id} className="grid grid-cols-[5rem_1fr] items-center gap-2">
                  <span>{field.label}</span>
                  <input id={`dialog-${field.id}`} type="text" className={inputClass} />
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button {...runtime.getPartProps('cancel', 'cancel')} type="button" className={buttonClass}>{labelOf('cancel')}</button>
              <button {...runtime.getPartProps('submit', 'submit')} type="button" className={buttonClass}>{labelOf('submit')}</button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
