import type { HTMLAttributes } from 'react'
import { createPatternRuntime, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src'
import { tableDefinition } from '../../../../src/patterns/table/definition'

type Props = HTMLAttributes<HTMLElement>

export function Table({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const options = (data.state?.options as PatternOptions | undefined) ?? {}
  const sortByKey = data.state?.sortByKey ?? {}

  const runtime = createPatternRuntime({
    definition: tableDefinition,
    data,
    options,
    onEvent: (event) => {
      if (event.type === 'activate') {
        const key = event.key
        if (data.items[key]?.kind === 'columnheader') {
          const current = sortByKey[key]
          const next: 'ascending' | 'descending' | 'other' = current === 'ascending' ? 'descending' : 'ascending'
          onEvent({ type: 'sort', key, sort: next })
          return
        }
      }
      onEvent(event)
    },
    keyToElementId: (key) => `tablecell-${key}`,
  })

  const rootProps = runtime.getPartProps('table') as Props
  const rowKeys = data.relations?.rowKeys ?? []
  const cells = data.relations?.cells ?? []
  const cellsByRow = (rowKey: string) => cells.filter((c) => c.rowKey === rowKey).map((c) => c.cellKey)

  // Treat row1 as header row (contains columnheaders).
  const headerRowKey = rowKeys[0]
  const bodyRowKeys = rowKeys.slice(1)

  return (
    <table {...rootProps} className="border-collapse text-sm text-zinc-800 dark:text-zinc-300">
      {headerRowKey ? (
        <thead>
          <TableRow runtime={runtime} data={data} rowKey={headerRowKey} cellKeys={cellsByRow(headerRowKey)} />
        </thead>
      ) : null}
      <tbody>
        {bodyRowKeys.map((rowKey) => (
          <TableRow key={rowKey} runtime={runtime} data={data} rowKey={rowKey} cellKeys={cellsByRow(rowKey)} />
        ))}
      </tbody>
    </table>
  )
}

function TableRow({
  runtime,
  data,
  rowKey,
  cellKeys,
}: {
  runtime: ReturnType<typeof createPatternRuntime>
  data: PatternData
  rowKey: string
  cellKeys: readonly string[]
}) {
  const rowProps = runtime.getPartProps('row', rowKey) as Props
  return (
    <tr {...rowProps}>
      {cellKeys.map((cellKey) => {
        const kind = data.items[cellKey]?.kind
        const part = kind === 'columnheader' ? 'columnheader' : kind === 'rowheader' ? 'rowheader' : 'cell'
        const cellProps = runtime.getPartProps(part, cellKey) as Props
        const Tag = part === 'columnheader' || part === 'rowheader' ? 'th' : 'td'
        const label = data.items[cellKey]?.label
        return (
          <Tag key={cellKey} {...cellProps} className="border border-zinc-200 px-3 py-1 text-left dark:border-zinc-800">
            {label}
          </Tag>
        )
      })}
    </tr>
  )
}
