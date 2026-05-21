import { useDialogPattern, type PatternData, type PatternEvent } from '../../../../src/react'
import { ds } from '../../shared/designSystem'
import { dialogFields } from './dialogData'

const overlayClass =
  'fixed inset-0 z-40 bg-black/45'
const panelClass =
  'fixed left-1/2 top-1/2 z-50 w-[28rem] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-md border border-zinc-200 bg-white p-5 text-sm text-zinc-800 outline-none dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-200'

interface DialogProps {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}

export function Dialog({ data, onEvent }: DialogProps) {
  const dialog = useDialogPattern(data, onEvent)

  return (
    <div className="grid gap-3">
      <button {...dialog.triggerProps} type="button" className={ds.button}>
        {dialog.labelOf('trigger')}
      </button>
      {dialog.open ? (
        <>
          <div {...dialog.overlayProps} className={overlayClass} data-testid="dialog-overlay" />
          <div {...dialog.dialogProps} className={panelClass}>
            <h2 {...dialog.titleProps} className="mb-1 text-base font-medium">{dialog.labelOf('title')}</h2>
            <p {...dialog.descriptionProps} className="mb-4 text-zinc-600 dark:text-zinc-400">{dialog.labelOf('description')}</p>
            <div className="grid gap-2">
              {dialogFields.map((field) => (
                <label key={field.id} className="grid grid-cols-[5rem_1fr] items-center gap-2">
                  <span>{field.label}</span>
                  <input id={`dialog-${field.id}`} type="text" className={ds.field} />
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button {...dialog.cancelProps} type="button" className={ds.button}>{dialog.labelOf('cancel')}</button>
              <button {...dialog.submitProps} type="button" className={ds.button}>{dialog.labelOf('submit')}</button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
