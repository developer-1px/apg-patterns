import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { Meter } from './Meter'
import { meterVariantItems, meterVariants, type MeterVariantKey } from './meterData'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'
import { renderDataInspect } from '../../shared/inspect/genericInspect'

const meterDemoDefinition = {
  key: 'meter',
  label: 'Meter',
  keyboardShortcuts: [],
  sources: {
    main: 'Meter.tsx',
    entry: 'meter/entry.tsx',
    data: ['meterData.ts'],
    hooks: ['meter/useMeterPattern.ts'],
    definition: 'meter/definition.ts',
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'meter variants',
    idPrefix: 'meter-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'Meter',
    props: {
      data: '$state.data',
      onEvent: '$actions.emitEvent',
      options: '$state.options',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineDemoPattern({
  definition: meterDemoDefinition,
  useRuntime: (onEvent) => {
    const host = useVariantPatternDataHost<MeterVariantKey>(
      'disk',
      meterVariants.disk.data,
      (variant) => meterVariants[variant].data,
      (_variant, data) => data,
    )
    return {
      inspect: renderDataInspect(host.data),
      context: {
        values: {
          state: {
            variant: host.variant,
            data: host.data,
            options: meterVariants[host.variant].options,
          },
          model: {
            variantItems: meterVariantItems,
          },
        },
        actions: {
          selectVariant: host.selectVariant,
          emitEvent: onEvent,
        },
        components: {
          Meter,
        },
      },
    }
  },
})
