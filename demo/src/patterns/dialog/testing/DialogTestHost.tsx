import { dialogDefinition, reducePatternData, type PatternData } from '../../../../../src/react'
import { usePatternDataHost } from '../../../shared/demoHostState'
import { Dialog } from '../Dialog'
import { initialDialogData } from '../dialogData'

export function DialogDemo({ data = initialDialogData }: { data?: PatternData }) {
  const host = usePatternDataHost(data, (current, event) => reducePatternData(dialogDefinition, current, event))
  return <Dialog data={host.data} onEvent={host.dispatchEvent} />
}
