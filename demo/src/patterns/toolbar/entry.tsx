import { Toolbar } from './Toolbar'
import { initialToolbarData, reduceToolbarData, toolbarVariantItems, toolbarVariants, type ToolbarVariantKey } from './toolbarData'
import { defineVariantDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const toolbarDemoDefinition = {
  key: 'toolbar',
  label: 'Toolbar',
  keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'Home', 'End', 'Enter', 'Space'],
  sources: {
    main: 'Toolbar.tsx',
    entry: 'toolbar/entry.tsx',
    data: ['toolbarData.ts'],
    hooks: ['toolbar/useToolbarPattern.ts'],
    definition: 'toolbar/definition.ts',
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'toolbar variants',
    idPrefix: 'toolbar-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'Toolbar',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineVariantDemoPattern<ToolbarVariantKey>({
  definition: toolbarDemoDefinition,
  initialVariant: 'toolbar',
  initialData: initialToolbarData,
  dataByVariant: (variant) => toolbarVariants[variant].data,
  reduce: (_variant, data, event) => reduceToolbarData(data, event),
  variantItems: toolbarVariantItems,
  componentName: 'Toolbar',
  component: Toolbar,
})
