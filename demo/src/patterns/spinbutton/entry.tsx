import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { Spinbutton } from './Spinbutton'
import { reduceSpinbuttonData, spinbuttonVariants, type SpinbuttonVariantKey } from './spinbuttonData'
import { renderDataInspect } from '../../shared/inspect/genericInspect'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'
import type { PatternEvent } from '../../../../src'

export const spinbuttonVariantItems: readonly { key: SpinbuttonVariantKey; label: string }[] = [
  { key: 'numeric', label: 'Numeric' },
  { key: 'time', label: 'Time' },
]

const spinbuttonDemoDefinition = {
  key: 'spinbutton',
  label: 'Spinbutton',
  keyboardShortcuts: ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'],
  sources: {
    main: 'Spinbutton.tsx',
    entry: 'spinbutton/entry.tsx',
    hooks: ['spinbutton/useSpinbuttonPattern.ts'],
    data: ['spinbuttonData.ts'],
    definition: 'spinbutton/definition.ts',
    extra: ['spinbutton/keyboard.ts', 'spinbutton/parts.ts', 'spinbutton/spinbuttonProps.ts', 'spinbutton/spinbuttonRenderItem.ts'],
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'spinbutton variants',
    idPrefix: 'spinbutton-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'Spinbutton',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
      options: '$state.options',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineDemoPattern({
  definition: spinbuttonDemoDefinition,
  useRuntime: (onEvent) => {
    const host = useVariantPatternDataHost<SpinbuttonVariantKey>(
      'numeric',
      spinbuttonVariants.numeric.data,
      (variant) => spinbuttonVariants[variant].data,
      (variant, data, event) => reduceSpinbuttonData(data, event, spinbuttonVariants[variant].options),
    )
    return {
      inspect: renderDataInspect(host.data),
      context: {
        values: {
          state: { variant: host.variant, data: host.data, options: spinbuttonVariants[host.variant].options },
          model: { variantItems: spinbuttonVariantItems },
        },
        actions: {
          selectVariant: host.selectVariant,
          dispatchEvent: (event: PatternEvent) => {
            onEvent(event)
            host.dispatchEvent(event)
          },
        },
        components: { Spinbutton },
      },
    }
  },
})
