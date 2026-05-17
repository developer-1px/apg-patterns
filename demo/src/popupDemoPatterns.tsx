import { useState } from 'react'
import { menubarDefinition, menuButtonDefinition, reducePatternData, type PatternData } from '../../src'
import { Combobox } from './Combobox'
import { buildComboboxData, comboboxVariants, reduceComboboxData, type ComboboxVariantKey } from './comboboxData'
import { renderComboboxInspect, renderMenuInspect } from './inspect'
import { Menu } from './Menu'
import { menuVariantItems, menuVariants, type MenuVariantKey } from './menuData'
import { type DemoPattern, type EmitPatternEvent, selectClass } from './demoPatternTypes'

export function usePopupDemoPatterns(onEvent: EmitPatternEvent): readonly DemoPattern[] {
  return [useMenuDemoPattern(onEvent), useComboboxDemoPattern(onEvent)]
}

function useMenuDemoPattern(onEvent: EmitPatternEvent): DemoPattern {
  const [variant, setVariant] = useState<MenuVariantKey>('editorMenubar')
  const [data, setData] = useState<PatternData>(menuVariants.editorMenubar.data)
  const apgPattern = menuVariants[variant].apgPattern
  const focusStrategy = menuVariants[variant].focusStrategy
  const definition = apgPattern === 'menubar' ? menubarDefinition : menuButtonDefinition
  return {
    key: 'menuAndMenubar',
    label: 'Menu and Menubar',
    keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Space', 'Escape'],
    sourceNames: ['Menu.tsx', 'menuData.ts', 'menu/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
    inspect: renderMenuInspect(data, apgPattern, focusStrategy),
    variants: (
      <div className="grid gap-1">
        {menuVariantItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setVariant(item.key)
              setData(menuVariants[item.key].data)
            }}
            aria-pressed={variant === item.key}
            className="h-7 rounded px-2 text-left text-xs text-zinc-600 hover:bg-zinc-100 aria-pressed:bg-zinc-900 aria-pressed:text-white dark:text-zinc-400 dark:hover:bg-zinc-900 dark:aria-pressed:bg-zinc-100 dark:aria-pressed:text-zinc-950"
          >
            {item.label}
          </button>
        ))}
      </div>
    ),
    preview: <Menu key={variant} data={data} apgPattern={apgPattern} focusStrategy={focusStrategy} onEvent={(event) => {
      onEvent(event)
      setData((current) => reducePatternData(definition, current, event))
    }} />,
    reset: () => setData(menuVariants[variant].data),
  }
}

function useComboboxDemoPattern(onEvent: EmitPatternEvent): DemoPattern {
  const [variant, setVariant] = useState<ComboboxVariantKey>('listAutocomplete')
  const [data, setData] = useState<PatternData>(buildComboboxData())
  return {
    key: 'combobox',
    label: 'Combobox',
    keyboardShortcuts: ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Escape'],
    sourceNames: ['Combobox.tsx', 'comboboxData.ts', 'combobox/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
    inspect: renderComboboxInspect(data, { autocomplete: comboboxVariants[variant].autocomplete }),
    variants: (
      <select
        className={selectClass}
        value={variant}
        onChange={(event) => {
          const next = event.currentTarget.value as ComboboxVariantKey
          setVariant(next)
          setData(buildComboboxData())
        }}
      >
        {(Object.keys(comboboxVariants) as ComboboxVariantKey[]).map((key) => (
          <option key={key} value={key}>{comboboxVariants[key].label}</option>
        ))}
      </select>
    ),
    preview: (
      <Combobox
        data={data}
        variant={variant}
        onEvent={(event) => {
          onEvent(event)
          setData((current) => reduceComboboxData(current, event))
        }}
        onVisibleKeysChange={(keys) => setData(() => {
          const next = buildComboboxData(keys)
          return { ...next, state: { ...next.state, expandedKeys: ['combobox'] } }
        })}
      />
    ),
    reset: () => setData(buildComboboxData()),
  }
}
