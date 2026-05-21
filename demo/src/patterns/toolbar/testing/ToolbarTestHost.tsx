import { useState } from 'react'
import type { PatternEvent } from '../../../../../src/react'
import { Toolbar } from '../Toolbar'
import { initialToolbarData, reduceToolbarData } from '../toolbarData'

export function ToolbarDemo() {
  const [data, setData] = useState(initialToolbarData)
  const handleEvent = (event: PatternEvent) => setData((current) => reduceToolbarData(current, event))
  return <Toolbar data={data} onEvent={handleEvent} />
}
