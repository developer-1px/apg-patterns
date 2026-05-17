import type { HTMLAttributes } from 'react'
import { listboxDefinition, reducePatternData, useListboxPattern, type PatternData } from '../../../src'
import { patternItems, type PatternKey } from '../shared/demoPatterns'

type Props = HTMLAttributes<HTMLElement>

export const patternMenuKeyboardShortcuts = listboxDefinition.keyboard.map((binding) => binding.shortcut)

export function PatternMenu({ value, onChange }: { value: PatternKey; onChange: (value: PatternKey) => void }) {
  const data = createPatternMenuData(value)
  const listbox = useListboxPattern(
    data,
    (event) => {
      if (event.type === 'select') selectPattern(event.keys[0], onChange)
      if (event.type === 'navigate') selectPattern(reducePatternData(listboxDefinition, data, event).state?.activeKey, onChange)
    },
    { focusStrategy: 'rovingTabIndex', selectionMode: 'single', elementIdPrefix: 'pattern-' },
  )

  return (
    <div
      {...listbox.rootProps}
      aria-keyshortcuts={patternMenuKeyboardShortcuts.join(' ')}
      className="mt-3 flex gap-1 overflow-x-auto whitespace-nowrap pb-1 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:focus-visible:outline-zinc-500 lg:grid lg:gap-0.5 lg:overflow-visible lg:whitespace-normal lg:pb-0"
    >
      {listbox.renderItems.map((item) => {
        const optionProps = item.optionProps as Props
        return (
          <button
            {...optionProps}
            key={item.key}
            type="button"
            className="min-h-8 shrink-0 rounded-lg px-2.5 text-left text-sm font-medium text-zinc-500 outline-none transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 aria-selected:bg-zinc-900 aria-selected:text-white aria-selected:shadow-sm dark:text-zinc-500 dark:hover:bg-white/[0.06] dark:hover:text-zinc-100 dark:focus-visible:outline-zinc-500 dark:aria-selected:bg-zinc-100 dark:aria-selected:text-zinc-950 lg:shrink"
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

function createPatternMenuData(value: PatternKey): PatternData {
  return {
    items: Object.fromEntries(patternItems.map((item) => [item.key, { label: item.label }])),
    relations: {
      rootKeys: patternItems.map((item) => item.key),
    },
    state: {
      activeKey: value,
      selectedKeys: [value],
    },
    refs: { label: 'APG patterns' },
  }
}

function selectPattern(key: string | null | undefined, onChange: (value: PatternKey) => void) {
  if (typeof key === 'string' && patternItems.some((item) => item.key === key)) onChange(key)
}
