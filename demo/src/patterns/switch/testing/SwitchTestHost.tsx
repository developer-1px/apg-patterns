import { useState } from 'react'
import type { PatternEvent } from '../../../../../src/react'
import { Switch } from '../Switch'
import { initialSwitchData, reduceSwitchData } from '../switchData'

export function SwitchDemo() {
  const [data, setData] = useState(initialSwitchData)
  const handleEvent = (event: PatternEvent) => setData((current) => reduceSwitchData(current, event))
  return <Switch data={data} onEvent={handleEvent} />
}
