import { useTreeviewPattern, type PatternData, type PatternEvent, type PatternOptions } from '../../src'
import { Icon } from './Icon'
import { useTreeDomFocus } from './useTreeDomFocus'

export type TreeItemKind = 'folder' | 'link'

export function Tree({
  data,
  onEvent,
  options,
  itemKind = 'folder',
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  itemKind?: TreeItemKind
}) {
  const tree = useTreeviewPattern({ data, options, onEvent })
  useTreeDomFocus(data, options?.focusStrategy)

  return (
    <div className="min-h-56 bg-white py-1 outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-950 dark:focus:outline-zinc-500" {...tree.getTreeProps()}>
      {tree.items.map((item) => {
        const hasChildren = (data.relations?.childrenByKey?.[item.key]?.length ?? 0) > 0
        const expanded = data.state?.expandedKeys?.includes(item.key) ?? false
        const itemData = data.items[item.key] as { label?: string; href?: string } | undefined
        const label = itemData?.label ?? item.key
        const href = itemData?.href
        const indent = (data.state?.levelByKey?.[item.key] ?? 1) * 18

        const indicator = hasChildren ? (
          <button
            type="button"
            {...item.slotProps.indicator}
            aria-label={`toggle ${item.key}`}
            className="grid size-6 place-items-center rounded p-0 text-xs text-zinc-500 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:bg-zinc-900"
          >
            <Icon name="chevron-right" className={expanded ? 'rotate-90' : ''} />
          </button>
        ) : (
          <span className="inline-block h-6 w-6" aria-hidden="true" />
        )

        const labelNode =
          itemKind === 'link' && href ? (
            <a
              href={href}
              tabIndex={-1}
              onClick={(event) => event.preventDefault()}
              className="text-zinc-800 underline-offset-2 hover:underline dark:text-zinc-200"
            >
              {label}
            </a>
          ) : (
            <span>{itemKind === 'folder' && hasChildren ? `📁 ${label}` : itemKind === 'folder' ? `📄 ${label}` : label}</span>
          )

        return (
          <div
            key={item.key}
            {...item.slotProps.treeitem}
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
