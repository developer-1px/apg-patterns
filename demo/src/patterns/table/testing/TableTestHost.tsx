import { usePatternDataHost } from '../../../shared/demoHostState'
import { Table } from '../Table'
import { reduceTableDemoData, tableVariants, type TableVariantKey } from '../tableData'

export function TableDemo({ variant = 'basic' }: { variant?: TableVariantKey }) {
  const host = usePatternDataHost(tableVariants[variant].data, reduceTableDemoData)
  return <Table data={host.data} onEvent={host.dispatchEvent} />
}
