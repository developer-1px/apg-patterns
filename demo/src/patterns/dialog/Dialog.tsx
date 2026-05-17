import { useReducer } from 'react'
import { reducePatternData, useDialogPattern, type PatternData, type PatternEvent } from '../../../../src'
import { dialogDefinition } from '../../../../src/patterns/dialog/definition'
import { dialogContent, initialDialogData } from './dialogData'

const triggerClass =
  'inline-flex h-8 items-center rounded-xl bg-zinc-100/80 px-3 text-sm font-medium text-zinc-800 shadow-sm outline-none transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:bg-white/[0.08] dark:focus-visible:outline-zinc-500'
const overlayClass =
  'fixed inset-0 z-40 bg-black/45 backdrop-blur-sm'
const panelClass =
  'fixed left-1/2 top-1/2 z-50 w-[28rem] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/95 p-5 text-sm text-zinc-800 shadow-[0_24px_80px_rgba(0,0,0,0.24)] ring-1 ring-black/[0.03] outline-none backdrop-blur dark:bg-zinc-950/95 dark:text-zinc-200 dark:ring-white/[0.05]'
const inputClass =
  'h-8 w-full rounded-lg bg-zinc-100/70 px-2.5 text-sm outline-none ring-1 ring-black/[0.03] transition focus:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.06] dark:ring-white/[0.04] dark:focus:bg-white/[0.08] dark:focus-visible:outline-zinc-500'
const buttonClass =
  'inline-flex h-8 items-center rounded-xl bg-zinc-100/80 px-3 text-sm font-medium text-zinc-800 shadow-sm outline-none transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:bg-white/[0.08] dark:focus-visible:outline-zinc-500'

export interface DialogProps {
  data?: PatternData
  onEvent?: (event: PatternEvent) => void
}

export function Dialog({ data = initialDialogData, onEvent }: DialogProps = {}) {
  const [localData, dispatch] = useReducer(
    (current: PatternData, event: PatternEvent) => reducePatternData(dialogDefinition, current, event),
    data,
  )
  const isControlled = onEvent !== undefined
  const dialog = useDialogPattern(isControlled ? data : localData, isControlled ? onEvent : dispatch)

  return (
    <div className="grid gap-3">
      <button {...dialog.triggerProps} type="button" className={triggerClass}>
        {dialog.labelOf('trigger')}
      </button>
      {dialog.open ? (
        <>
          <div {...dialog.overlayProps} className={overlayClass} data-testid="dialog-overlay" />
          <div {...dialog.dialogProps} className={panelClass}>
            <h2 {...dialog.titleProps} className="mb-1 text-base font-medium">{dialog.labelOf('title')}</h2>
            <p {...dialog.descriptionProps} className="mb-4 text-zinc-600 dark:text-zinc-400">{dialog.labelOf('description')}</p>
            <div className="grid gap-2">
              {dialogContent.fields.map((field) => (
                <label key={field.id} className="grid grid-cols-[5rem_1fr] items-center gap-2">
                  <span>{field.label}</span>
                  <input id={`dialog-${field.id}`} type="text" className={inputClass} />
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button {...dialog.cancelProps} type="button" className={buttonClass}>{dialog.labelOf('cancel')}</button>
              <button {...dialog.submitProps} type="button" className={buttonClass}>{dialog.labelOf('submit')}</button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
