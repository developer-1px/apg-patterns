import { useState } from 'react'
import { reducePatternData, type PatternData, type PatternEvent } from '../../../../../src/react'
import { treegridDefinition } from '../../../../../src/patterns/treegrid/definition'
import { Treegrid } from '../Treegrid'
import { initialTreegridData } from '../treegridData'

if (typeof globalThis.CSS === 'undefined') {
  ;(globalThis as { CSS?: { escape: (value: string) => string } }).CSS = { escape: (value: string) => value }
}

export function TreegridDemo() {
  const [data, setData] = useState<PatternData>(initialTreegridData)
  return <Treegrid data={data} onEvent={(event: PatternEvent) => setData((current) => reducePatternData(treegridDefinition, current, event))} />
}

export function RowFocusTreegridDemo({ activeKey = 'src' }: { activeKey?: string }) {
  const [data, setData] = useState<PatternData>({
    ...initialTreegridData,
    state: {
      ...initialTreegridData.state,
      activeKey,
      selectedKeys: [activeKey],
    },
  })
  return (
    <Treegrid
      data={data}
      options={{ focusMode: 'row' }}
      onEvent={(event: PatternEvent) => setData((current) => reducePatternData(treegridDefinition, current, event))}
    />
  )
}
