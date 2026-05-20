import { menubarDefinition, menuButtonDefinition, reducePatternData } from '../../../../src/react'
import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { renderDataInspect } from '../../shared/inspect/index'
import { Menu } from './Menu'
import { menuVariantItems, menuVariants, type MenuVariantKey } from './menuData'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'
import type { PatternEvent } from '../../../../src/react'

const menuDemoDefinition = {
  key: 'menuAndMenubar',
  label: 'Menu and Menubar',
  keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Space', 'Escape'],
  sources: {
    main: 'Menu.tsx',
    entry: 'menu/entry.tsx',
    hooks: ['menu/useMenuButtonPattern.ts', 'menu/useMenubarPattern.ts'],
    data: ['menuData.ts'],
    definition: 'menu/definition.ts',
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'menu and menubar variants',
    idPrefix: 'menu-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'MenuPreview',
    props: {
      variant: '$state.variant',
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineDemoPattern({
  definition: menuDemoDefinition,
  useRuntime: (onEvent) => {
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
      inspect: renderDataInspect(host.data),
      context: {
        values: {
          state: { variant: host.variant, data },
          model: { variantItems: menuVariantItems },
        },
        actions: {
          selectVariant: host.selectVariant,
          dispatchEvent: (event: PatternEvent) => {
            onEvent(event)
            host.dispatchEvent(event)
          },
        },
        components: { MenuPreview },
      },
    }
  },
})

function MenuPreview({ variant, data, onEvent }: { variant: MenuVariantKey; data: Parameters<typeof Menu>[0]['data']; onEvent: Parameters<typeof Menu>[0]['onEvent'] }) {
  return <Menu key={variant} data={data} onEvent={onEvent} />
}
