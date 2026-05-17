import { useState } from 'react'
import { menubarDefinition, menuButtonDefinition, reducePatternData, type PatternData } from '../../../src'
import { renderMenuInspect } from '../inspect'
import { Menu } from '../Menu'
import { menuVariantItems, menuVariants, type MenuVariantKey } from '../menuData'
import { VariantListbox } from '../VariantListbox'
import { type PatternEntry } from '../demoPatternTypes'

export const entry: PatternEntry = {
  key: 'menuAndMenubar',
  label: 'Menu and Menubar',
  order: 9,
  useDemoPattern: (onEvent) => {
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
  },
}
