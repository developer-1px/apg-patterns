import { usePatternDataHost } from '../../../shared/demoHostState'
import { Checkbox } from '../Checkbox'
import { checkboxVariants } from '../checkboxData'

export function TwoStateCheckboxDemo() {
  const variant = checkboxVariants.twoState
  const host = usePatternDataHost(variant.data, variant.reduce)
  return <Checkbox data={host.data} onEvent={host.dispatchEvent} />
}

export function TriStateCheckboxDemo() {
  const variant = checkboxVariants.triState
  const host = usePatternDataHost(variant.data, variant.reduce)
  return <Checkbox data={host.data} onEvent={host.dispatchEvent} />
}
