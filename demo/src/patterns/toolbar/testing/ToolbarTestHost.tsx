import { usePatternDataHost } from '../../../shared/demoHostState'
import { Toolbar } from '../Toolbar'
import { initialToolbarData, reduceToolbarData } from '../toolbarData'

export function ToolbarDemo() {
  const host = usePatternDataHost(initialToolbarData, reduceToolbarData)
  return <Toolbar data={host.data} onEvent={host.dispatchEvent} />
}
