import { menubarDefinition, menuButtonDefinition, reducePatternData } from '../../../../src'
import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { renderDataInspect } from '../../shared/inspect/index'
import { Menu } from './Menu'
import { menuVariantItems, menuVariants, type MenuVariantKey } from './menuData'
import { VariantListbox } from '../../shared/VariantListbox'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'

export const entry: PatternEntry = {
  key: 'menuAndMenubar',
  label: 'Menu and Menubar',
  order: 9,
  useDemoPattern: (onEvent) => {
    const host = useVariantPatternDataHost<MenuVariantKey>(
      'editorMenubar',
      menuVariants.editorMenubar.data,
      (variant) => menuVariants[variant].data,
      (variant, data, event) => reducePatternData(menuVariants[variant].apgPattern === 'menubar' ? menubarDefinition : menuButtonDefinition, data, event),
    )
    const apgPattern = menuVariants[host.variant].apgPattern
    const focusStrategy = menuVariants[host.variant].focusStrategy
    const data = { ...host.data, state: { ...host.data.state, apgPattern, focusStrategy } }
    return {
      key: 'menuAndMenubar',
      label: 'Menu and Menubar',
      keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Space', 'Escape'],
      sourceNames: ['Menu.tsx', 'menuData.ts', 'menu/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(host.data),
      variants: <VariantListbox value={host.variant} items={menuVariantItems} label="menu and menubar variants" idPrefix="menu-variant" onChange={host.selectVariant} />,
      preview: <Menu key={host.variant} data={data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
      reset: host.reset,
    }
  },
}
