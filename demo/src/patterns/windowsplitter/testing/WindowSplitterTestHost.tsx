import { usePatternDataHost } from '../../../shared/demoHostState'
import { WindowSplitter } from '../WindowSplitter'
import { initialWindowSplitterData, reduceWindowSplitterData, windowSplitterOptions } from '../windowsplitterData'

export function WindowSplitterDemo() {
  const host = usePatternDataHost(initialWindowSplitterData, (data, event) => reduceWindowSplitterData(data, event, windowSplitterOptions))
  return <WindowSplitter data={host.data} onEvent={host.dispatchEvent} options={windowSplitterOptions} />
}
