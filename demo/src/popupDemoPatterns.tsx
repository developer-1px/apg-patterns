import { useState } from 'react'
import { menubarDefinition, menuButtonDefinition, reducePatternData, type PatternData } from '../../src'
import { Combobox } from './Combobox'
import { buildComboboxData, comboboxVariants, reduceComboboxData, type ComboboxVariantKey } from './comboboxData'
import { renderComboboxInspect, renderMenuInspect } from './inspect'
import { Menu } from './Menu'
import { menuVariantItems, menuVariants, type MenuVariantKey } from './menuData'
import { type DemoPattern, type EmitPatternEvent } from './demoPatternTypes'
import { VariantListbox } from './VariantListbox'

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
    variants: <VariantListbox value={variant} items={menuVariantItems} label="menu and menubar variants" idPrefix="menu-variant" onChange={(next) => {
      setVariant(next)
      setData(menuVariants[next].data)
    }} />,
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
    variants: <VariantListbox value={variant} items={comboboxVariantItems} label="combobox variants" idPrefix="combobox-variant" onChange={(next) => {
      setVariant(next)
      setData(buildComboboxData())
    }} />,
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

const comboboxVariantItems = (Object.keys(comboboxVariants) as ComboboxVariantKey[]).map((key) => ({
  key,
  label: comboboxVariants[key].label,
}))
