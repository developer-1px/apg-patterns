import { Button } from './Button'
import { buttonVariantItems, buttonVariants, type ButtonVariantKey } from './buttonData'
import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/genericInspect'
import { renderUiNode, type UiNode } from '../../shared/uiSchema'
import type { PatternEvent } from '../../../../src'

const buttonDemoView = {
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
} as const satisfies UiNode

export const entry: PatternEntry = {
  key: 'button',
  label: 'Button',
  useDemoPattern: (onEvent) => {
    const host = useVariantPatternDataHost<ButtonVariantKey>(
      'action',
      buttonVariants.action.data,
      (variant) => buttonVariants[variant].data,
      (variant, data, event) => buttonVariants[variant].reduce(data, event),
    )
    return {
      key: 'button',
      label: 'Button',
      keyboardShortcuts: ['Enter', 'Space'],
      sourceNames: ['Button.tsx', 'button/entry.tsx', 'buttonData.ts', 'button/useButtonPattern.ts', 'button/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(host.data),
      preview: renderUiNode(buttonDemoView, {
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
      }),
    }
  },
}
