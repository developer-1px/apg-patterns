import { menubarDefinition, menuButtonDefinition, reducePatternData } from '../../../../src/react'
import { Menu } from './Menu'
import { menuVariantItems, menuVariants, type MenuVariantKey } from './menuData'
import { defineVariantDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const menuDemoDefinition = {
  key: 'menu',
  label: 'Menu and Menubar',
  keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Space', 'Escape'],
  sources: {
    main: 'Menu.tsx',
    entry: 'menu/entry.tsx',
    hooks: ['menu/useMenuButtonPattern.ts', 'menu/useMenubarPattern.ts', 'menu/useMenuPattern.ts'],
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

export const entry = defineVariantDemoPattern<MenuVariantKey>({
  definition: menuDemoDefinition,
  initialVariant: 'editorMenubar',
  initialData: menuVariants.editorMenubar.data,
  dataByVariant: (variant) => menuVariants[variant].data,
  reduce: (variant, data, event) => reducePatternData(menuVariants[variant].apgPattern === 'menubar' ? menubarDefinition : menuButtonDefinition, data, event),
  variantItems: menuVariantItems,
  componentName: 'MenuPreview',
  component: MenuPreview,
  getStateValues: (variant, data) => {
    const { apgPattern, focusStrategy } = menuVariants[variant]
    return { data: { ...data, state: { ...data.state, apgPattern, focusStrategy } } }
  },
})

function MenuPreview({ variant, data, onEvent }: { variant: MenuVariantKey; data: Parameters<typeof Menu>[0]['data']; onEvent: Parameters<typeof Menu>[0]['onEvent'] }) {
  return <Menu key={variant} data={data} onEvent={onEvent} />
}
