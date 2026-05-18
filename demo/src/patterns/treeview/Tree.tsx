import { useTreeviewPattern, type PatternData, type PatternEvent, type PatternItem, type PatternOptions } from '../../../../src'
import { cx, ds } from '../../shared/designSystem'
import { Icon } from '../../shared/Icon'

type TreeItem = PatternItem & {
  href?: string
}

export function Tree({
  data,
  onEvent,
  options,
}: {
  data: PatternData<TreeItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
}) {
  const tree = useTreeviewPattern(data, onEvent, options ?? {})

  return (
    <div {...tree.rootProps} className={cx('min-h-56 rounded-xl bg-white/40 py-1 dark:bg-transparent', ds.focusRing)}>
      {tree.renderItems.map((item) => {
        const href = data.items[item.key]?.href
        const indent = item.level * 18

        const indicator = item.kind === 'branch' ? (
          <button
            {...item.toggleButtonProps}
            aria-label={`toggle ${item.key}`}
            className="grid size-6 place-items-center rounded-lg p-0 text-xs text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-500 dark:hover:bg-white/[0.06]"
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
              {item.label}
            </a>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Icon name={item.kind === 'branch' ? 'folder' : 'file'} className="text-zinc-500" />
              {item.label}
            </span>
          )

        return (
          <div
            key={item.key}
            {...item.treeitemProps}
            className={cx(ds.listOption, 'flex min-h-8 items-center gap-1.5 px-1')}
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
