import { usePatternDataHost } from '../../../shared/demoHostState'
import { Switch } from '../Switch'
import { initialSwitchData, reduceSwitchData } from '../switchData'

export function SwitchDemo() {
  const host = usePatternDataHost(initialSwitchData, reduceSwitchData)
  return <Switch data={host.data} onEvent={host.dispatchEvent} />
}
