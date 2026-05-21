import { useState } from 'react'
import { reducePatternData, type PatternData, type PatternEvent } from '../../../../../src/react'
import { alertDialogDefinition } from '../../../../../src/patterns/alertdialog/definition'
import { AlertDialog } from '../AlertDialog'
import { initialAlertDialogData } from '../alertdialogData'

export function AlertDialogDemo({ onEvent }: { onEvent?: (event: PatternEvent) => void }) {
  const [data, setData] = useState<PatternData>(initialAlertDialogData)
  const handleEvent = (event: PatternEvent) => {
    onEvent?.(event)
    setData((current) => reducePatternData(alertDialogDefinition, current, event))
  }
  return <AlertDialog data={data} onEvent={handleEvent} />
}
