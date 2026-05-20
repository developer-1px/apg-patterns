import { useAlertDialogPattern, type PatternData, type PatternEvent } from '../../../../src/react'

export interface AlertDialogProps {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}

export function AlertDialog({ data, onEvent }: AlertDialogProps) {
  const alertDialog = useAlertDialogPattern(data, onEvent)

  return (
    <div>
      <button {...alertDialog.triggerProps} type="button">
        {alertDialog.labelOf('trigger')}
      </button>
      {alertDialog.open ? (
        <div
          {...alertDialog.overlayProps}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)' }}
        >
          <div {...alertDialog.dialogProps}>
            <h2 id={alertDialog.ids.forKey('title')}>{alertDialog.labelOf('title')}</h2>
            <p id={alertDialog.ids.forKey('description')}>{alertDialog.labelOf('description')}</p>
            <div>
              <button {...alertDialog.confirmProps} type="button">
                {alertDialog.labelOf('confirm')}
              </button>
              <button {...alertDialog.cancelProps} type="button">
                {alertDialog.labelOf('cancel')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
