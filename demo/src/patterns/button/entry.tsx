import { Button } from './Button'
import { buttonVariantItems, buttonVariants, type ButtonVariantKey } from './buttonData'
import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/defineDemoPattern'
import { renderDataInspect } from '../../shared/inspect/genericInspect'
import type { PatternEvent } from '../../../../src'

const buttonDemoDefinition = {
  key: 'button',
  label: 'Button',
  keyboardShortcuts: ['Enter', 'Space'],
  sources: {
    main: 'Button.tsx',
    entry: 'button/entry.tsx',
    data: ['buttonData.ts'],
    hooks: ['button/useButtonPattern.ts'],
    definition: 'button/definition.ts',
  },
  view: {
    kind: 'stack',
    children: [
      {
        kind: 'listbox',
        orientation: 'horizontal',
        value: '$state.variant',
        items: '$model.variantItems',
        label: 'button variants',
        idPrefix: 'button-variant',
        onChange: '$actions.selectVariant',
      },
      {
        kind: 'component',
        component: 'Button',
        props: {
          data: '$state.data',
          onEvent: '$actions.dispatchEvent',
        },
      },
    ],
  },
} as const satisfies DemoPatternDefinition

export const entry = defineDemoPattern({
  definition: buttonDemoDefinition,
  useRuntime: (onEvent) => {
    const host = useVariantPatternDataHost<ButtonVariantKey>(
      'action',
      buttonVariants.action.data,
      (variant) => buttonVariants[variant].data,
      (variant, data, event) => buttonVariants[variant].reduce(data, event),
    )
    return {
      inspect: renderDataInspect(host.data),
      context: {
        values: {
          state: {
            variant: host.variant,
            data: host.data,
          },
          model: {
            variantItems: buttonVariantItems,
          },
        },
        actions: {
          selectVariant: host.selectVariant,
          dispatchEvent: (event: PatternEvent) => {
            onEvent(event)
            host.dispatchEvent(event)
          },
        },
        components: {
          Button,
        },
      },
    }
  },
})
