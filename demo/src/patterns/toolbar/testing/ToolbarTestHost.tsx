import type { PatternData } from '../../../../../src/react'
import { usePatternDataHost } from '../../../shared/demoHostState'
import { Toolbar } from '../Toolbar'
import { initialToolbarData, reduceToolbarData } from '../toolbarData'

export function ToolbarDemo({ data = initialToolbarData }: { data?: PatternData }) {
  const host = usePatternDataHost(data, reduceToolbarData)
  return <Toolbar data={host.data} onEvent={host.dispatchEvent} />
}
