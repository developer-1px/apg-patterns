import type { ReactNode } from 'react'

export type ListboxGroup = {
  groupKey: string
  groupLabel: string
  optionKeys: readonly string[]
}

type ListboxContentProps = {
  groups: readonly ListboxGroup[]
  visibleKeys: readonly string[]
  renderOption(key: string, posIndex?: number, setSize?: number): ReactNode
}

export function ListboxContent({ groups, visibleKeys, renderOption }: ListboxContentProps) {
  if (groups.length === 0) return <>{visibleKeys.map((key) => renderOption(key))}</>

  const setSize = visibleKeys.length
  let runningIndex = 0
  return (
    <>
      {groups.map((group) => {
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
      })}
    </>
  )
}
