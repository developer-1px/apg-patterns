import { reducePatternData } from '../../../../../src/react'
import { treegridDefinition } from '../../../../../src/patterns/treegrid/definition'
import { usePatternDataHost } from '../../../shared/demoHostState'
import { Treegrid } from '../Treegrid'
import { initialTreegridData } from '../treegridData'

if (typeof globalThis.CSS === 'undefined') {
  ;(globalThis as { CSS?: { escape: (value: string) => string } }).CSS = { escape: (value: string) => value }
}

export function TreegridDemo() {
  const host = usePatternDataHost(initialTreegridData, (data, event) => reducePatternData(treegridDefinition, data, event))
  return <Treegrid data={host.data} onEvent={host.dispatchEvent} />
}

export function RowFocusTreegridDemo({ activeKey = 'src' }: { activeKey?: string }) {
  const host = usePatternDataHost({
    ...initialTreegridData,
    state: {
      ...initialTreegridData.state,
      activeKey,
      selectedKeys: [activeKey],
    },
  }, (data, event) => reducePatternData(treegridDefinition, data, event))
  return <Treegrid data={host.data} options={{ focusMode: 'row' }} onEvent={host.dispatchEvent} />
}
