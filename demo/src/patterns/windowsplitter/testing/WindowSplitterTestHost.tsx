import { useState } from 'react'
import type { PatternEvent } from '../../../../../src/react'
import { WindowSplitter } from '../WindowSplitter'
import { initialWindowSplitterData, reduceWindowSplitterData, windowSplitterOptions } from '../windowsplitterData'

export function WindowSplitterDemo() {
  const [data, setData] = useState(initialWindowSplitterData)
  const handleEvent = (event: PatternEvent) => {
    setData((current) => reduceWindowSplitterData(current, event, windowSplitterOptions))
  }
  return <WindowSplitter data={data} onEvent={handleEvent} options={windowSplitterOptions} />
}
