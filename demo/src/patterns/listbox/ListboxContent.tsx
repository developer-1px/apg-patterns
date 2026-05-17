import type { ReactNode } from 'react'
import type { ListboxLayoutInput } from './listboxTypes'

type ListboxLayout = {
  matches(input: ListboxLayoutInput): boolean
  render(input: ListboxLayoutInput): ReactNode
}

const listboxLayouts: readonly ListboxLayout[] = [
  {
    matches: ({ groups }) => groups.length > 0,
    render: ({ groups, visibleKeys, renderOption }) => {
      const setSize = visibleKeys.length
      let runningIndex = 0
      return groups.map((group) => {
        const labelId = `group-${group.groupKey}-label`
        return (
          <div key={group.groupKey} role="group" aria-labelledby={labelId} className="mt-1 first:mt-0">
            <div id={labelId} className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {group.groupLabel}
            </div>
            {group.optionKeys.map((key) => {
              runningIndex += 1
              return renderOption(key, runningIndex, setSize)
            })}
          </div>
        )
      })
    },
  },
  {
    matches: () => true,
    render: ({ visibleKeys, renderOption }) => visibleKeys.map((key) => renderOption(key)),
  },
]

export function ListboxContent(input: ListboxLayoutInput) {
  return <>{listboxLayouts.find((layout) => layout.matches(input))!.render(input)}</>
}
