import { reducePatternData, type PatternEvent } from '../../../../../src/react'
import { alertDialogDefinition } from '../../../../../src/patterns/alertdialog/definition'
import { usePatternDataHost } from '../../../shared/demoHostState'
import { AlertDialog } from '../AlertDialog'
import { initialAlertDialogData } from '../alertdialogData'

export function AlertDialogDemo({ onEvent }: { onEvent?: (event: PatternEvent) => void }) {
  const host = usePatternDataHost(initialAlertDialogData, (data, event) => reducePatternData(alertDialogDefinition, data, event))
  const handleEvent = (event: PatternEvent) => {
    onEvent?.(event)
    host.dispatchEvent(event)
  }
  return <AlertDialog data={host.data} onEvent={handleEvent} />
}
