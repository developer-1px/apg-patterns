import { dialogDefinition, reducePatternData } from '../../../../../src/react'
import { usePatternDataHost } from '../../../shared/demoHostState'
import { Dialog } from '../Dialog'
import { initialDialogData } from '../dialogData'

export function DialogDemo() {
  const host = usePatternDataHost(initialDialogData, (data, event) => reducePatternData(dialogDefinition, data, event))
  return <Dialog data={host.data} onEvent={host.dispatchEvent} />
}
