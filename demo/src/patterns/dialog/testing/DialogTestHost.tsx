import { useState } from 'react'
import { dialogDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../../../../src/react'
import { Dialog } from '../Dialog'
import { initialDialogData } from '../dialogData'

export function DialogDemo() {
  const [data, setData] = useState<PatternData>(initialDialogData)
  const handleEvent = (event: PatternEvent) => setData((current) => reducePatternData(dialogDefinition, current, event))
  return <Dialog data={data} onEvent={handleEvent} />
}
