import { useTreeviewPattern, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src'
import { Icon } from '../../shared/Icon'

export function Tree({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const options = (data.state?.options as PatternOptions | undefined) ?? {}
  const tree = useTreeviewPattern(data, onEvent, options)

  return (
    <div {...tree.rootProps} className="min-h-56 bg-white py-1 outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-950 dark:focus:outline-zinc-500">
      {tree.renderItems.map((item) => {
        const itemData = data.items[item.key] as { label?: string; href?: string } | undefined
        const label = item.label
        const href = itemData?.href
        const indent = item.level * 18

        const indicator = item.kind === 'branch' ? (
          <button
            {...item.toggleButtonProps}
            aria-label={`toggle ${item.key}`}
            className="grid size-6 place-items-center rounded p-0 text-xs text-zinc-500 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:bg-zinc-900"
          >
            <Icon name="chevron-right" className={item.state.expanded ? 'rotate-90' : ''} />
          </button>
        ) : (
          <span className="inline-block h-6 w-6" aria-hidden="true" />
        )

        const labelNode =
          href ? (
            <a
              href={href}
              tabIndex={-1}
              onClick={(event) => event.preventDefault()}
              className="text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
            >
              {label}
            </a>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Icon name={item.kind === 'branch' ? 'folder' : 'file'} className="text-zinc-500" />
              {label}
            </span>
          )

        return (
          <div
            key={item.key}
            {...item.treeitemProps}
            className="flex min-h-8 items-center gap-1.5 rounded px-1 text-sm text-zinc-800 outline-none aria-selected:bg-zinc-100 aria-selected:text-zinc-950 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-300 dark:aria-selected:bg-zinc-900 dark:aria-selected:text-zinc-50 dark:focus:outline-zinc-500"
            style={{ paddingLeft: `${indent}px` }}
          >
            {indicator}
            {labelNode}
          </div>
        )
      })}
    </div>
  )
}
