import { usePatternDataHost } from '../../../shared/demoHostState'
import { RadioGroup } from '../RadioGroup'
import { initialRadioData, reduceRadioData } from '../radioData'

export function RadioDemo() {
  const host = usePatternDataHost(initialRadioData, reduceRadioData)
  return <RadioGroup data={host.data} onEvent={host.dispatchEvent} />
}
