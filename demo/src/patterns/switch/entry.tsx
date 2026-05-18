import { Switch } from './Switch'
import { initialSwitchData, reduceSwitchData, switchVariantItems, switchVariants, type SwitchVariantKey } from './switchData'
import { defineVariantDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const switchDemoDefinition = {
  key: 'switch',
  label: 'Switch',
  keyboardShortcuts: ['Space', 'Enter'],
  sources: {
    main: 'Switch.tsx',
    entry: 'switch/entry.tsx',
    data: ['switchData.ts'],
    hooks: ['switch/useSwitchPattern.ts'],
    definition: 'switch/definition.ts',
    extra: ['switch/keyboard.ts', 'switch/parts.ts', 'switch/switchRenderItem.ts'],
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'switch variants',
    idPrefix: 'switch-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'Switch',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineVariantDemoPattern<SwitchVariantKey>({
  definition: switchDemoDefinition,
  initialVariant: 'switch',
  initialData: initialSwitchData,
  dataByVariant: (variant) => switchVariants[variant].data,
  reduce: (_variant, data, event) => reduceSwitchData(data, event),
  variantItems: switchVariantItems,
  componentName: 'Switch',
  component: Switch,
})
