import { useState } from 'react'
import { reducePatternData, type PatternData, type PatternEvent } from '../../../../../src/react'
import { tableDefinition } from '../../../../../src/patterns/table/definition'
import { Table } from '../Table'
import { tableVariants, type TableVariantKey } from '../tableData'

export function TableDemo({ variant = 'basic' }: { variant?: TableVariantKey }) {
  const [data, setData] = useState<PatternData>(tableVariants[variant].data)
  const handleEvent = (event: PatternEvent) => {
    if (event.type === 'sort') {
      setData((current) => ({
        ...current,
        state: { ...current.state, sortByKey: { ...current.state?.sortByKey, [event.key]: event.sort } },
      }))
      return
    }
    setData((current) => reducePatternData(tableDefinition, current, event))
  }
  return <Table data={data} onEvent={handleEvent} />
}
