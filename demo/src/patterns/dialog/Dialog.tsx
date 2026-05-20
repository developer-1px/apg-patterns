import { useDialogPattern, type PatternData, type PatternEvent } from '../../../../src'
import { ds } from '../../shared/designSystem'
import { dialogContent } from './dialogData'

const triggerClass = ds.button
const overlayClass =
  'fixed inset-0 z-40 bg-black/45 backdrop-blur-sm'
const panelClass =
  'fixed left-1/2 top-1/2 z-50 w-[28rem] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/96 p-5 text-sm text-zinc-800 shadow-[0_28px_88px_rgba(0,0,0,0.26)] outline-none backdrop-blur dark:bg-zinc-950/96 dark:text-zinc-200'
const inputClass = ds.field
const buttonClass = ds.button

export interface DialogProps {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}

export function Dialog({ data, onEvent }: DialogProps) {
  const dialog = useDialogPattern(data, onEvent)

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
