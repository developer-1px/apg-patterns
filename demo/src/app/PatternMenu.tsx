import type { HTMLAttributes } from 'react'
import { listboxDefinition, reducePatternData, useListboxPattern, type PatternData } from '../../../src/react'
import { patternItems } from '../shared/demoPatterns'
import type { PatternKey } from '../shared/demoPatternTypes'
import { cx, ds } from '../shared/designSystem'

type Props = HTMLAttributes<HTMLElement>

const patternMenuKeyboardShortcuts = listboxDefinition.keyboard.map((binding) => binding.shortcut)

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
      className={cx('mt-3 flex gap-1 overflow-x-auto whitespace-nowrap pb-1 lg:grid lg:gap-0.5 lg:overflow-visible lg:whitespace-normal lg:pb-0', ds.focusRing)}
    >
      {listbox.renderItems.map((item) => {
        const optionProps = item.optionProps as Props
        return (
          <button
            {...optionProps}
            key={item.key}
            type="button"
            className={cx(ds.option, 'shrink-0 text-sm dark:ui-selected:bg-zinc-100 lg:shrink')}
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
