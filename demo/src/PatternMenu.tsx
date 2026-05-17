import type { HTMLAttributes } from 'react'
import { createPatternRuntime, listboxDefinition, reducePatternData, type PatternData } from '../../src'
import { patternItems, type PatternKey } from './demoPatterns'

type Props = HTMLAttributes<HTMLElement>

export const patternMenuKeyboardShortcuts = listboxDefinition.keyboard.map((binding) => binding.shortcut)

export function PatternMenu({ value, onChange }: { value: PatternKey; onChange: (value: PatternKey) => void }) {
  const data = createPatternMenuData(value)
  const runtime = createPatternRuntime({
    definition: listboxDefinition,
    data,
    options: { focusStrategy: 'rovingTabIndex', selectionMode: 'single' },
    onEvent: (event) => {
      if (event.type === 'select') selectPattern(event.keys[0], onChange)
      if (event.type === 'navigate') selectPattern(reducePatternData(listboxDefinition, data, event).state?.activeKey, onChange)
    },
    keyToElementId: (key) => `pattern-${key}`,
  })
  const rootProps = runtime.getPartProps('listbox') as Props

  return (
    <div
      {...rootProps}
      aria-keyshortcuts={patternMenuKeyboardShortcuts.join(' ')}
      className="mt-3 grid gap-0.5 outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:focus:outline-zinc-500"
    >
      {patternItems.map((item) => {
        const optionProps = runtime.getPartProps('option', item.key) as Props
        return (
          <button
            {...optionProps}
            key={item.key}
            type="button"
            className="h-7 rounded px-2 text-left text-sm text-zinc-500 hover:bg-zinc-100 aria-selected:bg-zinc-900 aria-selected:text-white dark:text-zinc-500 dark:hover:bg-zinc-900 dark:aria-selected:bg-zinc-100 dark:aria-selected:text-zinc-950"
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
  if (patternItems.some((item) => item.key === key)) onChange(key as PatternKey)
}
